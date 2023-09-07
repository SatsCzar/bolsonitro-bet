const { usecase, step, Ok, checker } = require("@herbsjs/herbs")
const { herbarium } = require("@herbsjs/herbarium")
const LightningClient = require("../../infra/clients/LightningClient")
const DepositIntentionsRepository = require("../../infra/database/repositories/DepositIntentionsRepository")
const TransactionRepository = require("../../infra/database/repositories/TransactionRepository")
const depositStatusEnum = require("../enums/depositStatusEnum")
const Transaction = require("../entities/transaction")
const transactionTypesEnum = require("../enums/transactionTypesEnum")

const dependency = {
  LightningClient,
  DepositIntentionsRepository,
  TransactionRepository,
}

const checkDepositIntentions = (injection) =>
  usecase("Check deposit intentions", {
    request: {},

    response: {},

    authorize: () => Ok(),

    setup: (ctx) => {
      ctx.di = Object.assign({}, dependency, injection)
      ctx.di.depositIntentionsInstance = new ctx.di.DepositIntentionsRepository()
      ctx.di.transactionRepositoryInstance = new ctx.di.TransactionRepository()
      ctx.di.lightningClient = new ctx.di.LightningClient()
      ctx.data = {
        currentDate: ctx.di.currentDate || new Date(),
      }
    },

    "Find all pending deposit intentions": step(async (ctx) => {
      const { depositIntentionsInstance } = ctx.di

      const depositIntentionsPending = await depositIntentionsInstance.findAllPending()

      if (checker.isEmpty(depositIntentionsPending)) return Ok(ctx.stop())

      ctx.data.intentionsPending = depositIntentionsPending

      return Ok()
    }),

    "Check intentions in Lightning Network": step(async (ctx) => {
      const { lightningClient } = ctx.di
      const { intentionsPending } = ctx.data

      const invoices = []

      for (const intention of intentionsPending) {
        const result = await lightningClient.checkInvoice(intention.invoiceId)

        if (result.isErr) continue

        invoices.push(result.ok)
      }

      ctx.data.invoices = invoices

      return Ok()
    }),

    "Check intentions paid and credit the amount in user account": step({
      "Check the intentions that were paid": step((ctx) => {
        const { invoices, intentionsPending } = ctx.data

        const intentionsPaid = invoices
          .map((invoice) => {
            const werePaid = invoice.is_confirmed

            if (werePaid) return intentionsPending.find((intention) => intention.invoiceId === invoice.id)
          })
          .filter(Boolean)

        ctx.data.intentionsPaid = intentionsPaid

        return Ok()
      }),

      "Changes the status of intents that have been paid": step(async (ctx) => {
        const { intentionsPaid } = ctx.data
        const { depositIntentionsInstance } = ctx.di

        const intentionsCredited = []

        for (const intention of intentionsPaid) {
          try {
            intention.status = depositStatusEnum.credited

            const updated = await depositIntentionsInstance.update(intention)

            intentionsCredited.push(updated)
          } catch (error) {
            console.log(error)
          }
        }

        ctx.data.intentionsCredited = intentionsCredited

        return Ok()
      }),

      "Credit amount in user account": step(async (ctx) => {
        const { transactionRepositoryInstance } = ctx.di
        const { intentionsCredited, currentDate } = ctx.data

        for (const intention of intentionsCredited) {
          try {
            const transaction = Transaction.fromJSON({
              amount: intention.amount,
              chatId: intention.chatId,
              date: currentDate,
              type: transactionTypesEnum.incoming,
              intentionId: intention.id,
            })

            await transactionRepositoryInstance.insert(transaction)
          } catch (error) {
            console.log(error)
          }
        }
        return Ok()
      }),

      "Notifies users that the deposit has been credited": step(async (ctx) => {
        const { bot } = ctx.di
        const { intentionsCredited } = ctx.data

        for (const intention of intentionsCredited) {
          try {
            const message = `Your deposit of ${intention.amount} has been credited`

            await bot.telegram.sendMessage(intention.chatId, message)
          } catch (error) {
            console.log(`Error while try to send message to user ${intention.chatId}: ${error.message}`)
          }
        }
        return Ok()
      }),
    }),

    "Check the intentions that were expired": step((ctx) => {
      const { invoices, intentionsPending, currentDate } = ctx.data

      const intentionsExpired = invoices
        .map((invoice) => {
          const wereExpired = invoice.expires_at > currentDate

          if (wereExpired) return intentionsPending.find((intention) => intention.invoiceId === invoice.id)
        })
        .filter(Boolean)

      ctx.data.intentionsExpired = intentionsExpired

      return Ok()
    }),

    "Changes the status of intents that have been expired": step(async (ctx) => {
      const { intentionsExpired } = ctx.data
      const { depositIntentionsInstance } = ctx.di

      for (const intention of intentionsExpired) {
        try {
          intention.status = depositStatusEnum.expired

          await depositIntentionsInstance.update(intention)
        } catch (error) {
          console.log(error)
        }
      }

      return Ok()
    }),
  })

module.exports = herbarium.usecases
  .add(checkDepositIntentions, "checkDepositIntentions")
  .metadata({ group: "Deposit" }).usecase

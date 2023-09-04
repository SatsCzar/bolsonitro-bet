const { usecase, step, Ok } = require("@herbsjs/herbs")
const { herbarium } = require("@herbsjs/herbarium")
const LightningClient = require("../../infra/clients/LightningClient")
const DepositIntentionsRepository = require("../../infra/database/repositories/DepositIntentionsRepository")
const depositStatusEnum = require("../enums/depositStatusEnum")

const dependency = {
  LightningClient,
  DepositIntentionsRepository,
}

const checkDepositIntentions = (injection) =>
  usecase("Check deposit intentions", {
    request: {},

    response: {},

    authorize: () => Ok(),

    setup: (ctx) => {
      ctx.di = Object.assign({}, dependency, injection)
      ctx.di.depositIntentionsDatabase = new ctx.di.DepositIntentionsRepository()
      ctx.di.lightningClient = new ctx.di.LightningClient()
      ctx.data = {}
    },

    "Find all pending deposit intentions": step(async (ctx) => {
      const { depositIntentionsDatabase } = ctx.di

      const depositIntentionsPending = await depositIntentionsDatabase.findAllPending()

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
      const { depositIntentionsDatabase } = ctx.di

      const intentionsUpdated = []

      for (const intention of intentionsPaid) {
        try {
          intention.status = depositStatusEnum.credited

          const updated = await depositIntentionsDatabase.update(intention)

          intentionsUpdated.push(updated)
        } catch (error) {
          console.log(error)
        }
      }

      ctx.data.intentionsUpdated = intentionsUpdated

      return Ok()
    }),

    "Notifies users that the deposit has been credited": step(async (ctx) => {
      const { bot } = ctx.di
      const { intentionsUpdated } = ctx.data

      for (const intention of intentionsUpdated) {
        try {
          const message = `Your deposit of ${intention.amount} has been credited`

          await bot.telegram.sendMessage(intention.chatId, message)
        } catch (error) {
          console.log(`Error while try to send message to user ${intention.chatId}: ${error.message}`)
        }
      }
      return Ok()
    }),
  })

module.exports = herbarium.usecases
  .add(checkDepositIntentions, "checkDepositIntentions")
  .metadata({ group: "Deposit" }).usecase

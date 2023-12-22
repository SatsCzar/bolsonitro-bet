const { usecase, step, Ok, Err, checker, ifElse } = require("@herbsjs/herbs")
const { herbarium } = require("@herbsjs/herbarium")
const checkBalance = require("./checkBalance")
const LightningClient = require("../../infra/clients/LightningClient")
const Transaction = require("../entities/Transaction")
const TransactionRepository = require("../../infra/database/repositories/TransactionRepository")
const lightningPayReq = require("bolt11")
const transactionTypesEnum = require("../enums/transactionTypesEnum")

const dependency = {
  checkBalance,
  LightningClient,
  TransactionRepository,
}

const MakeWithdraw = (injection) =>
  usecase("Make a withdraw", {
    request: { chatId: Number, bolt11: String },

    authorize: () => Ok(),

    setup: (ctx) => {
      ctx.di = Object.assign({}, dependency, injection)
      ctx.di.checkBalanceInstance = checkBalance(ctx.di)
      ctx.data = {}
    },

    "Verify request": step((ctx) => {
      const { chatId, bolt11 } = ctx.req

      if (checker.isEmpty(chatId))
        return Err.invalidArguments({
          message: "ChatId is required",
          payload: { chatId },
        })

      if (checker.isEmpty(bolt11))
        return Err.invalidArguments({
          message: "Invoice is required",
          payload: { bolt11 },
        })

      return Ok()
    }),

    "Check balance of user": step(async (ctx) => {
      const { checkBalanceInstance } = ctx.di
      const { chatId } = ctx.req

      await checkBalanceInstance.authorize()

      const ucResult = await checkBalanceInstance.run({ chatId })

      if (ucResult.isErr)
        return Err.unknown({
          message: "An error occurred when checking the balance.",
          cause: ucResult.err.message || ucResult.err,
        })

      ctx.data.balance = ucResult.ok.balance
    }),

    "Check the invoice and check the amount": step({
      "Decode the bolt11": step((ctx) => {
        const { bolt11 } = ctx.req

        try {
          const decodedBolt11 = lightningPayReq.decode(bolt11)

          ctx.data.decodedBolt11 = decodedBolt11
        } catch (error) {
          return Err.unknown({
            message: "Error decoding the invoice",
            cause: error.message,
          })
        }
      }),

      "Checks that the invoice does not exceed the user's balance": ifElse({
        "Invoice amount exceeds balance?": step((ctx) => {
          const { decodedBolt11, balance } = ctx.data

          return Ok(decodedBolt11.satoshis > balance)
        }),

        "Then: Returns error": step((ctx) => {
          const { decodedBolt11, balance } = ctx.data

          return Err.invalidArguments({
            message: `Fraud attempt, invoice value: ${decodedBolt11.satoshis} exceeds balance: ${balance}`,
          })
        }),

        "Else: Pay the invoice and register the withdrawal transaction": step({
          "Saves the withdrawal transaction": step(async (ctx) => {
            const { decodedBolt11 } = ctx.data
            const { chatId } = ctx.req
            const transactionRepositoryInstance = new ctx.di.TransactionRepository()

            const transaction = Transaction.fromJSON({
              amount: decodedBolt11.satoshis * -1,
              chatId: chatId,
              date: new Date(),
              type: transactionTypesEnum.outcoming,
            })

            try {
              await transactionRepositoryInstance.insert(transaction)

              return Ok()
            } catch (error) {
              return Err.unknown({
                message: "Error while try to save transaction in database",
                cause: error.message,
              })
            }
          }),

          "Pay the invoice": step(async (ctx) => {
            const { bolt11 } = ctx.req
            const lightningClient = new ctx.di.LightningClient()

            const result = await lightningClient.payInvoice(bolt11)

            if (result.isErr)
              return Err.unknown({
                message: "Error when trying to pay the invoice",
                cause: result.err,
              })

            return Ok()
          }),
        }),
      }),
    }),
  })

module.exports = herbarium.usecases
  .add(MakeWithdraw, "MakeWithdraw")
  .metadata({ group: "Balance", entity: Transaction }).usecase

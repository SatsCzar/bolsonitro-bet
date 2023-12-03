const { usecase, step, Ok, Err, checker } = require("@herbsjs/herbs")
const { herbarium } = require("@herbsjs/herbarium")
const DepositIntent = require("../entities/DepositIntent")
const LightningClient = require("../../infra/clients/LightningClient")
const DepositIntentionsRepository = require("../../infra/database/repositories/DepositIntentionsRepository")
const depositStatusEnum = require("../enums/depositStatusEnum")

const dependency = {
  LightningClient,
  DepositIntentionsRepository,
}

const createDepositIntent = (injection) =>
  usecase("Create deposit intent", {
    request: { amount: String, chatId: Number },

    response: { invoice: String },

    authorize: () => Ok(),

    setup: (ctx) => {
      ctx.di = Object.assign({}, dependency, injection)
      ctx.di.depositIntentionsDatabase = new ctx.di.DepositIntentionsRepository()
      ctx.data = {}
    },

    "Verify request": step((ctx) => {
      const { amount, chatId } = ctx.req

      if (checker.isEmpty(amount) || checker.isEmpty(chatId))
        return Err.invalidArguments({
          message: "Amount and ChatId is required",
          payload: { amount, chatId },
        })

      return Ok()
    }),

    "Generate invoice": step(async (ctx) => {
      const { amount } = ctx.req
      const lightningClient = new ctx.di.LightningClient()

      const response = await lightningClient.generateInvoice(amount)

      if (response.isErr)
        return Err.unknown({
          message: "Error while try to generate invoice",
        })

      ctx.ret = {
        invoice: response.ok.invoice,
      }

      ctx.data.invoiceId = response.ok.id

      return Ok()
    }),

    "Create deposit intent in database": step(async (ctx) => {
      const { depositIntentionsDatabase } = ctx.di
      const { invoiceId } = ctx.data
      const { invoice } = ctx.ret
      const { amount, chatId } = ctx.req

      const intent = DepositIntent.fromJSON({
        amount,
        chatId,
        invoiceId,
        bolt11: invoice,
        status: depositStatusEnum.pending,
      })

      await depositIntentionsDatabase.insert(intent)

      return Ok()
    }),
  })

module.exports = herbarium.usecases
  .add(createDepositIntent, "CreateDepositIntent")
  .metadata({ group: "Balance" }).usecase

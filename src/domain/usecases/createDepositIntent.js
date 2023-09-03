const { usecase, step, Ok, Err, checker } = require("@herbsjs/herbs")
const { herbarium } = require("@herbsjs/herbarium")
const LightningClient = require("../../infra/clients/LightningClient")

const dependency = {
  LightningClient,
}

const createDepositIntent = (injection) =>
  usecase("Create deposit intent", {
    request: { amount: String },

    response: { invoice: String },

    authorize: () => Ok(),

    setup: (ctx) => (ctx.di = Object.assign({}, dependency, injection)),

    "Verify request": step((ctx) => {
      const { amount } = ctx.req

      if (checker.isEmpty(amount))
        return Err.invalidArguments({
          message: "Amount is required",
          payload: { amount },
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
        invoice: response.ok,
      }

      return Ok()
    }),
  })

module.exports = herbarium.usecases
  .add(createDepositIntent, "CreateDepositIntent")
  .metadata({ group: "Deposit" }).usecase

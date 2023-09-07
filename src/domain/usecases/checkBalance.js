const { usecase, step, Ok, Err, checker } = require("@herbsjs/herbs")
const { herbarium } = require("@herbsjs/herbarium")
const TransactionRepository = require("../../infra/database/repositories/TransactionRepository")
const Transaction = require("../entities/transaction")

const dependency = {
  TransactionRepository,
}

const CheckBalance = (injection) =>
  usecase("Check balance by ChatId", {
    request: { chatId: Number },

    response: { balance: Number },

    authorize: () => Ok(),

    setup: (ctx) => {
      ctx.di = Object.assign({}, dependency, injection)
      ctx.di.transactionRepositoryInstance = new ctx.di.TransactionRepository()
      ctx.data = {}
    },

    "Verify request": step((ctx) => {
      const { chatId } = ctx.req

      if (checker.isEmpty(chatId))
        return Err.invalidArguments({
          message: "ChatId is required",
          payload: { chatId },
        })

      return Ok()
    }),

    "Find all user transactions": step(async (ctx) => {
      const { transactionRepositoryInstance } = ctx.di
      const { chatId } = ctx.req

      const transactions = await transactionRepositoryInstance.findAllByChatId(chatId)

      if (checker.isEmpty(transactions)) {
        ctx.ret = { balance: 0 }
        return Ok(ctx.stop())
      }

      ctx.data.transactions = transactions

      return Ok()
    }),

    "Calculates user balance": step((ctx) => {
      const { transactions } = ctx.data

      const balance = transactions.reduce((acc, current) => (acc += current.amount), 0)

      ctx.ret = { balance }
      return Ok()
    }),
  })

module.exports = herbarium.usecases
  .add(CheckBalance, "CheckBalance")
  .metadata({ group: "Deposit", entity: Transaction }).usecase

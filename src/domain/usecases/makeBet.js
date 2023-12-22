const { usecase, step, Ok, Err, checker, ifElse } = require("@herbsjs/herbs")
const { herbarium } = require("@herbsjs/herbarium")
const TransactionRepository = require("../../infra/database/repositories/TransactionRepository")
const BetRepository = require("../../infra/database/repositories/BetRepository")
const Transaction = require("../entities/Transaction")
const checkBalance = require("./checkBalance")
const Bet = require("../entities/Bet")
const transactionTypesEnum = require("../enums/transactionTypesEnum")
const betResultEnum = require("../enums/betResultEnum")

const dependency = {
  TransactionRepository,
  BetRepository,
  checkBalance,
}

const makeBet = (injection) =>
  usecase("Make Bet", {
    request: { chatId: Number, amount: Number },

    response: { win: Boolean, prize: Number },

    authorize: () => Ok(),

    setup: (ctx) => {
      ctx.di = Object.assign({}, dependency, injection)
      ctx.di.transactionRepositoryInstance = new ctx.di.TransactionRepository()
      ctx.di.betRepositoryInstance = new ctx.di.BetRepository()
      ctx.di.checkBalanceInstance = checkBalance(ctx.di)
      ctx.data = {}
    },

    "Verify request": step((ctx) => {
      const { chatId, amount } = ctx.req

      if (checker.isEmpty(chatId))
        return Err.invalidArguments({
          message: "ChatId is required",
          payload: { chatId },
        })

      if (checker.isEmpty(amount))
        return Err.invalidArguments({
          message: "Amount is required",
          payload: { amount },
        })

      return Ok()
    }),

    "Checks if the user has available balance": step(async (ctx) => {
      const { amount, chatId } = ctx.req
      const { checkBalanceInstance } = ctx.di

      await checkBalanceInstance.authorize()

      const ucResult = await checkBalanceInstance.run({ chatId })

      if (ucResult.isErr) return ucResult.Err

      const { balance } = ucResult.ok

      if (amount > balance) return Err("You don't have enough balance")

      return Ok()
    }),

    "Creates the bet entity, make the drawn and save in database": step({
      "Creates the bet entity": step((ctx) => {
        const { amount } = ctx.req

        const bet = Bet.fromJSON({
          amountBet: amount,
        })

        ctx.data.bet = bet
        return Ok()
      }),

      "Performs the draw": step((ctx) => {
        const { bet } = ctx.data

        bet.makeDraw()

        return Ok()
      }),

      "Store in the database and keep the id": step(async (ctx) => {
        const { betRepositoryInstance } = ctx.di
        const { bet } = ctx.data

        try {
          const betFromDB = await betRepositoryInstance.insert(bet)

          ctx.data.bet.id = betFromDB.id

          return Ok()
        } catch (error) {
          return Err.unknown({
            message: "Error while try to save bet in database",
            cause: error.message,
          })
        }
      }),
    }),

    "Debits the bet amount from the user's account": step({
      "Create debit transaction entity": step((ctx) => {
        const { chatId, amount } = ctx.req
        const { bet } = ctx.data

        const transaction = Transaction.fromJSON({
          amount: amount * -1,
          chatId: chatId,
          date: new Date(),
          type: transactionTypesEnum.outcoming,
          betId: bet.id,
        })

        ctx.data.transaction = transaction

        return Ok()
      }),

      "Save in database": step(async (ctx) => {
        const { transactionRepositoryInstance } = ctx.di
        const { transaction } = ctx.data
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
    }),

    "Check the result of the draw and proceed": ifElse({
      "Result was GAIN?": step((ctx) => {
        const { bet } = ctx.data
        return Ok(bet.result === betResultEnum.gain)
      }),

      "Then: Credit the prize and set up the return": step({
        "Create credit transaction entity": step(async (ctx) => {
          const { transactionRepositoryInstance } = ctx.di
          const { chatId } = ctx.req
          const { bet } = ctx.data

          const transaction = Transaction.fromJSON({
            amount: bet.prize,
            chatId: chatId,
            date: new Date(),
            type: transactionTypesEnum.incoming,
            betId: bet.id,
          })

          try {
            await transactionRepositoryInstance.insert(transaction)

            return Ok()
          } catch (error) {
            return Err.unknown({
              message: "Error while try to save bet in database",
              cause: error.message,
            })
          }
        }),

        "Set the return message": step((ctx) => {
          const { amount } = ctx.req
          const { bet } = ctx.data
          ctx.ret = {
            win: true,
            prize: bet.prize - amount,
          }

          return Ok()
        }),
      }),

      "Else: Set the return message": step(async (ctx) => {
        ctx.ret = {
          win: false,
        }

        return Ok()
      }),
    }),
  })

module.exports = herbarium.usecases.add(makeBet, "MakeBet").metadata({ group: "Bet", entity: Bet }).usecase

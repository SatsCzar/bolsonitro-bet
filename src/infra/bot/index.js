const { Telegraf } = require("telegraf")
const commandParts = require("@satsczar/telegraf-command-parts")
const config = require("../config")
const createDepositIntent = require("../../domain/usecases/createDepositIntent")
const checkBalance = require("../../domain/usecases/checkBalance")
const { checker } = require("@herbsjs/herbs")
const makeBet = require("../../domain/usecases/makeBet")
const isBolt11 = require("../../domain/helpers/bolt11")
const makeWithdraw = require("../../domain/usecases/makeWithdraw")

const runBot = () => {
  const bot = new Telegraf(config.token)

  bot.use(commandParts())

  bot.command("start", async (ctx) => {
    try {
      await ctx.reply("Hello, I'm a Robot")
    } catch (error) {
      console.log(error)
    }
  })

  bot.command("deposit", async (ctx) => {
    try {
      const amount = ctx.state.command.splitArgs[0]
      const chatId = ctx.message.chat.id

      if (checker.isEmpty(amount)) {
        await ctx.reply("Please enter the number of satoshis\nExample: /deposit 5000", {
          parse_mode: "Markdown",
        })
        return
      }

      const usecase = createDepositIntent()

      await usecase.authorize()

      const response = await usecase.run({ amount, chatId })

      if (response.isErr) {
        await ctx.reply(response.err.message || response.err)
        return
      }

      const { invoice } = response.ok

      await ctx.reply(invoice)
    } catch (error) {
      console.log(error)
    }
  })

  bot.command("balance", async (ctx) => {
    try {
      const chatId = ctx.message.chat.id

      const usecase = checkBalance()

      await usecase.authorize()

      const response = await usecase.run({ chatId })

      if (response.isErr) {
        await ctx.reply(response.err.message || response.err)
        return
      }

      const { balance } = response.ok

      await ctx.reply(`Your balance is ${balance} sats`)
    } catch (error) {
      console.log(error)
    }
  })

  bot.command("bet", async (ctx) => {
    try {
      const amount = ctx.state.command.splitArgs[0]
      const chatId = ctx.message.chat.id

      if (checker.isEmpty(amount)) {
        await ctx.reply("Please enter the number of satoshis\nExample: /bet 5000", {
          parse_mode: "Markdown",
        })
        return
      }

      const usecase = makeBet()

      await usecase.authorize()

      const response = await usecase.run({ amount: Number(amount), chatId })

      if (response.isErr) {
        await ctx.reply(response.err.message || response.err)
        return
      }

      const { win, prize } = response.ok

      if (!win) {
        await ctx.reply("Unfortunately, it wasn't this time.")
        return
      }

      await ctx.reply(`Congratulation, you won: ${prize}`)
    } catch (error) {
      console.log(error)
    }
  })

  bot.command("withdraw", async (ctx) => {
    try {
      const chatId = ctx.message.chat.id

      const usecase = checkBalance()

      await usecase.authorize()

      const response = await usecase.run({ chatId })

      if (response.isErr) {
        await ctx.reply(response.err.message || response.err)
        return
      }

      const { balance } = response.ok

      await ctx.reply(`Reply to this message with an invoice with an amount of: ${balance}`, {
        reply_markup: { force_reply: true },
      })
    } catch (error) {
      console.log(error)
    }
  })

  bot.on("message", async (ctx) => {
    if (isBolt11(ctx.message.text)) {
      try {
        const chatId = ctx.message.chat.id
        const bolt11 = ctx.message.text

        const usecase = makeWithdraw()

        await usecase.authorize()

        const response = await usecase.run({ chatId, bolt11 })

        if (response.isErr) {
          await ctx.reply(response.err.message || response.err)
          return
        }

        await ctx.reply("Withdrawal successful!")
      } catch (error) {
        console.log(error)
      }
    }
  })

  bot.launch()
  console.log("🤖 Bot Working \n")

  return bot
}

module.exports = runBot

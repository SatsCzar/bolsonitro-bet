const { Telegraf } = require("telegraf")
const commandParts = require("@satsczar/telegraf-command-parts")
const config = require("../config")
const createDepositIntent = require("../../domain/usecases/createDepositIntent")

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

      const usecase = createDepositIntent()

      await usecase.authorize()

      const response = await usecase.run({ amount })

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

  bot.launch()
  console.log("🤖 Bot Working \n")

  return bot
}

module.exports = runBot

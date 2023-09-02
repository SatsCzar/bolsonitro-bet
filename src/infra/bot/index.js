const { Telegraf } = require("telegraf")
const config = require("../config")

const runBot = () => {
  const bot = new Telegraf(config.token)

  bot.command("start", async (ctx) => {
    try {
      await ctx.reply("Eu sou um robô")
    } catch (error) {
      console.log(error)
    }
  })

  bot.command("bitcoin", async (ctx) => {
    try {
      const precoBitcoin = 125000

      await ctx.reply(`O preço do Bitcoin é: ${precoBitcoin}`)
    } catch (error) {
      console.log(error)
    }
  })

  bot.launch()
  console.log("🤖 Bot funcionando \n")

  return bot
}

module.exports = runBot

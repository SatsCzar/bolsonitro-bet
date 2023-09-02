// eslint-disable-next-line no-unused-vars
const { Telegraf } = require("telegraf")
const cronValidator = require("cron-validator")
const cronsTrue = require("cronstrue/i18n")
const { CronJob } = require("cron")
const config = require("../config")

const cronSchedule = config.cron.cronSchedule

/**
 * @param {Telegraf<Context<Update>>} bot - Instância do bot
 * @throws {Error}
 * */
const cronJobs = (bot) => {
  if (!bot) throw new Error()

  const isCronScheduleValid = cronValidator.isValidCron(cronSchedule)

  if (!isCronScheduleValid) throw new Error(`Expressão ${cronSchedule} inválida`)

  new CronJob(
    cronSchedule,
    async () => {
      await bot.telegram.sendMessage(config.ownerChatId, "RODOU !!!")
    },
    null,
    null,
    "America/Sao_Paulo",
  )

  const cronPortuguese = cronsTrue.toString(cronSchedule, { locale: "pt_BR" })

  console.log(`⌚ CronJob rodando ${cronPortuguese}`)
}

module.exports = cronJobs

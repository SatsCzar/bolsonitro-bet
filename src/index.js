const runBot = require("./infra/bot")
const cronJobs = require("./infra/cron")
const checkDepositIntentionsTask = require("./infra/scheduledTasks/checkDepositIntentionsTask")
const { startApi } = require("./infra/api/server")
const config = require("./infra/config")

const botInstance = runBot()
cronJobs(botInstance)
setInterval(() => checkDepositIntentionsTask(botInstance), 10000)

if (config.shelfEnabled) startApi()

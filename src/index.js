const runBot = require("./infra/bot")
const cronJobs = require("./infra/cron")
const checkDepositIntentionsTask = require("./infra/scheduledTasks/checkDepositIntentionsTask")

const botInstance = runBot()
cronJobs(botInstance)
setInterval(() => checkDepositIntentionsTask(botInstance), 10000)

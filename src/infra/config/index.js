require("dotenv").config()

module.exports = {
  token: process.env.TOKEN,
  ownerChatId: process.env.OWNER_CHAT_ID,
  cron: require("./cron"),
}

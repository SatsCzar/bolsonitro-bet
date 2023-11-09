require("dotenv").config()

module.exports = {
  token: process.env.TOKEN,
  ownerChatId: process.env.OWNER_CHAT_ID,
  shelfEnabled: process.env.SHELF_ENABLED == "true" ? true : false,
  cron: require("./cron"),
  lightning: require("./lightning"),
  database: require("./database"),
}

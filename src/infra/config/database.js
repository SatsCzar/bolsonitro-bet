require("dotenv").config()

module.exports = {
  herbsCLI: "sqlite",
  client: "sqlite3",
  useNullAsDefault: true,
  connection: {
    filename: "database.sqlite",
  },
}

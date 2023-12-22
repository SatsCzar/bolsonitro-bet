const { Repository } = require("@herbsjs/herbs2knex")
const { herbarium } = require("@herbsjs/herbarium")
const connection = require("../connection")
const Transaction = require("../../../domain/entities/Transaction")

class TransactionRepository extends Repository {
  constructor() {
    super({
      entity: Transaction,
      table: "transactions",
      knex: connection,
    })
  }

  findAllByChatId(chatId) {
    return this.find({
      where: {
        chat_id: chatId,
      },
    })
  }

  async getBalanceByChatId(chatId) {
    const result = await this.knex.raw("SELECT SUM(amount) as balance FROM transactions where chat_id = ?", [chatId])

    return result[0].balance
  }
}

module.exports = herbarium.repositories
  .add(TransactionRepository, "TransactionRepository")
  .metadata({ entity: Transaction }).repository

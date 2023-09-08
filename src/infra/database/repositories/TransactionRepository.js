const { Repository } = require("@herbsjs/herbs2knex")
const { herbarium } = require("@herbsjs/herbarium")
const connection = require("../connection")
const Transaction = require("../../../domain/entities/transaction")

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
}

module.exports = herbarium.repositories
  .add(TransactionRepository, "TransactionRepository")
  .metadata({ entity: Transaction }).repository

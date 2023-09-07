const { Repository } = require("@herbsjs/herbs2knex")
const { herbarium } = require("@herbsjs/herbarium")
const DepositIntent = require("../../../domain/entities/DepositIntent")
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
}

module.exports = herbarium.repositories
  .add(TransactionRepository, "TransactionRepository")
  .metadata({ entity: DepositIntent }).repository
const { Repository } = require("@herbsjs/herbs2knex")
const { herbarium } = require("@herbsjs/herbarium")
const DepositIntent = require("../../../domain/entities/DepositIntent")
const connection = require("../connection")

class DepositIntentRepository extends Repository {
  constructor() {
    super({
      entity: DepositIntent,
      table: "depositIntents",
      knex: connection,
    })
  }
}

module.exports = herbarium.repositories
  .add(DepositIntentRepository, "DepositIntentRepository")
  .metadata({ entity: DepositIntent }).repository

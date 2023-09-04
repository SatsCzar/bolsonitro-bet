const { Repository } = require("@herbsjs/herbs2knex")
const { herbarium } = require("@herbsjs/herbarium")
const DepositIntent = require("../../../domain/entities/DepositIntent")
const connection = require("../connection")

class DepositIntentionsRepository extends Repository {
  constructor() {
    super({
      entity: DepositIntent,
      table: "depositIntentions",
      knex: connection,
    })
  }
}

module.exports = herbarium.repositories
  .add(DepositIntentionsRepository, "DepositIntentionsRepository")
  .metadata({ entity: DepositIntent }).repository

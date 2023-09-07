const { Repository } = require("@herbsjs/herbs2knex")
const { herbarium } = require("@herbsjs/herbarium")
const DepositIntent = require("../../../domain/entities/DepositIntent")
const connection = require("../connection")
const depositStatusEnum = require("../../../domain/enums/depositStatusEnum")

class DepositIntentionsRepository extends Repository {
  constructor() {
    super({
      entity: DepositIntent,
      table: "deposit_intentions",
      knex: connection,
    })
  }

  findAllPending() {
    return this.find({
      where: {
        status: depositStatusEnum.pending,
      },
    })
  }
}

module.exports = herbarium.repositories
  .add(DepositIntentionsRepository, "DepositIntentionsRepository")
  .metadata({ entity: DepositIntent }).repository

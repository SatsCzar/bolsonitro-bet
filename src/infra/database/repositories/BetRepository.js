const { Repository } = require("@herbsjs/herbs2knex")
const { herbarium } = require("@herbsjs/herbarium")
const connection = require("../connection")
const Bet = require("../../../domain/entities/Bet")

class BetRepository extends Repository {
  constructor() {
    super({
      entity: Bet,
      table: "bets",
      knex: connection,
    })
  }
}

module.exports = herbarium.repositories.add(BetRepository, "BetRepository").metadata({ entity: Bet }).repository

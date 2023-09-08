const betResultEnum = require("../../../domain/enums/betResultEnum")

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  return knex.schema.hasTable("bets").then(async (exists) => {
    if (exists) return
    await knex.schema.createTable("bets", (table) => {
      table.increments("id").primary().unique()
      table.integer("amount_bet").notNullable()
      table.float("random_number")
      table.enum("result", Object.values(betResultEnum))
      table.integer("prize")
    })
    await knex.schema.table("transactions", (table) => {
      table.integer("bet_id").references("id").inTable("bets")
    })
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("bets")
  await knex.schema.table("transactions", (table) => {
    table.dropColumn("bet_id")
  })
}

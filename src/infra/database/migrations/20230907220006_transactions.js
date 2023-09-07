const transactionTypesEnum = require("../../../domain/enums/transactionTypesEnum")

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  return knex.schema.hasTable("transactions").then((exists) => {
    if (exists) return
    return knex.schema.createTable("transactions", (table) => {
      table.increments("id").primary()
      table.integer("amount").notNullable()
      table.integer("chat_id").notNullable()
      table.date("date").notNullable()
      table.enum("type", Object.values(transactionTypesEnum)).notNullable()
      table.integer("intention_id").references("id").inTable("transactions").notNullable().unique()
    })
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("transactions")
}

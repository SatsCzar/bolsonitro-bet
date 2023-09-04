const depositStatusEnum = require("../../../domain/enums/depositStatusEnum")

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  return knex.schema.hasTable("depositIntentions").then((exists) => {
    if (exists) return
    return knex.schema.createTable("depositIntentions", (table) => {
      table.increments("id").primary()
      table.integer("amount").notNullable()
      table.integer("chat_id").notNullable()
      table.enum("status", Object.values(depositStatusEnum)).notNullable()
      table.string("invoice_id").notNullable()
      table.string("invoice").notNullable()
    })
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("depositIntentions")
}

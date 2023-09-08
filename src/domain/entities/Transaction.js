const { entity, field, id } = require("@herbsjs/herbs")
const { herbarium } = require("@herbsjs/herbarium")
const transactionTypesEnum = require("../enums/transactionTypesEnum")

const Transaction = entity("Transaction", {
  id: id(Number),
  amount: field(Number),
  chatId: field(Number),
  date: field(Date),
  type: field(String, { validation: { contains: { allowed: Object.values(transactionTypesEnum) } } }),
  intentionId: field(Number),
  betId: field(Number),
})

module.exports = herbarium.entities.add(Transaction, "Transaction").entity

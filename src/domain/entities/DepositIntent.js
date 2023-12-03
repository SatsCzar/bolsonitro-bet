const { entity, field, id } = require("@herbsjs/herbs")
const { herbarium } = require("@herbsjs/herbarium")
const depositStatusEnum = require("../enums/depositStatusEnum")

const DepositIntent = entity("Deposit Intent", {
  id: id(Number),
  amount: field(Number),
  chatId: field(Number),
  status: field(String, { validation: { contains: { allowed: Object.values(depositStatusEnum) } } }),
  bolt11: field(String),
  invoiceId: field(String),
})

module.exports = herbarium.entities.add(DepositIntent, "DepositIntent").entity

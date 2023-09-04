const { Ok, Err } = require("@herbsjs/herbs")
const { createInvoice, getInvoice } = require("lightning")
const { connection } = require("../lightning/connection")

class LightningClient {
  constructor() {}

  async generateInvoice(amount) {
    try {
      const request = { lnd: connection, tokens: amount }
      const createInvoiceResponse = await createInvoice(request)
      const invoice = createInvoiceResponse.request
      const id = createInvoiceResponse.id

      return Ok({ invoice, id })
    } catch (error) {
      return Err()
    }
  }

  async checkInvoice(invoice) {
    try {
      const request = { lnd: connection, id: invoice }
      const getInvoiceResponse = await getInvoice(request)

      return Ok(getInvoiceResponse)
    } catch (error) {
      return Err()
    }
  }
}

module.exports = LightningClient

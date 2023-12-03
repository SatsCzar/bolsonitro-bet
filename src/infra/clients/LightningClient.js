const { Ok, Err } = require("@herbsjs/herbs")
const { createInvoice, getInvoice, payViaPaymentRequest } = require("lightning")
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
      return Err(error.message)
    }
  }

  async checkInvoice(invoiceId) {
    try {
      const request = { lnd: connection, id: invoiceId }
      const getInvoiceResponse = await getInvoice(request)

      return Ok(getInvoiceResponse)
    } catch (error) {
      return Err(error.message)
    }
  }

  async payInvoice(bolt11) {
    try {
      const request = { lnd: connection, request: bolt11 }
      const paymentResponse = await payViaPaymentRequest(request)

      return Ok(paymentResponse)
    } catch (error) {
      return Err(error.message)
    }
  }
}

module.exports = LightningClient

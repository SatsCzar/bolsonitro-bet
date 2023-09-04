const { Ok, Err } = require("@herbsjs/herbs")
const { createInvoice } = require("lightning")
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

      return Ok(invoice)
    } catch (error) {
      return Err()
    }
  }
}

module.exports = LightningClient

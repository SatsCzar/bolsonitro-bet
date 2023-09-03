const config = require("../config")
const { authenticatedLndGrpc } = require("lightning")

const { lnd } = authenticatedLndGrpc(config.lightning)

module.exports = { connection: lnd }

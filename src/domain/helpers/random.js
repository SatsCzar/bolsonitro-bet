const crypto = require("crypto")

// eslint-disable-next-line prettier/prettier
const generateRandomNumber = () => (crypto.randomBytes(4).readUint32BE()) / 0xffffffff

module.exports = generateRandomNumber

const isBolt11 = (value) => {
  const bolt11Regex = /(lnbc)[0-9a-z]+/

  return bolt11Regex.test(value)
}

module.exports = isBolt11

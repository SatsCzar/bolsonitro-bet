const { entity, field, id } = require("@herbsjs/herbs")
const { herbarium } = require("@herbsjs/herbarium")
const betResultEnum = require("../enums/betResultEnum")
const generateRandomNumber = require("../helpers/random")

const Bet = entity("Bet", {
  id: id(Number),
  amountBet: field(Number),
  randomNumber: field(Number),
  result: field(String, { validation: { contains: { allowed: Object.values(betResultEnum) } } }),
  prize: field(Number),

  makeDraw() {
    this.randomNumber = generateRandomNumber()

    const win = this.randomNumber > 0.5 ? true : false

    if (win) {
      this.result = betResultEnum.gain
      this.calculatePrize()
    }
  },

  calculatePrize() {
    const multiplier = 1.9
    this.prize = Math.floor(this.amountBet * multiplier)
  },
})

module.exports = herbarium.entities.add(Bet, "Bet").entity

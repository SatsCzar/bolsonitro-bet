const { entity, field, id } = require("@herbsjs/herbs")
const { herbarium } = require("@herbsjs/herbarium")
const betResultEnum = require("../enums/betResultEnum")

const Bet = entity("Bet", {
  id: id(Number),
  amountBet: field(Number),
  randomNumber: field(Number),
  result: field(String, { validation: { contains: { allowed: Object.values(betResultEnum) } } }),
  prize: field(Number),

  makeDraw() {
    const randomNumber = Math.random()

    this.randomNumber = randomNumber

    const win = randomNumber > 0.5 ? true : false

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

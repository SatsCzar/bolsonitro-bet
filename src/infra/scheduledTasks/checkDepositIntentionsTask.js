const checkDepositIntentions = require("../../domain/usecases/checkDepositIntentions")

module.exports = async (bot) => {
  const usecase = checkDepositIntentions({ bot })

  await usecase.authorize()

  await usecase.run()
}

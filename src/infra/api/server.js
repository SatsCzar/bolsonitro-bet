// ts-check
// eslint-disable-next-line no-unused-vars
const { Express } = require("express")
const { herbsshelf } = require("@herbsjs/herbsshelf")
const { herbarium } = require("@herbsjs/herbarium")

/**
 *
 * @param {Express} app
 */
const shelf = (app) => {
  app.get("/herbsshelf", (_, res) => {
    res.setHeader("Content-Type", "text/html")

    const shelf = herbsshelf({ project: "bolsonitro-bet", herbarium })

    res.write(shelf)
    res.send()
  })

  app.get("/", (req, res) => res.status(301).redirect("/herbsshelf"))

  console.info("\n🌿 Herbs Shelf endpoint - /herbsshelf \n")
}

const startApi = () => {
  herbarium.requireAll()

  const express = require("express")

  const app = express()
  shelf(app)

  return app.listen({ port: 8080 }, () => console.log("🚀 Server UP and 🌪️  - http://localhost:8080/"))
}

module.exports = { startApi }

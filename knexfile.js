module.exports = {
  development: {
    client: "sqlite3",
    useNullAsDefault: true,
    connection: {
      filename: "database.sqlite",
    },
    migrations: {
      directory: "./src/infra/database/migrations",
      tableName: "knex_migrations",
    },
  },
  staging: {},
  production: {},
}

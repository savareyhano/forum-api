/* istanbul ignore file */
const config = {
  app: {
    host: process.env.HOST,
    port: process.env.PORT,
  },
  jwt: {
    accessTokenKey: process.env.ACCESS_TOKEN_KEY,
    refreshTokenKey: process.env.REFRESH_TOKEN_KEY,
    accessTokenAge: process.env.ACCESS_TOKEN_AGE,
  },
  test: {
    host: process.env.PGHOST_TEST,
    port: process.env.PGPORT_TEST,
    user: process.env.PGUSER_TEST,
    password: process.env.PGPASSWORD_TEST,
    database: process.env.PGDATABASE_TEST,
  },
};

module.exports = config;

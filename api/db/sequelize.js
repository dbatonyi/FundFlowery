const config = require("../config")["database"];

module.exports = {
  username: config.username,
  password: config.password,
  database: config.database,
  host: config.host,
  dialect: config.dialect,
};

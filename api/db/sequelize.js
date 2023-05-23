const config = require("../config")["database"];

if (config.socketPath) {
  module.exports = {
    username: config.username,
    password: config.password,
    database: config.database,
    host: config.socketPath,
    dialect: config.dialect,
    dialectOptions: {
      socketPath: config.socketPath,
    },
  };
} else {
  module.exports = {
    username: config.username,
    password: config.password,
    database: config.database,
    host: config.host,
    dialect: config.dialect,
  };
}

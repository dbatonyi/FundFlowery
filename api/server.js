const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const config = require("./config")["api"];
let utils = require("./helpers/utils");
let dbSync = require("./helpers/dbSync");

//CORS
app.use(
  cors({
    credentials: true,
    origin: [config.frontendUrl],
  })
);

//Cookie parser
app.use(cookieParser());

//JSON
app.use(express.json());

//For BodyParser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Models
const models = require("./models");

//Sync Database
(async function () {
  try {
    const syncDB = await models.sequelize.sync();
    dbSync.populateDBTables();
  } catch (error) {
    utils.writeToLogFile(error, "error");
    console.log(error, "Something went wrong with the Database Update!");
  }
})();

//AuthRoutes
const authRoute = require("./routes/authRoutes.js")(app);

//APIRoutes
const apiRoute = require("./routes/apiRoutes.js")(app);

utils.writeToLogFile("Nice! Database looks fine", "info");
console.log("Nice! Database looks fine");

//Create server
app.listen(5000, function (err) {
  if (!err) console.log("API is live: http://localhost:5000");
  else {
    utils.writeToLogFile(error, "error");
    console.log(err);
  }
});

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const cron = require("node-cron");
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

//Cron
const cronSchedule = "0 0 0,12 * * *";
const cronJobs = async () => {
  await utils.updateCurrencyExchanges();
  await utils.utils.writeToLogFile(
    "Cron job executed at 12:00 and 00:00",
    "info"
  );
  await utils.writeToLogFile("Database cleanup started", "info");
  await utils.cleanUpUserDB();
  await utils.cleanUpExpiredEmailValidations();
  await utils.writeToLogFile("Database cleanup ended", "info");
};

//Models
const models = require("./models");

//Sync Database
(async function () {
  try {
    const syncDB = await models.sequelize.sync();
    dbSync.populateDBTables();
    cron.schedule(cronSchedule, cronJobs);
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

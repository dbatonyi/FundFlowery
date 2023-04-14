let apiController = require("../controllers/apiController");

module.exports = function (app) {
  // API

  app.post("/api/log", apiController.apiLog);

  app.post("/api/create-financial-table", apiController.createFinancialTable);

  app.post("/api/get-financial-tables", apiController.getFinancialTablesByUser);

  app.post(
    "/api/get-financial-table-data",
    apiController.getFinancialTableDataByUuid
  );

  app.post(
    "/api/delete-financial-table",
    apiController.deleteFinancialTableByUuid
  );
};

let authController = require("../controllers/authController");

module.exports = function (app) {
  // API

  app.post("/api/signup", authController.apiSignUp);

  app.post("/api/password/new", authController.apiNewPassHandler);

  app.post("/api/password/reset/:id", authController.apiResetPasswordHandler);

  app.post("/api/signin", authController.apiSignIn);

  app.post("/api/logout", authController.apiLogout);

  app.get("/api/user", authController.apiUser);

  app.get("/api/account-confirm/:id", authController.accountConfirm);
};

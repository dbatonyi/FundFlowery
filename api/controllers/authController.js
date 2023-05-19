const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const config = require("../config");
const jwt = require("jsonwebtoken");

let utils = require("../helpers/utils");

var exports = (module.exports = {});

exports.apiSignUp = async function (req, res) {
  const { User } = require("../models");

  const originUrl = req.get("origin");
  const { email, password } = req.body;

  function createNewUser(data) {
    User.create(data).then(function (newUser, created) {
      if (!newUser) {
        utils.writeToLogFile(`IP: ${ip} -- ${error}`, "warning");
        return res.status(500).send({ message: "Something went wrong!" });
      }

      const options = {
        viewEngine: {
          extname: ".hbs",
          layoutsDir: "views/email/",
          defaultLayout: "registration",
          partialsDir: "views/partials/",
        },
        viewPath: "views/email/",
        extName: ".hbs",
      };

      const transporter = nodemailer.createTransport({
        host: config.api.smtpHost,
        port: config.api.smptPort,
        service: config.api.smptService,
        secure: config.api.smtpSecure,
        auth: {
          user: config.api.smtpEmail,
          pass: config.api.smtpPassword,
        },
        logger: true,
      });

      transporter.use("compile", hbs(options));
      transporter.sendMail(
        {
          from: config.api.smtpEmail,
          to: data.email,
          subject: "FundFlowery registration!",
          template: "registration",
          context: {
            user: data.firstname + " " + data.lastname,
            url: originUrl,
            activationUrl:
              config.database.host +
              `:5000/api/account-confirm/${data.reghash}`,
          },
        },
        function (error, response) {
          utils.writeToLogFile(error, "error");
          console.log(error);
          transporter.close();
        }
      );

      return res.status(200).send({
        message:
          "Successful registration, please check your emails to confirm your account!",
      });
    });
  }

  const generateHash = function (password) {
    const salt = bcrypt.genSaltSync(8);
    return bcrypt.hashSync(password, salt);
  };

  const user = await User.findOne({ where: { email: email } });

  if (user) {
    return res.status(200).send({
      message: "Email already in use!",
    });
  }

  const userPassword = generateHash(password);
  const regHashRow = generateHash(email + password);

  //Remove slashes
  const regHash = regHashRow.replace(/\//g, "");

  const data = {
    email: email,
    username: email,
    password: userPassword,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    role: "User",
    reghash: regHash,
  };

  createNewUser(data);
};

exports.apiResendVerificationEmail = async function (req, res) {
  const { User } = require("../models");
  const { email } = req.body;

  const user = await User.findOne({ where: { email: email } });

  if (user) {
    return res.status(200).send({
      message: "Email already in use!",
    });
  }

  //TODO: Custom verification email template for resending
  async function reSendEmail(data) {
    const options = {
      viewEngine: {
        extname: ".hbs",
        layoutsDir: "views/email/",
        defaultLayout: "registration",
        partialsDir: "views/partials/",
      },
      viewPath: "views/email/",
      extName: ".hbs",
    };

    const transporter = nodemailer.createTransport({
      host: config.api.smtpHost,
      port: config.api.smptPort,
      service: config.api.smptService,
      secure: config.api.smtpSecure,
      auth: {
        user: config.api.smtpEmail,
        pass: config.api.smtpPassword,
      },
      logger: true,
    });

    transporter.use("compile", hbs(options));
    transporter.sendMail(
      {
        from: config.api.smtpEmail,
        to: data.email,
        subject: "FundFlowery registration!",
        template: "registration",
        context: {
          user: data.firstname + " " + data.lastname,
          url: originUrl,
          activationUrl:
            config.database.host + `:5000/api/account-confirm/${data.reghash}`,
        },
      },
      function (error, response) {
        utils.writeToLogFile(error, "error");
        console.log(error);
        transporter.close();
      }
    );

    return res.status(200).send({
      message:
        "Successful registration, please check your emails to confirm your account!",
    });
  }

  const { firstname, lastname, reghash } = user;

  const data = { email, firstname, lastname, reghash };

  await reSendEmail(data);
};

exports.apiNewPassHandler = async function (req, res) {
  // Sequelize model require
  const { User } = require("../models");

  const userEmail = req.body.email;

  function setPassResetDate(user) {
    const userInfo = user.get();

    var date = new Date();
    var twoMin = 2 * 60 * 1000;

    if (date - userInfo.resetdate > twoMin) {
      User.update(
        { resetdate: new Date() },
        { where: { email: userEmail } }
      ).then(function (newUser, created) {
        const userName = userInfo.firstname + " " + userInfo.lastname;
        const reghash = userInfo.reghash;

        var options = {
          viewEngine: {
            extname: ".hbs",
            layoutsDir: "views/email/",
            defaultLayout: "passreset",
            partialsDir: "views/partials/",
          },
          viewPath: "views/email/",
          extName: ".hbs",
        };

        var transporter = nodemailer.createTransport({
          host: config.api.smtpHost,
          port: config.api.smptPort,
          service: config.api.smptService,
          secure: config.api.smtpSecure,
          auth: {
            user: config.api.smtpEmail,
            pass: config.api.smtpPassword,
          },
          logger: true,
        });

        transporter.use("compile", hbs(options));
        transporter.sendMail(
          {
            from: config.api.smtpEmail,
            to: userEmail,
            subject: "FundFlowery Reset password!",
            template: "passreset",
            context: {
              user: userName,
              reghash: reghash,
            },
          },
          function (error, response) {
            utils.writeToLogFile(error, "error");
            console.log(error);
            transporter.close();
          }
        );
        return res.status(200).send({
          message: "Your password has been reseted!",
        });
      });
    } else {
      return res.status(200).send({
        message: "Your password already reseted, try again later!",
      });
    }
  }

  const user = await User.findOne({ where: { email: userEmail } });

  if (!user) {
    return res.status(401).send({
      message: "Wrong email address!",
    });
  }

  setPassResetDate(user);
};

exports.apiResetPasswordHandler = async function (req, res) {
  const { User } = require("../models");

  const generateHash = function (password) {
    const salt = bcrypt.genSaltSync(8);
    return bcrypt.hashSync(password, salt);
  };

  var regHash = req.params.id;

  const { newPassword, reNewPassword } = req.body;
  const cryptedPassword = generateHash(newPassword);

  if (newPassword === reNewPassword) {
    const user = await User.findOne({ where: { reghash: regHash } });
    if (user) {
      User.update(
        { password: cryptedPassword },
        { where: { reghash: regHash } }
      ).then(function (newUser, created) {
        return res.status(200).send({
          message: "You successfully reseted your password now you can login!",
        });
      });
    } else {
      return res.status(200).send({
        message: "Something went wrong!",
      });
    }
  } else {
    return res.status(200).send({
      message: "Password must be match!",
    });
  }
};

exports.apiSignIn = async function (req, res) {
  const { User } = require("../models");
  const { email, password } = req.body;

  const isValidPassword = function (userpass, password) {
    return bcrypt.compareSync(password, userpass);
  };

  const user = await User.findOne({ where: { email: email } });

  if (!user) {
    return res.status(401).send({ message: "Wrong email address." });
  }

  if (!isValidPassword(user.password, password)) {
    return res.status(401).send({ message: "Incorrect password." });
  }

  if (user.status === "inactive") {
    return res
      .status(401)
      .send({ message: "Your account inactive, please active!" });
  }

  const userInfo = user.get();

  //Gerenate an access token

  const generateAccessToken = (user) => {
    return jwt.sign({ id: user.uuid, role: user.role }, config.api.jwtkey, {
      expiresIn: "15m",
    });
  };

  const accessToken = generateAccessToken(userInfo);

  res.cookie("jwt", accessToken, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  res.status(200).send({ message: "Success!" });
};

exports.apiUser = async function (req, res) {
  const { User } = require("../models");

  try {
    const cookie = req.cookies["jwt"];

    const claims = jwt.verify(cookie, config.api.jwtkey);

    if (!claims) {
      res.json({
        message: "Invalid Token!",
        auth: false,
      });
      return;
    }

    const user = await User.findOne({ where: { uuid: claims.id } });

    const { password, reghash, resetdate, updatedAt, createdAt, id, ...data } =
      await user.toJSON();

    res.send({ userInfo: data, auth: true });
  } catch {
    res.json({
      message: "Invalid Token!",
      auth: false,
    });
    return;
  }
};

exports.accountConfirm = async function (req, res) {
  const { User } = require("../models");

  var regHash = req.params.id;
  let redirectParam = req.query.redirectParam;

  const user = await User.findOne({ where: { reghash: regHash } });

  if (!user) {
    return res.status(404).send({
      message: "Account not found!",
    });
  }

  const updateUser = await User.update(
    { status: "active" },
    { where: { reghash: regHash } }
  );

  if (redirectParam) {
    window.location.replace(redirectParam + "/login");
    return;
  }

  return res.status(200).send({
    message: "Account activated!",
  });
};

exports.apiLogout = async function (req, res) {
  res.cookie("jwt", "", { maxAge: 0 });

  return res.status(200).send({
    message: "Successfully logged out!",
  });
};

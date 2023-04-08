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
        port: 465,
        service: "yahoo",
        secure: false,
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
          subject: "DDH registration!",
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

      if (!newUser) {
        res.json({ status: "Unexpected error!" });
        return;
      }
      if (newUser) {
        res.json({ status: "Successfully registered!" });
        return;
      }
    });
  }

  const generateHash = function (password) {
    const salt = bcrypt.genSaltSync(8);
    return bcrypt.hashSync(password, salt);
  };

  const user = await User.findOne({ where: { email: email } });

  if (user) {
    res.json({ status: "User already exist" });
    return;
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
          port: 465,
          service: "yahoo",
          secure: false,
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
            subject: "DDH Reset password!",
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
        res.json({ status: "Your password has been reseted!" });
        return;
      });
    } else {
      res.json({ status: "Your password already reseted, try again later!" });
      return;
    }
  }

  const user = await User.findOne({ where: { email: userEmail } });

  if (!user) {
    res.json({ status: "Wrong email address!" });
    return;
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
        res.json({
          status: "You successfully reseted your password now you can login!",
        });
        return;
      });
    } else {
      res.json({ status: "Something went wrong!" });
      return;
    }
  } else {
    res.json({ status: "Password must match!" });
    return;
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
    res.status(401).send({ message: "Wrong email address." });
    return;
  }

  if (!isValidPassword(user.password, password)) {
    res.status(401).send({ message: "Incorrect password." });
    return;
  }

  if (user.status === "inactive") {
    res.status(401).send({ message: "Your account inactive, please active!" });
    return;
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
    res.json({ status: "Account not found!" });
    return;
  }

  const updateUser = await User.update(
    { status: "active" },
    { where: { reghash: regHash } }
  );

  if (redirectParam) {
    window.location.replace(redirectParam + "/login");
    return;
  }

  res.json({ status: "Account activated!" });
  return;
};

exports.apiLogout = async function (req, res) {
  res.cookie("jwt", "", { maxAge: 0 });

  res.send({ message: "Successfully logged out!" });
};

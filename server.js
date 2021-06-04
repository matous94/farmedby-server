require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const { ParseServer } = require("parse-server");
const { validationResult } = require("express-validator");

const userValidation = require("./packages/user/user-validation");

const app = express();

const api = new ParseServer({
  appName: "FarmedBy",
  databaseURI: `mongodb+srv://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOSTNAME}?retryWrites=true&w=majority`, // Connection string for your MongoDB database
  cloud: path.join(__dirname, "cloud-functions.js"), // Absolute path to your Cloud Code
  appId: process.env.APP_ID,
  masterKey: process.env.MASTER_KEY, // Keep this key secret!
  // fileKey: "optionalFileKey",
  serverURL: `${process.env.SERVER_URL}/parse`, // Don't forget to change to https if needed
  publicServerURL: "https://server.farmedby.com/parse",
  revokeSessionOnPasswordReset: false,
  emailAdapter: {
    module: "parse-smtp-template",
    options: {
      port: 587,
      host: "smtp.forpsi.com",
      user: process.env.EMAIL_USER,
      password: process.env.EMAIL_PASSWORD,
      fromAddress: "matous@farmedby.com",
      template: true,
      templatePath: "packages/email/email-and-password.html"
    }
  }
});

app.use(cors());
app.use(express.json());

function validationResultHandler(req, res, next) {
  // Finds the validation errors in this request and wraps them in an object with handy functions
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  return next();
}

// validate cloud functions input
app.use("/parse/functions", userValidation.functionsRouter);
app.use("/parse/functions", validationResultHandler);

// Serve the Parse API on the /parse URL prefix
app.use("/parse", api);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}.`);
});

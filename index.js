require("dotenv").config();
const express = require("express");
const ParseServer = require("parse-server").ParseServer;
const app = express();

const api = new ParseServer({
  databaseURI: `mongodb+srv://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOSTNAME}?retryWrites=true&w=majority`, // Connection string for your MongoDB database
  cloud: __dirname + "/cloud.js", // Absolute path to your Cloud Code
  appId: process.env.APP_ID,
  masterKey: process.env.MASTER_KEY, // Keep this key secret!
  // fileKey: "optionalFileKey",
  serverURL: `${process.env.SERVER_URL}/parse`, // Don't forget to change to https if needed
});

// Serve the Parse API on the /parse URL prefix
app.use("/parse", api);

app.listen(1337, function () {
  console.log("parse-server running on port 1337.");
});

require("dotenv").config();
const express = require("express");
const path = require("path");
const { ParseServer } = require("parse-server");

const app = express();

const api = new ParseServer({
  databaseURI: `mongodb+srv://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOSTNAME}?retryWrites=true&w=majority`, // Connection string for your MongoDB database
  cloud: path.join(__dirname, "cloud.js"), // Absolute path to your Cloud Code
  appId: process.env.APP_ID,
  masterKey: process.env.MASTER_KEY, // Keep this key secret!
  // fileKey: "optionalFileKey",
  serverURL: `${process.env.SERVER_URL}/parse` // Don't forget to change to https if needed
});

// Serve the Parse API on the /parse URL prefix
app.use("/parse", api);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}.`);
});

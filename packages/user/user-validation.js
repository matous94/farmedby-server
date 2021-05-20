const express = require("express");
const { body } = require("express-validator");

const router = express.Router();
exports.functionsRouter = router;

router.post(
  "/signUp",
  body("email")
    .trim()
    .normalizeEmail()
    .isEmail(),
  body("password").isLength({ min: 7 })
);

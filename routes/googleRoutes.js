const express = require("express");
const router = express.Router();
const { googleLogin, googleCallback } = require("../services/googleService");

router.get("/", googleLogin);          // redirect to Google
router.get("/callback", googleCallback); // Google se data aayega

module.exports = router;

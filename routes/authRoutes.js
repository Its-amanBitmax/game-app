const express = require("express");
const router = express.Router();
const {
  sendOtp,
  verifyOtpOnly,
  registerAfterOtp
} = require("../controllers/authController");

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtpOnly);
router.post("/register", registerAfterOtp);

module.exports = router;

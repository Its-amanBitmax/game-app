const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // Common
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // normal login ke liye
  gender: String,
  dob: String,

  // Google Auth fields
  googleId: { type: String },
  profilePic: { type: String },
  provider: { type: String, enum: ["local", "google"], default: "local" },

  // OTP Verification
  otp: String,
  otpExpire: Date,

  isVerified: { type: Boolean, default: false },
  role: { type: String, default: "user" }

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);

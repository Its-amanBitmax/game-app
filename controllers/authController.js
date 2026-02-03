const User = require("../models/User");
const bcrypt = require("bcrypt");
const sendEmail = require("../utils/sendEmail");

// ================= SEND OTP =================
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ message: "Email is required" });

    let user = await User.findOne({ email });

    if (user && user.isVerified)
      return res.status(400).json({ message: "Email already registered" });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    if (!user) {
      user = await User.create({ email, otp, otpExpire });
    } else {
      user.otp = otp;
      user.otpExpire = otpExpire;
      await user.save();
    }

    // Send OTP via email
    await sendEmail(email, otp);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully to email"
    });
  } catch (error) {
    console.error("Send OTP Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ================= VERIFY OTP =================
exports.verifyOtpOnly = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP are required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    if (!user.otp || user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    if (user.otpExpire < Date.now())
      return res.status(400).json({ message: "OTP expired" });

    // Mark email as verified
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "OTP verified successfully"
    });
  } catch (error) {
    console.error("OTP Verification Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ================= REGISTER AFTER OTP =================
exports.registerAfterOtp = async (req, res) => {
  try {
    const { name, password, gender, dob } = req.body;

    // Get email from header instead of body
    const email = req.headers["x-user-email"]; // frontend sends verified email here
    if (!email)
      return res.status(400).json({ message: "Verified email not provided" });

    if (!name || !password)
      return res.status(400).json({ message: "Name and Password are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.isVerified)
      return res.status(400).json({ message: "Email not verified yet" });

    const hashedPassword = await bcrypt.hash(password, 10);

    user.name = name;
    user.password = hashedPassword;
    user.gender = gender || "";
    user.dob = dob || "";

    await user.save();

    res.status(200).json({
      success: true,
      message: "Registration completed successfully"
    });

  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};


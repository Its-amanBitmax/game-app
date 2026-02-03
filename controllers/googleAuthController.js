const User = require("../models/User");

// Google Login Controller (NO JWT)
exports.googleLogin = async (req, res) => {
  try {
    const { googleId, email, name, picture } = req.body;

    if (!email || !googleId) {
      return res.status(400).json({
        success: false,
        message: "Google data missing"
      });
    }

    let user = await User.findOne({ email });

    // 🔹 If user already exists
    if (user) {
      // agar pehle normal signup tha to google se link karo
      if (!user.googleId) {
        user.googleId = googleId;
        user.provider = "google";
        user.isVerified = true;
        user.name = user.name || name;
        user.profilePic = picture;
        await user.save();
      }
    } 
    // 🔹 If new user
    else {
      user = await User.create({
        googleId,
        email,
        name,
        profilePic: picture,
        provider: "google",
        isVerified: true
      });
    }

    res.status(200).json({
      success: true,
      message: "Google login successful",
      user
    });

  } catch (error) {
    console.error("Google Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

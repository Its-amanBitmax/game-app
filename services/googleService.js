const User = require("../models/User");
const axios = require("axios");
const qs = require("querystring");

exports.googleLogin = (req, res) => {
  const redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    qs.stringify({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: process.env.GOOGLE_CALLBACK_URI,
      response_type: "code",
      scope: "profile email",
      access_type: "offline",
      prompt: "consent"
    });

  res.redirect(redirectUrl);
};


exports.googleCallback = async (req, res) => {
  try {
    const code = req.query.code;

    if (!code) {
      return res.status(400).json({ message: "No code received from Google" });
    }

    // 🔹 Exchange code for access token
    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      qs.stringify({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_CALLBACK_URI,
        grant_type: "authorization_code",
        code: code
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const accessToken = tokenResponse.data.access_token;

    // 🔹 Get user profile from Google
    const userInfoResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    const { id: googleId, email, name, picture } = userInfoResponse.data;

    // 🔹 Save user in DB
    let user = await User.findOne({ email });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        user.provider = "google";
        user.isVerified = true;
        user.name = user.name || name;
        user.profilePic = picture;
        await user.save();
      }
    } else {
      user = await User.create({
        googleId,
        email,
        name,
        profilePic: picture,
        provider: "google",
        isVerified: true
      });
    }

    // ❌ No JWT
    return res.status(200).json({
      success: true,
      message: "Google login successful",
      user
    });

  } catch (error) {
    console.error("Google Callback Error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "Google authentication failed",
      error: error.message
    });
  }
};

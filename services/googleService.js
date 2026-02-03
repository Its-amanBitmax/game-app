const User = require("../models/User");
const axios = require("axios");
const qs = require("querystring");

exports.googleLogin = (req, res) => {
  const redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    qs.stringify({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: process.env.GOOGLE_CALLBACK_URL,
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
      return res.status(400).send("No code received from Google");
    }
 
    // 1️⃣ Exchange code for access token
    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      qs.stringify({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_CALLBACK_URL,
        grant_type: "authorization_code",
        code,
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
 
    const accessToken = tokenResponse.data.access_token;
 
    // 2️⃣ Fetch user info from Google
    const userInfoResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
 
    const { id: googleId, email, name, picture } = userInfoResponse.data;
 
    // 3️⃣ Find or create user
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
        isVerified: true,
      });
    }
 
    // 4️⃣ ONLY responsibility of backend:
    // send userId to frontend auth handler
    return res.redirect(`/auth/success?uid=${user._id}`);
 
  } catch (error) {
    console.error(
      "Google Callback Error:",
      error.response?.data || error.message
    );
 
    // frontend failure handler
    return res.redirect(`/auth/failure`);
  }
};
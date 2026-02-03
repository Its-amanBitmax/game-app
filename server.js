const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors());

// ✅ BOTH middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Mongo Backend Running 🚀");
});

const authRoutes = require("./routes/authRoutes");
const googleRoutes = require('./routes/googleRoutes');
const profileRoutes = require("./routes/profileRoutes");


app.use('/api/google', googleRoutes);
app.use("/api/auth", authRoutes);
app.use('/auth/google', googleRoutes);
app.use("/api", profileRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dbConnect = require("./dbConnect");
const User = require("./userSchema");

if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not set in .env");

const app = express();
app.use(express.json());

// POST /login  { email, password }
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  res.status(200).json({ message: "Login successful", token });
});

dbConnect().then(() => {
  app.listen(process.env.PORT, "0.0.0.0", () => {
    console.log(`Authentication service running on port ${process.env.PORT}`);
  });
});

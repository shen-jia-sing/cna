require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const dbConnect = require("./dbConnect");
const User = require("./userSchema");

const app = express();
app.use(express.json());

// POST /register  { name, email, password }
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "name, email and password are required" });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: "Email already registered" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword });

  res.status(201).json({
    message: "User registered successfully",
    user: { id: user._id, name: user.name, email: user.email },
  });
});

dbConnect().then(() => {
  app.listen(process.env.PORT, "0.0.0.0", () => {
    console.log(`Registration service running on port ${process.env.PORT}`);
  });
});

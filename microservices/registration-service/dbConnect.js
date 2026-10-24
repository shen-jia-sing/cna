const mongoose = require("mongoose");

async function dbConnect() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI is not set in .env");
  await mongoose.connect(uri);
  console.log("MongoDB connected");
}

module.exports = dbConnect;

const mongoose = require("mongoose");

const analyticsScheme = new mongoose.Schema({
  shortUrl: String,
  lastVisitedAt: String,
  device: String,
  ip: String,
  os: String,
  browser:String
});

module.exports = mongoose.model("Analytic", analyticsScheme);

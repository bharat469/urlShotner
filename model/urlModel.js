const mongoose = require('mongoose')

const urlScheme = new mongoose.Schema(
  {
    shortUrl: String,
    originalUrl: String,
    clickCount: { type: Number, default: 0 },
    userId:{type:mongoose.Schema.Types.ObjectId,ref:'User'}
  },
  { timestamps: true },
);



module.exports = mongoose.model('Url',urlScheme)

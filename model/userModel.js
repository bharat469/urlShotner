const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name:String,
    email:String,
    Password:String,
    refreshToken:String,
},{timestamps:true})

module.exports = mongoose.model('User',userSchema)
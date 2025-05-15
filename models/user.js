
const mongoose = require("mongoose");
const post = require("./post");

mongoose.connect("mongodb://127.0.0.1:27017/userdata")
.then(() => {
  console.log("MongoDB connected");
})
.catch((err) => {
  console.error("MongoDB connection error:", err);
});

const userSchema = new mongoose.Schema({
  username: String,
  name: String,
  password: String,
  email: String,
  age: Number,
  profilepic:{
   type: String,
   default: "default.png"
  },
  posts:[
    {type: mongoose.Schema.Types.ObjectId, ref: post}
  ]
 
});

module.exports = mongoose.model("user", userSchema); 

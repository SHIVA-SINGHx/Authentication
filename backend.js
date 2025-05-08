const express = require("express");
const app = express();
const path = require('path');
const fs = require('fs');
const userModel = require('./usermodel');
const { name } = require("ejs");
const { json } = require("stream/consumers");
const usermodel = require("./usermodel");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const { log } = require("console");
const jwt = require("jsonwebtoken");
const { model } = require("mongoose");
const { hash } = require("crypto");


app.use(cookieParser());

// middleware
app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(express.static(path.join(__dirname, "public")));
app.set('view engine', 'ejs');

app.get("/", (req, res) => {
    res.render("index");
})

app.post("/create", (req, res) => {
    let {name, password, email, age} = req.body;
   
    if(!password || !email || !name || !age){
       res.send("something is wrong");
    } 

    else{
        bcrypt.genSalt(10, (err, salt) =>{
          bcrypt.hash(password, salt, async (err, hash) => {
              let createuser = await userModel.create({
                  name,
                  password: hash,
                  email,
                  age
              })

             let token = jwt.sign({email}, "secret");
             res.cookie("token", token);

              res.send(createuser);
          })
          
        })
    }

})

app.get("/login", (req, res) => {
    res.render("login")
})

app.post("/login", async (req, res) => {
   let user = await usermodel.findOne({email: req.body.email});
   if(!user) return res.send("something went wrong?")
   
    bcrypt.compare(req.body.password, user.password, (err, result) => {
        if(result) return res.send("login succesfully")
            else   return res.send("oops something went wrong?")
    })
    
})

app.get("/logout", (req, res) => {
    res.cookie("token", "");
    res.redirect("/");
})


app.listen(3000);




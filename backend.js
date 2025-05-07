const express = require("express");
const app = express();
const path = require('path');
const fs = require('fs');
const userModel = require('./usermodel');
const { name } = require("ejs");
const { json } = require("stream/consumers");
const usermodel = require("./usermodel");

// middleware
app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(express.static(path.join(__dirname, "public")));
app.set('view engine', 'ejs');


app.get('/', (req, res) => {
   res.render("index")
})

app.get('/read', async (req, res) => {
  let users = await userModel.find();
  res.render("read", {users})
})
 

app.get('/delete/:id', async (req, res) => {
   let users = await userModel.findOneAndDelete({_id: req.params.id})
   res.redirect("/read");
})

app.get('/update/:userid', async (req, res) => {
   let updateusers = await userModel.findOne({_id: req.params.userid});
   res.render("update", { updateusers });
 });
 

app.post('/create', async (req, res) =>{
   let {name, email, image} = req.body;
   let createduser = await userModel.create({
      name: name,
      email: email,
      image: image
   })

   app.post('/update/:userid', async (req, res) => {
      let { name, email, image } = req.body;
      
     let createduser = await userModel.findOneAndUpdate(
        req.params.userid,
        { name, email, image },
        { new: true }
      );
    
      res.redirect('/read'); 
    });
    

   res.redirect("/read");
})


app.listen(3000);




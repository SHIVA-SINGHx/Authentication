const express = require("express");
const app = express();
const userModel = require("./models/user");
const postModel = require("./models/post");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const user = require("./models/user");
const post = require("./models/post");
const path = require("path");
const upload = require("./config/mutler")
const fs = require("fs");


app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, "public") ));
app.use(cookieParser());


const uploadPath = './images/upload';
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

app.use('/images', express.static('images'));

app.get('/', (req, res) => {
    res.render("index");
})

app.get("/profile/upload",(req, res) => {
    res.render("uploadprofile");
})

app.post("/upload", isLoginIn, upload.single("image"), async (req, res) => {
   let user = await userModel.findOne({ email: req.user.email });
   user.profilepic = req.file.filename;
   await user.save();
   res.redirect("/profile");
});


app.get("/login", (req, res) => {
    res.render("login");
})

app.get("/profile", isLoginIn, async (req, res) => {
    let user = await userModel.findOne({ email: req.user.email }).populate("posts");
    res.render("profile", { user });
});

app.post("/profile", isLoginIn, async (req, res) => {
    let user = await userModel.findOne({ email: req.user.email });
    
    const { content } = req.body;
    
    let post = await postModel.create({
        user: user._id,
        content: content,
    });

    user.posts.push(post._id);
    await user.save();

    res.redirect("/profile");
});


app.post("/signin", async (req, res) => {
    const { name, password, username, age, email } = req.body;

    if (!name || !password || !username || !email || !age) {
        return res.send("Please fill all the fields");
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
        return res.send("User already registered");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await userModel.create({
        name,
        username,
        age,
        email,
        password: hashedPassword,
    });

    const token = jwt.sign({ email, userid: newUser._id }, "secret");
    res.cookie("token", token);
    res.send("User registered and cookie set");
});

app.post("/login", async (req, res) => {
    let {email, password} = req.body;
    let user = await userModel.findOne({email});
    if(!user) return res.status(500).send("something went wrong here?");

    bcrypt.compare(password, user.password, (err, result) => {

        if(result){
             const token = jwt.sign({ email, userid: user._id }, "secret");
             res.cookie("token", token);
            res.status(200).redirect("/profile")
        }
        else res.status(500).send("Incorrect deatils")
        })
})


app.post("/like/:id", isLoginIn, async (req, res) =>{
   let post = await postModel.findOne({_id: req.params.id}).populate("user");

    if(post.likes.indexOf(req.user.userid) === -1){
        post.likes.push(req.user.userid);
    } else{
        post.likes.splice(post.likes.indexOf(req.user.userid), 1);
    }

   await post.save();
   res.redirect("/profile");
   
})

app.get("/edit/:id", isLoginIn, async (req, res) => {
    const post = await postModel.findById(req.params.id);
    res.render("edit", { post: post });
});

app.post("/edit/:id", isLoginIn, async (req, res) => {
    await postModel.findByIdAndUpdate(req.params.id, {
        content: req.body.content,
    });
    res.redirect("/profile");
});

app.post("/delete/:id", isLoginIn, async (req, res) => {
    await postModel.findByIdAndDelete(req.params.id);
    res.redirect("/profile");
});

app.post("/delete/:id", isLoginIn, async (req, res) => {
    const post = await postModel.findById(req.params.id);

    if (post && post.user.toString() === req.user.userid) {
        await postModel.findByIdAndDelete(req.params.id);
    }
    res.redirect("/profile");
});


app.get("/logout", (req, res) => {
   res.cookie("token", "")
   res.redirect("/login");
})

function isLoginIn(req, res, next){
    if(req.cookies.token === "") res.redirect("/login");
        else{
            let data = jwt.verify(req.cookies.token, "secret")
            req.user = data;
        }

        next(); 
}

app.listen(3000, () => {
    console.log("Server running");
});


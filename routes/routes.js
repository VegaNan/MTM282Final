var express = require('express');
var router = express.Router();
const mongoose = require("mongoose");
var loggedIn = false;
var canEdit = false;
var userCount;
var currentUser;

//connect to the database
mongoose.connect("mongodb+srv://admin:<admin>@cluster0-jkjax.mongodb.net/test?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const Schema = mongoose.Schema;
const userSchema = new Schema({
    _id: Number,
    firstName: String,
    lastName: String,
    email: String,
    userName: String,
    password: String,
    roles: Array
});
const User = mongoose.model("Users", userSchema);

async function getUserByUsername(Username) {
    await User.find({ userName: Username }, function(err, users) {
        if (err) {
            console.log(err);
            currentUser = null;
        }
        if (users) {
            currentUser = users[0];
        } else {
            currentUser = null;
        }
    });
}

async function countUsers() {
    await User.find(function(err, users) {
        userCount = users.length;
    });
}

router.get('/', function(req, res) {
    var model = {
        title: "Home",
        pageTitle: "Welcome",
        loggedIn: loggedIn,
        canEdit: canEdit
    };
    res.render("index", model);
});


router.get("/login", function(req, res) {
    var model = {
        title: "Login",
        pageTitle: "Login",
        loggedIn: loggedIn,
        canEdit: canEdit
    };
    res.render("login", model);
});

router.post("/login", function(req, res) {

    //check database
    getUserByUsername(req.body.username).then(function() {
        if (currentUser.password == req.body.password) {
            req.session.userId = currentUser._id;
            req.session.username = currentUser.userName;
            loggedIn = true;
            if(currentUser["roles"].includes("Admin")){
                canEdit = true;
                res.redirect("/newItem");
            }else if (currentUser["roles"].includes("User")){
                res.redirect("/");
            }
        }else {
            console.log("failed login")
            res.redirect("/login")
        }
    });
});

router.get("/logout", function(req, res) {
    req.session.username = "";
    req.session.userId = "";
    canEdit = false;
    loggedIn = false;
    var model = {
        title: "Logged Out",
        pageTitle: "Logged Out",
        loggedIn: loggedIn,
        canEdit: canEdit
    };
    res.render("login", model);
});

router.get("/register", function(req, res) {
    var model = {
        title: "Register",
        pageTitle: "Register",
        loggedIn: loggedIn,
        canEdit: canEdit
    };
    res.render("register", model);
});


router.post("/register", function(req, res) {
    countUsers().then(function() {
        var id = userCount;
        var un = req.body.username;
        var ps = req.body.password;
        var fn = req.body.fn;
        var ln = req.body.ln;
        var em = req.body.email;

        User.create({
            _id: id,
            firstName: fn,
            lastName: ln,
            email: em,
            userName: un,
            password: ps,
            roles: ["User"]
        });

        req.session.username = un;
        req.session.userId = id;
        loggedIn = true;
        res.redirect("/");
    });
});

module.exports = router;
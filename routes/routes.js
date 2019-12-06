var express = require('express');
var router = express.Router();
const mongoose = require("mongoose");
var loggedIn = false;
var canEdit = false;
var userCount;
var currentUser;
const bcrypt = require('bcrypt');
const salt = 2;

//connect to the database
mongoose.connect("mongodb+srv://root:root@cluster0-cgcq1.mongodb.net/mtm282final?retryWrites=true&w=majority", {
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
    roles: Array,
    answers: Array
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

router.post("/login", function (req, res) {
    //check database
    getUserByUsername(req.body.username).then(function () {

        if(currentUser == null){
            res.redirect("/register");
        }else{
            loggedIn = loggedIn;
            bcrypt.compare(req.body.password, currentUser.password).then(function (correct) {
                if (correct) {
                    req.session.userId = currentUser._id;
                    req.session.username = currentUser.userName;
                    loggedIn = true;

                    if (currentUser["roles"].includes("Admin")) {
                        canEdit = true;
                        res.redirect("/admin");
                    }else if(currentUser.answers.length == 0){
                        loggedIn = true;
                        res.redirect("/questions");
                    }else if (currentUser["roles"].includes("User")) {
                        loggedIn = true;
                        res.redirect("/");
                    }
                } else {
                    console.log("failed login")
                    res.redirect("/login")
                }
            });
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


router.post("/register", function (req, res) {
    countUsers().then(function () {
        var id = userCount;
        var un = req.body.username;
        var pass = req.body.password;
        var fn = req.body.fn;
        var ln = req.body.ln;
        var em = req.body.email;

        bcrypt.hash(pass, salt).then(function (ps) {
            User.create({
                _id: id,
                name: fn + " " + ln,
                email: em,
                userName: un,
                password: ps,
                roles: ["User"],
                answers: []
            });

            req.session.username = un;
            req.session.userId = id;
            loggedIn = true;
            res.redirect("/");

        })

    });
});

router.get('/questions', function(req, res) {
    if(currentUser == null){
        res.redirect("/login")
    }else{
        var qas = [["Rick Astley's never gonna: ", "Give you up", "Let you down", "Run around", "Desert You"],
                    ["What is your favorite pizza topping?", "Pepperoni" ,"Cheese", "Pineapple", "Mayonnaise"],
                    ["How old are you?", "17 or younger", "18-24", "25-34", "34+"]];
        var model = {
            questions: qas,
            title: "Questions",
            pageTitle: "Answer the following questions",
            loggedIn: loggedIn,
            canEdit: canEdit
        };
        res.render("questions", model);
    }
});

router.post('/questions', function(req, res) {

    currentUser.answers=[req.body.q1answer, req.body.q2answer, req.body.q3answer];
    console.log(currentUser.answers)
    res.redirect("/");
});


module.exports = router;
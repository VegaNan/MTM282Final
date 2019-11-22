const express = require("express");
var port = 3003;
const app = express();
const session = require("express-session");

app.use(session({
    secret: "rawr",
    cookie: {}
}));

//This will parse request values from a form
app.use(express.urlencoded({ extended: true }));

var routes = require('./routes/routes.js');
app.use('', routes);


//use pug and use /public files
app.set("view engine", "pug");
app.use(express.static(__dirname + "/public"));

app.listen(port, function() {
    console.log("Express started listening on port: " + port);
});
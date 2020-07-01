const express = require("express");
const db = require("./connection");
const http = require("http");
const mysql = require("mysql");
const bcrypt = require("bcrypt");
const session = require("express-session");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
const ejs = require("ejs");
require("dotenv").config();
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json());

app.listen(process.env.PORT || 3000); //starting app

app.use(express.static(__dirname)); //setting static visibilty for whole directory
app.use(cookieParser()); //setting cookieparser

app.use(
  session({
    //setting up express session
    secret: process.env.COOKIE_SECRET,
    resave: true,
    saveUninitialized: false,
    cookie: {
      expires: 6000000,
    },
  })
);
// app.use((req, res, next) => { //checking if user's cookie are still saved in the browser
//   if (req.cookies.user_sid && !req.session.user) {
//     res.clearCookie("user_sid");
//   }
//   next();
// });

app.set('view engine', 'ejs') //setting ejs rendering

//setting homepage
app.get(['/', '/index', '/index.html'], function (req, res) {
    //res.type('html');
    res.sendFile(__dirname + "/index.html");
    //console.log("triggered");
});


//user signup middleware
app.post("/signup", (req, res) => {
    var username = req.body.username;
    var password = req.body.password;
    var hashedpassword = bcrypt.hashSync(password, 10); //hashing password using bcrypt using synchronous method
    var email = req.body.email;

    //checking if the username is already taken
    var sql = "Select * from users where username=" + mysql.escape(username);

    db.query(sql, (err, result, field) => {
        if (err) throw err;
        if (result.length) {
            res.send("Username already exists");
        } else {
            var insertuser = "insert into users(username, email, password) values(? , ? , ? )";
            db.query(insertuser, [username, email, hashedpassword], (error) => {
                if (error) throw error;
                else {
                    console.log("user inserted");
                    res.send("User created, login please");

                }
            })
        };
    });
});

app.post("/login", (req, res) => {
    var username = req.body.username;
    var password = req.body.password;
    var query = "select password from users where username=" + mysql.escape(username);
    //if empty, then username doesnt exist
    //if there is a non-empty result, then the result field holds the hashed password
    db.query(query, (err, result) => {
        if (err) throw err;
        if (!result.length) {
            res.send("Invalid username");
        } else {
            if (bcrypt.compareSync(password, result[0].password)) {
                // Passwords match, set the session and login
                req.session.username=username;
                res.cookie('username', username);
                //console.log(req.session);
               // console.log(req.cookie);
                res.redirect("index.html");

            } else {
                // Passwords don't match
                res.send("Invalid Password");
            }
        }
    })
})

//rendering header according to user login status
app.get("/header.html", (req, res) => {
    res.render(__dirname + "/header.ejs");
})

//logout route
app.get('/logout', (req, res) => {
    if (req.session.username||req.cookies.username) {
        //console.log("logged out", req.session.cookie);
        req.session.destroy((err) => {
            if (err) throw err;
        })
        res.clearCookie("username");
        res.redirect('/');
    } else {
        res.sendFile(__dirname + "/login.html");
    }

})

//get request to validate username for the current session
app.get('/checkusername', (req, res) => {
    //res.send(req.session.username);
    res.send(req.cookies.username);
})
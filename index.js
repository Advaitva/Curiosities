const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const session = require("express-session");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();

app.listen('3000', () => {
    console.log('Server started on port 3000')
});

//create connection

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

db.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});
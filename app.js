//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const md5 = require("md5");
const app = express();
const bcrypt = require("bcrypt");
const saltRounds = 10;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost:27017/secretDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const secretSchema = new mongoose.Schema({
  email: "String",
  password: "String",
});

const secretModel = new mongoose.model("secretList", secretSchema);

//Home
app.get("/", function (req, res) {
  res.render("home");
});

//Login
app.get("/login", function (req, res) {
  res.render("login");
});
app.post("/login", function (req, res) {
  secretModel.findOne({ email: req.body.username }, function (err, result) {
    if (!err) {
      if (result) {
        bcrypt.compare(req.body.password, result.password, function (
          err,
          hashResult
        ) {
          if (hashResult === true) {
            res.render("secrets");
          }
        });
      }
    }
  });
});

//Register
app.get("/register", function (req, res) {
  res.render("register");
});
app.post("/register", function (req, res) {
  bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
    if (!err) {
      const secretObject = new secretModel({
        email: req.body.username,
        password: hash,
      });
      secretObject.save(function (err) {
        if (!err) {
          res.render("secrets");
        } else {
          console.log(err);
        }
      });
    } else {
      res.render(err);
    }
  });
});

app.listen("3000", function (req, res) {
  console.log("Server started at port 3000");
});

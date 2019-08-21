var express = require("express");
// const formidable = require("express-formidable");

var app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + "/public"));
// app.use(formidable());

app.get("/index.html", function(req, res, next) {
  console.log(req);
  console.log("Connected");
  res.sendFile(__dirname + "/index.html");
});

app.post("/save", function(req, res) {
  // console.log(JSON.stringify(req.fields));
  console.log(req.body);
});

app.listen(8000);

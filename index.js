var express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");

var app = express();

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.text({ type: "text/plain" }));

// app.use(formidable());

function getTime() {
  const today = new Date();

  return today.getTime();
  const date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  const time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  return date + " " + time;
}

app.get("/index.html", function(req, res, next) {
  res.sendFile(__dirname + "/index.html");
});

app.post("/save", function(req) {
  const data = JSON.stringify(req.body);
  fs.writeFile(`./exercise-data/metamotionr-${getTime()}.txt`, data, err => {
    if (err) throw err;
    console.log("Exercise quaternion data from MetaMotion R saved!");
  });
});

app.listen(8000);

const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");
const uuidv4 = require("uuid/v4");

var app = express();

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.text({ type: "text/plain" }));

const url = "mongodb://localhost:27017";
const dbName = "GymBuddy";

const client = new MongoClient(url);
client.connect(function(err) {
  assert.equal(null, err);
  console.log("Connected successfully to server");

  const db = client.db(dbName);

  // createUser("Jim", db);
  // findUserByName("Dimitris", db);
  // deleteUsersByName("Jim", db);
  findAllUsers(db);
});

function findUserByName(name, db) {
  db.collection("users")
    .find({ name })
    .toArray(function(err, result) {
      if (err) throw err;
      console.log(result);
    });
  return;
}

function findAllUsers(db) {
  db.collection("users")
    .find({})
    .toArray(function(err, result) {
      if (err) throw err;
      console.log(result);
      client.close();
    });
  return;
}

function deleteUsersByName(name, db) {
  db.collection("users").deleteMany({ name }, function(err, obj) {
    if (err) throw err;
    console.log(obj.result.n);
    client.close();
  });
  return;
}

function createUser(name, db) {
  const users = db.collection("users");

  const user = {
    name,
    id: uuidv4(),
    exercises: []
  };
  users.insertOne(user, function(err, res) {
    if (err) throw err;
    console.log(
      `🎉 User with name ${user.name} and id ${user.id} created successfully`
    );
  });
}

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
  //var finalCsv = arr.map(a => `${a.x} ${a.y} ${a.z} ${a.w}`).join("\n")

  fs.writeFile(`./exercise-data/metamotionr-${getTime()}.txt`, data, err => {
    if (err) throw err;
    console.log("Exercise quaternion data from MetaMotion R saved!");
  });
});

app.listen(8000);

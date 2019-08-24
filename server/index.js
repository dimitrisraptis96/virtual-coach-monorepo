import express from "express";
import mongoose from "mongoose";
import fs from "fs";
import bodyParser from "body-parser";

import models, { connectDb } from "./models";

import getTime from "./utils/getTime";
import data from "./exercise-data/exercise.json";

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

var app = express();
app.use(express.static(__dirname + "/view"));
app.use(bodyParser.text({ type: "text/plain" }));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

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

app.get("/users", async (req, res) => {
  const users = await models.User.find();
  return res.send(users);
});

app.get("/exercises", async (req, res) => {
  const exercises = await models.Exercise.find();
  return res.send(exercises);
});

app.get("/user/:userId", async (req, res) => {
  const user = await models.User.findById(req.params.userId);
  return res.send(user);
});

app.get("/exercise/:exerciseId", async (req, res) => {
  const exercise = await models.Exercise.findById(req.params.exerciseId);
  return res.send(exercise);
});

app.post("/create_exercise", async (req, res) => {
  const message = await models.Exercise.create({
    name: req.body.name,
    samples: req.body.samples,
    user: req.body.userId
  });

  return res.send(message);
});

const eraseDatabaseOnSync = true;

connectDb().then(async () => {
  if (eraseDatabaseOnSync) {
    await Promise.all([
      models.User.deleteMany({}),
      models.Exercise.deleteMany({})
    ]);

    createDemoUserWithΕxercise();
  }

  app.listen(process.env.PORT, () =>
    console.log(`Example app listening on port ${process.env.PORT}!`)
  );
});

const createDemoUserWithΕxercise = async () => {
  const user1 = new models.User({
    name: "Dimitris",
    id: mongoose.Types.ObjectId()
  });

  const exercise = new models.Exercise({
    name: "Bicep Curl",
    samples: data.samples,
    stats: {
      reps: 2,
      calories: 68
    },
    user: user1.id
  });

  await exercise.save();
  await user1.save();

  const logger = d => console.log(d);
  findUser(logger);
  findExercise(logger);
};

const findUser = async callback => {
  const users = await models.User.find({}, function(err, docs) {
    if (docs.length == 0) {
      console.log("No record found");
      return callback([]);
    }
    return callback(docs);
  });
  return users;
};

const findExercise = async callback => {
  models.Exercise.find({}, function(err, docs) {
    if (docs.length == 0) {
      console.log("No record found");
      return callback([]);
    }
    return callback(docs);
  });
};

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
app.use(bodyParser.text({ type: "application/json", limit: "50mb" }));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");

  next();
});

// ========================================
// 📱 ANDROID
// ========================================
app.get("/index.html", function(req, res, next) {
  res.sendFile(__dirname + "index.html");
});

// app.post("/save", function(req) {
//   const data = JSON.parse(req.body);

//   fs.writeFile(`./exercise-data/metamotionr-${getTime()}.txt`, data, err => {
//     if (err) throw err;
//     console.log("Exercise quaternion data from MetaMotion R saved!");
//   });
// });

// ========================================
// 👶 users
// ========================================
app.get("/users", async (req, res) => {
  try {
    const users = await models.User.find().exec();
    res.send(users);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/user/:userId", async (req, res) => {
  const id = mongoose.Types.ObjectId(req.params.userId.trim());
  const user = await models.User.findById(id)
    .populate("exercises")
    .exec();

  return res.send(user);
});

app.post("/user", async (req, res) => {
  try {
    const body = JSON.parse(req.body);
    const { name } = body;

    const user = new models.User({
      name
    });

    await user.save();

    res.sendStatus(200);
  } catch (error) {
    console.log(error);

    res.sendStatus(500);
  }
});

// ========================================
// 🏋️‍♀️exercises
// ========================================
app.get("/exercises", async (req, res) => {
  try {
    const exercises = await models.Exercise.find();

    res.send(
      exercises.map(exercise => ({
        name: exercise.name,
        id: exercise._id,
        numOfSamples: exercise.samples.length
      }))
    );
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/exercise/:exerciseId", async (req, res) => {
  const exercise = await models.Exercise.findById(req.params.exerciseId);
  return res.send(exercise);
});

app.post("/exercise", async (req, res) => {
  try {
    const users = await models.User.find({ name: "Mr. Dimitriou" }).exec();
    const user = users[0];

    const exercise = new models.Exercise({
      name: "Curls",
      samples: [],
      reps: Math.round(Math.random() * 10),
      calories: Math.round(Math.random() * 100),
      user: user._id
    });

    user.exercise = exercise._id;

    await exercise.save();
    await user.save();

    res.send(exercise._id);

    console.log("🏋️‍♀️ Exercise created");
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

app.put("/exercise", async (req, res) => {
  try {
    const body = JSON.parse(req.body);
    const { samples, id } = body;

    const exercise = await models.Exercise.findById(id);
    exercise.samples = [...exercise.samples, ...samples];
    exercise.save();

    res.sendStatus(200);
    console.log(
      "💪 Append " + samples.length + " samples to the exercise " + id
    );
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

app.delete("/exercise/:exerciseId", async (req, res) => {
  try {
    await models.Exercise.deleteOne({
      _id: req.params.exerciseId
    });

    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

// ========================================
// CONNECT DATABASE
// ========================================

const ERASE_DATABSE_ON_SYNC = false;

connectDb().then(async () => {
  if (ERASE_DATABSE_ON_SYNC) {
    await Promise.all([
      models.User.deleteMany({}),
      models.Exercise.deleteMany({})
    ]);
  }

  // await Promise.all([
  //   models.Exercise.deleteMany({name: "Curls"})
  // ]);
  // await createDemoUserWithΕxercise();

  const logger = d => console.log(d);
  findUser(logger);
  findExercise(logger);

  app.listen(process.env.PORT, () =>
    console.log(`Example app listening on port ${process.env.PORT}!`)
  );
});

const createDemoUserWithΕxercise = async () => {
  const user = new models.User({
    name: "Dimitris"
  });

  const user2 = new models.User({
    name: "John"
  });

  const exercise = new models.Exercise({
    name: "Bicep Curl",
    samples: data.samples,
    reps: 2,
    calories: 68,
    user: user.id
  });

  await user.save();
  await exercise.save();
  await user2.save();

  return;
};

const findUser = async callback => {
  const users = await models.User.find({}, function(err, docs) {
    if (docs.length == 0) {
      console.log("No record found");
      return callback([]);
    }
    return callback(docs.map(doc => doc._id));
  });
  return users;
};

const findExercise = async callback => {
  models.Exercise.find({}, function(err, docs) {
    if (docs.length == 0) {
      console.log("No record found");
      return callback([]);
    }
    return callback(docs.map(doc => doc._id));
  });
};

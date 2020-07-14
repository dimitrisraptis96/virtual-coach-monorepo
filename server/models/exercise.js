import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema({
  name: String,
  samples: [
    {
      x: Number,
      y: Number,
      z: Number,
      w: Number,
      timestamp: String,
    },
  ],
  metrics: {
    reps: Number,
    energy: Number,
    calories: Number,
    power: Number,
  },
  positions: [
    {
      x: Number,
      y: Number,
      z: Number,
      w: Number,
      timestamp: String,
    },
  ],
  minTheta: Number,
  rangeTheta: Number,
  duration: Number,
  type: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  creationTime: { type: Date, default: Date.now },
});

const Exercise = mongoose.model("Exercise", exerciseSchema);

export default Exercise;

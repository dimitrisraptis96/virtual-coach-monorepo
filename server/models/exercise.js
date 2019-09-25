import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema({
  name: String,
  samples: [
    {
      x: Number,
      y: Number,
      z: Number,
      w: Number,
      timestamp: String
    }
  ],
  reps: Number,
  calories: Number,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  creationTime: { type: Date, default: Date.now }
});

const Exercise = mongoose.model("Exercise", exerciseSchema);

export default Exercise;

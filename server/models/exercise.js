import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String
  },
  samples: [
    {
      x: Number,
      y: Number,
      z: Number,
      w: Number,
      timestamp: String
    }
  ],
  stats: {
    reps: Number,
    calories: Number
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

const Exercise = mongoose.model("Exercise", exerciseSchema);

export default Exercise;

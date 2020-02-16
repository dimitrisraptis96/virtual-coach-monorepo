import mongoose from "mongoose";

const calibrationSchema = new mongoose.Schema({
  end: [
    {
      x: Number,
      y: Number,
      z: Number,
      w: Number
    }
  ],
  start: [
    {
      x: Number,
      y: Number,
      z: Number,
      w: Number
    }
  ],
  creationTime: { type: Date, default: Date.now }
});

const Calibration = mongoose.model("Calibration", calibrationSchema);

export default Calibration;

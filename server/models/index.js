import mongoose from "mongoose";

import User from "./user";
import Exercise from "./exercise";
import Calibration from "./calibration";

const connectDb = () => {
  return mongoose.connect(process.env.DATABASE_URL);
};

const models = { User, Exercise, Calibration };

export { connectDb };

export default models;

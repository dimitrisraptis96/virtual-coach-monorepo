import mongoose from "mongoose";

import User from "./user";
import Exercise from "./exercise";

const connectDb = () => {
  return mongoose.connect(process.env.DATABASE_URL);
};

const models = { User, Exercise };

export { connectDb };

export default models;

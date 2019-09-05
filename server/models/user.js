import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  exercises: [{ type: mongoose.Schema.Types.ObjectId, ref: "Exercise" }]
});

userSchema.pre("remove", function(next) {
  this.model("Exercise").deleteMany({ user: this._id }, next);
});

const User = mongoose.model("User", userSchema);

export default User;

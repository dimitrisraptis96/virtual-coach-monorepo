import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: false,
    required: true
  }
});

userSchema.pre("remove", function(next) {
  this.model("Exercise").deleteMany({ user: this._id }, next);
});

const User = mongoose.model("User", userSchema);

export default User;

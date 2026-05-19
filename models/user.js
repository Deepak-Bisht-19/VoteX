const e = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

//define the user schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
  },
  mobile: {
    type: String,
    required: true,
    match: /^\d{10}$/, //mobile number should be 10 digits
  },
  address: {
    type: String,
    required: true,
  },
  aadharCardNumber: {
    type: Number,
    required: true,
    unique: true,
    match: /^\d{12}$/, //aadhar card number should be 12 digits
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "voter"],
    default: "voter",
  },
  isVoted: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ["active", "inactive", "expired"],
    default: "active",
  },
  validTill: {
    type: Date,
  },
});

userSchema.pre("save", async function () {
  const user = this;

  //hash the the password if it has been modified (or is new)
  if (!user.isModified("password")) return;
  try {
    //hash password generation
    const salt = await bcrypt.genSalt(10);

    // hadh password
    const hashedPassword = await bcrypt.hash(user.password, salt);

    //override the plain psssword with the hashed password
    user.password = hashedPassword;
  } catch (err) {
    return err;
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    //  use bcrypt to copare the provided password with the hashed passwor
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
  } catch (err) {
    throw err;
  }
};

const User = mongoose.model("User", userSchema);
module.exports = User;

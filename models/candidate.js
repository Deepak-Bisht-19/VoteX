const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

//define the candidate schema
const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  party: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  election: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Election",
    required: true,
  },
  votes: {
    type: Number,
    default: 0,
  },
  voteCount: {
    type: Number,
    default: 0,
  },
},
  {
  timestamps: true
});

const Candidate = mongoose.model("Candidate", candidateSchema);
module.exports = Candidate;

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// define the election schema
const electionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    position: {
        type: String,
        required: true,
    },
    electionLevel: {
      type: String,
        enum: ["national", "state", "district"],
      required: true,
    },
    location: {
        country: {
            type: String,
            default: "India",
        },
        state: {
            type: String,
        },
        district: {
            type: String,
        }
    },
    description: {
        type: String,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ["upcoming", "active", "completed"],
        default: "upcoming"
    },
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Candidate",
    },
    winnerName: {
        type: String,
    },
    winningVotes: {
        type: Number,
        default: 0,
    },
    completedAt: {
        type: Date,
    }
},
    {
        timestamps: true
    
});

const Election = mongoose.model("Election", electionSchema);
module.exports = Election;
const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { normalizeText } = require("../utils/normalize");
const { jwtAuthMiddleware, generateToken } = require("../middleware/jwt");
const Candidate = require("../models/candidate");
const adminMiddleware = require("../middleware/adminMiddleware");
const Election = require("../models/election");
const multer = require("multer");

// set up multer to sore files in upload folder
/*const storage = multer.diskStorage({
  destination: (req, file, cb) =>{
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const suffix = Date.now();
  cb(null, suffix + "_" + file.originalname);
  }
})*/

//configure multer to store file in memory as buffer
const storage = multer.memoryStorage();

const upload = multer({ storage });

const checkAdmimRole = async (userID) => {
  try {
    const user = await User.findById(userID);
    if (user.role === "admin") {
      return true;
    }
  } catch (err) {
    return false;
  }
};

// POST route to add a candidate
router.post(
  "/",
  jwtAuthMiddleware,
  adminMiddleware,
  upload.single("logo"),
  async (req, res) => {
    try {
      const data = req.body; //assuming the request body contains the candidate data

      // Save uploaded logo path
      // data.logo = req.file ? req.file.path : null;

      const photoBase64 = req.file ? req.file.buffer.toString("base64") : null;
      data.logo = photoBase64;

      data.name = normalizeText(data.name);

      if (data.party) {
        data.party = normalizeText(data.party);
      }
      const existingCandidate = await Candidate.findOne({
        name: normalizeText(data.name),

        election: data.election,
      });

      if (existingCandidate) {
        return res.status(403).json({
          message: "Candidate already exists in this election",
        });
      }
      //create a new candidate document using the mongoose model
      const newCandidate = new Candidate(data);

      //save the new candidate to the database
      const response = await newCandidate.save();
      console.log("candidate data saved");

      const payload = {
        id: response.id,
      };
      console.log(JSON.stringify(payload));
      const token = generateToken(payload);
      console.log("Token is : ", token);
      res.status(200).json({ response: response });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "internl server error" });
    }
  },
);

// PUT route to update a candidate
router.put(
  "/update/:candidateID",
  jwtAuthMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const data = req.body;

      const candidateID = req.params.candidateID; //extract the id from the url parameter
      const updateCandidateData = req.body; //update data for the candidate

      const response = await Candidate.findByIdAndUpdate(
        candidateID,
        updateCandidateData,
        {
          new: true, //return the updated document
          runValidators: true, //run mongoose validation
        },
      );

      if (!response) {
        return res.status(404).json({ error: "Candidate not found" });
      }

      console.log("Candidate data updated");
      res.status(200).json(response);
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "internl server error" });
    }
  },
);

// DELETE route to delete a candidate
router.delete(
  "/delete/:candidateID",
  jwtAuthMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const data = req.body;

      const candidateID = req.params.candidateID; //extract the id from the url parameter
      const updateCandidateData = req.body; //delete data of the candidate
      const response = await Candidate.findByIdAndDelete(candidateID);

      if (!response) {
        return res.status(404).json({ error: "Candidate not found" });
      }

      console.log("Candidate data deleted");
      res.status(200).json(response);
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "internl server error" });
    }
  },
);

// POST route for voting
router.post("/vote/:candidateID", jwtAuthMiddleware, async (req, res) => {
  const session = await Candidate.startSession();

  try {
    session.startTransaction();

    // Step 1: find user
    const user = await User.findById(req.user.id).session(session);

    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({
        message: "user not found",
      });
    }

    if (user.role !== "voter") {
      await session.abortTransaction();
      return res.status(403).json({
        message: "user is not a voter",
      });
    }

    if (user.status !== "active") {
      await session.abortTransaction();
      return res.status(403).json({
        message: "account not active",
      });
    }

    // Step 2: find candidate
    const candidate = await Candidate.findById(req.params.candidateID).session(
      session,
    );

    if (!candidate) {
      await session.abortTransaction();
      return res.status(404).json({
        message: "candidate not found",
      });
    }

    // Step 3: find election
    const election = await Election.findById(candidate.election).session(
      session,
    );

    if (!election) {
      await session.abortTransaction();
      return res.status(404).json({
        message: "election not found",
      });
    }

    // Step 4: check voter eligibility
    let eligible = false;

    // National election
    if (election.electionLevel === "national") {
      const userCountry = normalizeText(user.location?.country || "");

      const electionCountry = normalizeText(election.location?.country || "");

      eligible = userCountry === electionCountry;
    }

    // State election
    else if (election.electionLevel === "state") {
      const userState = normalizeText(user.location?.state || "");

      const electionState = normalizeText(election.location?.state || "");

      eligible = userState === electionState;
    }

    // District election
    else if (election.electionLevel === "district") {
      const userState = normalizeText(user.location?.state || "");

      const electionState = normalizeText(election.location?.state || "");

      const userDistrict = normalizeText(user.location?.district || "");

      const electionDistrict = normalizeText(election.location?.district || "");

      eligible =
        userState === electionState && userDistrict === electionDistrict;
    }

    // Step 5: block ineligible voter
    if (!eligible) {
      await session.abortTransaction();

      return res.status(403).json({
        message: "You are not eligible for this election",
      });
    }

    // Step 6: check election dates
    const now = new Date();

    if (now < election.startDate) {
      await session.abortTransaction();

      return res.status(403).json({
        message: "election not started",
      });
    }

    if (now > election.endDate) {
      await session.abortTransaction();

      return res.status(403).json({
        message: "election has ended",
      });
    }

    // Step 7: check election status
    if (election.status === "completed") {
      await session.abortTransaction();

      return res.status(403).json({
        message: "election completed",
      });
    }

    // Step 8: check if user already voted
    if (user.votedElections.includes(election._id)) {
      await session.abortTransaction();

      return res.status(403).json({
        message: "user has already voted for this election",
      });
    }

    // Step 9: increment candidate vote
    candidate.voteCount += 1;

    await candidate.save({ session });

    // Step 10: store election in user's votedElections
    user.votedElections.push(election._id);

    await user.save({ session });

    // Step 11: commit both changes together
    await session.commitTransaction();

    // Step 12: socket live vote update
    const io = req.app.get("io");

    if (io) {
      io.emit("voteUpdate", {
        candidateId: candidate._id,
        candidateName: candidate.name,
        voteCount: candidate.voteCount,
        electionId: election._id,
      });
    }

    res.status(200).json({
      message: "vote cast successfully",
      votedFor: candidate.name,
    });
  } catch (err) {
    await session.abortTransaction();

    console.log(err);

    res.status(500).json({
      error: "internal server error",
    });
  } finally {
    session.endSession();
  }
});

// GET route for result
router.get("/result", async (req, res) => {
  try {
    const results = await Candidate.find().sort({ voteCount: -1 });
    res.status(200).json(results);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
});

// GET route to see winner
router.get("/winner", async (req, res) => {
  try {
    const winner = await Candidate.findOne().sort({ voteCount: -1 });
    if (!winner) {
      return res.status(404).json({ message: "no candidates found" });
    }
    res.status(200).json(winner);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { normalizeText } = require("../utils/normalize");
const { jwtAuthMiddleware, generateToken } = require("../middleware/jwt");
const Candidate = require("../models/candidate");
const adminMiddleware = require("../middleware/adminMiddleware");

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
router.post("/", jwtAuthMiddleware, adminMiddleware, async (req, res) => {
  try {
    const data = req.body; //assuming the request body contains the candidate data
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
});

// PUT route to update a candidate
router.put("/update/:candidateID", jwtAuthMiddleware, adminMiddleware, async (req, res) => {
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
});

// DELETE route to delete a candidate
router.delete("/delete/:candidateID", jwtAuthMiddleware, adminMiddleware, async (req, res) => {
  try {
    const data = req.body; 

    const candidateID = req.params.candidateID; //extract the id from the url parameter
    const updateCandidateData = req.body; //delete data of the candidate
    const response = await Candidate.findByIdAndDelete(candidateID);

    if (!response) {
      return res.status(403).json({ error: "Candidate not found" });
    }

    console.log("Candidate data deleted");
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internl server error" });
  }
});

// POST route for voting
router.post("/vote/:candidateID", jwtAuthMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    if (user.role !== "voter") {
      return res.status(403).json({ message: "user is not a voter" });
    }

    if (user.status !== "active") {
      return res.status(403).json({ message: "account not active" });
    }
    if (user.location !== election.location) {
      return res.status(403).json({ message: "you cannot vote in this area election" });
    }

    // step to cast vote for the candidate
    // step:1 find the candidate by id from the url parameter
    const candidate = await Candidate.findById(req.params.candidateID);

    if (!candidate) {
      return res.status(404).json({ message: "candidate not found" });
    }

    // step 2: find election by id and check if election is active
    const election = await Election.findById(candidate.election);

    let eligible = false;

    // national election
    if (election.electionLevel === "national") {
      const userCountry = normalizeText(user.location.country);
      const electionCountry = normalizeText(election.location.country);

      eligible = userCountry === electionCountry;
    }

    // state level election
    else if (election.electionLevel === "state") {
      const userState = normalizeText(user.location.state);
      const electionState = normalizeText(election.location.state);

      eligible = userState === electionState;
    }

    // district level election
    else if (election.electionLevel === "district") {
      const userState = normalizeText(user.location.state);
      const electionState = normalizeText(election.location.state);
      const userDistrict = normalizeText(user.location.district);
      const electionDistrict = normalizeText(election.location.district);

      eligible =
        userState === electionState && userDistrict === electionDistrict;
    }

    // block if not eligible
    if (!eligible) {
      return res.status(403).json({ message: "You are not eligible for this election",});
    }

    if (!election) { return res.status(404).json({ message: "election not found" });
    }
    const now = new Date();

    if (now < election.startDate) {
      return res.status(404).json({ message: "election not started" });
    }
    if (now > election.endDate) {
      return res.status(403).json({ message: "election has ended" });
    }
    if (election.status === "completed") {
      return res.status(403).json({ message: "election completed" });
    }

    //  step 3: check if the user has already voted for this election
    const alreadyVoted = user.votedElections.includes(election._id);
    if (alreadyVoted) {
      return res
        .status(403)
        .json({ message: "user has already voted for this election" });
    }

    // step 4: increment the vote count for the candidate
    candidate.voteCount += 1;
    await candidate.save();

    // socket live votes
    const io = req.app.get("io");
    io.emit("voteUpdate", {
      candidateId: candidate._id,
      candidateName: candidate.name,
      voteCount: candidate.voteCount,
      electionId: election._id,
    });

    // step 5: store the election id in the user's votedElections array to prevent multiple votes for the same election
   user.votedElections.push(election._id);
    await user.save();

    res.status(200).json({
      message: "vote cast successfully",
      votedFor: candidate.name,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
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

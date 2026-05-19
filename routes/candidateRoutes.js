const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { jwtAuthMiddleware, generateToken } = require("../jwt");
const Candidate = require("../models/candidate");

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
router.post("/", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdmimRole(req.user.id)))
      return res.status(403).json({ message: "user is not admin" });

    const data = req.body; //assuming the request body contains the candidate data

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
router.put("/:candidateID", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!checkAdmimRole(req.user.id))
      return res.status(403).json({ message: "user is not admin" });

    const candidateID = req.params.candidateID; //extract the id from the url parameter
    const updateCandidateData = req.body; //update data for the person

    const response = await candidate.findByIdAndUpdate(
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
router.delete("/:candidateID", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!checkAdmimRole(req.user.id))
      return res.status(404).json({ message: "user is not admin" });

    const candidateID = req.params.candidateID; //extract the id from the url parameter
    const updateCandidateData = req.body; //delete data of the candidate
    const response = await candidate.findByIdAndDelete(candidateID);

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

    if (user.isVoted) {
      return res.status(403).json({ message: "user has already voted" });
    }

    // step to cast vote for the candidate
    // step:1 find the candidate by id from the url parameter
    const candidate = await Candidate.findById(req.params.candidateID);

    if (!candidate) {
      return res.status(404).json({ message: "candidate not found" });
    }
     
    // step 2: mark the user as voted
    user.isVoted = true;
    await user.save();

    // step 3: increment the vote count for the candidate
    candidate.voteCount += 1;
    
    // store vote time
    candidate.votes.push({});
     await candidate.save();

    res.status(200).json({ message: "vote cast successfully" , votedFor: candidate.name, totalVotes: candidate.voteCount});
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

const express = require("express");
const router = express.Router();
const Election = require("../models/election");
const { jwtAuthMiddleware, generateToken } = require("../middleware/jwt");
const adminMiddleware = require("../middleware/adminMiddleware");
const Candidate = require("../models/candidate");

// POST route to create a new election
router.post("/create", jwtAuthMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { normalizeText } = require("../utils/normalize");
    const existingElection = await Election.findOne({
      title: normalizeText(req.body.title),
      electionLevel: req.body.electionLevel,
      "location.state": normalizeText(req.body.location?.state),
      "location.district": normalizeText(req.body.location?.district),
    });

    if (existingElection) {
      return res.status(403).json({
        message: "Election already exists",
      });
    }
    req.body.title = normalizeText(req.body.title);

    if (req.body.location?.country) {
      req.body.location.country = normalizeText(req.body.location.country);
    }

    if (req.body.location?.state) {
      req.body.location.state = normalizeText(req.body.location.state);
    }

    if (req.body.location?.district) {
      req.body.location.district = normalizeText(req.body.location.district);
    }
    const election = new Election(req.body);
    const response = await election.save();

    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({error: "Internal server error",});
  }
});

// GET route to get all elections
router.get("/", async (req, res) => {
  try {
    const elections = await Election.find();

    res.status(200).json(elections);
  } catch (error) {
    console.log(error);

    res.status(500).json({error: "Internal server error",});
  }
});

// GET route to get a single election by id
router.get("/:id", async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ error: "Election not found" });
    }
    res.status(200).json(election);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET candidates of a particular election
router.get("/:electionID/candidate", async (req, res) => {
    try {
      const candidates = await Candidate.find({election: req.params.electionID});
      res.status(200).json(candidates);

    } catch (err) {
      console.log(err);
      res.status(500).json({error: "internal server error"});
    }
});

// put route to complete election
router.put("/complete/:electionId",jwtAuthMiddleware,adminMiddleware,async (req, res) => {
   try {
      const election =
      await Election.findById(
         req.params.electionId
      );
      if (!election) {
         return res.status(404).json({
            message:
            "Election not found"
         });
      }

      // find winner
      const winner =
      await Candidate.findOne({
         election: election._id
      }).sort({ voteCount: -1 });
      if (!winner) {
         return res.status(404).json({
            message:
            "No candidates found"
         });
      }

      // store results in election document
      election.status = "completed";
      election.winner = winner._id;
      election.winnerName =
      winner.name;
      election.winningVotes =
      winner.voteCount;
      election.completedAt = new Date();

      await election.save();
      res.status(200).json({message:"Election completed", winner: winner.name, votes: winner.voteCount
      });

   } catch (error) {
      console.log(error);
      res.status(500).json({
         error:
         "Internal server error"
      });
   }
  });

  // GET route to get election history
router.get("/history",async (req, res) => {
    try {
        const history =
        await Election.find({
            status: "completed"
        })
        .populate(
            "winner",
            "name party"
        )
        .sort({ completedAt: -1 });
      const formattedHistory = history.map((election) => {
        return {
                electionId:
                election._id,

                title:
                election.title,

                position:
                election.position,

                area:
                election.area,

                startDate:
                election.startDate,

                endDate:
                election.endDate,

                completedAt:
                election.completedAt,

                winner:
                election.winner
                ? {
                    id:
                    election.winner._id,

                    name:
                    election.winner.name,

                    party:
                    election.winner.party
                  }
              : null,
                
                winningVotes:
                election.winningVotes
            };
        });

        res.status(200).json(
            formattedHistory
        );

    } catch (error) {
        console.log(error);
        res.status(500).json({
            error:
            "Internal server error"
        });
    }
});

module.exports = router;
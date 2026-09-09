const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { jwtAuthMiddleware, generateToken } = require("../middleware/jwt");
const adminMiddleware = require("../middleware/adminMiddleware");

// POST route to create a single admin
router.post("/signup-admin", async (req, res) => {
  try {
    // check if admin already exists
    const adminExists = await User.findOne({
      role: "admin",
    });

    if (adminExists) {
      return res.status(400).json({
        message: "admin already exists",
      });
    }

    // secret admin key
    if (req.body.adminKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(403).json({
        message: "invalid admin secret key",
      });
    }

    const adminData = req.body;
    adminData.role = "admin";
    adminData.status = "active";
    adminData.validTill = new Date("2099-12-31");

    // Remove admin key from the admin data before saving to the database
    delete adminData.adminKey;

    const newAdmin = new User(adminData);
    const response = await newAdmin.save();

    console.log("admin data saved");

    const payload = {
      id: response.id,
    };
    console.log(JSON.stringify(payload));
    const token = generateToken(payload);
    console.log("Token is : ", token);
    res.status(200).json({ response: response, token: token });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "internal server error",
    });
  }
});

// GET rout to get all referification requests
router.get(
  "/reverification-requests",
  jwtAuthMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const admin = await User.find({ reverificationRequested: true });

      res.status(200).json(admin);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "internal server error" });
    }
  },
);

// PUT rout to approve voter reverification request
router.put(
  "/approve-reverification/:id",
  jwtAuthMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "user not found" });
      }

      user.validTill = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      user.status = "active";

      user.reverificationRequested = false;
      await user.save();
      res.sendStatus(200).json({ message: "User reverification approved" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "internal server error" });
    }
  },
);

// PUT route to permanently block user
router.put(
  "/permanent-block/:id",
  jwtAuthMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({ message: "user not found" });
      }

      // prevent the admin from permanently blocking himself
      if (user.role === admin) {
        return res
          .status(403)
          .json({ message: "admin cannot be permanentyly blocked " });
      }

      user.status = "permanently blocked";
      user.reverificationRequested = false;
      await user.save();
      res.status(200).json({ message: "user permanently blocked" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "internal server error" });
    }
  },
);

// PUT route to deactivate inactive voters(user's)
router.put("/deactivate/:id", jwtAuthMiddleware, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);

    if (admin.role !== "admin") {
      return res.status(403).json({ message: "user is not admin" });
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    // prevent the admin to deactivate himself
    if (user.id === admin.id) {
      return res
        .status(403)
        .json({ message: "admin cannot deactivate himself" });
    }
    user.status = "inactive";
    await user.save();
    res.status(200).json({ message: "user deactivated successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
});

// PUT route to reactivate inactive voters(user's)
router.put("/reactivate/:id", jwtAuthMiddleware, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);

    if (admin.role !== "admin") {
      return res.status(403).json({ message: "user is not admin" });
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    // prevent the admin from reactivating himself
    if (user._id.toString() === admin._id.toString()) {
      return res
        .status(403)
        .json({ message: "admin cannot reactivate himself" });
    }
    user.status = "active";
    await user.save();
    res.status(200).json({ message: "user reactivated successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
});

module.exports = router;

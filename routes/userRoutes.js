const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { jwtAuthMiddleware, generateToken } = require("../jwt");

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
    adminData.isActive = true;

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

// POST route to add a user
router.post("/signup", async (req, res) => {
  try {
    const data = req.body; //assuming the request body contains the user data

    // mobile number should be 10 digits
     if (!/^\d{10}$/.test(data.mobile)) {
       return res.status(400).json({
         message: "mobile number should be 10 digits",
       });
     }

    // aadhar card number should be 12 digits
    if (!/^\d{12}$/.test(data.aadharCardNumber)) {
      return res.status(400).json({
        message: "aadhar card number should be 12 digits",
      });
    }
    data.role = "voter"; // set default role as voter for all new users
    data.status = "active"; // set default status as active for all new users

    delete data.validTill; // remove expired user
    const currentDate = new Date(); // set valid till date as 5 year from current date
    currentDate.setFullYear(currentDate.getFullYear() + 5);
    data.validTill = currentDate;

    //create a new user document using the mongoose model
    const newUser = new User(data);

    //save the new user to the databadse
    const response = await newUser.save();
    console.log("user data saved");

    const payload = {
      id: response.id,
    };
    console.log(JSON.stringify(payload));
    const token = generateToken(payload);
    console.log("Token is : ", token);
    res.status(200).json({ response: response, token: token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
});

// POST route for user login
router.post("/login", async (req, res) => {
  try {
    // extract aadharCardNumber and password form request body
    const { aadharCardNumber, password } = req.body;

    // find the user by aadharCardNumber
    const user = await User.findOne({ aadharCardNumber: aadharCardNumber });

    // if user does not exist or password does not match, return error
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "invalid username or password" });
    }

    // inactive account check
    if (user.status !== "active") {
      return res.status(403).json({
        message: "account not active",
      });
    }

    // validity expiry check
    if (new Date() > user.validTill) {
      user.status = "expired";

      await user.save();

      return res.status(403).json({
        message: "account expired",
      });
    }

    // generate token
    const payload = {
      id: user.id,
    };
    const token = generateToken(payload);

    // return token as response
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET route to view user profile
router.get("/profile", jwtAuthMiddleware, async (req, res) => {
  try {
    const userData = req.user;
    const userId = userData.id;
    const user = await User.findById(userId);
    res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PUT route to update user password
router.put("/profile/password", jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; //extract the id from the token
    const { currentPassword, newPassword } = req.body; // extract current and new password from request body

    // find the user by userID
    const user = await User.findById(userId);

    // if password does not match, return error
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ error: "invalid username or password" });
    }

    // update the user's password
    user.password = newPassword;
    const response = await user.save();

    console.log("password updated");
    res.status(200).json({ message: "password updated successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
});



// PUT route to deactivate inactive voters(user's)
router.put("/admin/deactivate/:id", jwtAuthMiddleware, async (req, res) => {
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
      return res.status(403).json({ message: "admin cannot deactivate himself" });
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
router.put("/admin/reactivate/:id", jwtAuthMiddleware, async (req, res) => {
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
      return res.status(403).json({ message: "admin cannot reactivate himself" });
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
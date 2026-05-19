require("dotenv").config();
const express = require("express");
const app = express();
const db = require("./db");

const bodyParser = require("body-parser");
app.use(bodyParser.json()); //request.body me data store karega
const PORT = process.env.PORT || 3000;

//import the rouer files
const userRoutes = require("./routes/userRoutes");
const candidateRoutes = require("./routes/candidateRoutes");

//use the routers
app.use("/user", userRoutes);
app.use("/candidate", candidateRoutes);

app.listen(PORT, () => {
  console.log("Server is running...");
});

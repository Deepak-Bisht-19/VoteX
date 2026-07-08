require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");

const app = express();
const server = http.createServer(app);
const db = require("./db");

app.use(bodyParser.json()); //request.body me data store karega

// socket io setup
const io = new Server(server, {
  cors: {
    origin: "*"
  },
});

io.on("connection", (socket) => {
  console.log("user connected");

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

// make io globally available
app.set("io", io);
app.use(express.json()); //json data ko parse karne ke liye middleware use karna padega

// home route
app.get("/", (req, res) => {
  res.send("🚀 VoteX Backend API is running successfully!");
});

//import the rouer files
const userRoutes = require("./routes/userRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const electionRoutes = require("./routes/electionRoutes");
const adminRoutes = require("./routes/adminRoutes");

//use the routers
app.use("/user", userRoutes);
app.use("/candidate", candidateRoutes);
app.use("/election", electionRoutes);
app.use("/admin", adminRoutes);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server is running...");
});

require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
const server = http.createServer(app);
const db = require("./db");

app.use(cors()); //cors middleware use karna padega
app.use(bodyParser.json()); //request.body me data store karega
app.use(express.json()); //json data ko parse karne ke liye middleware use karna padega

// socket io setup
const io = new Server(server, {
  cors: {
    origin: "*",
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

// Serve React frontend
const frontendPath = path.join(__dirname, "../votex-frontend/dist");

app.use(express.static(frontendPath));

// Handle React routes
app.use((req, res, next) => {
  if (
    req.method === "GET" &&
    !req.path.startsWith("/user") &&
    !req.path.startsWith("/candidate") &&
    !req.path.startsWith("/election") &&
    !req.path.startsWith("/admin")
  ) {
    return res.sendFile(path.join(frontendPath, "index.html"));
  }

  next();
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server is running...");
});

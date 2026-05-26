const io = require("socket.io-client");

const socket = io("http://localhost:3000");

socket.on("connect", () => {
  console.log("Connected to server");
});

socket.on("voteUpdate", (data) => {
  console.log("\nLIVE VOTE UPDATE");

  console.log(data);
});

socket.on("disconnect", () => {
  console.log("Disconnected");
});

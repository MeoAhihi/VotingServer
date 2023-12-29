const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const app = express();
app.use(express.static("D:\\VotingServer"));
app.use(cookieParser());

const server = http.createServer(app);
const io = socketIO(server);
const client = mongoose.connect("mongodb://127.0.0.1:27017/voting").then(() => {
  console.log("MongoDB connected");
});

const ticketSchema = {
  time: { type: Date, default: Date.now },
  candidate: "String",
  type: "String",
  key: "String",
};
const Ticket = mongoose.model("Ticket", ticketSchema);

// Set up a route for the root URL
app.get("/", (req, res) => {
  res.cookie("vote-auth", req.ip);
  res.cookie("vote", req.ip + "as");
  res.sendFile("D:\\VotingServer\\wait.html");
});
app.get("/king", (req, res) => {
  res.sendFile("D:\\VotingServer\\king.html");
});
app.get("/queen", (req, res) => {
  res.sendFile("D:\\VotingServer\\queen.html");
});

app.get("/host", (req, res) => {
  res.sendFile("D:\\VotingServer\\hostNav.html");
});
app.get("/hostKing", (req, res) => {
  res.sendFile("D:\\VotingServer\\hostKing.html");
});
app.get("/hostQueen", (req, res) => {
  res.sendFile("D:\\VotingServer\\hostQueen.html");
});

// Set up a connection event for new socket connections
io.on("connection", (socket) => {
  console.log("A user connected");

  // Set up a custom event for handling messages
  socket.on("host-init", async () => {
    const agg = [
      {
        $project: {
          candidate: 1,
          _id: 0,
        },
      },
      {
        $group: {
          _id: "$candidate",
          vote: {
            $count: {},
          },
        },
      },
    ];
    const res = await Ticket.aggregate(agg);

    io.emit("updateVoting", res);
  });

  socket.on("vote", (time, candidate, type, key) => {
    const data = { time, candidate, type, key };
    const ticket = new Ticket(data);
    ticket.save().then(async () => {
      console.log(ticket);
      const agg = [
        {
          $project: {
            candidate: 1,
            _id: 0,
          },
        },
        {
          $group: {
            _id: "$candidate",
            vote: {
              $count: {},
            },
          },
        },
      ];
      const res = await Ticket.aggregate(agg);

      io.emit("updateVoting", res);
    });
  });

  // Set up a disconnect event
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });

  socket.on("switch to King", () => {
    console.log("to King");
    io.emit("to King");
  });

  socket.on("switch to Queen", () => {
    console.log("to Queen");
    io.emit("to Queen");
  });
});

// Start the server on port 3000
const PORT = process.env.PORT || 3030;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

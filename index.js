const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const uri = "mongodb+srv://phonglv124010121062:C3YxdMT4XXQnFEXV@voteprompt.cftte1i.mongodb.net/voting?retryWrites=true&w=majority"

const app = express();
app.use(express.static("/home/ubuntu/VotingServer"));
app.use(cookieParser());
app.use(express.json());

const server = http.createServer(app);
const io = socketIO(server);
const client = mongoose.connect(uri).then(() => {
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
  res.sendFile("/home/ubuntu/VotingServer/wait.html");
});
app.get("/king", (req, res) => {
  res.sendFile("/home/ubuntu/VotingServer/king.html");
});
app.get("/queen", (req, res) => {
  res.sendFile("/home/ubuntu/VotingServer/queen.html");
});

app.get("/host", (req, res) => {
  res.sendFile("/home/ubuntu/VotingServer/hostNav.html");
});
app.get("/hostKing", (req, res) => {
  res.sendFile("/home/ubuntu/VotingServer/hostKing.html");
});
app.get("/hostQueen", (req, res) => {
  res.sendFile("/home/ubuntu/VotingServer/hostQueen.html");
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
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

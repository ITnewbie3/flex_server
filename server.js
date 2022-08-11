const express = require("express");
const port = 4001;
const app = express();
const index = require("./routes/index")
const cors = require('cors')
app.use(index);
const socketIo = require("socket.io");

const http = require("http");
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
      origin: "http://localhost:3000",
      mathods: ["GET", "POST"]
    },
  });

app.use(express.json());
app.use(cors());
let interval;


// 소켓 문법
io.on("connection", (socket) => {
    console.log("접 속!");
    socket.on('message',({nicname,message}) => {
        io.emit('message',({nicname,message}))
    })
    if (interval) {
      clearInterval(interval);
    }
    interval = setInterval(() => getApiAndEmit(socket), 1000);
    socket.on("disconnect", () => {
      console.log("Client disconnected");
      clearInterval(interval);
    });
  });
  
  const getApiAndEmit = socket => {
    const response = new Date();
    // Emitting a new message. Will be consumed by the client
    socket.emit("FromAPI", response);
  };
  
  server.listen(port, () => console.log(`Listening on port ${port}`));
  
  
  
  //소켓 문법 /
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = createServer(app);
const io = new Server(server);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./index.html"));
});

io.on("connection", (socket) => {
  io.emit("message", `${socket.id} 님이 연결되었습니다.`);

  socket.on("message", (msg) => {
    console.log(`${socket.id}: ${msg}`);
    io.emit("message", `${socket.id}: ${msg}`);
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("message", `${socket.id} 님의 연결이 끊어졌습니다.`);
  });
});

server.listen(8000, () => {
  console.log("http://localhost:8000 에서 서버 구동 중...");
});

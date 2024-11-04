const express = require("express");
const { createServer } = require("http");
const socketHandler = require("./socketHandler");
const path = require("path");

const app = express();

const server = createServer(app);
socketHandler(server);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./index.html"));
});

server.listen(8000, () => {
  console.log("http://localhost:8000 에서 서버 구동 중...");
});

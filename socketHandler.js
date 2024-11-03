const { Server } = require("socket.io");

const socketHandler = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://127.0.0.1:5500", // Adjust this as needed
      methods: ["GET", "POST"],
    },
  });

  let user = {};

  io.on("connection", (socket) => {
    const req = socket.request;
    const socket_id = socket.id;
    const client_ip =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    console.log("connection!");
    console.log("socket ID : ", socket_id);
    console.log("client IP : ", client_ip);

    // 사용자 추가
    user[socket.id] = { nickname: "users nickname", point: 0 };

    // 연결 해제 시 사용자 삭제
    socket.on("disconnect", () => {
      delete user[socket.id];
    });

    // 이벤트 핸들링: 특정 이벤트 발생 시 ID 반환
    socket.on("event1", (msg) => {
      console.log(msg);
      socket.emit("getID", socket.id);
    });

    // 모든 클라이언트에게 메시지 전달
    socket.on("input", (data) => {
      io.emit("msg", { id: socket.id, message: data });
      console.log(user);
    });

    // 본인을 제외한 모든 클라이언트에게 메시지 전달
    socket.on("inputWM", (data) => {
      socket.broadcast.emit("msg", { id: socket.id, message: data });
    });

    // 특정 클라이언트에게 메시지 전달
    socket.on("private", (id, data) => {
      io.to(id).emit("msg", { id: socket.id, message: data });
    });
  });
};

module.exports = socketHandler;

const { Server } = require("socket.io");

const SocketHandler = (server) => {
  const io = new Server(server);

  // 사용자 저장소
  const users = {};

  // 소켓 연결 이벤트 처리
  io.on("connection", (socket) => {
    const req = socket.request;
    const socketId = socket.id;
    const clientIp =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    console.log("connection!");
    console.log("socket ID : ", socketId);
    console.log("client IP : ", clientIp);

    // 접속 알림 전송
    io.emit("message", `${socketId} 님이 연결되었습니다.`);

    // 사용자 추가
    users[socketId] = { nickname: "users nickname", point: 0 };

    // 메시지 수신 및 브로드캐스트
    socket.on("message", (msg) => {
      console.log(`${socketId}: ${msg}`);
      io.emit("message", `${socketId}: ${msg}`);
    });

    // 이벤트 핸들링: 특정 이벤트 발생 시 ID 반환
    socket.on("event1", (msg) => {
      console.log(msg);
      socket.emit("getID", socketId);
    });

    // 모든 클라이언트에게 메시지 전달
    socket.on("input", (data) => {
      io.emit("msg", { id: socketId, message: data });
      console.log(users);
    });

    // 본인을 제외한 모든 클라이언트에게 메시지 전달
    socket.on("inputWM", (data) => {
      socket.broadcast.emit("msg", { id: socketId, message: data });
    });

    // 특정 클라이언트에게 메시지 전달
    socket.on("private", (id, data) => {
      io.to(id).emit("msg", { id: socketId, message: data });
    });

    // 연결 해제 시 사용자 삭제
    socket.on("disconnect", () => {
      socket.broadcast.emit("message", `${socketId} 님의 연결이 끊어졌습니다.`);
      delete users[socketId];
    });
  });

  return io;
};

module.exports = SocketHandler;

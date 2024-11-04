const { Server } = require("socket.io");

class SocketHandler {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: "http://127.0.0.1:5500",
        methods: ["GET", "POST"],
      },
    });

    this.users = {};
    this.initialize();
  }

  initialize() {
    this.io.on("connection", (socket) => {
      this.handleConnection(socket);
    });
  }

  handleConnection(socket) {
    const req = socket.request;
    const socketId = socket.id;
    const clientIp =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    console.log("connection!");
    console.log("socket ID : ", socketId);
    console.log("client IP : ", clientIp);

    // 접속 알림 전송
    this.io.emit("message", `${socketId} 님이 연결되었습니다.`);

    // 사용자 추가
    this.users[socketId] = { nickname: "users nickname", point: 0 };

    // 메시지 수신 및 브로드캐스트
    socket.on("message", (msg) => {
      console.log(`${socketId}: ${msg}`);
      this.io.emit("message", `${socketId}: ${msg}`);
    });

    // 이벤트 핸들링: 특정 이벤트 발생 시 ID 반환
    socket.on("event1", (msg) => {
      console.log(msg);
      socket.emit("getID", socketId);
    });

    // 모든 클라이언트에게 메시지 전달
    socket.on("input", (data) => {
      this.io.emit("msg", { id: socketId, message: data });
      console.log(this.users);
    });

    // 본인을 제외한 모든 클라이언트에게 메시지 전달
    socket.on("inputWM", (data) => {
      socket.broadcast.emit("msg", { id: socketId, message: data });
    });

    // 특정 클라이언트에게 메시지 전달
    socket.on("private", (id, data) => {
      this.io.to(id).emit("msg", { id: socketId, message: data });
    });

    // 연결 해제 시 사용자 삭제
    socket.on("disconnect", () => {
      socket.broadcast.emit("message", `${socketId} 님의 연결이 끊어졌습니다.`);
      delete this.users[socketId];
    });
  }
}

module.exports = SocketHandler;

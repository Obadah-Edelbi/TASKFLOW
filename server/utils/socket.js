let io;
const users = new Map();

export const initSocket = (_io) => {
  io = _io;

  io.on("connection", (socket) => {
    console.log("User connected");

    socket.on("register", (userId) => {
      users.set(userId, socket.id);
    });

    socket.on("disconnect", () => {
      for (let [userId, id] of users.entries()) {
        if (id === socket.id) {
          users.delete(userId);
        }
      }
    });
  });
};

export const sendNotificationToUser = (userId, data) => {
  const socketId = users.get(userId);

  if (socketId && io) {
    io.to(socketId).emit("notification", data);
  }
};

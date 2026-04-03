import express, { json } from "express";
import cors from "cors";
import { connect } from "mongoose";
import dotenv from "dotenv";
import http from "http";
import { WebSocketServer } from "ws";
import path from "path";

import userRoutes from "./routes/user.routes.js";
import taskRoutes from "./routes/task.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import notificationRoutes from "./routes/notification.routes.js";

dotenv.config();

// 🔥 عرف app أول شي
const app = express();

// ================= MIDDLEWARE =================
app.use(json());
app.use(cors());

// 🔥 uploads (مرة وحدة فقط وبعد تعريف app)
app.use("/uploads", express.static("uploads"));

// ================= ROUTES =================
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);

// ================= DB =================
connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error(err));

// ================= SERVER =================
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// ================= SOCKET =================
let clients = {};

wss.on("connection", (ws, req) => {
  const url = new URL(req.url, "http://localhost");
  const userId = url.searchParams.get("userId");

  if (!userId) return;

  ws.userId = userId;
  clients[userId] = [ws];

  console.log("🔌 User connected:", userId);

  ws.on("close", () => {
    delete clients[userId];
  });

  ws.on("message", async (msg) => {
    try {
      const data = JSON.parse(msg);

      if (data.type === "SEND_MESSAGE") {
        const Message = (await import("./models/message.model.js")).default;

        const newMsg = await Message.create({
          sender: data.senderId,
          receiver: data.receiverId,
          text: data.text,
        });

        sendNotificationToUser(data.receiverId, {
          type: "NEW_MESSAGE",
          message: data.text,
          senderId: data.senderId,
        });
      }
    } catch (err) {
      console.error("❌ WS error:", err);
    }
  });
});

// ================= NOTIFICATIONS =================
export function sendNotificationToUser(userId, notification) {
  const userSockets = clients[userId];

  if (!userSockets) return;

  userSockets.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(notification));
    }
  });
}

// ================= START =================
server.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});

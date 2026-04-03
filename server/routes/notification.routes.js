import express from "express";
import Notification from "../models/notification.model.js";
import { authGuard } from "../middleware/auth.middleware.js";

const router = express.Router();

/* ================= GET USER NOTIFICATIONS ================= */
router.get("/", authGuard, async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user.id,
      read: false, // 🔥 فقط unread
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching notifications" });
  }
});

/* ================= MARK AS READ ================= */
router.put("/:id/read", async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id);

    if (!notif) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notif.read = true;
    await notif.save();

    res.json(notif);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating notification" });
  }
});

export default router;

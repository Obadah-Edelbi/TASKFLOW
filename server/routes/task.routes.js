import { Router } from "express";
import Task from "../models/task.model.js";
import { authGuard } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import Notification from "../models/notification.model.js";
import { sendNotificationToUser } from "../server.js";

const router = Router();

/* =====================================================
   Helpers
===================================================== */

const allowedStatus = ["new", "in_progress", "resolved", "rejected"];

const isValidStatus = (status) => allowedStatus.includes(status);

/* =====================================================
   ================= ADMIN ROUTES =====================
===================================================== */

/* Get All Tasks */
router.get("/admin/all", authGuard, requireRole("admin"), async (req, res) => {
  try {
    const tasks = await Task.find()
      .sort({ createdAt: -1 })
      .populate("user", "name email")
      .populate("assignedTo", "name email role");

    res.json({ count: tasks.length, tasks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* Update Task Status */
router.put(
  "/admin/status/:id",
  authGuard,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { status } = req.body;

      if (!isValidStatus(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }

      const task = await Task.findById(req.params.id);
      if (!task) return res.status(404).json({ message: "Task not found" });

      task.status = status;
      await task.save();

      res.json({ message: "Status updated", task });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

/* Assign Task */
router.put(
  "/admin/assign/:id",
  authGuard,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "userId required" });
      }

      const task = await Task.findById(req.params.id);
      if (!task) return res.status(404).json({ message: "Task not found" });

      task.assignedTo = userId;
      await task.save();

      res.json({ message: "Task assigned", task });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

/* Delete Any Task */
router.delete(
  "/admin/:id",
  authGuard,
  requireRole("admin"),
  async (req, res) => {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) return res.status(404).json({ message: "Task not found" });

      await task.deleteOne();

      res.json({ message: "Task deleted by admin" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

/* Add Comment (Admin) */
router.post(
  "/admin/comment/:id",
  authGuard,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { text } = req.body;

      if (!text?.trim()) {
        return res.status(400).json({ message: "Comment required" });
      }

      const task = await Task.findById(req.params.id);
      if (!task) return res.status(404).json({ message: "Task not found" });

      task.comments.push({
        text,
        addedBy: req.user.id,
      });

      await task.save();

      res.json({ message: "Comment added", comments: task.comments });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

/* Admin Statistics */
router.get(
  "/admin/stats",
  authGuard,
  requireRole("admin"),
  async (req, res) => {
    try {
      const total = await Task.countDocuments();

      const grouped = await Task.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]);

      const stats = {
        total,
        new: 0,
        in_progress: 0,
        resolved: 0,
        rejected: 0,
      };

      grouped.forEach((item) => {
        stats[item._id] = item.count;
      });

      res.json(stats);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

/* =====================================================
   ================= USER ROUTES ======================
===================================================== */

/* Create Task */
router.post("/", authGuard, async (req, res) => {
  try {
    const { title, description, priority } = req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description required" });
    }

    const task = await Task.create({
      title,
      description,
      priority: priority || "medium",
      user: req.user.id,
    });

    res.json({ message: "Task created", task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* Get My Tasks */
router.get("/", authGuard, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    res.json({ count: tasks.length, tasks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* Get Single Task */
router.get("/:id", authGuard, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).populate("comments.addedBy", "name email role");

    if (!task) return res.status(404).json({ message: "Task not found" });

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* Update My Task */
router.put("/:id", authGuard, async (req, res) => {
  try {
    const { title, description, priority } = req.body;

    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!task) return res.status(404).json({ message: "Task not found" });

    if (title) task.title = title;
    if (description) task.description = description;
    if (priority) task.priority = priority;

    await task.save();

    res.json({ message: "Task updated", task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* Delete My Task */
router.delete("/:id", authGuard, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!task) return res.status(404).json({ message: "Task not found" });

    await task.deleteOne();

    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= REALTIME FIX ================= */

router.put("/update-status/:id", async (req, res) => {
  console.log("🔥 STATUS UPDATE TRIGGERED");

  try {
    const { status } = req.body;

    const task = await Task.findById(req.params.id).populate("user", "_id");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // تحديث الحالة
    task.status = status;
    await task.save();

    // إنشاء notification
    const notif = await Notification.create({
      user: task.user._id,
      message: `Task updated to ${status}`,
    });

    // 🔥 الحل النهائي (مهم جداً)
    const userId =
      typeof task.user === "object"
        ? task.user._id.toString()
        : task.user.toString();

    console.log("🔥 SENDING NOTIFICATION:", {
      userId,
      status: task.status,
    });

    // إرسال realtime
    sendNotificationToUser(userId, {
      type: "TASK_UPDATED",
      taskId: task._id.toString(),
      status: task.status,
      message: notif.message,
      createdAt: new Date().toISOString(),
      _id: notif._id, // 🔥 مهم جداً
    });

    console.log("✅ Notification sent");

    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating task" });
  }
});

export default router;

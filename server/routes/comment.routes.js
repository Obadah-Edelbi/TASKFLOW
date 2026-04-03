import { Router } from "express";
import Comment from "../models/comment.model.js";
import Task from "../models/task.model.js";
import { authGuard } from "../middleware/auth.middleware.js";
import { sendNotificationToUser } from "../utils/socket.js"; // ✅ مهم

const router = Router();

/*
=========================================
        ADD COMMENT TO TASK
=========================================
*/
router.post("/:taskId", authGuard, async (req, res) => {
  try {
    const { text } = req.body;

    // ✅ تحقق من النص
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    // ✅ تأكد إن التاسك موجود
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // ✅ تأكد من المستخدم
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // ✅ إنشاء الكومنت
    const newComment = await Comment.create({
      task: task._id,
      author: req.user.id,
      text: text.trim(),
    });

    // 🔥 إرسال إشعار (real-time)
    try {
      sendNotificationToUser(task.user.toString(), {
        type: "NEW_COMMENT",
        message: newComment.text,
        taskId: task._id.toString(),
        createdAt: newComment.createdAt,
        _id: newComment._id,
      });
    } catch (err) {
      console.error("Notification error:", err.message);
    }

    res.json(newComment);
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ error: error.message });
  }
});

/*
=========================================
        GET COMMENTS FOR TASK
=========================================
*/
router.get("/:taskId", authGuard, async (req, res) => {
  try {
    const comments = await Comment.find({
      task: req.params.taskId,
    })
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", authGuard, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // ✅ فقط صاحب الكومنت يحذف
    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await comment.deleteOne();

    res.json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.put("/:id", authGuard, async (req, res) => {
  try {
    const { text } = req.body;

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    comment.text = text;
    await comment.save();

    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
/*
=========================================
        UPDATE COMMENT
=========================================
*/
router.put("/:id", authGuard, async (req, res) => {
  try {
    const { text } = req.body;

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // تأكد أنو نفس الشخص
    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    comment.text = text;
    await comment.save();

    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

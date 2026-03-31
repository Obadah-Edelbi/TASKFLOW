import { Router } from "express";
import Comment from "../models/comment.model.js";
import Task from "../models/task.model.js";
import { authGuard } from "../middleware/auth.middleware.js";

const router = Router();

// ===============================================
// 🔹 Add Comment to Task
// ===============================================
router.post("/:taskId", authGuard, async (req, res) => {
  try {
    const { text } = req.body;
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const comment = await Comment.create({
      task: taskId,
      author: req.user.id,
      text,
    });

    res.status(201).json({ message: "Comment added", comment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================================
// 🔹 Get All Comments for Task
// ===============================================
router.get("/:taskId", authGuard, async (req, res) => {
  try {
    const { taskId } = req.params;

    const comments = await Comment.find({ task: taskId })
      .populate("author", "name email role")
      .sort({ createdAt: -1 });

    res.json({ comments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================================
// 🔹 Delete Comment
// ===============================================
router.delete("/:commentId", authGuard, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // فقط صاحب التعليق أو الأدمن يقدر يحذف
    if (
      comment.author.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await comment.deleteOne();

    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

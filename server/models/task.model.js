// استيراد mongoose لإنشاء Schema و Model
import mongoose from "mongoose";

// تعريف Schema خاصة بالطلبات (Tasks)
const taskSchema = new mongoose.Schema(
  {
    // عنوان الطلب (إجباري)
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // وصف تفصيلي للطلب (اختياري لكن مهم)
    description: {
      type: String,
      required: true,
      trim: true,
    },

    // حالة الطلب: جديد، قيد المعالجة، تم الحل، مرفوض
    status: {
      type: String,
      enum: ["new", "in_progress", "resolved", "rejected"],
      default: "new", // افتراضياً الطلب جديد
    },

    // أولوية الطلب: منخفضة، متوسطة، عالية
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    // المستخدم صاحب الطلب (اللي عمل الـ Ticket)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // اسم موديل المستخدم
      required: true,
    },

    // (اختياري) الشخص المسؤول من فريق الدعم عن الطلب
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // ممكن يكون Admin أو Support
      default: null,
    },

    comments: [
      {
        text: { type: String, required: true },
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        date: { type: Date, default: Date.now },
      },
    ],
  },

  {
    // إضافة createdAt و updatedAt تلقائياً
    timestamps: true,
  }
);

// إنشاء Model باسم "Task" من الـ Schema
const Task = mongoose.model("Task", taskSchema);

// تصدير الموديل لاستخدامه في الراوتر لاحقاً
export default Task;

/*
شرح سريع:

- هذا الملف يحدد شكل "الطلب" (Task) في قاعدة البيانات.
- كل Task مرتبط بمستخدم واحد (user).
- ممكن يكون له حالة (status) و أولوية (priority).
- ممكن نربطه لاحقاً بشخص من فريق الدعم (assignedTo).
*/

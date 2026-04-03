// استيراد mongoose لإنشاء Schema و Model
import mongoose from "mongoose";

// إنشاء Schema يحدد شكل بيانات المستخدم داخل قاعدة البيانات
const userSchema = new mongoose.Schema(
  {
    // اسم المستخدم - نص إجباري
    name: {
      type: String,
      required: true,
      trim: true, // إزالة الفراغات من البداية والنهاية
    },

    // الإيميل - نص إجباري ولا يمكن تكراره
    email: {
      type: String,
      required: true,
      unique: true, // لا يسمح بتكرار الإيميلات
      lowercase: true, // تحويل الإيميل لأحرف صغيرة
      trim: true,
    },

    // كلمة المرور - نص إجباري (سيتم تخزينها مشفّرة)
    password: {
      type: String,
      required: true,
      minlength: 6, // الحد الأدنى للطول
    },

    // دور المستخدم (user أو admin)
    role: {
      type: String,
      enum: ["user", "admin"], // القيم المسموحة فقط
      default: "user", // القيمة الافتراضية
    },
    image: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
  },

  // إضافة تاريخ الإنشاء والتحديث تلقائياً
  { timestamps: true },
);

// إنشاء Model باسم "User" باستخدام الـ Schema
// هذا الموديل هو اللي منستعمله للقراءة والكتابة على قاعدة البيانات
export default mongoose.model("User", userSchema);

// ====================================================================
//                      شرح مختصر لما يقوم به الملف
// ====================================================================
// 1) تحديد شكل بيانات المستخدم داخل MongoDB.
// 2) التأكد أن الإيميل فريد ولا يتكرر.
// 3) فرض شروط على الحقول (required, minlength ...).
// 4) إضافة createdAt و updatedAt تلقائياً.
// 5) تصدير Model "User" للاستخدام داخل الراوتر.
// ====================================================================

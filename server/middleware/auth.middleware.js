import jwt from "jsonwebtoken";

// ==============================
// AUTH GUARD MIDDLEWARE
// ==============================
export function authGuard(req, res, next) {
  try {
    // 1) قراءة Authorization header
    const authHeader = req.headers.authorization;

    // 2) التحقق من وجود التوكن
    if (!authHeader) {
      return res.status(401).json({
        message: "Authorization header missing",
      });
    }

    // 3) التحقق من صيغة Bearer
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Invalid token format",
      });
    }

    // 4) استخراج التوكن
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Token not found",
      });
    }

    // 5) التحقق من التوكن
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 6) حفظ بيانات المستخدم
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    // 🔥 اختياري (أسهل بالاستخدام)
    req.userId = decoded.id;

    // 7) كمل
    next();
  } catch (err) {
    // حالات مختلفة
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired",
      });
    }

    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    return res.status(401).json({
      message: "Authentication failed",
    });
  }
}

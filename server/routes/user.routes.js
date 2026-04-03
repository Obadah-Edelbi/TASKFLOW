// ========================================================
//                IMPORTS
// ========================================================

import { Router } from "express";
import User from "../models/user.model.js";
import { hash, compare } from "bcryptjs";
import jwt from "jsonwebtoken";

import { authGuard } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import { upload } from "../middleware/upload.js";

const router = Router();

// ========================================================
// REGISTER
// ========================================================

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashed = await hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashed,
      role: "user",
    });

    res.json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========================================================
// LOGIN
// ========================================================

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const match = await compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "SECRET123",
      { expiresIn: "7d" },
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
        location: user.location,
        bio: user.bio,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========================================================
// GET CURRENT USER
// ========================================================

router.get("/me", authGuard, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========================================================
// UPDATE PROFILE
// ========================================================

router.put("/profile", authGuard, async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
        location: req.body.location,
        bio: req.body.bio,
      },
      { returnDocument: "after" },
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
});

// ========================================================
// UPLOAD PROFILE IMAGE
// ========================================================
router.post("/upload", authGuard, upload.single("image"), async (req, res) => {
  try {
    console.log("FILE:", req.file); // 👈 مهم
    console.log("BODY:", req.body);

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { image: imageUrl },
      { new: true },
    );

    res.json({ imageUrl, user });
  } catch (err) {
    console.error("UPLOAD ERROR:", err); // 👈 مهم جداً
    res.status(500).json({ message: "Upload failed" });
  }
});

// ========================================================
// ADMIN
// ========================================================

router.get("/all-users", authGuard, requireRole("admin"), async (req, res) => {
  const users = await User.find().select("-password");
  res.json({ users });
});

// ========================================================
// FORGOT PASSWORD
// ========================================================

router.post("/forgot-password", async (req, res) => {
  try {
    res.json({
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========================================================

export default router;

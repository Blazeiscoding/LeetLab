import express from "express";
import {
  register,
  login,
  logout,
  me,
  sendOTP,
  verifyOTP,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const authRoutes = express.Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.post("/logout", authMiddleware, logout);
authRoutes.get("/me", authMiddleware, me);

authRoutes.post("/send-otp", sendOTP);
authRoutes.post("/verify-otp", verifyOTP);

export default authRoutes;


import express from "express";
import {
  register,
  login,
  logout,
  me,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const authRoutes = express.Router();

authRoutes.post("/register", register);
authRoutes.post("/verify-email", verifyEmail);
authRoutes.post("/resend-verification", resendVerificationEmail);
authRoutes.post("/login", login);
authRoutes.post("/forgot-password", forgotPassword);
authRoutes.post("/reset-password", resetPassword);
authRoutes.post("/logout", authMiddleware, logout);
authRoutes.get("/me", authMiddleware, me);

export default authRoutes;
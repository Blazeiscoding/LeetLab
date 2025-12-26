import express from "express";
import {
  getMonthlyLeaderboard,
  getUserLeaderboardStats,
} from "../controllers/leaderboard.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// Get monthly leaderboard (public endpoint)
router.get("/monthly", getMonthlyLeaderboard);

// Get user's personal leaderboard stats (requires authentication)
router.get("/user-stats", authMiddleware, getUserLeaderboardStats);

export default router;


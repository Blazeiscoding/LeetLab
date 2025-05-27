import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  addProblemToPlaylist,
  createPlaylist,
  deletePlaylist,
  getAllListDetails,
  getPlayListDetails,
  removeProblemFromPlaylist,
} from "../controllers/playlist.contoller.js";

const playlistRoutes = express.Router();

// Get all playlists for user
playlistRoutes.get("/", authMiddleware, getAllListDetails);

// Get specific playlist details
playlistRoutes.get("/:playlistId", authMiddleware, getPlayListDetails);

// Create new playlist
playlistRoutes.post("/create-playlist", authMiddleware, createPlaylist);

// Add problems to playlist
playlistRoutes.post(
  "/:playlistId/add-problem",
  authMiddleware,
  addProblemToPlaylist
);

// Delete playlist
playlistRoutes.delete("/:playlistId", authMiddleware, deletePlaylist);

// Remove problems from playlist - Fixed route to match controller
playlistRoutes.delete(
  "/:playlistId/remove-problem",
  authMiddleware,
  removeProblemFromPlaylist
);

export default playlistRoutes;

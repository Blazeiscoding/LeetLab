import express from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { addProblemToPlaylist, createPlaylist, deletePlaylist, getAllListDetails, getPlayListDetails, removeProblemFromPlaylist } from "../controllers/playlist.contoller";

const playlistRoutes = express.Router();

playlistRoutes.get("/", authMiddleware, getAllListDetails);

playlistRoutes.get("/:playlistId", authMiddleware, getPlayListDetails);
playlistRoutes.post("/create-playlist", authMiddleware, createPlaylist);
playlistRoutes.post(
  "/:playlistId/add-problem",
  authMiddleware,
  addProblemToPlaylist
);
playlistRoutes.delete("/:playlistId", authMiddleware, deletePlaylist);

playlistRoutes.delete(
  "/:playlistId/remove-problem/:problemId",
  authMiddleware,
  removeProblemFromPlaylist
);
export default playlistRoutes;

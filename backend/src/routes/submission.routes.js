import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  getAllSubmission,
  getAllTheSubmissionsForProblem,
  getSubmissionsForProblem,
} from "../controllers/submission.controller.js";

const submissionRoute = express.Router();

submissionRoute.get("/get-all-submission", authMiddleware, getAllSubmission);
submissionRoute.get(
  "/get-submission/:problemid",
  authMiddleware,
  getSubmissionsForProblem
);
submissionRoute.get(
  "/get-submissions-count/:problemid",
  authMiddleware,
  getAllTheSubmissionsForProblem
);

export default submissionRoute;

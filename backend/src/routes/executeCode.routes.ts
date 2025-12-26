import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { executeCode, runCode } from "../controllers/executeCode.controller.js";

const executionRoute = express.Router();

executionRoute.post("/run", authMiddleware, runCode);
executionRoute.post("/submit", authMiddleware, executeCode);

export default executionRoute;


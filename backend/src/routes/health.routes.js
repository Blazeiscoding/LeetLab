import express from "express";
import { healthCheck, ping } from "../controllers/health.controller.js";

const healthRoutes = express.Router();

healthRoutes.get("/health", healthCheck);
healthRoutes.get("/ping", ping);

export default healthRoutes;

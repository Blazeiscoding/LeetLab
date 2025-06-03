import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import axios from "axios";
import cron from "node-cron";
import authRoutes from "./routes/auth.routes.js";
import problemRoutes from "./routes/problem.route.js";
import executionRoute from "./routes/executeCode.routes.js";
import submissionRoute from "./routes/submission.routes.js";
import playlistRoutes from "./routes/playlist.routes.js";
import healthRoutes from "./routes/health.routes.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://www.codingshastra.codes",
      "https://codingshastra.codes",
      "https://coding-shastra.vercel.app/",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
  })
);
app.get("/", (req, res) => {
  res.send("Hello Guys welcome to leetlab🔥");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/problems", problemRoutes);
app.use("/api/v1/execute-code", executionRoute);
app.use("/api/v1/submission", submissionRoute);
app.use("/api/v1/playlist", playlistRoutes);
app.use("/api/v1", healthRoutes);
app.listen(process.env.PORT || 5000, () => {
  console.log("Server is running on port ", process.env.PORT);
  if (process.env.NODE_ENV === "production") {
    cron.schedule("*/5 * * * *", async () => {
      try {
        const serverUrl =
          process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
        console.log("🏃 Keep-alive ping at:", new Date().toISOString());

        const response = await axios.get(`${serverUrl}/api/v1/ping`, {
          timeout: 10000, // 10 second timeout
        });

        console.log("✅ Keep-alive ping successful:", response.data);
      } catch (error) {
        console.error("❌ Keep-alive ping failed:", error.message);
      }
    });

    console.log("⏰ Keep-alive cron job scheduled (every 5 minutes)");
  }
});

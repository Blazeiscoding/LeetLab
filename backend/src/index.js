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
import leaderboardRoutes from "./routes/leaderboard.routes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://www.codingshastra.codes",
        "https://codingshastra.codes",
        "https://coding-shastra.vercel.app",
      ];

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("CORS blocked origin:", origin);
        callback(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cookie",
      "Set-Cookie",
      "Access-Control-Allow-Credentials",
      "Access-Control-Allow-Origin",
      "Access-Control-Allow-Headers",
      "Access-Control-Allow-Methods",
    ],
    exposedHeaders: ["Set-Cookie"],
    optionsSuccessStatus: 200,
    preflightContinue: false,
  })
);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://www.codingshastra.codes",
    "https://codingshastra.codes",
    "https://coding-shastra.vercel.app",
  ];

  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Cookie, Set-Cookie"
  );

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }

  next();
});

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello Guys welcome to leetlab🔥");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/problems", problemRoutes);
app.use("/api/v1/execute-code", executionRoute);
app.use("/api/v1/submission", submissionRoute);
app.use("/api/v1/playlist", playlistRoutes);
app.use("/api/v1/leaderboard", leaderboardRoutes);
app.use("/api/v1", healthRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server is running on port ", PORT);

  if (process.env.NODE_ENV === "production") {
    let consecutiveFailures = 0;
    const maxFailures = 3;

    cron.schedule("0 9 * * *", async () => {
      try {
        const serverUrl =
          process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
        console.log("🏃 Daily keep-alive ping at:", new Date().toISOString());

        const response = await axios.get(`${serverUrl}/api/v1/ping`, {
          timeout: 15000,
          headers: {
            "User-Agent": "KeepAlive-Daily",
          },
        });

        console.log("✅ Daily keep-alive ping successful:", response.data);
        consecutiveFailures = 0; // Reset failure count on success
      } catch (error) {
        consecutiveFailures++;
        console.error(
          `❌ Daily keep-alive ping failed (${consecutiveFailures}/${maxFailures}):`,
          error.message
        );

        if (consecutiveFailures >= maxFailures) {
          console.log("⚠️ Too many daily failures, requires investigation");
        }
      }
    });

    console.log("⏰ Daily keep-alive cron job scheduled (9:00 AM UTC)");
  } else {
    console.log("🔧 Development mode - keep-alive disabled");
  }
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  process.exit(0);
});

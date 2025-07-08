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

// Apply CORS middleware BEFORE any other middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, etc.)
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
        callback(null, false); // Don't throw error, just deny
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

// Additional manual CORS headers for extra safety
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

// Other middleware AFTER CORS
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello Guys welcome to leetlab🔥");
});

// Remove this since you already have ping in healthRoutes

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/problems", problemRoutes);
app.use("/api/v1/execute-code", executionRoute);
app.use("/api/v1/submission", submissionRoute);
app.use("/api/v1/playlist", playlistRoutes);
app.use("/api/v1", healthRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server is running on port ", PORT);

  // OPTIMIZED KEEP-ALIVE STRATEGY
  if (process.env.NODE_ENV === "production") {
    let consecutiveFailures = 0;
    const maxFailures = 3;

    // Reduced frequency: every 10 minutes instead of 2 minutes
    cron.schedule("*/10 * * * *", async () => {
      try {
        const serverUrl =
          process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
        console.log("🏃 Keep-alive ping at:", new Date().toISOString());

        // Use your existing ping endpoint
        const response = await axios.get(`${serverUrl}/api/v1/ping`, {
          timeout: 8000, // Reduced timeout to 8 seconds
          headers: {
            "User-Agent": "KeepAlive-Internal",
          },
        });

        console.log("✅ Keep-alive ping successful:", response.data);
        consecutiveFailures = 0; // Reset failure count on success
      } catch (error) {
        consecutiveFailures++;
        console.error(
          `❌ Keep-alive ping failed (${consecutiveFailures}/${maxFailures}):`,
          error.message
        );

        // If too many consecutive failures, temporarily disable keep-alive
        if (consecutiveFailures >= maxFailures) {
          console.log(
            "⚠️ Too many failures, skipping next few keep-alive attempts"
          );
          // You could implement a backoff strategy here
        }
      }
    });

    console.log("⏰ Keep-alive cron job scheduled (every 10 minutes)");
  } else {
    console.log("🔧 Development mode - keep-alive disabled");
  }
});

// Graceful shutdown handling
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  process.exit(0);
});

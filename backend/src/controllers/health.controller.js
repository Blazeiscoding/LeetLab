import { db } from "../libs/db.js";
import axios from "axios";

export const healthCheck = async (req, res) => {
  const startTime = Date.now();

  try {
    // Basic server info
    const serverInfo = {
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "1.0.0",
      nodeVersion: process.version,
    };

    // Memory usage
    const memoryUsage = process.memoryUsage();
    const memoryInfo = {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`,
    };

    // Check database connection
    let dbStatus = "OK";
    let dbLatency = 0;
    try {
      const dbStartTime = Date.now();
      await db.$queryRaw`SELECT 1`;
      dbLatency = Date.now() - dbStartTime;
    } catch (error) {
      dbStatus = "ERROR";
      console.error("Database health check failed:", error.message);
    }

    // Check RapidAPI connection (if needed)
    let rapidApiStatus = "OK";
    let rapidApiLatency = 0;
    try {
      if (process.env.RAPIDAPI_KEY) {
        const rapidApiStartTime = Date.now();
        await axios.get(`${process.env.RAPIDAPI_BASE_URL || "https://judge0-ce.p.rapidapi.com"}/languages`, {
          timeout: 5000,
          headers: {
            "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
            "X-RapidAPI-Host": process.env.RAPIDAPI_HOST || "judge0-ce.p.rapidapi.com",
          },
        });
        rapidApiLatency = Date.now() - rapidApiStartTime;
      }
    } catch (error) {
      rapidApiStatus = "ERROR";
      console.error("RapidAPI health check failed:", error.message);
    }

    const responseTime = Date.now() - startTime;

    const healthData = {
      ...serverInfo,
      services: {
        database: {
          status: dbStatus,
          latency: `${dbLatency}ms`,
        },
        rapidapi: {
          status: rapidApiStatus,
          latency: `${rapidApiLatency}ms`,
        },
      },
      performance: {
        responseTime: `${responseTime}ms`,
        memory: memoryInfo,
      },
    };

    // Determine overall health status
    const overallStatus =
      dbStatus === "OK" && rapidApiStatus === "OK" ? "healthy" : "degraded";

    res.status(200).json({
      status: overallStatus,
      data: healthData,
    });
  } catch (error) {
    console.error("Health check error:", error);

    res.status(503).json({
      status: "unhealthy",
      error: "Health check failed",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  }
};

export const ping = (req, res) => {
  res.status(200).json({
    status: "pong",
    timestamp: new Date().toISOString(),
  });
};

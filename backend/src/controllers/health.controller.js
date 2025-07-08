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

    // Check Judge0 API connection (if needed)
    let judge0Status = "OK";
    let judge0Latency = 0;
    try {
      if (process.env.JUDGE0_API_URL) {
        const judge0StartTime = Date.now();
        await axios.get(`${process.env.JUDGE0_API_URL}/languages`, {
          timeout: 5000,
          headers: {
            Authorization: `Bearer ${process.env.JUDGE0_AUTH}`,
          },
        });
        judge0Latency = Date.now() - judge0StartTime;
      }
    } catch (error) {
      judge0Status = "ERROR";
      console.error("Judge0 health check failed:", error.message);
    }

    const responseTime = Date.now() - startTime;

    const healthData = {
      ...serverInfo,
      services: {
        database: {
          status: dbStatus,
          latency: `${dbLatency}ms`,
        },
        judge0: {
          status: judge0Status,
          latency: `${judge0Latency}ms`,
        },
      },
      performance: {
        responseTime: `${responseTime}ms`,
        memory: memoryInfo,
      },
    };

    // Determine overall health status
    const overallStatus =
      dbStatus === "OK" && judge0Status === "OK" ? "healthy" : "degraded";

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

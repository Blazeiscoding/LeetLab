import { Request, Response } from "express";
import { db } from "../libs/db.js";
import axios, { AxiosError } from "axios";

export const healthCheck = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
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
    let dbStatus: string = "OK";
    let dbLatency: number = 0;
    try {
      const dbStartTime = Date.now();
      await db.$queryRaw`SELECT 1`;
      dbLatency = Date.now() - dbStartTime;
    } catch (error) {
      dbStatus = "ERROR";
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Database health check failed:", errorMessage);
    }

    // Check RapidAPI connection (if needed)
    let rapidApiStatus: string = "OK";
    let rapidApiLatency: number = 0;
    try {
      if (process.env.RAPIDAPI_KEY) {
        const rapidApiStartTime = Date.now();
        await axios.get(
          `${
            process.env.RAPIDAPI_BASE_URL || "https://judge0-ce.p.rapidapi.com"
          }/languages`,
          {
            timeout: 5000,
            headers: {
              "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
              "X-RapidAPI-Host":
                process.env.RAPIDAPI_HOST || "judge0-ce.p.rapidapi.com",
            },
          }
        );
        rapidApiLatency = Date.now() - rapidApiStartTime;
      }
    } catch (error) {
      rapidApiStatus = "ERROR";
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as AxiosError).response?.data || "Unknown error";
      console.error("RapidAPI health check failed:", errorMessage);
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

export const ping = (req: Request, res: Response): Response => {
  return res.status(200).json({
    status: "pong",
    timestamp: new Date().toISOString(),
  });
};


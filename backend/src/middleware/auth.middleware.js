import jwt from "jsonwebtoken";
import { db } from "../libs/db.js";

export const authMiddleware = async (req, res, next) => {
  try {
    // Log for debugging (remove in production)
    console.log("Auth middleware - Headers:", req.headers);
    console.log("Auth middleware - Cookies:", req.cookies);

    const token = req.cookies.jwt;

    if (!token) {
      console.log("Auth middleware - No token found in cookies");
      return res.status(401).json({
        message: "Unauthorized - No token provided",
        debug: {
          cookiesReceived: Object.keys(req.cookies || {}),
          headerReceived: !!req.headers.authorization,
        },
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(
        "Auth middleware - Token decoded successfully for user:",
        decoded.id
      );
    } catch (jwtError) {
      console.log(
        "Auth middleware - JWT verification failed:",
        jwtError.message
      );
      return res.status(401).json({
        message: "Invalid Token",
        error: jwtError.message,
      });
    }

    const user = await db.user.findUnique({
      where: {
        id: decoded.id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      console.log("Auth middleware - User not found for ID:", decoded.id);
      return res.status(401).json({ message: "User Not Found" });
    }

    console.log("Auth middleware - User authenticated:", user.email);
    req.user = user;
    next();
  } catch (error) {
    console.error("Error in authMiddleware:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const checkAdmin = (req, res, next) => {
  try {
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({ message: "Access Denied - Admins Only" });
    }
    next();
  } catch (error) {
    console.error("Error in checkAdmin middleware:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

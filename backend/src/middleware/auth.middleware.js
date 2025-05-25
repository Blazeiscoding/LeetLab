import jwt from "jsonwebtoken";
import { db } from "../libs/db.js";

// Middleware to authenticate user
export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ message: "Invalid Token" });
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
      return res.status(401).json({ message: "User Not Found" });
    }

    req.user = user; // Attach full user object including role
    next();
  } catch (error) {
    console.error("Error in authMiddleware:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Middleware to check if user is admin
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

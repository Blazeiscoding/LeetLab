import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "../libs/db.js";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized - No token provided",
      });
    }

    let decoded: jwt.JwtPayload & { id?: string };
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || ""
      ) as jwt.JwtPayload & { id: string };
    } catch (jwtError) {
      return res.status(401).json({
        message: "Invalid Token",
      });
    }

    if (!decoded.id) {
      return res.status(401).json({
        message: "Invalid Token",
      });
    }

    const user = await db.user.findUnique({
      where: { id: decoded.id },
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

    req.user = user;
    next();
  } catch (error) {
    console.error("Error in authMiddleware:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const checkAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
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


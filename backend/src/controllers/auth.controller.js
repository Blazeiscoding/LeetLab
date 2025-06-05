import bcrypt from "bcryptjs";
import { db } from "../libs/db.js";
import { UserRole } from "../generated/prisma/index.js";
import jwt from "jsonwebtoken";

// Helper function to get cookie options with detailed logging
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";

  const options = {
    httpOnly: true,
    sameSite: isProduction ? "None" : "lax",
    secure: isProduction,
    maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days
    // Add domain and path explicitly
    path: "/",
    // Only set domain in production for cross-origin
    ...(isProduction && { domain: process.env.COOKIE_DOMAIN || undefined }),
  };

  console.log("Cookie options:", {
    ...options,
    environment: process.env.NODE_ENV,
    isProduction,
  });

  return options;
};

export const register = async (req, res) => {
  const { email, password, name } = req.body;

  console.log("Register request from origin:", req.headers.origin);
  console.log("Request headers:", {
    origin: req.headers.origin,
    referer: req.headers.referer,
    userAgent: req.headers["user-agent"],
  });

  try {
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: UserRole.USER,
      },
    });

    const token = jwt.sign(
      {
        id: user.id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    console.log("Setting cookie with token:", token.substring(0, 20) + "...");

    const cookieOptions = getCookieOptions();
    res.cookie("jwt", token, cookieOptions);

    console.log("Cookie set, response headers will include:", res.getHeaders());

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      // Add debug info (remove in production)
      debug: {
        cookieSet: true,
        cookieOptions: cookieOptions,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "User Registration Failed" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  console.log("Login request from origin:", req.headers.origin);
  console.log("Request headers:", {
    origin: req.headers.origin,
    referer: req.headers.referer,
    userAgent: req.headers["user-agent"],
  });

  try {
    const user = await db.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user.id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    console.log(
      "Setting login cookie with token:",
      token.substring(0, 20) + "..."
    );

    const cookieOptions = getCookieOptions();
    res.cookie("jwt", token, cookieOptions);

    console.log("Login cookie set, response headers:", res.getHeaders());

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      // Add debug info (remove in production)
      debug: {
        cookieSet: true,
        cookieOptions: cookieOptions,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Login Failed" });
  }
};

export const logout = async (req, res) => {
  try {
    console.log("Logout request, clearing cookie");

    const cookieOptions = {
      ...getCookieOptions(),
      maxAge: 0,
    };

    res.cookie("jwt", "", cookieOptions);

    console.log("Logout cookie cleared with options:", cookieOptions);

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
  }
};

export const me = async (req, res) => {
  try {
    console.log("Me request, cookies received:", req.cookies);

    const user = await db.user.findUnique({
      where: {
        id: req.user.id,
      },
    });
    return res.status(200).json({ message: "User fetched successfully", user });
  } catch (error) {
    console.error("Me endpoint error:", error);
    return res.status(500).json({ error: "Error While Fetching User" });
  }
};

import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { db } from "../libs/db.js";
import { UserRole } from "@prisma/client";
import jwt from "jsonwebtoken";
import emailService from "../services/email.service.js";
import otpService from "../services/otp.service.js";
import { isValidEmail } from "../utils/validators.js";
import { errorResponse } from "../utils/errorHandler.js";
import { JWT_CONFIG } from "../utils/constants.js";

interface RegisterBody {
  email: string;
  password: string;
  name?: string;
}

interface LoginBody {
  email: string;
  password: string;
}

interface SendOTPBody {
  email: string;
}

interface VerifyOTPBody {
  email: string;
  otp: string;
}

const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";

  const options: {
    httpOnly: boolean;
    sameSite: "none" | "lax";
    secure: boolean;
    maxAge: number;
    path: string;
    domain?: string;
  } = {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
    maxAge: JWT_CONFIG.COOKIE_MAX_AGE,
    path: "/",
  };

  if (isProduction && process.env.COOKIE_DOMAIN) {
    options.domain = process.env.COOKIE_DOMAIN;
  }

  return options;
};

export const register = async (
  req: Request<unknown, unknown, RegisterBody>,
  res: Response
): Promise<Response | void> => {
  const { email, password, name } = req.body;

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
        isEmailVerified: false,
      },
    });

    // Generate and send OTP after registration
    const otpResult = await otpService.createOTP(user.id, email);
    if (!otpResult.success || !otpResult.otpCode) {
      return res.status(500).json({ message: "Failed to generate OTP" });
    }

    const emailResult = await emailService.sendOTP(email, otpResult.otpCode);
    if (!emailResult.success) {
      return res
        .status(500)
        .json({ message: "Failed to send verification OTP" });
    }

    return res.status(201).json({
      message:
        "Registration successful. Please verify your email with the OTP sent to your email address.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: false,
      },
      expiresAt: otpResult.expiresAt,
    });
  } catch (error) {
    console.error("Register error:", error);
    return errorResponse(res, 500, "User Registration Failed", error);
  }
};

export const login = async (
  req: Request<unknown, unknown, LoginBody>,
  res: Response
): Promise<Response | void> => {
  const { email, password } = req.body;

  try {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Optionally check email verification
    if (!user.isEmailVerified) {
      return res
        .status(401)
        .json({ message: "Please verify your email first." });
    }

    // Generate JWT token
    if (!process.env.JWT_SECRET) {
      return errorResponse(res, 500, "JWT_SECRET not configured");
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: JWT_CONFIG.EXPIRES_IN,
    });

    // Set cookie
    const cookieOptions = getCookieOptions();
    res.cookie("jwt", token, cookieOptions);

    // Return user object with isEmailVerified
    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return errorResponse(res, 500, "Login Failed", error);
  }
};

export const sendOTP = async (
  req: Request<unknown, unknown, SendOTPBody>,
  res: Response
): Promise<Response | void> => {
  const { email } = req.body;

  try {
    // Validate email format
    if (!isValidEmail(email)) {
      return errorResponse(res, 400, "Invalid email format");
    }

    // Check if user exists
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check rate limiting
    const remainingAttempts = await otpService.getRemainingAttempts(email);
    if (remainingAttempts <= 0) {
      return res.status(429).json({
        message: "Too many OTP requests. Please try again later.",
        remainingAttempts: 0,
      });
    }

    // Generate and store OTP
    const otpResult = await otpService.createOTP(user.id, email);
    if (!otpResult.success || !otpResult.otpCode) {
      return res.status(500).json({ message: "Failed to generate OTP" });
    }

    // Send OTP email
    const emailResult = await emailService.sendOTP(email, otpResult.otpCode);
    if (!emailResult.success) {
      return res.status(500).json({ message: "Failed to send OTP email" });
    }

    return res.status(200).json({
      message: "OTP sent successfully",
      email: email,
      expiresAt: otpResult.expiresAt,
      remainingAttempts: remainingAttempts - 1,
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return errorResponse(res, 500, "Failed to send OTP", error);
  }
};

export const verifyOTP = async (
  req: Request<unknown, unknown, VerifyOTPBody>,
  res: Response
): Promise<Response | void> => {
  const { email, otp } = req.body;

  try {
    // Validate inputs
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    // Verify OTP
    const otpResult = await otpService.verifyOTP(email, otp);
    if (!otpResult.success || !otpResult.user) {
      return res.status(400).json({ message: otpResult.error || "Invalid OTP" });
    }

    // Update user's email verification status if not already verified
    if (!otpResult.user.isEmailVerified) {
      await db.user.update({
        where: { id: otpResult.user.id },
        data: { isEmailVerified: true },
      });
    }

    // Generate JWT token
    if (!process.env.JWT_SECRET) {
      return errorResponse(res, 500, "JWT_SECRET not configured");
    }

    const token = jwt.sign({ id: otpResult.user.id }, process.env.JWT_SECRET, {
      expiresIn: JWT_CONFIG.EXPIRES_IN,
    });

    // Set cookie
    const cookieOptions = getCookieOptions();
    res.cookie("jwt", token, cookieOptions);

    return res.status(200).json({
      message: "OTP verified successfully. Login successful.",
      user: {
        ...otpResult.user,
        isEmailVerified: true,
      },
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return errorResponse(res, 500, "Failed to verify OTP", error);
  }
};

export const logout = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const cookieOptions = {
      ...getCookieOptions(),
      maxAge: 0,
    };

    res.cookie("jwt", "", cookieOptions);
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    return errorResponse(res, 500, "Logout failed", error);
  }
};

export const me = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await db.user.findUnique({
      where: { id: req.user.id },
    });
    return res.status(200).json({ message: "User fetched successfully", user });
  } catch (error) {
    console.error("Me endpoint error:", error);
    return res.status(500).json({ error: "Error While Fetching User" });
  }
};


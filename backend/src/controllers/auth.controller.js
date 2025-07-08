import bcrypt from "bcryptjs";
import { db } from "../libs/db.js";
import { UserRole } from "../generated/prisma/index.js";
import jwt from "jsonwebtoken";
import emailService from "../services/email.service.js";
import otpService from "../services/otp.service.js";

const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";

  const options = {
    httpOnly: true,
    sameSite: isProduction ? "None" : "lax",
    secure: isProduction,
    maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days
    path: "/",
    ...(isProduction && { domain: process.env.COOKIE_DOMAIN || undefined }),
  };

  return options;
};

export const register = async (req, res) => {
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
    if (!otpResult.success) {
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
    res.status(500).json({ message: "User Registration Failed" });
  }
};

// Remove traditional login - only OTP-based login allowed
export const login = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(401).json({
        message:
          "Please verify your email first. Use the send-otp endpoint to get a verification code.",
      });
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
    if (!otpResult.success) {
      return res.status(500).json({ message: "Failed to generate OTP" });
    }

    // Send OTP email
    const emailResult = await emailService.sendOTP(email, otpResult.otpCode);
    if (!emailResult.success) {
      return res.status(500).json({ message: "Failed to send OTP email" });
    }

    return res.status(200).json({
      message: "OTP sent to your email. Please verify to complete login.",
      email: email,
      expiresAt: otpResult.expiresAt,
      remainingAttempts: remainingAttempts - 1,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Login Failed" });
  }
};

// Send OTP to user's email (can be used for both verification and login)
export const sendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
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
    if (!otpResult.success) {
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
    return res.status(500).json({ message: "Failed to send OTP" });
  }
};

// Verify OTP and complete login/verification
export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Validate inputs
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    // Verify OTP
    const otpResult = await otpService.verifyOTP(email, otp);
    if (!otpResult.success) {
      return res.status(400).json({ message: otpResult.error });
    }

    // Update user's email verification status if not already verified
    if (!otpResult.user.isEmailVerified) {
      await db.user.update({
        where: { id: otpResult.user.id },
        data: { isEmailVerified: true },
      });
    }

    // Generate JWT token
    const token = jwt.sign({ id: otpResult.user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
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
    return res.status(500).json({ message: "Failed to verify OTP" });
  }
};

export const logout = async (req, res) => {
  try {
    const cookieOptions = {
      ...getCookieOptions(),
      maxAge: 0,
    };

    res.cookie("jwt", "", cookieOptions);
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
  }
};

export const me = async (req, res) => {
  try {
    const user = await db.user.findUnique({
      where: { id: req.user.id },
    });
    return res.status(200).json({ message: "User fetched successfully", user });
  } catch (error) {
    console.error("Me endpoint error:", error);
    return res.status(500).json({ error: "Error While Fetching User" });
  }
};

import bcrypt from "bcryptjs";
import { db } from "../libs/db.js";
import { UserRole } from "../generated/prisma/index.js";
import jwt from "jsonwebtoken";
import {
  generateOTP,
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../libs/resend.lib.js";

// Helper function to get cookie options
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

    // Create user but not verified
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: UserRole.USER,
        isVerified: false,
      },
    });

    // Generate and send OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db.otpVerification.create({
      data: {
        email,
        otp,
        type: "EMAIL_VERIFICATION",
        expiresAt,
      },
    });

    await sendVerificationEmail(email, otp, name);

    return res.status(201).json({
      message:
        "Registration successful. Please check your email for verification OTP.",
      requiresVerification: true,
      email: email,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "User Registration Failed" });
  }
};

export const verifyEmail = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const otpRecord = await db.otpVerification.findFirst({
      where: {
        email,
        otp,
        type: "EMAIL_VERIFICATION",
        verified: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Update user verification status
    await db.user.update({
      where: { email },
      data: { isVerified: true },
    });

    // Mark OTP as verified
    await db.otpVerification.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });

    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, role: true },
    });

    // Generate token and set cookie
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const cookieOptions = getCookieOptions();
    res.cookie("jwt", token, cookieOptions);

    return res.status(200).json({
      message: "Email verified successfully",
      user,
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({ message: "Email verification failed" });
  }
};

export const resendVerificationOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    // Delete old OTPs
    await db.otpVerification.deleteMany({
      where: { email, type: "EMAIL_VERIFICATION" },
    });

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.otpVerification.create({
      data: {
        email,
        otp,
        type: "EMAIL_VERIFICATION",
        expiresAt,
      },
    });

    await sendVerificationEmail(email, otp, user.name);

    return res.status(200).json({
      message: "Verification OTP resent successfully",
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ message: "Failed to resend OTP" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        message: "Please verify your email before logging in",
        requiresVerification: true,
        email: email,
      });
    }

    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const cookieOptions = getCookieOptions();
    res.cookie("jwt", token, cookieOptions);

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Login Failed" });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal if email exists or not
      return res.status(200).json({
        message: "If the email exists, you will receive a password reset OTP",
      });
    }

    // Delete old password reset OTPs
    await db.otpVerification.deleteMany({
      where: { email, type: "PASSWORD_RESET" },
    });

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.otpVerification.create({
      data: {
        email,
        otp,
        type: "PASSWORD_RESET",
        expiresAt,
      },
    });

    await sendPasswordResetEmail(email, otp, user.name);

    return res.status(200).json({
      message: "If the email exists, you will receive a password reset OTP",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Failed to process request" });
  }
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const otpRecord = await db.otpVerification.findFirst({
      where: {
        email,
        otp,
        type: "PASSWORD_RESET",
        verified: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // Mark OTP as verified
    await db.otpVerification.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });

    return res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Password reset failed" });
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


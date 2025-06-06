import bcrypt from "bcryptjs";
import { db } from "../libs/db.js";
import { UserRole } from "../generated/prisma/index.js";
import jwt from "jsonwebtoken";
import {
  generateVerificationToken,
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../libs/mailtrap.lib.js";

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
        isVerified: false,
      },
    });

    const verificationToken = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db.emailVerification.create({
      data: {
        email,
        token: verificationToken,
        expiresAt,
      },
    });

    await sendVerificationEmail(email, verificationToken, name);

    return res.status(201).json({
      message:
        "Registration successful. Please check your email to verify your account.",
      requiresVerification: true,
      email: email,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "User Registration Failed" });
  }
};

export const verifyEmail = async (req, res) => {
  const { email, token } = req.body;

  try {
    const verificationRecord = await db.emailVerification.findFirst({
      where: {
        email,
        token,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!verificationRecord) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification link" });
    }

    await db.user.update({
      where: { email },
      data: { isVerified: true },
    });

    await db.emailVerification.update({
      where: { id: verificationRecord.id },
      data: { used: true },
    });

    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, role: true },
    });

    const jwtToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const cookieOptions = getCookieOptions();
    res.cookie("jwt", jwtToken, cookieOptions);

    return res.status(200).json({
      message: "Email verified successfully",
      user,
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({ message: "Email verification failed" });
  }
};

export const resendVerificationEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }
    await db.emailVerification.deleteMany({
      where: { email },
    });

    const verificationToken = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db.emailVerification.create({
      data: {
        email,
        token: verificationToken,
        expiresAt,
      },
    });

    await sendVerificationEmail(email, verificationToken, user.name);

    return res.status(200).json({
      message: "Verification email resent successfully",
    });
  } catch (error) {
    console.error("Resend verification email error:", error);
    res.status(500).json({ message: "Failed to resend verification email" });
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
        message: "If the email exists, you will receive a password reset link",
      });
    }

    await db.passwordReset.deleteMany({
      where: { email },
    });

    const resetToken = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.passwordReset.create({
      data: {
        email,
        token: resetToken,
        expiresAt,
      },
    });

    await sendPasswordResetEmail(email, resetToken, user.name);

    return res.status(200).json({
      message: "If the email exists, you will receive a password reset link",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Failed to process request" });
  }
};

export const resetPassword = async (req, res) => {
  const { email, token, newPassword } = req.body;

  try {
    const resetRecord = await db.passwordReset.findFirst({
      where: {
        email,
        token,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!resetRecord) {
      return res.status(400).json({ message: "Invalid or expired reset link" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    await db.passwordReset.update({
      where: { id: resetRecord.id },
      data: { used: true },
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

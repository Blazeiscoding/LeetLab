// backend/src/services/otp.service.js
import crypto from "crypto";
import { db } from "../libs/db.js";

class OTPService {
  generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
  }

  async createOTP(userId, email) {
    try {
      await this.cleanupExpiredOTPs(email);

      const otpCode = this.generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      const otp = await db.oTP.create({
        data: {
          userId,
          email,
          otpCode,
          expiresAt,
        },
      });

      return {
        success: true,
        otpCode,
        expiresAt,
      };
    } catch (error) {
      console.error("Error creating OTP:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async verifyOTP(email, otpCode) {
    try {
      const otp = await db.oTP.findFirst({
        where: {
          email,
          otpCode,
          isUsed: false,
          expiresAt: {
            gt: new Date(),
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              isEmailVerified: true,
            },
          },
        },
      });

      if (!otp) {
        return {
          success: false,
          error: "Invalid or expired OTP",
        };
      }

      await db.oTP.update({
        where: { id: otp.id },
        data: { isUsed: true },
      });

      return {
        success: true,
        user: otp.user,
      };
    } catch (error) {
      console.error("Error verifying OTP:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async cleanupExpiredOTPs(email) {
    try {
      await db.oTP.deleteMany({
        where: {
          email,
          OR: [{ expiresAt: { lt: new Date() } }, { isUsed: true }],
        },
      });
    } catch (error) {
      console.error("Error cleaning up expired OTPs:", error);
    }
  }

  async getRemainingAttempts(email) {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      const recentOTPs = await db.oTP.count({
        where: {
          email,
          createdAt: {
            gte: oneHourAgo,
          },
        },
      });

      const maxAttempts = 5;
      return Math.max(0, maxAttempts - recentOTPs);
    } catch (error) {
      console.error("Error getting remaining attempts:", error);
      return 0;
    }
  }
}

export default new OTPService();

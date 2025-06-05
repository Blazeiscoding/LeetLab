import { Resend } from "resend";
import crypto from "crypto";
const resend = new Resend(process.env.RESEND_API_KEY);

export const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

export const sendVerificationEmail = async (email, otp, name) => {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: [email],
      subject: "Verify Your Account - CodingShastra",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to CodingShastra!</h2>
          <p>Hi ${name},</p>
          <p>Thank you for registering with CodingShastra. Please verify your email address using the OTP below:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 32px; margin: 0;">${otp}</h1>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't create an account, please ignore this email.</p>
          <br>
          <p>Best regards,<br>CodingShastra Team</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      throw new Error("Failed to send verification email");
    }

    console.log("Verification email sent:", data);
    return data;
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (email, otp, name) => {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: [email],
      subject: "Password Reset - CodingShastra",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hi ${name},</p>
          <p>You requested to reset your password. Use the OTP below to reset your password:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #dc3545; font-size: 32px; margin: 0;">${otp}</h1>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request a password reset, please ignore this email.</p>
          <br>
          <p>Best regards,<br>CodingShastra Team</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      throw new Error("Failed to send password reset email");
    }

    console.log("Password reset email sent:", data);
    return data;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};

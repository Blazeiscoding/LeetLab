import nodemailer from "nodemailer";
import crypto from "crypto";

const createMailtrapTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.MAILTRAP_HOST || "sandbox.smtp.mailtrap.io",
    port: process.env.MAILTRAP_PORT || 2525,
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS,
    },
  });
};

export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

export const sendVerificationEmail = async (email, token, name) => {
  try {
    const transporter = createMailtrapTransporter();

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

    const mailOptions = {
      from: process.env.FROM_EMAIL || "noreply@codingshastra.com",
      to: email,
      subject: "Verify Your Account - CodingShastra",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #007bff; margin: 0;">CodingShastra</h1>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
            <h2 style="color: #333; margin-top: 0;">Welcome to CodingShastra!</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.5;">Hi ${name},</p>
            <p style="color: #666; font-size: 16px; line-height: 1.5;">
              Thank you for registering with CodingShastra. To complete your registration and start coding, 
              please verify your email address by clicking the button below:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #007bff; color: white; padding: 15px 30px; 
                        text-decoration: none; border-radius: 5px; font-weight: bold; 
                        display: inline-block; font-size: 16px;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.5;">
              If the button doesn't work, you can also copy and paste this link into your browser:
            </p>
            <p style="color: #007bff; font-size: 14px; word-break: break-all;">
              ${verificationUrl}
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; line-height: 1.5;">
              This verification link will expire in 24 hours. If you didn't create an account, 
              please ignore this email.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #666; font-size: 14px;">
              Best regards,<br>
              <strong>CodingShastra Team</strong>
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Verification email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
};

export const sendPasswordResetEmail = async (email, token, name) => {
  try {
    const transporter = createMailtrapTransporter();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    const mailOptions = {
      from: process.env.FROM_EMAIL || "noreply@codingshastra.com",
      to: email,
      subject: "Password Reset - CodingShastra",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #dc3545; margin: 0;">CodingShastra</h1>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
            <h2 style="color: #333; margin-top: 0;">Password Reset Request</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.5;">Hi ${name},</p>
            <p style="color: #666; font-size: 16px; line-height: 1.5;">
              You requested to reset your password for your CodingShastra account. 
              Click the button below to create a new password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #dc3545; color: white; padding: 15px 30px; 
                        text-decoration: none; border-radius: 5px; font-weight: bold; 
                        display: inline-block; font-size: 16px;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.5;">
              If the button doesn't work, you can also copy and paste this link into your browser:
            </p>
            <p style="color: #dc3545; font-size: 14px; word-break: break-all;">
              ${resetUrl}
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; line-height: 1.5;">
              This password reset link will expire in 1 hour. If you didn't request a password reset, 
              please ignore this email and your password will remain unchanged.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #666; font-size: 14px;">
              Best regards,<br>
              <strong>CodingShastra Team</strong>
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Password reset email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
};

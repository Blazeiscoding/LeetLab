import { Resend } from "resend";

interface SendOTPResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

class EmailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendOTP(email: string, otp: string): Promise<SendOTPResult> {
    try {
      const { data, error } = await this.resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "noreply@codingshastra.codes",
        to: [email],
        subject: "Your OTP for CodingShastra Login",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">CodingShastra</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your Coding Journey Starts Here</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin: 20px 0;">
              <h2 style="color: #333; margin-bottom: 20px; text-align: center;">Your Login OTP</h2>
              
              <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <p style="color: #666; margin-bottom: 10px;">Your One-Time Password is:</p>
                <h1 style="color: #667eea; font-size: 36px; margin: 0; letter-spacing: 8px; font-weight: bold;">${otp}</h1>
              </div>
              
              <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #856404; margin: 0; font-size: 14px;">
                  <strong>⚠️ Important:</strong> This OTP is valid for 10 minutes only. Do not share this code with anyone.
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <p style="color: #666; margin: 0;">If you didn't request this login, please ignore this email.</p>
              </div>
            </div>
            
            <div style="text-align: center; color: #999; font-size: 12px;">
              <p>© 2025 CodingShastra. All rights reserved.</p>
            </div>
          </div>
        `,
        text: `Your OTP for CodingShastra login is: ${otp}. This OTP is valid for 10 minutes only. Do not share this code with anyone.`,
      });

      if (error) {
        console.error("Error sending OTP email:", error);
        return { success: false, error: error.message };
      }

      console.log("OTP email sent successfully:", data?.id);
      return { success: true, messageId: data?.id };
    } catch (error) {
      console.error("Error sending OTP email:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      // Resend doesn't have a specific verify method, but we can check if API key is set
      if (!process.env.RESEND_API_KEY) {
        console.error("RESEND_API_KEY is not set");
        return false;
      }
      console.log("Resend email service configured successfully");
      return true;
    } catch (error) {
      console.error("Resend email service configuration failed:", error);
      return false;
    }
  }
}

export default new EmailService();


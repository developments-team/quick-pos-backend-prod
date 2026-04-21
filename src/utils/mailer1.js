import nodemailer from 'nodemailer';
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
};
const transporter = createTransporter();
export const verifyConnection = async () => {
    try {
        await transporter.verify();
        console.log('✅ Email server is ready to send messages');
        return true;
    }
    catch (error) {
        console.error('❌ Email server connection failed:', error.message);
        return false;
    }
};
export const sendEmail = async ({ to, subject, text, html, from }) => {
    try {
        const mailOptions = {
            from: from || process.env.SMTP_FROM || '"No Reply" <noreply@example.com>',
            to,
            subject,
            text,
            html,
        };
        const info = await transporter.sendMail(mailOptions);
        console.log('✉️ Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    }
    catch (error) {
        console.error('❌ Email send failed:', error.message);
        throw error;
    }
};
export const sendVerificationEmail = async (to, token, email) => {
    const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`;
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome ${email}!</h2>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
        Verify Email
      </a>
      <p>Or copy and paste this link into your browser:</p>
      <p>${verificationUrl}</p>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create an account, please ignore this email.</p>
    </div>
  `;
    return sendEmail({
        to,
        subject: 'Verify Your Email Address',
        html,
        text: `Welcome ${email}! Please verify your email by visiting: ${verificationUrl}`,
    });
};
export const sendPasswordResetEmail = async (to, token, email) => {
    const resetUrl = `${process.env.APP_URL}/reset-password?token=${token}`;
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset Request</h2>
      <p>Hi ${email},</p>
      <p>We received a request to reset your password. Click the link below to create a new password:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 5px;">
        Reset Password
      </a>
      <p>Or copy and paste this link into your browser:</p>
      <p>${resetUrl}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request a password reset, please ignore this email.</p>
    </div>
  `;
    return sendEmail({
        to,
        subject: 'Password Reset Request',
        html,
        text: `Hi ${email}, reset your password by visiting: ${resetUrl}`,
    });
};
export const sendWelcomeEmail = async (to, email) => {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to Our Platform!</h2>
      <p>Hi ${email},</p>
      <p>Thank you for joining us. We're excited to have you on board!</p>
      <p>If you have any questions, feel free to reach out to our support team.</p>
      <p>Best regards,<br>The Team</p>
    </div>
  `;
    return sendEmail({
        to,
        subject: 'Welcome!',
        html,
        text: `Hi ${email}, welcome to our platform!`,
    });
};
export const sendOTPEmail = async (to, otp, email) => {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Your One-Time Password</h2>
      <p>Hi ${email},</p>
      <p>Your OTP code is:</p>
      <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
        ${otp}
      </div>
      <p>This code will expire in 10 minutes.</p>
      <p>If you didn't request this code, please ignore this email.</p>
    </div>
  `;
    return sendEmail({
        to,
        subject: 'Your OTP Code',
        html,
        text: `Hi ${email}, your OTP code is: ${otp}. This code will expire in 10 minutes.`,
    });
};
export default {
    sendEmail,
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendWelcomeEmail,
    sendOTPEmail,
    verifyConnection,
};

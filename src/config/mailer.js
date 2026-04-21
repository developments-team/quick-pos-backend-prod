import nodemailer from 'nodemailer';
const SYSTEM_CONFIG = {
    name: process.env.SYSTEM_NAME || 'YourSaaS',
    logo: process.env.SYSTEM_LOGO || 'https://via.placeholder.com/150x50/4F46E5/ffffff?text=YourSaaS',
    primaryColor: process.env.PRIMARY_COLOR || '#4F46E5',
    supportEmail: process.env.SUPPORT_EMAIL || 'support@yoursaas.com',
};
const getEmailTemplate = (content, tenant) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${SYSTEM_CONFIG.name}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f6f9fc;">
      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f6f9fc;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <!-- Main Container -->
            <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
              
              <!-- Header with System Logo -->
              <tr>
                <td style="padding: 32px 40px; text-align: center; border-bottom: 1px solid #e5e7eb;">
                  <img src="${SYSTEM_CONFIG.logo}" alt="${SYSTEM_CONFIG.name}" style="height: 40px; max-width: 200px; margin-bottom: ${tenant ? '16px' : '0'};">
                  ${tenant?.logo
        ? `
                    <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
                      <img src="${tenant.logo}" alt="${tenant.name}" style="height: 32px; max-width: 150px;">
                      <p style="margin: 8px 0 0 0; font-size: 13px; color: #6b7280;">Powered by ${SYSTEM_CONFIG.name}</p>
                    </div>
                  `
        : ''}
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  ${content}
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 24px 40px; text-align: center; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
                  <p style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280;">
                    © ${new Date().getFullYear()} ${tenant?.name || SYSTEM_CONFIG.name}. All rights reserved.
                  </p>
                  <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                    Need help? Contact us at <a href="mailto:${SYSTEM_CONFIG.supportEmail}" style="color: ${SYSTEM_CONFIG.primaryColor}; text-decoration: none;">${SYSTEM_CONFIG.supportEmail}</a>
                  </p>
                </td>
              </tr>

            </table>

            <!-- Footer Text -->
            <table role="presentation" style="width: 100%; max-width: 600px; margin-top: 20px;">
              <tr>
                <td style="text-align: center; padding: 0 20px;">
                  <p style="font-size: 12px; color: #9ca3af; line-height: 1.5;">
                    This email was sent to you as part of your ${tenant?.name || SYSTEM_CONFIG.name} account.<br>
                    Please do not reply to this email.
                  </p>
                </td>
              </tr>
            </table>

          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};
const getButton = (url, text, color = SYSTEM_CONFIG.primaryColor) => {
    return `
    <table role="presentation" style="margin: 32px auto; border-collapse: collapse;">
      <tr>
        <td style="text-align: center;">
          <a href="${url}" style="display: inline-block; padding: 14px 32px; background-color: ${color}; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
            ${text}
          </a>
        </td>
      </tr>
    </table>
  `;
};
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
            from: from || process.env.SMTP_FROM || `"${SYSTEM_CONFIG.name}" <noreply@yoursaas.com>`,
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
export const sendVerificationEmail = async (to, token, email, tenant) => {
    const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`;
    const content = `
    <h1 style="margin: 0 0 24px 0; font-size: 28px; font-weight: 700; color: #111827; text-align: center;">
      Welcome, ${email}! 👋
    </h1>
    
    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #374151; text-align: center;">
      Thank you for joining ${tenant?.name || SYSTEM_CONFIG.name}. To get started, please verify your email address.
    </p>

    ${getButton(verificationUrl, 'Verify Email Address')}

    <div style="margin-top: 32px; padding: 16px; background-color: #f3f4f6; border-radius: 6px; border-left: 4px solid ${SYSTEM_CONFIG.primaryColor};">
      <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 600; color: #111827;">
        Alternative verification method:
      </p>
      <p style="margin: 0; font-size: 13px; color: #6b7280; word-break: break-all;">
        Copy and paste this link into your browser:<br>
        <a href="${verificationUrl}" style="color: ${SYSTEM_CONFIG.primaryColor};">${verificationUrl}</a>
      </p>
    </div>

    <p style="margin: 32px 0 0 0; font-size: 14px; line-height: 1.6; color: #6b7280; text-align: center;">
      ⏱️ This verification link will expire in <strong>24 hours</strong>.<br>
      If you didn't create this account, you can safely ignore this email.
    </p>
  `;
    const html = getEmailTemplate(content, tenant);
    return sendEmail({
        to,
        subject: `Verify your ${tenant?.name || SYSTEM_CONFIG.name} account`,
        html,
        text: `Welcome ${email}! Please verify your email by visiting: ${verificationUrl}`,
    });
};
export const sendPasswordResetEmail = async (to, token, email, tenant) => {
    const resetUrl = `${process.env.APP_URL}/reset-password?token=${token}`;
    const content = `
    <h1 style="margin: 0 0 24px 0; font-size: 28px; font-weight: 700; color: #111827; text-align: center;">
      Password Reset Request 🔐
    </h1>
    
    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #374151; text-align: center;">
      Hi <strong>${email}</strong>,
    </p>

    <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #374151; text-align: center;">
      We received a request to reset your password. Click the button below to create a new password:
    </p>

    ${getButton(resetUrl, 'Reset Password', '#dc2626')}

    <div style="margin-top: 32px; padding: 16px; background-color: #fef2f2; border-radius: 6px; border-left: 4px solid #dc2626;">
      <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 600; color: #991b1b;">
        Security Notice:
      </p>
      <p style="margin: 0; font-size: 13px; color: #991b1b; line-height: 1.5;">
        This password reset link will expire in <strong>1 hour</strong> for your security.
      </p>
    </div>

    <p style="margin: 32px 0 0 0; font-size: 14px; line-height: 1.6; color: #6b7280; text-align: center;">
      If you didn't request a password reset, please ignore this email or contact our support team if you have concerns.
    </p>
  `;
    const html = getEmailTemplate(content, tenant);
    return sendEmail({
        to,
        subject: `Reset your ${tenant?.name || SYSTEM_CONFIG.name} password`,
        html,
        text: `Hi ${email}, reset your password by visiting: ${resetUrl}`,
    });
};
export const sendWelcomeEmail = async (to, email, tenant) => {
    const dashboardUrl = `${process.env.APP_URL}/dashboard`;
    const content = `
    <h1 style="margin: 0 0 24px 0; font-size: 28px; font-weight: 700; color: #111827; text-align: center;">
      Welcome to ${tenant?.name || SYSTEM_CONFIG.name}! 🎉
    </h1>
    
    <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #374151; text-align: center;">
      Hi <strong>${email}</strong>,<br>
      We're thrilled to have you on board! Your account has been successfully verified.
    </p>

    <div style="margin: 32px 0; padding: 24px; background-color: #f0fdf4; border-radius: 6px; border-left: 4px solid #10b981;">
      <h3 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 600; color: #065f46;">
        🚀 Getting Started
      </h3>
      <ul style="margin: 0; padding-left: 20px; color: #065f46; font-size: 14px; line-height: 1.8;">
        <li>Explore your dashboard and customize your profile</li>
        <li>Check out our documentation and tutorials</li>
        <li>Connect with our community</li>
        <li>Reach out to support if you need help</li>
      </ul>
    </div>

    ${getButton(dashboardUrl, 'Go to Dashboard', '#10b981')}

    <p style="margin: 32px 0 0 0; font-size: 14px; line-height: 1.6; color: #6b7280; text-align: center;">
      Need help getting started? Our support team is here for you at<br>
      <a href="mailto:${SYSTEM_CONFIG.supportEmail}" style="color: ${SYSTEM_CONFIG.primaryColor}; text-decoration: none; font-weight: 600;">${SYSTEM_CONFIG.supportEmail}</a>
    </p>
  `;
    const html = getEmailTemplate(content, tenant);
    return sendEmail({
        to,
        subject: `Welcome to ${tenant?.name || SYSTEM_CONFIG.name}!`,
        html,
        text: `Hi ${email}, welcome to ${tenant?.name || SYSTEM_CONFIG.name}!`,
    });
};
export const sendOTPEmail = async (to, otp, email, tenant) => {
    const content = `
    <h1 style="margin: 0 0 24px 0; font-size: 28px; font-weight: 700; color: #111827; text-align: center;">
      Your Verification Code 🔑
    </h1>
    
    <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.6; color: #374151; text-align: center;">
      Hi <strong>${email}</strong>,<br>
      Use the code below to complete your verification:
    </p>

    <div style="text-align: center; margin: 32px 0;">
      <div style="display: inline-block; background: linear-gradient(135deg, ${SYSTEM_CONFIG.primaryColor} 0%, #6366f1 100%); padding: 24px 48px; border-radius: 12px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);">
        <div style="font-size: 42px; font-weight: 800; color: #ffffff; letter-spacing: 8px; font-family: 'Courier New', monospace;">
          ${otp}
        </div>
      </div>
    </div>

    <div style="margin-top: 32px; padding: 16px; background-color: #fef3c7; border-radius: 6px; border-left: 4px solid #f59e0b;">
      <p style="margin: 0; font-size: 13px; color: #92400e; line-height: 1.5;">
        ⚠️ <strong>Important:</strong> This code will expire in <strong>10 minutes</strong>. Never share this code with anyone.
      </p>
    </div>

    <p style="margin: 32px 0 0 0; font-size: 14px; line-height: 1.6; color: #6b7280; text-align: center;">
      If you didn't request this code, please ignore this email or contact support immediately.
    </p>
  `;
    const html = getEmailTemplate(content, tenant);
    return sendEmail({
        to,
        subject: `Your verification code for ${tenant?.name || SYSTEM_CONFIG.name}`,
        html,
        text: `Hi ${email}, your OTP code is: ${otp}. This code will expire in 10 minutes.`,
    });
};
export const sendInvitePasswordEmail = async (to, password, tenant) => {
    const loginUrl = `${process.env.APP_URL}/login`;
    const content = `
    <h1 style="margin: 0 0 24px 0; font-size: 28px; font-weight: 700; color: #111827; text-align: center;">
      Welcome to ${tenant?.name || SYSTEM_CONFIG.name}! 🎉
    </h1>
    
    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #374151; text-align: center;">
      Hi there,<br>
      An account has been created for you. Use the password below to log in for the first time:
    </p>

    <div style="text-align: center; margin: 32px 0;">
      <div style="display: inline-block; background: linear-gradient(135deg, ${SYSTEM_CONFIG.primaryColor} 0%, #6366f1 100%); padding: 20px 40px; border-radius: 12px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);">
        <div style="font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: 4px; font-family: 'Courier New', monospace;">
          ${password}
        </div>
      </div>
    </div>

    ${getButton(loginUrl, 'Go to Login')}

    <div style="margin-top: 32px; padding: 16px; background-color: #fef3c7; border-radius: 6px; border-left: 4px solid #f59e0b;">
      <p style="margin: 0; font-size: 13px; color: #92400e; line-height: 1.5;">
        ⚠️ <strong>Important:</strong> Please change your password after your first login for security purposes.
      </p>
    </div>

    <p style="margin: 32px 0 0 0; font-size: 14px; line-height: 1.6; color: #6b7280; text-align: center;">
      If you didn't expect this email, please contact our support team.
    </p>
  `;
    const html = getEmailTemplate(content, tenant);
    return sendEmail({
        to,
        subject: `Your ${tenant?.name || SYSTEM_CONFIG.name} Account Password`,
        html,
        text: `Welcome! Your login password is: ${password}. Please change it after your first login.`,
    });
};
export const sendInvitationEmail = async (to, inviterName, invitationToken, tenant) => {
    const invitationUrl = `${process.env.APP_URL}/accept-invitation?token=${invitationToken}`;
    const content = `
    <h1 style="margin: 0 0 24px 0; font-size: 28px; font-weight: 700; color: #111827; text-align: center;">
      You're Invited! 📨
    </h1>
    
    <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #374151; text-align: center;">
      <strong>${inviterName}</strong> has invited you to join ${tenant?.name || SYSTEM_CONFIG.name}.
    </p>

    ${getButton(invitationUrl, 'Accept Invitation', '#8b5cf6')}

    <p style="margin: 32px 0 0 0; font-size: 14px; line-height: 1.6; color: #6b7280; text-align: center;">
      This invitation will expire in 7 days.
    </p>
  `;
    const html = getEmailTemplate(content, tenant);
    return sendEmail({
        to,
        subject: `${inviterName} invited you to ${tenant?.name || SYSTEM_CONFIG.name}`,
        html,
        text: `${inviterName} invited you to join ${tenant?.name || SYSTEM_CONFIG.name}. Accept: ${invitationUrl}`,
    });
};
export default {
    sendEmail,
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendWelcomeEmail,
    sendOTPEmail,
    sendInvitePasswordEmail,
    sendInvitationEmail,
    verifyConnection,
};

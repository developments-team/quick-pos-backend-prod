import nodemailer from 'nodemailer';
let transporter = null;
export function getTransporter() {
    if (transporter)
        return transporter;
    const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env;
    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS)
        throw new Error('Missing SMTP env vars');
    transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: SMTP_SECURE === 'true',
        auth: { user: SMTP_USER, pass: SMTP_PASS },
        pool: true,
        maxConnections: 3,
        maxMessages: 50,
    });
    return transporter;
}
export async function sendMail(opts) {
    const t = getTransporter();
    const info = await t.sendMail({
        from: opts.from || process.env.FROM_EMAIL,
        to: opts.to,
        subject: opts.subject,
        text: opts.text ?? (opts.html ? undefined : ' '),
        html: opts.html,
    });
    return { messageId: info.messageId, accepted: info.accepted, rejected: info.rejected };
}
export const htmlTemplate = (password) => `
  <div style="font-family:Arial, Helvetica, sans-serif; max-width:600px; margin:auto;  padding:40px;">
    <h1 style="font-size:30px; margin-bottom:40px;">QuickPOS</h1>
    <p style="font-size:25px; margin-bottom:30px;">First Log-in Password</p>
    <p style="font-size:16px; color:#333;">Hi there,</p>
    <p style="font-size:16px; color:#333;">
      We noticed to change password and build your profile after login your account. please enter this password to login:
    </p>

    <div style="text-align:center; margin:20px 0;">
      <span style="font-size:16px; letter-spacing:1px; color:#111;">${password}</span>
    </div>

    <p style="font-size:15px; color:#333;">Best,<br/>QuickPOS</p>
  </div>`;

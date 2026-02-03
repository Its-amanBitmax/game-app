const nodemailer = require("nodemailer");

const sendEmail = async (toEmail, otp) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true only for 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const mailOptions = {
    from: `"Game Buddy" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: "Your OTP Verification Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px; background-color: #f9f9f9;">
        <h2 style="color: #333;">Game Buddy - Email Verification</h2>
        <p style="font-size: 16px; color: #555;">Hi there! Use the following OTP to complete your registration:</p>

        <div style="text-align: center; margin: 30px 0;">
          <span style="display: inline-block; font-size: 32px; letter-spacing: 8px; background-color: #1e90ff; color: #fff; padding: 15px 25px; border-radius: 6px; font-weight: bold;">
            ${otp}
          </span>
        </div>

        <p style="font-size: 14px; color: #888;">This OTP is valid for <strong>5 minutes</strong>. Please do not share it with anyone.</p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />

        <p style="font-size: 12px; color: #aaa;">If you did not request this OTP, please ignore this email.</p>
        <p style="font-size: 12px; color: #aaa;">&copy; ${new Date().getFullYear()} Game Buddy. All rights reserved.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;

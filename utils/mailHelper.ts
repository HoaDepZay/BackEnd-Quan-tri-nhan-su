import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Email của bạn
    pass: process.env.EMAIL_PASS, // App Password của Gmail
  },
});

const sendOTPMail = async (email, otpCode) => {
  const mailOptions = {
    from: '"Phòng Nhân Sự" <no-reply@company.com>',
    to: email,
    subject: "Mã xác thực đăng ký tài khoản HRM",
    html: `<div style="font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px;">
            <h2>Xác thực tài khoản</h2>
            <p>Mã OTP của bạn là: <b style="font-size: 24px; color: #007bff;">${otpCode}</b></p>
            <p>Mã này có hiệu lực trong 10 phút. Vui lòng không cung cấp mã này cho người khác.</p>
          </div>`,
  };
  return transporter.sendMail(mailOptions);
};

export { sendOTPMail };

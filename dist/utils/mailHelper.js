"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendForgotPasswordOTPMail = exports.sendOTPMail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
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
exports.sendOTPMail = sendOTPMail;
const sendForgotPasswordOTPMail = async (email, otpCode) => {
    const mailOptions = {
        from: '"Phòng Nhân Sự" <no-reply@company.com>',
        to: email,
        subject: "Mã OTP đặt lại mật khẩu HRM",
        html: `<div style="font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px;">
            <h2>Quên mật khẩu</h2>
            <p>Mã OTP đặt lại mật khẩu của bạn là: <b style="font-size: 24px; color: #dc3545;">${otpCode}</b></p>
            <p>Mã này có hiệu lực trong 10 phút. Nếu không phải bạn yêu cầu, vui lòng bỏ qua email này.</p>
          </div>`,
    };
    return transporter.sendMail(mailOptions);
};
exports.sendForgotPasswordOTPMail = sendForgotPasswordOTPMail;

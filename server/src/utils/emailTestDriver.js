const { google } = require('googleapis');
const nodemailer = require('nodemailer');
require('dotenv').config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const sendEmail = async (to, subject, htmlContent) => {
    try {
        const accessToken = await oAuth2Client.getAccessToken();

        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.EMAIL_USER,
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken.token,
            },
        });

        const mailOptions = {
            from: `"${process.env.NameWeb}" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            html: htmlContent,
        };

        const result = await transport.sendMail(mailOptions);
        return result;
    } catch (error) {
        console.error('Email send error:', error);
        throw error;
    }
};

const sendTestDriveConfirmation = async (email, fullName, carName, date, timeSlot) => {
    const appName = process.env.NameWeb || 'Auto Showroom';
    const formattedDate = new Date(date).toLocaleDateString('vi-VN');
    const subject = `[${appName}] Xác nhận lịch lái thử xe ${carName}`;
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #0066FF; padding: 20px; text-align: center;">
                <h2 style="color: white; margin: 0;">XÁC NHẬN LỊCH LÁI THỬ</h2>
            </div>
            <div style="padding: 20px; border: 1px solid #ddd;">
                <p>Xin chào <strong>${fullName}</strong>,</p>
                <p>Cảm ơn bạn đã quan tâm đến các dòng xe tại <strong>${appName}</strong>.</p>
                <p>Chúng tôi vui mừng thông báo yêu cầu lái thử của bạn đã được xác nhận với thông tin chi tiết như sau:</p>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Xe:</strong> ${carName}</p>
                    <p style="margin: 5px 0;"><strong>Ngày:</strong> ${formattedDate}</p>
                    <p style="margin: 5px 0;"><strong>Thời gian:</strong> ${timeSlot}</p>
                </div>

                <p>Vui lòng đến đúng giờ và mang theo <strong>Giấy phép lái xe</strong> hợp lệ để làm thủ tục.</p>
                <p>Nếu bạn cần thay đổi lịch hẹn, vui lòng liên hệ với chúng tôi qua hotline hoặc email này.</p>
                
                <p>Trân trọng,<br/>Đội ngũ ${process.env.NameWeb || 'Auto Showroom'}</p>
            </div>
            <div style="text-align: center; padding: 15px; color: #666; font-size: 12px;">
                <p>© 2024 ${process.env.NameWeb || 'Auto Showroom'}. All rights reserved.</p>
            </div>
        </div>
    `;

    return await sendEmail(email, subject, htmlContent);
};

const sendTestDriveRejection = async (email, fullName, carName, date, timeSlot, reason) => {
    const appName = process.env.NameWeb || 'Auto Showroom';
    const formattedDate = new Date(date).toLocaleDateString('vi-VN');
    const subject = `[${appName}] Thông báo về yêu cầu lái thử xe ${carName}`;
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #e53e3e; padding: 20px; text-align: center;">
                <h2 style="color: white; margin: 0;">THÔNG BÁO TỪ ${appName.toUpperCase()}</h2>
            </div>
            <div style="padding: 20px; border: 1px solid #ddd;">
                <p>Xin chào <strong>${fullName}</strong>,</p>
                <p>Cảm ơn bạn đã quan tâm đến các dòng xe tại <strong>${appName}</strong>.</p>
                <p>Chúng tôi rất tiếc phải thông báo rằng yêu cầu lái thử của bạn không thể thực hiện được vào lúc này.</p>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Xe:</strong> ${carName}</p>
                    <p style="margin: 5px 0;"><strong>Ngày đăng ký:</strong> ${formattedDate} - ${timeSlot}</p>
                    <p style="margin: 5px 0; color: #e53e3e;"><strong>Lý do từ chối:</strong> ${reason}</p>
                </div>

                <p>Chúng tôi thành thật xin lỗi vì sự bất tiện này. Bạn vui lòng chọn một khung giờ khác hoặc liên hệ trực tiếp với chúng tôi để được hỗ trợ tốt nhất.</p>
                
                <p>Trân trọng,<br/>Đội ngũ ${process.env.NameWeb || 'Auto Showroom'}</p>
            </div>
            <div style="text-align: center; padding: 15px; color: #666; font-size: 12px;">
                <p>© 2024 ${process.env.NameWeb || 'Auto Showroom'}. All rights reserved.</p>
            </div>
        </div>
    `;

    return await sendEmail(email, subject, htmlContent);
};

module.exports = {
    sendTestDriveConfirmation,
    sendTestDriveRejection,
};

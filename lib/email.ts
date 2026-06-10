import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT || '2525'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

export async function sendOTPEmail(email: string, otp: string) {
  const mailOptions = {
    from: `"MindCare Support" <${process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@mindcare.com'}>`,
    to: email,
    subject: 'Kode OTP Reset Password - MindCare',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #0d9488;">Reset Password MindCare</h2>
        <p>Halo,</p>
        <p>Anda menerima email ini karena kami menerima permintaan untuk mereset password akun Anda.</p>
        <div style="background-color: #f1f5f9; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0f172a;">${otp}</span>
        </div>
        <p>Kode ini berlaku selama 15 menit. Jika Anda tidak merasa melakukan permintaan ini, silakan abaikan email ini.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b;">Ini adalah email otomatis, mohon tidak membalas email ini.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

export async function sendNewConsultationAlert(adminEmail: string, consultationName: string, consultationEmail: string, messagePreview: string) {
  const mailOptions = {
    from: `"MindCare Notification" <${process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@mindcare.com'}>`,
    to: adminEmail,
    subject: 'Tiket Konsultasi Baru Masuk - MindCare',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #0d9488;">Tiket Konsultasi Baru</h2>
        <p>Halo Admin,</p>
        <p>Sebuah tiket konsultasi baru telah diajukan di MindCare:</p>
        <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin: 15px 0; font-size: 14px; line-height: 1.5;">
          <strong>Nama:</strong> ${consultationName}<br/>
          <strong>Email:</strong> ${consultationEmail}<br/>
          <strong>Pesan:</strong> "${messagePreview}"
        </div>
        <p>Silakan kunjungi dashboard admin panel untuk menugaskan konsultan atau merespons obrolan ini.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending new consultation alert email:', error);
    return { success: false, error };
  }
}

export async function sendChatMessageNotification(userEmail: string, userName: string, replyMessage: string, chatLink: string) {
  const mailOptions = {
    from: `"MindCare Support" <${process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@mindcare.com'}>`,
    to: userEmail,
    subject: 'Balasan Baru untuk Konsultasi Anda - MindCare',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #0d9488;">Balasan Baru Konsultasi</h2>
        <p>Halo ${userName},</p>
        <p>Staf konsultan atau administrator kami telah mengirimkan balasan atas konsultasi Anda:</p>
        <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin: 15px 0; font-size: 14px; line-height: 1.5; font-style: italic;">
          "${replyMessage}"
        </div>
        <p>Klik tombol di bawah ini untuk melihat obrolan lengkap dan membalas pesan:</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${chatLink}" style="background-color: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Lihat Chat Konsultasi</a>
        </div>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending chat message notification email:', error);
    return { success: false, error };
  }
}

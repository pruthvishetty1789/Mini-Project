import dotenv from 'dotenv';
dotenv.config();

import createTransporter from '../src/utils/mailer.js'; // adjust path if needed

(async () => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to: 'shettypruthvi40@gmail.com',           // your inbox
    subject: 'HearMe — SMTP test email',
    text: 'This is a test email from HearMe backend. If you get this, SMTP works!',
    html: '<p>This is a <b>test email</b> from HearMe backend. If you get this, SMTP works!</p>'
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent. nodemailer info:', info);
  } catch (err) {
    console.error('Error sending test email:', err);
  } finally {
    transporter.close?.();
    process.exit();
  }
})();

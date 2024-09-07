const { logger } = require('../config/logger');
const nodemailer = require('nodemailer');

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

function sendEmail(to, subject, text, html) {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject,
    text,
    html
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        logger.error('Error sending email:', error);
        reject(error);
      } else {
        logger.log('Email sent:', info.response);
        resolve(info);
      }
    });
  });
}

/**
 * Send an OTP email
 * @param {string} to - Recipient's email address
 * @param {string} otp - One-Time Password
 * @returns {Promise} - Resolves when email is sent, rejects on error
 */
function sendOTPEmail(to, otp) {
  const subject = 'Your OTP for verification';
  const text = `Your OTP is: ${otp}`;
  const html = `<h1>Your OTP for verification</h1><p>Your OTP is: <strong>${otp}</strong></p>`;

  return sendEmail(to, subject, text, html);
}

module.exports = {
  sendEmail,
  sendOTPEmail
};

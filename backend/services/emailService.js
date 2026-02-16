// services/emailService.js
const sgMail = require('@sendgrid/mail');

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Send password reset email
 * @param {string} email - Recipient email address
 * @param {string} resetUrl - Password reset URL with token
 */
const sendPasswordResetEmail = async (email, resetUrl) => {
  try {
    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@quickbites.com',
      subject: 'Password Reset Request - QuickBites',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9fafb;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .button {
              display: inline-block;
              padding: 14px 28px;
              background: #f97316;
              color: white;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              margin: 20px 0;
            }
            .footer {
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 12px;
              color: #6b7280;
            }
            .warning {
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 12px;
              margin: 20px 0;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🍔 QuickBites</h1>
              <p>Password Reset Request</p>
            </div>
            <div class="content">
              <h2>Hello!</h2>
              <p>You recently requested to reset your password for your QuickBites account. Click the button below to reset it:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #f97316;">${resetUrl}</p>
              
              <div class="warning">
                <strong>⚠️ Important:</strong> This password reset link will expire in <strong>10 minutes</strong>.
              </div>
              
              <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
              
              <div class="footer">
                <p>This is an automated email from QuickBites. Please do not reply to this email.</p>
                <p>&copy; ${new Date().getFullYear()} QuickBites. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Hello!

You recently requested to reset your password for your QuickBites account.

Please click the link below to reset your password:
${resetUrl}

This link will expire in 10 minutes.

If you didn't request a password reset, please ignore this email.

- QuickBites Team
      `
    };

    await sgMail.send(msg);
    console.log('Password reset email sent via SendGrid to:', email);
    return { success: true };

  } catch (error) {
    console.error('SendGrid error:', error);
    if (error.response) {
      console.error('SendGrid error body:', error.response.body);
    }
    throw new Error('Failed to send password reset email');
  }
};

/**
 * Send OTP verification email
 * @param {string} email - Recipient email address
 * @param {string} otp - 6-digit OTP code
 * @param {string} userName - User's name
 */
const sendOTPEmail = async (email, otp, userName) => {
  try {
    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@quickbites.com',
      subject: 'Verify Your Email - QuickBites',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9fafb;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .otp-box {
              background: white;
              border: 2px dashed #f97316;
              border-radius: 10px;
              padding: 20px;
              text-align: center;
              margin: 25px 0;
            }
            .otp-code {
              font-size: 36px;
              font-weight: bold;
              color: #f97316;
              letter-spacing: 8px;
              font-family: 'Courier New', monospace;
            }
            .footer {
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 12px;
              color: #6b7280;
            }
            .warning {
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 12px;
              margin: 20px 0;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🍔 QuickBites</h1>
              <p>Email Verification</p>
            </div>
            <div class="content">
              <h2>Welcome, ${userName}!</h2>
              <p>Thank you for registering with QuickBites. To complete your registration, please verify your email address using the OTP code below:</p>
              
              <div class="otp-box">
                <p style="margin: 0; font-size: 14px; color: #6b7280;">Your Verification Code</p>
                <div class="otp-code">${otp}</div>
              </div>
              
              <p style="text-align: center; color: #6b7280; font-size: 14px;">Enter this code in the verification screen to activate your account.</p>
              
              <div class="warning">
                <strong>⚠️ Important:</strong> This OTP will expire in <strong>10 minutes</strong>.
              </div>
              
              <p>If you didn't create an account with QuickBites, please ignore this email.</p>
              
              <div class="footer">
                <p>This is an automated email from QuickBites. Please do not reply to this email.</p>
                <p>&copy; ${new Date().getFullYear()} QuickBites. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Welcome to QuickBites, ${userName}!

Your email verification code is: ${otp}

Please enter this code in the verification screen to complete your registration.

This code will expire in 10 minutes.

If you didn't create an account with QuickBites, please ignore this email.

- QuickBites Team
      `
    };

    await sgMail.send(msg);
    console.log('OTP verification email sent via SendGrid to:', email);
    return { success: true };

  } catch (error) {
    console.error('SendGrid error:', error);
    if (error.response) {
      console.error('SendGrid error body:', error.response.body);
    }
    throw new Error('Failed to send OTP verification email');
  }
};

/**
 * Send password reset OTP email
 * @param {string} email - Recipient email address
 * @param {string} otp - 6-digit OTP code
 * @param {string} userName - User's name
 */
const sendPasswordResetOTPEmail = async (email, otp, userName) => {
  try {
    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@quickbites.com',
      subject: 'Password Reset OTP - QuickBites',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9fafb;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .otp-box {
              background: white;
              border: 2px dashed #f97316;
              border-radius: 10px;
              padding: 20px;
              text-align: center;
              margin: 25px 0;
            }
            .otp-code {
              font-size: 36px;
              font-weight: bold;
              color: #f97316;
              letter-spacing: 8px;
              font-family: 'Courier New', monospace;
            }
            .footer {
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 12px;
              color: #6b7280;
            }
            .warning {
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 12px;
              margin: 20px 0;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🍔 QuickBites</h1>
              <p>Password Reset</p>
            </div>
            <div class="content">
              <h2>Hello, ${userName}!</h2>
              <p>We received a request to reset your password. Use the OTP code below to proceed:</p>
              
              <div class="otp-box">
                <p style="margin: 0; font-size: 14px; color: #6b7280;">Your Password Reset Code</p>
                <div class="otp-code">${otp}</div>
              </div>
              
              <p style="text-align: center; color: #6b7280; font-size: 14px;">Enter this code in the password reset screen.</p>
              
              <div class="warning">
                <strong>⚠️ Important:</strong> This OTP will expire in <strong>10 minutes</strong>.
              </div>
              
              <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
              
              <div class="footer">
                <p>This is an automated email from QuickBites. Please do not reply to this email.</p>
                <p>&copy; ${new Date().getFullYear()} QuickBites. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Hello, ${userName}!

We received a request to reset your password.

Your password reset code is: ${otp}

Please enter this code in the password reset screen.

This code will expire in 10 minutes.

If you didn't request a password reset, please ignore this email.

- QuickBites Team
      `
    };

    await sgMail.send(msg);
    console.log('Password reset OTP email sent via SendGrid to:', email);
    return { success: true };

  } catch (error) {
    console.error('SendGrid error:', error);
    if (error.response) {
      console.error('SendGrid error body:', error.response.body);
    }
    throw new Error('Failed to send password reset OTP email');
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendOTPEmail,
  sendPasswordResetOTPEmail
};

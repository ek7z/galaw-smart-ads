/**
 * Node.js Express + Nodemailer SMTP Server (Gmail Configured)
 * 
 * Instructions:
 * 1. Initialize npm and install dependencies in this folder:
 *    run: `npm init -y`
 *    run: `npm install express nodemailer cors dotenv`
 * 2. Fill in your Gmail Credentials in the settings below, or create a `.env` file with these values.
 * 3. Make sure to generate a 16-character "App Password" in your Google Account Security settings.
 * 4. Run the server: `node server.js`
 */

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config(); // Load environment variables from a .env file if it exists

const app = express();

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =========================================================================
// 1. SMTP & GMAIL CREDENTIALS CONFIGURATION
// =========================================================================
const SMTP_CONFIG = {
  host: 'smtp.gmail.com',
  port: 587,                      // 587 for TLS, 465 for SSL
  secure: false,                  // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER || 'YOUR_GMAIL_HERE@gmail.com',         // Enter your Sender Gmail Address here
    pass: process.env.SMTP_PASS || 'YOUR_GMAIL_APP_PASSWORD_HERE'      // Enter your 16-character Gmail App Password here
  }
};

const SMTP_FROM_NAME = 'Galaw Lead Booking';
const RECEIVER_EMAIL = process.env.RECEIVER_EMAIL || 'YOUR_RECEIVING_EMAIL_HERE@gmail.com'; // Where notifications will be sent
const PORT = process.env.PORT || 3000;
// =========================================================================

// Endpoint to send the form data
app.post('/api/send-email', async (req, res) => {
  const { name, business, email, phone, revenue, challenge } = req.body;

  // Validate fields
  if (!name || !business || !email || !phone || !revenue) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'Please fill out all required fields.' 
    });
  }

  // Create Nodemailer Transporter
  const transporter = nodemailer.createTransport(SMTP_CONFIG);

  // Email Layout / Styling
  const mailOptions = {
    from: `"${SMTP_FROM_NAME}" <${SMTP_CONFIG.auth.user}>`, // Must send from SMTP user account to pass SPF/Google authentication
    to: RECEIVER_EMAIL,
    replyTo: email, // Allow reply directly to client
    subject: `New Strategy Call Booking: ${business}`,
    text: `New Strategy Call Booking Details\n\n` +
          `Full Name: ${name}\n` +
          `Business Name: ${business}\n` +
          `Email Address: ${email}\n` +
          `Phone Number: ${phone}\n` +
          `Monthly Revenue: ${revenue}\n` +
          `Biggest Challenge: ${challenge}\n`,
    html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="background-color: #ff5a1f; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; font-weight: bold;">New Strategy Call Booking</h1>
            <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Galaw Smart Advertising Lead Capture</p>
        </div>
        <div style="padding: 25px; background-color: #ffffff;">
            <p style="margin-top: 0;">A new strategy call has been booked. Here are the details:</p>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px 0; font-weight: bold; width: 35%; color: #666;">Full Name:</td>
                    <td style="padding: 10px 0;"><strong>${name}</strong></td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px 0; font-weight: bold; color: #666;">Business Name:</td>
                    <td style="padding: 10px 0;">${business}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px 0; font-weight: bold; color: #666;">Email Address:</td>
                    <td style="padding: 10px 0;"><a href="mailto:${email}" style="color: #ff5a1f; text-decoration: none;">${email}</a></td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px 0; font-weight: bold; color: #666;">Phone Number:</td>
                    <td style="padding: 10px 0;">${phone}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px 0; font-weight: bold; color: #666;">Monthly Revenue:</td>
                    <td style="padding: 10px 0; text-transform: capitalize;">${revenue}</td>
                </tr>
            </table>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #ff5a1f; border-radius: 4px; margin-top: 15px;">
                <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #333;">Biggest Challenge Right Now:</h3>
                <p style="margin: 0; font-style: italic; color: #555; white-space: pre-wrap;">${challenge}</p>
            </div>
        </div>
        <div style="background-color: #f5f5f5; color: #888; text-align: center; padding: 15px; font-size: 11px; border-top: 1px solid #eee;">
            This automated email was sent from your website's contact form.
        </div>
    </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ status: 'success', message: 'Your booking request has been sent successfully!' });
  } catch (error) {
    console.error('Mail Error:', error);
    res.status(500).json({ status: 'error', message: `Mailer Error: ${error.message}` });
  }
});

// Simple root check endpoint
app.get('/', (req, res) => {
  res.send('SMTP Mailer Server is running.');
});

app.listen(PORT, () => {
  console.log(`SMTP Mailer Server running at http://localhost:${PORT}`);
});

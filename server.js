require('dotenv').config();

const express = require('express');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const sgMail = require('@sendgrid/mail');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Simple CORS that allows all origins
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});
console.log('✅ CORS is now open to all origins'); // Add this line

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.send('Hello World 👋');
});

// Route to schedule email
app.post('/schedule-email', (req, res) => {
  const { to, subject, message, timeValue, timeUnit } = req.body;

  console.log('[📩 New Email Request]', req.body);

  if (!to || !subject || !message || !timeValue || !timeUnit) {
    return res.status(400).send('All fields are required.');
  }

  // Calculate sendAt time
  const now = new Date();
  let sendAt = new Date(now);
  
switch(timeUnit) {
    case 'minutes':
      sendAt.setMinutes(sendAt.getMinutes() + parseInt(timeValue));
      break;
    case 'days':
      sendAt.setDate(sendAt.getDate() + parseInt(timeValue));
      break;
    case 'weeks':
      sendAt.setDate(sendAt.getDate() + (parseInt(timeValue) * 7));
      break;
    case 'months':
      sendAt.setMonth(sendAt.getMonth() + parseInt(timeValue));
      break;
    case 'years':
      sendAt.setFullYear(sendAt.getFullYear() + parseInt(timeValue));
      break;
  }

  const newEmail = {
    to,
    subject,
    message,
    sendAt: sendAt.toISOString(),
  };

  const filePath = path.join(__dirname, 'scheduledEmails.json');
  
  let existingData = [];
  try {
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      existingData = fileContent ? JSON.parse(fileContent) : [];
    }
  } catch (error) {
    console.error('Error reading file:', error);
    existingData = [];
  }

  existingData.push(newEmail);
  fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));

  res.status(200).send('Email scheduled successfully!');
});

// Cron job: runs every minute to send due emails
cron.schedule('* * * * *', async () => {
  const filePath = path.join(__dirname, 'scheduledEmails.json');

  let emailData = [];
  try {
    emailData = JSON.parse(fs.readFileSync(filePath, 'utf8')) || [];
  } catch (error) {
    console.error('⚠️ Could not parse scheduledEmails.json. Using empty array.', error.message);
    emailData = [];
  }

  const now = new Date();
  const remainingEmails = [];

  for (const email of emailData) {
    const scheduledTime = new Date(email.sendAt);
    if (now >= scheduledTime) {
      try {
        await sgMail.send({
          to: email.to,
          from: 'contact@abdussalampopoola.com',
          subject: email.subject,
          text: email.message,
        });
        console.log(`✅ Sent email to ${email.to} at ${now.toISOString()}`);
        // Don't add to remainingEmails - it's been sent
      } catch (error) {
        console.error('❌ Failed to send email:', error);
        remainingEmails.push(email); // Keep it to retry
      }
    } else {
      remainingEmails.push(email);
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(remainingEmails, null, 2));
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

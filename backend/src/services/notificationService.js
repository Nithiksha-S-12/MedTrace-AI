const config = require('../config/config');

/**
 * Send SMS notification
 * Uses Twilio if configured, otherwise logs to console
 */
const sendSMS = async (phone, message) => {
  if (config.twilio.useMock) {
    console.log(`\n📱 [SMS Mock] To: ${phone}`);
    console.log(`   Message: ${message}`);
    console.log('   (Set TWILIO_* env vars to send real SMS)\n');
    return { success: true, mock: true };
  }

  try {
    const twilio = require('twilio');
    const client = twilio(config.twilio.accountSid, config.twilio.authToken);
    const result = await client.messages.create({
      body: message,
      from: config.twilio.phoneNumber,
      to: phone,
    });
    return { success: true, sid: result.sid };
  } catch (err) {
    console.error('[SMS Error]:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Send Email notification
 * Uses nodemailer — logs to console if no SMTP config
 */
const sendEmail = async (to, subject, htmlBody) => {
  console.log(`\n📧 [Email] To: ${to} | Subject: ${subject}`);

  try {
    const nodemailer = require('nodemailer');
    // Use ethereal (test) transport in dev, or real SMTP if configured
    let transporter;

    if (config.nodeEnv === 'development') {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
    } else {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    }

    const info = await transporter.sendMail({
      from: '"MedTrace AI – Ministry of Health" <noreply@medtrace.gov.in>',
      to,
      subject,
      html: htmlBody,
    });

    if (config.nodeEnv === 'development') {
      const nodemailerLib = require('nodemailer');
      console.log(`   Preview URL: ${nodemailerLib.getTestMessageUrl(info)}`);
    }

    return { success: true };
  } catch (err) {
    console.error('[Email Error]:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Notify patient: Emergency access granted
 */
const notifyEmergencyAccess = async (patient, doctor, reason) => {
  const message = `[MedTrace AI Alert] EMERGENCY ACCESS: Dr. ${doctor.fullName || doctor.name} at ${doctor.hospitalName || 'Unknown Hospital'} has accessed your medical records under emergency protocol. Reason: ${reason}. This access will expire in 15 minutes. If this is unauthorized, contact us immediately at 1800-MEDTRACE.`;

  await sendSMS(patient.phone, message);

  const html = `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1A3C6E; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">⚠️ Emergency Access Alert</h1>
        <p style="color: #C9A84C; margin: 5px 0;">MedTrace AI – Ministry of Health</p>
      </div>
      <div style="padding: 24px; background: #FFF8E1; border-left: 4px solid #FF5252;">
        <h2 style="color: #D32F2F;">Your Medical Records Were Accessed</h2>
        <p><strong>Doctor:</strong> ${doctor.fullName || doctor.name}</p>
        <p><strong>Hospital:</strong> ${doctor.hospitalName || 'Not specified'}</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString('en-IN')}</p>
        <p><strong>Access Duration:</strong> 15 minutes (Auto-expires)</p>
        <p style="color: #666;">This is an automated alert. The doctor used the emergency break-glass protocol to access only your critical medical information (allergies, blood type, chronic conditions).</p>
        <p><strong>If this access was unauthorized, contact us immediately: <a href="tel:1800-MEDTRACE">1800-MEDTRACE</a></strong></p>
      </div>
    </div>
  `;

  await sendEmail(patient.email, '⚠️ Emergency Medical Access Alert – Action Required', html);
};

/**
 * Notify patient: New scan/record uploaded
 */
const notifyNewRecord = async (patient, doctor, record) => {
  const message = `[MedTrace AI] New medical record uploaded to your health passport by Dr. ${doctor.fullName || doctor.name} at ${doctor.hospitalName}. Type: ${record.reportTitle}. Login to view at medtrace.gov.in`;
  await sendSMS(patient.phone, message);
};

/**
 * Notify patient: QR code scanned
 */
const notifyQRScanned = async (patient, doctor) => {
  const message = `[MedTrace AI] Your health QR code was scanned by Dr. ${doctor.fullName || doctor.name}. If you did not share your QR code, please revoke access immediately at medtrace.gov.in`;
  await sendSMS(patient.phone, message);
};

module.exports = { sendSMS, sendEmail, notifyEmergencyAccess, notifyNewRecord, notifyQRScanned };

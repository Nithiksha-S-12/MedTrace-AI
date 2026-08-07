require('dotenv').config();

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'medtrace_dev_secret_key',

  mongodb: {
    uri: process.env.MONGODB_URI || null,
    useMock: !process.env.MONGODB_URI,
  },

  groq: {
    apiKey: process.env.GROQ_API_KEY || null,
    useMock: !process.env.GROQ_API_KEY,
  },

  clerk: {
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY || null,
    secretKey: process.env.CLERK_SECRET_KEY || null,
    useMock: !process.env.CLERK_SECRET_KEY,
  },

  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || null,
    authToken: process.env.TWILIO_AUTH_TOKEN || null,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || null,
    useMock: !process.env.TWILIO_ACCOUNT_SID,
  },
};

// Warn about missing keys
const warnings = [];
if (config.groq.useMock) warnings.push('GROQ_API_KEY missing — AI responses will use mock data');
if (config.mongodb.useMock) warnings.push('MONGODB_URI missing — using in-memory mock database');
if (config.clerk.useMock) warnings.push('CLERK keys missing — using mock authentication (demo mode)');
if (config.twilio.useMock) warnings.push('TWILIO keys missing — SMS notifications will log to console');

if (warnings.length > 0) {
  console.log('\n⚠️  MedTrace AI — Demo Mode Active');
  console.log('━'.repeat(50));
  warnings.forEach(w => console.log(`  ⚠  ${w}`));
  console.log('━'.repeat(50));
  console.log('  Copy .env.example to .env and fill in API keys for full functionality.\n');
}

module.exports = config;

const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.log('💾 Using in-memory mock database (no MONGODB_URI provided)');
    return;
  }

  try {
    console.log('\n⏳ Attempting to connect to MongoDB Atlas...');
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📂 Database Name: ${conn.connection.name}\n`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.log('⚠️  Falling back to in-memory mock database for the hackathon demo.');
    console.log('   (Ensure your IP is whitelisted in MongoDB Atlas if you want to use the real database)\n');
    // DO NOT process.exit(1). Let the app run in mock mode!
  }
};

module.exports = connectDB;

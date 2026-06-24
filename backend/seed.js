require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aggregator';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB');

  const existing = await User.findOne({ email: 'admin@tubemax.com' });
  if (existing) {
    console.log('Admin user already exists:', existing.email);
  } else {
    await User.create({
      username: 'admin',
      email: 'admin@tubemax.com',
      password: 'admin123',
      role: 'admin',
    });
    console.log('Admin user created: admin@tubemax.com / admin123');
  }

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});

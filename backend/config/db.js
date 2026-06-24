const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aggregator';

async function connectDatabases() {
  await mongoose.connect(MONGO_URI);
  console.log('MongoDB connected:', MONGO_URI);
}

module.exports = { connectDatabases };

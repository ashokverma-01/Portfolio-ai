const mongoose = require('mongoose');

async function connectDB(serviceName) {
  const uri = process.env.MONGO_URI;
  if (!uri || uri.includes('<username>') || uri.includes('<password>')) {
    throw new Error('MONGO_URI is missing. Copy .env.example to .env and set your MongoDB connection string.');
  }
  const dbSuffix = `_${serviceName.replace(/[^a-z0-9]+/gi, '_')}`;
  const configuredName = process.env.MONGO_DB_NAME || 'portfolio';
  await mongoose.connect(uri, {
    dbName: `${configuredName}${dbSuffix}`,
    serverSelectionTimeoutMS: 8000,
    autoIndex: process.env.NODE_ENV !== 'production'
  });
  console.log(`[${serviceName}] MongoDB connected`);
}

module.exports = connectDB;

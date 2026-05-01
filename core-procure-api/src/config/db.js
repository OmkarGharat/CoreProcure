const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Note: MongoDB Transactions require a Replica Set. 
    // Use Atlas or local RS (mongod --replSet rs0)
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
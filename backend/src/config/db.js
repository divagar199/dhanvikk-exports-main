import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Immediately disable query buffering so requests NEVER hang or time out when MongoDB is unreachable
mongoose.set('bufferCommands', false);

let isConnected = false;

mongoose.connection.on('connected', () => {
  isConnected = true;
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
});

mongoose.connection.on('error', () => {
  isConnected = false;
});

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dhanvikk_blooms';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500, // Quick fallback if local MongoDB is not running
      connectTimeoutMS: 2500,
    });
    isConnected = true;
    console.log(`🍃 MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`⚠️ MongoDB connection skipped (${error.message}). Operating in high-performance hybrid memory mode.`);
    isConnected = false;
    return null;
  }
};

export const getDBStatus = () => isConnected && mongoose.connection.readyState === 1;


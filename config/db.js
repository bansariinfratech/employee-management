import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.connection_string, 
     
    );
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  } 
};

export default express();
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_URI;
console.log('Connecting to:', uri);

try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected successfully!');
    process.exit(0);
} catch (err) {
    console.error('Connection failed:');
    console.error(err);
    process.exit(1);
}

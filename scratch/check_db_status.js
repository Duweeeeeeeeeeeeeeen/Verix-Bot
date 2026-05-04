import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_URI;

console.log('Testing connection to:', uri);

try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('CONNECTED successfully!');
    process.exit(0);
} catch (err) {
    console.error('CONNECTION FAILED:');
    console.error(err);
    process.exit(1);
}

import mongoose from 'mongoose';
import 'dotenv/config';

const teacherUri = process.env.MONGODB_TEACHER;

if (!teacherUri) {
    console.warn("⚠️ MONGODB_TEACHER is not defined in .env. Teacher features may fail.");
}

// Create a separate connection for the Teacher DB
export const teacherConnection = mongoose.createConnection(teacherUri || '', {
    // Standard Mongoose options (autoIndex, etc. are default true)
});

teacherConnection.on('connected', () => {
    console.log(`✅ Teacher MongoDB Connected to: ${teacherConnection.name}`);
});

teacherConnection.on('error', (err) => {
    console.error('❌ Teacher MongoDB Connection Error:', err);
});

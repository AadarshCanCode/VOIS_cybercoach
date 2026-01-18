import mongoose from 'mongoose';
import { teacherConnection } from '../lib/teacherDb.js';

const teacherSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    organization: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Use the specific connection to create the model
export const Teacher = teacherConnection.model('Teacher', teacherSchema);

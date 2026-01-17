import mongoose from 'mongoose';
import { teacherConnection } from '../lib/teacherDb.js';

const quizSchema = new mongoose.Schema({
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true }, // Should match one of the options
});

const moduleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true }, // Rich text or video URL
    quiz: { type: quizSchema, required: false }, // Optional quiz per module
});

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    teacherEmail: { type: String, required: true }, // Link to author
    modules: [moduleSchema],
    difficulty: { type: String, default: 'Intermediate' }, // Added for frontend compatibility
    duration: { type: String, default: '10 hours' }, // Added for frontend compatibility
    createdAt: { type: Date, default: Date.now },
    published: { type: Boolean, default: false }
});

export const Course = teacherConnection.model('Course', courseSchema);

import mongoose from 'mongoose';

const proctoringLogSchema = new mongoose.Schema({
    studentId: { type: String, required: true, index: true },
    courseId: { type: String, required: true, index: true },
    attemptId: { type: String, required: true, index: true },
    eventType: {
        type: String,
        required: true,
        enum: ['tab-switch', 'exit-fullscreen', 'window-blur', 'face-missing', 'multiple-faces', 'suspicious-activity']
    },
    details: { type: mongoose.Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now }
});

export const ProctoringLog = mongoose.model('ProctoringLog', proctoringLogSchema);

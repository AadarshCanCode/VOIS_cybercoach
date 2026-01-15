import mongoose from 'mongoose';

const vuStudentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    vu_email: { type: String, required: true, unique: true },
    faculty_name: { type: String, required: true },
    year: { type: String, required: true },
    department: { type: String, required: true },
    registered_at: { type: Date, default: Date.now },
    progress: [{
        course_id: String,
        module_id: String,
        completed: Boolean,
        quiz_score: Number,
        completed_at: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

const VUStudent = mongoose.models.VUStudent || mongoose.model('VUStudent', vuStudentSchema);

export default VUStudent;

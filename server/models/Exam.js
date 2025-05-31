import mongoose from 'mongoose';

const examSchema = new mongoose.Schema({
  title: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  duration: { type: Number, required: true }, // Duration in minutes
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Exam', examSchema);
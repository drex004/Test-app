import mongoose from 'mongoose';

const examResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  attemptNumber: {
    type: Number,
    default: 1, // Track which attempt this is (1st, 2nd, etc.)
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('ExamResult', examResultSchema);
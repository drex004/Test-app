import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
});

export default mongoose.model('Question', questionSchema);
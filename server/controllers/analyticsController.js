import ExamResult from '../models/ExamResult.js';

export const getAnalytics = async (req, res) => {
  try {
    const results = await ExamResult.find({ userId: req.user.id }).populate('examId', 'title');
    res.json(results);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};
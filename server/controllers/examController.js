import mongoose from 'mongoose';
import moment from 'moment';
import Question from '../models/Question.js';
import Exam from '../models/Exam.js';
import ExamResult from '../models/ExamResult.js';

export const getExams = async (req, res) => {
  try {
    let exams;
    console.log('Fetching exams for user:', req.user);
    if (req.query.createdBy === 'me' && req.user.role === 'examiner') {
      exams = await Exam.find({ createdBy: req.user.id });
    } else if (req.user.role === 'student') {
      exams = await Exam.find();
    } else {
      return res.status(403).json({ msg: 'Examiners cannot view available exams' });
    }
    console.log('Exams fetched:', exams);
    res.json(exams);
  } catch (err) {
    console.error('Error in getExams:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const getExamById = async (req, res) => {
  const { examId } = req.params;
  console.log('Fetching examId:', examId);
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ msg: 'Examiners cannot access exams' });
    }
    if (!mongoose.Types.ObjectId.isValid(examId)) {
      console.log('Invalid examId:', examId);
      return res.status(400).json({ msg: 'Invalid exam ID' });
    }
    const exam = await Exam.findById(examId);
    console.log('Exam found:', exam);
    if (!exam) {
      return res.status(404).json({ msg: 'Exam not found' });
    }
    res.json(exam);
  } catch (err) {
    console.error('Error in getExamById:', err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

export const createExam = async (req, res) => {
  if (req.user.role !== 'examiner') {
    return res.status(403).json({ msg: 'Only examiners can create exams' });
  }
  const { title, duration, questions } = req.body;
  console.log('Creating exam with data:', { title, duration, questions });
  try {
    const exam = new Exam({
      title,
      duration,
      createdBy: req.user.id,
    });
    await exam.save();
    const questionDocs = questions.map((q) => ({
      text: q.text,
      options: q.options,
      correctAnswer: q.correctAnswer,
      examId: exam._id,
    }));
    console.log('Saving questions:', questionDocs);
    await Question.insertMany(questionDocs);
    console.log('Exam created:', exam);
    res.status(201).json(exam);
  } catch (err) {
    console.error('Error in createExam:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const getRandomQuestions = async (req, res) => {
  const { examId } = req.params;
  console.log('Fetching questions for examId:', examId);
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ msg: 'Examiners cannot access exam questions' });
    }
    if (!mongoose.Types.ObjectId.isValid(examId)) {
      console.log('Invalid examId:', examId);
      return res.status(400).json({ msg: 'Invalid exam ID' });
    }
    const exam = await Exam.findById(examId);
    console.log('Exam found:', exam);
    if (!exam) {
      return res.status(404).json({ msg: 'Exam not found' });
    }
    const questions = await Question.aggregate([
      { $match: { examId: new mongoose.Types.ObjectId(examId) } },
      { $sample: { size: 10 } },
    ]);
    console.log('Questions fetched:', questions);
    res.json(questions);
  } catch (err) {
    console.error('Error in getRandomQuestions:', err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

export const submitExam = async (req, res) => {
  const { answers, examId, startTime } = req.body;
  console.log('Submitting exam:', { examId, userId: req.user.id });
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ msg: 'Examiners cannot submit exams' });
    }
    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return res.status(400).json({ msg: 'Invalid exam ID' });
    }
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ msg: 'Exam not found' });
    }

    // Check retake eligibility
    const previousAttempts = await ExamResult.countDocuments({
      userId: req.user.id,
      examId,
    });
    const attemptNumber = previousAttempts + 1;
    if (previousAttempts >= 5) {
      return res.status(403).json({ msg: 'Maximum retake attempts reached' });
    }

    // Validate time
    const examEnd = moment(startTime).add(exam.duration, 'minutes');
    if (moment().isAfter(examEnd)) {
      return res.status(400).json({ msg: 'Exam time expired' });
    }

    const questions = await Question.find({ examId });
    let score = 0;
    questions.forEach((q) => {
      if (answers[q._id] && answers[q._id] === q.correctAnswer) {
        score += 1;
      }
    });

    const result = new ExamResult({
      userId: req.user.id,
      examId,
      score,
      total: questions.length,
      attemptNumber,
      date: new Date(),
    });
    await result.save();
    console.log('Exam result saved:', result);

    res.json({ score, total: questions.length });
  } catch (err) {
    console.error('Error in submitExam:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const getUserResults = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ msg: 'Examiners cannot view exam results' });
    }
    const results = await ExamResult.find({ userId: req.user.id })
      .populate('examId', 'title duration')
      .sort({ date: -1 });
    console.log('User results fetched:', results);
    res.json(results);
  } catch (err) {
    console.error('Error in getUserResults:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const checkRetakeEligibility = async (req, res) => {
  const { examId } = req.params;
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ msg: 'Examiners cannot retake exams' });
    }
    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return res.status(400).json({ msg: 'Invalid exam ID' });
    }
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ msg: 'Exam not found' });
    }
    const previousAttempts = await ExamResult.countDocuments({
      userId: req.user.id,
      examId,
    });
    const canRetake = previousAttempts < 5;
    console.log('Retake eligibility:', { examId, canRetake, previousAttempts });
    res.json({ canRetake, attemptsLeft: 5 - previousAttempts });
  } catch (err) {
    console.error('Error in checkRetakeEligibility:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};
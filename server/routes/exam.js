import express from 'express';
import auth from '../middleware/auth.js';
import { createExam, getExams, getRandomQuestions, submitExam ,getExamById,getUserResults,checkRetakeEligibility} from '../controllers/examController.js';

const router = express.Router();

router.post('/', auth, createExam); // Create a new exam (examiner only)
router.get('/:examId', auth, getExamById); 
router.get('/', auth, getExams); // List exams created by the user
router.get('/:examId/questions', auth, getRandomQuestions); // Get random questions
router.post('/:examId/submit', auth, submitExam); // Submit exam answers
router.get('/:examId/eligibility', auth, checkRetakeEligibility); // New: Check retake
router.get('/results/user', auth, getUserResults); // New: Get user results
export default router;
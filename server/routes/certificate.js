import express from 'express';
import auth from '../middleware/auth.js';
import { generateCertificate } from '../controllers/certificateController.js';

const router = express.Router();

router.post('/', auth, generateCertificate);

export default router;
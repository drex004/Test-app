import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';


export const login = [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').exists().withMessage('Password is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

      const payload = { user: { id: user.id, role: user.role } };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token, user: { name: user.name, email: user.email, role: user.role } });
    } catch (err) {
      res.status(500).json({ msg: 'Server error' });
    }
  },
];


export const register = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'examiner', 'student']).withMessage('Invalid role'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password, role } = req.body;
    try {
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ msg: 'User already exists' });

      user = new User({ name, email, password, role });
      await user.save();

      const payload = { user: { id: user.id, role: user.role } };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token, user: { name: user.name, email: user.email, role: user.role } });
    } catch (err) {
      res.status(500).json({ msg: 'Server error' });
    }
  },
];

// Get current user
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); // Exclude password
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Update current user
export const updateUser = [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Invalid email'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body;
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ msg: 'User not found' });

      if (name) user.name = name;
      if (email) user.email = email;
      if (password) user.password = await bcrypt.hash(password, 10);

      await user.save();
      res.json({ name: user.name, email: user.email, role: user.role });
    } catch (err) {
      res.status(500).json({ msg: 'Server error' });
    }
  },
];
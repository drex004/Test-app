import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import examRoutes from './routes/exam.js';
import analyticsRoutes from './routes/analytics.js';
import certificateRoutes from './routes/certificate.js';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv'; 

dotenv.config(); 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer=createServer(app);
const io=new Server(httpServer,{
  cors:{
    origin:'http://localhost:5173',
    methods:['GET','POST'],
  },
});


connectDB();

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/certificate', certificateRoutes);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('joinExam', (examId) => {
    socket.join(examId);
    console.log(`Client joined exam: ${examId}`);
  });

  socket.on('timerUpdate', ({ examId, timeRemaining }) => {
    console.log(`Time remaining for exam ${examId}: ${timeRemaining}s`);
    if (timeRemaining <= 0) {
      io.to(examId).emit('examEnded', { msg: 'Time is up, exam auto-submitted' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) =>
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'))
  );
}

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
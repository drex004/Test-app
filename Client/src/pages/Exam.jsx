import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import io from 'socket.io-client';
import moment from 'moment';
import _ from 'lodash';

const socket = io('http://localhost:5000', { reconnection: true });

const Exam = () => {
  const { examId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [exam, setExam] = useState(null);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user?.role === 'examiner') {
      setError('Examiners cannot take exams.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to access the exam');
      console.log('No token found');
      return;
    }

    // Check retake eligibility
    fetch(`/api/exams/${examId}/eligibility`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to check eligibility');
        return res.json();
      })
      .then((data) => {
        if (!data.canRetake) {
          setError('No retake attempts left for this exam');
        }
      })
      .catch((err) => {
        console.error('Eligibility check error:', err.message);
        setError(err.message);
      });

    // Fetch exam details
    fetch(`/api/exams/${examId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        console.log('Exam fetch status:', res.status, res.statusText);
        if (!res.ok) throw new Error(`Failed to fetch exam: ${res.status} ${res.statusText}`);
        return res.json();
      })
      .then((examData) => {
        console.log('Exam data:', examData);
        setExam(examData);
        setTimeRemaining(examData.duration * 60);
      })
      .catch((err) => {
        console.error('Exam fetch error:', err.message);
        setError(err.message);
      });

    // Fetch questions
    fetch(`/api/exams/${examId}/questions`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        console.log('Questions fetch status:', res.status, res.statusText);
        if (!res.ok) throw new Error(`Failed to fetch questions: ${res.status} ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        console.log('Questions data:', data);
        setQuestions(_.shuffle(Array.isArray(data) ? data : []));
      })
      .catch((err) => {
        console.error('Questions fetch error:', err.message);
        setError(err.message);
      });

    // Socket.IO
    socket.emit('joinExam', examId);
    socket.on('examEnded', (data) => {
      alert(data.msg);
      handleSubmit(true);
    });

    return () => {
      socket.off('examEnded');
    };
  }, [examId, user]);

  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 1;
        socket.emit('timerUpdate', { examId, timeRemaining: newTime });
        if (newTime <= 0) {
          handleSubmit(true);
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, examId]);

  const handleAnswerChange = (questionId, option) => {
    setAnswers({ ...answers, [questionId]: option });
  };

  const handleSubmit = (auto = false) => {
    if (user?.role === 'examiner') {
      setError('Examiners cannot submit exam answers.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to submit the exam');
      return;
    }

    fetch(`/api/exams/${examId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        answers,
        examId,
        startTime: moment()
          .subtract(exam?.duration * 60 - timeRemaining, 'seconds')
          .toISOString(),
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Submission failed: ${res.status} ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        navigate('/result', { state: { score: data.score, total: data.total } });
      })
      .catch((err) => {
        setError(err.message);
        if (auto) alert('Time expired, answers submitted');
      });
  };

  // Format duration as mm:ss
  const formatDuration = (seconds) => {
    const duration = moment.duration(seconds, 'seconds');
    const minutes = Math.floor(duration.asMinutes()).toString().padStart(2, '0');
    const secs = duration.seconds().toString().padStart(2, '0');
    return `${minutes}:${secs}`;
  };

  console.log('Render state:', { error, questions, timeRemaining, exam });

  return (
    <div className="content">
      <h2 style={{ textAlign: 'center' }}>Exam</h2>
      {error ? (
        <p style={{ textAlign: 'center', color: '#e74c3c' }}>{error}</p>
      ) : !exam || timeRemaining === null ? (
        <p style={{ textAlign: 'center' }}>Loading exam...</p>
      ) : (
        <>
          <p
            style={{
              textAlign: 'center',
              fontSize: '1.2rem',
              color: timeRemaining <= 30 ? '#e74c3c' : '#34495e',
            }}
          >
            Time Remaining: {formatDuration(timeRemaining)}
          </p>
          {questions.length === 0 ? (
            <p style={{ textAlign: 'center' }}>No questions available for this exam.</p>
          ) : (
            <>
              {questions.map((q, index) => (
                <div
                  key={q._id || index}
                  style={{
                    marginBottom: '1.5rem',
                    padding: '1rem',
                    background: '#f9fbfc',
                    borderRadius: '8px',
                    border: '1px solid #e0e4e8',
                  }}
                >
                  <p style={{ fontWeight: '600', marginBottom: '0.75rem' }}>
                    {index + 1}. {q.text}
                  </p>
                  {q.options && Array.isArray(q.options) ? (
                    q.options.map((opt, i) => (
                      <label key={i} style={{ display: 'block', margin: '0.5rem 0', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name={`q${index}`}
                          value={opt}
                          onChange={() => handleAnswerChange(q._id, opt)}
                          style={{ marginRight: '0.75rem', accentColor: '#3498db' }}
                          disabled={user?.role === 'examiner' || timeRemaining <= 0}
                        />
                        {opt}
                      </label>
                    ))
                  ) : (
                    <p style={{ color: '#e74c3c' }}>Invalid options</p>
                  )}
                </div>
              ))}
              <button
                onClick={() => handleSubmit(false)}
                disabled={user?.role === 'examiner' || timeRemaining <= 0}
                style={{
                  background:
                    timeRemaining <= 0 ? '#ccc' : 'linear-gradient(90deg, #3498db 0%, #2980b9 100%)',
                  color: '#fff',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '5px',
                  cursor: timeRemaining <= 0 ? 'not-allowed' : 'pointer',
                }}
              >
                Submit Exam
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Exam;
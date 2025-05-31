import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ExamCreation = () => {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [questions, setQuestions] = useState([
    { text: '', options: ['', '', '', ''], correctAnswer: '' },
  ]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    if (field === 'text' || field === 'correctAnswer') {
      newQuestions[index][field] = value;
    } else {
      newQuestions[index].options[field] = value;
    }
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, { text: '', options: ['', '', '', ''], correctAnswer: '' }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to create an exam');
      return;
    }

    try {
      const res = await fetch('/api/exams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, duration: Number(duration), questions }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.msg || 'Failed to create exam');
      }
      navigate('/dashboard');
    } catch (err) {
      console.error('Exam creation error:', err.message);
      setError(err.message);
    }
  };

  return (
    <div className="content">
      <h2 style={{ textAlign: 'center' }}>Create Exam</h2>
      {error && (
        <p style={{ textAlign: 'center', color: '#e74c3c' }}>{error}</p>
      )}
      <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Exam Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #e0e4e8',
              borderRadius: '5px',
            }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Duration (minutes)
          </label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
            min="1"
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #e0e4e8',
              borderRadius: '5px',
            }}
          />
        </div>
        {questions.map((q, index) => (
          <div
            key={index}
            style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              border: '1px solid #e0e4e8',
              borderRadius: '5px',
            }}
          >
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              Question {index + 1}
            </label>
            <input
              type="text"
              value={q.text}
              onChange={(e) => handleQuestionChange(index, 'text', e.target.value)}
              placeholder="Question text"
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                marginBottom: '0.5rem',
                border: '1px solid #e0e4e8',
                borderRadius: '5px',
              }}
            />
            {q.options.map((opt, optIndex) => (
              <input
                key={optIndex}
                type="text"
                value={opt}
                onChange={(e) => handleQuestionChange(index, optIndex, e.target.value)}
                placeholder={`Option ${optIndex + 1}`}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  marginBottom: '0.5rem',
                  border: '1px solid #e0e4e8',
                  borderRadius: '5px',
                }}
              />
            ))}
            <input
              type="text"
              value={q.correctAnswer}
              onChange={(e) => handleQuestionChange(index, 'correctAnswer', e.target.value)}
              placeholder="Correct Answer"
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #e0e4e8',
                borderRadius: '5px',
              }}
            />
          </div>
        ))}
        <button
          type="button"
          onClick={addQuestion}
          style={{
            padding: '0.5rem 1rem',
            background: '#3498db',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            marginBottom: '1rem',
            cursor: 'pointer',
          }}
        >
          Add Question
        </button>
        <button
          type="submit"
          style={{
            padding: '0.5rem 1rem',
            background: '#2ecc71',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Create Exam
        </button>
      </form>
    </div>
  );
};

export default ExamCreation;
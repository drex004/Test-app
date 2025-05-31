import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Fetch analytics
    fetch('/api/analytics', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((results) => setData(results.map((r) => ({ date: r.date, score: r.score }))))
      .catch((err) => console.error('Analytics fetch error:', err));

    // Fetch exams
    const endpoint = user?.role === 'examiner' ? '/api/exams?createdBy=me' : '/api/exams';
    fetch(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch exams: ${res.status}`);
        return res.json();
      })
      .then((examData) => {
        console.log('Fetched exams:', examData);
        setExams(examData);
      })
      .catch((err) => console.error('Exams fetch error:', err));

    // Fetch user results (only for students)
    if (user?.role === 'student') {
      fetch('/api/exams/results/user', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error(`Failed to fetch results: ${res.status}`);
          return res.json();
        })
        .then((resultData) => {
          console.log('Fetched results:', resultData);
          setResults(resultData);
        })
        .catch((err) => console.error('Results fetch error:', err));
    }
  }, [user]);

  // Check retake eligibility (only for students)
  const checkRetake = async (examId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/exams/${examId}/eligibility`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to check eligibility');
      const data = await res.json();
      return data.canRetake;
    } catch (err) {
      console.error('Retake check error:', err.message);
      return false;
    }
  };

  return (
    <div className="content">
      <h2 style={{ textAlign: 'center' }}>
        {user?.role === 'examiner' ? 'Examiner Dashboard' : 'Student Dashboard'}
      </h2>

      {user?.role === 'examiner' ? (
        <>
          <Link
            to="/exam-creation"
            style={{
              display: 'inline-block',
              marginBottom: '1rem',
              padding: '0.5rem 1rem',
              background: '#3498db',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '5px',
            }}
          >
            Create Exam
          </Link>
          <h3>Created Exams</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {exams.map((exam) => (
              <li
                key={exam._id}
                style={{
                  padding: '0.5rem',
                  borderBottom: '1px solid #e0e4e8',
                }}
              >
                {exam.title} ({exam.duration} minutes)
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <h3>Available Exams</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {exams.map((exam) => (
              <li
                key={exam._id}
                style={{
                  padding: '0.5rem',
                  borderBottom: '1px solid #e0e4e8',
                }}
              >
                <Link
                  to={`/exam/${exam._id}`}
                  style={{ textDecoration: 'none', color: '#34495e' }}
                >
                  {exam.title} ({exam.duration} minutes)
                </Link>
              </li>
            ))}
          </ul>

          <h3>Past Exams</h3>
          {results.length === 0 ? (
            <p>No past exams taken.</p>
          ) : (
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                marginTop: '1rem',
              }}
            >
              <thead>
                <tr>
                  <th style={{ border: '1px solid #e0e4e8', padding: '0.5rem' }}>
                    Exam Title
                  </th>
                  <th style={{ border: '1px solid #e0e4e8', padding: '0.5rem' }}>
                    Score
                  </th>
                  <th style={{ border: '1px solid #e0e4e8', padding: '0.5rem' }}>
                    Attempt
                  </th>
                  <th style={{ border: '1px solid #e0e4e8', padding: '0.5rem' }}>
                    Date
                  </th>
                  <th style={{ border: '1px solid #e0e4e8', padding: '0.5rem' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result._id}>
                    <td style={{ border: '1px solid #e0e4e8', padding: '0.5rem' }}>
                      {result.examId?.title || 'Unknown Exam'}
                    </td>
                    <td style={{ border: '1px solid #e0e4e8', padding: '0.5rem' }}>
                      {result.score}/{result.total}
                    </td>
                    <td style={{ border: '1px solid #e0e4e8', padding: '0.5rem' }}>
                      {result.attemptNumber}/5
                    </td>
                    <td style={{ border: '1px solid #e0e4e8', padding: '0.5rem' }}>
                      {new Date(result.date).toLocaleDateString()}
                    </td>
                    <td style={{ border: '1px solid #e0e4e8', padding: '0.5rem' }}>
                      <button
                        onClick={async () => {
                          const canRetake = await checkRetake(result.examId._id);
                          if (canRetake) {
                            window.location.href = `/exam/${result.examId._id}`;
                          } else {
                            alert('No retake attempts left');
                          }
                        }}
                        style={{
                          padding: '0.3rem 0.6rem',
                          background: result.attemptNumber >= 5 ? '#ccc' : '#3498db',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: result.attemptNumber >= 5 ? 'not-allowed' : 'pointer',
                        }}
                        disabled={result.attemptNumber >= 5}
                      >
                        Retake
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      <h3 style={{ marginTop: '2rem' }}>Performance Trend</h3>
      <LineChart
        width={600}
        height={300}
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="score" stroke="#3498db" />
      </LineChart>
    </div>
  );
};

export default Dashboard;
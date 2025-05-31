import { useLocation } from 'react-router-dom';

const Result = () => {
  const { state } = useLocation();
  const { score, total } = state || {};
  const userName = 'Test Student'; 
  const examName = 'Sample Exam'; 

  const handleDownload = async () => {
    try {
      const res = await fetch('/api/certificate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ userName, examName, score }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Failed to download certificate: ${res.status} - ${errorData.msg}`);
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${userName}-${examName}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="content">
      <h2 style={{ textAlign: 'center' }}>Exam Result</h2>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '1.2rem', margin: '0.75rem 0', color: '#2c3e50' }}>
          <strong>Name:</strong> {userName}
        </p>
        <p style={{ fontSize: '1.2rem', margin: '0.75rem 0', color: '#2c3e50' }}>
          <strong>Exam:</strong> {examName}
        </p>
        <p style={{ fontSize: '1.2rem', margin: '0.75rem 0', color: '#2c3e50' }}>
          <strong>Score:</strong> {score}/{total}
        </p>
        <button onClick={handleDownload}>Download Certificate</button>
      </div>
    </div>
  );
};

export default Result;
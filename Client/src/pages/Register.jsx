import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.msg || 'Registration failed');
      }
      // Only navigate to login on success
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message);
    }
  };

  return (
    <div className="content">
      <h2 style={{ textAlign: 'center' }}>Register</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name" style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>Name</label>
        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Name" required />
        <label htmlFor="email" style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>Email</label>
        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
        <label htmlFor="password" style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>Password</label>
        <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" required />
        <label htmlFor="role" style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>Role</label>
        <select id="role" name="role" value={formData.role} onChange={handleChange}>
          <option value="student">Student</option>
          <option value="examiner">Examiner</option>
        </select>
        <button type="submit">Register</button>
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        <p style={{ textAlign: 'center', marginTop: '10px' }}>
          Already have an account? <Link to="/">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
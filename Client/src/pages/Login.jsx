import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../redux/authSlice.js';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      dispatch(login({ token: data.token, user: data.user }));
      navigate('/dashboard');
    }
  };

  return (
    <div className="content">
      <h2 style={{ textAlign: 'center'}}>Login</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email" style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>Email</label>
        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
        <label htmlFor="password" style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>Password</label>
        <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" required />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const Workspace = () => {
  const { user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((res) => res.json())
      .then((data) => setFormData({ name: data.name, email: data.email, password: '' }))
      .catch(() => setMessage('Failed to load user data'));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Profile updated successfully');
      } else {
        setMessage(data.msg || 'Failed to update profile');
      }
    } catch (err) {
      setMessage('Server error');
    }
  };

  return (
    <div className="content">
      <h2 style={{ textAlign: 'center' }}>Your Workspace</h2>
      <div>
        <h3 style={{ marginBottom: '1rem' }}>Profile Information</h3>
        <p><strong>Name:</strong> {user?.name || formData.name}</p>
        <p><strong>Email:</strong> {user?.email || formData.email}</p>
        <p><strong>Role:</strong> {user?.role}</p>
        <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>Update Profile</h3>
        <form onSubmit={handleSubmit}>
          <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name" />
          <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" />
          <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="New Password (optional)" />
          <button type="submit">Update Profile</button>
        </form>
        {message && <p style={{ color: message.includes('success') ? 'green' : 'red', marginTop: '1rem' }}>{message}</p>}
      </div>
    </div>
  );
};

export default Workspace;
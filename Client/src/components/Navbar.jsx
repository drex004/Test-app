import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="navbar-brand">Exam.in</Link>
      <div className="navbar-links">
        {!user ? (
          <>
            <Link to="/">Login</Link>
            <Link to="/register">Register</Link>
          </>
        ) : (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/workspace">Workspace</Link>
            {user?.role === 'examiner' && <Link to="/exam-creation">Create Exam</Link>}
            <button
              onClick={handleLogout}
              style={{
                background: 'none',
                border: 'none',
                color: '#ecf0f1',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
              }}
              onMouseEnter={(e) => (e.target.style.color = '#3498db')}
              onMouseLeave={(e) => (e.target.style.color = '#ecf0f1')}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
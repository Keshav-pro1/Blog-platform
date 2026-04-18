import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-xl font-bold text-gray-800">
            Blog Platform
          </Link>
          <div className="flex space-x-4">
            <Link to="/" className="text-gray-600 hover:text-gray-800">Home</Link>
            {user ? (
              <>
                {(user.role === 'writer' || user.role === 'admin') && (
                  <Link to="/write" className="text-gray-600 hover:text-gray-800">Write</Link>
                )}
                <Link to="/dashboard" className="text-gray-600 hover:text-gray-800">Dashboard</Link>
                <button onClick={handleLogout} className="text-gray-600 hover:text-gray-800">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-gray-800">Login</Link>
                <Link to="/register" className="text-gray-600 hover:text-gray-800">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
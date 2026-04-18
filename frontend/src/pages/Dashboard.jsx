import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      fetchUserBlogs();
    }
  }, []);

  const fetchUserBlogs = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('/api/blogs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filter blogs by current user or all if admin
      const userData = JSON.parse(localStorage.getItem('user'));
      if (userData.role === 'admin') {
        setBlogs(response.data);
      } else {
        setBlogs(response.data.filter(blog => blog.author_id === userData.id));
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (blogId) => {
    const token = localStorage.getItem('token');
    if (!confirm('Are you sure you want to delete this blog?')) return;

    try {
      await axios.delete(`/api/blogs/${blogId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBlogs(blogs.filter(blog => blog.id !== blogId));
    } catch (error) {
      console.error('Error deleting blog:', error);
    }
  };

  if (loading) return <div className="text-center">Loading...</div>;
  if (!user) return <div className="text-center">Please login to view dashboard</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="mb-6">
        <Link to="/write" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Write New Blog
        </Link>
      </div>

      <div className="space-y-4">
        {blogs.map((blog) => (
          <div key={blog.id} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-2">{blog.title}</h2>
            <p className="text-gray-600 mb-2">{blog.content.substring(0, 200)}...</p>
            <div className="text-sm text-gray-500 mb-4">
              {blog.category_name} | {new Date(blog.created_at).toLocaleDateString()}
            </div>
            <div className="flex space-x-4">
              <Link to={`/blog/${blog.id}`} className="text-blue-600 hover:text-blue-800">
                View
              </Link>
              <Link to={`/write?edit=${blog.id}`} className="text-green-600 hover:text-green-800">
                Edit
              </Link>
              <button
                onClick={() => handleDelete(blog.id)}
                className="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchBlogs();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBlogs = async () => {
    try {
      const params = selectedCategory ? { category: selectedCategory } : {};
      const response = await axios.get('/api/blogs', { params });
      setBlogs(response.data);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center">Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Latest Blogs</h1>
      
      <div className="mb-6">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog) => (
          <div key={blog.id} className="bg-white rounded-lg shadow-md p-6">
            {blog.image_url && (
              <img src={blog.image_url} alt={blog.title} className="w-full h-48 object-cover rounded mb-4" />
            )}
            <h2 className="text-xl font-semibold mb-2">
              <Link to={`/blog/${blog.id}`} className="text-blue-600 hover:text-blue-800">
                {blog.title}
              </Link>
            </h2>
            <p className="text-gray-600 mb-2">{blog.content.substring(0, 150)}...</p>
            <div className="text-sm text-gray-500">
              By {blog.author} | {blog.category_name} | {new Date(blog.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
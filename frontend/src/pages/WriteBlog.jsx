import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const WriteBlog = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category_id: '',
    image_url: ''
  });
  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      if (parsed.role !== 'writer' && parsed.role !== 'admin') {
        navigate('/');
        return;
      }
    } else {
      navigate('/login');
      return;
    }

    fetchCategories();
    if (editId) {
      fetchBlog(editId);
    }
  }, [editId, navigate]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBlog = async (id) => {
    try {
      const response = await axios.get(`/api/blogs/${id}`);
      setFormData({
        title: response.data.title,
        content: response.data.content,
        category_id: response.data.category_id || '',
        image_url: response.data.image_url || ''
      });
    } catch (error) {
      console.error('Error fetching blog:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('content', formData.content);
      submitData.append('category_id', formData.category_id);
      if (imageFile) {
        submitData.append('image', imageFile);
      } else if (formData.image_url) {
        submitData.append('image_url', formData.image_url);
      }

      if (editId) {
        await axios.put(`/api/blogs/${editId}`, submitData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        await axios.post('/api/blogs', submitData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving blog:', error);
      alert('Error saving blog');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
      <h1 className="text-2xl font-bold mb-6">{editId ? 'Edit Blog' : 'Write New Blog'}</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Category</label>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
          <p className="text-sm text-gray-500 mt-1">Or provide image URL below</p>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Image URL (optional)</label>
          <input
            type="url"
            name="image_url"
            value={formData.image_url}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Content</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            rows="10"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : (editId ? 'Update Blog' : 'Publish Blog')}
        </button>
      </form>
    </div>
  );
};

export default WriteBlog;
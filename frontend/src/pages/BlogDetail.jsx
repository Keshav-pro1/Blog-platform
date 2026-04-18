import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const BlogDetail = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchBlog();
    fetchComments();
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  }, [id]);

  const fetchBlog = async () => {
    try {
      const response = await axios.get(`/api/blogs/${id}`);
      setBlog(response.data);
    } catch (error) {
      console.error('Error fetching blog:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await axios.get(`/api/comments/${id}`);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return alert('Please login to comment');

    try {
      await axios.post(`/api/comments/${id}`, { content: newComment }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`/api/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  if (loading) return <div className="text-center">Loading...</div>;
  if (!blog) return <div className="text-center">Blog not found</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <article className="bg-white rounded-lg shadow-md p-8 mb-8">
        {blog.image_url && (
          <img src={blog.image_url} alt={blog.title} className="w-full h-64 object-cover rounded mb-6" />
        )}
        <h1 className="text-4xl font-bold mb-4">{blog.title}</h1>
        <div className="text-gray-600 mb-6">
          By {blog.author} | {blog.category_name} | {new Date(blog.created_at).toLocaleDateString()}
        </div>
        <div className="prose max-w-none">
          {blog.content.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4">{paragraph}</p>
          ))}
        </div>
      </article>

      <section className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6">Comments</h2>
        
        {user && (
          <form onSubmit={handleCommentSubmit} className="mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
              rows="4"
              required
            />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Post Comment
            </button>
          </form>
        )}

        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="border-b border-gray-200 pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold">{comment.username}</div>
                  <div className="text-gray-600 text-sm">{new Date(comment.created_at).toLocaleDateString()}</div>
                  <p className="mt-2">{comment.content}</p>
                </div>
                {user && user.id === comment.user_id && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default BlogDetail;
const express = require('express');
const Joi = require('joi');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

const commentSchema = Joi.object({
  content: Joi.string().min(1).required()
});

// Get comments for a blog
router.get('/:blogId', async (req, res) => {
  try {
    const db = req.app.get('db');
    const result = await db.query(`
      SELECT c.*, u.username
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.blog_id = $1
      ORDER BY c.created_at DESC
    `, [req.params.blogId]);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create comment
router.post('/:blogId', authenticateToken, async (req, res) => {
  try {
    const { error } = commentSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { content } = req.body;
    const blogId = req.params.blogId;
    const userId = req.user.id;
    const db = req.app.get('db');

    // Check if blog exists
    const blogResult = await db.query('SELECT id FROM blogs WHERE id = $1', [blogId]);
    if (blogResult.rows.length === 0) return res.status(404).json({ error: 'Blog not found' });

    const result = await db.query(
      'INSERT INTO comments (blog_id, user_id, content) VALUES ($1, $2, $3) RETURNING id',
      [blogId, userId, content]
    );

    res.status(201).json({ message: 'Comment added', commentId: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete comment
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.user.id;
    const db = req.app.get('db');

    // Check ownership
    const commentResult = await db.query('SELECT user_id FROM comments WHERE id = $1', [commentId]);
    if (commentResult.rows.length === 0) return res.status(404).json({ error: 'Comment not found' });
    if (commentResult.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await db.query('DELETE FROM comments WHERE id = $1', [commentId]);
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
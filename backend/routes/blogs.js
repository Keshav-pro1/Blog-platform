const express = require('express');
const multer = require('multer');
const path = require('path');
const Joi = require('joi');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Validation schemas
const blogSchema = Joi.object({
  title: Joi.string().min(1).max(255).required(),
  content: Joi.string().min(1).required(),
  category_id: Joi.number().integer().optional(),
  image_url: Joi.string().uri().optional()
});

// Get all blogs with pagination and category filter
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    const offset = (page - 1) * limit;
    const db = req.app.get('db');

    let query = `
      SELECT b.*, u.username as author, c.name as category_name
      FROM blogs b
      JOIN users u ON b.author_id = u.id
      LEFT JOIN categories c ON b.category_id = c.id
    `;
    let params = [];
    let paramIndex = 1;

    if (category) {
      query += ` WHERE c.name = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    query += ` ORDER BY b.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), offset);

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single blog
router.get('/:id', async (req, res) => {
  try {
    const db = req.app.get('db');
    const result = await db.query(`
      SELECT b.*, u.username as author, c.name as category_name
      FROM blogs b
      JOIN users u ON b.author_id = u.id
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.id = $1
    `, [req.params.id]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Blog not found' });

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create blog
router.post('/', authenticateToken, authorizeRole(['writer', 'admin']), upload.single('image'), async (req, res) => {
  try {
    const { error } = blogSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { title, content, category_id } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : req.body.image_url;
    const author_id = req.user.id;
    const db = req.app.get('db');

    const result = await db.query(
      'INSERT INTO blogs (title, content, image_url, category_id, author_id) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [title, content, image_url, category_id || null, author_id]
    );

    res.status(201).json({ message: 'Blog created', blogId: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update blog
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { error } = blogSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { title, content, category_id, image_url } = req.body;
    const blogId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;
    const db = req.app.get('db');

    // Check ownership or admin
    const authorResult = await db.query('SELECT author_id FROM blogs WHERE id = $1', [blogId]);
    if (authorResult.rows.length === 0) return res.status(404).json({ error: 'Blog not found' });
    if (authorResult.rows[0].author_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await db.query(
      'UPDATE blogs SET title = $1, content = $2, image_url = $3, category_id = $4 WHERE id = $5',
      [title, content, image_url, category_id || null, blogId]
    );

    res.json({ message: 'Blog updated' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete blog
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const blogId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;
    const db = req.app.get('db');

    // Check ownership or admin
    const authorResult = await db.query('SELECT author_id FROM blogs WHERE id = $1', [blogId]);
    if (authorResult.rows.length === 0) return res.status(404).json({ error: 'Blog not found' });
    if (authorResult.rows[0].author_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await db.query('DELETE FROM blogs WHERE id = $1', [blogId]);
    res.json({ message: 'Blog deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
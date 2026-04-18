const express = require('express');

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const db = req.app.get('db');
    const result = await db.query('SELECT * FROM categories ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

const router = express.Router();

const registerSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { username, email, password } = req.body;
    const db = req.app.get('db');

    // Check if user exists
    const existingQuery = 'SELECT id FROM users WHERE email = $1 OR username = $2';
    const existingResult = await db.query(existingQuery, [email, username]);
    if (existingResult.rows.length > 0) return res.status(400).json({ error: 'User already exists' });

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert user
    const insertQuery = 'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id';
    const insertResult = await db.query(insertQuery, [username, email, password_hash]);

    res.status(201).json({ message: 'User registered successfully', userId: insertResult.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { email, password } = req.body;
    const db = req.app.get('db');

    // Find user
    const userQuery = 'SELECT * FROM users WHERE email = $1';
    const userResult = await db.query(userQuery, [email]);
    if (userResult.rows.length === 0) return res.status(400).json({ error: 'Invalid credentials' });

    const user = userResult.rows[0];

    // Check password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return res.status(400).json({ error: 'Invalid credentials' });

    // Generate JWT
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
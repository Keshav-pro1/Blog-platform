const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const blogRoutes = require('./routes/blogs');
const commentRoutes = require('./routes/comments');
const categoryRoutes = require('./routes/categories');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to PostgreSQL database');
  release();
});

// Make pool available in routes
app.set('db', pool);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/categories', categoryRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
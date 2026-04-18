-- Blog Platform Database Schema (PostgreSQL)

-- Create database
-- Note: In Neon, the database is already created

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'writer', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- Blogs table
CREATE TABLE blogs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_url VARCHAR(500),
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comments table
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    blog_id INTEGER NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_blogs_author_id ON blogs(author_id);
CREATE INDEX idx_blogs_category_id ON blogs(category_id);
CREATE INDEX idx_comments_blog_id ON comments(blog_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);

-- Sample data
INSERT INTO categories (name) VALUES ('Technology'), ('Lifestyle'), ('Travel'), ('Food');

INSERT INTO users (username, email, password_hash, role) VALUES
('admin', 'admin@example.com', '$2b$10$example.hash', 'admin'),
('writer1', 'writer@example.com', '$2b$10$example.hash', 'writer'),
('user1', 'user@example.com', '$2b$10$example.hash', 'user');

INSERT INTO blogs (title, content, image_url, category_id, author_id) VALUES
('Sample Blog 1', 'This is a sample blog content.', 'https://example.com/image1.jpg', 1, 2),
('Sample Blog 2', 'Another sample blog.', NULL, 2, 2);

INSERT INTO comments (blog_id, user_id, content) VALUES
(1, 3, 'Great post!'),
(1, 2, 'Thanks for sharing.');
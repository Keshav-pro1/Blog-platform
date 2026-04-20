# Blog Platform

A full-stack blog platform built with Node.js, Express, React, Vite, and MySQL.

## Features

- User authentication and authorization
- Role-based access (user, writer, admin)
- CRUD operations for blogs
- Comment system
- Category filtering
- Image upload support
- Responsive UI with Tailwind CSS

## Workflow Diagram

```mermaid
graph TD
    A[User Arrives] --> B{Logged In?}
    B -->|No| C[Login/Register]
    B -->|Yes| D{User Role?}
    
    C --> E[Authenticate]
    E --> D
    
    D -->|Writer/Admin| F[Dashboard]
    D -->|Regular User| G[Home Page]
    
    F --> H{Action?}
    G --> I{Action?}
    
    H -->|Create Blog| J[Write New Blog]
    H -->|View Blogs| K[Browse Blogs]
    H -->|Edit/Delete| L[Manage Own Blogs]
    
    I -->|View Blogs| K
    I -->|Read Blog| M[Blog Detail Page]
    
    J --> N[Add Title, Content, Category]
    N --> O[Upload Image]
    O --> P[Publish Blog]
    P --> Q[Blog Saved to Database]
    
    K --> M
    M --> R[Display Blog Content & Image]
    R --> S{User Action?}
    
    S -->|Add Comment| T[Write Comment]
    S -->|View Comments| U[Display All Comments]
    S -->|Back| K
    
    T --> V[Submit Comment]
    V --> W[Comment Saved to Database]
    W --> U
    
    Q --> X[(Database)]
    W --> X
    
    L --> Y[Select Blog]
    Y --> Z{Update/Delete?}
    Z -->|Update| N
    Z -->|Delete| AA[Remove from Database]
    AA --> X
```

**Workflow Overview:**
- **Authentication**: Users login/register based on their role
- **Writer/Admin Path**: Access to dashboard with full blog management capabilities
- **Regular User Path**: Browse and read blogs, add comments
- **Blog Creation**: Create new blogs with title, content, category, and images
- **Blog Interaction**: Read blogs, view comments, and add new comments
- **Blog Management**: Edit or delete own blogs

## Project Structure

```
blog-platform/
├── backend/
│   ├── middleware/
│   ├── routes/
│   ├── uploads/
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── database/
│   └── schema.sql
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- A Neon PostgreSQL database account
- npm or yarn

### Database Setup with Neon

1. **Create a Neon Account**: Go to https://neon.tech and create a free account
2. **Create a New Project**: 
   - Click "Create a project"
   - Choose your region
   - Name your project (e.g., "blog-platform")
3. **Get Connection Details**:
   - In your Neon dashboard, go to "Connection Details"
   - Copy the connection string (it looks like: `postgresql://username:password@hostname/database?sslmode=require`)

### Backend Setup

1. **Navigate to backend directory**:

```bash
cd backend
```

2. **Install dependencies**:

```bash
npm install
```

3. **Configure environment variables**:
   
   Edit the `.env` file in the backend directory:
   ```env
   DATABASE_URL=postgresql://your_neon_connection_string_here
   JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
   PORT=5000
   ```

4. **Set up database schema**:
   
   In your Neon dashboard, go to the SQL Editor and run the contents of `database/schema.sql`

5. **Start the server**:

```bash
npm run dev
```

The backend will run on http://localhost:5000

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The frontend will run on http://localhost:5173

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Blogs
- `GET /api/blogs` - Get all blogs (with pagination and category filter)
- `GET /api/blogs/:id` - Get single blog
- `POST /api/blogs` - Create new blog (writer/admin only)
- `PUT /api/blogs/:id` - Update blog (owner/admin only)
- `DELETE /api/blogs/:id` - Delete blog (owner/admin only)

### Comments
- `GET /api/comments/:blogId` - Get comments for a blog
- `POST /api/comments/:blogId` - Add comment (authenticated users)
- `DELETE /api/comments/:id` - Delete comment (owner only)

### Categories
- `GET /api/categories` - Get all categories

## Usage

1. Register a new account or login
2. Browse blogs on the home page
3. Filter blogs by category
4. View full blog details and comments
5. Writers and admins can create/edit/delete blogs from the dashboard
6. Add comments to blogs (authenticated users only)

## Security Features

- Password hashing with bcrypt
- JWT authentication
- Input validation with Joi
- SQL injection prevention with parameterized queries
- Role-based authorization

## Technologies Used

- **Backend**: Node.js, Express.js, PostgreSQL (Neon), bcrypt, JWT, Multer
- **Frontend**: React, Vite, React Router, Axios, Tailwind CSS
- **Database**: PostgreSQL (hosted on Neon)

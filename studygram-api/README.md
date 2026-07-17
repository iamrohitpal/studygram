# Studygram API

Node.js + Express backend service using MySQL and Redis for caching.

## Implemented Features

### 1. Advanced Authentication Middleware
- **`authenticateJWT`**: Strict middleware that requires a valid JSON Web Token.
- **`optionalAuthenticateJWT`**: Flexible middleware for public endpoints (like `GET /posts/feed` or `/search`) that extracts a user token if it exists, allowing tailored results without outright blocking guest users.

### 2. Cascading Post Management
- **Post Visibility**: Support for flexible visibility controls on Posts (e.g., `public`, `registered`, `followers`, `private`).
- **Relational Cleanup**: Secure post deletion that automatically clears out associated Likes, Comments, and Saves without triggering foreign key constraint failures.

### 3. Dynamic Queries
- Search functionality scales intelligently, capturing users, active posts (filtered by visibility), and categories in a single performant endpoint.

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MySQL Database
- Redis Server (for caching feeds)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the environment template and configure your database settings:
   ```bash
   cp .env.example .env
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### API Endpoints
- `GET /api/` - Welcome endpoint and status check
- `GET /api/health` - API health check
- `GET /api/db-check` - Verifies database connectivity
- `GET /api/posts/feed` - Fetches the main feed (uses optional auth)

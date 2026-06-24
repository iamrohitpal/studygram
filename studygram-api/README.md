# Studygram API

Node.js + Express backend service using MySQL.

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MySQL Database

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

import app from './app';
import { createServer } from 'http';
import { sequelize } from './config/db';
import { SocketServer } from './socket/SocketServer';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 7000;

const startServer = async () => {
  try {
    // Authenticate and sync Sequelize models with DB
    await sequelize.authenticate();
    console.log('Database connection successfully established.');

    // Sync models — alter: { drop: false } adds missing columns without
    // recreating existing indexes/constraints (avoids MySQL's 64-key limit).
    await sequelize.sync({ alter: { drop: false } });
    console.log('Database models successfully synchronized.');

    // Seed database with mock data
    const { seedDatabase } = require('./database/seeders/dbSeeder');
    await seedDatabase();

    // Create HTTP server from Express app
    const server = createServer(app);
    
    // Initialize WebSockets
    new SocketServer(server);

    server.listen(PORT, () => {
      console.log(`StudyGram API Server running on port ${PORT}`);
      console.log(`Swagger documentation available at http://localhost:${PORT}/docs`);
    });
  } catch (error: any) {
    console.error('Database connection failed during boot:', error.message);
    process.exit(1);
  }
};

startServer();

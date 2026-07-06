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

    // Cleanup duplicate likes and recalculate counts
    try {
      console.log('Cleaning up duplicate likes and recalculating counts...');
      await sequelize.query(`
        DELETE t1 FROM likes t1
        INNER JOIN likes t2 
        WHERE t1.id < t2.id AND t1.user_id = t2.user_id AND t1.post_id = t2.post_id
      `);
      
      await sequelize.query(`
        UPDATE posts p
        SET likes_count = (
          SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id
        )
      `);
      
      const { redisClient } = require('./config/redis');
      if (redisClient && typeof redisClient.flushDb === 'function') {
        await redisClient.flushDb();
        console.log('Flushed Redis cache.');
      } else if (redisClient && typeof redisClient.flushAll === 'function') {
        await redisClient.flushAll();
        console.log('Flushed Redis cache.');
      }
      
      console.log('Cleanup successful.');
    } catch (e) {
      console.error('Cleanup failed:', e);
    }

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

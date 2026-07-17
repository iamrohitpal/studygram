import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import apiRoutes from './routes/api';
import { globalErrorHandler } from './middlewares/errorHandler';
import { initCronJobs } from './crons/reminderCron';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Swagger UI Documentation Route
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
app.use('/api', apiRoutes);

// Initialize daily/weekly cron tasks scheduler
initCronJobs();

// Fallback Route
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Resource not found: ${req.method} ${req.url}`
  });
});

// Global Error Boundary Middleware
app.use(globalErrorHandler);

export default app;

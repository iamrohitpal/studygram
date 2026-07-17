import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'StudyGram REST API',
      version: '1.0.0',
      description: 'Production-ready REST API for StudyGram Educational Social Media Platform'
    },
    servers: [
      {
        url: 'http://localhost:7000/api',
        description: 'Local Development Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.ts', './src/routes/*.js', './dist/routes/*.js']
};

export const swaggerSpec = swaggerJsdoc(options);

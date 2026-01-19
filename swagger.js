import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'Employee Management API',
    description: 'API documentation for Employee Management System',
    version: '1.0.0'
  },
  host: 'localhost:3000',
  basePath: '/api/v1',
  schemes: ['http'],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      description: 'Enter your JWT token'
    }
  },
  definitions: {
    User: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        password: { type: 'string' },
        dob: { type: 'string', format: 'date' },
        gender: { type: 'string', enum: ['male', 'female'] },
        role: { type: 'string', enum: ['admin', 'employee', 'supervisor', 'manager'] },
        location: { type: 'string' },
        profilePic: { type: 'string' }
      }
    }
  }
};

const outputFile = './swagger-output.json';
const routes = ['./routes/v1.js'];

swaggerAutogen(outputFile, routes, doc);
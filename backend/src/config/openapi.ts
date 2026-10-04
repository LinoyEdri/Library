import path from 'node:path';
import swaggerJSDoc from 'swagger-jsdoc';
import { openapiComponentSchemas } from './openapi-component-schemas.ts';

// Resolve relative to this file so the globs work under tsx (src/) and node (dist/).
// glob treats "\" as an escape character, so patterns must use forward slashes.
const fromHere = (pattern: string): string =>
  path.resolve(import.meta.dirname, pattern).replaceAll('\\', '/');

const openapiDefinition: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Library API',
      version: '1.0.0',
      description: 'REST API for the library management system',
    },
    servers: [
      {
        url: '/api',
        description: 'API',
      },
    ],
    tags: [
      { name: 'Health', description: 'Application health endpoints' },
      { name: 'Docs', description: 'API documentation endpoints' },
      { name: 'Auth', description: 'Registration, login and current user' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: openapiComponentSchemas,
    },
  },
  apis: [fromHere('../routes/**/*.{ts,js}'), fromHere('../routes/docs/**/*.{ts,js}')],
};

export const openapiDocument = swaggerJSDoc(openapiDefinition);

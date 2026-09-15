import path from 'node:path';
import swaggerJSDoc from 'swagger-jsdoc';

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
      {
        name: 'Health',
        description: 'Application health endpoints',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ApiError: {
          type: 'object',
          required: ['success', 'message', 'requestId'],
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Validation failed',
            },
            requestId: {
              type: 'string',
              example: 'req_123456',
            },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    example: 'email',
                  },
                  message: {
                    type: 'string',
                    example: 'Invalid email address',
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [
    fromHere('../routes/**/*.{ts,js}'),
    fromHere('../controllers/**/*.{ts,js}'),
  ],
};

export const openapiDocument = swaggerJSDoc(openapiDefinition);

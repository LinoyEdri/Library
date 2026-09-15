import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { openapiDocument } from '../config/openapi.ts';

const docsRouter = Router();

docsRouter.get('/openapi.json', (_req, res) => {
  res.json(openapiDocument);
});

docsRouter.use(
  '/',
  swaggerUi.serve,
  swaggerUi.setup(openapiDocument, {
    explorer: true,
    customSiteTitle: 'Library API Documentation',
  }),
);

export default docsRouter;

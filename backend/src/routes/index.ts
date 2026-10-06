import { Router } from 'express';
import healthRouter from './health.route.js';
import docsRouter from './docs.route.ts';
import authRouter from './auth.route.ts';
import usersRouter from './users.route.ts';
import authorsRouter from './authors.route.ts';
import publishersRouter from './publishers.route.ts';
import categoriesRouter from './categories.route.ts';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/docs', docsRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/authors', authorsRouter);
apiRouter.use('/publishers', publishersRouter);
apiRouter.use('/categories', categoriesRouter);

import express from 'express';
import { requestIdMiddleware } from './middlewares/request-id.middleware.ts';
import { requestLoggerMiddleware } from './middlewares/request-logger.middleware.ts';
import { notFoundMiddleware } from './middlewares/not-found.middleware.ts';
import { errorMiddleware } from './middlewares/error.middleware.ts';
import { corsOrigin } from './config/env.ts';
import helmet from 'helmet';
import cors from 'cors';
import { apiRouter } from './routes/index.ts';

export function createApp() {
    const app = express();

    // Security: Hide Express framework details
    app.disable('x-powered-by'); 

    // Security headers
    app.use(helmet()); 

    app.use(cors({
        origin: corsOrigin,
    }))

    // 1. Global JSON Middleware
    app.use(express.json());
    // For parsing application/x-www-form-urlencoded
    app.use(express.urlencoded({ extended: true })); 

    // 2. ⚡ Request ID Context Middleware
    app.use(requestIdMiddleware);

    // 3. Performance & Logging Stopwatch Middleware
    app.use(requestLoggerMiddleware);
        
    // 4. API Routes
    app.use('/api', apiRouter);

    // 5. Not Found Middleware
    app.use(notFoundMiddleware);

    // 6. Error Handling Middleware
    app.use(errorMiddleware);

    return app;
}

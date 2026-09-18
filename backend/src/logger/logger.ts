import pino from 'pino';
import { nodeEnv } from '../config/env.ts';
import { requestContext } from '../utils/context.ts';

const isDevelopment = nodeEnv === 'development';

export const logger = pino({
  level: isDevelopment ? 'trace' : 'info',

  // ⚡ The Magic Mixin: Automatically runs on every single log line
  mixin() {
    const requestId = requestContext.getStore();

    // If we are inside an active request context, inject the 'reqId' key
    if (requestId) {
      return { reqId: requestId };
    }

    // Otherwise, return an empty object (no clutter for server startup/SYSTEM logs)
    return {};
  },

  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          // 'reqId' is ignored here because messageFormat already prints it inline
          ignore: 'pid,hostname,reqId',
          translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
          // Show the Request ID right next to the message, but only when one exists.
          // Must stay a plain string: transport options are cloned into a worker
          // thread, and functions cannot be structured-cloned.
          messageFormat: '{if reqId}[ID: {reqId}] {end}{msg}',
        },
      }
    : undefined,
});

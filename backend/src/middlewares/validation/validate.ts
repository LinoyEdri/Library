import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

type ValidationResult = {
    body?: unknown;
    params?: unknown;
    query?: unknown;
};

export function validate(schema: z.ZodType<ValidationResult>) {
    return (
        req: Request,
        _res: Response,
        next: NextFunction
    ): void => {
        const result = schema.safeParse({
            body: req.body,
            params: req.params,
            query: req.query,
        })

        if (!result.success) {
            return next(result.error);
        }

        const { body, params, query } = result.data;

        if (body !== undefined) {
            req.body = body;
        }
        if (params !== undefined) {
            req.params = params as Request['params'];
        }
        if (query !== undefined) {
            // Express 5 exposes `req.query` as a getter-only accessor on the
            // prototype, so a plain assignment throws. Shadow it with a real
            // own property instead.
            Object.defineProperty(req, 'query', {
                value: query as Request['query'],
                writable: true,
                enumerable: true,
                configurable: true,
            });
        }

        next();
    }
}

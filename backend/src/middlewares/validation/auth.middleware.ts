// middlewares/requireAuth.ts
import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../../types/errors/UnauthorizedError.ts";
import { jwtToken } from "../../utils/token.ts";
import { AppError } from "../../types/errors/AppError.ts";
import { InternalError } from "../../types/errors/InternalError.ts";

const TOKEN_TYPE = "Bearer";

export const requireAuth = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith(TOKEN_TYPE)) {
        return next(new UnauthorizedError("Invalid credentials"));
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return next(new UnauthorizedError("Invalid credentials"));
    }

    try {
        const payload = jwtToken.verifyAccessToken(token);
        req.user = payload;
        return next();
    } catch (error) {
        if (error instanceof AppError) {
            return next(error);
        }
        
        return next(new InternalError("Internal authentication process error"));
    }
};

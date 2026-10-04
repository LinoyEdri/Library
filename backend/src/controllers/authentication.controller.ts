import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../utils/catch-async.ts";
import { getStatusText } from "../utils/status-text.ts";
import { authenticationService } from "../services/authentication.service.ts";
import { UnauthorizedError } from "../types/errors/UnauthorizedError.ts";
import { ApiResponse } from "../types/response.ts";

// Thin HTTP layer: read the request, call the service, wrap the result in the envelope
export const authenticationController = {
    register: catchAsync(async (req: Request, res: Response) => {
        const newUser = await authenticationService.register(req.body);

        res.status(StatusCodes.CREATED).json(
            ApiResponse.success(newUser, "User registered successfully", getStatusText(StatusCodes.CREATED)),
        );
    }),

    login: catchAsync(async (req: Request, res: Response) => {
        const loginResult = await authenticationService.login(req.body);

        res.status(StatusCodes.OK).json(
            ApiResponse.success(loginResult, "Login successful"),
        );
    }),

    getCurrentUser: catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new UnauthorizedError("Authentication required"));
        }

        const currentUser = await authenticationService.getCurrentUser(req.user.id);

        res.status(StatusCodes.OK).json(
            ApiResponse.success(currentUser, "User retrieved successfully"),
        );
    }),
};

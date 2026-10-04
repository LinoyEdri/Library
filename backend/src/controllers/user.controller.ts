import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catch-async.ts";
import { authenticationService } from "../services/authentication.service.ts";
import { StatusCodes } from "http-status-codes";
import { UnauthorizedError } from "../types/errors/UnauthorizedError.ts";

export const userController = {
    register: catchAsync(async (
        req: Request,
        res:Response,
    ) => {
        const newUser = await authenticationService.register(req.body);
        
        res.status(StatusCodes.CREATED).json(newUser)
    }),

    login: catchAsync(async (
        req: Request,
        res: Response
    ) => {
        const loginUser = await authenticationService.login(req.body);

        res.status(StatusCodes.OK).json(loginUser);
    }),

    getMe: catchAsync(async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        if (!req.user) {
            return next(new UnauthorizedError("Invalid credentials"));
        }

        const user = await authenticationService.getCurrentUser(req.user.sub);

        res.status(StatusCodes.OK).json(user);
    }),
};
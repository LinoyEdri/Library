import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catch-async.ts";
import { userService } from "../services/user.service.ts";
import { StatusCodes } from "http-status-codes";
import { UnauthorizedError } from "../types/errors/UnauthorizedError.ts";

export const userController = {
    register: catchAsync(async (
        req: Request,
        res:Response,
    ) => {
        const newUser = await userService.register(req.body);
        
        res.status(StatusCodes.CREATED).json(newUser)
    }),

    login: catchAsync(async (
        req: Request,
        res: Response
    ) => {
        const loginUser = await userService.login(req.body);

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

        const user = await userService.getMe(req.user.sub);

        res.status(StatusCodes.OK).json(user);
    }),
};
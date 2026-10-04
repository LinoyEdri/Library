import { Router } from "express";
import { loginSchema, registerSchema } from "@library/shared";
import { RequestLocation, validate } from "../middlewares/validation/validate.middleware.ts";
import { requireAuth } from "../middlewares/validation/auth.middleware.ts";
import { authenticationController } from "../controllers/authentication.controller.ts";

const authRouter = Router();

authRouter.post(
    "/register",
    validate(RequestLocation.BODY, registerSchema),
    authenticationController.register,
);

authRouter.post(
    "/login",
    validate(RequestLocation.BODY, loginSchema),
    authenticationController.login,
);

authRouter.get(
    "/me",
    requireAuth,
    authenticationController.getCurrentUser,
);

export default authRouter;

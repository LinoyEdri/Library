import { Router } from "express";
import { RequestLocation, validate } from "../middlewares/validation/validate.middleware.ts";
import { loginSchema, registerSchema } from "../schemas/user.schema.ts";
import { userController } from "../controllers/user.controller.ts";
import { requireAuth } from "../middlewares/validation/auth.middleware.ts";

const authRouter = Router();

authRouter.post(
    '/register', 
     validate(RequestLocation.BODY, registerSchema),
     userController.register
);


authRouter.post(
    "/login",
    validate(RequestLocation.BODY, loginSchema),
    userController.login
);

authRouter.get(
    "/me",
    requireAuth,
    userController.getMe
);

export default authRouter;

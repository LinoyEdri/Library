import { NextFunction, Request, Response } from "express";
import { RecordStatus } from "@prisma/client";
import { userRepository } from "../../repositories/user.repository.ts";
import { UnauthorizedError } from "../../types/errors/UnauthorizedError.ts";
import { catchAsync } from "../../utils/catch-async.ts";
import { ACCESS_TOKEN_TYPE, jwtToken } from "../../utils/token.ts";

// Reads "Authorization: Bearer <token>" and returns the token, or null when missing/malformed
const extractBearerToken = (authorizationHeader: string | undefined): string | null => {
    if (!authorizationHeader) {
        return null;
    }

    const [tokenType, token] = authorizationHeader.split(" ");

    if (tokenType !== ACCESS_TOKEN_TYPE || !token) {
        return null;
    }

    return token;
};

// Verifies the JWT, then re-loads the user so disabled accounts and role changes apply immediately
export const requireAuthentication = catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
        throw new UnauthorizedError("Authentication required");
    }

    const tokenPayload = jwtToken.verifyAccessToken(token);

    const user = await userRepository.findAuthenticationContextById(tokenPayload.sub);

    if (!user || user.status === RecordStatus.DISABLED) {
        throw new UnauthorizedError("Account is not active");
    }

    req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        memberId: user.member?.id ?? null,
    };

    next();
});

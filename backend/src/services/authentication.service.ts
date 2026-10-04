import { RecordStatus } from "@prisma/client";
import type { LoginInput, RegisterInput } from "@library/shared";
import { userRepository } from "../repositories/user.repository.ts";
import { LoginResult, SafeUser, toSafeUser } from "../types/dtos/user.dto.ts";
import { ConflictError } from "../types/errors/ConflictError.ts";
import { NotFoundError } from "../types/errors/NotFoundError.ts";
import { UnauthorizedError } from "../types/errors/UnauthorizedError.ts";
import { bcryptPassword } from "../utils/password-hash.ts";
import { ACCESS_TOKEN_TYPE, jwtToken } from "../utils/token.ts";
import { jwtExpiresIn } from "../config/env.ts";

// One message for every login failure, so attackers cannot tell which emails exist
export const INVALID_LOGIN_MESSAGE = "Invalid email or password";

// Compared against when the email is unknown, so the response takes the same time
const TIMING_EQUALIZER_PASSWORD_HASH = "$2b$10$tNaFQbDyn5sTbf1FhO4KF.4QdV6UPekvOq6V8dX26Y6.oDRBzMLxS";

export const authenticationService = {
    async register(input: RegisterInput): Promise<SafeUser> {
        const existingUser = await userRepository.findByEmail(input.email);

        if (existingUser) {
            throw new ConflictError("This email address is already registered");
        }

        const passwordHash = await bcryptPassword.hashPassword(input.password);

        const newUser = await userRepository.createUser(input, passwordHash);

        return toSafeUser(newUser);
    },

    async login(input: LoginInput): Promise<LoginResult> {
        const user = await userRepository.findByEmail(input.email);

        const passwordMatches = await bcryptPassword.comparePassword(
            input.password,
            user?.passwordHash ?? TIMING_EQUALIZER_PASSWORD_HASH,
        );

        if (!user || !passwordMatches || user.status === RecordStatus.DISABLED) {
            throw new UnauthorizedError(INVALID_LOGIN_MESSAGE);
        }

        const accessToken = jwtToken.signAccessToken({
            sub: user.id,
            email: user.email,
            role: user.role,
        });

        const userAfterLogin = await userRepository.updateLastLoginDate(user.id, new Date());

        return {
            accessToken,
            tokenType: ACCESS_TOKEN_TYPE,
            expiresIn: jwtExpiresIn,
            expiresAt: jwtToken.getExpiryDate(accessToken),
            user: toSafeUser(userAfterLogin),
        };
    },

    async getCurrentUser(userId: string): Promise<SafeUser> {
        const user = await userRepository.findById(userId);

        if (!user) {
            throw new NotFoundError("User not found");
        }

        return toSafeUser(user);
    },
};

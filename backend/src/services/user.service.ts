import { RecordStatus } from "@prisma/client";
import { userRepository } from "../repositories/user.repository.ts";
import { LoginInput, RegisterInput } from "../schemas/user.schema.ts";
import { LoginUser, SafeUser, toSafeUser } from "../types/dtos/user.dto.ts";
import { ConflictError } from "../types/errors/ConflictError.ts";
import { NotFoundError } from "../types/errors/NotFoundError.ts";
import { bcryptPassword } from "../utils/password-hash.ts";
import { UnauthorizedError } from "../types/errors/UnauthorizedError.ts";
import { jwtToken } from "../utils/token.ts";

export const userService = {
    async register(input: RegisterInput): Promise<SafeUser> {
        const existingUser = await userRepository.findByEmail(input.email);

        if (existingUser) {
            throw new ConflictError("This email address is already registered");
        }

        const paswordHash = await bcryptPassword.hashPassword(input.password);
        const newUser = await userRepository.createUser(input, paswordHash);

        return toSafeUser(newUser);
    },

    async login(input: LoginInput): Promise<LoginUser> {
        const user = await userRepository.findByEmail(input.email);

        if (!user) {
            throw new NotFoundError("Invalid email address");
        } else if (user.status === RecordStatus.DISABLED) {
            throw new UnauthorizedError("Account disabled");
        };

        const isPassword = await bcryptPassword.comparePassword(input.password, user.passwordHash);
        if (!isPassword) {
            throw new NotFoundError("Invalid password")
        }

        const token = jwtToken.signAccessToken({
            sub: user.id,
            role: user.role
        })

        return {
            accessToken: token,
            user: toSafeUser(user)
        };
    },

    async getMe(id: string): Promise<SafeUser> {
        const user = await userRepository.findById(id);

        if (!user) {
            throw new NotFoundError("User not found");
        }

        return toSafeUser(user);
    }
};
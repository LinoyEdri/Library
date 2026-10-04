import type { RegisterInput } from "@library/shared";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import prisma from "../prisma/prisma.ts";
import type { DatabaseClient } from "../prisma/database-client.ts";
import { PrismaErrorCodes } from "../prisma/error-codes.ts";
import { ConflictError } from "../types/errors/ConflictError.ts";
import { InternalError } from "../types/errors/InternalError.ts";
import type { UserWithAddress } from "../types/dtos/user.dto.ts";

// Every query loads the address too, so callers can build a SafeUser directly
const includeAddress = { address: true } as const;

export const userRepository = {
    async findByEmail(email: string): Promise<UserWithAddress | null> {
        try {
            return await prisma.user.findUnique({
                where: { email },
                include: includeAddress,
            });
        } catch {
            throw new InternalError("Database connection error during lookup");
        }
    },

    async findById(id: string): Promise<UserWithAddress | null> {
        try {
            return await prisma.user.findUnique({
                where: { id },
                include: includeAddress,
            });
        } catch {
            throw new InternalError("Database connection error during lookup");
        }
    },

    // Minimal data needed on every authenticated request (identity, role, status, member link)
    async findAuthenticationContextById(id: string) {
        try {
            return await prisma.user.findUnique({
                where: { id },
                select: {
                    id: true,
                    email: true,
                    role: true,
                    status: true,
                    member: { select: { id: true } },
                },
            });
        } catch {
            throw new InternalError("Database connection error during lookup");
        }
    },

    async updateLastLoginDate(
        id: string,
        lastLoginDate: Date,
        databaseClient: DatabaseClient = prisma,
    ): Promise<UserWithAddress> {
        try {
            return await databaseClient.user.update({
                where: { id },
                data: { lastLoginDate },
                include: includeAddress,
            });
        } catch {
            throw new InternalError("Failed to update last login date");
        }
    },

    // Nested create: the address and user are written in one atomic statement
    async createUserWithAddress(
        userDto: RegisterInput,
        passwordHash: string,
        databaseClient: DatabaseClient = prisma,
    ): Promise<UserWithAddress> {
        try {
            return await databaseClient.user.create({
                data: {
                    firstName: userDto.firstName,
                    lastName: userDto.lastName,
                    email: userDto.email,
                    passwordHash,
                    phoneNumber: userDto.phoneNumber,
                    address: {
                        create: {
                            street: userDto.address.street,
                            houseNumber: userDto.address.houseNumber,
                            apartmentOrUnit: userDto.address.apartmentOrUnit,
                            city: userDto.address.city,
                            postalCode: userDto.address.postalCode,
                            country: userDto.address.country,
                        },
                    },
                },
                include: includeAddress,
            });
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError
                && error.code === PrismaErrorCodes.UNIQUE_CONSTRAINT) {
                throw new ConflictError("This email address is already registered");
            }

            throw new InternalError("Account registration failed due to an internal storage issue");
        }
    },
};

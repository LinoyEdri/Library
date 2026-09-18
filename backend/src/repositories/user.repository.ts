import prisma from "../prisma/prisma.ts";
import { InternalError } from "../types/errors/InternalError.ts";
import { RegisterInput } from "../schemas/user.schema.ts";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { PrismaErrorCodes } from "../prisma/error-codes.ts";
import { ConflictError } from "../types/errors/ConflictError.ts";
import { User } from "@prisma/client";

export const userRepository = {
    async findByEmail(email: string): Promise<User | null> {
        try {
            return await prisma.user.findUnique({
                where: { email },
            })
        } catch {
            throw new InternalError("Database connection error during lookup");
        }
    },

    async findById(id: string): Promise<User | null> {
        try {
            return await prisma.user.findUnique({
                where: { id },
            })
        } catch {
            throw new InternalError("Database connection error during lookup");
        }
    },

    async createUser(userDto: RegisterInput, passwordHash: string): Promise<User> {
        try {
            return await prisma.$transaction(async (tx) => {
                const address = await tx.address.create({
                    data: {
                        street: userDto.address.street,
                        houseNumber: userDto.address.houseNumber,
                        apartmentOrUnit: userDto.address.apartmentOrUnit,
                        city: userDto.address.city,
                        postalCode: userDto.address.postalCode,
                        country: userDto.address.country,
                    },
                });

                return await tx.user.create({
                    data: {
                        firstName: userDto.firstName,
                        lastName: userDto.lastName,
                        email: userDto.email, 
                        passwordHash,
                        phoneNumber: userDto.phoneNumber,
                        addressId: address.id,
                    },
                });
            });
        } catch (error) {

            if (error instanceof PrismaClientKnownRequestError 
                && error.code === PrismaErrorCodes.UNIQUE_CONSTRAINT){
                throw new ConflictError("This email address is already registered");
            }

            throw new InternalError("Account registration failed due to an internal storage issue");
        }
    },
}
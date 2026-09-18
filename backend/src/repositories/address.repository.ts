import { Address } from "@prisma/client";
import prisma from "../prisma/prisma.ts";
import { AddressInput } from "../schemas/user.schema.ts";
import { InternalError } from "../types/errors/InternalError.ts";

export const addressRepository = {
    async findById(id: string){
        try {
            return await prisma.address.findUnique({
                where: { id },
            });
        } catch {
            throw new InternalError("Databse error during lookup");
        }
    },
}
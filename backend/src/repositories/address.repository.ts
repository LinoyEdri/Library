import { Address } from '@prisma/client';
import prisma from '../prisma/prisma.ts';
import { InternalError } from '../types/errors/InternalError.ts';

export const addressRepository = {
  async findById(id: string): Promise<Address | null> {
    try {
      return await prisma.address.findUnique({
        where: { id },
      });
    } catch {
      throw new InternalError('Database error during lookup');
    }
  },
};

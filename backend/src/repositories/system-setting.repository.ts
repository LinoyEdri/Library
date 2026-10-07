import type { SystemSetting } from '@prisma/client';
import prisma from '../prisma/prisma.ts';
import type { DatabaseClient } from '../types/database/database-client.types.ts';
import { InternalError } from '../types/errors/InternalError.ts';

export const systemSettingRepository = {
  async findAll(): Promise<SystemSetting[]> {
    try {
      return await prisma.systemSetting.findMany();
    } catch {
      throw new InternalError('Failed to load settings');
    }
  },

  async findByKey(key: string): Promise<SystemSetting | null> {
    try {
      return await prisma.systemSetting.findUnique({ where: { key } });
    } catch {
      throw new InternalError('Failed to load setting');
    }
  },

  // Saves the value, creating the row the first time a setting is changed
  async saveValue(
    key: string,
    value: number,
    databaseClient: DatabaseClient = prisma,
  ): Promise<SystemSetting> {
    try {
      return await databaseClient.systemSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    } catch {
      throw new InternalError('Failed to save setting');
    }
  },
};

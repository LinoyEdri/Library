import { ActionType, EntityType } from '@prisma/client';
import { z } from 'zod';
import { SYSTEM_SETTING_DEFINITIONS, SystemSettingKey } from '@library/shared';
import { runInDatabaseTransaction } from '../prisma/run-in-database-transaction.ts';
import { systemSettingRepository } from '../repositories/system-setting.repository.ts';
import { auditLogService } from './audit-log.service.ts';
import type { AuthenticatedUser } from '../types/authentication/authenticated-user.types.ts';
import type { SystemSettingRecordResponse } from '../types/responses/system-setting.response.types.ts';
import { resolveSettingValue } from '../utils/settings/resolve-setting-value.ts';

const ALL_SETTING_KEYS = Object.values(SystemSettingKey);

// Library-wide settings: admins edit them, other services (e.g. loans) read them
export const systemSettingService = {
  // Every known setting with its current value (or default)
  async listSettings(): Promise<SystemSettingRecordResponse[]> {
    const storedSettings = await systemSettingRepository.findAll();

    const storedSettingByKey = new Map(storedSettings.map((setting) => [setting.key, setting]));

    return ALL_SETTING_KEYS.map((key) => {
      const storedSetting = storedSettingByKey.get(key);

      return {
        key,
        value: resolveSettingValue(key, storedSetting?.value),
        defaultValue: SYSTEM_SETTING_DEFINITIONS[key].defaultValue,
        updatedDate: storedSetting?.updatedDate ?? null,
      };
    });
  },

  // Current value of one setting, for other services (falls back to the default)
  async getSettingValue(key: SystemSettingKey): Promise<number> {
    const storedSetting = await systemSettingRepository.findByKey(key);

    return resolveSettingValue(key, storedSetting?.value);
  },

  // Validates the value with the key's rule (400 with a "value" field error if wrong), saves and audits
  async updateSetting(
    actingUser: AuthenticatedUser,
    key: SystemSettingKey,
    rawValue: unknown,
  ): Promise<SystemSettingRecordResponse> {
    const { value: newValue } = z
      .object({ value: SYSTEM_SETTING_DEFINITIONS[key].valueSchema })
      .parse({ value: rawValue });

    const previousValue = await this.getSettingValue(key);

    const savedSetting = await runInDatabaseTransaction(async (transactionClient) => {
      const setting = await systemSettingRepository.saveValue(key, newValue, transactionClient);

      if (previousValue !== newValue) {
        await auditLogService.recordAuditLogEntry(
          {
            actionType: ActionType.SYSTEM_SETTING_UPDATED,
            actionUserId: actingUser.id,
            actionUserRole: actingUser.role,
            affectedType: EntityType.SYSTEM_SETTING,
            affectedRecordId: setting.id,
            previousValue: { key, value: previousValue },
            newValue: { key, value: newValue },
          },
          transactionClient,
        );
      }

      return setting;
    });

    return {
      key,
      value: newValue,
      defaultValue: SYSTEM_SETTING_DEFINITIONS[key].defaultValue,
      updatedDate: savedSetting.updatedDate,
    };
  },
};

import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { ActionType, Role } from '@prisma/client';
import { SystemSettingKey } from '@library/shared';
import { createApp } from '../../app.ts';
import { systemSettingRepository } from '../../repositories/system-setting.repository.ts';
import { systemSettingService } from '../../services/system-setting.service.ts';
import {
  clearIntegrationTestDatabase,
  createTestUser,
  disconnectIntegrationTestDatabase,
  findAuditLogEntriesForRecord,
} from '../helpers/test-database.helpers.ts';
import { authorizationHeaderFor } from '../helpers/test-authentication.helpers.ts';

const application = createApp();

let adminHeader: string;

const updateSetting = (key: string, value: unknown, header = adminHeader) =>
  request(application).patch(`/api/settings/${key}`).set('Authorization', header).send({ value });

// The stored row's id (audit entries point at it)
const findSettingId = async (key: string) =>
  (await systemSettingRepository.findByKey(key))?.id ?? '';

beforeEach(async () => {
  await clearIntegrationTestDatabase();

  adminHeader = authorizationHeaderFor(await createTestUser({ role: Role.ADMIN }));
});

afterAll(async () => {
  await disconnectIntegrationTestDatabase();
});

describe('GET /api/settings', () => {
  it('lists every setting with its default when nothing was saved yet', async () => {
    const response = await request(application)
      .get('/api/settings')
      .set('Authorization', adminHeader);

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: SystemSettingKey.LOAN_PERIOD_DAYS,
          value: 14,
          updatedDate: null,
        }),
        expect.objectContaining({ key: SystemSettingKey.MAX_ACTIVE_LOANS_PER_MEMBER, value: 5 }),
      ]),
    );
  });

  it.each([Role.LIBRARIAN, Role.MEMBER, Role.VIEWER])('forbids a %s (403)', async (role) => {
    const user = await createTestUser({ role });

    const response = await request(application)
      .get('/api/settings')
      .set('Authorization', authorizationHeaderFor(user));

    expect(response.status).toBe(StatusCodes.FORBIDDEN);
  });
});

describe('PATCH /api/settings/:key', () => {
  it('saves a valid value, audits only the key and values, and other services read it', async () => {
    const response = await updateSetting(SystemSettingKey.LOAN_PERIOD_DAYS, 21);

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body.data).toMatchObject({ value: 21, defaultValue: 14 });
    expect(response.body.data.updatedDate).toEqual(expect.any(String));

    expect(await systemSettingService.getSettingValue(SystemSettingKey.LOAN_PERIOD_DAYS)).toBe(21);

    const auditEntries = await findAuditLogEntriesForRecord(
      await findSettingId(SystemSettingKey.LOAN_PERIOD_DAYS),
    );

    expect(auditEntries.map((entry) => entry.actionType)).toEqual([
      ActionType.SYSTEM_SETTING_UPDATED,
    ]);
    expect(auditEntries[0].previousValue).toEqual({
      key: SystemSettingKey.LOAN_PERIOD_DAYS,
      value: 14,
    });
    expect(auditEntries[0].newValue).toEqual({ key: SystemSettingKey.LOAN_PERIOD_DAYS, value: 21 });
  });

  it('does not audit when the value did not change', async () => {
    await updateSetting(SystemSettingKey.MAX_ACTIVE_LOANS_PER_MEMBER, 5);

    const settingId = await findSettingId(SystemSettingKey.MAX_ACTIVE_LOANS_PER_MEMBER);

    expect(await findAuditLogEntriesForRecord(settingId)).toHaveLength(0);
  });

  it.each([0, 91, 2.5, 'abc'])(
    'rejects %s for the loan period (400 on "value")',
    async (badValue) => {
      const response = await updateSetting(SystemSettingKey.LOAN_PERIOD_DAYS, badValue);

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body.error.details[0].field).toBe('value');
    },
  );

  it('rejects an unknown setting key (400)', async () => {
    const response = await updateSetting('libraryName', 'x');

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
  });

  it('forbids librarians from changing settings (403)', async () => {
    const librarian = await createTestUser({ role: Role.LIBRARIAN });

    const response = await updateSetting(
      SystemSettingKey.LOAN_PERIOD_DAYS,
      30,
      authorizationHeaderFor(librarian),
    );

    expect(response.status).toBe(StatusCodes.FORBIDDEN);
  });
});

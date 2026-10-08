import { expect, test } from '@playwright/test';
import { logInThroughLoginPage } from './helpers/authentication.ts';
import { HebrewTexts } from './helpers/hebrew-texts.ts';
import { SeedAccounts } from './helpers/seed-accounts.ts';

test.describe('logging in and out', () => {
  test('a wrong password shows one generic message', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel(HebrewTexts.fields.email).fill(SeedAccounts.admin.email);
    await page.getByLabel(HebrewTexts.fields.password, { exact: true }).fill('WrongPassword1');
    await page.getByRole('button', { name: HebrewTexts.authentication.loginButton }).click();

    await expect(page.getByText(HebrewTexts.authentication.invalidCredentials)).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('staff and members land on their dashboard with a greeting', async ({ page }) => {
    await logInThroughLoginPage(page, SeedAccounts.librarian.email);

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(
      page.getByRole('heading', {
        name: `${HebrewTexts.dashboard.welcome} ${SeedAccounts.librarian.firstName}`,
      }),
    ).toBeVisible();
  });

  test('a guest who signs up lands on the books catalog', async ({ page }) => {
    const email = `guest.${Date.now()}@example.com`;

    const registerResponse = await page.request.post('/api/auth/register', {
      data: {
        firstName: 'אורח',
        lastName: 'בדיקה',
        email,
        password: 'GuestPassword1',
        phoneNumber: '0509990000',
        // A private house: no apartment number
        address: { street: 'הרצל', houseNumber: '1', city: 'חיפה' },
      },
    });

    expect(registerResponse.ok()).toBeTruthy();

    await logInThroughLoginPage(page, email, 'GuestPassword1');

    await expect(page).toHaveURL(/\/books/);
  });

  test('logging out returns to the login page', async ({ page }) => {
    await logInThroughLoginPage(page, SeedAccounts.admin.email);

    await page.getByRole('button', { name: HebrewTexts.authentication.logout }).click();

    await expect(page).toHaveURL(/\/login/);
  });

  test('pages that need a login send guests to the login page', async ({ page }) => {
    await page.goto('/loans');

    await expect(page).toHaveURL(/\/login/);
  });
});

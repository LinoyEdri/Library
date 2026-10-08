import { expect, test } from '@playwright/test';
import { logInThroughLoginPage } from './helpers/authentication.ts';
import { HebrewTexts } from './helpers/hebrew-texts.ts';
import { SeedAccounts } from './helpers/seed-accounts.ts';

const { passwordReset: texts } = HebrewTexts;

const NEW_PASSWORD = 'ResetByE2e1';

// Forgot password by SMS: the code arrives in the simulated message popup
test('a member resets a forgotten password with an SMS code', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('link', { name: HebrewTexts.authentication.forgotPasswordLink }).click();

  await page.getByRole('button', { name: texts.smsChannel }).click();
  await page.getByLabel(texts.phoneNumberField).fill(SeedAccounts.memberUri.phoneNumber);
  await page.getByRole('button', { name: texts.sendCodeButton }).click();

  // The "received" SMS shows the code
  const receivedMessage = page
    .getByRole('status')
    .filter({ hasText: texts.simulated.simulationNote });

  await expect(receivedMessage).toBeVisible();

  const code = (await receivedMessage.innerText()).match(/\d{6}/)?.[0] ?? '';

  // A wrong code is refused, the right one opens the reset page
  await page.getByLabel(texts.codeField).fill(code === '111111' ? '222222' : '111111');
  await page.getByRole('button', { name: texts.verifyCodeButton }).click();

  await expect(page.getByText(texts.errors.codeIncorrect)).toBeVisible();

  await page.getByLabel(texts.codeField).fill(code);
  await page.getByRole('button', { name: texts.verifyCodeButton }).click();

  await expect(page).toHaveURL(/\/reset-password/);

  await page.getByLabel(HebrewTexts.fields.newPassword, { exact: true }).fill(NEW_PASSWORD);
  await page.getByLabel(HebrewTexts.fields.confirmNewPassword).fill(NEW_PASSWORD);
  await page.getByRole('button', { name: texts.resetButton }).click();

  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByText(texts.resetSucceeded)).toBeVisible();

  // The new password works
  await logInThroughLoginPage(page, SeedAccounts.memberUri.email, NEW_PASSWORD);

  await expect(page).toHaveURL(/\/dashboard/);
});

test('an unknown email is reported', async ({ page }) => {
  await page.goto('/forgot-password');

  await page.getByLabel(HebrewTexts.fields.email).fill('nobody@example.com');
  await page.getByRole('button', { name: texts.sendCodeButton }).click();

  await expect(page.getByText(texts.errors.accountNotFoundByEmail)).toBeVisible();
});

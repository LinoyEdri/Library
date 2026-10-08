import { expect, type APIRequestContext, type Browser, type Page } from '@playwright/test';
import { SEED_PASSWORD } from '../../e2e-environment.ts';
import { HebrewTexts } from './hebrew-texts.ts';

// Logs in through the login page and waits until the app has moved on from it
export const logInThroughLoginPage = async (
  page: Page,
  email: string,
  password: string = SEED_PASSWORD,
) => {
  await page.goto('/login');

  await page.getByLabel(HebrewTexts.fields.email).fill(email);
  await page.getByLabel(HebrewTexts.fields.password, { exact: true }).fill(password);
  await page.getByRole('button', { name: HebrewTexts.authentication.loginButton }).click();

  await expect(page).not.toHaveURL(/\/login/);
};

// A separate browser session for one user (several users can act in the same test)
export const openSessionAs = async (browser: Browser, email: string) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  await logInThroughLoginPage(page, email);

  return page;
};

// API access token for steps that are simpler through the API (setup and rule checks)
export const getAccessToken = async (request: APIRequestContext, email: string) => {
  const response = await request.post('/api/auth/login', {
    data: { email, password: SEED_PASSWORD },
  });

  expect(response.ok()).toBeTruthy();

  return ((await response.json()).data.accessToken as string) ?? '';
};

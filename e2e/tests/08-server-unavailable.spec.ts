import { expect, test, type Page } from '@playwright/test';
import { logInThroughLoginPage } from './helpers/authentication.ts';
import { HebrewTexts } from './helpers/hebrew-texts.ts';
import { SeedAccounts } from './helpers/seed-accounts.ts';

const { navigation } = HebrewTexts;

// Every API request fails as if the backend were stopped
const stopServer = (page: Page) => page.route('**/api/**', (route) => route.abort());

const startServer = (page: Page) => page.unroute('**/api/**');

const retryButton = (page: Page) => page.getByRole('button', { name: HebrewTexts.common.retry });

// The page shows only its title, the "no connection" message and "try again"
const expectServerUnavailableView = async (page: Page, pageTitle: string) => {
  await expect(page.getByRole('heading', { level: 1, name: pageTitle })).toBeVisible();
  await expect(page.getByText(HebrewTexts.errors.networkError)).toBeVisible();
  await expect(retryButton(page)).toBeVisible();
};

test('opening a page while the server is down shows its title and "try again"', async ({
  page,
}) => {
  await logInThroughLoginPage(page, SeedAccounts.librarian.email);

  await stopServer(page);
  await page.goto('/loans');

  await expectServerUnavailableView(page, navigation.loans);

  // Still logged in: back to the page once the server answers
  await startServer(page);
  await retryButton(page).click();

  await expect(page.getByRole('link', { name: navigation.members, exact: true })).toBeVisible();
  await expect(page.getByText(HebrewTexts.errors.networkError)).toBeHidden();
});

test('moving to another page while the server is down replaces only the page content', async ({
  page,
}) => {
  await logInThroughLoginPage(page, SeedAccounts.librarian.email);

  await stopServer(page);
  await page.getByRole('link', { name: navigation.members, exact: true }).click();

  await expectServerUnavailableView(page, navigation.members);

  // The side menu stays usable
  await expect(page.getByRole('link', { name: navigation.loans, exact: true })).toBeVisible();

  await startServer(page);
  await retryButton(page).click();

  await expect(page.getByText(HebrewTexts.errors.networkError)).toBeHidden();
  await expect(page.getByRole('heading', { level: 1, name: navigation.members })).toBeVisible();
});

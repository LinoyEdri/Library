import { expect, test, type Page } from '@playwright/test';
import { logInThroughLoginPage } from './helpers/authentication.ts';
import { HebrewTexts } from './helpers/hebrew-texts.ts';
import { SeedAccounts } from './helpers/seed-accounts.ts';

const { navigation } = HebrewTexts;

const menuLink = (page: Page, label: string) =>
  page.getByRole('link', { name: label, exact: true });

// Each role sees only the side-menu items its permissions allow (spec section on navigation)
const expectedMenus = [
  {
    role: 'admin',
    email: SeedAccounts.admin.email,
    visible: [
      navigation.dashboard,
      navigation.books,
      navigation.members,
      navigation.loans,
      navigation.users,
      navigation.auditLogs,
      navigation.settings,
      navigation.profile,
    ],
    hidden: [],
  },
  {
    role: 'librarian',
    email: SeedAccounts.librarian.email,
    visible: [navigation.dashboard, navigation.books, navigation.members, navigation.loans],
    hidden: [navigation.users, navigation.auditLogs, navigation.settings],
  },
  {
    role: 'member',
    email: SeedAccounts.memberDana.email,
    visible: [navigation.dashboard, navigation.browseBooks, navigation.loans, navigation.profile],
    hidden: [navigation.members, navigation.users, navigation.auditLogs, navigation.settings],
  },
];

test.describe('menus per role', () => {
  for (const { role, email, visible, hidden } of expectedMenus) {
    test(`${role} sees exactly the allowed menu items`, async ({ page }) => {
      await logInThroughLoginPage(page, email);

      for (const label of visible) {
        await expect(menuLink(page, label)).toBeVisible();
      }

      for (const label of hidden) {
        await expect(menuLink(page, label)).toHaveCount(0);
      }
    });
  }

  test('a librarian who opens an admin page gets the unauthorized page', async ({ page }) => {
    await logInThroughLoginPage(page, SeedAccounts.librarian.email);

    await page.goto('/users');

    await expect(page.getByText(HebrewTexts.errors.unauthorizedTitle)).toBeVisible();
  });

  test('a member who opens another member page gets the unauthorized page', async ({ page }) => {
    await logInThroughLoginPage(page, SeedAccounts.memberDana.email);

    await page.goto('/members');

    await expect(page.getByText(HebrewTexts.errors.unauthorizedTitle)).toBeVisible();
  });
});

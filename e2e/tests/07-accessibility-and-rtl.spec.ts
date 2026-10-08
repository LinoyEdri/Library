import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { logInThroughLoginPage } from './helpers/authentication.ts';
import { SeedAccounts } from './helpers/seed-accounts.ts';

// WCAG 2 A/AA rules; only "serious" and "critical" problems fail the test.
// Each problem lists the failing elements and axe's explanation, so it can be fixed directly.
const findSeriousAccessibilityProblems = async (page: Page) => {
  const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

  return violations
    .filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')
    .flatMap((violation) =>
      violation.nodes.map(
        (node) => `${violation.id} | ${node.target.join(' ')} | ${node.failureSummary ?? ''}`,
      ),
    );
};

// The whole app is Hebrew and right-to-left
const expectHebrewRightToLeft = async (page: Page) => {
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('html')).toHaveAttribute('lang', 'he');
  await expect(page.locator('body')).toHaveCSS('direction', 'rtl');
};

const pagesToCheck = [
  { name: 'login page', path: '/login', email: null },
  { name: 'forgot password page', path: '/forgot-password', email: null },
  { name: 'admin dashboard', path: '/dashboard', email: SeedAccounts.admin.email },
  { name: 'librarian loans list', path: '/loans', email: SeedAccounts.librarian.email },
  { name: 'member books catalog', path: '/books', email: SeedAccounts.memberDana.email },
  { name: 'admin audit log', path: '/audit-logs', email: SeedAccounts.admin.email },
];

test.describe('accessibility and right-to-left layout', () => {
  for (const { name, path, email } of pagesToCheck) {
    test(`${name} is RTL Hebrew and has no serious accessibility problems`, async ({ page }) => {
      if (email) {
        await logInThroughLoginPage(page, email);
      }

      await page.goto(path);
      await page.waitForLoadState('networkidle');

      await expectHebrewRightToLeft(page);

      expect(await findSeriousAccessibilityProblems(page)).toEqual([]);
    });
  }
});

import { expect, test } from '@playwright/test';
import { getAccessToken, logInThroughLoginPage } from './helpers/authentication.ts';
import { HebrewTexts } from './helpers/hebrew-texts.ts';
import { SeedAccounts, SeedBooks } from './helpers/seed-accounts.ts';

test.describe('books catalog', () => {
  test('searching the catalog shows only matching books', async ({ page }) => {
    await logInThroughLoginPage(page, SeedAccounts.memberDana.email);

    await page.goto('/books');

    await page.getByPlaceholder(HebrewTexts.books.searchPlaceholder).fill(SeedBooks.disabledBook);

    await expect(page.getByText(SeedBooks.disabledBook).first()).toBeVisible();
    await expect(page.getByText(SeedBooks.loanedBook)).toHaveCount(0);
  });

  test('only an admin disables and reactivates a book', async ({ page, request }) => {
    const token = await getAccessToken(request, SeedAccounts.admin.email);

    const booksResponse = await request.get('/api/books', {
      params: { search: SeedBooks.disabledBook },
      headers: { Authorization: `Bearer ${token}` },
    });

    const [book] = (await booksResponse.json()).data;

    // A librarian sees the book but has no disable button
    await logInThroughLoginPage(page, SeedAccounts.librarian.email);
    await page.goto(`/books/${book.id}`);

    await expect(page.getByRole('heading', { name: SeedBooks.disabledBook })).toBeVisible();
    await expect(page.getByRole('button', { name: HebrewTexts.common.disable })).toHaveCount(0);

    // The admin disables it (with confirmation) and reactivates it
    await page.getByRole('button', { name: HebrewTexts.authentication.logout }).click();
    await logInThroughLoginPage(page, SeedAccounts.admin.email);
    await page.goto(`/books/${book.id}`);

    await page.getByRole('button', { name: HebrewTexts.common.disable }).click();
    await page
      .getByRole('dialog')
      .getByRole('button', { name: HebrewTexts.common.confirm })
      .click();

    await expect(page.getByRole('button', { name: HebrewTexts.common.reactivate })).toBeVisible();

    await page.getByRole('button', { name: HebrewTexts.common.reactivate }).click();

    await expect(page.getByRole('button', { name: HebrewTexts.common.disable })).toBeVisible();
  });
});

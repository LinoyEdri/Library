import { expect, test } from '@playwright/test';
import { openSessionAs } from './helpers/authentication.ts';
import { HebrewTexts } from './helpers/hebrew-texts.ts';
import { SeedAccounts, SeedBooks } from './helpers/seed-accounts.ts';

const { loans: texts } = HebrewTexts;

// The whole loan workflow across two people: librarian lends, member asks to return,
// librarian processes the return
test('a loan from lending to the processed return', async ({ browser }) => {
  const librarianPage = await openSessionAs(browser, SeedAccounts.librarian.email);
  const memberPage = await openSessionAs(browser, SeedAccounts.memberDana.email);

  // 1. The librarian lends the book to Dana
  await librarianPage.goto('/loans');
  await librarianPage.getByRole('button', { name: texts.newLoan }).click();

  const newLoanDialog = librarianPage.getByRole('dialog');

  await newLoanDialog
    .getByLabel(texts.memberField, { exact: true })
    .fill(SeedAccounts.memberDana.firstName);
  await librarianPage
    .getByRole('option', { name: new RegExp(SeedAccounts.memberDana.email) })
    .click();

  await newLoanDialog.getByLabel(texts.bookField, { exact: true }).fill(SeedBooks.loanedBook);
  await librarianPage.getByRole('option', { name: new RegExp(SeedBooks.loanedBook) }).click();

  await newLoanDialog.getByRole('button', { name: texts.lend, exact: true }).click();

  await expect(librarianPage.getByText(texts.loanCreated)).toBeVisible();

  // 2. Dana sees it in her loans and asks to return it
  await memberPage.goto('/loans');

  const memberLoanRow = memberPage.getByRole('row', { name: new RegExp(SeedBooks.loanedBook) });

  await expect(memberLoanRow.getByText(HebrewTexts.loanStatuses.ACTIVE)).toBeVisible();

  await memberLoanRow.getByRole('button', { name: texts.requestReturn }).click();

  await expect(memberPage.getByText(texts.returnRequested)).toBeVisible();
  await expect(memberLoanRow.getByText(HebrewTexts.loanStatuses.RETURN_REQUESTED)).toBeVisible();

  // 3. The librarian finds it under "return requests" and processes the return
  await librarianPage.reload();
  await librarianPage.getByRole('tab', { name: texts.pendingReturnsTab }).click();

  const pendingLoanRow = librarianPage.getByRole('row', {
    name: new RegExp(SeedBooks.loanedBook),
  });

  await pendingLoanRow.getByRole('button', { name: texts.processReturn }).click();

  await librarianPage
    .getByRole('dialog')
    .getByRole('button', { name: texts.processReturn })
    .click();

  await expect(librarianPage.getByText(texts.returnProcessed)).toBeVisible();

  // 4. Dana's loan now shows as returned
  await memberPage.reload();

  await expect(memberLoanRow.getByText(HebrewTexts.loanStatuses.RETURNED)).toBeVisible();
});

import { expect, test } from '@playwright/test';
import { BusinessErrorCode } from '@library/shared';
import { getAccessToken, logInThroughLoginPage } from './helpers/authentication.ts';
import { HebrewTexts } from './helpers/hebrew-texts.ts';
import { SeedAccounts, SeedBooks } from './helpers/seed-accounts.ts';

// A disabled member becomes a guest: can still log in, but has no loans and cannot borrow
test('a disabled member cannot borrow', async ({ page, request }) => {
  const token = await getAccessToken(request, SeedAccounts.librarian.email);
  const authorization = { Authorization: `Bearer ${token}` };

  const membersResponse = await request.get('/api/members', {
    params: { search: SeedAccounts.memberMichal.email },
    headers: authorization,
  });

  const [member] = (await membersResponse.json()).data;

  const booksResponse = await request.get('/api/books', {
    params: { search: SeedBooks.loanedBook },
    headers: authorization,
  });

  const [book] = (await booksResponse.json()).data;

  await request.post(`/api/members/${member.id}/disable`, { headers: authorization });

  try {
    const loanResponse = await request.post('/api/loans', {
      data: { memberId: member.id, bookId: book.id },
      headers: authorization,
    });

    expect(loanResponse.status()).toBe(409);
    expect((await loanResponse.json()).error.code).toBe(BusinessErrorCode.MEMBER_NOT_ACTIVE);

    // In the app, the disabled member is now a guest without a loans menu
    await logInThroughLoginPage(page, SeedAccounts.memberMichal.email);

    await expect(page).toHaveURL(/\/books/);
    await expect(
      page.getByRole('link', { name: HebrewTexts.navigation.loans, exact: true }),
    ).toHaveCount(0);
  } finally {
    // Leave the seed as it was for the other tests
    await request.post(`/api/members/${member.id}/reactivate`, { headers: authorization });
  }
});

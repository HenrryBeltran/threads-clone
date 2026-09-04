import { test, expect } from '@playwright/test';

interface TestAccount {
  username: string;
  name: string;
  profilePictureId: string | null;
  password: string;
}

/**
 * Full-stack smoke test against the real stack (NestJS + Vite + SQLite).
 *
 * The app ships pre-verified demo "test accounts" (returned by
 * /api/user/test-accounts with a known password). Logging in with one of
 * these avoids the email/OTP step, which can't be delivered in CI, while
 * still exercising the real login flow, session cookie, and home feed.
 */
test('logs in with a test account and loads the home feed', async ({ page, request }) => {
  const res = await request.get('/api/user/test-accounts');
  expect(res.ok()).toBeTruthy();
  const accounts = (await res.json()) as TestAccount[];
  expect(accounts.length).toBeGreaterThan(0);

  const account = accounts[0];

  await page.goto('/login');
  await expect(page).toHaveTitle(/Threads Clone/i);

  await page.getByPlaceholder('Username or email address').fill(account.username);
  await page.getByPlaceholder('Password', { exact: true }).fill(account.password);
  await page.getByRole('button', { name: 'Log in', exact: true }).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('button', { name: "What's new?", exact: true })).toBeVisible();
});

test('renders the login page and shows the sign up link', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Forgotten password?' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign up' })).toBeVisible();
});

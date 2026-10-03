import { test, expect } from '@playwright/test';

test('standard user can log in and sees Products title', async ({ page }) => {
  await page.goto('https://www.saucedemo.com');
  await page.getByTestId('username').fill('standard_user');
  await page.getByTestId('password').fill('secret_sauce');
  await page.getByTestId('login-button').click();
  await expect(page.getByTestId('title')).toHaveText('Products');
});

test('locked out user sees an error', async ({ page }) => {
  await page.goto('https://www.saucedemo.com');
  await page.getByTestId('username').fill('locked_out_user');
  await page.getByTestId('password').fill('secret_sauce');
  await page.getByTestId('login-button').click();
  await expect(page.getByTestId('error')).toContainText('locked out');
});
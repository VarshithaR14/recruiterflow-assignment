import { test, expect } from '@playwright/test';

test.use({
  baseURL: 'https://reqres.in',
  extraHTTPHeaders: { 'x-api-key': process.env.REQRES_API_KEY ?? '' },
});

test('get user 2 returns an email', async ({ request }) => {
  const response = await request.get('/api/users/2');
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.data.email).toBeTruthy();
});

test('create user returns 201 and the name', async ({ request }) => {
  const response = await request.post('/api/users', {
    data: { name: 'morpheus', job: 'leader' },
  });
  expect(response.status()).toBe(201);
  const body = await response.json();
  expect(body.name).toBe('morpheus');
});
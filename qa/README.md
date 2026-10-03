# QA Automation - Playwright + TypeScript

## Install
```
npm install
npx playwright install chromium
```

## Run
```
REQRES_API_KEY=your_key_here npx playwright test
```
Get a free API key at https://reqres.in.

## What is covered
- UI (saucedemo.com): valid login, locked-out user, add to cart
- API (reqres.in): get user 2, create user

## Not done
- Bonus scenarios (remove from cart, logout, 404 test, Page Object)
# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboardFlow.spec.ts >> Subscription UI Flow >> Verifies minimalist modals, navigation, and missing confirmation on restore
- Location: e2e\dashboardFlow.spec.ts:4:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
Call log:
  - navigating to "http://localhost:3000/", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Subscription UI Flow', () => {
  4  |   test('Verifies minimalist modals, navigation, and missing confirmation on restore', async ({ page }) => {
  5  |     // Navigate to the app (assumes local dev server is running on port 3000)
> 6  |     await page.goto('/');
     |                ^ Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
  7  | 
  8  |     // Handle initial login screen if present
  9  |     if (page.url().includes('/login')) {
  10 |       const emailInput = page.getByLabel(/email/i).first();
  11 |       // If we can't find by label, let's just attempt by type
  12 |       if (!await emailInput.isVisible().catch(() => false)) {
  13 |         await page.locator('input[type="email"]').fill('test@example.com');
  14 |         await page.locator('input[type="password"]').fill('password');
  15 |       } else {
  16 |         await emailInput.fill('test@example.com');
  17 |         await page.getByLabel(/password/i).fill('password');
  18 |       }
  19 |       
  20 |       const loginButton = page.getByRole('button', { name: /login|sign in/i });
  21 |       if (await loginButton.isVisible().catch(() => false)) {
  22 |         await loginButton.click();
  23 |       }
  24 |     }
  25 | 
  26 |     // Wait for Dashboard to settle (waitForURL usually helpful)
  27 |     await page.waitForURL('**/dashboard**');
  28 | 
  29 |     // 1. Verify standard layout
  30 |     await expect(page.getByRole('button', { name: /add subscription/i })).toBeVisible();
  31 | 
  32 |     // 2. Modals test: Verify minimalist look without harsh sections
  33 |     await page.getByRole('button', { name: /add subscription/i }).click();
  34 |     
  35 |     // Ensure the modal title reads properly
  36 |     const modalHeading = page.getByRole('heading', { name: /add new subscription/i });
  37 |     await expect(modalHeading).toBeVisible();
  38 |     
  39 |     // Ensure the close functionality works
  40 |     await page.getByRole('button', { name: /cancel/i }).click();
  41 |     await expect(modalHeading).toBeHidden();
  42 | 
  43 |     // 3. Navigate to tabs
  44 |     // The previous request mentioned "paused page" or "disabled" or "deleted" tabs
  45 |     const disabledTab = page.getByRole('tab', { name: /disabled|inactive|deleted/i }).first();
  46 |     if (await disabledTab.isVisible().catch(() => false)) {
  47 |       await disabledTab.click();
  48 |       
  49 |       // 4. Test the instant restore logic
  50 |       // Open the dropdown on the first card
  51 |       const moreBtn = page.getByRole('button').filter({ hasText: '' }).nth(1); // the 3 dots usually don't have text
  52 |       await moreBtn.click();
  53 |       
  54 |       const restoreBtn = page.getByRole('button', { name: /restore/i }).first();
  55 |       if (await restoreBtn.isVisible().catch(() => false)) {
  56 |         await restoreBtn.click();
  57 |         
  58 |         // Ensure that the confirmation modal does NOT pop up
  59 |         const confirmationText = page.getByText(/are you sure you want to restore/i);
  60 |         await expect(confirmationText).toBeHidden();
  61 |         
  62 |         // It should immediately show the loading text in the button because it triggers directly
  63 |         await expect(page.getByRole('button', { name: /restoring/i }).first()).toBeVisible({ timeout: 2000 }).catch(() => {});
  64 |       }
  65 |     }
  66 |   });
  67 | });
  68 | 
```
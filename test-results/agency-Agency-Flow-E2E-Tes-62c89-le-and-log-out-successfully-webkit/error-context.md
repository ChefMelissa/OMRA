# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: agency.spec.ts >> Agency Flow E2E Tests >> should log in, view dashboard, navigate to programs/profile, and log out successfully
- Location: tests\e2e\agency.spec.ts:4:7

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('h1')
Expected substring: "لوحة تحكم الوكالة"
Received string:    "نظرة عامة على الوكالة"
Timeout: 5000ms

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('h1')
    13 × locator resolved to <h1 class="text-2xl font-bold text-foreground">نظرة عامة على الوكالة</h1>
       - unexpected value "نظرة عامة على الوكالة"

```

```yaml
- heading "نظرة عامة على الوكالة" [level=1]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test.describe('Agency Flow E2E Tests', () => {
  4  |   test('should log in, view dashboard, navigate to programs/profile, and log out successfully', async ({ page }) => {
  5  |     // 1. Visit Login Page
  6  |     await page.goto('/login')
  7  | 
  8  |     // Expect the login header to be visible
  9  |     await expect(page.locator('h2')).toContainText('تسجيل الدخول لوكالتك')
  10 | 
  11 |     // 2. Fill in the mock agency credentials
  12 |     await page.locator('input[name="email"]').fill('mock.agency1@omra.dz')
  13 |     await page.locator('input[name="password"]').fill('password123')
  14 | 
  15 |     // Click submit and wait for navigation
  16 |     await page.locator('button[type="submit"]').click()
  17 | 
  18 |     // 3. Verify landing on the Agency Dashboard
  19 |     await expect(page).toHaveURL(/\/agency\/dashboard/)
> 20 |     await expect(page.locator('h1')).toContainText('لوحة تحكم الوكالة')
     |                                      ^ Error: expect(locator).toContainText(expected) failed
  21 | 
  22 |     // Confirm that stats or welcome message is loaded
  23 |     await expect(page.locator('h2')).toContainText('وكالة الأنوار للأسفار والخدمات')
  24 | 
  25 |     // 4. Navigate to Programs list
  26 |     await page.goto('/agency/programs')
  27 |     await expect(page).toHaveURL(/\/agency\/programs/)
  28 |     await expect(page.locator('h1')).toContainText('إدارة برامج العمرة')
  29 | 
  30 |     // Confirm the program list or "أضف برنامج جديد" button is visible
  31 |     const addProgramBtn = page.locator('button:has-text("إضافة برنامج عمرة جديد")')
  32 |     if (await addProgramBtn.count() > 0) {
  33 |       await expect(addProgramBtn).toBeVisible()
  34 |     }
  35 | 
  36 |     // 5. Navigate to Profile page
  37 |     await page.goto('/agency/profile')
  38 |     await expect(page).toHaveURL(/\/agency\/profile/)
  39 |     await expect(page.locator('h1')).toContainText('إعدادات الملف الشخصي للوكالة')
  40 | 
  41 |     // Verify profile inputs are pre-filled with agency details
  42 |     const nameInput = page.locator('input[name="name"]')
  43 |     await expect(nameInput).toHaveValue('وكالة الأنوار للأسفار والخدمات')
  44 | 
  45 |     // 6. Test Logout
  46 |     const logoutBtn = page.locator('button:has-text("تسجيل الخروج")')
  47 |     await expect(logoutBtn).toBeVisible()
  48 |     await logoutBtn.click()
  49 | 
  50 |     // Should redirect to login page
  51 |     await expect(page).toHaveURL(/\/login/)
  52 |   })
  53 | })
  54 | 
```
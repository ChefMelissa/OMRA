import { test, expect } from '@playwright/test'

test.describe('Agency Flow E2E Tests', () => {
  test('should log in, view dashboard, navigate to programs/profile, and log out successfully', async ({ page }) => {
    // 1. Visit Login Page
    await page.goto('/login')

    // Expect the login header to be visible
    await expect(page.locator('h2')).toContainText('تسجيل الدخول لوكالتك')

    // 2. Fill in the mock agency credentials
    await page.locator('input[name="email"]').fill('mock.agency1@omra.dz')
    await page.locator('input[name="password"]').fill('password123')

    // Click submit and wait for navigation
    await page.locator('button[type="submit"]').click()

    // 3. Verify landing on the Agency Dashboard
    await expect(page).toHaveURL(/\/agency\/dashboard/)
    await expect(page.locator('h1')).toContainText('نظرة عامة على الوكالة')

    // Confirm that stats or welcome message is loaded
    await expect(page.locator('aside')).toContainText('وكالة الأنوار للأسفار والخدمات')

    // 4. Navigate to Programs list
    await page.goto('/agency/programs')
    await expect(page).toHaveURL(/\/agency\/programs/)
    await expect(page.locator('h1')).toContainText('إدارة برامج العمرة')

    // Confirm the program list or "أضف برنامج جديد" button is visible
    const addProgramBtn = page.locator('button:has-text("إضافة برنامج عمرة جديد")')
    if (await addProgramBtn.count() > 0) {
      await expect(addProgramBtn).toBeVisible()
    }

    // 5. Navigate to Profile page
    await page.goto('/agency/profile')
    await expect(page).toHaveURL(/\/agency\/profile/)
    await expect(page.locator('h1')).toContainText('بيانات الوكالة السياحية')

    // Verify profile inputs are pre-filled with agency details
    const nameInput = page.locator('input[name="name"]')
    await expect(nameInput).toHaveValue('وكالة الأنوار للأسفار والخدمات')

    // 6. Test Logout
    const logoutBtn = page.locator('button:has-text("تسجيل الخروج")')
    await expect(logoutBtn).toBeVisible()
    await logoutBtn.click()

    // Should redirect to login page
    await expect(page).toHaveURL(/\/login/)
  })
})

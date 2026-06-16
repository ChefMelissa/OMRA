import { test, expect } from '@playwright/test'

test.describe('Admin Flow E2E Tests', () => {
  test('should log in as admin, view dashboard, navigate management pages, and log out', async ({ page }) => {
    // 1. Visit Login Page
    await page.goto('/login')

    // 2. Fill in the administrator credentials
    await page.locator('input[name="email"]').fill('himasouka02@gmail.com')
    await page.locator('input[name="password"]').fill('password123')

    // Click submit and wait for navigation
    await page.locator('button[type="submit"]').click()

    // 3. Verify landing on the Admin Dashboard
    await expect(page).toHaveURL(/\/admin\/dashboard/)
    await expect(page.locator('h1')).toContainText('لوحة تحكم المشرف')

    // 4. Navigate to Agencies management
    await page.goto('/admin/agencies')
    await expect(page).toHaveURL(/\/admin\/agencies/)
    await expect(page.locator('h1')).toContainText('إدارة الوكالات السياحية')

    // 5. Navigate to Bookings management
    await page.goto('/admin/bookings')
    await expect(page).toHaveURL(/\/admin\/bookings/)
    await expect(page.locator('h1')).toContainText('سجل طلبات الحجز العام')

    // 6. Navigate to Commission Settlements
    await page.goto('/admin/settlements')
    await expect(page).toHaveURL(/\/admin\/settlements/)
    await expect(page.locator('h1')).toContainText('تسويات عمولات الوكالات')

    // 7. Log out
    const logoutBtn = page.locator('button:has-text("تسجيل الخروج")')
    await expect(logoutBtn).toBeVisible()
    await logoutBtn.click()

    // Should redirect to login page
    await expect(page).toHaveURL(/\/login/)
  })
})

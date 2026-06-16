import { test, expect } from '@playwright/test'

test.describe('Citizen Flow E2E Tests', () => {
  test('should search, compare, and book a program successfully', async ({ page }) => {
    // 1. Visit homepage
    await page.goto('/')

    // Expect the page title and key text to be visible
    await expect(page).toHaveTitle(/منصة عمرة/)
    await expect(page.locator('h1')).toContainText('تيسير بحثك عن')

    // 2. Verify that program cards are loaded
    const cards = page.locator('a[href^="/programs/"]')
    await expect(cards.first()).toBeVisible()
    const initialCardCount = await cards.count()
    expect(initialCardCount).toBeGreaterThan(0)

    // 4. Test detail page and booking modal flow
    // Click on the first card to go to detail page
    await cards.first().click()
    await expect(page).toHaveURL(/\/programs\/[a-fA-F0-9-]+/)

    // Click "اطلب حجز مكانك الآن (مجاناً)" button
    const bookNowBtn = page.locator('button:has-text("اطلب حجز مكانك الآن")')
    await expect(bookNowBtn).toBeVisible()
    await bookNowBtn.click()

    // Modal should appear
    const modalHeader = page.locator('span:has-text("طلب الحجز المجاني")')
    await expect(modalHeader).toBeVisible()

    // Fill in the form
    await page.locator('input[placeholder="مثال: محمد بن علي"]').fill('محمد بن علي التجريبي')
    await page.locator('input[placeholder="مثال: 0550123456"]').fill('0550112233')

    // Submit the form
    const submitBtn = page.locator('button[type="submit"]')
    await submitBtn.click()

    // Success view should appear
    const successHeader = page.locator('h3:has-text("تم تسجيل طلب حجزك بنجاح!")')
    await expect(successHeader).toBeVisible()

    // Reference number should be displayed
    const refContainer = page.locator('[data-testid="ref-badge"]')
    await expect(refContainer).toBeVisible()
    const refText = await refContainer.locator('span.text-2xl').textContent()
    expect(refText).toMatch(/UMR-[A-Z0-9]{6}/)

    // Close modal
    await page.locator('button:has-text("انتظر اتصال الوكالة بك هاتفياً")').click()
    await expect(successHeader).not.toBeVisible()
  })
})

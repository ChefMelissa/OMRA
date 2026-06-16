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

    // 3. Test program comparison
    // Locate comparison button on the first card
    const firstCard = cards.first()
    const firstTitle = await firstCard.locator('h3').textContent()

    const compareBtn = firstCard.locator('button[title="قارن مع برامج أخرى"]')
    await compareBtn.click()

    // Floating comparison drawer should be visible at the bottom
    const compareDrawer = page.locator('div:has-text("مقارنة برامج العمرة")')
    await expect(compareDrawer).toBeVisible()

    // Add a second program card to compare
    if (initialCardCount > 1) {
      const secondCard = cards.nth(1)
      const secondCompareBtn = secondCard.locator('button[title="قارن مع برامج أخرى"]')
      await secondCompareBtn.click()

      // Should show (2) in the comparison title
      await expect(page.locator('h4:has-text("مقارنة برامج العمرة")')).toContainText('(2)')

      // Click "قارن الآن" button in the drawer to navigate
      const compareNowBtn = page.locator('button:has-text("قارن الآن")')
      await compareNowBtn.click()

      // Should navigate to /compare page
      await expect(page).toHaveURL(/\/compare\?ids=/)
      await expect(page.locator('h1')).toContainText('مقارنة برامج العمرة')

      // Return to homepage using the "العودة للبحث" button
      await page.locator('button:has-text("العودة للبحث")').click()
      await expect(page).toHaveURL('/')
    }

    // 4. Test detail page and booking modal flow
    // Click on the first card to go to detail page
    await cards.first().click()
    await expect(page).toHaveURL(/\/programs\/[a-fA-F0-9-]+/)

    // Click "اطلب حجز مكانك الآن (مجاناً)" button
    const bookNowBtn = page.locator('button:has-text("اطلب حجز مكانك الآن")')
    await expect(bookNowBtn).toBeVisible()
    await bookNowBtn.click()

    // Modal should appear
    const modalHeader = page.locator('h3:has-text("طلب الحجز المجاني")')
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
    const refContainer = page.locator('div:has-text("الرقم المرجعي للحجز")')
    await expect(refContainer).toBeVisible()
    const refText = await refContainer.locator('span.text-2xl').textContent()
    expect(refText).toMatch(/UMR-[A-Z0-9]{6}/)

    // Close modal
    await page.locator('button:has-text("انتظر اتصال الوكالة بك هاتفياً")').click()
    await expect(successHeader).not.toBeVisible()
  })
})

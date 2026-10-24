import { test, expect } from '@playwright/test';

test.describe('NewsPortal End-to-End Suite', () => {
  test('1. Homepage loads successfully with branding and categories', async ({ page }) => {
    await page.goto('/');

    // Check title and logo
    await expect(page).toHaveTitle(/NewsPortal/);
    await expect(page.locator('text=NewsPortal').first()).toBeVisible();

    // Check category navigation
    await expect(page.locator('text=Thời sự').first()).toBeVisible();
    await expect(page.locator('text=Kinh doanh').first()).toBeVisible();
    await expect(page.locator('text=Công nghệ').first()).toBeVisible();

    // Check featured news section
    await expect(page.locator('text=Tiêu điểm nổi bật')).toBeVisible();
  });

  test('2. Navigation to Category page works', async ({ page }) => {
    await page.goto('/danh-muc/cong-nghe');
    await expect(page).toHaveURL(/.*cong-nghe/);
    await expect(page.locator('h1')).toContainText('Công nghệ');
  });

  test('3. Search flow returns results', async ({ page }) => {
    await page.goto('/tim-kiem?q=Việt Nam');
    await expect(page.locator('text=Kết quả tìm kiếm cho: "Việt Nam"')).toBeVisible();
  });

  test('4. Login page renders and validates form', async ({ page }) => {
    await page.goto('/dang-nhap');
    await expect(page.locator('h2')).toContainText('Đăng nhập tài khoản');

    // Attempt empty submit
    await page.click('button:has-text("Đăng nhập")');
    await expect(page.locator('text=Địa chỉ email không hợp lệ')).toBeVisible();
  });
});

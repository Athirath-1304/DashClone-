import { Page, expect } from '@playwright/test';

export interface TestUser {
  email: string;
  password: string;
  role: string;
}

export const testUsers: Record<string, TestUser> = {
  customer: { email: 'customer@test.com', password: 'test123', role: 'customer' },
  restaurant: { email: 'owner@test.com', password: 'test123', role: 'restaurant_owner' },
  delivery: { email: 'delivery@test.com', password: 'test123', role: 'delivery_agent' }
};

export async function loginUser(page: Page, user: TestUser) {
  await page.goto('/login');
  await expect(page).toHaveURL('/login');
  
  await page.fill('input[type="email"]', user.email);
  await page.fill('input[type="password"]', user.password);
  await page.click('button[type="submit"]');
  
  // Wait for login to complete and redirect
  const expectedUrl = `/dashboard/${user.role === 'customer' ? 'customer' : user.role === 'restaurant_owner' ? 'restaurant' : 'delivery'}`;
  await page.waitForURL(expectedUrl);
  
  console.log(`✅ ${user.role} logged in successfully`);
}

export async function waitForOrderStatus(page: Page, status: string, timeout = 10000) {
  const statusElement = page.locator(`text=${status}`).first();
  await expect(statusElement).toBeVisible({ timeout });
  console.log(`✅ Found ${status} order`);
}

export async function verifyToastMessage(page: Page, message: string) {
  const toast = page.locator(`text=${message}`);
  await expect(toast).toBeVisible({ timeout: 5000 });
  console.log(`✅ Toast message: ${message}`);
}

export async function verifyStatusBadge(page: Page, status: string) {
  const statusBadge = page.locator(`text=${status}`);
  await expect(statusBadge).toBeVisible();
  console.log(`✅ Status badge for ${status} is visible`);
}

export async function addItemToCart(page: Page) {
  // Navigate to restaurants
  await page.goto('/restaurants');
  await expect(page).toHaveURL('/restaurants');
  
  // Click on first restaurant
  const firstRestaurant = page.locator('a[href^="/restaurants/"]').first();
  await expect(firstRestaurant).toBeVisible();
  await firstRestaurant.click();
  
  // Wait for restaurant page to load
  await page.waitForLoadState('networkidle');
  
  // Verify menu items are visible
  await expect(page.locator('h2:has-text("Menu")')).toBeVisible();
  await expect(page.locator('text=Add to Cart')).toBeVisible();
  
  // Add first item to cart
  const addToCartButtons = page.locator('button:has-text("Add to Cart")');
  await expect(addToCartButtons.first()).toBeVisible();
  await addToCartButtons.first().click();
  
  // Verify item added to cart
  await expect(page.locator('text=Your Cart')).toBeVisible();
  await expect(page.locator('text=🛒')).toBeVisible();
  
  console.log('✅ Item added to cart successfully');
}

export async function placeOrder(page: Page) {
  // Place order
  const placeOrderButton = page.locator('button:has-text("Place Order")');
  await expect(placeOrderButton).toBeVisible();
  await placeOrderButton.click();
  
  // Wait for order placement
  await page.waitForTimeout(2000);
  
  // Verify success message
  await expect(page.locator('text=Order placed successfully')).toBeVisible();
  console.log('✅ Order placed successfully');
} 
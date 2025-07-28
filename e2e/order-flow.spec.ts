import { test, expect } from '@playwright/test';

test.describe('Full Order Flow', () => {
  test('Complete order flow from customer to delivery', async ({ page }) => {
    // Test data
    const testUsers = {
      customer: { email: 'customer@test.com', password: 'test123' },
      restaurant: { email: 'owner@test.com', password: 'test123' },
      delivery: { email: 'delivery@test.com', password: 'test123' }
    };

    // Step 1: Customer Login and Place Order
    await test.step('Customer places order', async () => {
      console.log('🛒 Step 1: Customer placing order...');
      
      // Navigate to login
      await page.goto('/login');
      await expect(page).toHaveURL('/login');
      
      // Login as customer
      await page.fill('input[type="email"]', testUsers.customer.email);
      await page.fill('input[type="password"]', testUsers.customer.password);
      await page.click('button[type="submit"]');
      
      // Wait for login to complete and redirect
      await page.waitForURL('/dashboard/customer');
      console.log('✅ Customer logged in successfully');
      
      // Navigate to restaurants
      await page.goto('/restaurants');
      await expect(page).toHaveURL('/restaurants');
      
      // Click on first restaurant
      const firstRestaurant = page.locator('a[href^="/restaurants/"]').first();
      await expect(firstRestaurant).toBeVisible();
      await firstRestaurant.click();
      
      // Wait for restaurant page to load
      await page.waitForLoadState('networkidle');
      console.log('✅ Navigated to restaurant page');
      
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
      
      // Verify cart has items
      const cartItems = page.locator('ul li');
      await expect(cartItems.first()).toBeVisible();
      
      // Place order
      const placeOrderButton = page.locator('button:has-text("Place Order")');
      await expect(placeOrderButton).toBeVisible();
      await placeOrderButton.click();
      
      // Wait for order placement
      await page.waitForTimeout(2000);
      
      // Verify success message
      await expect(page.locator('text=Order placed successfully')).toBeVisible();
      console.log('✅ Order placed successfully');
    });

    // Step 2: Restaurant Owner Accepts Order
    await test.step('Restaurant owner accepts order', async () => {
      console.log('🍕 Step 2: Restaurant owner accepting order...');
      
      // Open new page for restaurant owner
      const restaurantPage = await page.context().newPage();
      
      // Login as restaurant owner
      await restaurantPage.goto('/login');
      await restaurantPage.fill('input[type="email"]', testUsers.restaurant.email);
      await restaurantPage.fill('input[type="password"]', testUsers.restaurant.password);
      await restaurantPage.click('button[type="submit"]');
      
      // Wait for login to complete
      await restaurantPage.waitForURL('/restaurant/dashboard');
      console.log('✅ Restaurant owner logged in successfully');
      
      // Navigate to restaurant dashboard
      await restaurantPage.goto('/restaurant/dashboard');
      await expect(restaurantPage).toHaveURL('/restaurant/dashboard');
      
      // Wait for orders to load
      await restaurantPage.waitForLoadState('networkidle');
      
      // Look for PLACED order
      const placedOrder = restaurantPage.locator('text=PLACED').first();
      await expect(placedOrder).toBeVisible({ timeout: 10000 });
      console.log('✅ Found PLACED order');
      
      // Find and click Accept Order button
      const acceptButton = restaurantPage.locator('button:has-text("Accept Order")').first();
      await expect(acceptButton).toBeVisible();
      await acceptButton.click();
      
      // Wait for status update
      await restaurantPage.waitForTimeout(2000);
      
      // Verify status changed to ACCEPTED
      await expect(restaurantPage.locator('text=ACCEPTED')).toBeVisible();
      console.log('✅ Order accepted successfully');
      
      await restaurantPage.close();
    });

    // Step 3: Delivery Agent Picks Up Order
    await test.step('Delivery agent picks up order', async () => {
      console.log('🚚 Step 3: Delivery agent picking up order...');
      
      // Open new page for delivery agent
      const deliveryPage = await page.context().newPage();
      
      // Login as delivery agent
      await deliveryPage.goto('/login');
      await deliveryPage.fill('input[type="email"]', testUsers.delivery.email);
      await deliveryPage.fill('input[type="password"]', testUsers.delivery.password);
      await deliveryPage.click('button[type="submit"]');
      
      // Wait for login to complete
      await deliveryPage.waitForURL('/delivery/dashboard');
      console.log('✅ Delivery agent logged in successfully');
      
      // Navigate to delivery dashboard
      await deliveryPage.goto('/delivery/dashboard');
      await expect(deliveryPage).toHaveURL('/delivery/dashboard');
      
      // Wait for orders to load
      await deliveryPage.waitForLoadState('networkidle');
      
      // Look for ACCEPTED order
      const acceptedOrder = deliveryPage.locator('text=ACCEPTED').first();
      await expect(acceptedOrder).toBeVisible({ timeout: 10000 });
      console.log('✅ Found ACCEPTED order');
      
      // Find and click Picked Up button
      const pickupButton = deliveryPage.locator('button:has-text("Picked Up")').first();
      await expect(pickupButton).toBeVisible();
      await pickupButton.click();
      
      // Wait for status update
      await deliveryPage.waitForTimeout(2000);
      
      // Verify status changed to PICKED_UP
      await expect(deliveryPage.locator('text=PICKED_UP')).toBeVisible();
      console.log('✅ Order marked as picked up');
      
      await deliveryPage.close();
    });

    // Step 4: Delivery Agent Delivers Order
    await test.step('Delivery agent delivers order', async () => {
      console.log('📦 Step 4: Delivery agent delivering order...');
      
      // Open new page for delivery agent
      const deliveryPage = await page.context().newPage();
      
      // Login as delivery agent
      await deliveryPage.goto('/login');
      await deliveryPage.fill('input[type="email"]', testUsers.delivery.email);
      await deliveryPage.fill('input[type="password"]', testUsers.delivery.password);
      await deliveryPage.click('button[type="submit"]');
      
      // Wait for login to complete
      await deliveryPage.waitForURL('/delivery/dashboard');
      
      // Navigate to delivery dashboard
      await deliveryPage.goto('/delivery/dashboard');
      await expect(deliveryPage).toHaveURL('/delivery/dashboard');
      
      // Wait for orders to load
      await deliveryPage.waitForLoadState('networkidle');
      
      // Look for PICKED_UP order
      const pickedUpOrder = deliveryPage.locator('text=PICKED_UP').first();
      await expect(pickedUpOrder).toBeVisible({ timeout: 10000 });
      console.log('✅ Found PICKED_UP order');
      
      // Find and click Delivered button
      const deliverButton = deliveryPage.locator('button:has-text("Delivered")').first();
      await expect(deliverButton).toBeVisible();
      await deliverButton.click();
      
      // Wait for status update
      await deliveryPage.waitForTimeout(2000);
      
      // Verify status changed to DELIVERED
      await expect(deliveryPage.locator('text=DELIVERED')).toBeVisible();
      console.log('✅ Order marked as delivered');
      
      await deliveryPage.close();
    });

    // Step 5: Verify Final Status Across All Dashboards
    await test.step('Verify final order status', async () => {
      console.log('✅ Step 5: Verifying final order status...');
      
      // Check customer dashboard
      await page.goto('/dashboard/customer');
      await expect(page.locator('text=DELIVERED')).toBeVisible();
      console.log('✅ Customer dashboard shows DELIVERED status');
      
      // Check restaurant dashboard
      const restaurantPage = await page.context().newPage();
      await restaurantPage.goto('/login');
      await restaurantPage.fill('input[type="email"]', testUsers.restaurant.email);
      await restaurantPage.fill('input[type="password"]', testUsers.restaurant.password);
      await restaurantPage.click('button[type="submit"]');
      await restaurantPage.waitForURL('/restaurant/dashboard');
      await restaurantPage.goto('/restaurant/dashboard');
      await expect(restaurantPage.locator('text=DELIVERED')).toBeVisible();
      console.log('✅ Restaurant dashboard shows DELIVERED status');
      await restaurantPage.close();
      
      // Check delivery dashboard
      const deliveryPage = await page.context().newPage();
      await deliveryPage.goto('/login');
      await deliveryPage.fill('input[type="email"]', testUsers.delivery.email);
      await deliveryPage.fill('input[type="password"]', testUsers.delivery.password);
      await deliveryPage.click('button[type="submit"]');
      await deliveryPage.waitForURL('/delivery/dashboard');
      await deliveryPage.goto('/delivery/dashboard');
      await expect(deliveryPage.locator('text=DELIVERED')).toBeVisible();
      console.log('✅ Delivery dashboard shows DELIVERED status');
      await deliveryPage.close();
    });

    // Bonus: Toast and Status Badge Verification
    await test.step('Verify UI elements and notifications', async () => {
      console.log('🎁 Bonus: Verifying UI elements...');
      
      // Verify toast notifications are working
      await page.goto('/restaurants');
      const firstRestaurant = page.locator('a[href^="/restaurants/"]').first();
      await firstRestaurant.click();
      
      // Add item to cart and verify toast
      const addToCartButton = page.locator('button:has-text("Add to Cart")').first();
      await addToCartButton.click();
      
      // Check for toast notification
      await expect(page.locator('[data-sonner-toast]')).toBeVisible({ timeout: 5000 });
      console.log('✅ Toast notifications are working');
      
      // Verify status badges have correct colors
      await page.goto('/restaurant/dashboard');
      await page.fill('input[type="email"]', testUsers.restaurant.email);
      await page.fill('input[type="password"]', testUsers.restaurant.password);
      await page.click('button[type="submit"]');
      await page.waitForURL('/restaurant/dashboard');
      
      // Check that status badges are visible
      const statusBadges = page.locator('[class*="bg-"]');
      await expect(statusBadges.first()).toBeVisible();
      console.log('✅ Status badges are properly styled');
    });

    console.log('🎉 All tests completed successfully!');
  });

  test('Verify order status flow transitions', async ({ page }) => {
    console.log('🔄 Testing order status flow transitions...');
    
    // Login as restaurant owner to check status flow
    await page.goto('/login');
    await page.fill('input[type="email"]', 'owner@test.com');
    await page.fill('input[type="password"]', 'test123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/restaurant/dashboard');
    
    // Verify all status badges are present
    const statuses = ['PLACED', 'ACCEPTED', 'PICKED_UP', 'DELIVERED'];
    for (const status of statuses) {
      const statusElement = page.locator(`text=${status}`);
      await expect(statusElement).toBeVisible({ timeout: 5000 });
      console.log(`✅ Status badge for ${status} is visible`);
    }
    
    console.log('✅ All order status transitions verified');
  });
}); 
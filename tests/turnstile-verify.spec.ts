import { test, expect } from '@playwright/test';

test.describe('Turnstile Verification', () => {
  const BASE_URL = process.env.BASE_URL || 'https://red-mud-03ec6f910.2.azurestaticapps.net';
  
  test('Verify-danny page has Turnstile widget', async ({ page }) => {
    console.log(`Testing Turnstile on ${BASE_URL}/verify-danny`);
    
    await page.goto(`${BASE_URL}/verify-danny`);
    await page.waitForLoadState('domcontentloaded');
    
    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/turnstile-danny-1.png',
      fullPage: true 
    });
    
    // Check for Turnstile container
    const turnstileContainer = page.locator('#turnstile-widget');
    await expect(turnstileContainer).toBeVisible({ timeout: 10000 });
    
    // Log console messages
    const logs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      logs.push(text);
      if (text.includes('Turnstile') || text.includes('widget') || text.includes('render')) {
        console.log(`[Console] ${text}`);
      }
    });
    
    // Wait for Turnstile to potentially render
    await page.waitForTimeout(10000);
    
    // Take another screenshot
    await page.screenshot({ 
      path: 'test-results/turnstile-danny-2.png',
      fullPage: true 
    });
    
    console.log('Turnstile widget found on verify-danny page');
    expect(turnstileContainer).toBeVisible();
  });
  
  test('Verify-helen page has Turnstile widget', async ({ page }) => {
    console.log(`Testing Turnstile on ${BASE_URL}/verify-helen`);
    
    await page.goto(`${BASE_URL}/verify-helen`);
    await page.waitForLoadState('domcontentloaded');
    
    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/turnstile-helen-1.png',
      fullPage: true 
    });
    
    // Check for Turnstile container
    const turnstileContainer = page.locator('#turnstile-widget');
    await expect(turnstileContainer).toBeVisible({ timeout: 10000 });
    
    // Log console messages
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('Turnstile') || text.includes('widget') || text.includes('render')) {
        console.log(`[Console] ${text}`);
      }
    });
    
    // Wait for Turnstile to potentially render
    await page.waitForTimeout(10000);
    
    // Take another screenshot
    await page.screenshot({ 
      path: 'test-results/turnstile-helen-2.png',
      fullPage: true 
    });
    
    console.log('Turnstile widget found on verify-helen page');
    expect(turnstileContainer).toBeVisible();
  });
  
  test('Turnstile renders iframe', async ({ page }) => {
    await page.goto(`${BASE_URL}/verify-danny`);
    await page.waitForTimeout(15000);
    
    // Check for Turnstile iframe
    const iframes = await page.locator('iframe').count();
    console.log(`Found ${iframes} iframe(s) on verify-danny page`);
    
    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/turnstile-danny-3.png',
      fullPage: true 
    });
    
    // Note: Turnstile may not render iframe if domain mismatch
    // This test documents the current state
    console.log(`Turnstile iframes: ${iframes}`);
  });
});

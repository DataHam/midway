import { Page, expect } from '@playwright/test';

/**
 * Navigation helpers for verification gate tests
 */

export async function navigateToVerifyDanny(page: Page): Promise<void> {
  await page.goto('/verify-danny.html');
  await expect(page).toHaveURL(/.*verify-danny/);
}

export async function navigateToVerifyHelen(page: Page): Promise<void> {
  await page.goto('/verify-helen.html');
  await expect(page).toHaveURL(/.*verify-helen/);
}

export async function navigateFromHome(page: Page, target: 'danny' | 'helen'): Promise<void> {
  // Navigate to home page
  await page.goto('/');
  
  // Find and click the appropriate navigation card
  const card = target === 'danny' 
    ? page.locator('a[href*="verify-danny"]')
    : page.locator('a[href*="verify-helen"]');
  
  await expect(card).toBeVisible();
  await card.click();
  
  // Wait for navigation to complete
  await page.waitForLoadState('networkidle');
}

export async function waitForTurnstileWidget(page: Page, timeout: number = 10000): Promise<void> {
  const widget = page.locator('#turnstile-widget');
  await expect(widget).toBeVisible({ timeout });
}

export async function waitForSubmitButtonEnabled(page: Page, timeout: number = 15000): Promise<void> {
  const button = page.locator('#submit-btn');
  await expect(button).toBeEnabled({ timeout });
}

export async function verifyModalStructure(page: Page): Promise<void> {
  const modal = page.locator('#error-modal');
  await expect(modal).toBeAttached();
  
  const title = modal.locator('#error-title');
  await expect(title).toBeAttached();
  
  const message = modal.locator('#error-message');
  await expect(message).toBeAttached();
  
  const closeButton = modal.locator('button');
  await expect(closeButton).toBeAttached();
}

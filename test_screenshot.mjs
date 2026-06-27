import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 2560, height: 1080 }
  });
  const page = await context.newPage();
  await page.goto('file:///home/dataham/tamtham.com/index.html');
  await page.screenshot({ path: '/home/dataham/.gemini/antigravity-ide/brain/ac9ab6d1-76b1-45ff-9f92-bb187d82a450/artifacts/hero-wide.png' });
  await browser.close();
})();

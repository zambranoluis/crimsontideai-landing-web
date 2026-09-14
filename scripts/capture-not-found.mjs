import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const output = '.impeccable/review/not-found';
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const errors = [];
try {
  for (const [name, width, height] of [['desktop', 1680, 945], ['laptop', 1280, 800], ['tablet', 768, 1024], ['mobile', 390, 844]]) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    page.on('pageerror', error => errors.push(`${name}: ${error.message}`));
    page.on('console', message => { if (message.type() === 'error' && !message.text().includes('404 (Not Found)')) errors.push(`${name}: ${message.text()}`); });
    await page.goto('http://localhost:3001/__404-preview');
    await page.locator('[data-globe-ready="true"]').waitFor({ timeout: 60000 });
    await page.getByRole('button', { name: 'Pause animation' }).click();
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => window.scrollTo(0, 0));
    if (name === 'desktop' && process.argv.includes('--posters')) {
      await page.locator('[data-globe-host]').evaluate(host => { host.style.width = '1008px'; host.style.height = '900px'; });
      await page.waitForTimeout(150);
      for (const kind of ['globe', 'terrain']) {
        const png = await page.locator(`[data-${kind}-canvas]`).evaluate(canvas => canvas.toDataURL('image/png').split(',')[1]);
        await writeFile(`public/pages/not-found/${kind}-poster.png`, Buffer.from(png, 'base64'));
      }
      await page.locator('[data-globe-host]').evaluate(host => host.removeAttribute('style'));
      await page.waitForTimeout(150);
    }
    await page.screenshot({ path: `${output}/${name}.png`, fullPage: true });
    console.log(JSON.stringify({ name, width, height, metrics: await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, viewport: innerWidth, pageHeight: document.documentElement.scrollHeight, quality: document.querySelector('[data-testid="not-found-scene"]').dataset.quality })) }));
    await page.close();
  }
} finally { await browser.close(); }
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }

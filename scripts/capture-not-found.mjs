import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const output = process.env.CAPTURE_OUTPUT || '.impeccable/review/not-found';
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const base = process.env.TEST_BASE_URL || 'http://localhost:3001';
const errors = [];
try {
  if (process.argv.includes('--posters') || process.argv.includes('--globe-poster')) {
    const page = await browser.newPage({ viewport: { width: 1680, height: 945 }, deviceScaleFactor: 1 });
    // Keep ambient time at zero while normal loading and ResizeObserver still run.
    await page.addInitScript(() => { window.requestAnimationFrame = () => 0; window.cancelAnimationFrame = () => {}; });
    await page.goto(`${base}/__404-preview`);
    await page.locator('[data-globe-ready="true"]').waitFor({ timeout: 60000 });
    // Match the renderer's minimum aspect (1.24), so object-fit:contain and
    // the responsive camera have identical sphere scale at every viewport.
    for (const [kind, width, height] of [['globe', 1116, 900], ['terrain', 1680, 330]]) {
      if (kind === 'terrain' && process.argv.includes('--globe-poster')) continue;
      await page.locator(`[data-${kind}-host]`).evaluate((host, size) => {
        host.style.width = `${size[0]}px`; host.style.height = `${size[1]}px`;
      }, [width, height]);
      await page.waitForFunction(({ kind, width, height }) => {
        const canvas = document.querySelector(`[data-${kind}-canvas]`);
        return canvas.width === width && canvas.height === height;
      }, { kind, width, height }, { polling: 100 });
      const png = await page.locator(`[data-${kind}-canvas]`).evaluate(canvas => canvas.toDataURL('image/png').split(',')[1]);
      await writeFile(`public/pages/not-found/${kind}-poster.png`, Buffer.from(png, 'base64'));
    }
    await page.close();
  }
  for (const [name, width, height] of (process.argv.includes('--poster-only') ? [] : [['desktop', 1680, 945], ['laptop', 1280, 800], ['tablet', 768, 1024], ['mobile', 390, 844], ['phone-small', 375, 667], ['landscape', 844, 390], ['short-laptop', 1366, 768]])) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    page.on('pageerror', error => errors.push(`${name}: ${error.message}`));
    page.on('console', message => { if (message.type() === 'error' && !message.text().includes('404 (Not Found)')) errors.push(`${name}: ${message.text()}`); });
    await page.goto(`${base}/__404-preview`);
    await page.locator('[data-globe-ready="true"]').waitFor({ timeout: 60000 });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `${output}/${name}.png`, fullPage: true });
    await page.mouse.move(width * .8, height * .65);
    await page.screenshot({ path: `${output}/${name}-first-pointer.png` });
    const globe = page.locator('[data-globe-button]');
    await globe.click();
    await globe.press('ArrowRight');
    await globe.press('Home');
    await page.screenshot({ path: `${output}/${name}-interaction.png` });
    console.log(JSON.stringify({ name, width, height, metrics: await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, viewport: innerWidth, pageHeight: document.documentElement.scrollHeight, viewportHeight: innerHeight, footerBottom: document.querySelector('footer').getBoundingClientRect().bottom, quality: document.querySelector('[data-testid="not-found-scene"]').dataset.quality })) }));
    await page.close();
  }
} finally { await browser.close(); }
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }


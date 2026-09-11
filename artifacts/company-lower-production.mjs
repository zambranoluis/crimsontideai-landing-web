import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const output = path.join(path.dirname(fileURLToPath(import.meta.url)), 'company-lower');
const luminance = rgb => rgb.map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
(async () => {
  const browser = await chromium.launch();
  const report = [];
  for (const [width, height] of [[1440, 1000], [1280, 800], [1024, 800], [768, 1024], [390, 844], [360, 740]]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce', deviceScaleFactor: 1 });
    await page.goto('http://localhost:3002');
    await page.evaluate(() => document.fonts.ready);
    const section = page.locator('section[aria-labelledby="company-heading"]');
    await page.getByTestId('company-mesh').scrollIntoViewIfNeeded();
    await page.getByTestId('company-image').evaluate(image => image.decode());
    const style = 'header, header *, a[href="#main-content"], nextjs-portal { visibility: hidden !important; }';
    await section.screenshot({ path: path.join(output, `production-${width}.png`), style });
    const text = await section.evaluate(section => {
      const base = section.getBoundingClientRect();
      return [...section.querySelectorAll('h2, h3, p')].map(e => {
        const rect = e.getBoundingClientRect(), css = getComputedStyle(e);
        return { text: e.textContent.slice(0, 45), x: rect.x - base.x, y: rect.y - base.y, width: rect.width, height: rect.height, color: css.color.match(/[\d.]+/g).slice(0, 3).map(Number), required: parseFloat(css.fontSize) >= 24 ? 3 : 4.5 };
      });
    });
    const background = await section.screenshot({ style: style + ' section[aria-labelledby="company-heading"] :is(h2,h3,p) { color: transparent !important; }' });
    const { data, info } = await sharp(background).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const contrasts = text.map(t => {
      let lightest = 0;
      for (let y = Math.max(0, Math.ceil(t.y)); y < Math.min(info.height, t.y + t.height); y++) {
        for (let x = Math.max(0, Math.ceil(t.x)); x < Math.min(info.width, t.x + t.width); x++) {
          const i = (y * info.width + x) * 3;
          lightest = Math.max(lightest, luminance([data[i], data[i + 1], data[i + 2]]));
        }
      }
      return { text: t.text, ratio: +((luminance(t.color) + .05) / (lightest + .05)).toFixed(2), required: t.required };
    });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    report.push({ width, height, overflow, contrasts });
    await page.close();
  }
  for (const [width, height] of [[1440, 1000], [1280, 800], [1024, 800], [768, 1024], [390, 844], [360, 740]]) {
    const context = await browser.newContext({ viewport: { width, height }, javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('http://localhost:3002');
    await page.getByTestId('company-mesh').scrollIntoViewIfNeeded();
    await page.getByTestId('company-image').evaluate(image => image.decode());
    await page.locator('section[aria-labelledby="company-heading"]').screenshot({ path: path.join(output, `production-no-js-${width}.png`), style: 'header, header *, a[href="#main-content"], nextjs-portal { visibility: hidden !important; }' });
    await context.close();
  }
  await fs.writeFile(path.join(output, 'contrast.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report.map(r => ({ width: r.width, overflow: r.overflow, minimumContrast: Math.min(...r.contrasts.map(c => c.ratio)), failures: r.contrasts.filter(c => c.ratio < c.required) })), null, 2));
  await browser.close();
  if (report.some(r => r.overflow || r.contrasts.some(t => t.ratio < t.required))) throw new Error("Production contrast or overflow failure; see contrast.json");
})().catch(e => { console.error(e); process.exit(1); });


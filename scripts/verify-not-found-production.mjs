import { chromium } from '@playwright/test';
import { readFile, readdir, writeFile } from 'node:fs/promises';

const base = process.env.TEST_BASE_URL || 'http://localhost:3101';
const output = '.impeccable/review/not-found';
const browser = await chromium.launch();
const report = { profiles: [], assets: {}, states: [] };
try {
  const chunkDir = '.next/test-production/static/chunks';
  const threeChunks = [];
  for (const file of await readdir(chunkDir)) {
    if (file.endsWith('.js') && (await readFile(`${chunkDir}/${file}`, 'utf8')).includes('WebGLRenderer')) threeChunks.push(file);
  }
  const home = await browser.newPage();
  await home.goto(base);
  await home.waitForTimeout(1000);
  report.assets.threeChunks = threeChunks;
  report.assets.homeLoadsThree = await home.evaluate(files => performance.getEntriesByType('resource').some(entry => files.some(file => entry.name.endsWith(file))), threeChunks);
  await home.close();

  for (const [name, width, height, touch] of [['desktop', 1680, 945, false], ['mobile', 390, 844, true]]) {
    const page = await browser.newPage({ viewport: { width, height }, hasTouch: touch, deviceScaleFactor: 1 });
    await page.goto(`${base}/__404-preview`);
    await page.locator('[data-globe-ready="true"]').waitFor();
    if (touch) await page.locator('[data-globe-host]').scrollIntoViewIfNeeded();
    await page.waitForTimeout(2500);
    const metrics = await page.evaluate(async () => {
      const scene = document.querySelector('[data-testid="not-found-scene"]');
      const startFrames = Number(scene.dataset.frames);
      const start = performance.now();
      await new Promise(resolve => setTimeout(resolve, 3000));
      const gl = document.querySelector('[data-globe-canvas]').getContext('webgl2');
      const info = gl.getExtension('WEBGL_debug_renderer_info');
      return { fps: (Number(scene.dataset.frames) - startFrames) / ((performance.now() - start) / 1000), quality: scene.dataset.quality, title: document.title, gpu: info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER) };
    });
    report.profiles.push({ name, ...metrics });
    await page.close();
  }

  for (const [name, options] of [['reduced-desktop', { reducedMotion: 'reduce', viewport: { width: 1680, height: 945 } }], ['nojs-mobile', { javaScriptEnabled: false, viewport: { width: 390, height: 844 } }]]) {
    const page = await browser.newPage(options);
    const response = await page.goto(`${base}/__404-preview`);
    await page.evaluate(() => document.fonts.ready);
    await page.locator('img[src$="globe-poster.png"]').waitFor();
    await page.screenshot({ path: `${output}/${name}.png`, fullPage: true });
    report.states.push({ name, status: response.status(), noHorizontalOverflow: await page.evaluate(() => document.documentElement.scrollWidth === innerWidth) });
    await page.close();
  }
  await writeFile(`${output}/production-measurements.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  if (report.assets.homeLoadsThree || report.states.some(state => state.status !== 404 || !state.noHorizontalOverflow)) process.exitCode = 1;
} finally { await browser.close(); }

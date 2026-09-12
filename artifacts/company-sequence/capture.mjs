import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const directory = 'artifacts/company-sequence';
await mkdir(directory, { recursive: true });
const browser = await chromium.launch();
const report = [];
const geometry = page => page.locator('#company-about').evaluate(track => {
  const scene = track.querySelector('[data-company-scene]').getBoundingClientRect();
  const header = document.querySelector('header').getBoundingClientRect().height;
  return { start: scrollY + track.getBoundingClientRect().top - innerHeight + scene.height,
    distance: (innerHeight - header) * 2.5, top: innerHeight - scene.height, header,
    pinned: track.dataset.pinned, sceneHeight: scene.height, trackHeight: track.getBoundingClientRect().height };
});
for (const [width, height] of [[1440, 900], [1366, 768]]) {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1,
    recordVideo: width === 1366 ? { dir: directory, size: { width, height } } : undefined });
  const page = await context.newPage();
  await page.goto('http://localhost:3001/company');
  await page.evaluate(() => document.fonts.ready);
  await page.getByTestId('company-radar').locator('img').evaluate(img => img.decode());
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${directory}/${width}-hero.png` });
  const scene = await geometry(page);
  assert.equal(scene.pinned, 'true');
  assert.ok(Math.abs(scene.trackHeight - scene.sceneHeight - scene.distance) < 1);
  for (const [state, progress] of [['brain', .06], ['brain-gear', .27], ['gear', .5], ['gear-bulb', .73], ['bulb', .94], ['final-hold', .99]]) {
    await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), scene.start + scene.distance * progress);
    await page.waitForTimeout(900);
    const position = await page.locator('[data-company-scene]').boundingBox();
    assert.ok(Math.abs(position.y - scene.top) < 1);
    assert.ok(position.y >= scene.header);
    assert.ok(Math.abs(position.y + position.height - height) < 1);
    await page.screenshot({ path: `${directory}/${width}-${state}.png` });
  }
  // A continuous recording includes approach, full holds/transitions, release,
  // and the same path backward. Native scrolling remains under browser control.
  if (width === 1366) {
    for (const [from, to] of [[scene.start - 180, scene.start + scene.distance + 320], [scene.start + scene.distance + 320, scene.start - 180]]) {
      await page.evaluate(async ({ from, to }) => {
        const started = performance.now();
        await new Promise(resolve => {
          function step(now) {
            const progress = Math.min(1, (now - started) / 12000);
            scrollTo({ top: from + (to - from) * progress, behavior: 'instant' });
            if (progress < 1) requestAnimationFrame(step); else resolve();
          }
          requestAnimationFrame(step);
        });
      }, { from, to });
    }
  }
  await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), scene.start + scene.distance + 220);
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${directory}/${width}-release.png` });
  await page.locator('[aria-labelledby="company-closing"]').scrollIntoViewIfNeeded();
  await page.locator('[aria-labelledby="company-closing"] img').evaluate(img => img.decode());
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${directory}/${width}-closing.png` });
  report.push({ viewport: { width, height }, ...scene });
  const video = page.video();
  await context.close();
  if (video) await video.saveAs(`${directory}/laptop-entry-release-reverse.webm`);
}
for (const [label, options, failure] of [
  ['mobile', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }],
  ['tablet', { viewport: { width: 768, height: 1024 }, hasTouch: true }],
  ['short', { viewport: { width: 1280, height: 650 } }],
  ['does-not-fit', { viewport: { width: 1024, height: 800 } }],
  ['reduced', { viewport: { width: 1366, height: 768 }, reducedMotion: 'reduce' }],
  ['no-js', { viewport: { width: 1366, height: 768 }, javaScriptEnabled: false }],
  ['canvas-failure', { viewport: { width: 1366, height: 768 } }, true],
]) {
  const context = await browser.newContext(options);
  if (failure) await context.addInitScript(() => { HTMLCanvasElement.prototype.getContext = () => null; });
  const page = await context.newPage();
  await page.goto('http://localhost:3001/company');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${directory}/${label}-hero.png` });
  await page.locator('#company-about').scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  const scene = await geometry(page);
  assert.notEqual(scene.pinned, 'true');
  assert.ok(Math.abs(scene.trackHeight - scene.sceneHeight) < 1);
  await page.screenshot({ path: `${directory}/${label}-about.png` });
  await page.locator('[aria-labelledby="company-closing"]').scrollIntoViewIfNeeded();
  await page.locator('[aria-labelledby="company-closing"] img').evaluate(img => img.decode());
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${directory}/${label}-closing.png` });
  report.push({ label, ...scene });
  await context.close();
}
await writeFile(`${directory}/geometry.json`, JSON.stringify(report, null, 2));
await browser.close();
console.log(JSON.stringify(report));

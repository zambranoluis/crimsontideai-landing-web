import { chromium } from 'playwright';
import fs from 'node:fs/promises';
const phase = process.argv[2] ?? 'before';
const browser = await chromium.launch();
const measurements = [];
for (const [width, height] of [[360,740],[390,844],[768,1024],[1024,800],[1280,800],[1440,1000]]) {
  const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce', deviceScaleFactor: 1 });
  await page.goto(process.env.COMPANY_URL ?? 'http://localhost:3001/');
  await page.evaluate(() => document.fonts.ready);
  const section = page.locator('section[aria-labelledby="company-heading"]');
  await section.scrollIntoViewIfNeeded();
  await page.getByTestId('company-image').evaluate(e => e.decode());
  await section.screenshot({ path: `artifacts/company-lower/${phase}-${width}.png`, style: 'header, a[href="#main-content"], nextjs-portal { visibility: hidden !important; }' });
  measurements.push(await section.evaluate((s) => {
    const root = s.getBoundingClientRect();
    const rect = e => { const r=e.getBoundingClientRect(); return {top:r.top-root.top,bottom:r.bottom-root.top,left:r.left,width:r.width,height:r.height}; };
    const svg=s.querySelector('svg[data-mesh-fallback]');
    return {width:innerWidth,section:root.height,copy:rect(s.querySelector('[class*="companyCopy"]')),principles:[...s.querySelectorAll('h3')].map(e=>rect(e.parentElement.parentElement)),action:rect(s.querySelector('a')),mesh:rect(svg),crest:svg.querySelector('path').getBBox().y / 800,overflow:document.documentElement.scrollWidth>innerWidth};
  }));
  await page.close();
}
await fs.writeFile(`artifacts/company-lower/${phase}.json`, JSON.stringify(measurements,null,2));
console.log(JSON.stringify(measurements));
await browser.close();


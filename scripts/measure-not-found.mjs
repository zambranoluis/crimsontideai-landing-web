import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
const label = process.argv[2] || 'baseline';
const output = process.env.CAPTURE_OUTPUT || '.impeccable/review/not-found-detail';
const base = process.env.TEST_BASE_URL || 'http://localhost:3001';
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const report = [];
try {
for (const [name,width,height,touch] of [['desktop',1680,945,false],['mobile',390,844,true]]) {
 const page = await browser.newPage({viewport:{width,height},hasTouch:touch,deviceScaleFactor:1});
 await page.goto(`${base}/__404-preview`);
 await page.locator('[data-globe-ready="true"]').waitFor({timeout:60000});
 await page.waitForTimeout(2500);
 const metrics = await page.evaluate(async () => {
  const scene = document.querySelector('[data-testid="not-found-scene"]');
  const samples=[];
  for(let i=0;i<3;i++) {
   const frames=Number(scene.dataset.frames), start=performance.now();
   await new Promise(resolve=>setTimeout(resolve,3000));
   samples.push((Number(scene.dataset.frames)-frames)/((performance.now()-start)/1000));
  }
  const gl=document.querySelector('[data-globe-canvas]').getContext('webgl2'), info=gl.getExtension('WEBGL_debug_renderer_info');
  return {fps:samples,gpu:info?gl.getParameter(info.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)};
 });
 await page.screenshot({path:`${output}/${label}-${name}.png`});
 report.push({name,...metrics}); await page.close();
}
} finally { await browser.close(); }
await writeFile(`${output}/${label}-performance.json`,JSON.stringify(report,null,2));
console.log(JSON.stringify(report));

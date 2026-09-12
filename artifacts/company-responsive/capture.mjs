import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const directory = 'artifacts/company-responsive';
await mkdir(directory, {recursive:true});
const browser = await chromium.launch();
const report = [];
for (const [width,height,touch] of [[390,844,true],[768,1024,true],[820,1180,true],[1024,1366,true],[1024,768,true],[1180,820,true],[1366,1024,true],[1023,768,false],[1025,768,false],[1366,768,false],[1440,900,false]]) {
  const record = width === 390 || width === 768 && height === 1024;
  const context = await browser.newContext({viewport:{width,height},hasTouch:touch,deviceScaleFactor:1,recordVideo:record ? {dir:directory,size:{width,height}} : undefined});
  const page = await context.newPage();
  await page.goto('http://localhost:3001/company');
  await page.evaluate(()=>document.fonts.ready);
  await page.getByTestId('company-radar').locator('img').evaluate(img=>img.decode());
  await page.waitForTimeout(450);
  const label = `${width}x${height}`;
  await page.screenshot({path:`${directory}/${label}-hero.png`});
  const geometry = await page.locator('#company-about').evaluate(section=>{
    const responsive = section.dataset.mode === 'artwork-only';
    const track = responsive ? section.querySelector('[data-company-artwork-track]') : section;
    const child = responsive ? track.firstElementChild : section.querySelector('[data-company-scene]');
    const top = parseFloat(track.style.getPropertyValue('--pin-top'));
    return {mode:section.dataset.mode,start:scrollY+track.getBoundingClientRect().top-top,distance:track.getBoundingClientRect().height-child.getBoundingClientRect().height,top,childHeight:child.getBoundingClientRect().height};
  });
  report.push({width,height,touch,...geometry});
  if (geometry.mode !== 'normal-flow') {
    for (const [name,progress] of [['entry',-.12],['brain',.06],['brain-gear',.27],['gear',.5],['gear-bulb',.73],['bulb',.94],['release',1.12]]) {
      await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),geometry.start+geometry.distance*progress);
      await page.waitForTimeout(500);
      if (progress>0 && progress<1) {
        const target = geometry.mode==='artwork-only' ? page.getByTestId('company-particles') : page.locator('[data-company-scene]');
        assert.ok(Math.abs((await target.boundingBox()).y-geometry.top)<1);
      }
      await page.screenshot({path:`${directory}/${label}-${name}.png`});
    }
    if (record) {
      for (const [from,to] of [[-.12,1.18],[1.18,-.12]]) {
        await page.evaluate(async ({start,distance,from,to})=>{
          const began=performance.now();
          await new Promise(resolve=>{
            function step(now){const p=Math.min(1,(now-began)/9000);scrollTo({top:start+distance*(from+(to-from)*p),behavior:'instant'});if(p<1)requestAnimationFrame(step);else resolve();}
            requestAnimationFrame(step);
          });
        },{...geometry,from,to});
      }
    }
  }
  if (!touch && width>=1366) {
    await page.locator('#company-about').scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    await page.screenshot({path:`${directory}/after-about-${width}.png`});
  }
  const video=page.video();
  await context.close();
  if(video)await video.saveAs(`${directory}/${label}-entry-release-reverse.webm`);
}
await writeFile(`${directory}/geometry.json`,JSON.stringify(report,null,2));
await browser.close();
console.log(JSON.stringify(report));

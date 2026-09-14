import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
const output=process.env.CAPTURE_OUTPUT || '.impeccable/review/not-found-detail';
const base=process.env.TEST_BASE_URL || 'http://localhost:3001';
await mkdir(output,{recursive:true});
const browser=await chromium.launch();
const errors=[];
try {
const page=await browser.newPage({viewport:{width:1680,height:945},deviceScaleFactor:1});
page.on('pageerror',error=>errors.push(error.message));page.on('console',msg=>{if(msg.type()==='error'&&!msg.text().includes('404 (Not Found)'))errors.push(msg.text());});
await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;window.cancelAnimationFrame=()=>{};});
await page.goto(`${base}/__404-preview`);
await page.locator('[data-globe-ready="true"]').waitFor({timeout:60000});
const button=page.locator('[data-globe-button]');
for(let i=0;i<=24;i++){
 if(i)await button.press('ArrowRight');
 if(i%4===0)await page.locator('[data-globe-host]').screenshot({path:`${output}/rotation-${i*15}.png`});
}
for(const direction of ['ArrowUp','ArrowDown']){
 await button.press('Home');
 for(let i=0;i<6;i++)await button.press(direction);
 await page.locator('[data-globe-host]').screenshot({path:`${output}/pole-${direction}.png`});
}
await page.close();
for(const [name,options]of [['reduced-desktop',{viewport:{width:1680,height:945},reducedMotion:'reduce'}],['nojs-mobile',{viewport:{width:390,height:844},javaScriptEnabled:false}]]){
 const p=await browser.newPage(options);await p.goto(`${base}/__404-preview`);await p.evaluate(()=>document.fonts.ready);
 await p.screenshot({path:`${output}/${name}.png`,fullPage:true});await p.close();
}
} finally { await browser.close(); }
await writeFile(`${output}/rotation-errors.json`,JSON.stringify(errors));if(errors.length)throw new Error(errors.join('\n'));

import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const data=vm.runInNewContext(read('content.js')+';INVITATION');
const html=read('index.html');
assert.deepEqual(Object.keys(data.en).sort(),Object.keys(data.ur).sort(),'Translation keys must match');
for(const [lang,copy] of Object.entries({en:data.en,ur:data.ur}))for(const [key,value] of Object.entries(copy))assert.ok(value.trim(),`${lang}.${key} must not be empty`);
for(const url of Object.values(data.links))assert.ok(html.includes(url),'Missing map link');
for(const c of data.contacts){assert.ok(html.includes('tel:'+c.tel));assert.ok(html.includes(c.number));}
for(const copy of ['10:30 am','11:30 am','6:00 pm','7:00 pm','8:00 pm','Saturday, 17 October 2026','Sunday, 18 October 2026','Rijas Marquee','Glory Palace Marquee'])assert.ok(html.includes(copy),'Missing essential fallback content: '+copy);
for(const [,ref] of html.matchAll(/(?:href|src)="([^"]+)"/g)){if(ref.startsWith('#'))assert.ok(html.includes(`id="${ref.slice(1)}"`),'Broken anchor '+ref);else if(!/^(https?:|tel:)/.test(ref))assert.ok(fs.existsSync(path.join(root,ref)),'Missing local asset '+ref);}
for(const [,ref] of read('style.css').matchAll(/url\('([^']+)'\)/g))assert.ok(fs.existsSync(path.join(root,ref)),'Missing CSS asset '+ref);
assert.ok(!html.includes('<audio'));assert.ok(!html.includes('autoplay'));assert.ok(html.includes('id="details-dialog"'));assert.ok(html.includes('id="celebrate"'));assert.ok(read('app.js').includes('new Audio()'));assert.ok(!html.includes('id="motion"'));
if(data.music.src){assert.ok(fs.existsSync(path.join(root,data.music.src)),'Configured music file is missing');}
assert.ok(read('app.js').includes('soundOn=false'));assert.ok(read('style.css').includes('prefers-reduced-motion'));
assert.equal(new Date('2026-10-17T12:00:00+05:00').getUTCDay(),6);
assert.equal(new Date('2026-10-18T12:00:00+05:00').getUTCDay(),0);
console.log('PASS: translations, dates, event details, maps, call links, fallback content, anchors, local assets and audio defaults.');

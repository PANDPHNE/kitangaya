// Builds the public site into dist/: catalog.json from Google Drive + resized FRONT/BACK photos + IMEI-blurred STORAGE/ABOUT.
// Photos are cached by Drive file id (cache/), so each photo is downloaded and resized only once.
import fs from 'node:fs/promises'; import path from 'node:path'; import sharp from 'sharp';
const ID = process.env.CATALOG_ID; if (!ID) throw new Error('CATALOG_ID is not set');
const dl = id => `https://drive.usercontent.google.com/download?id=${id}&export=download&confirm=t`;
const exists = p => fs.access(p).then(() => true, () => false);
async function get(id) { for (let k = 0; k < 3; k++) { const r = await fetch(dl(id)); if (r.ok) { const b = Buffer.from(await r.arrayBuffer()); if (b[0] === 0xff || b[0] === 0x7b) return b; } await new Promise(s => setTimeout(s, 1500 * (k + 1))); } throw new Error('download failed ' + id); }
const cat = JSON.parse((await get(ID)).toString('utf8'));
if (!Array.isArray(cat.items)) throw new Error('catalog.json has no items');
await fs.rm('dist', { recursive: true, force: true });
for (const d of ['dist/data', 'dist/img/f', 'dist/img/t', 'cache']) await fs.mkdir(d, { recursive: true });
for (const f of ['index.html', 'app.js', 'kp-common.js', 'config.js', 'order.js']) await fs.copyFile(f, path.join('dist', f));
await fs.cp('assets', 'dist/assets', { recursive: true });
// cache-busting: browsers always get the scripts that match this page
const V = Date.now().toString(36); let html = await fs.readFile('dist/index.html', 'utf8');
for (const f of ['app.js', 'kp-common.js', 'config.js', 'order.js']) html = html.replace(`src="${f}"`, `src="${f}?v=${V}"`);
await fs.writeFile('dist/index.html', html);
let ok = 0, fail = 0;
const jobs = []; for (const o of cat.items) if (o.front && o.back) jobs.push([o, 'F', o.front], [o, 'B', o.back]);
async function one([o, k, id]) {
  const full = `cache/${id}-f14.jpg`, thumb = `cache/${id}-t.jpg`;
  if (!(await exists(full)) || !(await exists(thumb))) {
    const src = await get(id);
    await sharp(src).rotate().resize(1400, 1400, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 84, mozjpeg: true }).toFile(full);
    await sharp(src).rotate().resize(600, 600, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 74, mozjpeg: true }).toFile(thumb);
  }
  await fs.copyFile(full, `dist/img/f/${o.code}-${k}.jpg`); await fs.copyFile(thumb, `dist/img/t/${o.code}-${k}.jpg`);
}
// ── STORAGE + ABOUT: fetched privately (key), IMEI blurred here, only the blurred copy is published ──
const KEY = process.env.KP_PH_KEY, WURL = process.env.KP_URL, saOk = new Set();
async function wpost(body) { const r = await fetch(WURL, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(body), redirect: 'follow' }); const j = await r.json(); if (!j.ok) throw new Error(j.error || 'web app error'); return j; }
async function storageAbout() {
  if ((!KEY || !WURL) && !process.env.BLUR_TEST) { console.log('STORAGE/ABOUT: no key yet — skipped'); return; }
  const { blurIds, ocrStop } = await import('./blur.mjs');
  // self-test: a made-up About screen; if the IMEI on it is not found and blurred, publish nothing
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="900"><rect width="100%" height="100%" fill="#fff"/><g font-family="DejaVu Sans, Arial" font-size="44" fill="#111"><text x="60" y="120">About phone</text><text x="60" y="240">Model name</text><text x="60" y="300">Galaxy S23 Ultra</text><text x="60" y="420">Serial number</text><text x="60" y="480">R5CW21ABCDE</text><text x="60" y="600">IMEI</text><text x="60" y="660">351234567890123</text><text x="60" y="780">Android version 14</text></g></svg>`;
  const st = await blurIds(await sharp(Buffer.from(svg)).jpeg().toBuffer(), 'A');
  console.log('blur self-test: ' + (st.buf ? st.why : 'FAILED ' + st.why));
  if (st.buf) { await fs.writeFile('selftest-blur.jpg', st.buf); await fs.copyFile('selftest-blur.jpg', 'dist/assets/selftest-blur.jpg'); }   // made-up numbers only
  if (!st.buf || parseInt(st.why) < 3) { console.warn('IMEI blur self-test failed — STORAGE/ABOUT not published this run'); await ocrStop(); return; }
  if (!KEY || !WURL) { await ocrStop(); return; }
  const sa = (await wpost({ t: 'ph', k: KEY, list: 1 })).sa || {};
  const todo = []; for (const o of cat.items) if (o.front && sa[o.code]) sa[o.code].forEach((id, j) => todo.push([o, j ? 'A' : 'S', id]));
  const done = p => exists(p), need = [];
  for (const t of todo) { const id = t[2]; if (!(await done(`cache/${id}-pf.jpg`)) && !(await done(`cache/${id}-skip`))) need.push(t); }
  let made = 0, skipped = 0; const MAX = 80;
  for (let i = 0; i < Math.min(need.length, MAX); i += 4) {
    const part = need.slice(i, Math.min(i + 4, MAX)); let ph = {};
    try { ph = (await wpost({ t: 'ph', k: KEY, ids: part.map(t => t[2]) })).ph || {}; } catch (e) { console.warn('fetch ' + e.message); continue; }
    for (const [o, k, id] of part) {
      if (!ph[id]) continue;
      try { const r = await blurIds(Buffer.from(ph[id], 'base64'), k);
        if (!r.buf) { await fs.writeFile(`cache/${id}-skip`, r.why); skipped++; console.log(`${o.code}-${k}: not published · ${r.why}`); continue; }
        await sharp(r.buf).resize(1400, 1400, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 84, mozjpeg: true }).toFile(`cache/${id}-pf.jpg`);
        await sharp(r.buf).resize(600, 600, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 74, mozjpeg: true }).toFile(`cache/${id}-pt.jpg`);
        made++; console.log(`${o.code}-${k}: ${r.why}`);
      } catch (e) { console.warn(`${o.code}-${k}: ${e.message}`); }
    }
  }
  await ocrStop();
  for (const [o, k, id] of todo) if (await done(`cache/${id}-pf.jpg`)) { await fs.copyFile(`cache/${id}-pf.jpg`, `dist/img/f/${o.code}-${k}.jpg`); await fs.copyFile(`cache/${id}-pt.jpg`, `dist/img/t/${o.code}-${k}.jpg`); saOk.add(o.code + k); }
  console.log(`STORAGE/ABOUT: ${todo.length} total · new blurred ${made} · not published ${skipped} · waiting ${Math.max(0, need.length - MAX)}`);
}
const bad = new Set();
for (let i = 0; i < jobs.length; i += 6) await Promise.all(jobs.slice(i, i + 6).map(j => one(j).then(() => ok++, e => { fail++; bad.add(j[0].code); console.warn(e.message); })));
// an item whose photos failed shows "photos coming soon" instead of a broken image
for (const o of cat.items) if (bad.has(o.code)) { delete o.front; delete o.back; delete o.layout; }
try { await storageAbout(); } catch (e) { console.warn('STORAGE/ABOUT skipped: ' + e.message); }
for (const o of cat.items) { if (o.front) { o.front = 1; o.back = 1; if (saOk.has(o.code + 'S')) o.s = 1; if (saOk.has(o.code + 'A')) o.a = 1; } }   // file ids are not needed on the site
await fs.writeFile('dist/data/catalog.json', JSON.stringify(cat));
await fs.writeFile('dist/.nojekyll', '');
console.log(`items ${cat.items.length} · photos ok ${ok} · failed ${fail}`);

// Builds the public site into dist/: catalog.json from Google Drive + resized FRONT/BACK photos.
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
for (const f of ['index.html', 'app.js', 'kp-common.js', 'config.js']) await fs.copyFile(f, path.join('dist', f));
// cache-busting: browsers always get the scripts that match this page
const V = Date.now().toString(36); let html = await fs.readFile('dist/index.html', 'utf8');
for (const f of ['app.js', 'kp-common.js', 'config.js']) html = html.replace(`src="${f}"`, `src="${f}?v=${V}"`);
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
const bad = new Set();
for (let i = 0; i < jobs.length; i += 6) await Promise.all(jobs.slice(i, i + 6).map(j => one(j).then(() => ok++, e => { fail++; bad.add(j[0].code); console.warn(e.message); })));
// an item whose photos failed shows "photos coming soon" instead of a broken image
for (const o of cat.items) if (bad.has(o.code)) { delete o.front; delete o.back; delete o.layout; }
for (const o of cat.items) { if (o.front) { o.front = 1; o.back = 1; } }   // file ids are not needed on the site
await fs.writeFile('dist/data/catalog.json', JSON.stringify(cat));
await fs.writeFile('dist/.nojekyll', '');
console.log(`items ${cat.items.length} · photos ok ${ok} · failed ${fail}`);

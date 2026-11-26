// STORAGE / ABOUT screenshots: find the IMEI, serial number and other long numbers with OCR and blur them.
// Fail-safe: when the text cannot be read well, the photo is NOT published (returns null).
import sharp from 'sharp'; import { createWorker } from 'tesseract.js';
let W = null;
export async function ocrStart() { if (!W) W = await createWorker('eng'); return W; }
export async function ocrStop() { if (W) await W.terminate(); W = null; }
const LABEL = /^(IMEI|IMEI1|IMEI2|MEID|ICCID|EID|SERIAL|S\/N|SN)\b/i;
function words(d) { if (d.words && d.words.length) return d.words; const o = []; (d.blocks || []).forEach(b => (b.paragraphs || []).forEach(p => (p.lines || []).forEach(l => (l.words || []).forEach(w => o.push(w))))); return o; }
export async function blurIds(src, kind) {
  const base = sharp(src).rotate().resize(1600, 1600, { fit: 'inside', withoutEnlargement: true });
  const img = await base.jpeg({ quality: 92 }).toBuffer(), meta = await sharp(img).metadata(), Wd = meta.width, Ht = meta.height;
  const pre = await sharp(img).grayscale().normalize().toBuffer();
  const { data } = await (await ocrStart()).recognize(pre);
  const ws = words(data).filter(w => w.text && w.bbox), good = ws.filter(w => w.confidence >= 55);
  const boxes = [], pad = h => Math.round(h * 0.35);
  for (const w of ws) {
    const t = w.text.replace(/[^A-Za-z0-9/]/g, ''), dg = t.replace(/\D/g, ''), b = w.bbox, h = b.y1 - b.y0;
    const longNum = /\d{5,}/.test(t) || dg.length >= 8, serial = /^[A-Z0-9]{8,}$/i.test(t) && dg.length >= 2 && /[A-Z]/i.test(t);
    if (longNum || serial) boxes.push([b.x0 - pad(h), b.y0 - pad(h), b.x1 + pad(h), b.y1 + pad(h)]);
    if (LABEL.test(t)) boxes.push([b.x0 - pad(h), b.y0 - pad(h), Wd, b.y1 + Math.round(h * 2.6)]);   // the number beside or under the label
  }
  const hasLabel = ws.some(w => LABEL.test(w.text.replace(/[^A-Za-z0-9/]/g, '')));
  // can we trust the reading? ABOUT screens must be clearly readable, otherwise we do not publish
  const readable = good.length >= (kind === 'A' ? 12 : 4) && (data.confidence || 0) >= 45;
  if (!readable && !(kind === 'A' && hasLabel && boxes.length)) return { buf: null, why: `unreadable (${good.length} words, conf ${Math.round(data.confidence || 0)})` };
  const comp = [];
  for (const [x0, y0, x1, y1] of boxes) {
    const left = Math.max(0, Math.floor(x0)), top = Math.max(0, Math.floor(y0)), width = Math.min(Wd, Math.ceil(x1)) - left, height = Math.min(Ht, Math.ceil(y1)) - top;
    if (width < 4 || height < 4) continue;
    // heavy: shrink to a few pixels, stretch back, then blur — digits cannot be read back
    const piece = await sharp(img).extract({ left, top, width, height }).resize(Math.max(1, Math.round(width / 60)), 1, { fit: 'fill' }).resize(width, height, { fit: 'fill', kernel: 'cubic' }).blur(Math.max(8, Math.round(height / 3))).toBuffer();
    comp.push({ input: piece, left, top });
  }
  const out = comp.length ? await sharp(img).composite(comp).jpeg({ quality: 90 }).toBuffer() : img;
  return { buf: out, why: `${comp.length} area(s) blurred` };
}

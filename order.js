/* Kitang Aya · GET NOW ordering + visitor stats (Nov 26).
 * Flow: 1 the unit → 2 why second-hand here is safe → 3 courier + location → 4 down payment → 5 terms → 6 pay + details + screenshot → 7 done.
 * Orders and stats go to the KA PHOTO POSTING web app (doPost) → Shop Circle › WEB ORDERS (+ email to the shop). */
(function () {
  var C = window.KA_CONFIG || {}, O = C.ORDER || {}, URL_ = O.URL || '';
  function $e(t, c, h) { var d = document.createElement(t); if (c) d.className = c; if (h != null) d.innerHTML = h; return d; }
  function x(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function P(n) { return '₱' + Math.round(n).toLocaleString('en-US'); }

  /* ── visitor stats: small batches, sent in the background ── */
  var SID = (function () { try { var s = sessionStorage.getItem('ka_sid'); if (!s) { s = Date.now().toString(36) + Math.random().toString(36).slice(2, 7); sessionStorage.setItem('ka_sid', s); } return s; } catch (e) { return 'x'; } })();
  var Q = [], CUR = { code: '', k: 0 };
  function ev(e, code, extra) { if (!URL_) return; Q.push({ e: e, c: code || '', k: extra == null ? '' : extra, t: Date.now() }); if (Q.length >= 12) flush(); }
  function flush() { if (!Q.length || !URL_) return; var b = JSON.stringify({ t: 'ev', s: SID, r: document.referrer.slice(0, 120), ev: Q.splice(0) });
    try { if (!(navigator.sendBeacon && navigator.sendBeacon(URL_, new Blob([b], { type: 'text/plain' })))) fetch(URL_, { method: 'POST', mode: 'no-cors', body: b }); } catch (e) {} }
  setInterval(flush, 15000); document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') flush(); });
  try { if (!sessionStorage.getItem('ka_v')) { sessionStorage.setItem('ka_v', 1); ev('visit', '', (/[?&]fbclid=/.test(location.search) ? 'facebook' : '')); } } catch (e) {}

  /* ── down payment (fixed, by price) ── */
  function dpFor(n, cour, far) {
    if (cour === 'JNT') return n;                                     // J&T: full payment first (plus shipping fee)
    var d = n <= 5000 ? 500 : n <= 10000 ? 1000 : 1250 + 1000 * Math.floor(n / 10000);   // 10–19.9k 2,250 · 20–29.9k 3,250 · 30–39.9k 4,250 · 40–49.9k 5,250 …
    if (d === 500 && cour === 'LALA' && far) d = 1000;                // far Lalamove: the ₱500 would not cover the trip
    return d;
  }
  var COUR = {
    LALA: { i: '🛵', t: 'LALAMOVE', tag: 'Same-day · Metro Manila', pts: ['📍 Galing Batasan Hills, QC', '⚡ Same-day delivery', '💵 Balance sa rider (cash/GCash)'] },
    LBC: { i: '📦', t: 'LBC Cash on Pickup', tag: 'Province', pts: ['🏢 Sa LBC branch na malapit sa inyo', '🧾 May resibo at tracking', '💵 Balance sa branch'] },
    JNT: { i: '🚚', t: 'J&T Express', tag: 'Door to door', pts: ['💳 Full payment + shipping fee muna', '🏠 Hatid hanggang bahay', '🚫 Walang COD'] },
    PICK: { i: '🏪', t: 'Pickup sa store', tag: 'Batasan Hills, QC', pts: ['👀 Makita at ma-test muna', '💵 Balance sa shop', '📅 Mag-schedule ng visit'] }
  };
  var FIELDS = {
    LBC: [['name', 'FULL NAME (dapat pareho sa valid ID)'], ['mobile', 'CONTACT NUMBER'], ['branch', 'LBC BRANCH NA PINAKAMALAPIT SA INYO'], ['email', 'EMAIL ADDRESS']],
    LALA: [['name', 'FULL NAME'], ['mobile', 'CONTACT NUMBER'], ['address', 'ADDRESS NA SEARCHABLE SA LALAMOVE MAP'], ['email', 'EMAIL ADDRESS']],
    JNT: [['name', 'NAME'], ['mobile', 'CONTACT NUMBER'], ['house', 'HOUSE NUMBER'], ['street', 'STREET / PUROK'], ['brgy', 'BARANGAY'], ['city', 'CITY'], ['prov', 'PROVINCE'], ['landmark', 'LANDMARK (kilalang lugar malapit sa inyo)'], ['email', 'EMAIL ADDRESS']],
    PICK: [['name', 'NAME'], ['mobile', 'CONTACT NUMBER'], ['email', 'EMAIL'], ['address', 'ADDRESS'], ['visit', 'DATE OF VISIT']]
  };
  var NOTES = {
    LBC: ['🪪 Pangalan = pareho sa valid ID (chine-check sa branch)', '💸 Shipping fee: sagot ng customer', '👪 18 pababa? Pangalan ng guardian na may valid ID'],
    LALA: ['📍 Exact address sa map + Google Maps screenshot', '💸 Delivery fee: sagot ng customer', '⏰ Booking 2–9 PM · cut-off 10 PM'],
    JNT: ['💸 Bayad muna ang shipping fee bago i-ship', '🏠 Kumpletong address — kapag bumalik ang parcel, may extra SF', '⏰ Cut-off 10 PM · lampas = next batch (48 hrs)'],
    PICK: ['🪪 Dalhin ang valid ID', '📲 Sasabihan namin kayo kapag ready na ang unit']
  };
  function tiles(a) { return '<div class="otiles">' + a.map(function (t) { return '<div><i>' + t[0] + '</i><b>' + t[1] + '</b>' + (t[2] ? '<span>' + t[2] + '</span>' : '') + '</div>'; }).join('') + '</div>'; }
  function chips(a, c) { return '<ul class="ochips' + (c ? ' ' + c : '') + '">' + a.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul>'; }

  /* ── the GET NOW flow ── */
  var S = null;
  function start(o) {
    if (!o) return; ev('order_start', o.code);
    var n = num(o); S = { o: o, n: n, step: 1, cour: '', far: false, agree: false, f: {}, shot: null, map: null };
    var d = $e('div', 'pp ord'); d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', 'Order ' + o.code);
    d.innerHTML = '<div class="ppbar"><button class="back" data-x="close">← Back to phone</button><span class="sp"></span><img class="olg" src="assets/logo.png" alt="Kitang Aya Phoneshop"></div><div class="ppin" style="max-width:720px"><div class="ostep" id="ost"></div><div id="obody"></div></div>';
    document.body.appendChild(d); S.d = d; d.onclick = act; render();
  }
  function bar() { var L = ['Unit', 'Bakit sulit', 'Courier', 'Downpayment', 'Terms', 'Bayad & details']; return L.map(function (t, i) { return '<span class="' + (i + 1 < S.step ? 'ok' : i + 1 === S.step ? 'on' : '') + '">' + (i + 1) + '. ' + t + '</span>'; }).join(''); }
  function nav(nextLabel, can) { return '<div class="onav">' + (S.step > 1 ? '<button class="btn o" data-x="prev">← Balik</button>' : '<span></span>') + '<button class="btn p" data-x="next"' + (can === false ? ' disabled' : '') + '>' + nextLabel + ' →</button></div>'; }
  function head() { var o = S.o; return '<div class="oitem"><img id="oimg" alt=""><div><div class="oc">' + x(o.code) + '</div><b>' + x(model(o)) + '</b><div class="ps">' + x(specs(o)) + '</div><div class="op">' + (S.n ? P(S.n) : 'Price on request') + '</div></div></div>'; }
  function render() {
    var o = S.o, b = '', n = S.n, sv = save(o), rows = condRows(o), fx = rows.filter(function (r) { return r.k === 'f'; }).length;
    if (S.step === 1) b = '<h2>Ito na ang unit mo 💪</h2>' + head() +
      tiles([['💸', sv ? 'Tipid ' + P(sv.s) : 'Mas mura', sv ? sv.p + '% below market' : 'kaysa brand new'], ['⚡', 'Flagship', 'performance'], ['🔍', fx ? 'Honest condition' : 'Walang issue', fx ? 'nakalista lahat' : 'sa checker'], ['🔥', '1 unit lang', 'paunahan']]) + nav('Next');
    if (S.step === 2) b = '<h2>Second-hand, pero sigurado 🛡️</h2>' +
      tiles([['✅', 'Checked', 'checker + rechecker'], ['📸', 'Real photos', 'mismong unit'], ['🛡️', '7-day warranty', 'ayon sa terms'], ['📦', 'Item protection', 'kami ang liable sa courier damage']]) +
      '<img class="obanner" src="assets/banner.jpg" alt="Masayang customers ng Kitang Aya">' +
      (C.REVIEWS || C.FACEBOOK ? '<a class="btn o" style="width:100%;margin-top:8px" target="_blank" rel="noopener" href="' + x(C.REVIEWS || C.FACEBOOK) + '">⭐ Tingnan ang reviews</a>' : '') + nav('Next: courier');
    if (S.step === 3) b = '<h2>Paano mo matatanggap? 🚚</h2>' + chips(['🔒 Walang COD — para safe ang phone mo'], 'one') +
      '<div class="ocgrid">' + Object.keys(COUR).map(function (k) { var c = COUR[k]; return '<button class="ocour' + (S.cour === k ? ' on' : '') + '" data-cour="' + k + '"><i>' + c.i + '</i><b>' + c.t + '</b><small>' + c.tag + '</small></button>'; }).join('') + '</div>' +
      (S.cour ? chips(COUR[S.cour].pts) : '') +
      (S.cour === 'LALA' ? '<div class="obox"><h3>📍 Saan po kayo?</h3><div class="opts"><button data-far="0" class="' + (!S.far ? 'on' : '') + '">Metro Manila</button><button data-far="1" class="' + (S.far ? 'on' : '') + '">Labas ng Metro Manila<br><small>Rizal, Bulacan, Cavite, Laguna, Batangas…</small></button></div></div>' : '') + nav('Next: downpayment', !!S.cour);
    if (S.step === 4) { var dp = dpFor(n, S.cour, S.far), full = S.cour === 'JNT';
      b = '<h2>' + (full ? 'Full payment (J&T)' : 'Downpayment 🔐') + '</h2>' + head() +
        '<div class="odp"><small>' + (full ? 'Bayad ngayon + shipping fee' : 'DP ngayon') + '</small><b>' + P(dp) + '</b>' + (full ? '' : '<small>Balance <b>' + P(Math.max(0, n - dp)) + '</b> · ' + (S.cour === 'LBC' ? 'sa LBC branch' : S.cour === 'PICK' ? 'sa shop' : 'pagdating ng item') + '</small>') + '</div>' +
        chips(['🤝 Para sigurado ang unit sa\'yo', '🚫 Iwas bogus buyer', '🔥 Limited stocks']) +
        '<details class="otier"><summary>Bakit may downpayment?</summary><p>Required po talaga ang downpayment bossing, dahil isa po yun sa assurance ng shop para makaiwas sa mga bogus buyer 😊 Iniingatan po namin ang cellphone na aming binebenta — bukod sa mura na ang presyo, very limited lamang ang stocks, kaya iniiwasan naming mapunta sa buyer na hindi sure o responsable, at iniiwasan namin ang return o cancellation 😊</p></details>' +
        '<details class="otier"><summary>Paano kinukuwenta?</summary><table><tr><td>₱5,000 pababa</td><td>₱500</td></tr><tr><td>₱5,001 – ₱10,000</td><td>₱1,000</td></tr><tr><td>₱10,001 – ₱19,999</td><td>₱2,250</td></tr><tr><td>₱20,000 – ₱29,999</td><td>₱3,250</td></tr><tr><td>₱30,000 – ₱39,999</td><td>₱4,250</td></tr><tr><td>₱40,000 – ₱49,999</td><td>₱5,250</td></tr><tr><td colspan="2">+₱1,000 kada ₱10,000 pataas · Lalamove labas ng Metro Manila: min ₱1,000</td></tr></table></details>' + nav('Next: terms'); }
    if (S.step === 5) b = '<h2>Terms & warranty 📄</h2>' +
      tiles([['🛡️', '7-day warranty', 'ayon sa terms'], ['📋', 'Condition', 'alam at tanggap na'], ['💳', 'DP', 'pang-reserve ng unit'], ['📦', 'Courier damage', 'sagot namin']]) +
      '<button class="btn o" data-x="tnc" style="width:100%">📖 Basahin ang buong Terms</button>' +
      '<label class="ochk"><input type="checkbox" id="agree"' + (S.agree ? ' checked' : '') + '> Nabasa ko at <b>sang-ayon ako</b> sa Terms & Conditions.</label>' + nav('Next: magbayad', S.agree);
    if (S.step === 6) b = pay();
    if (S.step === 7) b = done();
    S.d.querySelector('#ost').innerHTML = S.step < 7 ? bar() : ''; S.d.querySelector('#obody').innerHTML = b; S.d.querySelector('.ppin').scrollTop = 0; S.d.scrollTop = 0;
    var im = S.d.querySelector('#oimg') || S.d.querySelector('#oimg2'); if (im) Promise.resolve(o.front ? 'img/t/' + o.code + '-F.jpg' : soon(o)).then(function (u) { im.src = u; });
    var ag = S.d.querySelector('#agree'); if (ag) ag.onchange = function () { S.agree = ag.checked; S.d.querySelector('[data-x=next]').disabled = !ag.checked; };
    if (S.step === 6) wirePay();
  }
  function accts() { return (O.PAY || []).filter(function (a) { return a.label && a.number; }); }
  function acctPanel(i) {
    var a = accts()[i]; if (!a) return '';
    return (a.qr ? '<img class="oqr" src="' + x(a.qr) + '" alt="QR code ' + x(a.label) + '">' : '<div class="onoqr">' + (a.kind === 'bank' ? '🏦' : '📲') + '</div>') +
      '<div class="oacc"><small>' + x(a.label) + '</small><b>' + x(a.name) + '</b><button class="cp" data-cp="' + i + '">' + x(a.number) + ' <span>📋 Copy</span></button></div>' +
      (a.kind === 'maya' ? '<details class="otier"><summary>📲 Galing GCash? Paano mag-send sa Maya</summary><ol><li>Buksan ang GCash</li><li>Pindutin ang <b>Transfer</b></li><li>Piliin ang <b>Transfer to Maya Wallet</b></li><li>Ilagay ang number at pangalan sa taas</li></ol></details>' : '');
  }
  function pay() {
    var c = S.cour, dp = dpFor(S.n, c, S.far), A = accts(); S.acct = S.acct || 0;
    return '<h2>Magbayad 🧾</h2>' +
      '<div class="odp sm"><small>' + (c === 'JNT' ? 'Full payment + shipping fee' : 'Downpayment') + ' · ' + x(S.o.code) + '</small><b>' + P(dp) + '</b></div>' +
      '<div class="obox"><h3>1 · Pumili ng account</h3>' + (A.length ? '<div class="otabs">' + A.map(function (a, i) { return '<button data-acct="' + i + '" class="' + (a.kind || '') + (i === S.acct ? ' on' : '') + '">' + x(a.label) + '</button>'; }).join('') + '</div><div id="opanel" class="opanel">' + acctPanel(S.acct) + '</div>' : '<p class="ps">I-message po kami para sa account details 💬</p>') + '</div>' +
      chips(['📸 Screenshot = required', '⏱️ First to send DP · oras sa resibo', '↩️ Naunahan? Refund o ibang unit'], 'warn') +
      '<div class="obox"><h3>2 · Upload ang screenshot</h3><label class="oup" id="upl"><input type="file" accept="image/*" id="shot"><span>📷 Tap para pumili</span></label></div>' +
      '<div class="obox"><h3>3 · ' + (c === 'PICK' ? 'Schedule ng pickup' : 'Saan ipapadala') + '</h3><form class="form" id="of" novalidate>' + FIELDS[c].map(function (f) { return '<label for="o_' + f[0] + '">' + x(f[1]) + '</label><input id="o_' + f[0] + '" ' + (f[0] === 'email' ? 'type="email" inputmode="email"' : f[0] === 'mobile' ? 'type="tel" inputmode="tel" placeholder="09XX XXX XXXX"' : f[0] === 'visit' ? 'type="date"' : '') + ' value="' + x(S.f[f[0]] || '') + '">'; }).join('') +
      (c === 'LALA' ? '<label>GOOGLE MAPS SCREENSHOT</label><label class="oup" id="upm"><input type="file" accept="image/*" id="map"><span>🗺️ Tap para pumili</span></label>' : '') +
      chips(NOTES[c]) + '<div class="err" hidden></div><button class="btn p big" type="submit" id="osend">✅ Send order</button></form></div>' + trust();
  }
  function trust() {
    var v = (O.VLOGS || []).filter(Boolean).slice(0, 2);
    return '<details class="otier obox"><summary>💚 Reviews at vlogs ng Kitang Aya</summary>' +
      (C.FACEBOOK ? '<iframe class="ofb" title="Kitang Aya Facebook page" loading="lazy" src="https://www.facebook.com/plugins/page.php?href=' + encodeURIComponent(O.PAGE || C.FACEBOOK) + '&tabs=timeline&width=500&height=420&small_header=true&hide_cover=false&show_facepile=true"></iframe>' : '') +
      v.map(function (u) { return '<iframe class="ofv" title="Kitang Aya vlog" loading="lazy" allowfullscreen src="https://www.facebook.com/plugins/video.php?href=' + encodeURIComponent(u) + '&show_text=false&width=500"></iframe>'; }).join('') +
      (C.REVIEWS ? '<a class="btn l" style="width:100%;margin-top:8px" target="_blank" rel="noopener" href="' + x(C.REVIEWS) + '">⭐ Basahin ang reviews</a>' : '') + '</details>';
  }
  function shrink(file, cb) { var r = new FileReader(); r.onload = function () { var im = new Image(); im.onload = function () { var m = 1600, w = im.width, h = im.height, s = Math.min(1, m / Math.max(w, h)), cv = document.createElement('canvas'); cv.width = Math.round(w * s); cv.height = Math.round(h * s); cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height); cb(cv.toDataURL('image/jpeg', .82)); }; im.onerror = function () { cb(null); }; im.src = r.result; }; r.readAsDataURL(file); }
  function wirePay() {
    var d = S.d;
    [['shot', 'upl', 'shot'], ['map', 'upm', 'map']].forEach(function (z) { var i = d.querySelector('#' + z[0]); if (!i) return; i.onchange = function () { var lb = d.querySelector('#' + z[1]); lb.querySelector('span').textContent = '⏳ Inaayos ang photo…'; shrink(i.files[0], function (u) { S[z[2]] = u; lb.classList.toggle('ok', !!u); lb.querySelector('span').innerHTML = u ? '✅ Ready · tap to change' : '⚠ Hindi mabasa ang photo — subukan ulit'; if (u) lb.style.backgroundImage = 'url(' + u + ')'; }); }; });
    if (!d._payWired) d._payWired = 1, d.addEventListener('click', function (e) {
      var cp = e.target.closest('[data-cp]'); if (cp) { e.preventDefault(); var a = accts()[cp.dataset.cp]; copyTxt(String(a.number).replace(/\s/g, '')); toast('Copied: ' + a.number); return; }
      var t = e.target.closest('[data-acct]'); if (t && S) { S.acct = +t.dataset.acct; [].forEach.call(d.querySelectorAll('[data-acct]'), function (b) { b.classList.toggle('on', b === t); }); d.querySelector('#opanel').innerHTML = acctPanel(S.acct); }
    });
    var f = d.querySelector('#of'); f.oninput = function (e) { if (e.target.id) S.f[e.target.id.slice(2)] = e.target.value; };
    f.onsubmit = function (e) { e.preventDefault(); send(); };
  }
  function send() {
    var d = S.d, er = d.querySelector('.err'), c = S.cour, miss = FIELDS[c].filter(function (f) { return !String(S.f[f[0]] || '').trim(); });
    function bad(t) { er.hidden = false; er.textContent = t; er.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    if (!S.shot) return bad('Paki-upload po ang screenshot ng bayad.');
    if (miss.length) return bad('Kulang pa po: ' + miss.map(function (f) { return f[1]; }).join(', '));
    if (!/^(\+?63|0)9\d{9}$/.test(String(S.f.mobile).replace(/[^\d+]/g, ''))) return bad('Paki-check po ang contact number (hal. 0917 123 4567).');
    if (c === 'LALA' && !S.map) return bad('Paki-upload po ang screenshot ng location sa Google Maps.');
    er.hidden = true; var bt = d.querySelector('#osend'); bt.disabled = true; bt.innerHTML = '<span class="spin"></span> Sending… huwag isara';
    var o = S.o, body = { t: 'order', s: SID, code: o.code, item: model(o) + (o.storage ? ' ' + o.storage : ''), price: S.n, dp: dpFor(S.n, c, S.far), courier: COUR[c].t + ' · ' + COUR[c].tag, far: S.far, f: S.f, shot: S.shot, map: S.map, page: location.href };
    if (!URL_) { bt.disabled = false; bt.textContent = '✅ Send order'; return bad('Hindi pa naka-set ang order system. Paki-message po kami sa Messenger.'); }
    fetch(URL_, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body) }).then(function (r) { return r.json(); }).then(function (j) {
      if (!j || !j.ok) throw new Error((j && j.error) || 'not saved'); S.id = j.id; ev('order_sent', o.code); flush(); S.step = 7; render();
    }).catch(function (e) { bt.disabled = false; bt.textContent = '✅ Send order'; bad('Hindi na-send (' + e.message + '). Subukan ulit, o i-message po kami kasama ang screenshot.'); });
  }
  function done() {
    var o = S.o, c = S.cour, p = phone();
    return '<div class="odone"><div class="big">✅</div><h2>DP RECEIVED — salamat, ka-kitang!</h2><p>Order no. <b>' + x(S.id || '') + '</b></p>' +
      '<p>Ichecheck ng staff ang bayad. <b>Para mas mabilis, i-message o tawagan kami:</b></p>' +
      '<div class="cta">' + (C.MESSENGER ? '<a class="btn l" target="_blank" rel="noopener" href="' + x(mUrl(o)) + '">💬 Message us on Messenger</a>' : '') + (p ? '<a class="btn o" href="tel:' + p + '">📞 Call ' + x(C.PHONE_SHOW || '') + '</a>' : '') + '</div>' +
      '<div class="obox" style="text-align:left"><h3>YOURS</h3>' + head().replace('id="oimg"', 'id="oimg2"') + '<p class="ps" style="margin:6px 0 0">Courier: <b>' + x(COUR[c].t) + '</b></p></div><button class="btn o" data-x="close" style="width:100%">Back to the shop</button></div>';
  }
  function act(e) {
    var a = e.target.closest('[data-x],[data-cour],[data-far]'); if (!a) return; var k = a.dataset.x;
    if (a.dataset.cour) { S.cour = a.dataset.cour; if (S.cour !== 'LALA') S.far = false; render(); var n = S.d.querySelector('[data-x=next]'); if (n) n.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    if (a.dataset.far) { S.far = a.dataset.far === '1'; render(); return; }
    if (k === 'close') { S.d.remove(); S = null; return; }
    if (k === 'prev') { S.step--; render(); }
    if (k === 'next') { if (a.disabled) return; S.step++; if (S.step === 4) ev('order_courier', S.o.code, S.cour); render(); }
    if (k === 'tnc') { var t = $e('div', 'pp otnc', '<div class="ppbar"><button class="back">← Balik sa order</button></div><iframe title="Terms and Conditions" src="' + x(O.TNC_PREVIEW || '') + '"></iframe>'); t.querySelector('.back').onclick = function () { t.remove(); }; document.body.appendChild(t); }
  }

  /* ── hook into the phone page: GET NOW button + stats ── */
  /* app.js calls this right after a phone page opens (d = the page element) */
  window.KA_AFTER_OPEN = function (o, PP) {
    if (!o || !PP) return; CUR = { code: o.code, k: 0 }; ev('open', o.code);
    var cta = PP.querySelector('.cta'); if (cta && num(o)) { var g = $e('button', 'btn get', '🛒 GET NOW · ' + x(o.code) + '<small>Secure it with a downpayment</small>'); g.onclick = function () { start(o); }; cta.insertBefore(g, cta.firstChild); }
    var dk = PP.querySelector('.dock [data-a=reserve]'); if (dk && num(o)) { dk.textContent = '🛒 GET NOW'; dk.dataset.a = ''; dk.onclick = function () { start(o); }; }
    var gm = PP.querySelector('#gm'); if (gm) { var seen = {}; gm.addEventListener('scroll', function () { var k = Math.round(gm.scrollLeft / gm.clientWidth); CUR.k = k; if (!seen[k]) { seen[k] = 1; ev('photo', o.code, k); } }); }
  };
  document.addEventListener('click', function (e) { var a = e.target.closest('a[href]'); if (!a) return; var h = a.getAttribute('href') || '';
    if (/m\.me|messenger|facebook\.com\/messages/.test(h)) ev('msg', CUR.code, CUR.k); else if (/^tel:/.test(h)) ev('call', CUR.code, CUR.k); }, true);
  var A = window.KA_APP || {}, num = A.num, model = A.model, phone = A.phone, condRows = A.condRows, copyTxt = A.copyTxt, mUrl = A.mUrl, toast = A.toast, specs = A.specs, save = A.save, soon = A.soon;
  window.KA_ORDER = { start: start, dpFor: dpFor };
})();

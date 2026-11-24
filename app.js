/* Kitang Aya public catalog · data/catalog.json is rebuilt every hour (UPDATED INVENTORY · AVAILABLE only) */
(function(){
var C=window.KA_CONFIG||{},ALL=[],QSEL='',SHOWN=24,$=function(i){return document.getElementById(i)},esc=kpEsc;
/* quick picks: what shoppers think in, not how the sheet is organised */
var QUICK=[
 {k:'low',i:'💸',t:'Lowest prices',s:'Cheapest first',f:function(){return true},sort:'lo'},
 {k:'u5',i:'🪙',t:'Under ₱5,000',s:'Budget picks',f:function(o){return num(o)&&num(o)<5000},sort:'lo'},
 {k:'5to10',i:'💵',t:'₱5,000 – 10,000',f:function(o){return num(o)>=5000&&num(o)<=10000},sort:'lo'},
 {k:'10to20',i:'💳',t:'₱10,000 – 20,000',f:function(o){return num(o)>10000&&num(o)<=20000},sort:'lo'},
 {k:'20up',i:'💎',t:'₱20,000 and up',s:'Flagships',f:function(o){return num(o)>20000},sort:'lo'},
 {k:'samsung',i:'📱',t:'Samsung',f:function(o){return /samsung/i.test(o.brand+' '+o.unit)&&!tag(o,'TABLET')}},
 {k:'iphone',i:'🍎',t:'iPhone',f:function(o){return tag(o,'IPHONE')||/iphone|apple/i.test(o.brand+' '+o.unit)}},
 {k:'tablet',i:'📲',t:'Tablets',f:function(o){return tag(o,'TABLET')}},
 {k:'gaming',i:'🎮',t:'Best for gaming',f:function(o){return tag(o,'GAMING')}},
 {k:'camera',i:'📷',t:'Best for camera',f:function(o){return tag(o,'CAMERA')}},
 {k:'noissue',i:'✅',t:'No issue units',s:'Clean condition',f:function(o){return noIssue(o)}},
 {k:'mamaw',i:'🔧',t:'Mamaw sa specs',s:'With minor issues, lower price',f:function(o){return !noIssue(o)}}];
function num(o){return kpNumTxt(o.saleTxt)||kpNumTxt(o.priceTxt)||0}
function tag(o,t){return (o.tags||[]).indexOf(t)>=0}
function noIssue(o){return /^\s*no issue/i.test(o.diag||'')}
function img(src){return kpLoadImg(src)}
function phoneDigits(){return String(C.PHONE||'').replace(/[^\d+]/g,'')}
function msg(o){return 'Hi Kitang Aya! Interested po ako sa '+o.code+' ('+kpTitle(o)+', '+kpPrice(o)+'). Available pa po?'}
function msgUrl(o){return C.MESSENGER?C.MESSENGER+(C.MESSENGER.indexOf('?')<0?'?':'&')+'text='+encodeURIComponent(msg(o)):''}
function priceHtml(o){var s=kpNumTxt(o.saleTxt),r=kpNumTxt(o.priceTxt),n=s||r;if(!n)return 'Price on request';
  return '₱'+Math.round(n).toLocaleString('en-US')+(s&&r>s?'<s>₱'+Math.round(r).toLocaleString('en-US')+'</s>':'')}
function model(o){var b=String(o.brand||'').trim(),u=String(o.unit||'').trim();if(b&&u.toUpperCase().indexOf(b.toUpperCase())===0)b='';return (b?b+' ':'')+u}
function chips(o){var c=[];if(noIssue(o))c.push('<span class="ch">✅ No issue</span>');else c.push('<span class="ch w">See condition</span>');
  if(tag(o,'GAMING'))c.push('<span class="ch">🎮 Gaming</span>');if(tag(o,'CAMERA'))c.push('<span class="ch">📷 Camera</span>');return c.join('')}
/* ── item view ── */
function info(o){var cond=kpShortCond(o.diag,o.status),m=msgUrl(o),p=phoneDigits(),a=[];
  if(m)a.push('<a class="m" target="_blank" rel="noopener" href="'+esc(m)+'">💬 Message us about '+esc(o.code)+'</a>');
  if(p)a.push('<div class="row2"><a class="o" href="tel:'+p+'">📞 Call</a><a class="o" href="sms:'+p+'?body='+encodeURIComponent(msg(o))+'">✉ Text</a></div>');
  if(!m&&!p&&C.FACEBOOK)a.push('<a class="m" target="_blank" rel="noopener" href="'+esc(C.FACEBOOK)+'">💬 Message our Facebook page</a>');
  return '<div class="md2">'+esc(model(o))+'</div><div class="big">'+priceHtml(o).replace('<s>',' <s style="font-size:.9rem;color:#A9B3AD">')+'</div>'+
   '<div style="color:#C9D3CD">'+esc([o.storage,o.color].filter(Boolean).join(' · '))+' · Code <b>'+esc(o.code)+'</b></div>'+
   (a.length?'<div class="act">'+a.join('')+'</div>':'<div class="tip" style="margin:12px 0">To reserve, message our Facebook page and send the code <b>'+esc(o.code)+'</b>.</div>')+
   '<h4>Condition (honest check)</h4><ul>'+cond.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ul>'+
   '<div class="tip">Isang unit lang ito. Paunahan! Send the code <b>'+esc(o.code)+'</b> so we know which phone you mean.</div>'+
   '<div class="hint">Tip: pinch or double-tap the photo to zoom. Swipe or use ‹ › for more photos.</div>'}
function open(o){var sl;
  if(o.front){var big=Promise.all([img('img/f/'+o.code+'-F.jpg'),img('img/f/'+o.code+'-B.jpg'),kpFontsReady()]);
    sl=[{label:'CARD',src:big.then(function(im){return kpDrawCard(document.createElement('canvas'),im[0],im[1],o,o.layout,1200).toDataURL('image/jpeg',.9)})},{label:'FRONT',src:'img/f/'+o.code+'-F.jpg'},{label:'BACK',src:'img/f/'+o.code+'-B.jpg'}]}
  else{var cv=document.createElement('canvas');cv.width=cv.height=900;var c=cv.getContext('2d');c.fillStyle='#1C4A3B';c.fillRect(0,0,900,900);c.fillStyle='#E9F5D0';c.textAlign='center';c.font='400 70px "Courier Prime", monospace';c.fillText(o.code,450,410);c.font='600 36px Onest, sans-serif';c.fillText('Photos coming soon',450,480);c.font='500 30px Onest, sans-serif';c.fillText('Message us and we will send actual photos',450,530);sl=[{label:'PHOTOS SOON',src:cv.toDataURL('image/jpeg',.9)}]}
  var v=kpView(sl,0,'← Back to all phones',info(o));var b=document.querySelector('.kpv-top [data-k="x"]');if(b)b.textContent='✕ Close';
  var t=document.querySelector('.kpv-top b');if(t){t.style.cursor='pointer';t.onclick=function(){v.close()}}
  try{history.replaceState(null,'','#'+o.code)}catch(e){}}
/* ── list ── */
var IO=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;IO.unobserve(e.target);var cv=e.target,o=ALL[cv.dataset.i];
  Promise.all([img('img/t/'+o.code+'-F.jpg'),img('img/t/'+o.code+'-B.jpg'),kpFontsReady()]).then(function(im){kpDrawCard(cv,im[0],im[1],o,o.layout,600)}).catch(function(){})})},{rootMargin:'500px'});
function list(){var q=$('q').value.trim().toLowerCase().split(/\s+/).filter(Boolean),Q=QUICK.find(function(x){return x.k===QSEL}),so=$('so').value;
  var l=ALL.filter(function(o){var hay=(o.code+' '+o.brand+' '+o.unit+' '+o.storage+' '+o.color).toLowerCase().replace(/\s+/g,' '),hay2=hay.replace(/\s/g,'');
    return q.every(function(w){return hay.indexOf(w)>=0||hay2.indexOf(w)>=0})&&(!Q||Q.f(o))});
  if(so==='lo')l.sort(function(a,b){return (num(a)||1e9)-(num(b)||1e9)});else if(so==='hi')l.sort(function(a,b){return num(b)-num(a)});
  else if(so==='photo')l.sort(function(a,b){return (b.front?1:0)-(a.front?1:0)||kpNumTxt(b.code)-kpNumTxt(a.code)});
  else l.sort(function(a,b){return kpNumTxt(b.code)-kpNumTxt(a.code)});
  return l}
function draw(keep){var l=list(),Q=QUICK.find(function(x){return x.k===QSEL}),q=$('q').value.trim();if(!keep)SHOWN=24;
  $('cnt').textContent=l.length+' phone'+(l.length===1?'':'s');$('fl').textContent=[Q?Q.t:'',q?'“'+q+'”':''].filter(Boolean).join(' · ')||'available now';
  $('clr').hidden=!(Q||q);$('none').hidden=!!l.length;$('more').hidden=l.length<=SHOWN;
  $('grid').innerHTML=l.slice(0,SHOWN).map(function(o){var i=ALL.indexOf(o);return '<button class="it" data-i="'+i+'" aria-label="'+esc(model(o)+', '+(kpNumTxt(o.saleTxt)||kpNumTxt(o.priceTxt)||'price on request')+' pesos, code '+o.code)+'">'+
    (o.front?'<canvas data-i="'+i+'" width="600" height="600" aria-hidden="true"></canvas>':'<div class="ph" aria-hidden="true"><b>'+esc(o.code)+'</b><span>Photos coming soon</span></div>')+
    '<div class="tx"><div class="pr">'+priceHtml(o)+'</div><div class="md">'+esc(model(o))+'</div><div class="sp2">'+esc([o.storage,o.color].filter(Boolean).join(' · '))+'</div><div class="chips">'+chips(o)+'</div><div class="see"><span>See photos & details</span></div></div></button>'}).join('');
  [].forEach.call($('grid').querySelectorAll('canvas'),function(c){IO.observe(c)});
  [].forEach.call($('grid').querySelectorAll('.it'),function(d){d.onclick=function(){open(ALL[d.dataset.i])}})}
function quick(){$('quick').innerHTML=QUICK.map(function(x){var n=ALL.filter(x.f).length;return n?'<button class="q'+(QSEL===x.k?' on':'')+'" data-k="'+x.k+'" aria-pressed="'+(QSEL===x.k)+'"><span class="i" aria-hidden="true">'+x.i+'</span><span>'+esc(x.t)+'<small>'+(x.s?esc(x.s)+' · ':'')+n+' phones</small></span></button>':''}).join('');
  [].forEach.call($('quick').children,function(b){b.onclick=function(){QSEL=QSEL===b.dataset.k?'':b.dataset.k;var Q=QUICK.find(function(x){return x.k===QSEL});$('so').value=Q&&Q.sort?Q.sort:'photo';quick();draw();$('cnt').scrollIntoView({behavior:'smooth',block:'start'})}})}
function clear(){QSEL='';$('q').value='';$('so').value='photo';quick();draw()}
$('clr').onclick=clear;$('clr2').onclick=clear;$('more').onclick=function(){SHOWN+=24;draw(true)};
var tm;$('q').oninput=function(){clearTimeout(tm);tm=setTimeout(function(){draw()},200)};$('so').onchange=function(){draw()};
/* bigger text (remembered) */
function setBig(on){document.documentElement.classList.toggle('big',on);$('bigt').setAttribute('aria-pressed',on);$('bigt').textContent=on?'A− Normal text':'A+ Bigger text';try{localStorage.setItem('ka_big',on?'1':'')}catch(e){}}
$('bigt').onclick=function(){setBig(!document.documentElement.classList.contains('big'))};try{if(localStorage.getItem('ka_big'))setBig(true)}catch(e){}
/* contacts */
if(C.MESSENGER){$('fab').href=C.MESSENGER;$('fab').hidden=false}
var lk=[];if(C.MESSENGER)lk.push('<a href="'+esc(C.MESSENGER)+'" target="_blank" rel="noopener">💬 Messenger</a>');if(C.FACEBOOK)lk.push('<a href="'+esc(C.FACEBOOK)+'" target="_blank" rel="noopener">👍 Follow our page</a>');
if(C.HUB_GROUP)lk.push('<a href="'+esc(C.HUB_GROUP)+'" target="_blank" rel="noopener">👥 Join the Inventory Hub</a>');if(phoneDigits())lk.push('<a href="tel:'+phoneDigits()+'">📞 '+esc(C.PHONE)+'</a>');
$('ft').innerHTML='<b style="font-size:1.1rem;color:#B9F227">'+esc(C.SHOP_NAME||'')+'</b><div>'+esc(C.ADDRESS||'')+'</div>'+(lk.length?'<div class="lk">'+lk.join('')+'</div>':'')+
 '<div style="opacity:.8;margin-top:8px">Every unit is checked and its condition is written honestly. Prices and availability update every hour.</div>';
fetch('data/catalog.json',{cache:'no-cache'}).then(function(r){return r.json()}).then(function(d){ALL=d.items||[];
  var up=d.updated?new Date(d.updated):null;$('sub').innerHTML='<b>'+ALL.length+' phones</b> available now · real photos · honest condition'+(up?' · updated '+up.toLocaleTimeString('en-PH',{hour:'numeric',minute:'2-digit'}):'');
  quick();draw();var h=location.hash.slice(1).toUpperCase();if(h){var o=ALL.find(function(x){return x.code===h});if(o)open(o)}})
 .catch(function(){$('sub').textContent='Could not load the phones. Please refresh the page.'});
})();

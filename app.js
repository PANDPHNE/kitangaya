/* Kitang Aya public catalog · data/catalog.json is rebuilt every hour (UPDATED INVENTORY · AVAILABLE only) */
(function(){
var C=window.KA_CONFIG||{},F=C.FORM||{},ALL=[],QSEL='',SAVEDONLY=false,SHOWN=24,PAGE=24,$=function(i){return document.getElementById(i)},esc=kpEsc;
/* ── helpers ── */
function num(o){return kpNumTxt(o.saleTxt)||kpNumTxt(o.priceTxt)||0}
function peso(n){return '₱'+Math.round(n).toLocaleString('en-US')}
function tag(o,t){return (o.tags||[]).indexOf(t)>=0}
function noIssue(o){return /^\s*no issue/i.test(o.diag||'')}
function model(o){var b=String(o.brand||'').trim(),u=String(o.unit||'').trim();if(b&&u.toUpperCase().indexOf(b.toUpperCase())===0)b='';return ((b?b+' ':'')+u).replace(/\s+/g,' ')}
function specs(o){return [o.storage,o.color].filter(Boolean).join(' · ')}
function priceHtml(o){var s=kpNumTxt(o.saleTxt),r=kpNumTxt(o.priceTxt),n=s||r;return n?peso(n)+(s&&r>s?'<s>'+peso(r)+'</s>':''):'Price on request'}
function phone(){return String(C.PHONE||'').replace(/[^\d+]/g,'')}
function mText(o,kind){var base='Hi Kitang Aya! ';if(!o)return base+'May tanong po ako.';
  return base+(kind==='video'?'Pa-flex po ng actual video ng ':'Interested po ako sa ')+o.code+' ('+model(o)+(o.storage?' '+o.storage:'')+', '+(num(o)?peso(num(o)):'price?')+'). Available pa po?'}
function mUrl(o,kind){return C.MESSENGER?C.MESSENGER+(C.MESSENGER.indexOf('?')<0?'?':'&')+'text='+encodeURIComponent(mText(o,kind)):''}
function img(src){return kpLoadImg(src)}
function toast(t){var d=document.createElement('div');d.className='toast';d.textContent=t;document.body.appendChild(d);setTimeout(function(){d.remove()},2200)}
var store={get:function(k,d){try{var v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set:function(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
var SAVED=store.get('ka_saved',[]);
function isSaved(c){return SAVED.indexOf(c)>=0}
function toggleSave(c){var i=SAVED.indexOf(c);if(i>=0)SAVED.splice(i,1);else SAVED.unshift(c);store.set('ka_saved',SAVED);$('savedN').textContent=SAVED.length;toast(i>=0?'Removed from saved':'♥ Saved — find it under Saved');return i<0}
/* ── condition, explained honestly in our voice ── */
var COSM=/scratch|dent|faded|fade|discolou?r(ed)? (on )?(back|frame|side)|paint|peel|chip(ped)? (on )?(back|frame|side)|loose back ?(case|cover)|crack(s)? (sa|on) (the )?(back ?case|back cover|backglass|back glass|side ?frame|frame|back cam frame|inner frame)|dent/i;
var TAGS=/^(any sim|ntc approved|unit only|with (box|case|charger|earphones?)|complete inclusions?|no issue|.*·.*)$/i;
function condRows(o){return kpShortCond(o.diag,o.status).map(function(x){var k=TAGS.test(x)?'t':COSM.test(x)?'c':'f';return {t:x,k:k}})}
function condBox(o){var rows=condRows(o),f=rows.filter(function(r){return r.k==='f'}).length,c=rows.filter(function(r){return r.k==='c'}).length,calm;
  if(noIssue(o)&&!f&&!c)calm='<div class="calm ok">✨ <b>No issue.</b> Malinis at fully working — ready na gamitin.</div>';
  else if(!f)calm='<div class="calm ok">💪 <b>Pang-itsura lang lahat ng nakalista</b> — walang epekto sa performance. Kaya mas mura, pero same lakas!</div>';
  else calm='<div class="calm info">🔍 <b>Sinabi namin lahat para walang surprise.</b> Kaya ganito kababa ang presyo — mamaw pa rin sa specs! Gusto mo makita in action? I-message mo kami, <b>ifle-flex namin sa video</b> 💪</div>';
  return '<div class="box"><h3>Honest condition check, KA-KITANG 👇</h3><ul class="cl">'+rows.map(function(r){return '<li><span class="k '+r.k+'">'+(r.k==='c'?'ITSURA LANG':r.k==='f'?'ALAMIN':'✓ OK')+'</span><span>'+esc(r.t)+'</span></li>'}).join('')+'</ul>'+calm+'</div>'}
/* ── quick picks (how shoppers think) ── */
var QUICK=[
 {k:'low',i:'💸',t:'Lowest prices',s:'Cheapest first',f:function(){return true},sort:'lo'},
 {k:'u5',i:'🪙',t:'Under ₱5,000',f:function(o){return num(o)&&num(o)<5000},sort:'lo'},
 {k:'5to10',i:'💵',t:'₱5k – 10k',f:function(o){return num(o)>=5000&&num(o)<=10000},sort:'lo'},
 {k:'10to20',i:'💳',t:'₱10k – 20k',f:function(o){return num(o)>10000&&num(o)<=20000},sort:'lo'},
 {k:'20up',i:'💎',t:'₱20k and up',s:'Flagships',f:function(o){return num(o)>20000},sort:'lo'},
 {k:'samsung',i:'📱',t:'Samsung',f:function(o){return /samsung/i.test(o.brand+' '+o.unit)&&!tag(o,'TABLET')}},
 {k:'iphone',i:'🍎',t:'iPhone',f:function(o){return tag(o,'IPHONE')||/iphone|apple/i.test(o.brand+' '+o.unit)}},
 {k:'tablet',i:'📲',t:'Tablets',f:function(o){return tag(o,'TABLET')}},
 {k:'gaming',i:'🎮',t:'Best for gaming',f:function(o){return tag(o,'GAMING')}},
 {k:'camera',i:'📷',t:'Best for camera',f:function(o){return tag(o,'CAMERA')}},
 {k:'noissue',i:'✨',t:'No issue units',s:'Clean condition',f:function(o){return noIssue(o)}},
 {k:'mamaw',i:'🔧',t:'Mamaw sa specs',s:'Lower price',f:function(o){return !noIssue(o)}}];
function Qsel(){return QUICK.find(function(x){return x.k===QSEL})}
/* ── list page ── */
var IO=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;IO.unobserve(e.target);var cv=e.target,o=ALL[cv.dataset.i];
  Promise.all([img('img/t/'+o.code+'-F.jpg'),img('img/t/'+o.code+'-B.jpg'),kpFontsReady()]).then(function(im){kpDrawCard(cv,im[0],im[1],o,o.layout,600)}).catch(function(){})})},{rootMargin:'600px'});
function list(){var q=$('q').value.trim().toLowerCase().split(/\s+/).filter(Boolean),Q=Qsel(),so=$('so').value;
  var l=ALL.filter(function(o){if(SAVEDONLY&&!isSaved(o.code))return false;var hay=(o.code+' '+o.brand+' '+o.unit+' '+o.storage+' '+o.color).toLowerCase(),h2=hay.replace(/\s/g,'');
    return q.every(function(w){return hay.indexOf(w)>=0||h2.indexOf(w)>=0})&&(!Q||Q.f(o))});
  var by={lo:function(a,b){return (num(a)||1e9)-(num(b)||1e9)},hi:function(a,b){return num(b)-num(a)},new:function(a,b){return kpNumTxt(b.code)-kpNumTxt(a.code)},
    best:function(a,b){return (b.front?1:0)-(a.front?1:0)||(num(b)?1:0)-(num(a)?1:0)||kpNumTxt(b.code)-kpNumTxt(a.code)}};
  return l.sort(by[so]||by.best)}
function card(o,i){return '<article class="it" data-i="'+i+'" tabindex="0" role="button" aria-label="'+esc(model(o)+' '+(o.storage||'')+', '+(num(o)?peso(num(o)):'price on request')+', code '+o.code)+'">'+
  (o.front?'<canvas data-i="'+i+'" width="600" height="600" aria-hidden="true"></canvas>':'<div class="ph" aria-hidden="true"><b>'+esc(o.code)+'</b><span>Photos coming soon</span></div>')+
  '<button class="heart'+(isSaved(o.code)?' on':'')+'" data-s="'+esc(o.code)+'" aria-label="Save '+esc(o.code)+'" aria-pressed="'+isSaved(o.code)+'">'+(isSaved(o.code)?'♥':'♡')+'</button>'+
  '<div class="tx"><div class="pr">'+priceHtml(o)+'</div><div class="md">'+esc(model(o))+'</div><div class="spx">'+esc(specs(o))+'</div><div class="chips">'+
  (noIssue(o)?'<span class="ch">✨ No issue</span>':'<span class="ch w">See condition</span>')+(tag(o,'GAMING')?'<span class="ch">🎮 Gaming</span>':'')+(tag(o,'CAMERA')?'<span class="ch">📷 Camera</span>':'')+
  '</div><div class="view"><span>View phone</span></div></div></article>'}
function wire(root){[].forEach.call(root.querySelectorAll('canvas[data-i]'),function(c){IO.observe(c)});
  [].forEach.call(root.querySelectorAll('.it'),function(d){d.onclick=function(e){var h=e.target.closest('.heart');if(h){e.stopPropagation();var on=toggleSave(h.dataset.s);h.classList.toggle('on',on);h.textContent=on?'♥':'♡';h.setAttribute('aria-pressed',on);return}open(ALL[d.dataset.i])};
    d.onkeydown=function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();open(ALL[d.dataset.i])}}})}
function draw(keep){var l=list(),Q=Qsel(),q=$('q').value.trim();if(!keep)SHOWN=PAGE;
  var af=[];if(SAVEDONLY)af.push('<button class="af" data-x="saved">♥ Saved <i>✕</i></button>');if(Q)af.push('<button class="af" data-x="q">'+Q.i+' '+esc(Q.t)+' <i>✕</i></button>');if(q)af.push('<button class="af" data-x="s">“'+esc(q)+'” <i>✕</i></button>');
  $('rh').innerHTML='<span class="n">'+l.length+' phone'+(l.length===1?'':'s')+'</span>'+af.join('')+(af.length>1?'<button class="lnk" data-x="all">Clear all</button>':'');
  [].forEach.call($('rh').querySelectorAll('[data-x]'),function(b){b.onclick=function(){var x=b.dataset.x;if(x==='saved'||x==='all')SAVEDONLY=false;if(x==='q'||x==='all'){QSEL='';$('so').value='best'}if(x==='s'||x==='all')$('q').value='';quick();draw()}});
  $('none').hidden=!!l.length;$('none').innerHTML=SAVEDONLY?'Wala ka pang saved. Tap the ♡ on any phone to save it here.':'Wala pang ganyan ngayon.<br><br><button class="btn p" id="nf">Tell us what you need — ime-message ka namin</button>';
  if($('nf'))$('nf').onclick=function(){openForm(null,'Looking for a phone (not listed)')};
  $('grid').innerHTML=l.slice(0,SHOWN).map(function(o){return card(o,ALL.indexOf(o))}).join('');wire($('grid'));
  $('more').hidden=l.length<=SHOWN;$('prog').textContent=l.length>SHOWN?'Showing '+SHOWN+' of '+l.length:''}
function quick(){$('quick').innerHTML=QUICK.map(function(x){var n=ALL.filter(x.f).length;return n?'<button class="q'+(QSEL===x.k?' on':'')+'" data-k="'+x.k+'" aria-pressed="'+(QSEL===x.k)+'"><span class="i" aria-hidden="true">'+x.i+'</span><span>'+esc(x.t)+'<small>'+(x.s?esc(x.s)+' · ':'')+n+' phones</small></span></button>':''}).join('');
  [].forEach.call($('quick').children,function(b){b.onclick=function(){QSEL=QSEL===b.dataset.k?'':b.dataset.k;var Q=Qsel();$('so').value=Q&&Q.sort?Q.sort:'best';quick();draw();$('rh').scrollIntoView({block:'start'});window.scrollBy(0,-80)}})}
/* ── product page ── */
var PP=null;
function similar(o){var n=num(o),b=String(o.brand).toUpperCase();return ALL.filter(function(x){return x!==o&&x.front&&num(x)&&Math.abs(num(x)-n)<=Math.max(2500,n*.25)}).sort(function(a,c){return ((String(c.brand).toUpperCase()===b)-(String(a.brand).toUpperCase()===b))||Math.abs(num(a)-n)-Math.abs(num(c)-n)}).slice(0,8)}
function open(o,noPush){if(!o)return;close(true);var i=ALL.indexOf(o),p=phone(),hasF=!!F.action;
  var d=document.createElement('div');d.className='pp';d.setAttribute('role','dialog');d.setAttribute('aria-label',model(o));
  d.innerHTML='<div class="ppbar"><button class="back" data-a="back">← Back</button><span class="sp"></span><button class="ib" data-a="share" aria-label="Share">↗</button><button class="ib'+(isSaved(o.code)?' on':'')+'" data-a="save" aria-label="Save">'+(isSaved(o.code)?'♥':'♡')+'</button></div>'+
   '<div class="ppin"><div class="ppcols"><div class="gal"><div class="gmain" id="gm"></div><div class="gthumbs" id="gt"></div><div class="ghint">Swipe for more photos · tap a photo to zoom</div></div><div>'+
   '<div style="display:flex;gap:6px;flex-wrap:wrap"><span class="badge hot">🔥 1 unit only — paunahan!</span><span class="badge code">'+esc(o.code)+'</span></div>'+
   '<div class="pt">'+esc(model(o))+'</div><div class="ps">'+esc(specs(o))+'</div><div class="pbig">'+priceHtml(o)+'</div>'+
   '<div class="cta">'+(C.MESSENGER?'<a class="btn l" target="_blank" rel="noopener" href="'+esc(mUrl(o,'video'))+'">🎥 Message para ma-flex ko sa\'yo in video 💪</a>':'')+
     (C.MESSENGER?'<a class="btn p" target="_blank" rel="noopener" href="'+esc(mUrl(o))+'">💬 Chat about '+esc(o.code)+' on Messenger</a>':'')+
     (p?'<div class="row"><a class="btn o" href="tel:'+p+'">📞 Call</a><a class="btn o" href="sms:'+p+'?body='+encodeURIComponent(mText(o))+'">✉ Text</a></div>':'')+'</div>'+
   '<div class="promises">'+(C.PROMISES||[]).map(function(x){return '<div>'+esc(x)+'</div>'}).join('')+'</div>'+
   condBox(o)+
   '<div class="box" id="fbx"><h3>Ipa-reserve o magtanong dito</h3><p class="ps" style="margin:0">Iwan mo lang ang number mo — kami na ang magme-message. Walang bayad para magtanong.</p><div id="fslot"></div></div>'+
   '</div></div><div class="sec"><h2>Similar phones, similar price</h2></div><div class="sim" id="sim"></div></div>'+
   '<div class="dock">'+(C.MESSENGER?'<a class="btn l" target="_blank" rel="noopener" href="'+esc(mUrl(o))+'">💬 Chat</a>':'')+(p?'<a class="btn o sq" href="tel:'+p+'" aria-label="Call">📞</a>':'')+'<button class="btn p" data-a="reserve">Reserve '+esc(o.code)+'</button></div>';
  document.body.appendChild(d);document.body.style.overflow='hidden';PP=d;
  formInto(d.querySelector('#fslot'),o,'Reserve this unit');
  /* gallery */
  var slides=o.front?[{l:'CARD',src:Promise.all([img('img/f/'+o.code+'-F.jpg'),img('img/f/'+o.code+'-B.jpg'),kpFontsReady()]).then(function(im){return kpDrawCard(document.createElement('canvas'),im[0],im[1],o,o.layout,1200).toDataURL('image/jpeg',.9)})},{l:'FRONT',src:'img/f/'+o.code+'-F.jpg'},{l:'BACK',src:'img/f/'+o.code+'-B.jpg'}]:[{l:'SOON',src:Promise.resolve(soon(o))}];
  var gm=d.querySelector('#gm'),gt=d.querySelector('#gt');gm.innerHTML=slides.map(function(s,k){return '<div data-k="'+k+'"><span class="ld">Loading photo…</span></div>'}).join('');
  gt.innerHTML=slides.length>1?slides.map(function(s,k){return '<button data-k="'+k+'" class="'+(k?'':'on')+'" aria-label="Photo '+(k+1)+'"></button>'}).join(''):'';
  slides.forEach(function(s,k){Promise.resolve(s.src).then(function(u){s.url=u;gm.children[k].innerHTML='<img src="'+u+'" alt="'+esc(model(o)+' photo '+(k+1))+'">';if(gt.children[k])gt.children[k].innerHTML='<img src="'+u+'" alt="">'})});
  [].forEach.call(gt.children,function(b){b.onclick=function(){gm.scrollTo({left:gm.clientWidth*b.dataset.k,behavior:'smooth'})}});
  gm.onscroll=function(){var k=Math.round(gm.scrollLeft/gm.clientWidth);[].forEach.call(gt.children,function(b,j){b.classList.toggle('on',j===k)})};
  [].forEach.call(gm.children,function(c){c.onclick=function(){var v=slides.filter(function(s){return s.url}).map(function(s){return {label:s.l,src:s.url}});if(v.length)kpView(v,+c.dataset.k,o.code+' · pinch or double-tap to zoom','')}});
  /* similar */
  var sl=similar(o);d.querySelector('#sim').innerHTML=sl.map(function(x){return card(x,ALL.indexOf(x))}).join('')||'<span class="ps">More phones coming soon.</span>';wire(d.querySelector('#sim'));
  d.onclick=function(e){var a=e.target.closest('[data-a]');if(!a)return;var k=a.dataset.a;
    if(k==='back')history.length>1&&location.hash?history.back():close();
    if(k==='save'){var on=toggleSave(o.code);a.classList.toggle('on',on);a.textContent=on?'♥':'♡';draw(true)}
    if(k==='share'){var url=location.href.split('#')[0]+'#'+o.code;if(navigator.share)navigator.share({title:model(o),text:model(o)+' '+(num(o)?peso(num(o)):''),url:url}).catch(function(){});else{try{navigator.clipboard.writeText(url);toast('Link copied')}catch(x){}}}
    if(k==='reserve'){d.querySelector('#fbx').scrollIntoView({behavior:'smooth',block:'start'});var n=d.querySelector('#fbx input');if(n)setTimeout(function(){n.focus()},400)}};
  var rv=store.get('ka_seen',[]);rv=[o.code].concat(rv.filter(function(c){return c!==o.code})).slice(0,12);store.set('ka_seen',rv);
  if(!noPush){try{history.pushState({c:o.code},'','#'+o.code)}catch(e){}}d.querySelector('.back').focus()}
function close(silent){if(!PP)return;PP.remove();PP=null;document.body.style.overflow='';var v=document.querySelector('.kpv');if(v)v.remove()}
window.addEventListener('popstate',function(){var h=location.hash.slice(1).toUpperCase(),o=h&&ALL.find(function(x){return x.code===h});if(o)open(o,true);else close()});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&PP&&!document.querySelector('.kpv'))(location.hash?history.back():close())});
function soon(o){var cv=document.createElement('canvas');cv.width=cv.height=900;var c=cv.getContext('2d'),g=c.createLinearGradient(0,0,900,900);g.addColorStop(0,'#1C4A3B');g.addColorStop(1,'#0B3D2E');c.fillStyle=g;c.fillRect(0,0,900,900);c.fillStyle='#E9F5D0';c.textAlign='center';
  c.font='400 72px "Courier Prime", monospace';c.fillText(o.code,450,400);c.font='700 38px Onest, sans-serif';c.fillText('Photos coming soon',450,475);c.font='500 30px Onest, sans-serif';c.fillText('Message us — ipapakita namin sa video!',450,525);return cv.toDataURL('image/jpeg',.9)}
/* ── inquiry form (Google Form → INQUIRIES tab, staff follow up every one) ── */
var WANTS=['Reserve this unit','Send me the actual video','I have a question','Looking for a phone (not listed)'],WANT_TL={'Reserve this unit':'📌 Ipa-reserve','Send me the actual video':'🎥 Pa-video','I have a question':'❓ May tanong','Looking for a phone (not listed)':'🔎 May hinahanap'};
function formInto(slot,o,want){if(!F.action){slot.innerHTML='<div class="cta" style="margin-top:10px">'+(C.MESSENGER?'<a class="btn l" target="_blank" rel="noopener" href="'+esc(mUrl(o))+'">💬 Message us to reserve '+(o?esc(o.code):'')+'</a>':'')+'</div>';return}
  var opts=(o?WANTS.slice(0,3):WANTS.slice(3)).concat(o?[]:['I have a question']);
  slot.innerHTML='<form class="form" novalidate><label for="fn">Pangalan</label><input id="fn" autocomplete="name" required>'+
   '<label for="fm">Mobile number</label><input id="fm" type="tel" inputmode="tel" autocomplete="tel" placeholder="09XX XXX XXXX" required>'+
   '<label for="ff">Facebook name <span class="ps">(optional)</span></label><input id="ff">'+
   '<label>Ano ang gusto mo?</label><div class="opts">'+opts.map(function(w){return '<button type="button" data-w="'+esc(w)+'" class="'+(w===want?'on':'')+'">'+WANT_TL[w]+'</button>'}).join('')+'</div>'+
   '<label for="fx">'+(o?'Message <span class="ps">(optional)</span>':'Model at budget mo')+'</label><textarea id="fx" rows="3" placeholder="'+(o?'Hal. Pwede pa-check ang battery?':'Hal. S23 Ultra, budget ₱20,000')+'"></textarea>'+
   '<div class="err" hidden></div><button class="btn p" type="submit" style="width:100%;margin-top:14px">Send — kami na ang magme-message</button>'+
   '<div class="note">Gagamitin lang namin ang number mo para i-follow up ang tanong mo.</div></form>';
  var fm=slot.querySelector('form'),W=want;
  [].forEach.call(fm.querySelectorAll('[data-w]'),function(b){b.onclick=function(){W=b.dataset.w;[].forEach.call(fm.querySelectorAll('[data-w]'),function(x){x.classList.toggle('on',x===b)})}});
  fm.onsubmit=function(e){e.preventDefault();var nm=fm.querySelector('#fn').value.trim(),mb=fm.querySelector('#fm').value.replace(/[^\d+]/g,''),er=fm.querySelector('.err');
    if(nm.length<2){er.hidden=false;er.textContent='Pakilagay ang pangalan mo.';fm.querySelector('#fn').focus();return}
    if(!/^(\+?63|0)9\d{9}$/.test(mb)){er.hidden=false;er.textContent='Pakicheck ang mobile number (hal. 0917 123 4567).';fm.querySelector('#fm').focus();return}
    er.hidden=true;var bt=fm.querySelector('[type=submit]');bt.disabled=true;bt.textContent='Sending…';
    var fd=new FormData();function put(k,v){if(F[k])fd.append(F[k],v)}put('code',o?o.code:'');put('name',nm);put('mobile',mb);put('fb',fm.querySelector('#ff').value.trim());put('want',W||WANTS[o?0:3]);
    put('msg',fm.querySelector('#fx').value.trim()+(o?' · '+model(o)+' '+(o.storage||'')+' '+(num(o)?peso(num(o)):''):''));put('page',location.href.split('#')[0]+(o?'#'+o.code:''));
    fetch(F.action,{method:'POST',mode:'no-cors',body:fd}).then(function(){
      slot.innerHTML='<div class="okmsg">✅ Salamat, '+esc(nm.split(' ')[0])+'! Natanggap namin. Ime-message ka namin agad'+(o?' tungkol sa '+esc(o.code):'')+'.</div>'+(C.MESSENGER?'<a class="btn l" style="width:100%;margin-top:10px" target="_blank" rel="noopener" href="'+esc(mUrl(o))+'">Mas mabilis? Chat na tayo sa Messenger</a>':'')})
     .catch(function(){bt.disabled=false;bt.textContent='Send — kami na ang magme-message';er.hidden=false;er.textContent='Hindi na-send. Pakisubukan ulit o i-message kami sa Messenger.'})}}
function openForm(o,want){var d=document.createElement('div');d.className='pp';d.innerHTML='<div class="ppbar"><button class="back">← Back</button></div><div class="ppin" style="max-width:640px"><div class="box"><h3>🔎 Sabihin mo ang hanap mo</h3><p class="ps" style="margin:0">Ime-message ka namin pag may dumating na pasok sa gusto mo.</p><div id="fs2"></div></div></div>';
  document.body.appendChild(d);document.body.style.overflow='hidden';formInto(d.querySelector('#fs2'),o,want);d.querySelector('.back').onclick=function(){d.remove();document.body.style.overflow=''}}
/* ── header, footer, boot ── */
function setBig(on){document.documentElement.classList.toggle('big',on);$('bigt').setAttribute('aria-pressed',on);$('bigt').textContent=on?'A−':'A+';$('bigt').setAttribute('aria-label',on?'Normal text size':'Bigger text');store.set('ka_big',on)}
$('bigt').onclick=function(){setBig(!document.documentElement.classList.contains('big'))};setBig(!!store.get('ka_big',false));
$('savedN').textContent=SAVED.length;$('savedBtn').onclick=function(){SAVEDONLY=!SAVEDONLY;draw();$('rh').scrollIntoView({block:'start'})};
$('sf').onsubmit=function(e){e.preventDefault();$('q').blur();draw();$('rh').scrollIntoView({block:'start'})};
var tm;$('q').oninput=function(){clearTimeout(tm);tm=setTimeout(function(){draw()},220)};$('so').onchange=function(){draw()};
$('more').onclick=function(){SHOWN+=PAGE;draw(true)};$('lfBtn').onclick=function(){openForm(null,'Looking for a phone (not listed)')};
$('trust').innerHTML=(C.PROMISES||[]).map(function(x){return '<div>'+esc(x)+'</div>'}).join('');
if(C.MESSENGER){$('fab').href=mUrl(null);$('fab').hidden=false}
var lk=[];if(C.MESSENGER)lk.push('<a href="'+esc(C.MESSENGER)+'" target="_blank" rel="noopener">💬 Messenger</a>');if(C.FACEBOOK)lk.push('<a href="'+esc(C.FACEBOOK)+'" target="_blank" rel="noopener">👍 Follow our page</a>');
if(C.HUB_GROUP)lk.push('<a href="'+esc(C.HUB_GROUP)+'" target="_blank" rel="noopener">👥 Join the Inventory Hub</a>');if(phone())lk.push('<a href="tel:'+phone()+'">📞 '+esc(C.PHONE_SHOW||C.PHONE)+'</a>');
$('ft').innerHTML='<b style="font-size:1.15rem;color:#B9F227">'+esc(C.SHOP_NAME||'')+'</b><div>📍 '+esc(C.ADDRESS||'')+'</div>'+(lk.length?'<div class="lk">'+lk.join('')+'</div>':'')+
 '<h3>Paano bumili</h3><ol><li>Pumili ng phone at i-tap para makita ang photos at condition.</li><li>I-message kami sa Messenger o i-send ang form — sabihin ang item code.</li><li>Mag-down payment para ma-reserve, then ship (24–48 hrs) o pickup sa Batasan Hills.</li></ol>'+
 '<div style="opacity:.75;margin-top:14px">Prices and availability update every hour. Isang unit lang bawat isa — paunahan!</div>';
fetch('data/catalog.json',{cache:'no-cache'}).then(function(r){return r.json()}).then(function(d){ALL=d.items||[];
  var up=d.updated?new Date(d.updated):null,wp=ALL.filter(function(o){return o.front}).length;
  $('sub').innerHTML='<b style="color:#B9F227">'+ALL.length+' phones</b> available now'+(up?' · updated '+up.toLocaleTimeString('en-PH',{hour:'numeric',minute:'2-digit'}):'');
  quick();draw();var h=location.hash.slice(1).toUpperCase();if(h){var o=ALL.find(function(x){return x.code===h});if(o){try{history.replaceState(null,'',location.pathname)}catch(e){}open(o)}}})
 .catch(function(){$('sub').textContent='Could not load the phones. Please refresh the page.'});
})();

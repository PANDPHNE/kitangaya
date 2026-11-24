/* Kitang Aya public catalog · reads data/catalog.json (built every hour from UPDATED INVENTORY · AVAILABLE only) */
(function(){
var C=window.KA_CONFIG||{},ALL=[],BR='',$=function(i){return document.getElementById(i)},esc=kpEsc;
function num(o){return kpNumTxt(o.saleTxt)||kpNumTxt(o.priceTxt)||0}
function noIssue(o){return /^\s*no issue/i.test(o.diag||'')}
function img(src){return kpLoadImg(src)}
function msgText(o){return 'Hi! Interested po ako sa '+o.code+' · '+kpTitle(o)+' · '+kpPrice(o)}
function ctaHtml(o){var t=encodeURIComponent(msgText(o)),a=[];
  if(C.MESSENGER)a.push('<a class="m" target="_blank" rel="noopener" href="'+esc(C.MESSENGER)+(C.MESSENGER.indexOf('?')<0?'?':'&')+'text='+t+'">💬 Message us</a>');
  if(C.PHONE){var p=C.PHONE.replace(/[^\d+]/g,'');a.push('<a class="o" href="tel:'+p+'">📞 Call</a>');a.push('<a class="o" href="sms:'+p+'?body='+t+'">✉ Text</a>')}
  if(C.FACEBOOK)a.push('<a class="o" target="_blank" rel="noopener" href="'+esc(C.FACEBOOK)+'">Facebook page</a>');
  return a.length?'<div class="cta">'+a.join('')+'</div><div class="m" style="margin-top:8px">Mention the code <b>'+esc(o.code)+'</b> when you message us.</div>':''}
function info(o){return kpInfoHtml(o).replace(/<div class="m">[^<]*<\/div>/,'').replace(/<div class="m" style="margin-top:6px">Original diagnosis[\s\S]*$/,'')+ctaHtml(o)}
/* draw cards only when they scroll into view */
var IO=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;IO.unobserve(e.target);var cv=e.target,o=ALL[cv.dataset.i];
  Promise.all([img('img/t/'+o.code+'-F.jpg'),img('img/t/'+o.code+'-B.jpg'),kpFontsReady()]).then(function(im){kpDrawCard(cv,im[0],im[1],o,o.layout,600)}).catch(function(){})})},{rootMargin:'400px'});
function open(o){var sl;
  if(o.front){var big=Promise.all([img('img/f/'+o.code+'-F.jpg'),img('img/f/'+o.code+'-B.jpg'),kpFontsReady()]);
    sl=[{label:'CARD',src:big.then(function(im){return kpDrawCard(document.createElement('canvas'),im[0],im[1],o,o.layout,1200).toDataURL('image/jpeg',.9)})},{label:'FRONT',src:'img/f/'+o.code+'-F.jpg'},{label:'BACK',src:'img/f/'+o.code+'-B.jpg'}]}
  else{var cv=document.createElement('canvas');cv.width=cv.height=900;var c=cv.getContext('2d');c.fillStyle='#0B3D2E';c.fillRect(0,0,900,900);c.fillStyle='#E9F5D0';c.textAlign='center';c.font='400 64px "Courier Prime", monospace';c.fillText(o.code,450,420);c.font='600 34px Onest, sans-serif';c.fillText('Photos coming soon · message us for actual photos',450,490);sl=[{label:'PHOTO SOON',src:cv.toDataURL('image/jpeg',.9)}]}
  kpView(sl,0,o.code,info(o));try{history.replaceState(null,'','#'+o.code)}catch(e){}}
function list(){var q=$('q').value.trim().toLowerCase().split(/\s+/).filter(Boolean),pr=$('pr').value.split('-'),lo=Number(pr[0])||0,hi=Number(pr[1])||0,cn=$('cn').value,so=$('so').value;
  var l=ALL.filter(function(o){var hay=(o.code+' '+o.brand+' '+o.unit+' '+o.storage+' '+o.color).toLowerCase(),n=num(o);
    return (!BR||(o.brand||'').toUpperCase()===BR)&&q.every(function(w){return hay.indexOf(w)>=0})&&(!lo||n>=lo)&&(!hi||(n&&n<=hi))&&(!cn||(cn==='ok')===noIssue(o))});
  if(so==='lo')l.sort(function(a,b){return (num(a)||1e9)-(num(b)||1e9)});else if(so==='hi')l.sort(function(a,b){return num(b)-num(a)});
  return l}
function draw(){var l=list();$('cnt').textContent=l.length+' of '+ALL.length+' available units';$('none').style.display=l.length?'none':'block';
  $('grid').innerHTML=l.map(function(o){var i=ALL.indexOf(o);return '<div class="it" data-i="'+i+'">'+(o.front?'<canvas data-i="'+i+'" width="600" height="600"></canvas>':'<div class="ph"><b>'+esc(o.code)+'</b>Photos coming soon</div>')+
    '<div class="tx"><b>'+esc(kpTitle(o))+'</b><div class="pr">'+esc(kpPrice(o))+'</div><div style="color:#6B756F">'+esc(o.code)+'</div></div></div>'}).join('');
  [].forEach.call($('grid').querySelectorAll('canvas'),function(c){IO.observe(c)});
  [].forEach.call($('grid').querySelectorAll('.it'),function(d){d.onclick=function(){open(ALL[d.dataset.i])}})}
function brands(){var m={};ALL.forEach(function(o){var b=(o.brand||'').toUpperCase();if(b)m[b]=(m[b]||0)+1});
  $('br').innerHTML=['<button data-b="" class="on">All</button>'].concat(Object.keys(m).sort(function(a,b){return m[b]-m[a]}).map(function(b){return '<button data-b="'+esc(b)+'">'+esc(b)+' · '+m[b]+'</button>'})).join('');
  [].forEach.call($('br').children,function(x){x.onclick=function(){BR=x.dataset.b;[].forEach.call($('br').children,function(y){y.classList.toggle('on',y===x)});draw()}})}
var tm;$('q').oninput=function(){clearTimeout(tm);tm=setTimeout(draw,150)};$('pr').onchange=$('cn').onchange=$('so').onchange=draw;
$('ft').innerHTML=esc(C.SHOP_NAME||'')+(C.ADDRESS?' · '+esc(C.ADDRESS):'')+'<br>Prices and availability update every hour. Message us to reserve.';
fetch('data/catalog.json',{cache:'no-cache'}).then(function(r){return r.json()}).then(function(d){ALL=d.items||[];
  var up=d.updated?new Date(d.updated):null;$('sub').textContent=ALL.length+' available units'+(up?' · updated '+up.toLocaleString('en-PH',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}):'');
  brands();draw();var h=location.hash.slice(1).toUpperCase();if(h){var o=ALL.find(function(x){return x.code===h});if(o)open(o)}})
 .catch(function(){$('sub').textContent='Could not load the list. Please refresh.'});
})();

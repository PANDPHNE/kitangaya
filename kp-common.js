/* ───── shared by both pages: shorten the condition (keeps every original fact) + draw the approved card ───── */
var KPC={SIZE:1600,BOX:{x:.562,y:.060,s:.375},CODE_Y:.488,TXT:{x0:.578,x1:.962,y0:.522,y1:.985}};
function kpUp1(s){s=String(s||'').trim();return s.charAt(0).toUpperCase()+s.slice(1)}
function kpKeepCaps(s){return s.replace(/\b(amoled|lcd|sim|ntc|bh|imei|fps|ois|nfc|usb|5g|4g|lte|ram|rom|gb|tb|esim|id)\b/gi,function(m){return m.toUpperCase()}).replace(/\b(\d+)gb\b/gi,'$1GB')}
function kpJoin(a){a=a.filter(Boolean);return a.length<2?(a[0]||''):a.slice(0,-1).join(', ')+' & '+a[a.length-1]}
/* Sheet B diagnosis → short bullet lines. Groups dents / scratches / cracks / display issues, tags (Any SIM, NTC, unit only) last.
   Loose back case is left out only when the unit is FOR REGLUE (fixed before release = house rule). */
function kpShortCond(diag,status){
  var reglue=/REGLUE/i.test(status||''),parts=String(diag||'').split(/[,;\n]+|\s\/\s/).map(function(s){return s.replace(/\s+/g,' ').trim()}).filter(Boolean);
  var G={dents:[],sdents:[],scr:[],crk:[],disp:[]},order=[],other=[],tags=[],seen={};
  function add(k){if(order.indexOf(k)<0)order.push(k)}
  function place(s){return s.toLowerCase().replace(/^(the )/,'').replace(/side ?frame/,'side frame').replace(/back ?case/,'backcase').replace(/back ?cam(era)? frame/,'back cam frame').replace(/back ?cam(era)? lens/,'back cam lens')}
  parts.forEach(function(p){
    var l=p.toLowerCase(),m;
    if(seen[l])return;seen[l]=1;
    if(/^(for )?camera cleaning$|^for (reglue|sale|job)$/.test(l))return;
    if(reglue&&/^loose ?back ?(case|cover)$/.test(l))return;
    if(/^(any ?sim|open ?line|openline)$/.test(l)){if(tags.indexOf('Any SIM')<0)tags.push('Any SIM');return}
    if(/^ntc ?approved$/.test(l)){tags.push('NTC Approved');return}
    if(/^unit only$/.test(l)){tags.push('Unit only');return}
    if(/^with (box|case|charger|earphones?|complete inclusions?)/.test(l)){tags.push(kpUp1(l));return}
    if(/^(complete inclusions?|no issue)$/.test(l)){order.push({o:kpUp1(l)});return}
    if(m=l.match(/^severe dents? (on|sa) (.+)$/)){G.sdents.push(place(m[2]));add('sdents');return}
    if(m=l.match(/^(small |minor |light |slight |minimal )?dents? (on|sa) (.+)$/)){G.dents.push(place(m[3]));add('dents');return}
    if(m=l.match(/^(small |minor |light |slight |minimal )?scratch(es)? (on|sa) (.+)$/)){G.scr.push(place(m[4]));add('scr');return}
    if(m=l.match(/^(small |minor |slight )?cracks? (on|sa|inside) (.+)$/)){G.crk.push(place(m[3]));add('crk');return}
    if(/amoled|burn|lines?\b|pinkish|flicker|spot|discolor|shadow|ghost ?touch|lcd|faded display|water ?mark|green tint|yellowish|blink/.test(l)&&!/dent|scratch|crack/.test(l)){
      var d=l.replace(/^(\w+) on (the )?display$/,'$1 display').replace(/ on (the )?(upper|lower|left|right) part of (the )?screen/,' sa $2 part ng screen').replace(/ on /g,' sa ');G.disp.push(d);add('disp');return}
    var o=l.replace(/\bback cam\b(?! (frame|lens))/,'back camera').replace(/ from ([\d.]+)x to ([\d.]+)x/,' sa $1x–$2x').replace(/\b(\d+)\s*%?\s*bh\b/,'$1% battery health');
    order.push({o:kpUp1(o)});
  });
  var out=[];
  order.forEach(function(k){
    if(k==='dents')out.push('Dents sa '+kpJoin(G.dents));
    else if(k==='sdents')out.push('Severe dents sa '+kpJoin(G.sdents));
    else if(k==='scr')out.push('Scratches sa '+kpJoin(G.scr));
    else if(k==='crk')out.push('Crack sa '+kpJoin(G.crk));
    else if(k==='disp')out.push(kpUp1(kpJoin(G.disp)));
    else if(k&&k.o)out.push(k.o);
  });
  if(out.length+tags.length>8&&tags.length>1)tags=[tags.join(' · ')];   /* long lists: Any SIM · NTC · Unit only share one line so the text stays big */
  return out.concat(tags).map(kpKeepCaps).map(function(s){return s.replace(/\bsim\b/gi,'SIM')});
}
function kpTitle(o){var b=String(o.brand||'').trim(),u=String(o.unit||'').trim();if(b&&u.toUpperCase().indexOf(b.toUpperCase())===0)b='';
  return [ [b,u].filter(Boolean).join(' '),o.storage,o.color].filter(function(x){return String(x||'').trim()}).join(' | ').toUpperCase()}
function kpNumTxt(s){var m=String(s||'').replace(/,/g,'').match(/\d+(\.\d+)?/);return m?Number(m[0]):0}
function kpPrice(o){var sale=kpNumTxt(o.saleTxt),reg=kpNumTxt(o.priceTxt),n=sale||reg;if(!n)return 'Price to follow';
  var t='₱'+Math.round(n).toLocaleString('en-US');if(sale&&reg&&reg>sale)t+=' (SALE · was ₱'+Math.round(reg).toLocaleString('en-US')+')';else if(/promo/i.test(o.saleTxt||o.priceTxt))t+=' (PROMO)';return t}
var KP_CTA=['I-message ang page para sa info!','PAUNAHAN LANG!'];
/* the short caption for the post = exactly what the card says */
function kpShortCaption(o){return [o.code,kpTitle(o),kpPrice(o),'','Condition:'].concat(kpShortCond(o.diag,o.status).map(function(x){return '• '+x})).concat(['']).concat(KP_CTA).join('\n')}
function kpWrap(ctx,text,w){var words=String(text).split(' '),lines=[],cur='';words.forEach(function(wd){var t=cur?cur+' '+wd:wd;if(ctx.measureText(t).width<=w||!cur)cur=t;else{lines.push(cur);cur=wd}});if(cur)lines.push(cur);return lines}
/* draw the approved BATCH card on a canvas. front/back = loaded Image/ImageBitmap; slide = 0..40 (% the back photo moves left) */
/* layout saved per item: "left,up/down,size" in %. Old items saved a plain number = left only. */
function kpLay(v){var a=String(v==null?'':v).split(',').map(Number);return{x:isFinite(a[0])&&String(v).trim()!==''?a[0]:12,y:isFinite(a[1])?a[1]:0,z:isFinite(a[2])&&a[2]>0?a[2]:100}}
function kpDrawCard(cv,front,back,o,layout,S){
  S=S||KPC.SIZE;cv.width=S;cv.height=S;var c=cv.getContext('2d'),L=kpLay(layout);
  c.fillStyle='#000';c.fillRect(0,0,S,S);
  if(back){var base=Math.max(S/back.width,S/back.height);
    /* soft blurred fill behind, so sliding left never leaves an empty strip on the right */
    c.save();try{c.filter='blur('+Math.round(S*.03)+'px) brightness(.55)'}catch(e){}c.drawImage(back,(S-back.width*base*1.15)/2,(S-back.height*base*1.15)/2,back.width*base*1.15,back.height*base*1.15);c.restore();
    /* the real back photo: same size as the card (no zoom unless Size is changed), only slid */
    var sc=base*L.z/100,dw=back.width*sc,dh=back.height*sc;c.drawImage(back,(S-dw)/2-S*L.x/100,(S-dh)/2+S*L.y/100,dw,dh)}
  var B=KPC.BOX,bx=B.x*S,by=B.y*S,bs=B.s*S;
  if(front){var fs=Math.min(front.width,front.height);c.drawImage(front,(front.width-fs)/2,(front.height-fs)/2,fs,fs,bx,by,bs,bs)}else{c.fillStyle='rgba(255,255,255,.08)';c.fillRect(bx,by,bs,bs)}
  function shadow(on,k){c.shadowColor=on?'rgba(0,0,0,.9)':'transparent';c.shadowBlur=on?S*(k||.008):0;c.shadowOffsetX=c.shadowOffsetY=on?S*.002:0}
  // item code · typewriter, letter-spaced, centered under the front photo
  var code=String(o.code||''),fz=S*.052;c.font='400 '+fz+'px "Courier Prime", "Courier New", monospace';c.fillStyle='#F4F4F2';shadow(true,.01);
  var sp=fz*.16,cw=code.split('').map(function(ch){return c.measureText(ch).width}),tw=cw.reduce(function(a,b){return a+b},0)+sp*(code.length-1),x=bx+bs/2-tw/2;
  code.split('').forEach(function(ch,i){c.fillText(ch,x,KPC.CODE_Y*S);x+=cw[i]+sp});
  // details block · Onest on a black panel that hugs the text (never past the card), shrinks until everything fits
  var T=KPC.TXT,pad=S*.016,x0=T.x0*S,w=(T.x1-T.x0)*S,top=T.y0*S,bottom=T.y1*S-pad,cond=kpShortCond(o.diag,o.status),best=null;
  for(var f=.0205;f>=.0118;f-=.0007){
    var px=S*f,lh=px*1.38,gap=lh*.55,rows=[];c.font='600 '+px+'px Onest, sans-serif';
    kpWrap(c,kpTitle(o),w).forEach(function(t){rows.push([t,600])});rows.push([kpPrice(o),700]);rows.push(['',0,gap]);rows.push(['Condition:',600]);
    cond.forEach(function(it){kpWrap(c,'• '+it,w).forEach(function(t,j){rows.push([(j?'   ':'')+t,600])})});
    rows.push(['',0,gap]);KP_CTA.forEach(function(t){rows.push([t,700])});
    var h=rows.reduce(function(a,r){return a+(r[2]||lh)},0);best={px:px,lh:lh,rows:rows,h:h};if(top+h<=bottom)break;
  }
  var mw=0;best.rows.forEach(function(r){if(!r[2]){c.font=r[1]+' '+best.px+'px Onest, sans-serif';mw=Math.max(mw,c.measureText(r[0]).width)}});
  var px0=x0-pad,py0=top-pad,pw=Math.min(mw+pad*2,S*.99-px0),ph=best.h-best.lh+best.px*1.25+pad*2;
  c.save();c.shadowColor='rgba(0,0,0,.75)';c.shadowBlur=S*.025;c.shadowOffsetX=0;c.shadowOffsetY=S*.008;c.fillStyle='rgba(0,0,0,.86)';
  c.beginPath();if(c.roundRect)c.roundRect(px0,py0,pw,ph,S*.012);else c.rect(px0,py0,pw,ph);c.fill();c.restore();
  var y=top+best.px;c.fillStyle='#FFFFFF';shadow(true,.004);
  best.rows.forEach(function(r){if(r[2]){y+=r[2];return}c.font=r[1]+' '+best.px+'px Onest, sans-serif';c.fillText(r[0],x0,y);y+=best.lh});
  shadow(false);return cv;
}
function kpLoadImg(src){return new Promise(function(ok,no){var i=new Image();i.onload=function(){ok(i)};i.onerror=function(){no(new Error('Could not read the photo'))};i.src=src})}
function kpFontsReady(){try{return Promise.all([document.fonts.load('400 40px "Courier Prime"'),document.fonts.load('600 30px Onest'),document.fonts.load('700 30px Onest')])}catch(e){return Promise.resolve()}}
/* ───── photo viewer: tap a photo → full screen · pinch / double-tap / wheel / + − to zoom · drag to move · swipe or ‹ › for next ───── */
(function(){if(document.getElementById('kpv-css'))return;var st=document.createElement('style');st.id='kpv-css';st.textContent=
'.kpv{position:fixed;inset:0;z-index:200;background:#0A0E0C;display:flex;flex-direction:column;color:#fff;font-family:Onest,system-ui,sans-serif}'+
'.kpv-top{display:flex;align-items:center;gap:8px;padding:10px 12px}.kpv-top b{color:#B9F227;font-size:16px}.kpv-top .sp{flex:1}'+
'.kpv button{background:rgba(255,255,255,.1);color:#fff;border:1px solid rgba(255,255,255,.2);border-radius:10px;padding:8px 12px;font:inherit;font-size:14px;cursor:pointer}'+
'.kpv-stage{flex:1;position:relative;overflow:hidden;touch-action:none;min-height:0}.kpv-stage img{position:absolute;left:50%;top:50%;max-width:100%;max-height:100%;transform-origin:0 0;user-select:none;-webkit-user-drag:none;will-change:transform}'+
'.kpv-nav{position:absolute;top:50%;transform:translateY(-50%);font-size:26px!important;padding:6px 14px!important;z-index:2}.kpv-l{left:8px}.kpv-r{right:8px}'+
'.kpv-zm{position:absolute;right:10px;bottom:10px;display:flex;gap:6px;z-index:2}.kpv-lbl{position:absolute;left:10px;top:10px;background:rgba(0,0,0,.6);padding:4px 9px;border-radius:8px;font-size:12px;font-weight:700;letter-spacing:.05em;z-index:2}'+
'.kpv-wait{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#aaa;font-size:14px}'+
'.kpv-strip{display:flex;gap:6px;padding:8px 12px;overflow-x:auto}.kpv-strip div{flex:0 0 56px;height:56px;border-radius:8px;overflow:hidden;border:2px solid transparent;cursor:pointer;background:#222;position:relative}.kpv-strip div.on{border-color:#B9F227}'+
'.kpv-strip img{width:100%;height:100%;object-fit:cover}.kpv-strip span{position:absolute;left:0;right:0;bottom:0;font-size:9px;text-align:center;background:rgba(0,0,0,.6)}'+
'.kpv-info{max-height:34vh;overflow:auto;padding:10px 14px 14px;font-size:14px;line-height:1.45;border-top:1px solid rgba(255,255,255,.12)}.kpv-info .t{font-weight:700}.kpv-info .p{color:#B9F227;font-weight:700}.kpv-info .m{color:#A9B3AD;font-size:12.5px}.kpv-info ul{margin:4px 0;padding-left:18px}'+
'.kpv-info .acts{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}@media(min-width:900px){.kpv-body{display:flex;flex:1;min-height:0}.kpv-main{flex:1;display:flex;flex-direction:column;min-width:0}.kpv-info{width:340px;max-height:none;border-top:0;border-left:1px solid rgba(255,255,255,.12)}}'+
'@media(max-width:899px){.kpv-body{display:flex;flex-direction:column;flex:1;min-height:0}.kpv-main{flex:1;display:flex;flex-direction:column;min-height:0}}';document.head.appendChild(st)})();
/* slides: [{label, src}] (src = url / data url, or a Promise of one) · info: html for the details panel · acts: [{t, fn(slide)}] */
function kpView(slides,start,title,info,acts){
  var old=document.querySelector('.kpv');if(old)old.remove();
  var v=document.createElement('div');v.className='kpv';v.innerHTML='<div class="kpv-top"><b></b><span class="sp"></span><button data-k="x">✕ Close</button></div><div class="kpv-body"><div class="kpv-main"><div class="kpv-stage"><span class="kpv-lbl"></span><div class="kpv-wait">Loading photo…</div><img alt=""><button class="kpv-nav kpv-l">‹</button><button class="kpv-nav kpv-r">›</button><div class="kpv-zm"><button data-k="-">−</button><button data-k="0">Fit</button><button data-k="+">＋</button></div></div><div class="kpv-strip"></div></div><div class="kpv-info"></div></div>';
  document.body.appendChild(v);var Q=function(s){return v.querySelector(s)},stage=Q('.kpv-stage'),img=Q('.kpv-stage img'),i=Math.max(0,start||0),S=1,X=0,Y=0,P={},pinch=null,pan=null,tapT=0,swipe=null,keep=document.body.style.overflow;
  document.body.style.overflow='hidden';Q('.kpv-top b').textContent=title||'';
  Q('.kpv-info').innerHTML=info||'';(acts||[]).forEach(function(a){var b=document.createElement('button');b.textContent=a.t;b.onclick=function(){a.fn(slides[i],b)};var box=Q('.kpv-info .acts');if(!box){box=document.createElement('div');box.className='acts';Q('.kpv-info').appendChild(box)}box.appendChild(b)});
  if(!info&&!(acts||[]).length)Q('.kpv-info').style.display='none';
  slides.forEach(function(s){Promise.resolve(s.src).then(function(u){s.url=u;strip();if(s===slides[i])show()},function(){s.bad=1;if(s===slides[i])show()})});
  function strip(){Q('.kpv-strip').innerHTML=slides.length<2?'':slides.map(function(s,k){return '<div data-i="'+k+'" class="'+(k===i?'on':'')+'">'+(s.url?'<img src="'+s.url+'">':'')+'<span>'+s.label+'</span></div>'}).join('');
    [].forEach.call(Q('.kpv-strip').children,function(d){d.onclick=function(){go(+d.dataset.i)}})}
  function fit(){S=1;X=0;Y=0;apply()}
  function base(){var w=img.naturalWidth,h=img.naturalHeight,r=stage.getBoundingClientRect(),k=Math.min(r.width/w,r.height/h);return{w:w*k,h:h*k,r:r}}
  function clamp(){var b=base(),mx=Math.max(0,(b.w*S-b.r.width)/2),my=Math.max(0,(b.h*S-b.r.height)/2);X=Math.max(-mx,Math.min(mx,X));Y=Math.max(-my,Math.min(my,Y))}
  function apply(){if(!img.naturalWidth)return;var b=base();img.style.maxWidth='none';img.style.maxHeight='none';img.style.width=b.w+'px';img.style.height=b.h+'px';clamp();
    img.style.transform='translate('+(X-b.w*S/2)+'px,'+(Y-b.h*S/2)+'px) scale('+S+')';stage.style.cursor=S>1?'grab':'default'}
  function zoomAt(ns,cx,cy){ns=Math.max(1,Math.min(6,ns));var r=stage.getBoundingClientRect(),ox=cx-r.left-r.width/2,oy=cy-r.top-r.height/2;X=ox-(ox-X)*ns/S;Y=oy-(oy-Y)*ns/S;S=ns;apply()}
  function show(){var s=slides[i];Q('.kpv-lbl').textContent=s.label+(slides.length>1?' · '+(i+1)+'/'+slides.length:'');Q('.kpv-l').style.display=Q('.kpv-r').style.display=slides.length>1?'':'none';
    Q('.kpv-wait').textContent=s.bad?'Could not load this photo.':'Loading photo…';Q('.kpv-wait').style.display=s.url?'none':'flex';img.style.display=s.url?'':'none';
    if(s.url&&img.getAttribute('src')!==s.url){img.onload=fit;img.src=s.url}else fit();[].forEach.call(Q('.kpv-strip').children,function(d,k){d.classList.toggle('on',k===i)})}
  function go(k){i=(k+slides.length)%slides.length;show()}
  function close(){v.remove();document.body.style.overflow=keep;document.removeEventListener('keydown',key);window.removeEventListener('resize',apply)}
  function key(e){if(e.key==='Escape')close();else if(e.key==='ArrowRight')go(i+1);else if(e.key==='ArrowLeft')go(i-1);else if(e.key==='+'||e.key==='=')zoomAt(S*1.4,innerWidth/2,innerHeight/2);else if(e.key==='-')zoomAt(S/1.4,innerWidth/2,innerHeight/2)}
  document.addEventListener('keydown',key);window.addEventListener('resize',apply);
  Q('[data-k="x"]').onclick=close;Q('.kpv-l').onclick=function(){go(i-1)};Q('.kpv-r').onclick=function(){go(i+1)};
  v.querySelector('.kpv-zm').onclick=function(e){var k=e.target.dataset.k,r=stage.getBoundingClientRect();if(k==='0')fit();else if(k)zoomAt(S*(k==='+'?1.6:1/1.6),r.left+r.width/2,r.top+r.height/2)};
  stage.addEventListener('wheel',function(e){e.preventDefault();zoomAt(S*(e.deltaY<0?1.2:1/1.2),e.clientX,e.clientY)},{passive:false});
  stage.addEventListener('pointerdown',function(e){if(e.target.tagName==='BUTTON')return;stage.setPointerCapture(e.pointerId);P[e.pointerId]={x:e.clientX,y:e.clientY};var ids=Object.keys(P);
    if(ids.length===2){var a=P[ids[0]],b=P[ids[1]];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),s:S};pan=null;swipe=null}
    else if(ids.length===1){pan={x:e.clientX,y:e.clientY,X:X,Y:Y};swipe=S===1?{x:e.clientX,y:e.clientY}:null;
      var now=Date.now();if(now-tapT<300){zoomAt(S>1?1:2.5,e.clientX,e.clientY);if(S===1)fit();tapT=0;pan=null;swipe=null}else tapT=now}});
  stage.addEventListener('pointermove',function(e){if(!P[e.pointerId])return;P[e.pointerId]={x:e.clientX,y:e.clientY};var ids=Object.keys(P);
    if(pinch&&ids.length===2){var a=P[ids[0]],b=P[ids[1]];zoomAt(pinch.s*Math.hypot(a.x-b.x,a.y-b.y)/pinch.d,(a.x+b.x)/2,(a.y+b.y)/2)}
    else if(pan&&S>1){X=pan.X+e.clientX-pan.x;Y=pan.Y+e.clientY-pan.y;apply()}});
  function up(e){var sw=swipe;delete P[e.pointerId];if(Object.keys(P).length<2)pinch=null;
    if(sw&&S===1&&!Object.keys(P).length){var dx=e.clientX-sw.x;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(e.clientY-sw.y))go(i+(dx<0?1:-1))}
    if(!Object.keys(P).length){pan=null;swipe=null}else{var k=Object.keys(P)[0];pan={x:P[k].x,y:P[k].y,X:X,Y:Y}}}
  stage.addEventListener('pointerup',up);stage.addEventListener('pointercancel',up);
  strip();show();return{close:close}
}
function kpEsc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
/* details panel for one item */
function kpInfoHtml(o){var cond=kpShortCond(o.diag,o.status);
  return '<div class="t">'+kpEsc(kpTitle(o))+'</div><div class="p">'+kpEsc(kpPrice(o))+'</div>'+
   '<div class="m">'+kpEsc([o.status||'',o.sold?'SOLD':'',o.postedTxt?'posted '+o.postedTxt:'not posted yet'].filter(Boolean).join(' · '))+'</div>'+
   '<div style="margin-top:8px;font-weight:600">Condition</div><ul>'+cond.map(function(x){return '<li>'+kpEsc(x)+'</li>'}).join('')+'</ul>'+
   (o.diag?'<div class="m" style="margin-top:6px">Original diagnosis (Sheet B): '+kpEsc(o.diag)+'</div>':'')}

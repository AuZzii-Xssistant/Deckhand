/* Live port of the Deckhand animation: same drawing code as the video, vector-sharp, no video file.
   Plays only while on screen; the 20 s timeline loops. */
(function () {
  var canvas = document.getElementById('demo');
  if (!canvas || !canvas.getContext) return;
  var c = canvas.getContext('2d', { alpha: false }); c.textRendering = 'geometricPrecision'; c.fontKerning = 'normal'; c.imageSmoothingQuality = 'high';
  var W = 1280, H = 720, K = 1, DURATION = 22, SLOW = 1;
  var logo = new Image(), ready = false;
  const C={bg:'#071923',panel:'#0e2b3a',ink:'#e5f4f5',muted:'#8eb0c0',teal:'#36c6bc',gold:'#eab96a',blue:'#73aef2'};
  const clamp=x=>Math.max(0,Math.min(1,x));
  const ease=x=>{x=clamp(x);return x*x*(3-2*x)};
  function box(x,y,w,h,r,fill,stroke){c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=1;c.stroke()}}
  function text(s,x,y,size=18,color=C.ink,weight=400,align='left'){c.font=`${weight} ${size}px "Segoe UI", system-ui, sans-serif`;c.textAlign=align;c.fillStyle=color;c.fillText(s,x,y)}
  function line(points,color,width=2){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.stroke()}
  function cargo(x,y,label,color,scale=1){c.save();c.translate(x,y);c.scale(scale,scale);c.shadowColor='#00000055';c.shadowBlur=12;c.shadowOffsetY=5;box(-65,-20,130,40,6,C.panel,color);c.shadowBlur=0;c.shadowOffsetY=0;box(-53,-10,16,20,2,color);line([[-49,-5],[-41,-5]],C.bg,1);line([[-49,0],[-41,0]],C.bg,1);text(label,-28,5,13,C.ink,600);c.restore()}
  function container(x,y,label,folder,color,fillCount){box(x,y,290,100,6,'#123343',color);c.save();c.globalAlpha*=.2;for(let i=16;i<280;i+=17)line([[x+i,y+8],[x+i,y+92]],color,2);c.restore();box(x+14,y+16,212,34,4,C.bg);text(label,x+26,y+39,20,C.ink,600);text(folder,x+15,y+78,14,C.muted);text(String(fillCount).padStart(2,'0'),x+268,y+38,19,color,600,'right');}
  const files=[{name:'invoice.pdf',col:C.gold,to:0},{name:'holiday.jpg',col:C.teal,to:1},{name:'clip.mp4',col:C.blue,to:2},{name:'receipt.pdf',col:C.gold,to:0},{name:'portrait.png',col:C.teal,to:1},{name:'launch.mp4',col:C.blue,to:2}];
  const bins=[{label:'Invoices',path:'Documents / Invoices',color:C.gold,y:247},{label:'Photos',path:'Pictures / Sorted',color:C.teal,y:374},{label:'Videos',path:'Videos / Sorted',color:C.blue,y:501}];
  // Sample rounded bends once so markers and route strokes share the same geometry.
  function roundedRoute(index){
   const points=[[665,460],[744,460],[744,212],[858,212],[858,bins[index].y+50],[914,bins[index].y+50]];
   const sampled=[points[0]];
   for(let i=1;i<points.length-1;i++){
    const before=points[i-1],corner=points[i],after=points[i+1];
    const incoming=Math.hypot(corner[0]-before[0],corner[1]-before[1]);
    const outgoing=Math.hypot(after[0]-corner[0],after[1]-corner[1]);
    const radius=Math.min(18,incoming/2,outgoing/2);
    const a=[corner[0]+(before[0]-corner[0])*radius/incoming,corner[1]+(before[1]-corner[1])*radius/incoming];
    const b=[corner[0]+(after[0]-corner[0])*radius/outgoing,corner[1]+(after[1]-corner[1])*radius/outgoing];
    sampled.push(a);
    for(let j=1;j<=12;j++){const q=j/12;sampled.push([(1-q)**2*a[0]+2*(1-q)*q*corner[0]+q*q*b[0],(1-q)**2*a[1]+2*(1-q)*q*corner[1]+q*q*b[1]]);}
   }
   sampled.push(points.at(-1));return sampled;
  }
  const routes=bins.map((_,i)=>roundedRoute(i));
  
  var sp_cache = {}, sp_K = 0;
  function sprite(key, x, y, w, h, fn) {
    if (sp_K !== K) { sp_cache = {}; sp_K = K; }
    var s = sp_cache[key];
    if (!s) { s = document.createElement("canvas"); var SS = Math.min(K * 2, 4); s.width = Math.ceil(w * SS); s.height = Math.ceil(h * SS);
      var o = s.getContext("2d"); o.textRendering = "geometricPrecision"; o.scale(SS, SS); o.translate(-x, -y);
      var m = c; c = o; try { fn(); } finally { c = m; } sp_cache[key] = s; }
    return s;
  }
  function blit(key, x, y, w, h, fn) { c.drawImage(sprite(key, x, y, w, h, fn), x, y, w, h); }
  function cargoSprite(x, y, label, col, sc) { var sp = sprite("c" + label, -80, -35, 160, 70, function () { cargo(0, 0, label, col, 1); }); c.save(); c.translate(x, y); c.scale(sc, sc); c.drawImage(sp, -80, -35, 160, 70); c.restore(); }
  function render(t){
   c.resetTransform();c.clearRect(0,0,W,H);c.scale(K,K);
   const g=c.createLinearGradient(0,0,1280,720);g.addColorStop(0,'#0c2838');g.addColorStop(1,C.bg);c.fillStyle=g;c.fillRect(0,0,1280,720);
   const glow=c.createRadialGradient(420,310,20,420,310,730);glow.addColorStop(0,'#1a4b5b66');glow.addColorStop(1,'#07192300');c.fillStyle=glow;c.fillRect(0,0,1280,720);
   c.save();c.globalAlpha=.15;line([[64,185],[1218,185]],'#588495',1);c.restore();
   c.save();c.translate(62,35);c.rotate(Math.sin(t*.8)*.045);c.drawImage(logo,-25,-25,50,50);c.restore();text('Deckhand',102,43,25,C.ink,650);text('Put your files to work.',1218,42,18,C.muted,400,'right');
   const phase=t<4?0:t<8?1:t<12.6?2:3;
   const titles=['Less sorting. More getting things done.','You set the rules.','Deckhand handles the cargo.','A place for every file.'];
   const phaseStart=[0,4,8,12.6][phase];const phaseEnd=[4,8,12.6,16.2][phase];const inP=ease((t-phaseStart)/1.4);const titleIn=inP*(1-ease((t-(phaseEnd-.9))/.8));c.save();c.globalAlpha=titleIn;c.translate(0,14*(1-inP));
   const subs=['Turn a crowded Downloads folder into a workflow.','Match the file. Choose its destination. Check before you run.','Deckhand follows your rules and sends each file to its destination.','Preview first. Automate when you’re ready.'];blit("h"+phase,40,84,900,90,()=>{text(titles[phase],62,121,36,C.ink,650);text(subs[phase],64,154,18,C.muted);});c.restore();
   // harbor, sea and dock
   c.fillStyle='#12323f';c.fillRect(0,552,1280,168);
   for(let r=0;r<4;r++){c.beginPath();for(let x=0;x<=1280;x+=4){let y=575+r*34+Math.sin(x/72+t*.8+r)*4;x?c.lineTo(x,y):c.moveTo(x,y)}c.strokeStyle=r%2?'#22505b':'#1c414f';c.lineWidth=1.5;c.stroke()}
   box(889,221,343,407,8,'#0b202a','#254553');line([[905,614],[1218,614]],'#6a7d80',5);for(let x=918;x<1220;x+=65)line([[x,616],[x,662]],'#254553',10);
   const dockIn=ease((t-1.2)/1);c.save();c.globalAlpha=dockIn;
   bins.forEach((b,i)=>{const n=files.filter((f,k)=>f.to===i&&t>=8+k*.55+.8).length;container(915,b.y,b.label,b.path,b.color,n);
   for(let k=0;k<files.length;k++){if(files[k].to!==i)continue;const age=t-(8+k*.55+.8);if(age>=0&&age<.7){c.save();c.globalAlpha=(1-age/.7)*.7;c.shadowColor=b.color;c.shadowBlur=18;box(915-age*3,b.y-age*3,290+age*6,100+age*6,6,null,b.color);c.restore();}}
   });c.restore();
   // ship gently floats. Its anchor lowers beside the bow.
   const bob=Math.sin(t*.85)*1.5;c.save();c.translate(0,bob);blit("ship",60,300,620,260,()=>{
   const hull=c.createLinearGradient(0,461,0,550);hull.addColorStop(0,'#3b6475');hull.addColorStop(.16,'#264d61');hull.addColorStop(1,'#102937');c.fillStyle=hull;c.beginPath();c.moveTo(76,461);c.quadraticCurveTo(300,470,650,457);c.lineTo(619,509);c.quadraticCurveTo(602,540,574,547);c.lineTo(178,547);c.quadraticCurveTo(135,535,76,461);c.closePath();c.fill();
   line([[89,468],[640,465]],'#86b3bd',2);line([[151,526],[607,526]],'#315e70',1);
   for(let x=228;x<586;x+=52){c.beginPath();c.arc(x,488,4,0,Math.PI*2);c.fillStyle='#071e2a';c.fill();c.strokeStyle='#577e8e';c.lineWidth=1;c.stroke();}
   // Bulwark, mooring bollards and bridge details give the hull a readable silhouette.
   line([[92,453],[635,453]],'#557e8e',2);for(let x=226;x<635;x+=41)line([[x,453],[x,465]],'#557e8e',1);
   box(101,453,22,10,2,'#466b7d');box(600,453,20,10,2,'#466b7d');
   line([[94,481],[629,481]],C.teal,3);line([[158,532],[607,532]],'#25556a',2);
   const bridge=c.createLinearGradient(110,0,204,0);bridge.addColorStop(0,'#d2e0db');bridge.addColorStop(1,'#8fa9ad');box(118,400,80,65,3,bridge);box(108,393,101,12,2,'#6a929e');box(134,363,46,30,3,'#31576b');box(142,369,30,10,2,'#8fb4bd');line([[116,403],[202,403]],'#eef3e7',1);box(176,438,12,27,1,'#4b7480');
   for(let x=130;x<190;x+=22){box(x,414,14,15,2,'#183b50');line([[x+2,416],[x+11,416]],'#8eb7c5',1);}line([[145,363],[145,319]],C.muted,2);c.fillStyle=C.teal;c.beginPath();c.moveTo(146,320);c.lineTo(179,327);c.lineTo(146,336);c.fill();
   text('DECKHAND',230,513,18,'#d6eced',650);text('Downloads',489,512,16,C.muted,400,'center');});
   // anchor on right of ship
 const drop=ease((t-.6)/1.6)*40;const ay=506+drop;
 line([[617,480],[617,ay-4]],C.muted,1.6);
 c.save();c.translate(617,ay);c.rotate(Math.sin(t*1.1)*.06);c.scale(.62,.62);c.strokeStyle=C.muted;c.lineWidth=4.5;c.lineCap='round';c.lineJoin='round';
 c.beginPath();c.arc(0,0,6,0,Math.PI*2);c.moveTo(0,6);c.lineTo(0,48);c.moveTo(-14,16);c.lineTo(14,16);
 c.moveTo(-22,36);c.quadraticCurveTo(-20,52,0,54);c.quadraticCurveTo(20,52,22,36);
 c.moveTo(-28,42);c.lineTo(-22,34);c.lineTo(-14,40);c.moveTo(28,42);c.lineTo(22,34);c.lineTo(14,40);c.stroke();c.restore();
 if(t>1.8){for(let b=0;b<4;b++){const ph=(t*.28+b*.25)%1;const bx=617+(b%2?12:-12)+Math.sin(t*2+b*2)*3,by=ay+30-ph*58;c.save();c.globalAlpha=Math.sin(Math.PI*ph)*.85*ease((t-1.8)/.6);c.strokeStyle=C.teal;c.lineWidth=1.3;c.beginPath();c.arc(bx,by,2+(b%3)*.8,0,Math.PI*2);c.stroke();c.restore();}}
   files.forEach((f,k)=>{const x=290+(k%3)*138,y=441-Math.floor(k/3)*47;const start=8+k*.55;const op=(1-ease((t-start-.55)/.3))*ease((t-.5-k*.14)/.7);c.save();c.globalAlpha=op;cargoSprite(x,y,f.name,f.col,.94);c.restore();});c.restore();
   // Each pulse follows exactly the visible orthogonal route. Cargo never leaves the deck.
   if(t>=7.7){const op=ease((t-7.7)/.7);const route=(idx)=>routes[idx];
   c.save();c.globalAlpha=op*.65;for(let i=0;i<3;i++)line(route(i),'#3c6475',1.5);c.restore();
   for(let k=0;k<files.length;k++){const f=files[k],p=clamp((t-(8+k*.55))/.8);if(p<=0||p>=1)continue;const pts=route(f.to),lengths=pts.slice(1).map((v,i)=>Math.hypot(v[0]-pts[i][0],v[1]-pts[i][1]));let distance=p*lengths.reduce((a,b)=>a+b,0),pos=pts[0];for(let i=0;i<lengths.length;i++){if(distance<=lengths[i]){const q=distance/lengths[i];pos=[pts[i][0]+(pts[i+1][0]-pts[i][0])*q,pts[i][1]+(pts[i+1][1]-pts[i][1])*q];break;}distance-=lengths[i];}
   c.save();c.shadowBlur=14;c.shadowColor=f.col;c.fillStyle=f.col;c.beginPath();c.arc(pos[0],pos[1],4,0,Math.PI*2);c.fill();c.restore();}
   }
   // rule preview cards above ship
   if(t>=3.8&&t<8){let op=ease((t-3.8)/.5)*(1-ease((t-7.6)/.4));c.save();c.globalAlpha=op;box(248,214,537,112,10,C.panel,'#31515f');text('PREVIEW',268,241,12,C.teal,650);text('PDFs → Invoices   ·   Images → Photos   ·   Video → Videos',268,271,15,C.ink,600);text('6 files checked',268,302,14,C.muted);text('Nothing changed yet',762,302,14,C.gold,400,'right');c.restore();}
   // status ribbon
   const sorted=files.filter((f,k)=>t>=8+k*.55+.8).length;
   box(64,638,790,47,8,'#0c2633','#2b4956');
   c.beginPath();c.arc(85,661,4,0,Math.PI*2);c.fillStyle=phase<2?C.gold:C.teal;c.fill();
   text(phase===0?'Watch folder selected':phase===1?'Preview ready · 6 files would move':sorted<6?`Organising cargo · ${sorted} of 6 files moved`:'All cargo sorted · 6 files moved',102,667,16,C.ink,500);
   // The closing brand frame replaces the scene, leaving every route unobstructed.
   if(t>=16){
    const fade=ease((t-16)/1);c.save();c.globalAlpha=fade;
    const closing=c.createLinearGradient(0,0,1280,720);closing.addColorStop(0,'#102f40');closing.addColorStop(1,'#071923');c.fillStyle=closing;c.fillRect(0,0,1280,720);
    const lift=ease((t-16.4)/.9);c.translate(0,12*(1-lift));
    blit("close",300,120,680,360,()=>{c.drawImage(logo,588,138,104,104);text('Deckhand',640,308,49,C.ink,650,'center');
    text('Put your files to work.',640,363,32,C.teal,500,'center');
    text('Preview your rules. Let Deckhand take it from there.',640,410,19,C.muted,400,'center');
    line([[540,453],[740,453]],'#345566',1);});
  
  
    for(let r=0;r<3;r++){c.beginPath();for(let x=0;x<=1280;x+=5){const y=625+r*28+Math.sin(x/120+t*.6+r)*5;x?c.lineTo(x,y):c.moveTo(x,y)}c.strokeStyle='#245363';c.lineWidth=1;c.stroke();}
    c.restore();
   }
  
  }
  
  function fit() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.max(640, Math.min(2048, Math.round(canvas.clientWidth * dpr)));
    if (canvas.width !== w) { canvas.width = w; canvas.height = Math.round(w * 9 / 16); K = w / W; }
    K = canvas.width / W;
  }
  function veil(t) { var a = t > 21.2 ? (t - 21.2) / .8 : t < .7 ? 1 - t / .7 : 0; if (a > 0) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = Math.min(1, a); c.fillStyle = "#071923"; c.fillRect(0, 0, canvas.width, canvas.height); c.restore(); } }
  var raf = 0, t0 = 0, last = 0, inView = false;
  function frame(now) {
    raf = requestAnimationFrame(frame);

    last = now;
    var tt = ((now - t0) / 1000 / SLOW) % DURATION; render(tt); veil(tt);
  }
  function start() { if (raf || !ready) return; fit(); t0 = performance.now(); raf = requestAnimationFrame(frame); }
  function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; }
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.__dhRender = function (t) { fit(); render(t); };
  logo.onload = function () {
    ready = true; fit(); render(12.5);
    if (reduce || !('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (es) { es.forEach(function (e) { inView = e.isIntersecting; if (inView && !document.hidden) start(); else stop(); }); }, { threshold: 0.3 }).observe(canvas);
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else if (inView) start(); });
    window.addEventListener('resize', function () { fit(); if (!raf) render(12.5); });
  };
  logo.src = 'deckhand-mark.svg';
})();

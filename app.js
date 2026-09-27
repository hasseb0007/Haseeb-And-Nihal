(() => {
 'use strict';
 const root=document.documentElement,body=document.body;
 const language=document.querySelector('#language');
 const sound=document.querySelector('#sound');
 const dialog=document.querySelector('#details-dialog');
 const celebrate=document.querySelector('#celebrate');
 const canvas=document.querySelector('#stardust');
 const ctx=canvas.getContext('2d');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n));
 const stored=key=>{try{return localStorage.getItem(key);}catch{return null;}};
 const save=(key,value)=>{try{localStorage.setItem(key,value);}catch{}};
 let lang=stored('invitation-language')==='ur'?'ur':'en';
 let paused=reduced.matches;
 let soundBusy=false;
 let soundOn=false;
 let autoStartPending=true;
 const music=INVITATION.music||{};
 const audio=new Audio();
 audio.preload='auto';audio.loop=true;
 audio.volume=clamp(Number.isFinite(music.volume)?music.volume:.35);
 if(music.src)audio.src=music.src;
 audio.addEventListener('pause',()=>{soundOn=false;updateLabels();});
 audio.addEventListener('error',()=>{soundOn=false;updateLabels();document.querySelector('#audio-status').textContent=INVITATION[lang].audioError;});
 let width=innerWidth,height=innerHeight,lastFrame=0,frameId=0,dirty=true;
 let pointer={x:0,y:0},camera={x:0,y:0},metrics={};
 let motes=[],sparks=[],celebrationTimer=null;
 let heroProgress=0,sceneProgress=0,dateRevealed=false;
 const chapters=[...document.querySelectorAll('.chapter')];
 root.classList.add('js');
 function updateLabels(){
  const copy=INVITATION[lang];
  sound.setAttribute('aria-label',copy[soundOn?'pause':'play']);
  sound.setAttribute('aria-pressed',String(soundOn));
  sound.querySelector('[data-sound-label]').textContent=copy[soundOn?'pause':'play'];
 }
 function translate(){
  const copy=INVITATION[lang];
  root.lang=lang;root.dir=lang==='ur'?'rtl':'ltr';document.title=copy.title;
  document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=copy[el.dataset.i18n]);
  document.querySelectorAll('[data-label]').forEach(el=>el.setAttribute('aria-label',copy[el.dataset.label]));
  language.textContent=copy.language;language.lang=lang==='en'?'ur':'en';language.setAttribute('aria-label',copy.languageLabel);
  updateLabels();measure();
 }
 function measure(){
  width=innerWidth;height=innerHeight;
  const y=scrollY;
  const bounds=selector=>{const el=document.querySelector(selector),r=el.getBoundingClientRect();return {top:r.top+y,height:r.height};};
  metrics={hero:bounds('#home'),between:bounds('.between'),walima:bounds('#walima'),rsvp:bounds('#rsvp'),total:Math.max(1,document.documentElement.scrollHeight-height)};
  chapters.forEach(el=>{const r=el.getBoundingClientRect();el._scene={top:r.top+y,height:r.height,steps:[...el.querySelectorAll('.event-step')]};});
  dirty=true;requestFrame();
 }
 function seedCanvas(){
  if(!ctx)return;
  const dpr=Math.min(devicePixelRatio||1,1.8);
  canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  motes=Array.from({length:width<600?28:65},()=>({x:Math.random()*width,y:Math.random()*height,r:Math.random()*1.3+.3,speed:Math.random()*.16+.04,phase:Math.random()*Math.PI*2}));
 }
 function updateScene(){
  const y=scrollY;
  const target=clamp(y/Math.max(metrics.hero.height*.45,1));
  heroProgress=paused?0:heroProgress+(target-heroProgress)*.13;
  sceneProgress=clamp(y/metrics.total);
  root.style.setProperty('--progress',sceneProgress.toFixed(4));
  root.style.setProperty('--hero-progress',heroProgress.toFixed(4));
  const bridge=clamp((y-metrics.between.top+height*.15)/Math.max(metrics.between.height-height*.7,1));
  // Trigger a complete transition, independent of whether scrolling stops.
  // Reset only after leaving the chapter above, so small scroll reversals cannot interrupt it.
  if(y>=metrics.between.top-height*.18)dateRevealed=true;
  else if(y<metrics.between.top-height*.85)dateRevealed=false;
  root.style.setProperty('--day-change',dateRevealed?'1':'0');
  root.style.setProperty('--warmth',(bridge*.42).toFixed(3));
  const shade=.28+Math.min(target,1)*.29-(bridge*.035);
  root.style.setProperty('--shade',shade.toFixed(3));
  body.classList.toggle('scrolled',y>40);
  if(!paused){
   camera.x+=(pointer.x-camera.x)*.035;camera.y+=(pointer.y-camera.y)*.035;
   root.style.setProperty('--scene-x',(camera.x*10)+'px');
   root.style.setProperty('--scene-y',(-sceneProgress*22+camera.y*7)+'px');
   root.style.setProperty('--scene-scale',(1.035+sceneProgress*.055).toFixed(4));
  }
  chapters.forEach(el=>{
   const m=el._scene;
   const pinned=width>900&&height>=820&&!paused;
   const progress=pinned?clamp((y-m.top+115)/Math.max(m.height-height*.8,1)):clamp((y-m.top+height*.4)/m.height);
   el.style.setProperty('--chapter-progress',progress.toFixed(4));
   const current=Math.min(m.steps.length-1,Math.floor(progress*m.steps.length));
   m.steps.forEach((step,i)=>step.classList.toggle('is-active',i===current));
   el.querySelectorAll('[data-stage]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.stage)===current)));
  });
  document.querySelectorAll('nav a').forEach(a=>{
   const section=a.hash==='#barat'?chapters[0]:chapters[1];const m=section._scene;
   if(y+height*.4>=m.top&&y+height*.4<m.top+m.height)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');
  });
  dirty=false;
 }
 function draw(now,dt){
  if(!ctx||paused)return;
  ctx.clearRect(0,0,width,height);
  for(const p of motes){
   p.y-=p.speed*dt;if(p.y< -10)p.y=height+10;
   const x=p.x+Math.sin(now*.0002+p.phase)*15+pointer.x*8;
   const alpha=(.18+.2*Math.sin(now*.0008+p.phase)**2);
   ctx.fillStyle=`rgba(244,219,175,${alpha})`;ctx.beginPath();ctx.arc(x,p.y,p.r,0,Math.PI*2);ctx.fill();
  }
  sparks=sparks.filter(p=>p.life>0);
  for(const p of sparks){
   p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=.012*dt;p.vx*=Math.pow(.991,dt);p.life-=.009*dt;
   ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rotation+=p.spin*dt);
   ctx.globalAlpha=clamp(p.life);ctx.fillStyle=p.color;
   ctx.beginPath();ctx.moveTo(0,-p.size);ctx.lineTo(p.size*.35,0);ctx.lineTo(0,p.size);ctx.lineTo(-p.size*.35,0);ctx.closePath();ctx.fill();ctx.restore();
  }
 }
 function requestFrame(){if(!frameId&&!document.hidden)frameId=requestAnimationFrame(frame);}
 function frame(now){
  frameId=0;if(document.hidden)return;
  if(now-lastFrame<30){requestFrame();return;}
  const dt=Math.min((now-lastFrame)/16.67,3);lastFrame=now;
  if(dirty||!paused)updateScene();
  if(!paused)draw(now,dt);
  if(!paused)requestFrame();
 }
 function applyMotion(){
  paused=reduced.matches;
  body.classList.toggle('motion-paused',paused);
  if(paused){document.getAnimations().forEach(a=>a.cancel());sparks=[];if(ctx)ctx.clearRect(0,0,width,height);}
  updateLabels();measure();
 }
 function finishAutoStart(){
  autoStartPending=false;
  document.removeEventListener('click',startOnInteraction);
  document.removeEventListener('keydown',startOnInteraction);
 }
 async function tryAutoStart(){
  if(!autoStartPending||!music.src||document.hidden||soundBusy)return;
  soundBusy=true;
  try{await setSound(true);}finally{soundBusy=false;}
 }
 function startOnInteraction(event){
  if(!event.isTrusted||sound.contains(event.target)||event.metaKey||event.ctrlKey||event.altKey)return;
  void tryAutoStart();
 }
 async function setSound(enabled){
  if(!enabled){audio.pause();soundOn=false;updateLabels();return;}
  if(!music.src)return;
  try{
   document.querySelector('#audio-status').textContent='';
   await audio.play();
   if(document.hidden){audio.pause();return;}
   soundOn=true;finishAutoStart();updateLabels();
  }catch(error){soundOn=false;updateLabels();if(error.name!=='NotAllowedError')document.querySelector('#audio-status').textContent=INVITATION[lang].audioError;}
 }
 function burst(){
  const status=document.querySelector('#celebration-status');status.textContent=INVITATION[lang].celebrated;
  const group=document.querySelector('.celebration');group.classList.add('bloomed');
  clearTimeout(celebrationTimer);celebrationTimer=setTimeout(()=>group.classList.remove('bloomed'),1800);
  if(paused)return;
  const rect=celebrate.getBoundingClientRect(),cx=rect.left+rect.width/2,cy=rect.top+rect.height/2;
  for(let i=0;i<(width<600?100:160);i++){
   const angle=Math.PI*2*Math.random(),speed=1.5+Math.random()*4.5;
   sparks.push({x:cx,y:cy,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed-2.1,life:.75+Math.random()*.8,size:2+Math.random()*3,rotation:Math.random()*6,spin:(Math.random()-.5)*.06,color:i%3?'#efd3a9':'#f4f1e5'});
  }
  sparks=sparks.slice(-400);requestFrame();
 }
 language.hidden=false;sound.hidden=!music.src;celebrate.hidden=false;
 document.querySelectorAll('[data-open-details]').forEach(button=>{
  button.hidden=false;button.addEventListener('click',()=>{dialog.showModal();body.classList.add('dialog-open');});
 });
 chapters.forEach(chapter=>{
  const controls=chapter.querySelector('.stage-controls');if(!controls)return;
  controls.hidden=false;
  controls.querySelectorAll('[data-stage]').forEach(button=>button.addEventListener('click',()=>{
   const m=chapter._scene,i=Number(button.dataset.stage);
   const progress=(i+.2)/m.steps.length;
   window.scrollTo({top:m.top-115+progress*Math.max(m.height-height*.8,1),behavior:paused?'instant':'smooth'});
  }));
 });
 document.querySelector('#close-details').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>{body.classList.remove('dialog-open');measure();});
 dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
 language.addEventListener('click',()=>{lang=lang==='en'?'ur':'en';translate();save('invitation-language',lang);});
 sound.addEventListener('click',async()=>{finishAutoStart();if(soundBusy)return;soundBusy=true;try{await setSound(!soundOn);}finally{soundBusy=false;}});
 reduced.addEventListener('change',applyMotion);
 celebrate.addEventListener('click',burst);
 addEventListener('scroll',()=>{dirty=true;requestFrame();},{passive:true});
 addEventListener('pointermove',e=>{if(e.pointerType==='mouse'&&!paused){pointer.x=(e.clientX/width-.5)*2;pointer.y=(e.clientY/height-.5)*2;}},{passive:true});
 addEventListener('resize',()=>{measure();seedCanvas();},{passive:true});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frameId);frameId=0;if(soundOn)setSound(false);}else{lastFrame=performance.now();measure();void tryAutoStart();}});
 if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){if(!paused&&(!entry.target.classList.contains('event-step')||width<=900||height<820))entry.target.animate([{opacity:.2,transform:'translateY(40px)',filter:'blur(4px)'},{opacity:1,transform:'translateY(0)',filter:'blur(0)'}],{duration:1100,easing:'cubic-bezier(.16,1,.3,1)'});observer.unobserve(entry.target);}}),{threshold:.16});
  document.querySelectorAll('.reveal,.chapter-heading,.contact,.event-step').forEach(el=>observer.observe(el));
 }
 translate();seedCanvas();applyMotion();
 if(!paused){
  document.querySelectorAll('.name').forEach((el,i)=>el.animate([{opacity:0,filter:'blur(12px)'},{opacity:1,filter:'blur(0)'}],{duration:1700,delay:100+i*150,easing:'cubic-bezier(.16,1,.3,1)'}));
 }
 document.fonts.ready.then(measure);
 document.addEventListener('click',startOnInteraction);
 document.addEventListener('keydown',startOnInteraction);
 void tryAutoStart();
})();

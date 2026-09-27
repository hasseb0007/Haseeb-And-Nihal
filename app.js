(() => {
 'use strict';
 const root=document.documentElement,body=document.body;
 const language=document.querySelector('#language');
 const sound=document.querySelector('#sound');
 const motion=document.querySelector('#motion');
 const dialog=document.querySelector('#details-dialog');
 const celebrate=document.querySelector('#celebrate');
 const canvas=document.querySelector('#stardust');
 const ctx=canvas.getContext('2d');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n));
 const stored=key=>{try{return localStorage.getItem(key);}catch{return null;}};
 const save=(key,value)=>{try{localStorage.setItem(key,value);}catch{}};
 let lang=stored('invitation-language')==='ur'?'ur':'en';
 let userPaused=stored('invitation-motion')==='paused';
 let paused=reduced.matches||userPaused;
 let soundBusy=false;
 let soundOn=false,audioContext=null,audioMaster=null,soundTimer=null,noteIndex=0;
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
  motion.setAttribute('aria-label',copy[paused?'motionResume':'motion']);
  motion.setAttribute('aria-pressed',String(paused));
  motion.querySelector('[data-motion-label]').textContent=copy[paused?'motionResume':'motion'];
  motion.querySelector('[data-motion-icon]').textContent=paused?'▷':'Ⅱ';
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
  paused=reduced.matches||userPaused;
  motion.hidden=reduced.matches;
  body.classList.toggle('motion-paused',paused);
  if(paused){document.getAnimations().forEach(a=>a.cancel());sparks=[];if(ctx)ctx.clearRect(0,0,width,height);}
  updateLabels();measure();
 }
 function chime(freq,delay=0){
  if(!audioContext||!soundOn)return;
  const start=audioContext.currentTime+delay;
  const gain=audioContext.createGain(),osc=audioContext.createOscillator(),harmonic=audioContext.createOscillator(),soft=audioContext.createGain();
  gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(.17,start+.025);gain.gain.exponentialRampToValueAtTime(.0001,start+3.5);
  osc.type='sine';osc.frequency.value=freq;harmonic.type='sine';harmonic.frequency.value=freq*2;soft.gain.value=.13;
  osc.connect(gain);harmonic.connect(soft);soft.connect(gain);gain.connect(audioMaster);
  osc.start(start);harmonic.start(start);osc.stop(start+3.6);harmonic.stop(start+3.6);
  osc.onended=()=>{osc.disconnect();harmonic.disconnect();soft.disconnect();gain.disconnect();};
 }
 function phrase(){
  if(!soundOn)return;
  // Original sparse major-pentatonic chimes. No recordings or external audio.
  const melody=[523.25,659.25,783.99,587.33,880,783.99,659.25,587.33];
  chime(melody[noteIndex++%melody.length]);
  soundTimer=setTimeout(phrase,4200);
 }
 async function setSound(enabled){
  if(!enabled){soundOn=false;clearTimeout(soundTimer);if(audioContext)await audioContext.suspend();updateLabels();return;}
  try{
   const Audio=window.AudioContext||window.webkitAudioContext;
   if(!Audio)throw Error('No Web Audio');
   if(!audioContext){audioContext=new Audio();audioMaster=audioContext.createGain();audioMaster.gain.value=.23;audioMaster.connect(audioContext.destination);}
   await audioContext.resume();soundOn=true;updateLabels();phrase();
  }catch{soundOn=false;updateLabels();document.querySelector('#audio-status').textContent=INVITATION[lang].audioError;}
 }
 function burst(){
  const status=document.querySelector('#celebration-status');status.textContent=INVITATION[lang].celebrated;
  const group=document.querySelector('.celebration');group.classList.add('bloomed');
  clearTimeout(celebrationTimer);celebrationTimer=setTimeout(()=>group.classList.remove('bloomed'),1800);
  if(soundOn){chime(523.25);chime(659.25,.16);chime(783.99,.32);chime(1046.5,.55);}
  if(paused)return;
  const rect=celebrate.getBoundingClientRect(),cx=rect.left+rect.width/2,cy=rect.top+rect.height/2;
  for(let i=0;i<(width<600?100:160);i++){
   const angle=Math.PI*2*Math.random(),speed=1.5+Math.random()*4.5;
   sparks.push({x:cx,y:cy,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed-2.1,life:.75+Math.random()*.8,size:2+Math.random()*3,rotation:Math.random()*6,spin:(Math.random()-.5)*.06,color:i%3?'#efd3a9':'#f4f1e5'});
  }
  sparks=sparks.slice(-400);requestFrame();
 }
 language.hidden=false;sound.hidden=false;motion.hidden=false;celebrate.hidden=false;
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
 sound.addEventListener('click',async()=>{if(soundBusy)return;soundBusy=true;try{await setSound(!soundOn);}finally{soundBusy=false;}});
 motion.addEventListener('click',()=>{if(reduced.matches){userPaused=true;}else{userPaused=!userPaused;}save('invitation-motion',userPaused?'paused':'playing');applyMotion();});
 reduced.addEventListener('change',applyMotion);
 celebrate.addEventListener('click',burst);
 addEventListener('scroll',()=>{dirty=true;requestFrame();},{passive:true});
 addEventListener('pointermove',e=>{if(e.pointerType==='mouse'&&!paused){pointer.x=(e.clientX/width-.5)*2;pointer.y=(e.clientY/height-.5)*2;}},{passive:true});
 addEventListener('resize',()=>{measure();seedCanvas();},{passive:true});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frameId);frameId=0;if(soundOn)setSound(false);}else{lastFrame=performance.now();measure();}});
 if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){if(!paused&&(!entry.target.classList.contains('event-step')||width<=900||height<820))entry.target.animate([{opacity:.2,transform:'translateY(40px)',filter:'blur(4px)'},{opacity:1,transform:'translateY(0)',filter:'blur(0)'}],{duration:1100,easing:'cubic-bezier(.16,1,.3,1)'});observer.unobserve(entry.target);}}),{threshold:.16});
  document.querySelectorAll('.reveal,.chapter-heading,.contact,.event-step').forEach(el=>observer.observe(el));
 }
 translate();seedCanvas();applyMotion();
 if(!paused){
  document.querySelectorAll('.name').forEach((el,i)=>el.animate([{opacity:0,filter:'blur(12px)'},{opacity:1,filter:'blur(0)'}],{duration:1700,delay:100+i*150,easing:'cubic-bezier(.16,1,.3,1)'}));
 }
 document.fonts.ready.then(measure);
})();

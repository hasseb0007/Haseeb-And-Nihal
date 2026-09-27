(() => {
 const language=document.querySelector('#language'), music=document.querySelector('#music'), audio=document.querySelector('#soundtrack');
 let lang='en';
 try {if(localStorage.getItem('invitation-language')==='ur') lang='ur';}catch{}
 const updateMusic=()=>{music.setAttribute('aria-pressed',String(!audio.paused));music.querySelector('[data-music-label]').textContent=INVITATION[lang][audio.paused?'play':'pause'];};
 function translate(){
  const copy=INVITATION[lang];
  document.documentElement.lang=lang;document.documentElement.dir=lang==='ur'?'rtl':'ltr';document.title=copy.title;
  document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=copy[el.dataset.i18n]);
  document.querySelectorAll('[data-label]').forEach(el=>el.setAttribute('aria-label',copy[el.dataset.label]));
  language.textContent=copy.language;language.lang=lang==='en'?'ur':'en';language.setAttribute('aria-label',copy.languageLabel);
  document.querySelector('nav').setAttribute('aria-label',lang==='ur'?'تقریبات':'Celebrations');
  updateMusic();
 }
 language.hidden=false;music.hidden=false;translate();
 language.addEventListener('click',()=>{lang=lang==='en'?'ur':'en';translate();try{localStorage.setItem('invitation-language',lang);}catch{}});
 audio.volume=.28;
 music.addEventListener('click',async()=>{if(!audio.paused){audio.pause();return;}try{document.querySelector('#audio-status').textContent='';await audio.play();}catch{document.querySelector('#audio-status').textContent=INVITATION[lang].audioError;}updateMusic();});
 audio.addEventListener('play',updateMusic);audio.addEventListener('pause',updateMusic);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 if('IntersectionObserver' in window){
  const reveal=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){if(!reduced.matches)e.target.animate([{opacity:.25,transform:'translateY(25px)'},{opacity:1,transform:'translateY(0)'}],{duration:850,easing:'cubic-bezier(.2,.7,.2,1)'});reveal.unobserve(e.target);}}),{threshold:.1});
  document.querySelectorAll('.invitation,.event-intro,.event-details,.rsvp h2,.contacts').forEach(el=>reveal.observe(el));
  const active=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){document.querySelectorAll('nav a').forEach(a=>{if(a.hash==='#'+e.target.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}}),{rootMargin:'-20% 0px -45% 0px'});
  document.querySelectorAll('#home,#barat,#walima,#rsvp').forEach(el=>active.observe(el));
 }
 reduced.addEventListener('change',()=>{if(reduced.matches)document.getAnimations().forEach(a=>a.cancel());});
})();

/* Handy-Menü: öffnet ohne Skript, das Skript schließt es nur wieder */
(function(){var m=document.querySelector('.menue');if(!m)return;
m.addEventListener('click',function(e){if(e.target.closest('.menue-liste a'))m.removeAttribute('open');});
document.addEventListener('click',function(e){if(m.open&&!m.contains(e.target))m.removeAttribute('open');});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&m.open){m.removeAttribute('open');m.querySelector('summary').focus();}});
window.matchMedia('(min-width:901px)').addEventListener('change',function(){m.removeAttribute('open');});})();

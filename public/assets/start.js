(function(){
  var ruhig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var wurzel = document.documentElement;
  if (ruhig) wurzel.classList.add('ruhig');
  function klemm(v,a,b){ return Math.min(b, Math.max(a, v)); }
  function ease(t){ t = klemm(t,0,1); return t*t*(3-2*t); }
  function easeOut(t){ t = klemm(t,0,1); return 1 - Math.pow(1 - t, 3); }

  /* Überschriften in Wort-Masken zerlegen und beim Erscheinen aufziehen */
  if (!ruhig && 'IntersectionObserver' in window){
    document.querySelectorAll('[data-zeigen]').forEach(function(el){
      (function teile(knoten){
        Array.prototype.slice.call(knoten.childNodes).forEach(function(k){
          if (k.nodeType === 3){
            var frag = document.createDocumentFragment();
            k.textContent.split(/(\s+)/).forEach(function(teil){
              if (!teil) return;
              if (/^\s+$/.test(teil)){ frag.appendChild(document.createTextNode(teil)); return; }
              var w = document.createElement('span'); w.className = 'w';
              var i = document.createElement('span'); i.textContent = teil; w.appendChild(i); frag.appendChild(w);
            });
            k.parentNode.replaceChild(frag, k);
          } else if (k.nodeType === 1){ teile(k); }
        });
      })(el);
    });
    wurzel.classList.add('bewegt');
    var io = new IntersectionObserver(function(eintraege){
      eintraege.forEach(function(e){ if (e.isIntersecting){ e.target.classList.add('da'); io.unobserve(e.target); } });
    }, {rootMargin:'0px 0px -12% 0px'});
    document.querySelectorAll('[data-zeigen],[data-bild]').forEach(function(el){ io.observe(el); });
  }

  /* Weite: Bild wächst beim Scrollen auf volle Breite */
  var weite = document.getElementById('weite');
  var buehne = document.getElementById('weite-buehne');
  var wZiel = 0, wIst = 0, wLauf = false;
  function weiteP(){
    var top = weite.getBoundingClientRect().top - parseFloat(getComputedStyle(buehne).top);
    var weg = weite.offsetHeight - buehne.offsetHeight;
    return klemm(-top / Math.max(1, weg), 0, 1);
  }
  function weiteZeichnen(p){
    var W = buehne.clientWidth, H = buehne.clientHeight;
    var schmal = W < 700;
    var w0 = schmal ? W * 0.62 : Math.min(W * 0.36, 520), h0 = schmal ? H * 0.42 : H * 0.56;
    var g = easeOut(p / 0.8);
    var w = w0 + (W - w0) * g, h = h0 + (H - h0) * g;
    var s = buehne.style;
    s.setProperty('--ix', ((W - w) / 2).toFixed(1) + 'px');
    s.setProperty('--iy', ((H - h) / 2).toFixed(1) + 'px');
    s.setProperty('--ir', (3 * (1 - g)).toFixed(2) + 'px');
    s.setProperty('--is', (1.25 - 0.25 * g).toFixed(4));
    s.setProperty('--wx', ((schmal ? H * 0.3 : W * 0.34) * ease((p - 0.03) / 0.5)).toFixed(1) + 'px');
    s.setProperty('--ib', (0.62 + 0.38 * ease(p / 0.45)).toFixed(3));
    s.setProperty('--wo', (1 - ease((p - 0.12) / 0.3)).toFixed(3));
    s.setProperty('--io', ease((p - 0.45) / 0.35).toFixed(3));
    s.setProperty('--to', ease((p - 0.62) / 0.28).toFixed(3));
  }
  function weiteSchleife(){
    wIst += (wZiel - wIst) * 0.14;
    if (Math.abs(wZiel - wIst) < 0.0005){ wIst = wZiel; wLauf = false; }
    weiteZeichnen(wIst);
    if (wLauf) requestAnimationFrame(weiteSchleife);
  }

  /* Projektstapel: Karten liegen rechts gestapelt und gleiten beim Scrollen nach links über die Sektion */
  var sektion = document.getElementById('baustellen');
  var stapel = document.getElementById('stapel');
  var karten = Array.prototype.slice.call(stapel.querySelectorAll('.karte'));
  var n = karten.length;
  var zAkt = document.getElementById('z-aktuell');
  var balken = document.getElementById('balken');
  var btnZ = document.getElementById('zurueck');
  var btnW = document.getElementById('weiter');
  var ziel = 0, ist = 0, laeuft = false;

  function fortschritt(){
    var r = sektion.getBoundingClientRect();
    var weg = sektion.offsetHeight - window.innerHeight;
    return klemm(-r.top / Math.max(1, weg), 0, 1) * (n - 1);
  }
  function zeichnen(p){
    var breite = stapel.clientWidth;
    var kb = karten[0].offsetWidth;
    var rest = Math.max(0, breite - kb);
    var schritt = Math.min(64, rest / 4 + 18);
    for (var i = 0; i < n; i++){
      var d = i - p, x, s, rot, o, z;
      if (d >= 0){
        x = rest * 0.55 * ease(Math.min(d,1)) + Math.max(0, d - 1) * schritt;
        s = 1 - Math.min(d, 4) * 0.045;
        rot = Math.min(d, 4) * 1.6;
        o = d > 4 ? 0 : 1;
        z = 100 - i;
      } else {
        var w = Math.min(1, -d);
        x = -w * (kb + 120);
        s = 1 - w * 0.08;
        rot = -w * 6;
        o = 1 - w;
        z = 100 + i;
      }
      karten[i].style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0) rotate(' + rot.toFixed(2) + 'deg) scale(' + s.toFixed(3) + ')';
      karten[i].style.opacity = o.toFixed(3);
      karten[i].querySelector('.karte-text').style.opacity = d > 0 ? Math.max(0, 1 - (d - 0.15) / 0.45).toFixed(3) : 1;
      karten[i].style.zIndex = z;
      karten[i].setAttribute('aria-hidden', Math.abs(d) < .5 ? 'false' : 'true');
    }
    var akt = Math.round(p);
    zAkt.textContent = akt + 1;
    balken.style.width = (p / (n - 1) * 100).toFixed(2) + '%';
    btnZ.disabled = akt <= 0;
    btnW.disabled = akt >= n - 1;
  }
  function schleife(){
    ist += (ziel - ist) * 0.12;
    if (Math.abs(ziel - ist) < 0.001){ ist = ziel; laeuft = false; }
    zeichnen(ist);
    if (laeuft) requestAnimationFrame(schleife);
  }
  function springe(k){
    k = klemm(k, 0, n - 1);
    if (ruhig){
      karten[k].scrollIntoView({behavior:'auto', inline:'start', block:'nearest'});
      zAkt.textContent = k + 1; btnZ.disabled = k <= 0; btnW.disabled = k >= n - 1;
      return;
    }
    var weg = sektion.offsetHeight - window.innerHeight;
    var top = sektion.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({top: top + weg * (k / (n - 1)) + 1, behavior:'smooth'});
  }
  btnZ.addEventListener('click', function(){ springe(Math.round(ruhig ? +zAkt.textContent - 1 : ist) - 1); });
  btnW.addEventListener('click', function(){ springe(Math.round(ruhig ? +zAkt.textContent - 1 : ist) + 1); });

  /* Navigation: aktiver Bereich */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav>a:not(.knopf)'));
  var bereiche = navLinks.map(function(a){ return document.getElementById(a.getAttribute('href').slice(1)); });
  function navMarkieren(){
    var mitte = window.innerHeight * 0.4, aktiv = -1;
    bereiche.forEach(function(b, i){ if (!b) return; var r = b.getBoundingClientRect(); if (r.top < mitte && r.bottom > mitte) aktiv = i; });
    navLinks.forEach(function(a, i){ a.classList.toggle('aktiv', i === aktiv); });
  }

  function beimScrollen(){
    if (!ruhig){
      ziel = fortschritt(); if (!laeuft){ laeuft = true; requestAnimationFrame(schleife); }
      wZiel = weiteP(); if (!wLauf){ wLauf = true; requestAnimationFrame(weiteSchleife); }
    }
    navMarkieren();
  }
  window.addEventListener('scroll', beimScrollen, {passive:true});
  window.addEventListener('resize', function(){
    if (ruhig) return;
    ist = ziel = fortschritt(); zeichnen(ist);
    wIst = wZiel = weiteP(); weiteZeichnen(wIst);
  });
  if (!ruhig){ ist = ziel = fortschritt(); zeichnen(ist); wIst = wZiel = weiteP(); weiteZeichnen(wIst); }
  else { btnZ.disabled = true; }
  navMarkieren();

  /* E-Mail kopieren */
  var kopierKnopf = document.getElementById('kopieren');
  kopierKnopf.addEventListener('click', function(){
    function ok(){ kopierKnopf.textContent = 'Kopiert'; setTimeout(function(){ kopierKnopf.textContent = 'Kopieren'; }, 1800); }
    function auswahl(){ var r = document.createRange(); r.selectNodeContents(document.getElementById('mail')); var s = getSelection(); s.removeAllRanges(); s.addRange(r); }
    try { navigator.clipboard.writeText('holz@lemmle.net').then(ok, auswahl); } catch(e){ auswahl(); }
  });


  /* Versand an die Netlify-Funktion: eine Adresse für Anfrage und Bewerbung */
  function senden(fd, knopf, fehlerZeile, fertig){
    var kt = knopf.querySelector('.kt'), alt = kt.textContent;
    knopf.disabled = true; kt.textContent = 'Wird gesendet …'; fehlerZeile.hidden = true;
    fetch('/api/formular', {method:'POST', body:fd})
      .then(function(r){ return r.json().catch(function(){ return {}; }).then(function(j){ if (!r.ok || !j.ok) throw new Error('fehler'); }); })
      .then(function(){ knopf.disabled = false; kt.textContent = alt; fertig(); })
      .catch(function(){ knopf.disabled = false; kt.textContent = alt; fehlerZeile.hidden = false; });
  }
  var geladen = Date.now();

  /* Formular in drei Schritten */
  var form = document.getElementById('formular');
  var seiten = Array.prototype.slice.call(form.querySelectorAll('[data-seite]'));
  var marken = Array.prototype.slice.call(form.querySelectorAll('[data-marke]'));
  var jetzt = 1;
  function setze(id, gut){ document.getElementById(id).classList.toggle('ungueltig', !gut); return gut; }
  function pruefe(schritt){
    if (schritt === 1) return setze('f-art', form.querySelectorAll('input[name="art"]:checked').length > 0);
    if (schritt === 2) return setze('f-text', form.beschreibung.value.trim().length > 4);
    var a = [
      setze('f-vorname', form.vorname.value.trim() !== ''),
      setze('f-nachname', form.nachname.value.trim() !== ''),
      setze('f-email', /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.value.trim())),
      setze('f-zustimmung', form.datenschutz.checked)
    ];
    return a.indexOf(false) === -1;
  }
  function auswahlZeigen(){
    var liste = document.getElementById('auswahl'); liste.innerHTML = '';
    form.querySelectorAll('input[name="art"]:checked').forEach(function(c){
      var li = document.createElement('li'); li.textContent = c.value; liste.appendChild(li);
    });
    var li = document.createElement('li'); li.style.background = 'none'; li.style.padding = '0';
    var b = document.createElement('button'); b.type = 'button'; b.textContent = 'Ändern';
    b.addEventListener('click', function(){ zeige(1); });
    li.appendChild(b); liste.appendChild(li);
  }
  function zeige(k, ohneFokus){
    var vor = k > jetzt;
    seiten.forEach(function(s){
      var an = +s.getAttribute('data-seite') === k;
      s.hidden = !an;
      s.classList.remove('rein','rein-z');
      if (an && !ruhig){ void s.offsetWidth; s.classList.add(vor ? 'rein' : 'rein-z'); }
    });
    marken.forEach(function(m){
      var i = +m.getAttribute('data-marke');
      m.classList.toggle('jetzt', i === k); m.classList.toggle('erledigt', i < k);
    });
    jetzt = k;
    if (k === 2) auswahlZeigen();
    if (!ohneFokus){
      var f = seiten[k-1].querySelector(k === 1 ? 'input' : k === 2 ? 'textarea' : '#vorname');
      if (f) setTimeout(function(){ f.focus({preventScroll:true}); }, 50);
      var top = form.getBoundingClientRect().top;
      if (top < 0 || top > window.innerHeight * 0.5) form.scrollIntoView({behavior: ruhig ? 'auto' : 'smooth', block:'start'});
    }
  }
  form.addEventListener('click', function(e){
    var w = e.target.closest('[data-weiter]'), z = e.target.closest('[data-zurueck]');
    if (w && pruefe(jetzt)) zeige(+w.getAttribute('data-weiter'));
    else if (w){ var f = form.querySelector('.ungueltig input, .ungueltig textarea'); if (f) f.focus(); }
    if (z) zeige(+z.getAttribute('data-zurueck'));
  });
  form.addEventListener('keydown', function(e){
    if (e.key === 'Enter' && e.target.tagName === 'INPUT' && jetzt < 3 && e.target.type !== 'checkbox'){ e.preventDefault(); }
  });
  form.addEventListener('submit', function(e){
    e.preventDefault();
    if (!pruefe(1)){ zeige(1); return; }
    if (!pruefe(2)){ zeige(2); return; }
    if (!pruefe(3)){ var f = form.querySelector('.ungueltig input'); if (f) f.focus(); return; }
    var fd = new FormData(form);
    fd.append('typ', 'anfrage'); fd.append('t', geladen);
    senden(fd, form.querySelector('button[type=submit]'), document.getElementById('a-fehler'), function(){
      document.getElementById('danke-name').textContent = ', ' + form.vorname.value.trim();
      form.hidden = true;
      var d = document.getElementById('danke'); d.hidden = false; d.focus();
    });
  });
  ['input','change'].forEach(function(t){
    form.addEventListener(t, function(e){ var f = e.target.closest('.ungueltig'); if (f) f.classList.remove('ungueltig'); });
  });

  /* „Dafür anfragen“ kreuzt das passende Thema schon an */
  document.querySelectorAll('[data-wahl]').forEach(function(a){
    a.addEventListener('click', function(){
      var c = document.getElementById(a.getAttribute('data-wahl'));
      if (c) c.checked = true;
      form.hidden = false; document.getElementById('danke').hidden = true;
      zeige(1, true);
    });
  });

  /* „Wir stellen ein“: hängt rechtsbündig unter dem Nav-Punkt Jobs und wächst nach links, weg vom Anfragen-Knopf.
     Am Handy sitzt es links unter dem Logo. Es zeigt sich nur, solange der Hero im Bild ist. */
  var einstell = document.getElementById('einstell'), einstellA = einstell.querySelector('a'), heroEl = document.querySelector('.hero');
  function einstellOrt(){
    var link = document.querySelector('.nav>a[href="/jobs/"]'), s = einstell.style;
    var k = einstell.parentNode.getBoundingClientRect();
    if (link && link.offsetParent){
      var r = link.getBoundingClientRect();
      s.setProperty('--el', 'auto'); s.setProperty('--er', (k.right - r.right - 12).toFixed(1) + 'px');
      s.setProperty('--en', 'calc(100% - ' + (r.width / 2 + 12).toFixed(1) + 'px)');
    } else {
      var logo = document.querySelector('.marke img').getBoundingClientRect();
      s.setProperty('--el', (logo.left - k.left).toFixed(1) + 'px'); s.setProperty('--er', 'auto');
      s.setProperty('--en', (logo.width / 2).toFixed(1) + 'px');
    }
  }
  function einstellSicht(){
    var imHero = !start.hidden && heroEl.getBoundingClientRect().bottom > window.innerHeight * 0.45;
    var aus = einstell.classList.contains('aus');
    if (imHero && aus){ einstellA.style.animation = 'none'; void einstellA.offsetWidth; einstellA.style.animation = ''; einstell.classList.remove('aus'); }
    else if (!imHero && !aus) einstell.classList.add('aus');
  }
  var start = document.getElementById('start');
  einstellOrt(); einstellSicht();
  window.addEventListener('resize', function(){ einstellOrt(); einstellSicht(); });
  window.addEventListener('scroll', einstellSicht, {passive:true});
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(einstellOrt);
})();
/* Zahlenlauf 30+ und 10+ im Hero, startet mit dem Einblenden der Belege */
(function(){
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var zahlen = document.querySelectorAll('.belege .zahl');
  zahlen.forEach(function(el){ el.textContent = '0'; });
  setTimeout(function(){
    var start = null, dauer = 1800;
    function schritt(t){
      if (!start) start = t;
      var x = Math.min((t - start) / dauer, 1), e = 1 - Math.pow(1 - x, 3);
      zahlen.forEach(function(el){ el.textContent = Math.round(e * +el.dataset.ziel); });
      if (x < 1) requestAnimationFrame(schritt);
    }
    requestAnimationFrame(schritt);
  }, 1500);
})();

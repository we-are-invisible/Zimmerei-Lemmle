(function(){
  var ruhig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var wurzel = document.documentElement;
  if (ruhig) wurzel.classList.add('ruhig');
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

  function setze(id, gut){ document.getElementById(id).classList.toggle('ungueltig', !gut); return gut; }

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
  /* Bewerbung: eigenes Formular, Lebenslauf als PDF ist Pflicht */
  var bForm = document.getElementById('bewerbung');
  var MAX_MB = 4, MAX_ZEUGNISSE = 3;
  var ablagen = {};
  function groesse(b){ return b < 1048576 ? Math.max(1, Math.round(b / 1024)) + ' KB' : (b / 1048576).toFixed(1).replace('.', ',') + ' MB'; }
  /* Echte PDFs beginnen mit %PDF. Das fängt umbenannte Word- oder Bilddateien ab. */
  function istPdf(datei, fertig){
    if (!/\.pdf$/i.test(datei.name)) return fertig(false);
    var r = new FileReader();
    r.onload = function(){ var a = new Uint8Array(r.result); fertig(a[0] === 0x25 && a[1] === 0x50 && a[2] === 0x44 && a[3] === 0x46); };
    r.onerror = function(){ fertig(false); };
    r.readAsArrayBuffer(datei.slice(0, 5));
  }
  function ablage(id, mehrere){
    var box = document.getElementById(id), eingabe = box.querySelector('input[type=file]');
    var zone = box.querySelector('.ablage'), liste = box.querySelector('.dateien'), fehl = box.querySelector('.fehltext');
    var titel = zone.querySelector('b'), leerText = titel.textContent;
    var st = ablagen[id] = {dateien: []};
    function fehler(t){ fehl.textContent = t; box.classList.add('ungueltig'); }
    function zeichne(){
      liste.innerHTML = '';
      st.dateien.forEach(function(d, i){
        var li = document.createElement('li');
        var m = document.createElement('i'); m.textContent = 'PDF';
        var n = document.createElement('span'); n.textContent = d.name;
        var g = document.createElement('em'); g.textContent = groesse(d.size); n.appendChild(g);
        var x = document.createElement('button'); x.type = 'button'; x.textContent = 'Entfernen';
        x.setAttribute('aria-label', d.name + ' entfernen');
        x.addEventListener('click', function(){ st.dateien.splice(i, 1); zeichne(); eingabe.focus(); });
        li.appendChild(m); li.appendChild(n); li.appendChild(x); liste.appendChild(li);
      });
      var voll = st.dateien.length > 0;
      zone.classList.toggle('voll', voll);
      titel.textContent = !voll ? leerText : mehrere ? 'Noch ein PDF hinzufügen' : 'Anderes PDF auswählen';
    }
    function nimm(files){
      var neu = Array.prototype.slice.call(files);
      eingabe.value = '';
      if (!mehrere) neu = neu.slice(0, 1);
      neu.forEach(function(d){
        if (d.size > MAX_MB * 1048576) return fehler('„' + d.name + '“ ist größer als ' + MAX_MB + ' MB. Speicher das PDF bitte kleiner ab und lad es noch mal hoch.');
        istPdf(d, function(ok){
          if (!ok) return fehler('„' + d.name + '“ ist kein PDF. Speicher die Datei bitte als PDF und lad sie noch mal hoch.');
          if (mehrere && st.dateien.length >= MAX_ZEUGNISSE) return fehler('Mehr als ' + MAX_ZEUGNISSE + ' PDFs gehen hier nicht. Den Rest kannst du per E-Mail nachreichen.');
          box.classList.remove('ungueltig');
          if (mehrere) st.dateien.push(d); else st.dateien = [d];
          zeichne();
        });
      });
    }
    eingabe.addEventListener('change', function(){ nimm(eingabe.files); });
    ['dragenter','dragover'].forEach(function(t){ zone.addEventListener(t, function(e){ e.preventDefault(); zone.classList.add('ueber'); }); });
    ['dragleave','drop'].forEach(function(t){ zone.addEventListener(t, function(e){ e.preventDefault(); zone.classList.remove('ueber'); }); });
    zone.addEventListener('drop', function(e){ if (e.dataTransfer && e.dataTransfer.files.length) nimm(e.dataTransfer.files); });
    return st;
  }
  /* Mitlaufendes Formular: Abstand oben so wählen, dass auch das Ende des Formulars ins Fenster passt */
  var bSpalte = document.querySelector('.bewerbung-spalte'), kopfEl = document.querySelector('.kopf');
  function klebOrt(){
    var oben = kopfEl.offsetHeight + 24;
    bSpalte.style.setProperty('--klebt', Math.min(oben, window.innerHeight - bSpalte.offsetHeight - 24) + 'px');
  }
  if ('ResizeObserver' in window) new ResizeObserver(klebOrt).observe(bSpalte);
  window.addEventListener('resize', klebOrt); klebOrt();
  var lebenslauf = ablage('b-f-lebenslauf', false);
  var zeugnisse = ablage('b-f-zeugnisse', true);
  function wert(id){ return document.getElementById(id).value.trim(); }
  bForm.addEventListener('submit', function(e){
    e.preventDefault();
    var llFehl = document.querySelector('#b-f-lebenslauf .fehltext');
    if (!lebenslauf.dateien.length) llFehl.textContent = llFehl.getAttribute('data-standard');
    var a = [
      setze('b-f-stelle', !!bForm.querySelector('input[name="stelle"]:checked')),
      setze('b-f-vorname', wert('b-vorname') !== ''),
      setze('b-f-nachname', wert('b-nachname') !== ''),
      setze('b-f-email', /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(wert('b-email'))),
      setze('b-f-lebenslauf', lebenslauf.dateien.length === 1),
      setze('b-f-zustimmung', document.getElementById('b-datenschutz').checked)
    ];
    if (a.indexOf(false) !== -1){
      var f = bForm.querySelector('.ungueltig input');
      if (f){ f.focus({preventScroll:true}); f.closest('.ungueltig').scrollIntoView({behavior: ruhig ? 'auto' : 'smooth', block:'center'}); }
      return;
    }
    /* Alle PDFs zusammen dürfen höchstens 4 MB haben, sonst nimmt die Funktion sie nicht an */
    var summe = lebenslauf.dateien.concat(zeugnisse.dateien).reduce(function(s, d){ return s + d.size; }, 0);
    if (summe > MAX_MB * 1048576){
      var zb = document.getElementById('b-f-zeugnisse');
      zb.querySelector('.fehltext').textContent = 'Alle PDFs zusammen sind größer als ' + MAX_MB + ' MB. Lass ein Zeugnis weg und schick es mir später per E-Mail.';
      zb.classList.add('ungueltig'); zb.scrollIntoView({behavior: ruhig ? 'auto' : 'smooth', block:'center'});
      return;
    }
    var fd = new FormData();
    fd.append('typ', 'bewerbung'); fd.append('t', geladen);
    fd.append('firma', bForm.querySelector('input[name=firma]').value);
    fd.append('stelle', bForm.querySelector('input[name="stelle"]:checked').value);
    fd.append('vorname', wert('b-vorname')); fd.append('nachname', wert('b-nachname'));
    fd.append('email', wert('b-email')); fd.append('telefon', wert('b-telefon'));
    fd.append('beschreibung', wert('b-text')); fd.append('datenschutz', 'on');
    fd.append('lebenslauf', lebenslauf.dateien[0], lebenslauf.dateien[0].name);
    zeugnisse.dateien.forEach(function(d){ fd.append('zeugnisse', d, d.name); });
    senden(fd, bForm.querySelector('button[type=submit]'), document.getElementById('b-fehler'), function(){
      document.getElementById('b-danke-name').textContent = ', ' + wert('b-vorname');
      bForm.hidden = true;
      var d = document.getElementById('b-danke'); d.hidden = false; d.focus();
    });
  });
  ['input','change'].forEach(function(t){
    bForm.addEventListener(t, function(e){
      if (e.target.type === 'file') return;
      var f = e.target.closest('.ungueltig'); if (f) f.classList.remove('ungueltig');
    });
  });

})();

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

  var DATEN = {"hof": {"t": "Hofgut-Sanierung mit ökologischen Baustoffen", "b": [{"s": "/bilder/echt/hof-1.jpg", "c": "Der Hof mit neuer Holzkonstruktion und neuem Dach"}, {"s": "/bilder/echt/hof-2.jpg", "c": "So sah der Hof vorher aus"}, {"s": "/bilder/echt/hof-3.jpg", "c": "Das alte Dach wird abgetragen"}, {"s": "/bilder/echt/hof-4.jpg", "c": "Der neue Dachstuhl steht"}, {"s": "/bilder/echt/hof-5.jpg", "c": "Die Lattung für das neue Dach"}, {"s": "/bilder/echt/hof-6.jpg", "c": "Innen bleibt das Holz sichtbar"}, {"s": "/bilder/echt/hof-7.jpg", "c": "Der Giebel von der Straße aus"}]}, "aufstockung": {"t": "Ein Stockwerk mehr", "b": [{"s": "/bilder/echt/aufstockung-1.jpg", "c": "Das neue Geschoss, das Dach ist schon gelattet"}, {"s": "/bilder/echt/aufstockung-2.jpg", "c": "Die Wände stehen auf der alten Decke"}, {"s": "/bilder/echt/aufstockung-3.jpg", "c": "Ein Dachelement hängt am Kran"}, {"s": "/bilder/echt/aufstockung-4.jpg", "c": "Das Dach ist geschlossen"}, {"s": "/bilder/echt/aufstockung-5.jpg", "c": "Der Dachstuhl von innen"}, {"s": "/bilder/echt/aufstockung-6.jpg", "c": "Das fertig gedeckte Dach von oben"}]}, "dach": {"t": "Dachsanierung mit Photovoltaik", "b": [{"s": "/bilder/echt/dach-1.jpg", "c": "Das neue Dach mit Photovoltaik"}, {"s": "/bilder/echt/dach-2.jpg", "c": "Die alten Schindeln vor der Sanierung"}, {"s": "/bilder/echt/dach-3.jpg", "c": "Das Dach ist geöffnet, die alte Dämmung kommt raus"}, {"s": "/bilder/echt/dach-4.jpg", "c": "Die Module liegen bündig auf der ganzen Fläche"}]}, "balkon": {"t": "Balkon mit morschen Balken", "b": [{"s": "/bilder/echt/balkon-1.jpg", "c": "Der Balkon nach der Sanierung"}, {"s": "/bilder/echt/balkon-2.jpg", "c": "Der Balkon vorher"}, {"s": "/bilder/echt/balkon-3.jpg", "c": "So sah ein tragender Balken aus"}, {"s": "/bilder/echt/balkon-4.jpg", "c": "Fäulnis bis in den Kern"}, {"s": "/bilder/echt/balkon-5.jpg", "c": "Die neue Unterkonstruktion von unten"}]}, "carport": {"t": "Carports und Überdachungen", "b": [{"s": "/bilder/echt/carport-1.jpg", "c": "Carport mit geschlossener Rückwand"}, {"s": "/bilder/echt/carport-2.jpg", "c": "Das Tragwerk steht"}, {"s": "/bilder/echt/carport-3.jpg", "c": "Die Wetterseite ist mit Holz verschalt"}, {"s": "/bilder/echt/carport-4.jpg", "c": "Carport für zwei Stellplätze"}, {"s": "/bilder/echt/carport-5.jpg", "c": "Überdachung mit Glas"}]}, "halle": {"t": "Halle mit Holzfassade", "b": [{"s": "/bilder/echt/halle-1.jpg", "c": "Die Halle kurz vor der Fertigstellung"}, {"s": "/bilder/echt/halle-2.jpg", "c": "Die ersten Rahmen stehen"}, {"s": "/bilder/echt/halle-3.jpg", "c": "Das Tragwerk von innen"}, {"s": "/bilder/echt/halle-4.jpg", "c": "Die fertige Halle mit Schalung"}, {"s": "/bilder/echt/halle-5.jpg", "c": "Fenster in der Holzschalung"}]}, "gaestehaus": {"t": "Gästehaus in Holzbauweise", "b": [{"s": "/bilder/echt/gaestehaus-1.jpg", "c": "Der Dachstuhl ist aufgerichtet"}, {"s": "/bilder/echt/gaestehaus-2.jpg", "c": "Die Wände im Rohbau"}, {"s": "/bilder/echt/gaestehaus-3.jpg", "c": "Material kommt mit dem Kran aufs Dach"}, {"s": "/bilder/echt/gaestehaus-4.jpg", "c": "Mein Kran auf der Baustelle"}]}, "treppe": {"t": "Treppe mit Podest", "b": [{"s": "/bilder/echt/treppe-1.jpg", "c": "Die fertige Treppe mit Geländer"}, {"s": "/bilder/echt/treppe-2.jpg", "c": "Die Treppe entsteht in der Werkstatt"}, {"s": "/bilder/echt/treppe-3.jpg", "c": "Blick von oben über die Stufen"}, {"s": "/bilder/echt/treppe-4.jpg", "c": "Treppe und Geländer von der Seite"}, {"s": "/bilder/echt/treppe-5.jpg", "c": "Das Podest am oberen Ende"}]}, "fassade": {"t": "Fassaden aus Holz", "b": [{"s": "/bilder/echt/fassade-1.jpg", "c": "Wohnhaus mit waagrechter Holzschalung"}, {"s": "/bilder/echt/fassade-2.jpg", "c": "Giebel mit Holzfassade über dem Putz"}, {"s": "/bilder/echt/fassade-3.jpg", "c": "Gewerbebau mit senkrechter Schalung"}, {"s": "/bilder/echt/fassade-4.jpg", "c": "Der Gewerbebau von oben"}, {"s": "/bilder/echt/fassade-5.jpg", "c": "Das Wohnhaus von der Gartenseite"}]}, "gaube": {"t": "Neue Dachgaube", "b": [{"s": "/bilder/echt/gaube-1.jpg", "c": "Die fertige Gaube"}, {"s": "/bilder/echt/gaube-2.jpg", "c": "Das Gerippe im Rohbau"}, {"s": "/bilder/echt/gaube-3.jpg", "c": "Die Fensterfront aus der Nähe"}]}, "holzhaus": {"t": "Holzhaus aus fertigen Wänden", "b": [{"s": "/bilder/echt/holzhaus-1.jpg", "c": "Ein Giebel schwebt am Kran ein"}, {"s": "/bilder/echt/holzhaus-2.jpg", "c": "Die Wände im Erdgeschoss stehen"}, {"s": "/bilder/echt/holzhaus-3.jpg", "c": "Der Rohbau mit Dach"}, {"s": "/bilder/echt/holzhaus-4.jpg", "c": "Das Haus von oben"}]}, "terrasse": {"t": "Dachterrasse mit Holzdielen", "b": [{"s": "/bilder/echt/terrasse-1.jpg", "c": "Die fertige Dachterrasse"}, {"s": "/bilder/echt/terrasse-2.jpg", "c": "Der Unterbau aus Stelzlagern"}, {"s": "/bilder/echt/terrasse-3.jpg", "c": "Frisch geölte Dielen"}, {"s": "/bilder/echt/terrasse-4.jpg", "c": "Eine weitere Terrasse mit Holzdielen"}]}};

  /* Vorher-Nachher: Regler ist ein echtes range-Feld, also auch mit Tastatur bedienbar */
  document.querySelectorAll('[data-vn]').forEach(function(vn){
    var regler = vn.querySelector('input'), bewegt = false;
    function setze(v){ vn.style.setProperty('--p', v + '%'); }
    regler.addEventListener('input', function(){ bewegt = true; setze(regler.value); });
    if (ruhig || !('IntersectionObserver' in window)) return;
    /* Einmal kurz anstupsen, damit klar ist, dass sich hier etwas ziehen lässt */
    var einmal = new IntersectionObserver(function(e){
      if (!e[0].isIntersecting) return;
      einmal.disconnect();
      var start = performance.now();
      (function tick(t){
        if (bewegt) return;
        var k = Math.min(1, (t - start) / 1500);
        var v = 50 + Math.sin(k * Math.PI * 2) * 16 * (1 - k * 0.35);
        setze(v.toFixed(2)); regler.value = v;
        if (k < 1) requestAnimationFrame(tick); else { setze(50); regler.value = 50; }
      })(start);
    }, {threshold: 0.6});
    einmal.observe(vn);
  });

  /* Filter */
  var liste = document.getElementById('projekte');
  var projekte = Array.prototype.slice.call(liste.children);
  var filter = Array.prototype.slice.call(document.querySelectorAll('.filter'));
  filter.forEach(function(f){
    f.addEventListener('click', function(){
      var k = f.getAttribute('data-filter');
      filter.forEach(function(g){ var an = g === f; g.classList.toggle('an', an); g.setAttribute('aria-pressed', an ? 'true' : 'false'); });
      liste.classList.toggle('gefiltert', k !== 'alle');
      projekte.forEach(function(p){
        var zeigen = k === 'alle' || (' ' + p.getAttribute('data-kat') + ' ').indexOf(' ' + k + ' ') !== -1;
        p.hidden = !zeigen;
        p.classList.remove('neu');
        if (zeigen && !ruhig){ void p.offsetWidth; p.classList.add('neu'); }
      });
    });
  });

  /* Fotoschau */
  var schau = document.getElementById('schau'), bild = document.getElementById('schau-bild');
  var titel = document.getElementById('schau-titel'), zahl = document.getElementById('schau-zahl'), text = document.getElementById('schau-text');
  var akt = null, nr = 0, ausloeser = null;
  function zeige(i){
    var b = akt.b; nr = (i + b.length) % b.length;
    bild.classList.remove('wechsel'); void bild.offsetWidth;
    bild.src = b[nr].s; bild.alt = b[nr].c;
    if (!ruhig) bild.classList.add('wechsel');
    text.textContent = b[nr].c;
    zahl.textContent = (nr + 1) + ' / ' + b.length;
    var n = new Image(); n.src = b[(nr + 1) % b.length].s;
  }
  liste.addEventListener('click', function(e){
    var k = e.target.closest('[data-projekt]'); if (!k) return;
    akt = DATEN[k.getAttribute('data-projekt')]; ausloeser = k;
    titel.textContent = akt.t;
    zeige(0);
    if (schau.showModal) schau.showModal(); else schau.setAttribute('open', '');
  });
  function zu(){ if (schau.close) schau.close(); else schau.removeAttribute('open'); }
  schau.addEventListener('close', function(){ if (ausloeser) ausloeser.focus(); });
  document.getElementById('schau-zu').addEventListener('click', zu);
  document.getElementById('schau-z').addEventListener('click', function(){ zeige(nr - 1); });
  document.getElementById('schau-w').addEventListener('click', function(){ zeige(nr + 1); });
  schau.addEventListener('click', function(e){ if (e.target === schau || e.target.classList.contains('schau-buehne')) zu(); });
  schau.addEventListener('keydown', function(e){
    if (e.key === 'ArrowLeft') zeige(nr - 1);
    if (e.key === 'ArrowRight') zeige(nr + 1);
  });
  var x0 = null;
  schau.addEventListener('touchstart', function(e){ x0 = e.touches[0].clientX; }, {passive:true});
  schau.addEventListener('touchend', function(e){
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 50) zeige(nr + (dx < 0 ? 1 : -1));
  }, {passive:true});
})();

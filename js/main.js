/* PLUMBING_V 4 — Bespoke Studio · meccanica invisibile canonica.
   ────────────────────────────────────────────────────────────────
   CONFINE (inviolabile): questo file contiene SOLO plumbing — la meccanica
   che il visitatore non percepisce come design. NIENTE markup di sezioni,
   NIENTE stile, NIENTE struttura: concept, griglia, tipografia, hero e
   animazioni-firma si progettano DA ZERO per ogni cliente (GATE #3).
   Se qui dentro scivola del layout, questo diventa il nuovo scheletro
   condiviso — cioè il difetto "copia-incolla" che il metodo combatte.

   Come si usa: si COPIA nella cartella js/ del sito e si adatta la sola
   costante SITE. Le animazioni-firma del sito si scrivono nel proprio
   main.js DOPO questo file (o in coda a questo file, sotto il marcatore).
   Ogni bug nuovo si corregge QUI (bump PLUMBING_V + changelog nel README)
   e poi nel sito: mai il contrario.

   Fix già incorporati (non rimuovere):
   - ScrollTrigger registrato SUBITO allo script load, MAI dentro l'intro
     o un setTimeout (bug APF #5 del 16/7: race col watchdog → sezioni
     che sparivano allo scroll).
   - Reveal con once:true (niente re-animazioni da zero ri-scorrendo).
   - Watchdog 1,5s che forza visibile e UCCIDE i trigger non scattati.
   - Lightbox su [hidden] + override CSS !important (bug: display:flex
     batteva [hidden] e la lightbox restava visibile).
   - Foto-contenuto MAI lazy (regola workflow §8): il plumbing non tocca
     il loading, ma il lint lo verifica.
   - Orari Europe/Rome con finestre multiple e scavalco di mezzanotte
     (pattern Il Cavallante 18:00–00:30). */

(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) root.classList.add('reduced-motion');

  /* ══════════ CONFIG PER-SITO — l'unica parte da adattare ══════════ */
  var SITE = {
    slug: 'bar-suzzani',    // usato per localStorage lang
    whatsapp: {
      number: '',                     // '39xxxxxxxxxx' — vuoto = niente wiring
      message: 'Ciao! Vorrei informazioni.',
      ids: ['ctaPrenota', 'heroWhatsapp', 'doveWhatsapp', 'barWhatsapp'],
    },
    /* orari: per giorno (0=domenica) un array di finestre [inizio, fine]
       in minuti-stringa 'HH:MM'. Fine oltre '24:00' = scavalca mezzanotte
       (es. ['18:00','24:30'] = apre alle 18, chiude alle 00:30 del giorno
       dopo). Giorno chiuso = []. */
    /* Scheda Google (24/9/2026): lun–ven 06:45–19:30, sabato 06:45–19:00, domenica chiuso. */
    hours: {
      0: [],
      1: [['06:45', '19:30']],
      2: [['06:45', '19:30']],
      3: [['06:45', '19:30']],
      4: [['06:45', '19:30']],
      5: [['06:45', '19:30']],
      6: [['06:45', '19:00']],
    },
    hoursStatusId: 'orarioStato',     // elemento testo stato
    hoursTableSelector: '[data-day]', // righe/li con data-day da evidenziare
    todayClass: 'is-today',
    introId: 'intro',
    introDuration: 1800,
    revealSelector: '.reveal',
    inViewClass: 'in-view',
    breakpointMenu: 960,
    /* dizionario EN: SOLO overlay — l'HTML è la versione italiana.
       Forma storica a due lingue, resta valida e invariata. */
    EN: {
      "intro.1": "Dairy & deli",
      "intro.2": "Bar",
      "intro.3": "Newsstand",
      "intro.skip": "skip",
      "nav.home": "Bar Suzzani, back to top",
      "nav.apri": "Open the menu",
      "marchio.s": "dairy & deli · bar · newsstand",
      "nav.banco": "The counter",
      "nav.edicola": "Newsstand",
      "nav.annunci": "Services",
      "nav.lettere": "Reviews",
      "nav.dove": "Where & hours",
      "cta.chiama": "Call",
      "cta.chiama2": "Call 02 643 5470",
      "ed.pre": "Edition of",
      "ed.luogo": "Viale Suzzani 270 · Milan, Niguarda",
      "ins.l": "Dairy & deli",
      "ins.b": "Bar",
      "ins.e": "Newsstand",
      "p.occhiello": "At the end of the avenue, a step from Parco Nord",
      "p.titolo": "The bar at the end of the avenue.",
      "p.lead": "Coffee at 6.45, the newspaper, a hundred grams of ham, the bill to pay and the parcel to collect: in Niguarda there is one place where all of it gets done, and it is the dairy-deli with the newsstand at the end of Viale Suzzani. Mauro and Davide open early, six days a week, and the people who come in have been writing the same thing for years: here you feel at home.",
      "p.cta1": "Call the bar",
      "p.cta2": "Read the front page",
      "p.alt": "The front of Bar Suzzani with the three signs Latteria, Bar Suzzani and Edicola, and the tables on the pavement",
      "p.cap": "The three signs, Viale Suzzani 270",
      "n.1": "Google reviews, 4.5 out of 5",
      "n.2": "opening time, six days a week",
      "n.3": "services at the counter",
      "so.t": "In this issue",
      "so.1": "Counter news",
      "so.2": "Newsstand",
      "so.3": "Classifieds",
      "so.4": "Letters to the bar",
      "so.5": "Hours and where",
      "so.p": "p.",
      "r1.t": "Counter news",
      "r1.n": "Page 2",
      "r1.h": "Cold cuts and cheese cut to order, as in a dairy shop.",
      "r1.p1": "The sign says «Latteria», and the counter confirms it: cold cuts and cheese cut to order, dairy products, fruit and vegetables, a small deli for a quick shop. People who come back write about first-choice products and sandwiches made on the spot.",
      "r1.p2": "It starts with breakfast, a brioche and a cappuccino, soy milk too; at midday a sandwich or a cold plate; in the afternoon a coffee, and towards evening a beer with crisps at the tables outside.",
      "v1.k": "Breakfast",
      "v1.d": "brioche and cappuccino from 6.45 am, soy milk too",
      "v2.k": "The counter",
      "v2.d": "cold cuts and cheese cut to order, dairy, fruit and vegetables, deli",
      "v3.k": "Lunch",
      "v3.d": "sandwiches made on the spot and cold plates, to take away too",
      "v4.k": "Aperitivo",
      "v4.d": "a beer and a few nibbles, at the tables on the pavement",
      "v5.k": "Delivery",
      "v5.d": "groceries and sandwiches can be delivered: call to ask",
      "r1.alt1": "The bar counter with the fridges, the newspaper rack and the sage-green walls",
      "r1.cap1": "The counter, with the newspapers",
      "r1.alt2": "The deli counter with cold cuts and cheese and, next to it, the newsstand shelves",
      "r1.cap2": "The deli counter and the newsstand",
      "r2.t": "Newsstand",
      "r2.n": "Page 3",
      "r2.h": "Newspapers and magazines, every morning.",
      "r2.p1": "From 6.45 am the daily papers are on the counter, next to the brioches: you pick one up with your coffee and read it at the tables outside, with the avenue in front of you.",
      "r2.p2": "Magazines, weeklies, the papers the neighbourhood reads. And between one headline and the next, the bar does what it has always done: people chat, meet, and come back the next day.",
      "r2.alt": "The Latteria sign and the window with the words Giornali Riviste",
      "r2.cap": "«Giornali · Riviste», on the window",
      "r2.alt2": "The iron and wood tables on the pavement in front of the Latteria sign",
      "r2.cap2": "The tables on the pavement",
      "r3.t": "Classifieds",
      "r3.n": "Page 4",
      "r3.h": "Everything gets done at the counter.",
      "r3.p": "The sticker next to the door says it: at the bar counter you do the things that once took five different places. Photocopies and PagoPA, topping up the travel pass and collecting a parcel, all with a coffee in hand.",
      "a1.k": "Photocopies and fax",
      "a1.d": "photocopies, fax, printing from file, document scanning, sending emails",
      "a2.k": "PagoPA",
      "a2.d": "waste tax, school meals, fines, road tax",
      "a3.k": "Bills and top-ups",
      "a3.d": "postal payment slips and phone top-ups",
      "a4.k": "ATM ticket point",
      "a4.d": "tickets and top-ups of the ATM travel pass",
      "a5.k": "Punto Poste",
      "a5.d": "the Italian Post collection and drop-off point",
      "a6.k": "Amazon service",
      "a6.d": "parcels are collected here, IndaBox too",
      "a7.k": "Lottomatica",
      "a7.d": "the LIS Lottomatica point",
      "r3.nota": "Sixteen items, copied from the window. To know whether a service is available today, one phone call: 02 643 5470.",
      "r3.alt": "The window sticker listing the services: photocopies, fax, PagoPA, ATM tickets, Punto Poste, Amazon service, Lottomatica, top-ups, bills",
      "r3.cap": "The services sticker, next to the door",
      "r4.t": "Letters to the bar",
      "r4.n": "Page 5",
      "r4.h": "What people write.",
      "le.badge": "from 194 Google reviews",
      "t.1": "letters talk about kindness, good humour and a warm welcome",
      "t.2": "talk about Mauro and Davide, the guys behind the counter",
      "t.3": "about the products and their quality",
      "t.4": "about the coffee",
      "t.5": "about the cold cuts and the cheese",
      "t.6": "about the neighbourhood, Bicocca, Parco Nord",
      "t.7": "about the newspapers and the newsstand",
      "le.nota": "Counted one by one in the 133 Google reviews that have a text. The owner replies to 93 reviews out of 194.",
      "le.cit": "«My Saturday-morning bar»",
      "le.citda": "From a Google review (translated)",
      "le.btn": "Read all the reviews on Google",
      "le.alt": "The whole front of the bar under the building, with the signs Latteria, Bar Suzzani and Edicola",
      "le.cap": "The front, under the building",
      "le.alt2": "Two mugs of beer and a bowl of crisps on a wooden table",
      "le.cap2": "Towards evening, at the tables",
      "r5.t": "Hours and where",
      "r5.n": "Page 6",
      "d.h": "From 6.45 am, six days a week.",
      "d.p": "At the end of Viale Suzzani, a step from the Parco Nord entrance and from Bignami station on the lilac metro line; bus 42 stops nearby. The CTO hospital is across Viale Fulvio Testi.",
      "d.no1": "<b>Sunday</b> closed.",
      "d.no2": "<b>Saturday</b> we close at 7 pm.",
      "d.no3": "<b>The busiest hours</b>, according to Google: mid-morning and 4–5 pm.",
      "d.no4": "<b>Tables</b> on the pavement.",
      "o.cap": "Opening hours",
      "g.lun": "Monday",
      "g.mar": "Tuesday",
      "g.mer": "Wednesday",
      "g.gio": "Thursday",
      "g.ven": "Friday",
      "g.sab": "Saturday",
      "g.dom": "Sunday",
      "g.chiuso": "closed",
      "d.strada": "Take me there with Google Maps",
      "d.mappa": "Map: Bar Suzzani, Viale Giovanni Suzzani 270, Milan",
      "d.alt": "The front of the bar in the evening, with the lights and the yellow Bar Suzzani sign lit up",
      "d.cap": "In the evening, with the lights",
      "d.alt2": "Viale Suzzani seen from the bar, with the buildings and a cloudy sky",
      "d.cap2": "The avenue, in front",
      "k.dom": "Questions",
      "do.n": "Last page",
      "qa.1": "What time do you open?",
      "ra.1": "At 6.45 am, Monday to Saturday. We close at 7.30 pm, on Saturday at 7 pm. Closed on Sunday.",
      "qa.2": "Can I eat here?",
      "ra.2": "Yes: breakfast with brioche and cappuccino, at lunch sandwiches made on the spot and cold plates, and the cold cuts and cheese counter for your shopping.",
      "qa.3": "Do you sell newspapers?",
      "ra.3": "Yes, daily papers and magazines every morning: the newsstand is inside the bar.",
      "qa.4": "Can I pay bills and PagoPA here?",
      "ra.4": "Yes: payment slips, PagoPA (waste tax, school meals, fines, road tax), phone top-ups and ATM travel-pass top-ups.",
      "qa.5": "Can I collect a parcel?",
      "ra.5": "Yes: we are an Amazon, IndaBox and Punto Poste collection point.",
      "qa.6": "Do you deliver?",
      "ra.6": "Yes, by phone: groceries from the counter and sandwiches can be brought to your door.",
      "piede.s": "dairy & deli · bar · newsstand · Milan, Niguarda",
      "piede.d": "Bar Suzzani di Mauro Arturo Giovanni Vescovo e Davide Valentini S.n.c. · Viale Giovanni Suzzani 270, 20162 Milan · <a href='tel:+39026435470'>02 643 5470</a>",
      "piede.ed": "Read every day from 6.45 am, Sundays excluded.",
      "piede.b": "Demo website made by <a href='https://bespokestud.io' target='_blank' rel='noopener'>Bespoke Studio</a> · texts, hours and services from the business's public sources; photographs published by the business and by customers on Google.",
      "b.chiama": "Call",
      "b.banco": "Counter",
      "b.orari": "Hours",
      "b.mappa": "Map",
      "lb.chiudi": "Close",
    },
    /* MULTILINGUA (V4) — per i siti con più di due lingue, al posto di EN:
         LANGS: { en: {chiave:'...'}, ar: {chiave:'...'} }
       L'italiano resta SEMPRE la lingua del DOM e non ha dizionario.
       Se si valorizza EN e non LANGS, il comportamento è identico a prima. */
    LANGS: null,
    RTL: ['ar', 'he', 'fa', 'ur'],   // lingue che ribaltano dir=rtl
    /* etichette dello stato orari per lingua non-IT; l'IT è nel codice.
       Chiave mancante = fallback all'inglese, poi all'italiano. */
    HOURS_I18N: null,
  };
  /* normalizzazione: EN storico -> LANGS */
  if (!SITE.LANGS) SITE.LANGS = SITE.EN && Object.keys(SITE.EN).length ? { en: SITE.EN } : {};
  var LANG_CODES = Object.keys(SITE.LANGS);   // senza 'it', che è il DOM
  /* ═════════════════════════════════════════════════════════════════ */

  /* ---------- WhatsApp wiring ---------- */
  if (SITE.whatsapp.number) {
    var waHref = 'https://wa.me/' + SITE.whatsapp.number + '?text=' +
      encodeURIComponent(SITE.whatsapp.message);
    SITE.whatsapp.ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { el.href = waHref; el.target = '_blank'; el.rel = 'noopener'; }
    });
  }

  /* ---------- GSAP: registrazione IMMEDIATA + reveal + watchdog ---------- */
  var hasGsap = typeof gsap !== 'undefined';
  var hasST = hasGsap && typeof ScrollTrigger !== 'undefined';
  if (hasST) gsap.registerPlugin(ScrollTrigger);

  function showAllReveals() {
    var els = document.querySelectorAll(SITE.revealSelector);
    els.forEach(function (el) { el.classList.add(SITE.inViewClass); });
    if (hasGsap) {
      if (hasST) {
        els.forEach(function (el) {
          ScrollTrigger.getAll().forEach(function (st) {
            if (st.trigger === el && !st.progress) st.kill();
          });
        });
      }
      gsap.set(els, { opacity: 1, y: 0, x: 0 });
    }
  }
  // FIX FOUC (18/7): il watchdog è SOLO un fallback se GSAP non c'è (o reduced-motion).
  // Rivelare in anticipo tutti i .reveal mentre gli scroll-trigger sono attivi causava il
  // flash (scompaiono/ricompaiono) sotto la piega. Con GSAP attivo, rivelano gli ScrollTrigger.
  setTimeout(function () { if (!hasGsap || reducedMotion) showAllReveals(); }, 1500);

  if (hasGsap && !reducedMotion) {
    // reveal generico: le animazioni-FIRMA del sito vanno oltre questo,
    // ma si registrano ANCHE LORO subito, mai dopo l'intro.
    // ⚠️ REGOLA ANTI-FLASH (18/7): un elemento .reveal deve avere UNA SOLA animazione che
    // ne porta l'opacità a 1. Se un elemento ha una FIRMA che ne anima l'opacità (stagger,
    // timeline, ecc.), ESCLUDILO da qui via SITE.revealSelector (es. '.reveal:not(.mondo)'),
    // altrimenti il reveal generico + la firma si sovrappongono e l'elemento FLASHA.
    // immediateRender:false → lo stato "from" (opacity:0) NON viene ri-applicato ad ogni
    // ScrollTrigger.refresh() (che scatta al window.load mentre scrolli) → niente flash su refresh.
    gsap.utils.toArray(SITE.revealSelector).forEach(function (el) {
      gsap.fromTo(el, { opacity: 0, y: 28 }, {
        opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', immediateRender: false,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });
  } else {
    // fallback senza GSAP: IntersectionObserver + classe
    if ('IntersectionObserver' in window && !reducedMotion) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add(SITE.inViewClass); io.unobserve(e.target); }
        });
      }, { threshold: 0.12 });
      document.querySelectorAll(SITE.revealSelector).forEach(function (el) { io.observe(el); });
    } else {
      showAllReveals();
    }
  }

  /* ---------- intro skippabile (NON gate-a nulla) ---------- */
  var intro = document.getElementById(SITE.introId);
  /* ⚠️ L'hook si legge AL MOMENTO DELLA CHIAMATA, mai catturato per valore
     qui. Il codice-firma vive sotto il marcatore di fine plumbing — cioè
     gira DOPO questa riga — quindi `window.bespokeHeroEntrance ||
     function(){}` congelava la funzione vuota e l'entrata dell'hero non
     partiva più: titolo a opacity 0 per sempre, hero vuota sul live.
     (20/7/2026, riprodotto a schermo su Benessere Futuro #159.) */
  function heroEntrance() {
    if (typeof window.bespokeHeroEntrance === 'function') window.bespokeHeroEntrance();
  }
  function hideIntro() {
    if (!intro) return;
    var el = intro; intro = null;
    el.classList.add('hide');
    setTimeout(function () { el.remove(); }, 700);
    heroEntrance();
  }
  // rimozione IMMEDIATA (niente fade): serve quando qualcosa deve stare sopra
  // l'intro subito, es. l'apertura del menu. Durante il fade l'intro resta
  // hit-testable e i link del drawer non sono cliccabili.
  function killIntroNow() {
    if (!intro) return;
    var el = intro; intro = null;
    el.remove();
    heroEntrance();
  }
  if (reducedMotion || !intro) {
    if (intro) { intro.remove(); intro = null; }
    /* ⚠️ setTimeout 0 NON è decorativo: senza intro questo ramo gira in modo
       SINCRONO, cioè PRIMA che il codice-firma — che sta sotto il marcatore
       di fine plumbing, dentro questa stessa IIFE — abbia assegnato
       `window.bespokeHeroEntrance`. Il risultato è un'entrata dell'hero MUTA:
       nessun errore, elementi visibili, animazione semplicemente mai partita.
       Rimandando di un tick la IIFE è conclusa e l'hook esiste.
       (14/8/2026, A.S.FA. Sicilia: misurato h1 a opacity 1 già al load.)
       Cugino del bug `hero-hook-congelato` del 20/7: lì l'hook era catturato
       troppo presto, qui è CHIAMATO troppo presto. */
    setTimeout(heroEntrance, 0);
  } else {
    setTimeout(hideIntro, SITE.introDuration);
    setTimeout(hideIntro, 6000); // safety net: l'intro non può incastrarsi
    intro.addEventListener('click', hideIntro);
  }

  /* ---------- burger menu (inert + focus + Escape + resize) ---------- */
  var burger = document.getElementById('burger');
  /* 26/7/2026 (Il Papiro #168) — IL PANNELLO SI RISOLVE DA `aria-controls`.
     Il canone apriva sempre `#mainNav`, dando per scontato che la nav
     desktop FOSSE anche il drawer. Molti siti invece hanno un drawer
     separato (`#mobile-menu`) con `hidden`, mentre `#mainNav` su mobile è
     `display:none`: il burger aggiungeva `nav-open` a un elemento nascosto
     e il menu non si apriva. È la stessa decisione già presa il 20/7 per
     qa-motion — «è lì che il markup accessibile dice qual è il pannello» —
     che però non era mai rientrata qui. */
  var nav = (function () {
    var byAria = burger && burger.getAttribute('aria-controls');
    return (byAria && document.getElementById(byAria)) || document.getElementById('mainNav');
  })();
  if (burger && nav) {
    var navUsaHidden = nav.hasAttribute('hidden');
    var lastFocus = null;
    var closeNav = function () {
      nav.classList.remove('nav-open');
      if (navUsaHidden) nav.hidden = true;
      burger.setAttribute('aria-expanded', 'false');
      if (lastFocus) { lastFocus.focus(); lastFocus = null; }
    };
    var openNav = function () {
      // L'intro ha z-index alto ed è figlia del body: se è ancora a schermo
      // copre il drawer (che vive nello stacking context dell'header) e i link
      // risultano non cliccabili. Aprire il menu chiude l'intro.
      // (bug trovato da qa-motion su Linea Uomo, 19/7/2026 → PLUMBING_V 2)
      if (typeof killIntroNow === 'function') killIntroNow();
      lastFocus = document.activeElement;
      if (navUsaHidden) nav.hidden = false;
      nav.classList.add('nav-open');
      burger.setAttribute('aria-expanded', 'true');
      var first = nav.querySelector('a, button');
      if (first) first.focus();
    };
    burger.addEventListener('click', function () {
      nav.classList.contains('nav-open') ? closeNav() : openNav();
    });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeNav); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('nav-open')) closeNav();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > SITE.breakpointMenu) closeNav();
    });
  }

  /* ---------- lightbox accessibile ---------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxClose = document.getElementById('lightboxClose');
  if (lightbox && lightboxImg) {
    var opener = null;
    var openLb = function (src, alt) {
      lightboxImg.src = src; lightboxImg.alt = alt || '';
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
      if (lightboxClose) lightboxClose.focus();
    };
    var closeLb = function () {
      lightbox.hidden = true; lightboxImg.src = '';
      document.body.style.overflow = '';
      if (opener) { opener.focus(); opener = null; }
    };
    document.querySelectorAll('[data-full]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        opener = btn;
        var img = btn.querySelector('img');
        openLb(btn.getAttribute('data-full'), img ? img.alt : '');
      });
    });
    if (lightboxClose) lightboxClose.addEventListener('click', closeLb);
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !lightbox.hidden) closeLb();
    });
  }

  /* ---------- orari dinamici Europe/Rome (finestre multiple + scavalco) ---------- */
  function romeNow() {
    try {
      var f = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Rome', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
      });
      var p = f.formatToParts(new Date());
      var map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      var get = function (t) { return p.find(function (x) { return x.type === t; }).value; };
      return { day: map[get('weekday')], mins: parseInt(get('hour'), 10) * 60 + parseInt(get('minute'), 10) };
    } catch (e) {
      var d = new Date();
      return { day: d.getDay(), mins: d.getHours() * 60 + d.getMinutes() };
    }
  }
  var toMin = function (hm) {
    var a = hm.split(':');
    return parseInt(a[0], 10) * 60 + parseInt(a[1], 10);
  };
  var fmt = function (m) {
    m = m % 1440;
    return ('0' + Math.floor(m / 60)).slice(-2) + ':' + ('0' + (m % 60)).slice(-2);
  };
  var DAYS_IT = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  var DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var HOURS_BASE = {
    it: { open: 'Aperto ora', closesAt: 'chiude alle ', opensToday: 'Chiuso · apre oggi alle ',
          opensOn: 'Chiuso · apre {day} alle ', closed: 'Chiuso', days: DAYS_IT },
    en: { open: 'Open now', closesAt: 'closes at ', opensToday: 'Closed · opens today at ',
          opensOn: 'Closed · opens {day} at ', closed: 'Closed', days: DAYS_EN },
  };
  /* risolve le etichette orari per la lingua richiesta, con fallback en -> it */
  function strings(lang) {
    var custom = (SITE.HOURS_I18N && SITE.HOURS_I18N[lang]) || null;
    var base = HOURS_BASE[lang] || HOURS_BASE.en;
    if (!custom) return base;
    var outp = {};
    Object.keys(HOURS_BASE.it).forEach(function (k) {
      outp[k] = custom[k] !== undefined ? custom[k] : base[k];
    });
    return outp;
  }

  function hoursState() {
    var now = romeNow();
    // finestra del giorno corrente
    var wins = SITE.hours[now.day] || [];
    for (var i = 0; i < wins.length; i++) {
      var s = toMin(wins[i][0]), e = toMin(wins[i][1]);
      if (now.mins >= s && now.mins < Math.min(e, 1440)) {
        return { open: true, day: now.day, closesAt: fmt(e) };
      }
    }
    // coda dopo mezzanotte della sera PRIMA
    var prev = (now.day + 6) % 7;
    var pw = SITE.hours[prev] || [];
    for (var j = 0; j < pw.length; j++) {
      var pe = toMin(pw[j][1]);
      if (pe > 1440 && now.mins < pe - 1440) {
        return { open: true, day: prev, closesAt: fmt(pe) };
      }
    }
    // chiuso: prossima apertura (oggi o nei prossimi 7 giorni)
    for (var k = 0; k < wins.length; k++) {
      if (now.mins < toMin(wins[k][0])) {
        return { open: false, day: now.day, opensToday: fmt(toMin(wins[k][0])) };
      }
    }
    for (var d = 1; d <= 7; d++) {
      var nd = (now.day + d) % 7;
      var nw = SITE.hours[nd] || [];
      if (nw.length) return { open: false, day: now.day, opensDay: nd, opensAt: fmt(toMin(nw[0][0])) };
    }
    return { open: false, day: now.day };
  }

  function renderHours() {
    var el = document.getElementById(SITE.hoursStatusId);
    var st = hoursState();
    document.querySelectorAll(SITE.hoursTableSelector).forEach(function (row) {
      row.classList.toggle(SITE.todayClass,
        parseInt(row.getAttribute('data-day'), 10) === st.day);
    });
    if (!el) return;
    /* V4: le etichette si risolvono per lingua corrente, non con un booleano
       en/it. Fallback a catena lingua -> en -> it, così un sito con AR o FR
       che non traduce lo stato orari resta comunque leggibile. */
    var L = strings(root.lang);
    var txt;
    if (st.open) {
      txt = L.open + ' · ' + L.closesAt + st.closesAt;
    } else if (st.opensToday) {
      txt = L.opensToday + st.opensToday;
    } else if (st.opensAt !== undefined) {
      txt = L.opensOn.replace('{day}', L.days[st.opensDay]) + st.opensAt;
    } else {
      txt = L.closed;
    }
    el.textContent = txt;
  }
  renderHours();
  setInterval(renderHours, 60000);

  /* ---------- i18n overlay (EN sopra l'IT del DOM) ---------- */
  var originals = {}; // attr -> key -> testo IT
  var I18N_ATTRS = [
    ['data-i18n', null],
    ['data-i18n-aria', 'aria-label'],
    ['data-i18n-alt', 'alt'],
    ['data-i18n-placeholder', 'placeholder'],
    ['data-i18n-title', 'title'],
  ];
  function setLang(lang) {
    /* V4: qualunque lingua dichiarata in SITE.LANGS, non più solo 'en'.
       'it' resta la lingua del DOM: nessun dizionario, nessuna sostituzione.
       Una lingua sconosciuta ricade su 'it' invece di rompere la pagina. */
    root.lang = (lang === 'it' || LANG_CODES.indexOf(lang) !== -1) ? lang : 'it';
    root.dir = SITE.RTL.indexOf(root.lang) !== -1 ? 'rtl' : 'ltr';
    var dict = SITE.LANGS[root.lang] || null;
    I18N_ATTRS.forEach(function (pair) {
      var dattr = pair[0], target = pair[1];
      if (!originals[dattr]) originals[dattr] = {};
      document.querySelectorAll('[' + dattr + ']').forEach(function (el) {
        var key = el.getAttribute(dattr);
        var store = originals[dattr];
        /* innerHTML, NON textContent: gli elementi tradotti contengono
           quasi sempre markup (<strong>, <br>) e con textContent il primo
           passaggio a EN lo appiattisce — tornando in italiano il grassetto
           non torna più. I valori del dizionario sono statici e scritti da
           noi. (20/7/2026: la flotta era già così, il boilerplate no.) */
        if (!(key in store)) store[key] = target ? el.getAttribute(target) : el.innerHTML;
        var val = dict && dict[key] !== undefined ? dict[key] : store[key];
        if (target) el.setAttribute(target, val); else el.innerHTML = val;
      });
    });
    renderHours();
    /* stato visivo della coppia di bottoni lingua, se il sito la usa */
    document.querySelectorAll('[data-lang]').forEach(function (b) {
      var on = b.getAttribute('data-lang') === root.lang;
      b.classList.toggle('is-on', on);
      if (b.tagName === 'BUTTON') b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    try { localStorage.setItem(SITE.slug + '-lang', lang); } catch (e) {}
  }
  /* 26/7/2026 (Il Papiro #168) — SI CABLANO ENTRAMBE LE FORME DI SELETTORE.
     Il canone conosceva solo il toggle singolo `#langToggle`, ma nella
     flotta esiste da tempo anche la COPPIA di bottoni `[data-lang]`
     (Warsa, Mido…): `i18n-roundtrip` era già stato insegnato a riconoscerle
     il 20/7, il plumbing no. Chi copiava il boilerplate e usava la coppia
     si ritrovava il cambio lingua MORTO, e nessun lint statico se ne
     accorgeva (lo becca solo qa-motion, a runtime). */
  var langToggle = document.getElementById('langToggle');
  if (langToggle) {
    /* V4: il toggle singolo CICLA sull'anello ['it', ...LANG_CODES].
       Con due lingue il comportamento è identico a prima (it <-> en). */
    var RING = ['it'].concat(LANG_CODES);
    langToggle.addEventListener('click', function () {
      var i = RING.indexOf(root.lang);
      setLang(RING[(i + 1) % RING.length]);
    });
  }
  document.querySelectorAll('[data-lang]').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); });
  });
  try {
    var saved = localStorage.getItem(SITE.slug + '-lang');
    if (saved && saved !== 'it' && LANG_CODES.indexOf(saved) !== -1) setLang(saved);
  } catch (e) {}

  /* ---------- action-bar mobile (opzionale: #actionBar) ---------- */
  var actionBar = document.getElementById('actionBar');
  if (actionBar) {
    var onScroll = function () {
      actionBar.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.6);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ══════════ FINE PLUMBING — da qui in giù SOLO il codice-firma
     del sito (animazioni e interazioni uniche del cliente), che si
     registra comunque SUBITO, mai dentro setTimeout/intro. ══════════ */
  /* ═══ FIRMA · Bar Suzzani — «Prima pagina.» ═══
     Il sito è il giornale del quartiere. La prima pagina arriva piegata a metà come un
     quotidiano sul banco: la parte sotto la piega è ripiegata (rotateX) e si apre scorrendo.
     La riga dell'edizione scrive la data di oggi. I numeri (194, 16, le lettere contate)
     salgono al valore quando entrano. Regole: gsap.set + gsap.to / ScrollTrigger; nessun
     elemento-firma è un .reveal; senza GSAP la pagina è piatta e tutto è visibile. */

  /* — l'edizione di oggi: la data vera, nella lingua scelta — */
  var edData = document.getElementById('edData');
  function renderData() {
    if (!edData) return;
    var lang = (document.documentElement.lang || 'it').slice(0, 2);
    var d = new Date();
    try {
      edData.textContent = new Intl.DateTimeFormat(lang === 'en' ? 'en-GB' : 'it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Rome' }).format(d);
    } catch (e) { edData.textContent = d.toLocaleDateString(); }
  }
  renderData();
  document.querySelectorAll('[data-lang]').forEach(function (b) { b.addEventListener('click', function () { setTimeout(renderData, 60); }); });

  /* — la piega — */
  var piega = document.querySelector('.piega');
  var piegaSotto = document.querySelector('.piega__sotto');
  var piegaOmbra = document.querySelector('.piega__ombra');
  var piegaViva = hasGsap && hasST && !reducedMotion && piega && piegaSotto;
  if (piegaSotto && !piegaViva) {   // senza GSAP o con motion ridotto: pagina piatta, subito
    piegaSotto.style.transform = 'none';
    if (piegaOmbra) piegaOmbra.style.opacity = '0';
  }

  /* — i numeri che salgono — */
  var numeri = Array.prototype.slice.call(document.querySelectorAll('[data-n]'));
  function setNum(el, frac) { el.textContent = Math.round((+el.getAttribute('data-n') || 0) * frac); }
  numeri.forEach(function (el) { setNum(el, 1); });   // stato finale subito: i numeri sono veri anche senza GSAP

  /* entrata della prima pagina: chiamata dal plumbing a fine intro */
  window.bespokeHeroEntrance = function () {
    if (!hasGsap || reducedMotion) return;
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.prima__nome', { y: 26, opacity: 0, duration: 0.9 }, 0)
      .from('.prima__insegne span', { opacity: 0, y: 8, duration: 0.4, stagger: 0.12 }, 0.5)
      .from('.prima__edizione', { opacity: 0, duration: 0.5 }, 0.3)
      .from('.prima__foto img', { scale: 1.05, duration: 1.4, ease: 'power2.out' }, 0.2)
      .from('.occhiello, .prima__titolo, .prima__lead, .prima__azioni', { opacity: 0, y: 14, duration: 0.5, stagger: 0.1 }, 0.7);
  };

  if (piegaViva) {
    gsap.set(piegaSotto, { rotateX: -78, transformOrigin: '50% 0%' });
    gsap.to(piegaSotto, { rotateX: 0, ease: 'none', scrollTrigger: { trigger: piega, start: 'top 88%', end: 'top 28%', scrub: 0.5 } });
    if (piegaOmbra) gsap.to(piegaOmbra, { opacity: 0, ease: 'none', scrollTrigger: { trigger: piega, start: 'top 88%', end: 'top 28%', scrub: 0.5 } });
  }
  if (hasGsap && hasST && !reducedMotion) {
    numeri.forEach(function (el, i) {
      setNum(el, 0);
      var proxy = { f: 0 };
      gsap.to(proxy, { f: 1, duration: 1.2, ease: 'power2.out', delay: (i % 7) * 0.08, onUpdate: function () { setNum(el, proxy.f); }, scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });
    /* gli annunci economici entrano uno alla volta, come composti a mano */
    gsap.utils.toArray('.annunci__lista li').forEach(function (el, i) {
      gsap.set(el, { opacity: 0, y: 10 });
      gsap.to(el, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out', delay: (i % 7) * 0.07, scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
    });
  }
})();

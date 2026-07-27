/* ==========================================================================
   Sanar con Amor — comportamiento del sitio
   Precarga, transición entre páginas, revelados, parallax y reservas.
   ========================================================================== */

(function () {
  'use strict';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  var easeOutCubic = function (p) { return 1 - Math.pow(1 - p, 3); };
  var pad2 = function (n) { return String(n).padStart(2, '0'); };
  var mayus = function (t) { return t ? t.charAt(0).toUpperCase() + t.slice(1) : t; };

  /* ────────────────────────────────────────────────────────────────────────
     Precarga: contador 00 → 100 y cortina que sube.
     Solo la primera visita de la sesión.
     ──────────────────────────────────────────────────────────────────────── */

  function preload() {
    var pre = $('#preloader');
    var num = $('#preloader-count');
    if (!pre) return;

    var seen = false;
    try { seen = !!sessionStorage.getItem('scam-preloaded'); } catch (e) { /* sin storage */ }
    if (seen) { pre.style.display = 'none'; return; }

    var marca = $('#pre-mark');
    var t0 = performance.now();
    var dur = 1700;

    var step = function (t) {
      var p = Math.min(1, (t - t0) / dur);
      var avance = easeOutCubic(p);

      if (num) num.textContent = pad2(Math.round(avance * 100));
      // El loto se llena al mismo ritmo que sube el contador.
      if (marca) marca.style.setProperty('--p', (avance * 100).toFixed(2) + '%');

      if (p < 1) {
        requestAnimationFrame(step);
        return;
      }

      try { sessionStorage.setItem('scam-preloaded', '1'); } catch (e) { /* sin storage */ }

      // Un respiro con el loto lleno antes de que suba la cortina.
      if (marca) marca.classList.add('is-full');
      setTimeout(function () {
        pre.classList.add('is-gone');
        setTimeout(function () { pre.style.display = 'none'; }, 1000);
      }, 430);
    };

    requestAnimationFrame(step);
  }

  /* ────────────────────────────────────────────────────────────────────────
     Revelados al hacer scroll
     ──────────────────────────────────────────────────────────────────────── */

  var io = null;
  var countIo = null;
  var fallbackTimer = null;

  function activeRoots() {
    var roots = [];
    var page = $('.page:not([hidden])');
    if (page) roots.push(page);
    var tail = $('.tail');
    if (tail) roots.push(tail);
    return roots;
  }

  function show(el) {
    var d = parseInt(el.getAttribute('data-rv-d'), 10) || 0;
    el.style.transitionDelay = d + 'ms';
    el.classList.add('is-in');
  }

  function revealAll() {
    activeRoots().forEach(function (root) {
      $$('[data-rv]', root).forEach(function (el) {
        if (!el.classList.contains('is-in')) show(el);
      });
    });
  }

  function countObserver() {
    if (countIo) return countIo;
    countIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        countIo.unobserve(el);
        var target = parseInt(el.getAttribute('data-count'), 10) || 0;
        var t0 = performance.now();
        var run = function (t) {
          var p = Math.min(1, (t - t0) / 1200);
          el.textContent = String(Math.round(easeOutCubic(p) * target));
          if (p < 1) requestAnimationFrame(run);
        };
        requestAnimationFrame(run);
      });
    }, { threshold: 0.4 });
    return countIo;
  }

  function scan() {
    if (!io) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          show(e.target);
          io.unobserve(e.target);
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
    }

    clearTimeout(fallbackTimer);
    fallbackTimer = setTimeout(revealAll, 2200);

    requestAnimationFrame(function () {
      var vh = window.innerHeight;
      activeRoots().forEach(function (root) {
        $$('[data-rv]', root).forEach(function (el) {
          if (el.dataset.rvArmed) return;
          el.dataset.rvArmed = '1';
          var r = el.getBoundingClientRect();
          // Lo que ya está en pantalla se muestra al instante, sin esperar
          // al observador; el resto entra al acercarse.
          if (r.top < vh * 0.94 && r.bottom > 0) show(el);
          else io.observe(el);
        });
        $$('[data-count]', root).forEach(function (el) {
          if (el.dataset.countArmed) return;
          el.dataset.countArmed = '1';
          countObserver().observe(el);
        });
      });
      parallax();
      paintNav(window.scrollY);
    });
  }

  /* ────────────────────────────────────────────────────────────────────────
     Parallax de las imágenes
     ──────────────────────────────────────────────────────────────────────── */

  function parallax() {
    var vh = window.innerHeight;
    activeRoots().forEach(function (root) {
      $$('[data-par]', root).forEach(function (el) {
        var host = el.parentElement;
        if (!host) return;
        var r = host.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        var amt = parseFloat(el.getAttribute('data-par')) || 30;
        var p = ((r.top + r.height / 2) - vh / 2) / vh;
        el.style.transform = 'translateY(' + (p * amt).toFixed(2) + 'px)';
      });
    });
  }

  /* ────────────────────────────────────────────────────────────────────────
     Cabecera: se oculta al bajar, se tiñe al pasar sobre el hero oscuro
     ──────────────────────────────────────────────────────────────────────── */

  var nav = $('#nav');
  var lastY = 0;

  function overlayOpen() {
    return document.body.classList.contains('is-locked');
  }

  function paintNav(y) {
    if (!nav) return;
    var dark = !!$('.page:not([hidden]) [data-hero-dark]') && y < window.innerHeight - 110;
    nav.classList.toggle('nav--dark', dark);
    nav.classList.toggle('is-solid', y > 40);
    nav.classList.toggle('is-hidden', !overlayOpen() && y > 220 && y > lastY);
  }

  /* ────────────────────────────────────────────────────────────────────────
     Rutas: cambio de página con cortina, sin recarga
     ──────────────────────────────────────────────────────────────────────── */

  var ROUTES = {
    inicio: {
      path: '/',
      title: 'Sanar con Amor · Rosa Elena Palomino — Constelaciones familiares, tarot evolutivo y meditación'
    },
    constelaciones: {
      path: '/constelaciones',
      title: 'Constelaciones familiares · Sanar con Amor'
    },
    tarot: {
      path: '/tarot',
      title: 'Tarot evolutivo · Sanar con Amor'
    },
    meditacion: {
      path: '/meditacion',
      title: 'Meditación y sanación emocional · Sanar con Amor'
    },
    acompanamiento: {
      path: '/acompanamiento',
      title: 'Acompañamiento de crecimiento personal · Sanar con Amor'
    },
    contacto: {
      path: '/contacto',
      title: 'Contacto · Sanar con Amor'
    },
    'aviso-legal': {
      path: '/aviso-legal',
      title: 'Aviso legal · Sanar con Amor'
    },
    privacidad: {
      path: '/privacidad',
      title: 'Política de privacidad · Sanar con Amor'
    }
  };

  var currentPage = 'inicio';

  function pageFromPath(path) {
    var clean = path.replace(/\/+$/, '') || '/';
    for (var key in ROUTES) {
      if (ROUTES[key].path === clean) return key;
    }
    return 'inicio';
  }

  function renderPage(page) {
    $$('.page').forEach(function (el) {
      el.hidden = el.getAttribute('data-page') !== page;
    });
    currentPage = page;
    document.title = ROUTES[page].title;
    var canonical = $('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', ROUTES[page].path);
    closeAllOverlays();
    scan();
  }

  function goTo(page, opts) {
    opts = opts || {};

    if (page === currentPage && !opts.force) {
      closeAllOverlays();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (opts.push !== false) {
      history.pushState({ page: page }, '', ROUTES[page].path);
    }

    var curtain = $('#curtain');
    var swap = function () {
      window.scrollTo(0, 0);
      lastY = 0;
      renderPage(page);
    };

    if (!curtain) { swap(); return; }

    curtain.style.transition = 'transform .5s cubic-bezier(.76,0,.24,1)';
    curtain.style.transform = 'translateY(0)';
    setTimeout(function () {
      swap();
      setTimeout(function () {
        curtain.style.transform = 'translateY(-100%)';
        setTimeout(function () {
          curtain.style.transition = 'none';
          curtain.style.transform = 'translateY(100%)';
        }, 560);
      }, 60);
    }, 520);
  }

  function jumpToAnchor(id) {
    var el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - 70,
      behavior: 'smooth'
    });
  }

  function goToAnchor(id) {
    if (currentPage !== 'inicio') {
      goTo('inicio');
      setTimeout(function () { jumpToAnchor(id); }, 1100);
    } else {
      jumpToAnchor(id);
    }
  }

  /* ────────────────────────────────────────────────────────────────────────
     Capas superpuestas: menú, modales y reserva
     ──────────────────────────────────────────────────────────────────────── */

  var menu = $('#menu');
  var burger = $('#burger');
  var drop = $('#drop');
  var dropBtn = $('#drop-btn');

  function lockScroll(on) {
    document.body.classList.toggle('is-locked', on);
  }

  function anyOverlayVisible() {
    return [$('#menu'), $('#modal-aviso'), $('#historia'), $('#booking')]
      .some(function (el) { return el && !el.hidden; });
  }

  function syncLock() { lockScroll(anyOverlayVisible()); }

  function openMenu() {
    if (!menu) return;
    menu.hidden = false;
    menu.classList.remove('is-closing');
    if (burger) burger.setAttribute('aria-expanded', 'true');
    syncLock();
  }

  function closeMenu(instant) {
    if (!menu || menu.hidden) return;
    if (burger) burger.setAttribute('aria-expanded', 'false');
    if (instant) {
      menu.hidden = true;
      menu.classList.remove('is-closing');
      syncLock();
      return;
    }
    // Sale deslizando, no desaparece de golpe.
    menu.classList.add('is-closing');
    setTimeout(function () {
      menu.hidden = true;
      menu.classList.remove('is-closing');
      syncLock();
    }, 400);
  }

  function openModal(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.hidden = false;
    syncLock();
  }

  function closeModals() {
    var el = document.getElementById('modal-aviso');
    if (el) el.hidden = true;
    syncLock();
  }

  function setDrop(open) {
    if (!drop) return;
    drop.classList.toggle('is-open', open);
    if (dropBtn) dropBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function closeAllOverlays() {
    closeMenu(true);
    closeModals();
    closeHistoria();
    closeBooking();
    setDrop(false);
    syncLock();
  }

  /* ────────────────────────────────────────────────────────────────────────
     Mi historia: capa a pantalla completa

     Índice de capítulos que se ilumina al desplazarse, barra de progreso de
     lectura y reproductor de la grabación. El reproductor se queda oculto
     mientras no exista /assets/audio/mi-historia.mp3, para que la ausencia
     del archivo no deje controles que no suenan.
     ──────────────────────────────────────────────────────────────────────── */

  var historia = $('#historia');
  var audio = $('#player-audio');
  var histArmada = false;

  function openHistoria() {
    if (!historia) return;
    closeMenu(true);
    closeModals();
    historia.hidden = false;
    armarHistoria();
    var doc = $('#historia-doc');
    if (doc) doc.scrollTop = 0;
    pintarHistoria();
    syncLock();
  }

  function closeHistoria() {
    if (!historia || historia.hidden) return;
    historia.hidden = true;
    if (audio && !audio.paused) audio.pause();
    syncLock();
  }

  function fmt(seg) {
    if (!isFinite(seg)) return '–:––';
    var m = Math.floor(seg / 60);
    var s = Math.floor(seg % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function pintarAudio() {
    if (!audio) return;
    var dur = audio.duration;
    var p = (isFinite(dur) && dur > 0) ? (audio.currentTime / dur) : 0;
    var mask = $('#player-mask');
    if (mask) mask.style.left = (p * 100) + '%';
    var cur = $('#player-cur');
    if (cur) cur.textContent = fmt(audio.currentTime);
    var bar = $('#player-bar');
    if (bar) bar.setAttribute('aria-valuenow', String(Math.round(p * 100)));
  }

  function buscarAudio(clientX) {
    var bar = $('#player-bar');
    if (!bar || !audio || !isFinite(audio.duration)) return;
    var r = bar.getBoundingClientRect();
    var p = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    audio.currentTime = p * audio.duration;
    pintarAudio();
  }

  // Capítulo activo y progreso de lectura.
  function pintarHistoria() {
    var doc = $('#historia-doc');
    if (!doc || !historia || historia.hidden) return;

    // Por debajo de 980px el que se desplaza es el contenedor de las columnas.
    var caja = doc.scrollHeight > doc.clientHeight + 1 ? doc : $('.historia__cols');
    if (!caja) return;

    var max = caja.scrollHeight - caja.clientHeight;
    var p = max > 0 ? Math.min(1, Math.max(0, caja.scrollTop / max)) : 0;
    var barra = $('#historia-progreso');
    if (barra) barra.style.width = (p * 100) + '%';

    var linea = caja.getBoundingClientRect().top + caja.clientHeight * 0.34;
    var activo = null;
    $$('.cap', historia).forEach(function (cap) {
      if (cap.getBoundingClientRect().top <= linea) activo = cap.id;
    });
    $$('.historia__cap', historia).forEach(function (b) {
      b.classList.toggle('is-on', b.getAttribute('data-cap') === activo);
    });
  }

  function armarHistoria() {
    if (histArmada || !historia) return;
    histArmada = true;

    // Onda del reproductor: alturas fijas, sin azar, para que el dibujo sea
    // siempre el mismo y no cambie entre visitas.
    var wave = $('#player-wave');
    if (wave) {
      var n = 56;
      var html = '';
      for (var i = 0; i < n; i++) {
        var v = Math.sin(i * 0.7) * 0.3 + Math.sin(i * 0.31) * 0.26 + Math.sin(i * 1.9) * 0.12;
        html += '<i style="--h:' + Math.round(34 + Math.abs(v) * 62) + '%"></i>';
      }
      wave.innerHTML = html;
    }

    if (audio) {
      // El <audio> está en el documento desde el principio con preload
      // metadata, así que para cuando se abre la capa el evento puede haber
      // pasado ya: hay que mirar también el estado actual.
      var listo = function () {
        var p = $('#player');
        if (p) p.hidden = false;
        var d = $('#player-dur');
        if (d) d.textContent = fmt(audio.duration);
        pintarAudio();
      };
      audio.addEventListener('loadedmetadata', listo);
      if (audio.readyState >= 1) listo();
      // Se pide aquí, no en el HTML: si la grabación aún no está subida, el
      // fallo ocurre una sola vez y solo para quien abra la capa.
      audio.preload = 'metadata';
      audio.src = AUDIO_HISTORIA;
      audio.addEventListener('timeupdate', pintarAudio);
      audio.addEventListener('play', function () { $('#player').classList.add('is-playing'); });
      audio.addEventListener('pause', function () { $('#player').classList.remove('is-playing'); });
      audio.addEventListener('ended', function () {
        $('#player').classList.remove('is-playing');
        audio.currentTime = 0;
        pintarAudio();
      });
    }

    var doc = $('#historia-doc');
    if (doc) doc.addEventListener('scroll', pintarHistoria, { passive: true });
    var cols = $('.historia__cols');
    if (cols) cols.addEventListener('scroll', pintarHistoria, { passive: true });

    var bar = $('#player-bar');
    if (bar) {
      bar.addEventListener('pointerdown', function (e) {
        buscarAudio(e.clientX);
        var mover = function (ev) { buscarAudio(ev.clientX); };
        var soltar = function () {
          window.removeEventListener('pointermove', mover);
          window.removeEventListener('pointerup', soltar);
        };
        window.addEventListener('pointermove', mover);
        window.addEventListener('pointerup', soltar);
      });
      bar.addEventListener('keydown', function (e) {
        if (!audio || !isFinite(audio.duration)) return;
        if (e.key === 'ArrowRight') { audio.currentTime = Math.min(audio.duration, audio.currentTime + 5); e.preventDefault(); }
        if (e.key === 'ArrowLeft') { audio.currentTime = Math.max(0, audio.currentTime - 5); e.preventDefault(); }
      });
    }
  }

  /* ────────────────────────────────────────────────────────────────────────
     Sistema de reservas
     ──────────────────────────────────────────────────────────────────────── */

  var booking = $('#booking');

  // Catálogo de sesiones. La clave es el valor de data-svc en el paso 1 y el
  // texto que viaja en la solicitud, así que debe coincidir con el HTML.
  // Precios de España, por sesión; `min` es lo que dura el hueco en el
  // calendario y en el .ics, `durTexto` lo que se muestra.
  var SERVICIOS = {
    'Constelaciones familiares': { min: 90, durTexto: '90 min', precio: 90, presencial: true },
    'Tarot evolutivo':           { min: 90, durTexto: '90 min', precio: 80, presencial: true },
    'Meditación guiada':         { min: 60, durTexto: '45–60 min', precio: 35, presencial: false },
    'Acompañamiento de crecimiento personal': { min: 90, durTexto: '90 min', precio: 95, presencial: true }
  };

  // Grabación de «Mi historia». Mientras el archivo no exista, la capa
  // funciona igual y el reproductor no se pinta. Ver assets/audio/LEEME.md.
  var AUDIO_HISTORIA = '/assets/audio/mi-historia.mp3';

  var WHATSAPP = '34672298203';
  var CORREO = 'sanarconamor.1@gmail.com';
  var INSTAGRAM = 'https://www.instagram.com/sanarconamor.coach';

  function datosDe(nombre) { return (nombre && SERVICIOS[nombre]) || null; }

  var res = {
    step: 1,
    maxStep: 1,
    intento: false,
    servicio: null,
    modalidad: 'online',
    dur: 90,
    y: new Date().getFullYear(),
    m: new Date().getMonth(),
    dia: null,
    hora: null,
    nombre: '',
    contacto: '',
    tel: '',
    motivo: '',
    copiado: false
  };

  var HINTS = {
    1: 'Puedes cambiar cualquier dato antes de enviar.',
    2: 'Los días con punto tienen huecos libres.',
    3: 'Solo necesito un nombre y una forma de contactarte.',
    4: 'Revisa el resumen y elige por dónde me lo envías.'
  };

  var TITLES = {
    1: 'Elige tu acompañamiento',
    2: 'Elige día y hora',
    3: 'Tus datos',
    4: 'Confirma tu solicitud'
  };

  // Huella estable por día y hora: mientras no haya agenda real, las horas
  // ocupadas son siempre las mismas para una misma fecha.
  function hash(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 100000;
    return h;
  }

  function isoOf(y, m, d) { return y + '-' + pad2(m + 1) + '-' + pad2(d); }

  function horasDe(iso) {
    var d = new Date(iso + 'T12:00:00');
    var dow = d.getDay();
    if (dow === 0) return [];                                   // domingo cerrado
    var base = dow === 6
      ? ['10:00', '11:30']                                      // sábado, solo mañana
      : ['10:00', '11:30', '13:00', '16:30', '18:00', '19:30'];
    var limite = new Date(Date.now() + 4 * 3600 * 1000);        // 4 h de antelación
    return base.map(function (t) {
      var cuando = new Date(iso + 'T' + t + ':00');
      var ocupada = hash(iso + t) % 10 < 3;
      return { t: t, libre: !ocupada && cuando > limite };
    });
  }

  function diaDisponible(iso) {
    var hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (new Date(iso + 'T12:00:00') < hoy) return false;
    return horasDe(iso).some(function (h) { return h.libre; });
  }

  function fechaLarga(iso) {
    if (!iso) return '';
    var d = new Date(iso + 'T12:00:00');
    var t = new Intl.DateTimeFormat('es-ES', {
      weekday: 'long', day: 'numeric', month: 'long'
    }).format(d).replace(',', '');
    return mayus(t);
  }

  function puedeSeguir() {
    if (res.step === 1) return !!res.servicio;
    if (res.step === 2) return !!(res.dia && res.hora);
    if (res.step === 3) return !!(res.nombre.trim() && res.contacto.trim());
    return true;
  }

  function monthLimits() {
    var hoy = new Date();
    return {
      min: new Date(hoy.getFullYear(), hoy.getMonth(), 1),
      max: new Date(hoy.getFullYear(), hoy.getMonth() + 4, 1)
    };
  }

  function renderCalendar() {
    var grid = $('#cal-grid');
    if (!grid) return;

    $('#cal-month').textContent = mayus(new Intl.DateTimeFormat('es-ES', {
      month: 'long', year: 'numeric'
    }).format(new Date(res.y, res.m, 1)));

    $$('.cal__day', grid).forEach(function (el) { el.remove(); });

    var primero = new Date(res.y, res.m, 1);
    var offset = (primero.getDay() + 6) % 7;               // la semana empieza en lunes
    var dias = new Date(res.y, res.m + 1, 0).getDate();
    var frag = document.createDocumentFragment();

    for (var i = 0; i < offset; i++) {
      var pad = document.createElement('span');
      pad.className = 'cal__day cal__day--pad';
      frag.appendChild(pad);
    }

    for (var d = 1; d <= dias; d++) {
      var iso = isoOf(res.y, res.m, d);
      var libre = diaDisponible(iso);
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cal__day' + (libre ? ' cal__day--free' : '') + (res.dia === iso ? ' is-on' : '');
      btn.disabled = !libre;
      btn.setAttribute('data-iso', iso);
      btn.setAttribute('aria-label', fechaLarga(iso) + (libre ? '' : ' — sin disponibilidad'));
      btn.appendChild(document.createTextNode(String(d)));
      var dot = document.createElement('span');
      dot.className = 'cal__dot';
      btn.appendChild(dot);
      frag.appendChild(btn);
    }

    grid.appendChild(frag);

    var lim = monthLimits();
    var shown = new Date(res.y, res.m, 1);
    $('#cal-prev').disabled = shown <= lim.min;
    $('#cal-next').disabled = shown >= lim.max;
  }

  function slotButton(h) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'slot' + (res.hora === h.t ? ' is-on' : '');
    b.disabled = !h.libre;
    b.setAttribute('data-hora', h.t);
    b.textContent = h.t;
    if (!h.libre) b.setAttribute('aria-label', h.t + ' — ocupada');
    return b;
  }

  function renderSlots() {
    var wrap = $('#slots-wrap');
    var empty = $('#slots-empty');
    if (!wrap) return;

    if (!res.dia) {
      wrap.hidden = true;
      empty.hidden = true;
      return;
    }

    var horas = horasDe(res.dia);
    if (!horas.length) {
      wrap.hidden = true;
      empty.hidden = false;
      return;
    }

    empty.hidden = true;
    wrap.hidden = false;
    $('#slots-date').textContent = fechaLarga(res.dia);

    var manana = horas.filter(function (h) { return parseInt(h.t, 10) < 14; });
    var tarde = horas.filter(function (h) { return parseInt(h.t, 10) >= 14; });

    var fill = function (listId, groupId, items) {
      var list = document.getElementById(listId);
      var group = document.getElementById(groupId);
      list.textContent = '';
      group.hidden = items.length === 0;
      items.forEach(function (h) { list.appendChild(slotButton(h)); });
    };

    fill('slots-morning-list', 'slots-morning', manana);
    fill('slots-afternoon-list', 'slots-afternoon', tarde);
  }

  function renderBooking() {
    if (!booking) return;

    $('#booking-title').textContent = TITLES[res.step];
    $('#booking-hint').textContent = HINTS[res.step];

    $$('.booking__step').forEach(function (el) {
      el.hidden = parseInt(el.getAttribute('data-step'), 10) !== res.step;
    });

    $$('.step-tab').forEach(function (tab) {
      var n = parseInt(tab.getAttribute('data-step-tab'), 10);
      tab.classList.toggle('is-done', res.step >= n);
    });

    $$('[data-svc]').forEach(function (b) {
      b.classList.toggle('is-on', b.getAttribute('data-svc') === res.servicio);
    });
    // La meditación guiada solo se hace online: con ella elegida, el botón de
    // presencial queda desactivado y se explica por qué.
    var svcData = datosDe(res.servicio);
    var soloOnline = !!svcData && !svcData.presencial;
    $$('[data-mod]').forEach(function (b) {
      var modo = b.getAttribute('data-mod');
      var off = soloOnline && modo === 'presencial';
      b.classList.toggle('is-on', modo === res.modalidad);
      b.classList.toggle('is-off', off);
      b.disabled = off;
    });
    var modNote = $('#mod-note');
    if (modNote) modNote.hidden = !soloOnline;

    if (res.step === 2) {
      renderCalendar();
      renderSlots();
    }

    var cita = (res.dia && res.hora)
      ? fechaLarga(res.dia) + ' · ' + res.hora + ' h'
      : 'Elige día y hora';

    var out = {
      servicio: res.servicio || 'Por elegir',
      modalidad: res.modalidad === 'online' ? 'Online' : 'Presencial',
      dur: svcData ? svcData.durTexto : '—',
      precio: svcData ? svcData.precio + ' €' : '—',
      cita: cita,
      nombre: res.nombre,
      contacto: res.contacto
    };

    $$('[data-out]').forEach(function (el) {
      var key = el.getAttribute('data-out');
      if (key in out) el.textContent = out[key];
    });

    $('#err-nombre').hidden = !(res.intento && !res.nombre.trim());
    $('#err-contacto').hidden = !(res.intento && !res.contacto.trim());
    $('#booking-copied').hidden = !res.copiado;

    var back = $('#booking-back');
    back.hidden = res.step <= 1;

    var next = $('#booking-next');
    next.hidden = res.step >= 4;
    next.textContent = res.step === 3 ? 'Revisar' : 'Continuar';
    var arrow = document.createElement('span');
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '→';
    next.appendChild(document.createTextNode(' '));
    next.appendChild(arrow);
    next.classList.toggle('is-off', !puedeSeguir());
  }

  function openBooking() {
    if (!booking) return;
    closeMenu(true);
    closeModals();
    booking.hidden = false;
    renderBooking();
    syncLock();
  }

  function closeBooking() {
    if (!booking || booking.hidden) return;
    booking.hidden = true;
    syncLock();
  }

  function setRes(patch) {
    Object.assign(res, patch);
    renderBooking();
  }

  function moverMes(delta) {
    var m = res.m + delta;
    var y = res.y;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    var lim = monthLimits();
    var target = new Date(y, m, 1);
    if (target < lim.min || target > lim.max) return;
    setRes({ y: y, m: m });
  }

  function textoReserva() {
    var tz = '';
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) { tz = ''; }
    var datos = datosDe(res.servicio);
    return [
      'Hola Rosa Elena, quiero reservar una sesión.',
      '',
      'Acompañamiento: ' + res.servicio,
      'Modalidad: ' + (res.modalidad === 'online' ? 'Online' : 'Presencial'),
      'Duración: ' + (datos ? datos.durTexto : res.dur + ' min'),
      datos ? 'Precio: ' + datos.precio + ' €' : '',
      'Fecha: ' + fechaLarga(res.dia) + ' a las ' + res.hora + (tz ? ' (' + tz + ')' : ''),
      'Nombre: ' + res.nombre,
      'Contacto: ' + res.contacto,
      res.tel ? 'Teléfono: ' + res.tel : '',
      '',
      res.motivo ? 'Qué me trae: ' + res.motivo : ''
    ].filter(Boolean).join('\n');
  }

  // WhatsApp y correo admiten el mensaje en la propia dirección, así que ahí
  // se abre ya escrito. Instagram no: para ese caso queda el portapapeles.
  function enviarReserva(canal) {
    var txt = textoReserva();
    try { navigator.clipboard.writeText(txt); } catch (e) { /* sin portapapeles */ }
    try { localStorage.setItem('scam-reserva', JSON.stringify(res)); } catch (e) { /* sin storage */ }
    setRes({ copiado: canal === 'ig' });

    if (canal === 'wa') {
      window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(txt), '_blank', 'noopener');
      return;
    }
    if (canal === 'mail') {
      var asunto = 'Reserva de sesión' + (res.servicio ? ' — ' + res.servicio : '');
      window.location.href = 'mailto:' + CORREO +
        '?subject=' + encodeURIComponent(asunto) +
        '&body=' + encodeURIComponent(txt);
      return;
    }
    window.open(INSTAGRAM, '_blank', 'noopener');
  }

  // Formulario de la página de contacto: no hay backend, así que compone el
  // mensaje y lo abre en WhatsApp o en el gestor de correo, ya escrito.
  function enviarFormulario(canal) {
    var val = function (sel) {
      var el = $(sel);
      return el ? el.value.trim() : '';
    };
    var txt = [
      'Hola Rosa Elena, me gustaría pedir cita.',
      '',
      val('#cf-nombre') ? 'Nombre: ' + val('#cf-nombre') : '',
      val('#cf-contacto') ? 'Contacto: ' + val('#cf-contacto') : '',
      val('#cf-modalidad') ? 'Modalidad: ' + val('#cf-modalidad') : '',
      val('#cf-servicio') ? 'Acompañamiento: ' + val('#cf-servicio') : '',
      '',
      val('#cf-motivo') ? 'Qué me trae: ' + val('#cf-motivo') : ''
    ].filter(Boolean).join('\n');

    if (canal === 'wa') {
      window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(txt), '_blank', 'noopener');
      return;
    }
    window.location.href = 'mailto:' + CORREO +
      '?subject=' + encodeURIComponent('Solicitud de cita') +
      '&body=' + encodeURIComponent(txt);
  }

  function descargarIcs() {
    if (!res.dia || !res.hora) return;
    var ini = new Date(res.dia + 'T' + res.hora + ':00');
    var fin = new Date(ini.getTime() + res.dur * 60000);
    var f = function (d) {
      return d.getFullYear() + pad2(d.getMonth() + 1) + pad2(d.getDate()) +
        'T' + pad2(d.getHours()) + pad2(d.getMinutes()) + '00';
    };
    var txt = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Sanar con Amor//ES', 'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      'UID:' + Date.now() + '@sanarconamor',
      'DTSTAMP:' + f(new Date()),
      'DTSTART:' + f(ini),
      'DTEND:' + f(fin),
      'SUMMARY:Sesión con Rosa Elena Palomino — ' + res.servicio,
      'DESCRIPTION:' + (res.modalidad === 'online'
        ? 'Sesión online. Recibirás el enlace por mensaje.'
        : 'Sesión presencial. Dirección a confirmar.'),
      'LOCATION:' + (res.modalidad === 'online' ? 'Videollamada' : 'Presencial'),
      'END:VEVENT', 'END:VCALENDAR'
    ].join('\r\n');

    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([txt], { type: 'text/calendar;charset=utf-8' }));
    a.download = 'sesion-sanar-con-amor.ics';
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
  }

  /* ────────────────────────────────────────────────────────────────────────
     Galería arrastrable
     ──────────────────────────────────────────────────────────────────────── */

  function initGallery() {
    var gal = $('#gallery');
    if (!gal) return;
    var down = false, sx = 0, sl = 0;

    gal.addEventListener('mousedown', function (e) {
      down = true;
      sx = e.pageX;
      sl = gal.scrollLeft;
      gal.classList.add('is-dragging');
    });
    window.addEventListener('mouseup', function () {
      down = false;
      gal.classList.remove('is-dragging');
    });
    gal.addEventListener('mousemove', function (e) {
      if (!down) return;
      e.preventDefault();
      gal.scrollLeft = sl - (e.pageX - sx) * 1.3;
    });
  }

  /* ────────────────────────────────────────────────────────────────────────
     Enlaces, botones y teclado
     ──────────────────────────────────────────────────────────────────────── */

  function initEvents() {
    document.addEventListener('click', function (e) {
      var t = e.target;
      var hit = function (sel) {
        return (t && t.closest) ? t.closest(sel) : null;
      };

      var link = hit('[data-link]');
      if (link) {
        e.preventDefault();
        goTo(link.getAttribute('data-link'));
        return;
      }

      var anchor = hit('[data-anchor]');
      if (anchor) {
        e.preventDefault();
        closeAllOverlays();
        goToAnchor(anchor.getAttribute('data-anchor'));
        return;
      }

      if (hit('[data-open-booking]')) { openBooking(); return; }
      if (hit('[data-close-booking]')) { closeBooking(); return; }
      if (hit('[data-open-aviso]')) { openModal('modal-aviso'); return; }
      if (hit('[data-open-ficha]')) { openHistoria(); return; }
      if (hit('[data-close-historia]')) { closeHistoria(); return; }
      if (hit('[data-close-modal]')) { closeModals(); return; }

      if (hit('#player-play')) {
        if (audio) { audio.paused ? audio.play() : audio.pause(); }
        return;
      }

      var cap = hit('.historia__cap');
      if (cap) {
        var destino = document.getElementById(cap.getAttribute('data-cap'));
        if (destino) destino.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      if (hit('[data-close-menu]')) { closeMenu(); return; }

      // Clic en el velo: cierra la capa.
      if (t.id === 'menu') { closeMenu(); return; }
      if (t.classList && t.classList.contains('modal')) { closeModals(); return; }

      if (burger && hit('#burger')) { openMenu(); return; }

      var faqBtn = hit('.faq__btn');
      if (faqBtn) {
        var item = faqBtn.parentElement;
        var open = !item.classList.contains('is-open');
        item.classList.toggle('is-open', open);
        faqBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        return;
      }

      if (dropBtn && hit('#drop-btn')) {
        e.preventDefault();
        setDrop(!drop.classList.contains('is-open'));
        return;
      }

      if (hit('#to-top')) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // ── Reserva ──
      var svc = hit('[data-svc]');
      if (svc) {
        var nombre = svc.getAttribute('data-svc');
        var datos = datosDe(nombre);
        // La duración la fija el acompañamiento, no la persona. Y si ese
        // acompañamiento no se hace presencial, la modalidad vuelve a online.
        setRes({
          servicio: nombre,
          dur: datos ? datos.min : res.dur,
          modalidad: (datos && !datos.presencial) ? 'online' : res.modalidad
        });
        return;
      }

      var mod = hit('[data-mod]');
      if (mod && !mod.disabled) { setRes({ modalidad: mod.getAttribute('data-mod') }); return; }

      var day = hit('[data-iso]');
      if (day && !day.disabled) { setRes({ dia: day.getAttribute('data-iso'), hora: null }); return; }

      var slot = hit('[data-hora]');
      if (slot && !slot.disabled) { setRes({ hora: slot.getAttribute('data-hora') }); return; }

      var tab = hit('[data-step-tab]');
      if (tab) {
        var n = parseInt(tab.getAttribute('data-step-tab'), 10);
        if (n <= res.step || n <= res.maxStep) setRes({ step: n });
        return;
      }

      if (hit('#cal-prev')) { moverMes(-1); return; }
      if (hit('#cal-next')) { moverMes(1); return; }
      if (hit('#booking-back')) { setRes({ step: Math.max(1, res.step - 1) }); return; }

      if (hit('#booking-next')) {
        if (!puedeSeguir()) { setRes({ intento: true }); return; }
        var next = Math.min(4, res.step + 1);
        setRes({ step: next, intento: false, maxStep: Math.max(res.maxStep, next) });
        return;
      }

      if (hit('#send-wa')) { enviarReserva('wa'); return; }
      if (hit('#send-mail')) { enviarReserva('mail'); return; }
      if (hit('#send-ig')) { enviarReserva('ig'); return; }
      if (hit('#send-ics')) { descargarIcs(); return; }

      if (hit('#cf-wa')) { enviarFormulario('wa'); return; }
      if (hit('#cf-mail')) { enviarFormulario('mail'); return; }

      if (hit('#booking-reset')) {
        setRes({ step: 1, maxStep: 1, servicio: null, dia: null, hora: null, copiado: false, intento: false });
        return;
      }
    });

    // El desplegable también responde al ratón, con la zona de hover ampliada.
    if (drop) {
      drop.addEventListener('mouseenter', function () { setDrop(true); });
      drop.addEventListener('mouseleave', function () { setDrop(false); });
    }

    // Campos de la reserva
    [['#res-nombre', 'nombre'], ['#res-contacto', 'contacto'], ['#res-tel', 'tel'], ['#res-motivo', 'motivo']]
      .forEach(function (pair) {
        var el = $(pair[0]);
        if (!el) return;
        el.addEventListener('input', function () {
          res[pair[1]] = el.value;
          // Sin re-render completo: escribir no debe mover el foco.
          $$('[data-out="' + pair[1] + '"]').forEach(function (o) { o.textContent = el.value; });
          if (res.intento) {
            $('#err-nombre').hidden = !!res.nombre.trim();
            $('#err-contacto').hidden = !!res.contacto.trim();
          }
          $('#booking-next').classList.toggle('is-off', !puedeSeguir());
        });
      });

    window.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (booking && !booking.hidden) { closeBooking(); return; }
      if (historia && !historia.hidden) { closeHistoria(); return; }
      closeAllOverlays();
    });

    var ticking = false;
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      paintNav(y);
      lastY = y;
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        parallax();
        ticking = false;
      });
    }, { passive: true });

    window.addEventListener('resize', function () {
      parallax();
      paintNav(window.scrollY);
    });

    window.addEventListener('popstate', function () {
      goTo(pageFromPath(location.pathname), { push: false });
    });
  }

  /* ────────────────────────────────────────────────────────────────────────
     Arranque
     ──────────────────────────────────────────────────────────────────────── */

  function init() {
    var start = pageFromPath(location.pathname);
    history.replaceState({ page: start }, '', location.pathname + location.hash);

    renderPage(start);
    renderBooking();
    preload();
    initGallery();
    initEvents();
    scan();

    // Red de seguridad: si algo impide que salte el observador, se muestra igual.
    setTimeout(revealAll, 3600);

    if (location.hash) {
      var id = location.hash.slice(1);
      setTimeout(function () { jumpToAnchor(id); }, 200);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

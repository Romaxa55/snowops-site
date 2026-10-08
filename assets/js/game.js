/* SnowOps — сайт как игра. Загрузка, меню, пауза, HUD, «глаз» обнаружения,
   камеры, пульт охраны, снаряжение из последнего релиза. Без JS страница
   остаётся обычной и читается целиком. */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (id) { return document.getElementById(id); };
  var all = function (sel, el) { return Array.prototype.slice.call((el || document).querySelectorAll(sel)); };
  var store = (function () { try { return window.sessionStorage; } catch (e) { return null; } })();

  /* ---------- ЗАГРУЗКА МИССИИ ---------- */
  var TIPS = [
    'В темноте тебя замечают позже.',
    'Часовой сначала окликнет: «Стой, назад!» — и только потом откроет огонь.',
    'Пост, который не отвечает по рации, пойдут проверять.',
    'Выстрел в щиток гасит всё здание. Но хлопок услышат.',
    'С тросом издалека ты — просто тень. Пока не воет сирена.',
    'Выстрел с глушителем слышно намного ближе.',
    'Найдут тело — будет тревога.'
  ];

  function boot() {
    var seen = store && store.getItem('snowops-boot');
    if (seen || reduce || location.hash) { root.classList.add('no-boot'); return; }
    var bar = $('boot-bar'), pct = $('boot-pct'), tip = $('boot-tip');
    tip.textContent = TIPS[Math.floor(Math.random() * TIPS.length)];
    var start = performance.now(), dur = 1500, done = false;
    function finish() {
      if (done) return;
      done = true;
      root.classList.add('booted');
      if (store) store.setItem('snowops-boot', '1');
      window.removeEventListener('keydown', finish);
      window.removeEventListener('pointerdown', finish);
    }
    function step(now) {
      if (done) return;
      var k = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - k, 2.2);
      bar.style.width = (eased * 100).toFixed(1) + '%';
      pct.textContent = Math.round(eased * 100) + '%';
      if (k < 1) requestAnimationFrame(step); else setTimeout(finish, 260);
    }
    window.addEventListener('keydown', finish);
    window.addEventListener('pointerdown', finish);
    requestAnimationFrame(step);
  }

  /* ---------- МЕНЮ: стрелки, Enter ---------- */
  function menuKeys(list, e) {
    var items = all('.menu__item', list);
    if (!items.length) return false;
    var i = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (i < 0) i = e.key === 'ArrowDown' ? -1 : 0;
      i = (i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
      items.forEach(function (it) { it.classList.remove('is-sel'); });
      items[i].classList.add('is-sel');
      items[i].focus({ preventScroll: true });
      return true;
    }
    return false;
  }

  /* Переход по меню — не «быстрая прокрутка»: глаз охраны на него не реагирует. */
  var navUntil = 0;
  function goTo(hash) {
    var target = hash && hash.length > 1 && document.querySelector(hash);
    if (!target) return false;
    navUntil = performance.now() + 1600;
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    if (history.replaceState) history.replaceState(null, '', hash);
    return true;
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (a && goTo(a.getAttribute('href'))) { e.preventDefault(); closePause(); }
  });

  /* ---------- ПАУЗА ---------- */
  var pause = $('pause'), pauseBtn = $('pause-open'), pauseFrom = null;
  function openPause() {
    if (!pause.hidden) return;
    pauseFrom = document.activeElement;
    pause.hidden = false;
    pauseBtn.setAttribute('aria-expanded', 'true');
    var first = pause.querySelector('.menu__item');
    all('.menu__item', pause).forEach(function (it) { it.classList.remove('is-sel'); });
    first.classList.add('is-sel');
    first.focus({ preventScroll: true });
  }
  function closePause() {
    if (pause.hidden) return;
    pause.hidden = true;
    pauseBtn.setAttribute('aria-expanded', 'false');
    if (pauseFrom && pauseFrom.focus) pauseFrom.focus({ preventScroll: true });
  }
  pauseBtn.addEventListener('click', openPause);
  pause.addEventListener('click', function (e) {
    if (e.target === pause || e.target.hasAttribute('data-close')) closePause();
  });

  /* ---------- ПРОСМОТР КАДРА ---------- */
  var view = $('view'), viewImg = $('view-img'), viewCap = $('view-cap'), viewCam = $('view-cam');
  var shots = all('#wall .monitor'), shotAt = 0, viewFrom = null;
  function showShot(i) {
    shotAt = (i + shots.length) % shots.length;
    var a = shots[shotAt];
    viewImg.src = a.getAttribute('href');
    viewImg.alt = a.querySelector('img').alt;
    viewCap.textContent = a.getAttribute('data-cap') || '';
    viewCam.textContent = (a.querySelector('.monitor__cam') || {}).textContent || '';
  }
  function openView(i) {
    viewFrom = document.activeElement;
    showShot(i);
    view.hidden = false;
    view.querySelector('.view__close').focus({ preventScroll: true });
  }
  function closeView() {
    if (view.hidden) return;
    view.hidden = true;
    viewImg.removeAttribute('src');
    if (viewFrom && viewFrom.focus) viewFrom.focus({ preventScroll: true });
  }
  shots.forEach(function (a, i) {
    a.addEventListener('click', function (e) { e.preventDefault(); openView(i); });
  });
  view.addEventListener('click', function (e) {
    var step = e.target.getAttribute && e.target.getAttribute('data-step');
    if (step) { showShot(shotAt + Number(step)); return; }
    if (e.target === view || e.target.classList.contains('view__close')) closeView();
  });

  /* ---------- КЛАВИАТУРА ---------- */
  var mainmenu = $('mainmenu');
  var heroOn = true;
  document.addEventListener('keydown', function (e) {
    if (!view.hidden) {
      if (e.key === 'Escape') closeView();
      else if (e.key === 'ArrowRight') showShot(shotAt + 1);
      else if (e.key === 'ArrowLeft') showShot(shotAt - 1);
      return;
    }
    if (e.key === 'Escape') { if (pause.hidden) openPause(); else closePause(); return; }
    if (!pause.hidden) { menuKeys(pause, e); return; }
    if (heroOn && !e.altKey && !e.metaKey && !e.ctrlKey) menuKeys(mainmenu, e);
  });

  /* ---------- HUD ---------- */
  var secs = all('main > .sec[data-mark]');
  var bar = $('bar'), strip = $('hud-strip'), secNum = $('hud-sec');
  $('hud-total').textContent = String(secs.length).padStart(2, '0');
  secs.forEach(function (s, i) {
    if (i) { var sep = document.createElement('em'); sep.textContent = '· · ·'; strip.appendChild(sep); }
    var m = document.createElement('span');
    m.textContent = s.getAttribute('data-mark');
    strip.appendChild(m);
  });
  var marks = all('span', strip), goals = all('#hud-goals li'), barGoal = $('bar-goal');

  function hudTick() {
    var vh = window.innerHeight, mid = vh * 0.45, cur = -1, frac = 0;
    secs.forEach(function (s, i) {
      var r = s.getBoundingClientRect();
      if (r.top <= mid) { cur = i; frac = Math.min(1, Math.max(0, (mid - r.top) / Math.max(1, r.height))); }
    });
    var pos = cur < 0 ? -0.5 : cur + frac - 0.5;
    strip.style.transform = 'translateX(' + (-60 - Math.max(0, pos) * 240) + 'px)';
    marks.forEach(function (m, i) { m.classList.toggle('is-here', i === cur); });
    goals.forEach(function (g, i) {
      g.classList.toggle('is-done', i < cur);
      g.classList.toggle('is-now', i === cur);
    });
    secNum.textContent = String(Math.max(0, cur + 1)).padStart(2, '0');
    var g = goals[Math.max(0, cur)];
    if (barGoal && g) barGoal.textContent = g.textContent.charAt(0).toLowerCase() + g.textContent.slice(1);
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) {
      heroOn = en[0].isIntersecting;
      bar.classList.toggle('is-on', !heroOn);
      root.classList.toggle('hud-off', heroOn);
      if (!heroOn) all('.menu__item.is-sel', mainmenu).forEach(function (it) { it.classList.remove('is-sel'); });
    }, { threshold: 0.35 }).observe(document.querySelector('.title'));
  } else {
    bar.classList.add('is-on');
  }

  /* ---------- «ГЛАЗ» ОХРАНЫ: быстрая прокрутка — шум ---------- */
  var eye = $('hud-eye'), meter = $('hud-meter'), state = $('hud-state'), toast = $('hud-toast');
  var level = 0, lastY = window.scrollY, lastT = performance.now(), scrollT = performance.now(), running = false, alerted = false, warned = false;
  function setEye() {
    meter.style.width = Math.round(level * 100) + '%';
    var alert = alerted;
    eye.classList.toggle('is-alert', alert);
    eye.classList.toggle('is-sus', !alert && level >= 0.35);
    state.textContent = alert ? '! Обнаружен' : level >= 0.35 ? '? Сомнение' : 'Скрытно';
  }
  function say(text) {
    toast.textContent = text;
    toast.classList.add('is-on');
    setTimeout(function () { toast.classList.remove('is-on'); }, 3800);
  }
  function eyeLoop() {
    var now = performance.now(), dt = Math.min(100, now - lastT);
    lastT = now;
    level = Math.max(0, level - dt / 2600);
    if (level < 0.35) alerted = false;
    setEye();
    if (level > 0) requestAnimationFrame(eyeLoop); else running = false;
  }
  function onScroll() {
    var now = performance.now(), y = window.scrollY;
    /* Скорость — между событиями прокрутки (после паузы — с нуля), не от кадра анимации. */
    var gap = now - scrollT;
    var speed = gap > 250 ? 0 : Math.abs(y - lastY) / Math.max(16, gap);
    lastY = y;
    scrollT = now;
    if (now > navUntil && !heroOn) {
      /* Шум — по времени, а не за событие (их 60 в секунду): только быстрее 3000 px/с. */
      /* Скачок (Home/End, полоса прокрутки) — одно событие: скорость с потолком, чтобы он один не поднимал тревогу. */
      level = Math.min(1, level + Math.max(0, Math.min(speed, 15) - 3) * Math.min(gap, 50) / 1000);
      if (level >= 0.999 && !alerted) {
        alerted = true;
        setEye();
        if (!warned) { warned = true; say('Слишком быстро листаешь — охрана насторожилась. Замри.'); }
      }
    }
    hudTick();
    if (!running && level > 0) { running = true; lastT = now; requestAnimationFrame(eyeLoop); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', hudTick);
  hudTick();
  setEye();

  /* ---------- КАК ДУМАЕТ ОХРАНА: камеры ---------- */
  var items = all('#intel-list .intel__item');
  var screen = $('intel-screen'), sImg = $('intel-img'), sCam = $('intel-cam'), sMood = $('intel-mood'), sTime = $('intel-time');
  function pick(li) {
    if (li.classList.contains('is-on')) return;
    items.forEach(function (it) { it.classList.toggle('is-on', it === li); });
    screen.classList.add('is-switch');
    var src = 'assets/img/real/' + li.getAttribute('data-shot') + '-1600.webp';
    var img = new Image();
    img.onload = img.onerror = function () {
      sImg.src = src;
      sImg.alt = li.querySelector('.intel__thumb').alt;
      sCam.textContent = li.getAttribute('data-cam');
      var mood = li.getAttribute('data-mood');
      sMood.textContent = mood;
      sMood.className = 'monitor__mood' + (mood === '!' ? ' is-alert' : mood === '·' ? ' is-calm' : '');
      setTimeout(function () { screen.classList.remove('is-switch'); }, 60);
    };
    img.src = src;
  }
  items.forEach(function (li) {
    var b = li.querySelector('button');
    b.addEventListener('click', function () { pick(li); });
    b.addEventListener('mouseenter', function () { if (window.matchMedia('(hover: hover)').matches) pick(li); });
    b.addEventListener('focus', function () { pick(li); });
  });
  sImg.alt = items.length ? items[0].querySelector('.intel__thumb').alt : '';
  var clock = 6 * 3600;
  setInterval(function () {
    clock = (clock + 1) % 86400;
    var h = Math.floor(clock / 3600), m = Math.floor(clock / 60) % 60, s = clock % 60;
    sTime.textContent = [h, m, s].map(function (n) { return String(n).padStart(2, '0'); }).join(':');
  }, 1000);

  /* ---------- ПОЯВЛЕНИЕ ---------- */
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('is-in'); io.unobserve(x.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    all('.sec .head, .brief__doc, .brief__photo, .intel, .kit, .wall, .classified, .log__list, .gear, .later, .notes').forEach(function (el, i) {
      el.classList.add('rise');
      if (el.classList.contains('gear')) el.style.transitionDelay = (i % 4) * 80 + 'ms';
      io.observe(el);
    });
  }

  /* ---------- СНАРЯЖЕНИЕ: последний релиз ---------- */
  function mb(bytes) { return Math.round(bytes / 1048576) + ' МБ'; }
  function ruDate(iso) {
    try { return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).replace(/\s*г\.$/, ''); }
    catch (e) { return String(iso).slice(0, 10); }
  }
  var FILES = {
    'android': /-android-.*\.apk$/,
    'windows-setup': /-windows-.*-setup\.exe$/,
    'windows-zip': /-windows-.*\.zip$/,
    'linux': /-linux\.tar\.gz$/,
    'macos': /-macos-.*\.zip$/
  };
  var rel = $('rel');
  if (rel && window.fetch) {
    fetch('https://api.github.com/repos/' + rel.getAttribute('data-repo') + '/releases?per_page=15', {
      headers: { Accept: 'application/vnd.github+json' }
    })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (list) {
        /* Не первый в списке: GitHub сортирует по дате коммита тега, а релизы сайта
           ставятся на старый коммит, и alpha.10 оказывался позади alpha.9. */
        var r = (list || []).filter(function (x) { return !x.draft && x.published_at; })
          .sort(function (a, b) { return Date.parse(b.published_at) - Date.parse(a.published_at); })[0];
        if (!r) return;
        var ours = (r.assets || []).filter(function (a) {
          return /^https:\/\/github\.com\/[^/]+\/[^/]+\/releases\/download\//.test(a.browser_download_url);
        });
        Object.keys(FILES).forEach(function (key) {
          var a = ours.filter(function (x) { return FILES[key].test(x.name); })[0];
          if (!a) return;
          all('[data-file="' + key + '"]').forEach(function (el) { el.href = a.browser_download_url; el.setAttribute('download', ''); });
          all('[data-size="' + key + '"]').forEach(function (el) { el.textContent = mb(a.size); });
        });
        var zip = ours.filter(function (x) { return FILES['windows-zip'].test(x.name); })[0];
        var setup = all('[data-size="windows-setup"]')[0];
        if (zip && setup && setup.textContent !== '—') setup.textContent += ' / zip ' + mb(zip.size);
        rel.textContent = '';
        var b = document.createElement('b');
        b.textContent = (r.prerelease ? 'Тестовая сборка ' : 'Версия ') + r.tag_name;
        rel.appendChild(b);
        rel.appendChild(document.createTextNode(' от ' + ruDate(r.published_at) + ' · '));
        var link = document.createElement('a');
        link.href = r.html_url;
        link.textContent = 'Открыть релиз и контрольные суммы';
        rel.appendChild(link);
        var ver = $('ver');
        if (ver) ver.textContent = r.tag_name;
      })
      .catch(function () { /* остаются ссылки на последний релиз */ });
  }

  boot();
})();

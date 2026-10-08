/* SnowOps — сайт как игра: один экран без прокрутки. Главное меню, экраны
   разделов со сменой шторкой, вкладки (Q/E), листалка (←/→, ◀ ▶, свайп),
   Esc — в меню, «Назад» браузера — тоже. Без JS страница обычная. */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mobile = window.matchMedia('(max-width: 760px)');
  var $ = function (id) { return document.getElementById(id); };
  var all = function (sel, el) { return Array.prototype.slice.call((el || document).querySelectorAll(sel)); };
  var store = (function () { try { return window.sessionStorage; } catch (e) { return null; } })();
  var pad2 = function (n) { return String(n).padStart(2, '0'); };

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
    if ((store && store.getItem('snowops-boot')) || reduce) { root.classList.add('no-boot'); return; }
    var bar = $('boot-bar'), pct = $('boot-pct');
    $('boot-tip').textContent = TIPS[Math.floor(Math.random() * TIPS.length)];
    var start = performance.now(), dur = 1400, done = false;
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
      var k = Math.min(1, (now - start) / dur), e = 1 - Math.pow(1 - k, 2.2);
      bar.style.width = (e * 100).toFixed(1) + '%';
      pct.textContent = Math.round(e * 100) + '%';
      if (k < 1) requestAnimationFrame(step); else setTimeout(finish, 240);
    }
    window.addEventListener('keydown', finish);
    window.addEventListener('pointerdown', finish);
    requestAnimationFrame(step);
  }

  /* ---------- ЭКРАНЫ ---------- */
  var screens = {};
  all('.screen').forEach(function (s) { screens[s.id] = s; });
  var ORDER = ['briefing', 'intel', 'recon', 'log', 'download'];
  var cur = null, busy = false, queued = null;
  var scene = $('scene'), sceneNum = $('scene-num'), sceneName = $('scene-name');
  var tabs = all('.tab'), goals = all('.goals li');
  var visited = {};
  try { visited = JSON.parse((store && store.getItem('snowops-goals')) || '{}') || {}; } catch (e) { visited = {}; }

  var GLYPHS = 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЭЮЯ0123456789#%&/<>';
  function decode(h) {
    if (!h || reduce) return;
    var text = h.getAttribute('data-text') || h.textContent;
    h.setAttribute('data-text', text);
    h.setAttribute('aria-label', text);
    var t0 = performance.now();
    (function f(now) {
      var k = Math.min(1, (now - t0) / 600), out = '';
      for (var i = 0; i < text.length; i++) {
        var c = text.charAt(i);
        out += (c === ' ' || c === '.' || i / text.length < k) ? c : GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length));
      }
      h.textContent = out;
      if (k < 1) requestAnimationFrame(f); else h.textContent = text;
    })(t0);
  }

  function markGoals() {
    goals.forEach(function (g) { g.classList.toggle('is-done', !!visited[g.getAttribute('data-goal')]); });
  }

  function show(id) {
    var next = screens[id];
    Object.keys(screens).forEach(function (k) {
      var s = screens[k], on = s === next;
      s.classList.toggle('is-active', on);
      if (!on) s.classList.remove('is-enter');
      if (on) s.removeAttribute('inert'); else s.setAttribute('inert', '');
    });
    root.classList.toggle('on-menu', id === 'menu');
    tabs.forEach(function (t) { t.classList.toggle('is-on', t.getAttribute('data-go') === id); });
    if (!reduce) { void next.offsetWidth; next.classList.add('is-enter'); setTimeout(function () { next.classList.remove('is-enter'); }, 1200); }
    if (id !== 'menu') {
      visited[id] = 1;
      if (store) store.setItem('snowops-goals', JSON.stringify(visited));
      decode(next.querySelector('h2'));
      var h = next.querySelector('h2');
      if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    } else {
      var first = $('mainmenu').querySelector('.menu__item');
      if (first && document.activeElement && document.activeElement !== document.body) first.focus({ preventScroll: true });
    }
    markGoals();
    cur = id;
    hintUpdate();
  }

  function go(id, fromPop) {
    if (!screens[id] || id === cur) return;
    if (busy) { queued = id; return; }
    if (!fromPop && history.pushState) history.pushState({ s: id }, '', id === 'menu' ? location.pathname + location.search : '#' + id);
    if (reduce || cur === null) { show(id); return; }
    busy = true;
    var n = ORDER.indexOf(id);
    sceneNum.textContent = n >= 0 ? 'Загрузка · ' + pad2(n + 1) + ' / ' + pad2(ORDER.length) : 'Возврат';
    sceneName.textContent = screens[id].getAttribute('data-mark');
    scene.classList.remove('is-on');
    void scene.offsetWidth;
    scene.classList.add('is-on');
    setTimeout(function () { show(id); }, 190);
    setTimeout(function () {
      scene.classList.remove('is-on');
      busy = false;
      if (queued && queued !== cur) { var q = queued; queued = null; go(q, true); } else queued = null;
    }, 640);
  }
  function stepTab(d) {
    var i = ORDER.indexOf(cur);
    if (i < 0) i = d > 0 ? -1 : 0;
    go(ORDER[(i + d + ORDER.length) % ORDER.length]);
  }

  function fromHash() {
    var id = (location.hash || '').slice(1);
    return screens[id] ? id : 'menu';
  }
  window.addEventListener('popstate', function () { go(fromHash(), true); });
  window.addEventListener('hashchange', function () { go(fromHash(), true); });

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-go], a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('data-go') || a.getAttribute('href').slice(1);
    if (screens[id]) { e.preventDefault(); go(id); }
  });

  /* ---------- ЛИСТАЛКИ: что листают ←/→, ◀ ▶ и свайп на каждом экране ---------- */
  function pager(el) {
    var pages = all('.page', el), at = 0;
    pages.forEach(function (p, i) { p.classList.toggle('is-cur', i === 0); });
    return {
      count: function () { return pages.length; },
      get: function () { return at; },
      set: function (i, d) {
        at = (i + pages.length) % pages.length;
        el.classList.toggle('is-back', d < 0);
        pages.forEach(function (p, k) { p.classList.toggle('is-cur', k === at); });
      }
    };
  }
  var briefPager = pager(document.querySelector('[data-pager="brief"]'));
  var intelPager = pager($('intel-list'));
  var gearPager = pager($('loadout'));

  /* Камера «Как думает охрана». */
  var items = all('#intel-list .intel__item');
  var iScreen = $('intel-screen'), iImg = $('intel-img'), iCam = $('intel-cam'), iMood = $('intel-mood');
  function noise(box) {
    box.classList.remove('is-switch');
    void box.offsetWidth;
    box.classList.add('is-switch');
    setTimeout(function () { box.classList.remove('is-switch'); }, 340);
  }
  function intelSet(i, d) {
    intelPager.set(i, d);
    var li = items[intelPager.get()];
    items.forEach(function (it) { it.classList.toggle('is-on', it === li); });
    noise(iScreen);
    var src = 'assets/img/real/' + li.getAttribute('data-shot') + '-1600.webp';
    var img = new Image();
    img.onload = img.onerror = function () {
      iImg.src = src;
      iImg.alt = li.querySelector('.intel__thumb').alt;
      iCam.textContent = li.getAttribute('data-cam');
      var mood = li.getAttribute('data-mood');
      iMood.textContent = mood;
      iMood.className = 'monitor__mood' + (mood === '!' ? ' is-alert' : mood === '·' ? ' is-calm' : '');
    };
    img.src = src;
  }
  items.forEach(function (li, i) {
    var b = li.querySelector('button');
    b.addEventListener('click', function () { if (intelPager.get() !== i) intelSet(i, i - intelPager.get()); hintUpdate(); });
    b.addEventListener('mouseenter', function () { if (!mobile.matches && window.matchMedia('(hover: hover)').matches && intelPager.get() !== i) { intelSet(i, 1); hintUpdate(); } });
  });
  iImg.alt = items[0].querySelector('.intel__thumb').alt;

  /* Пульт «Разведка». */
  var mons = all('#wall .monitor'), rMain = $('recon-main'), rImg = $('recon-img'), rCam = $('recon-cam'), rCap = $('recon-cap');
  var rAt = 0;
  function reconSet(i) {
    rAt = (i + mons.length) % mons.length;
    var a = mons[rAt];
    mons.forEach(function (m) { m.classList.toggle('is-on', m === a); });
    noise(rMain);
    var src = a.getAttribute('href');
    var img = new Image();
    img.onload = img.onerror = function () {
      rImg.src = src;
      rImg.alt = a.querySelector('img').alt;
      rCam.textContent = a.querySelector('.monitor__cam').textContent;
      rCap.textContent = a.getAttribute('data-cap');
    };
    img.src = src;
  }
  mons.forEach(function (a, i) {
    a.addEventListener('click', function (e) { e.preventDefault(); reconSet(i); hintUpdate(); });
  });

  var STEP = {
    briefing: { on: function () { return mobile.matches; }, n: function () { return briefPager.count(); }, at: function () { return briefPager.get(); }, set: function (i, d) { briefPager.set(i, d); }, word: 'Стр.' },
    intel: { on: function () { return true; }, n: function () { return items.length; }, at: function () { return intelPager.get(); }, set: intelSet, word: 'Донесение' },
    recon: { on: function () { return true; }, n: function () { return mons.length; }, at: function () { return rAt; }, set: reconSet, word: 'КАМ' },
    download: { on: function () { return mobile.matches; }, n: function () { return gearPager.count(); }, at: function () { return gearPager.get(); }, set: function (i, d) { gearPager.set(i, d); }, word: 'Слот' }
  };
  var hPrev = $('hint-prev'), hNext = $('hint-next'), hCount = $('hint-count');
  function stepper() { var s = STEP[cur]; return s && s.on() ? s : null; }
  function hintUpdate() {
    var s = stepper();
    hPrev.hidden = hNext.hidden = !s;
    hCount.textContent = s ? s.word + ' ' + (s.at() + 1) + ' / ' + s.n() : '';
  }
  function step(d) {
    var s = stepper();
    if (!s) return false;
    s.set(s.at() + d, d);
    hintUpdate();
    return true;
  }
  hPrev.addEventListener('click', function () { step(-1); });
  hNext.addEventListener('click', function () { step(1); });
  mobile.addEventListener && mobile.addEventListener('change', hintUpdate);

  /* Свайп на телефоне: влево-вправо — листать. */
  var tx = 0, ty = 0;
  document.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  document.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4 && cur !== 'menu' && $('view').hidden) step(dx < 0 ? 1 : -1);
  }, { passive: true });

  /* ---------- ПРОСМОТР КАДРА ---------- */
  var view = $('view'), viewImg = $('view-img'), viewCap = $('view-cap'), viewCam = $('view-cam'), viewFrom = null;
  function viewShow(i) {
    reconSet(i);
    var a = mons[rAt];
    viewImg.src = a.getAttribute('href');
    viewImg.alt = a.querySelector('img').alt;
    viewCap.textContent = a.getAttribute('data-cap');
    viewCam.textContent = a.querySelector('.monitor__cam').textContent;
    hintUpdate();
  }
  rMain.addEventListener('click', function () {
    viewFrom = document.activeElement;
    viewShow(rAt);
    view.hidden = false;
    view.querySelector('.view__close').focus({ preventScroll: true });
  });
  function viewClose() {
    if (view.hidden) return;
    view.hidden = true;
    viewImg.removeAttribute('src');
    if (viewFrom && viewFrom.focus) viewFrom.focus({ preventScroll: true });
  }
  view.addEventListener('click', function (e) {
    var d = e.target.getAttribute && e.target.getAttribute('data-step');
    if (d) { viewShow(rAt + Number(d)); return; }
    if (e.target === view || e.target.classList.contains('view__close')) viewClose();
  });

  /* ---------- КЛАВИАТУРА ---------- */
  function menuKeys(e) {
    var list = all('.menu__item', $('mainmenu'));
    var i = list.indexOf(document.activeElement);
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    if (i < 0) i = e.key === 'ArrowDown' ? -1 : 0;
    i = (i + (e.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length;
    list.forEach(function (it) { it.classList.remove('is-sel'); });
    list[i].classList.add('is-sel');
    list[i].focus({ preventScroll: true });
  }
  document.addEventListener('keydown', function (e) {
    if (e.altKey || e.metaKey || e.ctrlKey) return;
    if (!view.hidden) {
      if (e.key === 'Escape') viewClose();
      else if (e.key === 'ArrowRight') viewShow(rAt + 1);
      else if (e.key === 'ArrowLeft') viewShow(rAt - 1);
      return;
    }
    if (cur === 'menu') { menuKeys(e); return; }
    var k = e.key;
    if (k === 'Escape' || k === 'Backspace') { e.preventDefault(); go('menu'); }
    else if (k === 'q' || k === 'Q' || k === 'й' || k === 'Й' || k === 'PageUp') { e.preventDefault(); stepTab(-1); }
    else if (k === 'e' || k === 'E' || k === 'у' || k === 'У' || k === 'PageDown') { e.preventDefault(); stepTab(1); }
    else if (k === 'ArrowRight' || (k === 'ArrowDown' && cur === 'intel')) { if (step(1)) e.preventDefault(); }
    else if (k === 'ArrowLeft' || (k === 'ArrowUp' && cur === 'intel')) { if (step(-1)) e.preventDefault(); }
  });

  /* ---------- ЧАСЫ НА КАМЕРАХ ---------- */
  var clock = 6 * 3600, clocks = [$('intel-time'), $('recon-time')];
  setInterval(function () {
    clock = (clock + 1) % 86400;
    var t = [Math.floor(clock / 3600), Math.floor(clock / 60) % 60, clock % 60].map(pad2).join(':');
    clocks.forEach(function (c) { if (c) c.textContent = t; });
  }, 1000);

  /* ---------- СНАРЯЖЕНИЕ: последний релиз ---------- */
  function mb(b) { return Math.round(b / 1048576) + ' МБ'; }
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
    fetch('https://api.github.com/repos/' + rel.getAttribute('data-repo') + '/releases?per_page=15', { headers: { Accept: 'application/vnd.github+json' } })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (list) {
        /* Не первый в ответе: GitHub отдаёт релизы по коммиту тега, а релизы сайта
           стоят на старом коммите — alpha.10 оказывался позади alpha.9. */
        var r = (list || []).filter(function (x) { return !x.draft && x.published_at; })
          .sort(function (a, b) { return Date.parse(b.published_at) - Date.parse(a.published_at); })[0];
        if (!r) return;
        var ours = (r.assets || []).filter(function (a) { return /^https:\/\/github\.com\/[^/]+\/[^/]+\/releases\/download\//.test(a.browser_download_url); });
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
        rel.appendChild(document.createTextNode(' от ' + ruDate(r.published_at) + '. Ранняя версия: может падать и тормозить. '));
        var link = document.createElement('a');
        link.href = r.html_url;
        link.textContent = 'Релиз и контрольные суммы';
        rel.appendChild(link);
        var ver = $('ver');
        if (ver) ver.textContent = r.tag_name;
      })
      .catch(function () { /* остаются ссылки на последний релиз */ });
  }

  /* ---------- СТАРТ ---------- */
  markGoals();
  if (history.replaceState) history.replaceState({ s: fromHash() }, '');
  show(fromHash());
  boot();
})();

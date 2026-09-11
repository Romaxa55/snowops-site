/* Страница «скачать на Android»: QR и кнопка на ПОСЛЕДНЮЮ сборку.
 *
 * ЗАЧЕМ ОТДЕЛЬНАЯ СТРАНИЦА. Имя файла сборки содержит версию
 * (SnowOps-v0.1.0-alpha.8-android-arm64.apk), так что постоянной ссылки
 * на сам APK не существует — она менялась бы с каждым выпуском, а
 * напечатанный или разосланный QR-код переделать уже нельзя. Адрес этой
 * страницы постоянен, а версию она находит сама при каждом заходе.
 *
 * ЯЗЫК берётся из адреса (?lang=en) или из настроек браузера.
 */
(function () {
  'use strict';

  var REPO = 'Romaxa55/snowops-site';

  var TEXT = {
    ru: {
      title: 'SnowOps для Android',
      version: 'Версия',
      size: 'Размер',
      button: 'Скачать APK',
      scan: 'Наведите камеру телефона',
      loading: 'Ищем последнюю сборку…',
      failed: 'Не удалось получить список сборок. Откройте',
      failedLink: 'страницу релизов',
      steps: [
        'Скачайте файл и откройте его.',
        'Android спросит разрешение на установку из этого источника — разрешите.',
        'Если появится предупреждение Play Защиты, выберите «Всё равно установить».'
      ],
      note: 'Сборка ранняя: это демонстрация одной миссии.'
    },
    en: {
      title: 'SnowOps for Android',
      version: 'Version',
      size: 'Size',
      button: 'Download APK',
      scan: 'Point your phone camera here',
      loading: 'Looking for the latest build…',
      failed: 'Could not fetch the build list. Open the',
      failedLink: 'releases page',
      steps: [
        'Download the file and open it.',
        'Android will ask permission to install from this source — allow it.',
        'If Play Protect warns you, choose "Install anyway".'
      ],
      note: 'This is an early build: a demo of a single mission.'
    }
  };

  function pickLang() {
    var q = new URLSearchParams(location.search).get('lang');
    if (q === 'en' || q === 'ru') return q;
    var nav = (navigator.language || 'en').slice(0, 2).toLowerCase();
    return nav === 'ru' ? 'ru' : 'en';
  }

  var lang = pickLang();
  var t = TEXT[lang];
  document.documentElement.lang = lang;

  function byId(id) { return document.getElementById(id); }

  /* QR рисуется в <canvas> на месте: адрес никуда не уходит, и картинка
   * не зависит от чужого сервиса, который может закрыться. */
  function drawQR(text) {
    var canvas = byId('qr');
    if (!canvas || typeof qrcode !== 'function') return;
    var qr = qrcode(0, 'M');           // 0 — версия подбирается сама
    qr.addData(text);
    qr.make();
    var n = qr.getModuleCount();
    var quiet = 4;
    var px = Math.max(4, Math.floor(canvas.width / (n + quiet * 2)));
    var side = (n + quiet * 2) * px;
    canvas.width = canvas.height = side;
    var g = canvas.getContext('2d');
    g.fillStyle = '#ffffff';
    g.fillRect(0, 0, side, side);
    g.fillStyle = '#0b1420';
    for (var y = 0; y < n; y++) {
      for (var x = 0; x < n; x++) {
        if (qr.isDark(y, x)) {
          g.fillRect((x + quiet) * px, (y + quiet) * px, px, px);
        }
      }
    }
  }

  function apply(strings) {
    document.querySelectorAll('[data-t]').forEach(function (el) {
      var key = el.getAttribute('data-t');
      if (strings[key]) el.textContent = strings[key];
    });
    var list = byId('steps');
    if (list) {
      // Без innerHTML: узлы удаляются, а не переписываются строкой.
      while (list.firstChild) list.removeChild(list.firstChild);
      strings.steps.forEach(function (s) {
        var li = document.createElement('li');
        li.textContent = s;
        list.appendChild(li);
      });
    }
  }

  function show(asset, tag) {
    var btn = byId('get');
    btn.href = asset.browser_download_url;
    btn.textContent = t.button;
    btn.classList.remove('is-waiting');
    byId('version').textContent = t.version + ': ' + tag;
    byId('size').textContent = t.size + ': ' +
        Math.round(asset.size / 1048576) + ' MB';
  }

  function fail() {
    var btn = byId('get');
    btn.href = 'https://github.com/' + REPO + '/releases/latest';
    btn.textContent = t.failedLink;
    btn.classList.remove('is-waiting');
    byId('version').textContent = t.failed;
  }

  apply(t);
  drawQR(location.origin + location.pathname);
  byId('get').textContent = t.loading;

  fetch('https://api.github.com/repos/' + REPO + '/releases?per_page=10', {
    headers: { Accept: 'application/vnd.github+json' }
  }).then(function (r) {
    if (!r.ok) throw new Error(r.status);
    return r.json();
  }).then(function (releases) {
    for (var i = 0; i < releases.length; i++) {
      var rel = releases[i];
      if (rel.draft) continue;
      for (var j = 0; j < (rel.assets || []).length; j++) {
        var a = rel.assets[j];
        if (/android.*\.apk$/i.test(a.name)) {
          show(a, rel.tag_name);
          return;
        }
      }
    }
    fail();
  }).catch(fail);
})();

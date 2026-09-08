/* Альфа-сборки: подтягивает последний релиз из публичного репозитория сайта.
   Без JS или при ошибке API остаётся статическая ссылка на страницу релизов. */
(function () {
  var box = document.getElementById('alpha');
  if (!box || !window.fetch) return;

  var repo = box.getAttribute('data-repo');
  var list = box.querySelector('.alpha__list');
  var meta = box.querySelector('.alpha__meta');
  if (!repo || !list) return;

  var platforms = [
    { key: 'android', label: 'Android', hint: 'APK, arm64, Android 8.0 и новее' },
    { key: 'windows', label: 'Windows', hint: 'zip, x86_64, Windows 10 и новее' },
    { key: 'linux', label: 'Linux', hint: 'tar.gz, x86_64 и arm64 в одном архиве' },
    { key: 'macos', label: 'macOS', hint: 'zip, universal, macOS 11 и новее' }
  ];

  function el(tag, attrs, text) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { node.setAttribute(k, attrs[k]); });
    if (text) node.textContent = text;
    return node;
  }

  function icon() {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 44 44');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.6');
    svg.setAttribute('aria-hidden', 'true');
    ['M22 8v18m0 0-7-7m7 7 7-7', 'M8 28v6a2 2 0 0 0 2 2h24a2 2 0 0 0 2-2v-6'].forEach(function (d) {
      var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', d);
      svg.appendChild(p);
    });
    return svg;
  }

  function mb(bytes) {
    return Math.round(bytes / 1048576) + ' МБ';
  }

  function ruDate(iso) {
    try {
      return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) {
      return String(iso).slice(0, 10);
    }
  }

  function isOurs(url) {
    return /^https:\/\/github\.com\/[^/]+\/[^/]+\/releases\/download\//.test(url);
  }

  fetch('https://api.github.com/repos/' + repo + '/releases?per_page=5', {
    headers: { Accept: 'application/vnd.github+json' }
  })
    .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
    .then(function (releases) {
      var rel = (releases || []).filter(function (r) { return !r.draft; })[0];
      if (!rel) return;

      var frag = document.createDocumentFragment();
      platforms.forEach(function (p) {
        var asset = (rel.assets || []).filter(function (a) {
          return new RegExp('-' + p.key + '[.-]').test(a.name) && isOurs(a.browser_download_url);
        })[0];
        if (!asset) return;
        var a = el('a', { class: 'store', href: asset.browser_download_url });
        a.appendChild(icon());
        var span = el('span');
        span.appendChild(el('b', null, p.label));
        span.appendChild(el('small', null, p.hint + ', ' + mb(asset.size)));
        a.appendChild(span);
        var li = el('li');
        li.appendChild(a);
        frag.appendChild(li);
      });
      if (!frag.childNodes.length) return;

      list.textContent = '';
      list.appendChild(frag);
      if (meta) {
        meta.textContent = (rel.prerelease ? 'Тестовая сборка ' : 'Версия ') + rel.tag_name + ' от ' + ruDate(rel.published_at) +
          '. Контрольные суммы и заметки к выпуску на странице релиза. ';
        meta.appendChild(el('a', { href: rel.html_url }, 'Открыть релиз'));
      }
      box.classList.add('alpha--loaded');
    })
    .catch(function () { /* остаётся статическая ссылка */ });
})();

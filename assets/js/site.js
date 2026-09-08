(function () {
  var nav = document.getElementById('nav');
  var toggle = nav && nav.querySelector('.nav__toggle');
  var links = document.getElementById('nav-links');
  var narrow = window.matchMedia('(max-width: 820px)');

  function onScroll() {
    if (!nav) return;
    nav.classList.toggle('nav--solid', window.scrollY > 24);
  }

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Меню ---------- */

  if (toggle && links) {
    var setOpen = function (open) {
      links.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Закрыть' : 'Меню';
    };
    var isOpen = function () {
      return links.classList.contains('is-open');
    };

    toggle.addEventListener('click', function () {
      setOpen(!isOpen());
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A' && isOpen()) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) {
        setOpen(false);
        toggle.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (isOpen() && !nav.contains(e.target)) setOpen(false);
    });
    var onMediaChange = function (mq) {
      if (!mq.matches && isOpen()) setOpen(false);
    };
    if (narrow.addEventListener) {
      narrow.addEventListener('change', onMediaChange);
    } else if (narrow.addListener) {
      narrow.addListener(onMediaChange);
    }
  }

  /* ---------- Hero: бокс арта под размер секции, чтобы метки попадали в точку ---------- */

  var hero = document.getElementById('hero');
  var art = hero && hero.querySelector('.hero__art img');

  if (hero && art && 'ResizeObserver' in window) {
    var ratio = (art.getAttribute('width') / art.getAttribute('height')) || 1.796;

    var mapArt = function () {
      var W = hero.clientWidth;
      var H = hero.clientHeight;
      if (!W || !H) return;
      // cover: бокс не меньше секции по обеим сторонам, якорь 55% / 40% как у object-position в CSS
      var h = Math.max(H, W / ratio);
      var w = h * ratio;
      hero.style.setProperty('--art-w', w.toFixed(1) + 'px');
      hero.style.setProperty('--art-h', h.toFixed(1) + 'px');
      hero.style.setProperty('--art-x', ((W - w) * 0.55).toFixed(1) + 'px');
      hero.style.setProperty('--art-y', ((H - h) * 0.4).toFixed(1) + 'px');
      hero.classList.add('hero--mapped');
    };

    new ResizeObserver(mapArt).observe(hero);
    mapArt();
  }

  /* ---------- Кадры: стрелки и счётчик ---------- */

  var track = document.getElementById('shots-track');
  var count = document.getElementById('shots-count');
  var shotsNav = document.querySelector('.shots-nav');

  if (track && shotsNav) {
    var cards = track.querySelectorAll('.shot');
    var total = cards.length;

    var currentIndex = function () {
      var left = track.scrollLeft;
      var best = 0;
      var bestDist = Infinity;
      for (var i = 0; i < total; i++) {
        var d = Math.abs(cards[i].offsetLeft - track.offsetLeft - left);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      }
      return best;
    };

    var last = -1;
    var update = function () {
      var i = currentIndex();
      if (i === last) return;
      last = i;
      if (count) count.textContent = (i + 1) + ' / ' + total;
    };

    shotsNav.addEventListener('click', function (e) {
      var btn = e.target.closest('.shots-nav__btn');
      if (!btn) return;
      var dir = Number(btn.getAttribute('data-dir'));
      var next = Math.min(total - 1, Math.max(0, currentIndex() + dir));
      cards[next].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    });

    track.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      var dir = e.key === 'ArrowRight' ? 1 : -1;
      var next = Math.min(total - 1, Math.max(0, currentIndex() + dir));
      cards[next].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    });

    track.addEventListener('scroll', update, { passive: true });
    update();
  }
})();

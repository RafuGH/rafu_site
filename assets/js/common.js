/* RAFU official site — 全ページ共通（アイコン・効果音・SNS・ヘッダー・メニュー・ツールチップ・プレイヤー） */
(() => {
  'use strict';

  const C = window.RAFU_CONTENT || {};
  const root = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const pad2 = (n) => String(n).padStart(2, '0');
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } },
  };

  /* ---------- ドット絵アイコン（# は濃い色、+ と o は薄い色） ---------- */
  const PX = {
    home: '.....##...../....####..../...######.../..########../.##########./############/.##########./.##########./.####..####./.####..####./.####..####./.####..####.',
    news: '.#######..../.#+++++##.../.#+++++#+#../.#+++++####./.#++++++++#./.#+######+#./.#++++++++#./.#+######+#./.#++++++++#./.#+####+++#./.#++++++++#./.##########.',
    tv: '...#....#.../....#..#..../.....##...../############/#++++++++++#/#++++#+++++#/#++++##++++#/#++++###+++#/#++++##++++#/#++++#+++++#/############/.##......##.',
    cube: '.....##...../...######.../.##########./oo########++/oooo####++++/oooooo++++++/oooooo++++++/oooooo++++++/oooooo++++++/.ooooo+++++./...ooo+++.../.....o+.....',
    chest: '............/..########../.#++++++++#./#++++++++++#/############/#++++##++++#/#++++..++++#/#++++##++++#/#++++++++++#/#++++++++++#/############/............',
    dl: '....####..../....####..../....####..../....####..../.##########./..########../...######.../....####..../.....##...../##........##/##........##/############',
    copy: '............/..#######.../..#.....#.../..#.#######./..#.#+++++#./..#.#+++++#./..#.#+++++#./..###+++++#./....#+++++#./....#######./............/............',
    win: '............/.####..####./.####..####./.####..####./.####..####./............/............/.####..####./.####..####./.####..####./.####..####./............',
    mac: '......##..../.....##...../..###.####../.#+########./##+#########/############/############/############/.##########./.##########./..###..###../............',
    phone: '..########../..#......#../..#.++++.#../..#.++++.#../..#.++++.#../..#.++++.#../..#.++++.#../..#.++++.#../..#......#../..#..##..#../..#......#../..########..',
    droid: '..#......#../...#....#.../...######.../..########../.###.##.###./.##########./............/##.######.##/##.######.##/##.######.##/...##..##.../...##..##...',
    search: '...####...../..#++++#..../.#++++++#.../.#++++++#.../.#++++++#.../.#++++++#.../..#++++#..../...#####..../.......##.../........##../.........##./..........##',
    chat: '............/.##########./############/############/##..#..#..##/##..#..#..##/############/############/.##########./..###......./..##......../..#.........',
    up: '............/............/............/.....##...../....####..../...######.../..########../.##########./............/............/............/............',
    down: '............/............/............/............/.##########./..########../...######.../....####..../.....##...../............/............/............',
    sound: '............/.....#....../....##....#./...###..#..#/######...#.#/######.#.#.#/######.#.#.#/######...#.#/...###..#..#/....##....#./.....#....../............',
    mute: '............/.....#....../....##....../...###....../######.#...#/######..#.#./######...#../######..#.#./...###.#...#/....##....../.....#....../............',
    right: '............/............/...##......./....##....../.....##...../......##..../......##..../.....##...../....##....../...##......./............/............',
    sword: '.........###/........####/.......####./......####../.....####.../.#..####..../.##.###...../..####....../...##......./..####....../.##..##...../##..........',
    star: '.....##...../.....##...../....####..../############/.##########./..########../...######.../..###..###../..##....##../.##......##./............/............',
    heart: '............/.###...###../#####.#####./###########./###########./###########./.#########../..#######.../...#####..../....###...../.....#....../............',
    globe: '....####..../..##+##+##../.#++#++#++#./.#++#++#++#./############/#++#++++#++#/#++#++++#++#/############/.#++#++#++#./.#++#++#++#./..##+##+##../....####....',
    game: '................/................/................/...##########.../.##############./####.#######.###/###...#####.#.##/####.#######.###/################/################/#####......#####/####........####/.##..........##./................/................/................',
    potion: '................/.....######...../.....######...../......#..#....../......#..#....../.....##..##...../....#......#..../...#..+.....#.../..#..+.......#../..#++++++++++#../..#++++++++++#../..#++++++++++#../...#++++++++#.../....########..../................/................',
    gear: '.......##......./.......##......./...#...##...#.../..############../...##########.../...##########.../...###....###.../######....######/######....######/...###....###.../...##########.../...##########.../..############../...#...##...#.../.......##......./.......##.......',
    plug: '................/....##....##..../....##....##..../....##....##..../..############../..############../..#++++++++++#../..#++++++++++#../...#++++++++#.../....#++++++#..../.....######...../.......##......./.......##......./.......##......./.......##......./................',
  };
  const pxCache = {};
  const pxSvg = (name) => {
    if (pxCache[name]) return pxCache[name];
    const src = PX[name];
    if (!src) return '';
    const rows = src.split('/');
    const w = rows[0].length;
    const d = { '#': '', '+': '', o: '' };
    rows.forEach((r, y) => {
      for (let x = 0; x < w;) {
        const c = r[x];
        let n = 1;
        while (r[x + n] === c) n++;
        if (c !== '.') d[c] += `M${x} ${y}h${n}v1h-${n}z`;
        x += n;
      }
    });
    const cls = { '#': '', '+': ' class="t2"', o: ' class="t3"' };
    pxCache[name] = `<svg viewBox="0 0 ${w} ${rows.length}" shape-rendering="crispEdges" aria-hidden="true">${
      Object.keys(d).filter((k) => d[k]).map((k) => `<path${cls[k]} d="${d[k]}" fill="currentColor"/>`).join('')}</svg>`;
    return pxCache[name];
  };
  const setPx = (el, name) => { el.dataset.px = name; el.innerHTML = pxSvg(name); };
  const paintPx = (scope = document) => $$('[data-px]', scope).forEach((el) => { el.innerHTML = pxSvg(el.dataset.px); });

  /* ---------- SNSなどのロゴ ---------- */
  const ICON = {
    youtube: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12 31 31 0 0 0 1 16.8a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8ZM9.7 15.1V8.9L15.5 12Z"/></svg>',
    twitch: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.3 1.5 2.5 6v14.6h5.1v2.9h2.9l2.9-2.9h4.2l5.9-5.8V1.5Zm16 12.4-3.3 3.3h-4.6l-2.9 2.9v-2.9H5.6V3.6h14.7ZM17.2 7.1h-2.1v5.9h2.1Zm-5.3 0H9.8v5.9h2.1Z"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.6 1.5h-3.7v14.2a3.1 3.1 0 1 1-3.1-3.1c.3 0 .6 0 .9.1V8.9a6.9 6.9 0 1 0 5.9 6.8V8.5a8.6 8.6 0 0 0 4.9 1.6V6.4a4.9 4.9 0 0 1-4.9-4.9Z"/></svg>',
    x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.8 2.3h3.4l-7.4 8.4 8.7 11.5h-6.8l-5.3-7-6.1 7H.9l7.9-9L.5 2.3h7l4.8 6.4Zm-1.2 17.9h1.9L6.4 4.2H4.4Z"/></svg>',
    discord: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.3 4.4A19.6 19.6 0 0 0 15.4 3l-.6 1.3a18.2 18.2 0 0 0-5.6 0L8.6 3a19.5 19.5 0 0 0-4.9 1.5C.6 9.1-.3 13.6.1 18.1A19.8 19.8 0 0 0 6.1 21l1.3-2.1a12.8 12.8 0 0 1-2-1l.5-.4a14 14 0 0 0 12.2 0l.5.4c-.6.4-1.3.7-2 1l1.3 2.1a19.7 19.7 0 0 0 6-3c.5-5.2-.8-9.7-3.6-13.6ZM8 15.3c-1.2 0-2.2-1.1-2.2-2.4S6.8 10.5 8 10.5s2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Zm8 0c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Z"/></svg>',
  };
  $$('[data-icon]').forEach((el) => { el.innerHTML = ICON[el.dataset.icon] || ''; });

  /* ---------- sound (既定はOFF。ONのときだけ合成音を鳴らす) ---------- */
  const SFX = (() => {
    let ctx = null;
    let on = store.get('rafu-sfx') === 'on';
    const ensure = () => {
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        ctx = new AC();
      }
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    };
    const tone = (freq, dur, type = 'square', gain = 0.04, slideTo = 0, delay = 0) => {
      if (!on) return;
      const c = ensure();
      if (!c) return;
      const t = c.currentTime + delay;
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, t);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
      g.gain.setValueAtTime(gain, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(c.destination);
      o.start(t);
      o.stop(t + dur + 0.03);
    };
    const noise = (dur = 0.16, gain = 0.05) => {
      if (!on) return;
      const c = ensure();
      if (!c) return;
      const len = Math.floor(c.sampleRate * dur);
      const buf = c.createBuffer(1, len, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      const src = c.createBufferSource();
      src.buffer = buf;
      const f = c.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = 2600;
      const g = c.createGain();
      g.gain.setValueAtTime(gain, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
      src.connect(f).connect(g).connect(c.destination);
      src.start();
    };
    return {
      get on() { return on; },
      set(v) { on = v; store.set('rafu-sfx', v ? 'on' : 'off'); if (v) ensure(); },
      hover: () => tone(1500, 0.03, 'square', 0.014),
      click: () => tone(520, 0.09, 'triangle', 0.06, 900),
      zap: () => { noise(0.16, 0.06); tone(190, 0.12, 'sawtooth', 0.02, 80); },
      ok: () => { tone(660, 0.08, 'square', 0.03); tone(990, 0.14, 'square', 0.03, 0, 0.08); },
      laugh: () => { [0, 0.11, 0.22, 0.33].forEach((d, i) => tone(620 + (i % 2) * 120 - i * 20, 0.09, 'triangle', 0.07, 420, d)); },
    };
  })();

  const ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"/></svg>';
  const PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>';
  const PAD = '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M30 30h40a22 22 0 0 1 22 22v4a16 16 0 0 1-28 10l-4-5H40l-4 5A16 16 0 0 1 8 56v-4a22 22 0 0 1 22-22Z"/><path d="M28 42v14M21 49h14"/><circle cx="66" cy="45" r="2.5" fill="#fff"/><circle cx="74" cy="53" r="2.5" fill="#fff"/></svg>';

  /* 効果音の切り替え（ヘッダーは音量バー、ツールバーはドット絵のスピーカー） */
  const sfxBtns = $$('[data-sfx-toggle]');
  const paintSfx = () => {
    sfxBtns.forEach((b) => {
      b.setAttribute('aria-pressed', String(SFX.on));
      b.setAttribute('aria-label', SFX.on ? '効果音をオフにする' : '効果音をオンにする');
      if (b.dataset.tip !== undefined) b.dataset.tip = SFX.on ? '効果音 ON' : '効果音 OFF';
      const i = $('.px', b);
      if (i) setPx(i, SFX.on ? 'sound' : 'mute');
    });
  };
  sfxBtns.forEach((b) => b.addEventListener('click', () => { SFX.set(!SFX.on); paintSfx(); SFX.ok(); refreshTip(b); }));

  let lastHover = null;
  document.addEventListener('pointerover', (e) => {
    const t = e.target.closest('[data-sfx]');
    if (t && t !== lastHover && e.pointerType === 'mouse') SFX.hover();
    lastHover = t;
  });
  document.addEventListener('click', (e) => { if (e.target.closest('[data-sfx]') && !e.target.closest('[data-sfx-toggle]')) SFX.click(); });

  /* ---------- links from content.js ---------- */
  $$('[data-link]').forEach((a) => { const url = C[a.dataset.link]; if (url) a.href = url; });

  /* ---------- SNS ---------- */
  const sns = C.sns || [];
  $$('[data-sns-icons]').forEach((box) => {
    box.innerHTML = sns.map((s) => `<a class="icon-link" href="${esc(s.url)}" target="_blank" rel="noopener" aria-label="${esc(s.name)}" data-key="${esc(s.key)}" style="--brand:${esc(s.color)}" data-sfx>${ICON[s.key] || ''}</a>`).join('');
  });
  $$('[data-sns-list]').forEach((box) => {
    box.innerHTML = sns.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener" data-key="${esc(s.key)}" style="--brand:${esc(s.color)}" data-sfx>${ICON[s.key] || ''}<span>${esc(s.name)}</span><small>${esc(s.handle)}</small></a>`).join('');
  });
  const snsGrid = $('#sns-grid');
  if (snsGrid) {
    snsGrid.innerHTML = sns.map((s) => {
      const on = s.key === 'x' ? '#000' : '#fff';
      return `<a class="sns-tile" href="${esc(s.url)}" target="_blank" rel="noopener" style="--brand:${esc(s.color)};--on:${on}" data-sfx>
        <span class="sns-top">${ICON[s.key] || ''}<span class="sns-arrow" aria-hidden="true">↗</span></span>
        <span><span class="sns-name">${esc(s.name)}</span><span class="sns-handle">${esc(s.handle)}</span></span>
      </a>`;
    }).join('');
  }

  /* ---------- クリップボードへコピー（使えないブラウザでは昔の方法で） ---------- */
  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;opacity:0;left:0;top:0';
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (_) { ok = false; }
      ta.remove();
      return ok;
    }
  };

  /* ---------- toast ---------- */
  const toastEl = $('#toast');
  let toastTimer = 0;
  const toast = (msg) => {
    toastEl.textContent = msg;
    toastEl.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-show'), 2000);
  };

  /* ---------- ツールチップ（マイクラ風） ---------- */
  const tip = $('#mc-tip');
  let tipFor = null;
  const placeTip = (x, y, side) => {
    const w = tip.offsetWidth;
    const h = tip.offsetHeight;
    let tx;
    let ty;
    if (side === 'left') { tx = x - w - 14; ty = y - h / 2; } else { tx = x + 18; ty = y - h - 10; }
    if (tx + w > window.innerWidth - 8) tx = x - w - 18;
    tx = clamp(tx, 8, window.innerWidth - w - 8);
    ty = clamp(ty, 8, window.innerHeight - h - 8);
    tip.style.setProperty('--tx', `${Math.round(tx)}px`);
    tip.style.setProperty('--ty', `${Math.round(ty)}px`);
  };
  const showTip = (el, html, color) => {
    tipFor = el;
    tip.innerHTML = html;
    tip.style.setProperty('--tip-c', color || '#fff');
    tip.classList.add('is-show');
  };
  const hideTip = (el) => { if (!el || el === tipFor) { tip.classList.remove('is-show'); tipFor = null; } };
  const tipBeside = (el) => {
    const r = el.getBoundingClientRect();
    showTip(el, `<b>${esc(el.dataset.tip)}</b>`);
    placeTip(r.left, r.top + r.height / 2, 'left');
  };
  function refreshTip(el) { if (tipFor === el && el.dataset.tip) tipBeside(el); }
  $$('.gbar [data-tip]').forEach((el) => {
    el.addEventListener('pointerenter', () => tipBeside(el));
    el.addEventListener('pointerleave', () => hideTip(el));
    el.addEventListener('focus', () => { if (el.matches(':focus-visible')) tipBeside(el); });
    el.addEventListener('blur', () => hideTip(el));
  });
  window.addEventListener('scroll', () => { if (tipFor && !tipFor.closest('.gbar')) hideTip(); }, { passive: true });

  /* ---------- YouTube（サムネ・URL・プレイヤーで共通） ---------- */
  const KIND = { live: '配信', clip: '切り抜き', shorts: 'Shorts' };
  const thumbUrl = (v, q = 'hqdefault') => v.thumb || `https://i.ytimg.com/vi/${encodeURIComponent(v.id)}/${q}.jpg`;
  const watchUrl = (v) => (v.kind === 'shorts' ? `https://www.youtube.com/shorts/${encodeURIComponent(v.id)}` : `https://www.youtube.com/watch?v=${encodeURIComponent(v.id)}`);
  const ch = (n) => `CH.${pad2(n)}`;
  const fmtDate = (d) => (d ? String(d).replace(/-/g, '.') : '');
  /* YouTubeのURLでもIDだけでも受け付ける */
  const ytId = (s) => {
    const m = /(?:youtu\.be\/|[?&]v=|\/shorts\/|\/embed\/)([\w-]{6,})/.exec(String(s || ''));
    return m ? m[1] : String(s || '').trim();
  };

  /* ---------- 画像が読めないときは「Image not found」の絵に差し替える ----------
   * 横長の枠には 16:9、正方形に近い枠（アイコンなど）には正方形の絵を使う。
   * data-nf="self" の画像は自分で処理する（サムネイル・トップの絵）。 */
  const NO_IMG = { wide: 'assets/img/not-found.webp', square: 'assets/img/not-found-sq.webp' };
  const noImage = (img) => {
    const wide = img.clientWidth > img.clientHeight * 1.4;
    img.dataset.nf = 'done';
    img.classList.add('is-missing');
    img.removeAttribute('srcset');
    img.src = wide ? NO_IMG.wide : NO_IMG.square;
  };
  document.addEventListener('error', (e) => {
    const img = e.target;
    if (img instanceof HTMLImageElement && !img.dataset.nf) noImage(img);
  }, true);

  /* YouTubeは、高画質のサムネイルが無いときや動画が無いときに 120×90 の灰色の絵を返す */
  const loadThumb = (img, v, hi) => {
    img.classList.remove('is-missing');
    img.dataset.nf = 'self';
    delete img.dataset.fb;
    const retry = () => { img.dataset.fb = '1'; img.src = thumbUrl(v); };
    img.onload = () => {
      if (img.dataset.nf !== 'self' || v.thumb || img.naturalWidth > 120) return;
      if (hi && !img.dataset.fb) retry(); else noImage(img);
    };
    img.onerror = () => {
      if (img.dataset.nf !== 'self') return;
      if (hi && !v.thumb && !img.dataset.fb) retry(); else noImage(img);
    };
    img.src = hi && !v.thumb ? thumbUrl(v, 'maxresdefault') : thumbUrl(v);
    img.alt = '';
  };

  /* ---------- player dialog ---------- */
  const dlg = $('#player');
  const frame = $('#player-frame');
  let lastFocus = null;
  function openPlayer(v, label) {
    if (!dlg || typeof dlg.showModal !== 'function') { window.open(watchUrl(v), '_blank', 'noopener'); return; }
    lastFocus = document.activeElement;
    frame.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.id)}?autoplay=1&rel=0&playsinline=1" title="${esc(v.title)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
    dlg.classList.toggle('is-vertical', v.kind === 'shorts');
    $('#player-ch').textContent = label || `${ch(v.n)} / ${KIND[v.kind]}`;
    $('#player-link').href = watchUrl(v);
    dlg.showModal();
    root.style.overflow = 'hidden';
  }
  if (dlg) {
    $('#player-close').addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('close', () => {
      frame.innerHTML = '';
      root.style.overflow = '';
      if (lastFocus) lastFocus.focus({ preventScroll: true });
    });
  }

  /* ---------- 配布物のアイコンと色 ---------- */
  const WORK_PX = { game: 'game', datapack: 'potion', mod: 'gear', plugin: 'plug' };
  const lighten = (hex) => {
    const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || ''));
    if (!m) return '#fff';
    const n = parseInt(m[1], 16);
    const mix = (c) => Math.round(c + (255 - c) * 0.45);
    return `rgb(${mix(n >> 16)}, ${mix((n >> 8) & 255)}, ${mix(n & 255)})`;
  };

  /* ---------- reveal on scroll（data-reveal が画面に入ったら表示） ---------- */
  const revealIO = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); revealIO.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 }) : null;
  const reveal = (els) => els.forEach((el) => { if (revealIO) revealIO.observe(el); else el.classList.add('is-in'); });

  /* ---------- header: もっと見る ---------- */
  const moreBtn = $('#more-btn');
  const moreMenu = $('#more-menu');
  const setMore = (open) => {
    if (!moreBtn) return;
    moreMenu.hidden = !open;
    moreBtn.setAttribute('aria-expanded', String(open));
  };
  if (moreBtn) {
    moreBtn.addEventListener('click', (e) => { e.stopPropagation(); setMore(moreMenu.hidden); });
    document.addEventListener('click', (e) => { if (!moreMenu.hidden && !e.target.closest('.hdr-more')) setMore(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !moreMenu.hidden) { setMore(false); moreBtn.focus(); } });
  }

  /* ---------- header: スクロールで縮む・隠れる・進み具合のライン ---------- */
  const hdr = $('#hdr');
  let lastY = window.scrollY;
  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    hdr.style.setProperty('--progress', max > 0 ? (y / max).toFixed(4) : 0);
    hdr.classList.toggle('is-scrolled', y > 40);
    if (!root.classList.contains('menu-open')) {
      if (y > lastY + 6 && y > 320) { hdr.classList.add('is-hidden'); setMore(false); } else if (y < lastY - 6 || y < 120) hdr.classList.remove('is-hidden');
    }
    lastY = y;
    ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------- menu ---------- */
  const menu = $('#menu');
  const menuBtn = $('#menu-btn');
  const setMenu = (open) => {
    menu.classList.toggle('is-open', open);
    menu.inert = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    root.classList.toggle('menu-open', open);
    hdr.classList.remove('is-hidden');
    if (open) setTimeout(() => { const a = $('a', menu); if (a) a.focus({ preventScroll: true }); }, 350);
  };
  menuBtn.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); menuBtn.focus(); }
  });

  /* ---------- いまの欄（ヘッダーとツールバーの選択中・欄ごとの見た目） ---------- */
  const sections = $$('[data-section]');
  /* ページ内リンク（#〜）だけ切り替える。別ページへのリンクは HTML に書いた is-active のまま（ダウンロードページの宝箱など） */
  const navLinks = $$('.hdr-nav > a, .gbar-nav a').filter((a) => (a.getAttribute('href') || '').startsWith('#'));
  let activeId = sections[0] ? sections[0].id : '';
  const setActive = (sec) => {
    activeId = sec.id;
    navLinks.forEach((a) => {
      const on = a.getAttribute('href') === `#${activeId}`;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
    root.dataset.zone = sec.dataset.zone || 'stream';
  };
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(e.target); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- toolbar: しまう / 上下移動 ---------- */
  const gbarTab = $('#gbar-tab');
  const paintGbar = () => {
    const closed = root.classList.contains('gbar-closed');
    gbarTab.setAttribute('aria-expanded', String(!closed));
    gbarTab.setAttribute('aria-label', closed ? 'ナビを出す' : 'ナビをしまう');
    $('#gbar-panel').inert = closed;
  };
  if (gbarTab) {
    paintGbar();
    gbarTab.addEventListener('click', () => {
      const closed = root.classList.toggle('gbar-closed');
      store.set('rafu-gbar', closed ? 'closed' : 'open');
      hideTip();
      paintGbar();
    });
  }
  $$('[data-step]').forEach((b) => {
    b.addEventListener('click', () => {
      const list = sections.filter((s) => !s.hidden);
      const i = Math.max(0, list.findIndex((s) => s.id === activeId));
      const next = list[clamp(i + Number(b.dataset.step), 0, list.length - 1)];
      if (next) next.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    });
  });

  /* ページにもともとあるアイコンを描く（あとから足した分は各ページの script が paintPx を呼ぶ） */
  paintPx();
  paintSfx();

  window.RAFU = {
    C, root, $, $$, reduce, finePointer, clamp, pad2, esc, store,
    ICON, SFX, ARROW, PLAY, PAD, setPx, paintPx,
    toast, copyText, placeTip, showTip, hideTip,
    KIND, ch, fmtDate, ytId, thumbUrl, watchUrl, loadThumb, openPlayer,
    WORK_PX, lighten, reveal,
  };
})();

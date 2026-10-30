/* RAFU official site — 演出と content.js の描画 */
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

  /* ---------- hero media（1枚絵や動画を入れると赤い集中線の背景と入れ替わる） ---------- */
  const hero = C.hero || {};
  const kv = $('.kv');
  const mascotImg = $('#mascot-img');
  if (hero.mascot && mascotImg) mascotImg.src = hero.mascot;
  if (kv && (hero.video || hero.image)) {
    let media;
    if (hero.video) {
      media = document.createElement('video');
      media.className = 'kv-video';
      media.muted = true;
      media.loop = true;
      media.playsInline = true;
      media.setAttribute('playsinline', '');
      media.preload = 'metadata';
      if (hero.poster || hero.image) media.poster = hero.poster || hero.image;
      media.src = hero.video;
      if (!reduce) media.autoplay = true;
    } else {
      media = document.createElement('img');
      media.className = 'kv-photo';
      media.alt = '';
      media.src = hero.image;
    }
    $('.kv-bg', kv).prepend(media);
    kv.classList.add('has-media');
    if (hero.video && !reduce) media.play().catch(() => {});
  }

  /* ---------- split text ---------- */
  $$('[data-split]').forEach((el) => {
    const text = el.textContent;
    const offset = Number(el.dataset.splitOffset || 0);
    el.textContent = '';
    const sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = text;
    el.appendChild(sr);
    [...text].forEach((ch, i) => {
      const s = document.createElement('span');
      s.className = 'ch';
      s.setAttribute('aria-hidden', 'true');
      s.style.setProperty('--i', i + offset);
      s.textContent = ch;
      el.appendChild(s);
    });
  });

  /* ---------- marquee tapes ---------- */
  const buildMarquee = () => {
    $$('[data-marquee]').forEach((track) => {
      const seq = $('.tape-seq', track);
      if (!seq) return;
      $$('.tape-seq + .tape-seq', track).forEach((n) => n.remove());
      const base = seq.dataset.base || seq.innerHTML;
      seq.dataset.base = base;
      seq.innerHTML = base;
      let n = 0;
      while (seq.scrollWidth < window.innerWidth * 1.15 && n++ < 10) seq.insertAdjacentHTML('beforeend', base);
      const clone = seq.cloneNode(true);
      clone.removeAttribute('data-base');
      track.appendChild(clone);
      track.style.setProperty('--dur', `${Math.max(18, seq.scrollWidth / 70)}s`);
    });
  };
  buildMarquee();

  /* ---------- toast ---------- */
  const toastEl = $('#toast');
  let toastTimer = 0;
  const toast = (msg) => {
    toastEl.textContent = msg;
    toastEl.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-show'), 2000);
  };

  /* ---------- ツールチップ（Minecraftの欄ではマイクラ風になる） ---------- */
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

  /* ---------- videos（ピックアップ・モニター・プレイヤーで共通） ---------- */
  const KIND = { live: '配信', clip: '切り抜き', shorts: 'Shorts' };
  const videos = (C.videos || []).filter((v) => v && v.id).map((v, i) => ({ ...v, n: i + 1, kind: KIND[v.kind] ? v.kind : 'live' }));
  const thumbUrl = (v, q = 'hqdefault') => v.thumb || `https://i.ytimg.com/vi/${encodeURIComponent(v.id)}/${q}.jpg`;
  const watchUrl = (v) => (v.kind === 'shorts' ? `https://www.youtube.com/shorts/${encodeURIComponent(v.id)}` : `https://www.youtube.com/watch?v=${encodeURIComponent(v.id)}`);
  const ch = (n) => `CH.${pad2(n)}`;
  const fmtDate = (d) => (d ? String(d).replace(/-/g, '.') : '');
  /* YouTubeのURLでもIDだけでも受け付ける */
  const ytId = (s) => {
    const m = /(?:youtu\.be\/|[?&]v=|\/shorts\/|\/embed\/)([\w-]{6,})/.exec(String(s || ''));
    return m ? m[1] : String(s || '').trim();
  };

  const loadThumb = (img, v, hi) => {
    img.classList.remove('is-broken');
    delete img.dataset.fb;
    img.onload = () => {
      if (hi && !v.thumb && img.naturalWidth <= 120 && !img.dataset.fb) { img.dataset.fb = '1'; img.src = thumbUrl(v); }
    };
    img.onerror = () => {
      if (hi && !v.thumb && !img.dataset.fb) { img.dataset.fb = '1'; img.src = thumbUrl(v); } else img.classList.add('is-broken');
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

  /* HOME の「最新の動画を見る」 */
  const kvPlay = $('#kv-play');
  if (kvPlay) {
    if (videos.length) kvPlay.addEventListener('click', () => openPlayer(videos[0]));
    else kvPlay.hidden = true;
  }

  /* ---------- PICKUP（最新動画・自作ゲーム・Minecraft・Discord） ---------- */
  const games = (C.games || []).filter((g) => g && g.title);
  const pickupEl = $('#pickup');
  if (pickupEl) {
    const card = (tag, attrs, art, title, c) => `<${tag} class="pick" ${attrs} style="--c:${c}" data-sfx>
        <span class="pick-art">${art.tag ? `<span class="pick-tag">${art.tag}</span>` : ''}${art.html}</span>
        <span class="pick-body"><span class="pick-title">${esc(title)}</span>${ARROW}</span>
      </${tag}>`;
    const cards = [];
    if (videos[0]) cards.push(card('button', 'type="button" data-pick="video"', { tag: 'NEW VIDEO', html: '<img alt="" loading="lazy" width="480" height="360">' }, videos[0].title, '#000'));
    if (games[0]) {
      const g = games[0];
      cards.push(card('a', 'href="#game"', { tag: 'GAME', html: g.image ? `<img src="${esc(g.image)}" alt="" loading="lazy">` : `<span class="pa-burst"></span><span class="pa-icon">${PAD}</span>` }, g.title, 'var(--tomato)'));
    }
    cards.push(card('a', 'href="#minecraft"', { tag: 'MINECRAFT', html: '<span class="pa-pixel"><i class="px" data-px="cube"></i></span>' }, '参加型Minecraftサーバー', '#f47a35'));
    cards.push(card('a', `href="${esc(C.discord || '#community')}" target="_blank" rel="noopener"`, { tag: 'DISCORD', html: `<span class="pa-discord">${ICON.discord}</span>` }, 'Discordコミュニティに参加', 'var(--discord)'));
    pickupEl.innerHTML = cards.join('');
    const vb = $('[data-pick="video"]', pickupEl);
    if (vb) {
      loadThumb($('img', vb), videos[0], false);
      vb.addEventListener('click', () => openPlayer(videos[0]));
    }
  }

  /* ---------- NEWS ---------- */
  const NEWS_TAG = { 'お知らせ': '#e5121b', '配信': '#8a3fd1', Discord: '#5865f2', '更新': '#33801f', 'イベント': '#d4730b' };
  const newsEl = $('#news-list');
  if (newsEl) {
    const items = (C.news || []).filter((n) => n && n.title);
    newsEl.innerHTML = items.length ? items.map((n) => {
      const url = n.url ? (C[n.url] || n.url) : '';
      const inner = `<time datetime="${esc(n.date)}">${esc(fmtDate(n.date))}</time><span class="news-tag" style="--tag:${esc(NEWS_TAG[n.tag] || '#17161b')}">${esc(n.tag || 'お知らせ')}</span><span class="news-title">${esc(n.title)}</span>${ARROW}`;
      return `<li>${url ? `<a class="news-item" href="${esc(url)}" target="_blank" rel="noopener" data-sfx>${inner}</a>` : `<div class="news-item">${inner}</div>`}</li>`;
    }).join('') : '<li class="news-empty">新しいお知らせはまだありません。</li>';
  }

  /* schedule */
  const sched = $('#sched-list');
  if (sched) sched.innerHTML = (C.schedule || []).map((s) => `<div><dt>${esc(s.label)}</dt><dd>${esc(s.value)}</dd></div>`).join('');

  /* ---------- MOVIE（モニターと横に流れる一覧） ---------- */
  const tv = $('#tv');
  const tvImg = $('#tv-img');
  const tvNoise = $('#tv-noise');
  const listEl = $('#ch-list');
  const tabsEl = $('#ch-tabs');
  let current = null;
  let filter = 'all';

  let noiseRaf = 0;
  const staticBurst = (ms = 300) => {
    if (reduce || !tvNoise) return;
    const x = tvNoise.getContext('2d');
    if (!x) return;
    const w = tvNoise.width, h = tvNoise.height;
    const img = x.createImageData(w, h);
    const end = performance.now() + ms;
    cancelAnimationFrame(noiseRaf);
    tv.classList.add('is-switching');
    const draw = (now) => {
      for (let i = 0; i < img.data.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = 255;
      }
      x.putImageData(img, 0, 0);
      if (now < end) noiseRaf = requestAnimationFrame(draw);
      else tv.classList.remove('is-switching');
    };
    noiseRaf = requestAnimationFrame(draw);
  };

  /* 一覧の中で選んだ動画が見える位置まで横に送る（ページ自体は動かさない） */
  const revealItem = (id) => {
    const b = $$('.ch-item', listEl).find((x) => x.dataset.id === id);
    if (!b) return;
    const li = b.parentElement;
    const left = li.offsetLeft - listEl.offsetLeft;
    if (left < listEl.scrollLeft || left + li.offsetWidth > listEl.scrollLeft + listEl.clientWidth) {
      listEl.scrollTo({ left: Math.max(0, left - 4), behavior: reduce ? 'auto' : 'smooth' });
    }
  };

  let osdTimer = 0;
  const select = (v, fx = true) => {
    if (!v || !tv) return;
    current = v;
    if (fx) { staticBurst(); SFX.zap(); }
    const apply = () => {
      loadThumb(tvImg, v, true);
      $('#tv-title').textContent = v.title;
      $('#tv-date').textContent = fmtDate(v.date);
      $('#tv-date').setAttribute('datetime', v.date || '');
      const kind = $('#tv-kind');
      kind.textContent = KIND[v.kind];
      kind.className = `kind ${v.kind}`;
      $('#tv-ch').textContent = ch(v.n);
      $('#tv-osd').textContent = ch(v.n);
      $('#tv-screen').setAttribute('aria-label', `再生: ${v.title}`);
    };
    if (fx && !reduce) setTimeout(apply, 120); else apply();
    tv.classList.add('show-osd');
    clearTimeout(osdTimer);
    osdTimer = setTimeout(() => tv.classList.remove('show-osd'), 1600);
    $$('.ch-item', listEl).forEach((b) => b.setAttribute('aria-current', String(b.dataset.id === v.id)));
    if (fx) revealItem(v.id);
  };

  const shown = () => videos.filter((v) => filter === 'all' || v.kind === filter);
  const renderList = () => {
    listEl.innerHTML = shown().map((v) => `
      <li><button class="ch-item" type="button" data-id="${esc(v.id)}" aria-current="${Boolean(current && current.id === v.id)}" data-sfx>
        <span class="ch-thumb"><img alt="" loading="lazy" width="320" height="180"></span>
        <span class="ch-body">
          <span class="ch-meta"><b>${ch(v.n)}</b><span class="kind ${v.kind}">${KIND[v.kind]}</span><time datetime="${esc(v.date)}">${esc(fmtDate(v.date))}</time></span>
          <span class="ch-title">${esc(v.title)}</span>
        </span>
      </button></li>`).join('');
    $$('.ch-item', listEl).forEach((b) => {
      const v = videos.find((x) => x.id === b.dataset.id);
      loadThumb($('img', b), v, false);
      b.addEventListener('click', () => {
        if (current && current.id === v.id) { openPlayer(v); return; }
        select(v);
        if (window.innerWidth <= 900) tv.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
      });
    });
  };

  /* 左右の矢印: いま並んでいる中で前後の動画に切り替える */
  const stepVideo = (d) => {
    const items = shown();
    if (!items.length) return;
    const i = items.findIndex((v) => current && v.id === current.id);
    select(items[i < 0 ? 0 : (i + d + items.length) % items.length]);
  };

  if (tv && videos.length) {
    const kinds = ['all', ...Object.keys(KIND).filter((k) => videos.some((v) => v.kind === k))];
    tabsEl.innerHTML = kinds.map((k) => {
      const count = k === 'all' ? videos.length : videos.filter((v) => v.kind === k).length;
      return `<button class="ch-tab" type="button" role="tab" data-kind="${k}" aria-selected="${k === 'all'}" data-sfx>${k === 'all' ? 'すべて' : KIND[k]}<small>${count}</small></button>`;
    }).join('');
    tabsEl.addEventListener('click', (e) => {
      const b = e.target.closest('.ch-tab');
      if (!b) return;
      filter = b.dataset.kind;
      $$('.ch-tab', tabsEl).forEach((t) => t.setAttribute('aria-selected', String(t === b)));
      renderList();
      listEl.scrollLeft = 0;
    });
    select(videos[0], false);
    renderList();
    $('#tv-screen').addEventListener('click', () => current && openPlayer(current));
    $('#tv-prev').addEventListener('click', () => stepVideo(-1));
    $('#tv-next').addEventListener('click', () => stepVideo(1));
    if (videos.length < 2) $$('.tv-arrow').forEach((b) => { b.hidden = true; });
  } else if (tv) {
    [$('.tv-wrap'), tabsEl, listEl].forEach((el) => { if (el) el.hidden = true; });
  }

  /* ---------- GAME ---------- */
  const gamesEl = $('#games-list');
  if (gamesEl) {
    gamesEl.innerHTML = games.map((g, i) => {
      const trailer = g.trailer ? ytId(g.trailer) : '';
      const points = (g.points || []).filter((p) => p && p.title);
      return `<article class="game" data-reveal>
        <div class="game-art">
          ${g.image ? `<img src="${esc(g.image)}" alt="${esc(g.title)}の画面" loading="lazy">` : `<div class="game-ph">${PAD}<span>NOW DEVELOPING</span></div>`}
          ${trailer ? `<button class="trailer" type="button" data-trailer="${i}" data-sfx>${PLAY}<span>紹介動画</span></button>` : ''}
        </div>
        <div class="game-body">
          ${g.maker ? `<p class="game-maker">${esc(g.maker)}</p>` : ''}
          <h3 class="game-title">${esc(g.title)}</h3>
          ${g.catch ? `<p class="game-catch">${esc(g.catch)}</p>` : ''}
          ${g.text ? `<p class="game-text">${esc(g.text)}</p>` : ''}
          ${points.length ? `<ul class="game-points">${points.map((p) => `<li><b>${esc(p.title)}</b><span>${esc(p.text)}</span></li>`).join('')}</ul>` : ''}
          <div class="game-cta">
            ${g.url ? `<a class="btn btn-ink" href="${esc(g.url)}" target="_blank" rel="noopener" data-sfx><span>配布ページへ</span><svg class="arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"/></svg></a>` : ''}
            ${trailer ? `<button class="btn btn-white" type="button" data-trailer="${i}" data-sfx><span>紹介動画を見る</span></button>` : ''}
          </div>
        </div>
      </article>`;
    }).join('');
    gamesEl.addEventListener('click', (e) => {
      const b = e.target.closest('[data-trailer]');
      if (!b) return;
      const g = games[Number(b.dataset.trailer)];
      openPlayer({ id: ytId(g.trailer), title: g.title, kind: 'live', n: 0 }, `TRAILER / ${g.title}`);
    });
    if (!games.length) $('#game').hidden = true;
  }

  /* ---------- SERVER ---------- */
  const S = C.server || {};
  const setText = (sel, v) => { const el = $(sel); if (el && v) el.textContent = v; };
  setText('#srv-address', S.address);
  setText('#srv-port', S.bedrockPort);
  setText('#srv-editions', S.editions);
  setText('#srv-version', S.version);
  if (S.versionNote) setText('#srv-version-note', `（${S.versionNote}）`);

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
  $$('[data-copy]').forEach((btn) => {
    const label = $('span', btn);
    btn.addEventListener('click', async () => {
      const src = $(btn.dataset.copy);
      const text = src ? src.textContent.trim() : '';
      const ok = await copyText(text);
      if (ok) {
        label.textContent = 'コピーしました';
        btn.classList.add('is-done');
        const card = btn.closest('.srv-card');
        card.classList.remove('is-copied');
        void card.offsetWidth;
        card.classList.add('is-copied');
        SFX.ok();
        toast(`「${text}」をコピーしました`);
      } else {
        const r = document.createRange();
        r.selectNodeContents(src);
        const sel = getSelection();
        sel.removeAllRanges();
        sel.addRange(r);
        label.textContent = '選択しました';
      }
      setTimeout(() => { label.textContent = 'コピー'; btn.classList.remove('is-done'); }, 1800);
    });
  });

  $$('.srv-ed button').forEach((b) => {
    b.addEventListener('click', () => {
      $$('.srv-ed button').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
      $('#srv-port-field').hidden = b.dataset.ed !== 'bedrock';
    });
  });

  const statusEl = $('#srv-status');
  const paintStatus = (state, label, detail = '') => {
    statusEl.dataset.state = state;
    $('.st-label', statusEl).textContent = label;
    $('.st-detail', statusEl).textContent = detail;
  };
  if (statusEl && S.address && S.showStatus !== false && 'fetch' in window) {
    const ctl = 'AbortController' in window ? new AbortController() : null;
    const to = setTimeout(() => ctl && ctl.abort(), 8000);
    fetch(`https://api.mcsrvstat.us/3/${encodeURIComponent(S.address)}`, ctl ? { signal: ctl.signal } : {})
      .then((r) => r.json())
      .then((j) => {
        if (j && j.online) {
          const p = j.players ? `${j.players.online} / ${j.players.max} 人がプレイ中` : '';
          paintStatus('online', 'ONLINE', p);
        } else {
          paintStatus('offline', 'OFFLINE', 'いまは閉まっています');
        }
      })
      .catch(() => paintStatus('unknown', 'STATUS', '状態を確認できませんでした'))
      .finally(() => clearTimeout(to));
  } else if (statusEl) {
    statusEl.hidden = true;
  }

  /* ---------- Minecraftの配布物 ---------- */
  const WORK_PX = { game: 'game', datapack: 'potion', mod: 'gear', plugin: 'plug' };
  const lighten = (hex) => {
    const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || ''));
    if (!m) return '#fff';
    const n = parseInt(m[1], 16);
    const mix = (c) => Math.round(c + (255 - c) * 0.45);
    return `rgb(${mix(n >> 16)}, ${mix((n >> 8) & 255)}, ${mix(n & 255)})`;
  };
  const worksEl = $('#works-list');
  if (worksEl) {
    const works = C.works || [];
    worksEl.innerHTML = works.map((w) => `
      <a class="work" href="${esc(w.url)}" target="_blank" rel="noopener" style="--c:${esc(w.color || '#e5121b')}" data-reveal data-sfx>
        <span class="work-art">
          <span class="work-tag">${esc((w.icon || 'work').toUpperCase())}</span>
          ${w.image ? `<img src="${esc(w.image)}" alt="" loading="lazy">` : `<span class="work-slot"><i class="px" data-px="${WORK_PX[w.icon] || 'chest'}"></i></span>`}
        </span>
        <span class="work-body">
          <span class="work-cat">${esc(w.cat)}</span>
          <h3>${esc(w.title)}</h3>
          <p>${esc(w.text)}</p>
          <span class="work-go">配布ページへ<i class="px" data-px="right"></i></span>
        </span>
      </a>`).join('');
    $$('.work', worksEl).forEach((el, i) => {
      const w = works[i];
      el.style.setProperty('--d', `${i * 0.08}s`);
      if (finePointer) {
        const html = `<b>${esc(w.title)}</b><span class="tip-cat">${esc(w.cat)}</span><span class="tip-lore">${esc(w.text)}</span><span class="tip-act">▶ クリックで配布チャンネルへ</span>`;
        el.addEventListener('pointerenter', (e) => { showTip(el, html, lighten(w.color)); placeTip(e.clientX, e.clientY); });
        el.addEventListener('pointermove', (e) => placeTip(e.clientX, e.clientY));
        el.addEventListener('pointerleave', () => hideTip(el));
      }
    });

    if (finePointer && !reduce) {
      $$('.work', worksEl).forEach((card) => {
        card.addEventListener('pointermove', (e) => {
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width;
          const py = (e.clientY - r.top) / r.height;
          card.classList.add('is-tilting');
          card.style.setProperty('--ry', `${((px - 0.5) * 14).toFixed(2)}deg`);
          card.style.setProperty('--rx', `${((0.5 - py) * 12).toFixed(2)}deg`);
          card.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`);
          card.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`);
        });
        card.addEventListener('pointerleave', () => {
          card.classList.remove('is-tilting');
          card.style.setProperty('--rx', '0deg');
          card.style.setProperty('--ry', '0deg');
        });
      });
    }
  }

  /* ここまでで追加したアイコンをまとめて描く */
  paintPx();
  paintSfx();

  /* ---------- reveal on scroll ---------- */
  const revealEls = $$('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- いまの欄（ヘッダー・ツールバー・見た目の切り替え） ---------- */
  const sections = $$('[data-section]').filter((s) => !s.hidden);
  const navLinks = $$('.hdr-nav > a, .gbar-nav a');
  const gbar = $('#gbar');
  const gbarNum = $('#gbar-num');
  const gbarName = $('#gbar-name');
  let activeId = 'home';
  let swapTimer = 0;
  const setActive = (sec) => {
    activeId = sec.id;
    navLinks.forEach((a) => {
      const on = a.getAttribute('href') === `#${activeId}`;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
    if (gbarNum) gbarNum.textContent = pad2(sections.indexOf(sec) + 1);
    if (gbarName) gbarName.textContent = sec.dataset.en || '';
    const zone = sec.dataset.zone || 'stream';
    if (root.dataset.zone !== zone) {
      root.dataset.zone = zone;
      hideTip();
      if (gbar && !reduce) {
        gbar.classList.remove('is-swap');
        void gbar.offsetWidth;
        gbar.classList.add('is-swap');
        clearTimeout(swapTimer);
        swapTimer = setTimeout(() => gbar.classList.remove('is-swap'), 520);
      }
    }
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
      const i = Math.max(0, sections.findIndex((s) => s.id === activeId));
      const next = sections[clamp(i + Number(b.dataset.step), 0, sections.length - 1)];
      if (next) next.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    });
  });

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

  /* ---------- scroll: header / progress / parallax ---------- */
  const hdr = $('#hdr');
  const progEls = $$('[data-progress]');
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
    if (!reduce) {
      const vh = window.innerHeight;
      progEls.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const p = clamp(1 - r.bottom / (vh + r.height), 0, 1);
        el.style.setProperty('--p', p.toFixed(4));
      });
    }
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

  /* ---------- HOME: 集中線の中心をトマトに合わせる ---------- */
  const stage = $('.kv-stage');
  const placeSun = () => {
    if (!kv || !stage) return;
    let x = stage.offsetLeft + stage.offsetWidth / 2;
    let y = stage.offsetTop + stage.offsetHeight / 2;
    for (let p = stage.offsetParent; p && p !== kv; p = p.offsetParent) { x += p.offsetLeft; y += p.offsetTop; }
    kv.style.setProperty('--sun-x', `${Math.round(x)}px`);
    kv.style.setProperty('--sun-y', `${Math.round(y)}px`);
  };
  placeSun();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeSun);

  let rsTimer = 0;
  let lastW = window.innerWidth;
  window.addEventListener('resize', () => {
    clearTimeout(rsTimer);
    rsTimer = setTimeout(() => {
      placeSun();
      if (Math.abs(window.innerWidth - lastW) >= 40) { lastW = window.innerWidth; buildMarquee(); }
    }, 200);
  });

  /* ---------- HOME: pointer parallax ---------- */
  if (kv && finePointer && !reduce) {
    const layers = $$('[data-depth]', kv);
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    const loop = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      layers.forEach((l) => {
        const d = Number(l.dataset.depth);
        l.style.transform = `translate3d(${(-cx * d).toFixed(2)}px, ${(-cy * d * 0.5).toFixed(2)}px, 0)`;
      });
      raf = Math.abs(tx - cx) > 0.0005 || Math.abs(ty - cy) > 0.0005 ? requestAnimationFrame(loop) : 0;
    };
    kv.addEventListener('pointermove', (e) => {
      const r = kv.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
      if (!raf) raf = requestAnimationFrame(loop);
    });
    kv.addEventListener('pointerleave', () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(loop); });
  }

  /* ---------- HOME: トマトを押すと笑う ---------- */
  const mascot = $('#mascot');
  const pops = $('#kv-pops');
  const LAUGHS = ['アハハ', 'アハハハ!', 'あはは', 'ハハッ!'];
  if (mascot && mascotImg) {
    mascot.addEventListener('click', () => {
      SFX.laugh();
      mascotImg.classList.remove('is-laugh');
      void mascotImg.offsetWidth;
      mascotImg.classList.add('is-laugh');
      if (reduce) return;
      for (let i = 0; i < 3; i++) {
        const p = document.createElement('span');
        p.className = 'pop burst';
        p.textContent = LAUGHS[(Math.random() * LAUGHS.length) | 0];
        p.style.left = `${20 + Math.random() * 60}%`;
        p.style.top = `${10 + Math.random() * 55}%`;
        p.style.setProperty('--rot', `${(Math.random() * 36 - 18).toFixed(1)}deg`);
        p.style.animationDelay = `${i * 0.12}s`;
        if (i === 1) p.style.color = '#fff';
        pops.appendChild(p);
        setTimeout(() => p.remove(), 1600);
      }
    });
  }

  /* ---------- loader → intro ---------- */
  const startIntro = () => requestAnimationFrame(() => { root.classList.add('is-ready'); placeSun(); });
  const loader = $('#loader');
  if (!loader || root.classList.contains('no-loader')) {
    if (loader) loader.remove();
    startIntro();
  } else {
    const num = $('.ld-num b', loader);
    const bar = $('.ld-bar i', loader);
    const t0 = performance.now();
    const MIN = 1500;
    let loaded = document.readyState === 'complete';
    let finished = false;
    window.addEventListener('load', () => { loaded = true; }, { once: true });
    const paintBar = (p) => {
      num.textContent = String(Math.round(p * 100));
      bar.style.transform = `scaleX(${p.toFixed(3)})`;
    };
    const finish = () => {
      if (finished) return;
      finished = true;
      paintBar(1);
      loader.classList.add('is-done');
      try { sessionStorage.setItem('rafu-seen', '1'); } catch (e) { /* ignore */ }
      setTimeout(startIntro, 420);
      setTimeout(() => loader.remove(), 1400);
    };
    const frameFn = (now) => {
      if (finished) return;
      const t = now - t0;
      const cap = loaded ? 1 : 0.9;
      const p = Math.min(cap, 1 - Math.pow(1 - Math.min(t / MIN, 1), 2.2));
      paintBar(p);
      if ((p >= 1 && t >= MIN) || t > 5000) finish();
      else requestAnimationFrame(frameFn);
    };
    loader.addEventListener('click', finish);
    requestAnimationFrame(frameFn);
  }

  /* index.html の保険（ここまで来なかったらローディングを消す）に、最後まで動いたことを知らせる */
  window.RAFU_READY = true;
})();

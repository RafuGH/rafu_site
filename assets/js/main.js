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

  /* ---------- icons ---------- */
  const ICON = {
    youtube: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12 31 31 0 0 0 1 16.8a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8ZM9.7 15.1V8.9L15.5 12Z"/></svg>',
    twitch: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.3 1.5 2.5 6v14.6h5.1v2.9h2.9l2.9-2.9h4.2l5.9-5.8V1.5Zm16 12.4-3.3 3.3h-4.6l-2.9 2.9v-2.9H5.6V3.6h14.7ZM17.2 7.1h-2.1v5.9h2.1Zm-5.3 0H9.8v5.9h2.1Z"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.6 1.5h-3.7v14.2a3.1 3.1 0 1 1-3.1-3.1c.3 0 .6 0 .9.1V8.9a6.9 6.9 0 1 0 5.9 6.8V8.5a8.6 8.6 0 0 0 4.9 1.6V6.4a4.9 4.9 0 0 1-4.9-4.9Z"/></svg>',
    x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.8 2.3h3.4l-7.4 8.4 8.7 11.5h-6.8l-5.3-7-6.1 7H.9l7.9-9L.5 2.3h7l4.8 6.4Zm-1.2 17.9h1.9L6.4 4.2H4.4Z"/></svg>',
    discord: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.3 4.4A19.6 19.6 0 0 0 15.4 3l-.6 1.3a18.2 18.2 0 0 0-5.6 0L8.6 3a19.5 19.5 0 0 0-4.9 1.5C.6 9.1-.3 13.6.1 18.1A19.8 19.8 0 0 0 6.1 21l1.3-2.1a12.8 12.8 0 0 1-2-1l.5-.4a14 14 0 0 0 12.2 0l.5.4c-.6.4-1.3.7-2 1l1.3 2.1a19.7 19.7 0 0 0 6-3c.5-5.2-.8-9.7-3.6-13.6ZM8 15.3c-1.2 0-2.2-1.1-2.2-2.4S6.8 10.5 8 10.5s2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Zm8 0c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Z"/></svg>',
  };
  const WORK_ICON = {
    game: '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M30 30h40a22 22 0 0 1 22 22v4a16 16 0 0 1-28 10l-4-5H40l-4 5A16 16 0 0 1 8 56v-4a22 22 0 0 1 22-22Z"/><path d="M28 42v14M21 49h14"/><circle cx="66" cy="45" r="2.5" fill="#fff"/><circle cx="74" cy="53" r="2.5" fill="#fff"/></svg>',
    datapack: '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 10 86 30v40L50 90 14 70V30Z"/><path d="M14 30l36 20 36-20M50 50v40"/><path d="M30 58l-6 4 6 4M38 70l-6 4 6 4" stroke-width="4"/></svg>',
    mod: '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="14"/><path d="M50 12v12M50 76v12M12 50h12M76 50h12M23 23l8.5 8.5M68.5 68.5 77 77M23 77l8.5-8.5M68.5 31.5 77 23"/><circle cx="50" cy="50" r="28"/></svg>',
    plugin: '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M36 12v20M64 12v20"/><path d="M24 32h52v14a26 26 0 0 1-52 0Z"/><path d="M50 72v16"/><path d="M42 50l6-8v8h6l-6 8v-8Z" fill="#fff" stroke-width="2"/></svg>',
  };

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
      laugh: () => { [0, 0.1, 0.2, 0.3].forEach((d, i) => tone(520 - i * 30, 0.1, 'triangle', 0.07, 300 - i * 20, d)); },
    };
  })();

  const sfxBtn = $('#sfx-btn');
  const paintSfx = () => {
    sfxBtn.setAttribute('aria-pressed', String(SFX.on));
    $('b', sfxBtn).textContent = SFX.on ? 'ON' : 'OFF';
    sfxBtn.setAttribute('aria-label', SFX.on ? '効果音をオフにする' : '効果音をオンにする');
  };
  paintSfx();
  sfxBtn.addEventListener('click', () => { SFX.set(!SFX.on); paintSfx(); SFX.ok(); });

  let lastHover = null;
  document.addEventListener('pointerover', (e) => {
    const t = e.target.closest('[data-sfx]');
    if (t && t !== lastHover && e.pointerType === 'mouse') SFX.hover();
    lastHover = t;
  });
  document.addEventListener('click', (e) => { if (e.target.closest('[data-sfx]') && !e.target.closest('#sfx-btn')) SFX.click(); });

  /* ---------- film grain ---------- */
  (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 160;
    const x = c.getContext('2d');
    if (!x) return;
    const img = x.createImageData(160, 160);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    root.style.setProperty('--grain', `url(${c.toDataURL()})`);
  })();

  /* ---------- links from content.js ---------- */
  $$('[data-link]').forEach((a) => { const url = C[a.dataset.link]; if (url) a.href = url; });

  /* ---------- SNS ---------- */
  const sns = C.sns || [];
  $$('[data-sns-icons]').forEach((box) => {
    box.innerHTML = sns.map((s) => `<a class="icon-link" href="${esc(s.url)}" target="_blank" rel="noopener" aria-label="${esc(s.name)}" data-key="${esc(s.key)}" style="--brand:${esc(s.color)}" data-sfx>${ICON[s.key] || ''}</a>`).join('');
  });
  const snsGrid = $('#sns-grid');
  if (snsGrid) {
    snsGrid.innerHTML = sns.map((s) => {
      const on = s.key === 'x' ? '#0b0b0e' : '#fff';
      return `<a class="sns-tile" href="${esc(s.url)}" target="_blank" rel="noopener" style="--brand:${esc(s.color)};--on:${on}" data-sfx>
        <span class="sns-top">${ICON[s.key] || ''}<span class="sns-arrow" aria-hidden="true">↗</span></span>
        <span><span class="sns-name">${esc(s.name)}</span><span class="sns-handle">${esc(s.handle)}</span></span>
      </a>`;
    }).join('');
  }

  /* ---------- hero media ---------- */
  const hero = C.hero || {};
  const mascotImg = $('#mascot-img');
  if (hero.mascot && mascotImg) mascotImg.src = hero.mascot;
  if (hero.video) {
    const kv = $('.kv');
    const v = document.createElement('video');
    v.className = 'kv-video';
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    v.setAttribute('playsinline', '');
    v.preload = 'metadata';
    if (hero.poster) v.poster = hero.poster;
    v.src = hero.video;
    if (!reduce) v.autoplay = true;
    $('.kv-bg', kv).prepend(v);
    kv.classList.add('has-video');
    if (!reduce) v.play().catch(() => {});
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
  let mqTimer = 0;
  let lastW = window.innerWidth;
  window.addEventListener('resize', () => {
    if (Math.abs(window.innerWidth - lastW) < 40) return;
    lastW = window.innerWidth;
    clearTimeout(mqTimer);
    mqTimer = setTimeout(buildMarquee, 250);
  });

  /* ---------- toast ---------- */
  const toastEl = $('#toast');
  let toastTimer = 0;
  const toast = (msg) => {
    toastEl.textContent = msg;
    toastEl.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-show'), 2000);
  };

  /* ---------- CHANNEL ---------- */
  const KIND = { live: '配信', clip: '切り抜き', shorts: 'Shorts' };
  const videos = (C.videos || []).filter((v) => v && v.id).map((v, i) => ({ ...v, n: i + 1, kind: KIND[v.kind] ? v.kind : 'live' }));
  const thumbUrl = (v, q = 'hqdefault') => v.thumb || `https://i.ytimg.com/vi/${encodeURIComponent(v.id)}/${q}.jpg`;
  const watchUrl = (v) => (v.kind === 'shorts' ? `https://www.youtube.com/shorts/${encodeURIComponent(v.id)}` : `https://www.youtube.com/watch?v=${encodeURIComponent(v.id)}`);
  const fmtDate = (d) => (d ? String(d).replace(/-/g, '.') : '');
  const ch = (n) => `CH.${pad2(n)}`;

  const tv = $('#tv');
  const tvImg = $('#tv-img');
  const tvNoise = $('#tv-noise');
  const listEl = $('#ch-list');
  const tabsEl = $('#ch-tabs');
  let current = null;
  let filter = 'all';

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
  };

  const renderList = () => {
    const items = videos.filter((v) => filter === 'all' || v.kind === filter);
    listEl.innerHTML = items.map((v) => `
      <li><button class="ch-item" type="button" data-id="${esc(v.id)}" aria-current="${current && current.id === v.id}" data-sfx>
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
    });
    select(videos[0], false);
    renderList();
    $('#tv-screen').addEventListener('click', () => current && openPlayer(current));
  } else if (tv) {
    $('.ch-grid').hidden = true;
  }

  /* schedule */
  const sched = $('#sched-list');
  if (sched) sched.innerHTML = (C.schedule || []).map((s) => `<div><dt>${esc(s.label)}</dt><dd>${esc(s.value)}</dd></div>`).join('');

  /* ---------- player dialog ---------- */
  const dlg = $('#player');
  const frame = $('#player-frame');
  let lastFocus = null;
  function openPlayer(v) {
    if (!dlg || typeof dlg.showModal !== 'function') { window.open(watchUrl(v), '_blank', 'noopener'); return; }
    lastFocus = document.activeElement;
    frame.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.id)}?autoplay=1&rel=0&playsinline=1" title="${esc(v.title)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
    dlg.classList.toggle('is-vertical', v.kind === 'shorts');
    $('#player-ch').textContent = `${ch(v.n)} / ${KIND[v.kind]}`;
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

  /* ---------- WORKS ---------- */
  const worksEl = $('#works-list');
  if (worksEl) {
    worksEl.innerHTML = (C.works || []).map((w, i) => `
      <a class="work" href="${esc(w.url)}" target="_blank" rel="noopener" style="--c:${esc(w.color || '#e5121b')}" data-reveal data-sfx>
        <span class="work-art">
          <span class="work-tag">${esc((w.icon || 'work').toUpperCase())}</span>
          ${w.image ? `<img src="${esc(w.image)}" alt="" loading="lazy">` : WORK_ICON[w.icon] || WORK_ICON.game}
          <span class="work-num" aria-hidden="true">${pad2(i + 1)}</span>
        </span>
        <span class="work-body">
          <span class="work-cat">${esc(w.cat)}</span>
          <h3>${esc(w.title)}</h3>
          <p>${esc(w.text)}</p>
          <span class="work-go">配布ページへ<i aria-hidden="true">→</i></span>
        </span>
      </a>`).join('');
    $$('.work', worksEl).forEach((el, i) => el.style.setProperty('--d', `${i * 0.08}s`));

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

  /* ---------- active section (side nav / header) ---------- */
  const navLinks = $$('.sidenav a, .hdr-nav a');
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const id = e.target.id;
        navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${id}`));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('[data-section]').forEach((s) => spy.observe(s));
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
    hdr.classList.toggle('is-scrolled', y > 24);
    if (!root.classList.contains('menu-open')) {
      if (y > lastY + 6 && y > 320) hdr.classList.add('is-hidden');
      else if (y < lastY - 6 || y < 120) hdr.classList.remove('is-hidden');
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
    $('.mb-label', menuBtn).textContent = open ? 'CLOSE' : 'MENU';
    root.classList.toggle('menu-open', open);
    hdr.classList.remove('is-hidden');
    if (open) setTimeout(() => { const a = $('a', menu); if (a) a.focus({ preventScroll: true }); }, 350);
  };
  menuBtn.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); menuBtn.focus(); }
  });

  /* ---------- KV: pointer parallax ---------- */
  const kv = $('.kv');
  if (kv && finePointer && !reduce) {
    const layers = $$('[data-depth]', kv);
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    const loop = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      layers.forEach((l) => {
        const d = Number(l.dataset.depth);
        l.style.transform = `translate3d(${(-cx * d).toFixed(2)}px, ${(-cy * d).toFixed(2)}px, 0)`;
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

  /* ---------- KV: REC timecode ---------- */
  const tc = $('#tc');
  if (tc && kv) {
    const t0 = performance.now();
    let visible = true;
    let timer = 0;
    const tick = () => {
      const ms = performance.now() - t0;
      const f = Math.floor((ms % 1000) / (1000 / 30));
      const s = Math.floor(ms / 1000);
      tc.textContent = `${pad2(Math.floor(s / 3600))}:${pad2(Math.floor(s / 60) % 60)}:${pad2(s % 60)}:${pad2(f)}`;
    };
    const run = () => { clearInterval(timer); if (visible) timer = setInterval(tick, reduce ? 1000 : 1000 / 30); };
    if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { visible = e.isIntersecting; run(); }).observe(kv);
    run();
  }

  /* ---------- KV: マスコットを押すと笑う ---------- */
  const mascot = $('#mascot');
  const pops = $('#kv-pops');
  const LAUGHS = ['ワハハ', 'HA!', 'ハハッ', 'わはは!', 'HAHA'];
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
  const startIntro = () => requestAnimationFrame(() => root.classList.add('is-ready'));
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
    const finish = () => {
      if (finished) return;
      finished = true;
      num.textContent = '100';
      bar.style.transform = 'scaleX(1)';
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
      num.textContent = String(Math.round(p * 100)).padStart(3, '0');
      bar.style.transform = `scaleX(${p.toFixed(3)})`;
      if ((p >= 1 && t >= MIN) || t > 5000) finish();
      else requestAnimationFrame(frameFn);
    };
    loader.addEventListener('click', finish);
    requestAnimationFrame(frameFn);
  }
})();

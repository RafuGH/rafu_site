/* RAFU official site — トップページ（content.js の描画と演出） */
(() => {
  'use strict';

  const {
    C, root, $, $$, reduce, finePointer, clamp, esc, store,
    SFX, ARROW, PLAY, PAD, paintPx,
    toast, copyText, placeTip, showTip, hideTip,
    KIND, ch, fmtDate, ytId, loadThumb, openPlayer,
    WORK_PX, lighten, reveal,
  } = window.RAFU;

  /* ---------- hero media（1枚絵や動画を入れると赤い集中線の背景と入れ替わる） ---------- */
  const hero = C.hero || {};
  const kv = $('.kv');
  const mascotImg = $('#mascot-img');
  /* 差し替えた絵が読めないときは、いつものトマトと赤い集中線に戻す */
  if (hero.mascot && mascotImg) {
    const base = mascotImg.getAttribute('src');
    mascotImg.dataset.nf = 'self';
    mascotImg.addEventListener('error', () => { if (mascotImg.getAttribute('src') !== base) mascotImg.src = base; });
    mascotImg.src = hero.mascot;
  }
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
      media.dataset.nf = 'self';
      media.addEventListener('error', () => { media.remove(); kv.classList.remove('has-media'); });
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

  /* ---------- videos ---------- */
  const videos = (C.videos || []).filter((v) => v && v.id).map((v, i) => ({ ...v, n: i + 1, kind: KIND[v.kind] ? v.kind : 'live' }));

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
        <span class="pick-body"><span class="pick-title">${title}</span>${ARROW}</span>
      </${tag}>`;
    /* 決まった見出しは、言葉の切れ目でだけ折り返す（狭いカードで「サー/バー」のように割れないように） */
    const phr = (...parts) => parts.map((s) => `<span class="ph">${esc(s)}</span>`).join('');
    const cards = [];
    if (videos[0]) cards.push(card('button', 'type="button" data-pick="video"', { tag: 'NEW VIDEO', html: '<img alt="" loading="lazy" width="480" height="360">' }, esc(videos[0].title), '#000'));
    if (games[0]) {
      const g = games[0];
      cards.push(card('a', 'href="#game"', { tag: 'GAME', html: g.image ? `<img src="${esc(g.image)}" alt="" loading="lazy">` : `<span class="pa-burst"></span><span class="pa-icon">${PAD}</span>` }, esc(g.title), 'var(--tomato)'));
    }
    cards.push(card('a', 'href="#minecraft"', { tag: 'MINECRAFT', html: '<span class="pa-pixel"><img class="pa-chara" src="assets/img/rafu-mc.webp" alt="" width="589" height="900" loading="lazy"></span>' }, phr('参加型', 'Minecraft', 'サーバー'), '#f47a35'));
    cards.push(card('a', `href="${esc(C.discord || '#community')}" target="_blank" rel="noopener"`, { tag: 'DISCORD', html: '<span class="pa-discord"><img src="assets/img/discord-server.webp" alt="" width="640" height="486" loading="lazy"></span>' }, phr('Discord', 'コミュニティに参加'), 'var(--discord)'));
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
  /* 2週間以内のお知らせには NEW を付ける */
  const isNew = (d) => {
    const age = Date.now() - Date.parse(d);
    return age > -864e5 && age < 14 * 864e5;
  };
  if (newsEl) {
    const items = (C.news || []).filter((n) => n && n.title);
    newsEl.innerHTML = items.length ? items.map((n) => {
      const url = n.url ? (C[n.url] || n.url) : '';
      const badge = isNew(n.date) ? '<span class="news-new">NEW</span>' : '';
      const inner = `<time datetime="${esc(n.date)}">${esc(fmtDate(n.date))}</time><span class="news-tag" style="--tag:${esc(NEWS_TAG[n.tag] || '#17161b')}">${esc(n.tag || 'お知らせ')}</span><span class="news-title">${badge}${esc(n.title)}</span>${ARROW}`;
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
            ${g.id ? `<a class="btn btn-ink" href="downloads.html#${esc(g.id)}" data-sfx><span>ダウンロードページへ</span><svg class="arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"/></svg></a>` : ''}
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
  const worksEl = $('#works-list');
  if (worksEl) {
    const works = C.works || [];
    worksEl.innerHTML = works.map((w) => `
      <a class="work" href="downloads.html#${esc(w.id)}" style="--c:${esc(w.color || '#e5121b')}" data-reveal data-sfx>
        <span class="work-art">
          <span class="work-tag">${esc((w.icon || 'work').toUpperCase())}</span>
          ${w.image ? `<img src="${esc(w.image)}" alt="" loading="lazy">` : `<span class="work-slot"><i class="px" data-px="${WORK_PX[w.icon] || 'chest'}"></i></span>`}
        </span>
        <span class="work-body">
          <span class="work-cat">${esc(w.cat)}</span>
          <h3>${esc(w.title)}</h3>
          <p>${esc(w.text)}</p>
          <span class="work-go">ダウンロード<i class="px" data-px="right"></i></span>
        </span>
      </a>`).join('');
    $$('.work', worksEl).forEach((el, i) => {
      const w = works[i];
      el.style.setProperty('--d', `${i * 0.08}s`);
      if (finePointer) {
        const html = `<b>${esc(w.title)}</b><span class="tip-cat">${esc(w.cat)}</span><span class="tip-lore">${esc(w.text)}</span><span class="tip-act">▶ クリックでダウンロードページへ</span>`;
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
  reveal($$('[data-reveal]'));

  /* ---------- scroll: 欄ごとの進み具合（パララックス用） ---------- */
  const progEls = $$('[data-progress]');
  if (!reduce && progEls.length) {
    let pTicking = false;
    const onProgress = () => {
      const vh = window.innerHeight;
      progEls.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const p = clamp(1 - r.bottom / (vh + r.height), 0, 1);
        el.style.setProperty('--p', p.toFixed(4));
      });
      pTicking = false;
    };
    window.addEventListener('scroll', () => { if (!pTicking) { pTicking = true; requestAnimationFrame(onProgress); } }, { passive: true });
    onProgress();
  }

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

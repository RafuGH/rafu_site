/* RAFU official site — ダウンロードページ（作品のアイコン一覧と、紹介PV・説明・バージョン別のダウンロード） */
(() => {
  'use strict';

  const {
    C, $, $$, reduce, finePointer, esc,
    ICON, SFX, PLAY, paintPx,
    toast, copyText, placeTip, showTip, hideTip,
    fmtDate, ytId, loadThumb, openPlayer,
    WORK_PX, lighten, reveal,
  } = window.RAFU;

  /* 自作ゲームとMinecraftの配布物を1つの一覧にまとめる（中身は content.js の games と works） */
  const items = [
    ...(C.games || []).map((g) => ({
      ...g,
      kind: 'game',
      cat: g.cat || 'ゲーム',
      icon: g.icon || 'game',
      color: g.color || '#e5121b',
      text: g.text || g.catch || '',
      pv: g.pv || g.trailer || '',
    })),
    ...(C.works || []).map((w) => ({ ...w, kind: 'mc', color: w.color || '#1f9d4c' })),
  ].filter((it) => it.id);
  const byId = (id) => items.find((it) => it.id === id);

  const TYPE = { mc: 'MINECRAFT', game: 'GAME' };
  const TABS = [
    { key: 'all', label: 'すべて' },
    { key: 'mc', label: 'Minecraft' },
    { key: 'game', label: 'ゲーム' },
  ];
  const narrow = matchMedia('(max-width: 900px)');
  const tabsEl = $('#inv-tabs');
  const grid = $('#inv-grid');
  const detail = $('#dl-detail');
  const verPick = {};   // 作品ごとに選んだバージョン（ページを開いている間だけ覚える）
  let current = null;
  let filter = 'all';

  const iconHtml = (it) => (it.iconImage
    ? `<img src="${esc(it.iconImage)}" alt="" loading="lazy">`
    : `<i class="px" data-px="${WORK_PX[it.icon] || 'chest'}"></i>`);
  const fileName = (f) => {
    const last = String(f).split(/[?#]/)[0].split('/').pop();
    try { return decodeURIComponent(last); } catch (e) { return last; }
  };
  const hashId = () => {
    try { return decodeURIComponent(location.hash.slice(1)); } catch (e) { return ''; }
  };

  /* ---------- 種類のタブ ---------- */
  const count = (key) => items.filter((it) => key === 'all' || it.kind === key).length;
  const paintTabs = () => {
    $$('.inv-tab', tabsEl).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === filter)));
  };
  tabsEl.innerHTML = TABS.filter((t) => count(t.key)).map((t) => `
    <button class="inv-tab" type="button" data-filter="${t.key}" aria-pressed="false" data-sfx>${t.label}<small>${count(t.key)}</small></button>`).join('');
  $$('.inv-tab', tabsEl).forEach((b) => b.addEventListener('click', () => {
    filter = b.dataset.filter;
    paintTabs();
    renderGrid();
  }));

  /* ---------- アイコンの一覧（足りない分は空きスロットで埋める） ---------- */
  function renderGrid() {
    const list = items.filter((it) => filter === 'all' || it.kind === filter);
    const total = Math.max(6, Math.ceil(list.length / 6) * 6);
    grid.innerHTML = list.map((it) => `
      <button class="slot" type="button" data-id="${esc(it.id)}" aria-pressed="${current === it}" style="--c:${esc(it.color)}" data-sfx>
        <span class="slot-box"><span class="slot-ic">${iconHtml(it)}</span></span>
        <span class="slot-name">${esc(it.title)}</span>
      </button>`).join('')
      + '<span class="slot is-empty" aria-hidden="true"><span class="slot-box"></span><span class="slot-name"></span></span>'.repeat(total - list.length);
    paintPx(grid);
    $$('.slot[data-id]', grid).forEach((el) => {
      const it = byId(el.dataset.id);
      el.addEventListener('click', () => select(it, { scroll: true }));
      if (finePointer) {
        const html = `<b>${esc(it.title)}</b><span class="tip-cat">${esc(it.cat)}</span>${it.text ? `<span class="tip-lore">${esc(it.text)}</span>` : ''}<span class="tip-act">▶ クリックで詳しく見る</span>`;
        el.addEventListener('pointerenter', (e) => { showTip(el, html, lighten(it.color)); placeTip(e.clientX, e.clientY); });
        el.addEventListener('pointermove', (e) => placeTip(e.clientX, e.clientY));
        el.addEventListener('pointerleave', () => hideTip(el));
      }
    });
  }

  /* 矢印キーでアイコンの間を移動する（Enter / スペースで選ぶ） */
  grid.addEventListener('keydown', (e) => {
    const el = e.target.closest('.slot[data-id]');
    if (!el) return;
    const slots = $$('.slot[data-id]', grid);
    const cols = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
    const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols, Home: -slots.length, End: slots.length }[e.key];
    if (step === undefined) return;
    e.preventDefault();
    const i = slots.indexOf(el);
    slots[Math.min(slots.length - 1, Math.max(0, i + step))].focus();
  });

  /* ---------- 選んだ作品（紹介PV・説明・バージョン・ダウンロード・導入のしかた） ---------- */
  const showVers = (it) => it.kind === 'mc' || (it.versions || []).length > 1;

  const dlHtml = (it, v) => {
    if (!v || !v.file) {
      return `<p class="dt-file is-none"><i class="px" data-px="chest"></i><span>${showVers(it) ? 'このバージョンは' : 'ファイルは'}準備中です。公開までお待ちください</span></p>
        <button class="pxbtn dt-btn is-off" type="button" disabled><i class="px" data-px="dl"></i><span>準備中</span></button>`;
    }
    const name = fileName(v.file);
    const meta = [v.size, fmtDate(v.date)].filter(Boolean).map(esc).join(' ・ ');
    return `<p class="dt-file"><i class="px" data-px="chest"></i><b>${esc(name)}</b>${meta ? `<small>${meta}</small>` : ''}</p>
      <a class="pxbtn dt-btn" href="${esc(v.file)}" download="${esc(name)}" data-name="${esc(name)}"><i class="px" data-px="dl"></i><span>ダウンロード</span></a>`;
  };

  const paintDl = (it) => {
    const vers = it.versions || [];
    const box = $('.dt-dl', detail);
    box.innerHTML = dlHtml(it, vers[verPick[it.id]]);
    paintPx(box);
    const btn = $('a.dt-btn', box);
    if (btn) btn.addEventListener('click', () => { SFX.ok(); toast(`「${btn.dataset.name}」のダウンロードを始めました`); });
  };

  const renderDetail = (it) => {
    const vers = it.versions || [];
    if (verPick[it.id] === undefined) verPick[it.id] = Math.max(0, vers.findIndex((v) => v.file));
    const pv = ytId(it.pv);
    const media = pv
      ? `<button class="dt-media" type="button" data-pv aria-label="${esc(it.title)}の紹介PVを再生" data-sfx>
          <img alt="" width="640" height="360"><span class="dt-tag">PV</span><span class="dt-play">${PLAY}</span>
        </button>`
      : it.image
        ? `<div class="dt-media"><img src="${esc(it.image)}" alt="${esc(it.title)}の画面" loading="lazy"></div>`
        : `<div class="dt-media dt-art"><span class="dt-art-ic">${iconHtml(it)}</span><span class="dt-tag">PV 準備中</span></div>`;
    const about = String(it.about || it.text || '').split(/\n+/).filter(Boolean).map((p) => `<p>${esc(p)}</p>`).join('');
    const label = it.versionLabel || (it.kind === 'mc' ? 'Minecraftのバージョン' : 'バージョン');
    const howto = it.howto || [];

    detail.style.setProperty('--c', it.color);
    detail.innerHTML = `
      <header class="dt-head">
        <span class="dt-icon">${iconHtml(it)}</span>
        <div>
          <p class="dt-kicker"><span class="dt-type">${TYPE[it.kind]}</span><span class="dt-cat">${esc(it.cat)}</span><button class="dt-share" type="button" data-share data-sfx><i class="px" data-px="copy"></i><span>リンクをコピー</span></button></p>
          <h2 class="dt-title">${esc(it.title)}</h2>
        </div>
      </header>
      ${media}
      ${about ? `<div class="dt-about">${about}</div>` : ''}
      <div class="dt-box">
        <p class="dt-lbl">ダウンロード<small>DOWNLOAD</small></p>
        ${showVers(it) && vers.length ? `
        <fieldset class="dt-vers">
          <legend>${esc(label)}</legend>
          ${vers.map((v, i) => `<label class="dt-ver"><input type="radio" name="dt-ver" value="${i}"${i === verPick[it.id] ? ' checked' : ''} data-sfx><span>${esc(v.label)}${v.file ? '' : '<small>準備中</small>'}</span></label>`).join('')}
        </fieldset>` : ''}
        <div class="dt-dl"></div>
        ${it.discord ? `<p class="dt-alt"><span class="brand">${ICON.discord}</span><span>Discordの配布チャンネルでも配っています</span><a href="${esc(it.discord)}" target="_blank" rel="noopener" data-sfx>開く ↗</a></p>` : ''}
      </div>
      ${howto.length ? `
      <div class="dt-howto">
        <p class="howto-title"><i class="px" data-px="star"></i><span>導入のしかた</span></p>
        <ol>${howto.map((h) => `<li>${esc(h)}</li>`).join('')}</ol>
      </div>` : ''}`;

    paintPx(detail);
    paintDl(it);
    $$('.dt-ver input', detail).forEach((r) => r.addEventListener('change', () => {
      verPick[it.id] = Number(r.value);
      paintDl(it);
    }));
    /* この作品を開くリンク（Discordなどに貼る用） */
    const share = $('[data-share]', detail);
    share.addEventListener('click', async () => {
      const u = new URL(location.href);
      u.search = '';
      u.hash = it.id;
      if (!(await copyText(u.href))) { toast('コピーできませんでした。アドレスバーのURLを使ってください'); return; }
      SFX.ok();
      toast(`「${it.title}」のリンクをコピーしました`);
      $('span', share).textContent = 'コピーしました';
      share.classList.add('is-done');
      setTimeout(() => { $('span', share).textContent = 'リンクをコピー'; share.classList.remove('is-done'); }, 1800);
    });
    const pvBtn = $('[data-pv]', detail);
    if (pvBtn) {
      loadThumb($('img', pvBtn), { id: pv }, true);
      pvBtn.addEventListener('click', () => openPlayer({ id: pv, title: it.title, kind: 'live', n: 0 }, `PV / ${it.title}`));
    }
    if (!reduce) {
      detail.classList.remove('is-swap');
      void detail.offsetWidth;
      detail.classList.add('is-swap');
    }
  };

  /* ---------- 選ぶ（URLの #作品id もそろえる） ---------- */
  function select(it, { scroll = false, hash = true } = {}) {
    if (!it) return;
    if (current !== it) {
      current = it;
      renderDetail(it);
    }
    $$('.slot[data-id]', grid).forEach((el) => el.setAttribute('aria-pressed', String(el.dataset.id === it.id)));
    if (hash && hashId() !== it.id) history.replaceState(null, '', `#${encodeURIComponent(it.id)}`);
    document.title = `${it.title} | ダウンロード | RAFU`;
    /* スマホ・タブレットは一覧の下に出るので、そこまで動かす */
    if (scroll && narrow.matches) detail.scrollIntoView({ behavior: reduce ? 'instant' : 'smooth', block: 'start' });
  }

  window.addEventListener('hashchange', () => {
    const it = byId(hashId());
    if (!it) return;
    if (filter !== 'all' && filter !== it.kind) { filter = 'all'; paintTabs(); renderGrid(); }
    select(it, { scroll: true });
  });

  paintTabs();
  renderGrid();
  const linked = byId(hashId());
  select(linked || items[0], { hash: Boolean(linked) });
  /* トップのカードから来たときは、選んだ作品が見える位置から始める */
  if (linked) {
    $$('.dl-grid [data-reveal]').forEach((el) => el.removeAttribute('data-reveal'));   // 出てくる動きを省いて、位置がずれないようにする
    requestAnimationFrame(() => (narrow.matches ? detail : $('#list')).scrollIntoView({ behavior: 'instant', block: 'start' }));
  }

  if (!items.length) {
    detail.innerHTML = '<p class="dl-noscript">いま配布しているものはありません。</p>';
  }

  paintPx();
  reveal($$('[data-reveal]'));
  window.RAFU_READY = true;
})();

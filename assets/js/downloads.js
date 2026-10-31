/* RAFU official site — ダウンロードページ（作品のアイコン一覧と、紹介PV・説明・バージョン別のダウンロード） */
(() => {
  'use strict';

  const {
    C, $, $$, reduce, finePointer, esc,
    ICON, SFX, PLAY, paintPx,
    toast, copyText, placeTip, showTip, hideTip,
    fmtDate, ytId, watchUrl, loadThumb, openPlayer,
    WORK_PX, lighten, reveal,
  } = window.RAFU;

  /* "1.21" や "1.20.4" を新しい順に並べる（数字のないものは後ろ） */
  const verCmp = (a, b) => {
    const pa = String(a).match(/\d+/g);
    const pb = String(b).match(/\d+/g);
    if (!pa || !pb) return pa ? -1 : pb ? 1 : 0;
    for (let i = 0; i < Math.max(pa.length, pb.length); i += 1) {
      const d = (Number(pb[i]) || 0) - (Number(pa[i]) || 0);
      if (d) return d;
    }
    return 0;
  };
  const bareVer = (s) => String(s || '').trim().replace(/^v(?=\d)/i, '');   // "v2.0" と書いても "2.0" として扱う
  /* "1.18.2〜1.20.6" のような範囲は、content.js の mcVersions から1つずつのバージョンに分ける（range に元の書き方を残す） */
  const RANGE = /^\s*(\d+(?:\.\d+)*)\s*(?:[〜～~]\s*(\d+(?:\.\d+)*)?|以上)\s*$/;
  const spread = (v) => {
    const m = RANGE.exec(String(v.label || ''));
    if (!m) return [v];
    const [, lo, hi] = m;
    const list = (C.mcVersions || []).filter((x) => verCmp(x, lo) <= 0 && (!hi || verCmp(x, hi) >= 0));
    return list.length ? list.sort(verCmp).map((x) => ({ ...v, label: x, range: v.label })) : [v];
  };

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
  ].filter((it) => it.id).map((it) => {
    const vers = (it.versions || []).filter(Boolean).map((v) => ({ ...v, version: bareVer(v.version) }));
    return {
      ...it,
      vers: it.kind === 'mc' ? vers.flatMap(spread) : vers,
      /* アップデートの履歴（上から新しい順） */
      ups: (it.updates || []).filter((u) => u && (u.title || u.version)).map((u) => ({ ...u, version: bareVer(u.version) })),
    };
  });
  const byId = (id) => items.find((it) => it.id === id);

  const TYPE = { mc: 'MINECRAFT', game: 'GAME' };
  const TABS = [
    { key: 'all', label: 'すべて' },
    { key: 'mc', label: 'Minecraft' },
    { key: 'game', label: 'ゲーム' },
  ];
  const narrow = matchMedia('(max-width: 900px)');
  const tabsEl = $('#inv-tabs');
  const filtersEl = $('#inv-filters');
  const qEl = $('#inv-q');
  const grid = $('#inv-grid');
  const countEl = $('#inv-count');
  const detail = $('#dl-detail');
  let current = null;

  const uniq = (arr) => [...new Set(arr.filter(Boolean))];
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

  /* ---------- 対応機種（ゲームの versions の platform） ---------- */
  const OS = {
    windows: { name: 'Windows', px: 'win' },
    mac: { name: 'Mac', px: 'mac' },
    ios: { name: 'iOS', px: 'phone' },
    android: { name: 'Android', px: 'droid' },
  };
  const OS_ALIAS = { win: 'windows', pc: 'windows', macos: 'mac', osx: 'mac', iphone: 'ios', ipad: 'ios', ipados: 'ios' };
  const osOf = (p) => {
    const k = String(p || '').toLowerCase().replace(/[\s_-]/g, '');
    return OS[k] ? k : OS_ALIAS[k] || String(p || '');
  };
  const osInfo = (k) => OS[k] || { name: k, px: 'game' };
  /* いま見ている端末。ゲームの機種はこれを最初に選ぶ */
  const myOs = (() => {
    const ua = navigator.userAgent || '';
    if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ios';
    if (/Android/.test(ua)) return 'android';
    if (/Windows/.test(ua)) return 'windows';
    if (/Macintosh|Mac OS X/.test(ua)) return 'mac';
    return '';
  })();

  const platforms = (it) => {
    const ks = uniq(it.vers.map((v) => osOf(v.platform)));
    return [...Object.keys(OS).filter((k) => ks.includes(k)), ...ks.filter((k) => !OS[k])];
  };
  /* 一覧のツールチップと詳しい内容に出す「対応」（範囲で書いたものは、そのまま "1.18.2〜1.20.6" と出す） */
  const topVer = (s) => { const m = RANGE.exec(s); return m ? m[2] || '9999' : s; };
  const support = (it) => {
    if (it.kind === 'mc') {
      const vs = uniq(it.vers.map((v) => v.range || v.label)).sort((a, b) => verCmp(topVer(a), topVer(b)));
      return vs.length ? `${vs.slice(0, 3).join(' / ')}${vs.length > 3 ? ` +${vs.length - 3}` : ''}` : '';
    }
    return platforms(it).map((k) => osInfo(k).name).join('・');
  };

  /* ---------- 絞り込み（検索・タブ・プルダウン・並び順） ---------- */
  const DEF = { tab: 'all', q: '', mc: '', type: '', loader: '', platform: '', sort: 'pick' };
  const state = { ...DEF };
  const mcItems = items.filter((it) => it.kind === 'mc');
  const FILTERS = {
    mc: { tab: 'mc', label: 'バージョン', opts: uniq(mcItems.flatMap((it) => it.vers.map((v) => v.label))).sort(verCmp).map((v) => [v, v]) },
    type: { tab: 'mc', label: '種類', opts: uniq(mcItems.map((it) => it.cat)).map((v) => [v, v]) },
    loader: { tab: 'mc', label: 'ローダー', opts: uniq(mcItems.flatMap((it) => it.vers.map((v) => v.loader))).map((v) => [v, v]) },
    platform: {
      tab: 'game',
      label: '対応機種',
      opts: (() => {
        const ks = uniq(items.filter((it) => it.kind === 'game').flatMap(platforms));
        return [...Object.keys(OS).filter((k) => ks.includes(k)), ...ks.filter((k) => !OS[k])].map((k) => [k, osInfo(k).name]);
      })(),
    },
  };
  const SORTS = [['pick', 'おすすめ順'], ['new', '新しい順'], ['name', '名前順']];
  const shown = (key) => FILTERS[key].tab === state.tab && FILTERS[key].opts.length > 1;

  const norm = (s) => String(s || '').normalize('NFKC').toLowerCase();
  const hay = (it) => norm([
    it.title, it.cat, it.series, it.edition, it.text, it.about, it.maker, it.id, TYPE[it.kind], ...(it.tags || []),
    ...it.vers.flatMap((v) => [v.label, v.range, v.version && `v${v.version}`, v.loader, v.platform && osInfo(osOf(v.platform)).name]),
    ...it.ups.flatMap((u) => [u.title, ...(u.notes || [])]),
  ].join(' '));
  const matches = (it) => {
    if (state.tab !== 'all' && it.kind !== state.tab) return false;
    if (state.q && !norm(state.q).split(/\s+/).every((w) => hay(it).includes(w))) return false;
    if (state.tab === 'mc') {
      if (state.type && it.cat !== state.type) return false;
      if ((state.mc || state.loader) && !it.vers.some((v) => (!state.mc || v.label === state.mc) && (!state.loader || v.loader === state.loader))) return false;
    }
    if (state.tab === 'game' && state.platform && !it.vers.some((v) => osOf(v.platform) === state.platform)) return false;
    return true;
  };
  const newest = (it) => it.updated || it.vers.map((v) => v.date).filter(Boolean).sort().pop() || '';
  const sorted = (list) => {
    if (state.sort === 'name') return [...list].sort((a, b) => String(a.title).localeCompare(String(b.title), 'ja'));
    if (state.sort === 'new') return [...list].sort((a, b) => newest(b).localeCompare(newest(a)));
    return list;
  };
  const narrowed = () => Boolean(state.q) || Object.keys(FILTERS).some((k) => shown(k) && state[k]);

  /* 「すべて」以外を選んでいる絞り込みは、明るい色にして分かるようにする */
  const selHtml = (key, label, opts, value) => `
    <label class="sel-field"><span class="sel-lbl">${esc(label)}</span>
      <span class="sel${key !== 'sort' && value ? ' is-set' : ''}"><select data-f="${key}" data-sfx>${opts.map(([v, t]) => `<option value="${esc(v)}"${v === value ? ' selected' : ''}>${esc(t)}</option>`).join('')}</select></span>
    </label>`;
  const renderFilters = () => {
    filtersEl.innerHTML = Object.keys(FILTERS).filter(shown)
      .map((k) => selHtml(k, FILTERS[k].label, [['', 'すべて'], ...FILTERS[k].opts], state[k])).join('')
      + selHtml('sort', '並び順', SORTS, state.sort);
    $$('select', filtersEl).forEach((s) => s.addEventListener('change', () => {
      state[s.dataset.f] = s.value;
      if (s.dataset.f !== 'sort') s.parentElement.classList.toggle('is-set', Boolean(s.value));
      renderGrid();
      /* 開いている作品も、選んだバージョン・ローダー・機種のファイルに切りかえる */
      if (current && ['mc', 'loader', 'platform'].includes(s.dataset.f) && matches(current)) {
        prefer(current);
        paintPick(current);
        paintDl(current);
      }
    }));
  };
  const resetFilters = (all = false) => {
    Object.assign(state, { ...DEF, tab: all ? DEF.tab : state.tab, sort: state.sort });
    qEl.value = '';
    paintTabs();
    renderFilters();
    renderGrid();
  };

  qEl.addEventListener('input', () => {
    state.q = qEl.value.trim();
    renderGrid();
  });
  /* Enter で一覧の先頭の作品を選ぶ */
  qEl.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || e.isComposing) return;
    e.preventDefault();
    const first = $('.slot[data-id]', grid);
    if (first) select(byId(first.dataset.id), { scroll: true });
  });

  /* ---------- 種類のタブ ---------- */
  const count = (key) => items.filter((it) => key === 'all' || it.kind === key).length;
  const paintTabs = () => {
    $$('.inv-tab', tabsEl).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === state.tab)));
  };
  tabsEl.innerHTML = TABS.filter((t) => count(t.key)).map((t) => `
    <button class="inv-tab" type="button" data-filter="${t.key}" aria-pressed="false" data-sfx>${t.label}<small>${count(t.key)}</small></button>`).join('');
  $$('.inv-tab', tabsEl).forEach((b) => b.addEventListener('click', () => {
    state.tab = b.dataset.filter;
    paintTabs();
    renderFilters();
    renderGrid();
  }));

  /* ---------- アイコンの一覧（足りない分は空きスロットで埋める） ---------- */
  function renderGrid() {
    const list = sorted(items.filter(matches));
    const total = Math.max(6, Math.ceil(list.length / 6) * 6);
    const empty = '<span class="slot is-empty" aria-hidden="true"><span class="slot-box"></span><span class="slot-name"></span></span>';
    grid.innerHTML = list.map((it) => `
      <button class="slot" type="button" data-id="${esc(it.id)}" aria-pressed="${current === it}" style="--c:${esc(it.color)}" data-sfx>
        <span class="slot-box"><span class="slot-ic">${iconHtml(it)}</span>${it.ups.length ? '<span class="slot-up" aria-hidden="true">UP</span>' : ''}</span>
        <span class="slot-name">${esc(it.title)}</span>${it.ups.length ? '<span class="sr-only">（アップデートあり）</span>' : ''}
      </button>`).join('') + empty.repeat(total - list.length)
      + (list.length ? '' : '<p class="inv-empty"><span><i class="px" data-px="chest"></i>条件に合う作品がありません</span></p>');
    paintPx(grid);
    $$('.slot[data-id]', grid).forEach((el) => {
      const it = byId(el.dataset.id);
      el.addEventListener('click', () => select(it, { scroll: true }));
      if (finePointer) {
        const sup = support(it);
        const up = it.ups[0];
        const html = `<b>${esc(it.title)}</b><span class="tip-cat">${esc([it.cat, it.series].filter(Boolean).join(' ・ '))}</span>${sup ? `<span class="tip-sup">対応: ${esc(sup)}</span>` : ''}${up ? `<span class="tip-up">UPDATE ${esc([up.version && `v${up.version}`, up.title].filter(Boolean).join(' '))}</span>` : ''}${it.text ? `<span class="tip-lore">${esc(it.text)}</span>` : ''}<span class="tip-act">▶ クリックで詳しく見る</span>`;
        el.addEventListener('pointerenter', (e) => { showTip(el, html, lighten(it.color)); placeTip(e.clientX, e.clientY); });
        el.addEventListener('pointermove', (e) => placeTip(e.clientX, e.clientY));
        el.addEventListener('pointerleave', () => hideTip(el));
      }
    });
    countEl.innerHTML = `<span><b>${list.length}</b>件${narrowed() ? '（絞り込み中）' : ''}</span>${narrowed() ? '<button class="inv-reset" type="button" data-sfx>条件をリセット</button>' : ''}`;
    const reset = $('.inv-reset', countEl);
    if (reset) reset.addEventListener('click', () => { resetFilters(); qEl.focus(); });
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

  /* ---------- ダウンロードの選び方（機種・バージョン・ローダーをプルダウンで） ---------- */
  const pick = {};   // 作品ごとに選んだもの（ページを開いている間だけ覚える）
  const val = (v, d) => (d === 'platform' ? osOf(v.platform) : String(v[d] || ''));
  const valName = (d, k) => (d === 'platform' ? osInfo(k).name : d === 'version' ? `v${k}` : k);
  /* 作品の新しい版（版が2つ以上あるときだけ「最新」を付ける） */
  const latestVer = (it) => {
    const vs = uniq([...it.vers.map((v) => v.version), ...it.ups.map((u) => u.version)]).sort(verCmp);
    return vs.length > 1 ? vs[0] : '';
  };
  /* 作品に書いてある項目だけプルダウンにする（ゲームは 機種→バージョン、Minecraftは バージョン→ローダー→作品のバージョン） */
  const dimsOf = (it) => {
    const has = (d) => it.vers.some((v) => v[d]);
    if (it.kind === 'mc') return it.vers.length ? ['label', ...(has('loader') ? ['loader'] : []), ...(has('version') ? ['version'] : [])] : [];
    return [...(has('platform') ? ['platform'] : []), ...(uniq(it.vers.map((v) => v.label)).length > 1 ? ['label'] : [])];
  };
  const dimLabel = (it, d) => ({
    platform: '対応機種',
    loader: 'ローダー',
    version: `${it.cat || '作品'}のバージョン`,
    label: it.versionLabel || (it.kind === 'mc' ? 'Minecraftのバージョン' : 'バージョン'),
  }[d]);
  const fits = (v, sel, dims) => dims.every((d) => !sel[d] || val(v, d) === sel[d]);
  /* 前の項目で選んだものに合う中から、次の項目の選べるものを出す */
  const optionsOf = (it, d) => {
    const dims = dimsOf(it);
    const pool = it.vers.filter((v) => fits(v, pick[it.id], dims.slice(0, dims.indexOf(d))));
    const keys = uniq(pool.map((v) => val(v, d)));
    if (d === 'version' || (d === 'label' && it.kind === 'mc')) keys.sort(verCmp);   // バージョンは新しい順
    const order = d === 'platform' ? [...Object.keys(OS).filter((k) => keys.includes(k)), ...keys.filter((k) => !OS[k])] : keys;
    return order.map((k) => ({ k, ready: pool.some((v) => val(v, d) === k && v.file) }));
  };
  /* 選べなくなったものは、ファイルのあるもの → 先頭 の順で選び直す */
  const settle = (it) => {
    const sel = pick[it.id];
    dimsOf(it).forEach((d) => {
      const opts = optionsOf(it, d);
      if (!opts.some((o) => o.k === sel[d])) sel[d] = (opts.find((o) => o.ready) || opts[0] || { k: '' }).k;
    });
  };
  /* 一覧で絞り込んでいるバージョン・ローダー・機種に合わせて選ぶ（初めて開いた作品は、いま見ている端末の機種を選ぶ） */
  const prefer = (it, first = false) => {
    const sel = pick[it.id] || (pick[it.id] = {});
    const want = {
      label: state.tab === 'mc' ? state.mc : '',
      loader: state.tab === 'mc' ? state.loader : '',
      platform: state.tab === 'game' && state.platform ? state.platform : first ? myOs : '',
    };
    const keys = Object.keys(want).filter((d) => want[d]);
    const fit = (v) => keys.every((d) => val(v, d) === want[d]);
    const hit = keys.length && (it.vers.find((v) => fit(v) && v.file) || it.vers.find(fit));
    if (hit) dimsOf(it).forEach((d) => { sel[d] = val(hit, d); });
    settle(it);
  };
  const entryOf = (it) => {
    const pool = it.vers.filter((v) => fits(v, pick[it.id], dimsOf(it)));
    return pool.find((v) => v.file) || pool[0] || null;
  };

  const STORES = [[/^https?:\/\/apps\.apple\.com\//i, 'App Storeで開く'], [/^https?:\/\/play\.google\.com\//i, 'Google Playで開く']];
  const dlHtml = (it, v) => {
    const sel = pick[it.id];
    const os = sel.platform ? osInfo(sel.platform) : null;
    if (!v || !v.file) {
      const tag = os ? os.name : dimsOf(it).map((d) => sel[d] && valName(d, sel[d])).filter(Boolean).join('・');
      const what = tag ? `${tag}${/版$/.test(tag) ? '' : '版'}は` : 'ファイルは';
      return `<p class="dt-file is-none"><i class="px" data-px="${os ? os.px : 'chest'}"></i><span>${esc(what)}準備中です。公開までお待ちください</span></p>
        <button class="pxbtn dt-btn is-off" type="button" disabled><i class="px" data-px="dl"></i><span>準備中</span></button>`;
    }
    const store = STORES.find(([re]) => re.test(v.file));
    if (store) {
      return `<p class="dt-file"><i class="px" data-px="${os ? os.px : 'chest'}"></i><b>${esc(os ? `${os.name}版` : it.title)}</b><small>ストアのページが開きます</small></p>
        <a class="pxbtn dt-btn" href="${esc(v.file)}" target="_blank" rel="noopener" data-sfx><i class="px" data-px="dl"></i><span>${store[1]}</span></a>`;
    }
    const name = fileName(v.file);
    const meta = [v.size, fmtDate(v.date)].filter(Boolean).map(esc).join(' ・ ');
    return `<p class="dt-file"><i class="px" data-px="${os ? os.px : 'chest'}"></i><b>${esc(name)}</b>${meta ? `<small>${meta}</small>` : ''}</p>
      <a class="pxbtn dt-btn" href="${esc(v.file)}" download="${esc(name)}" data-name="${esc(name)}"><i class="px" data-px="dl"></i><span>ダウンロード</span></a>`;
  };
  const paintDl = (it) => {
    const box = $('.dt-dl', detail);
    box.innerHTML = dlHtml(it, entryOf(it));
    paintPx(box);
    const btn = $('a.dt-btn[data-name]', box);
    if (btn) btn.addEventListener('click', () => { SFX.ok(); toast(`「${btn.dataset.name}」のダウンロードを始めました`); });
  };
  const paintPick = (it, focus) => {
    const box = $('.dt-picks', detail);
    if (!box) return;
    const sel = pick[it.id];
    box.innerHTML = dimsOf(it).map((d) => {
      const opts = optionsOf(it, d);
      const ic = d === 'platform' ? `<i class="px" data-px="${osInfo(sel[d]).px}"></i>` : '';
      const mine = d === 'platform' && opts.length > 1 && opts.some((o) => o.k === myOs) ? `<small>この端末: ${esc(osInfo(myOs).name)}</small>` : '';
      const text = (o) => `${valName(d, o.k)}${d === 'version' && o.k === latestVer(it) ? '（最新）' : ''}${o.ready ? '' : '（準備中）'}`;
      /* 1つしかないものはプルダウンにせず、そのまま見せる */
      if (opts.length === 1) {
        return `<div class="sel-field dt-sel"><span class="sel-lbl">${esc(dimLabel(it, d))}</span>
          <span class="sel is-one${ic ? ' has-ic' : ''}">${ic}<span class="sel-val">${esc(text(opts[0]))}</span></span>
        </div>`;
      }
      return `<label class="sel-field dt-sel"><span class="sel-lbl">${esc(dimLabel(it, d))}${mine}</span>
        <span class="sel${ic ? ' has-ic' : ''}">${ic}<select data-dim="${d}" data-sfx>${opts.map((o) => `<option value="${esc(o.k)}"${o.k === sel[d] ? ' selected' : ''}>${esc(text(o))}</option>`).join('')}</select></span>
      </label>`;
    }).join('');
    paintPx(box);
    $$('select', box).forEach((s) => s.addEventListener('change', () => {
      sel[s.dataset.dim] = s.value;
      settle(it);
      paintPick(it, s.dataset.dim);
      paintDl(it);
    }));
    const again = focus && $(`select[data-dim="${focus}"]`, box);
    if (again) again.focus();   // 作り直しても、選んでいたプルダウンから続けて操作できるように
  };

  /* ---------- 選んだ作品（紹介PV・説明・対応・ダウンロード・導入のしかた） ---------- */
  const metaHtml = (it) => {
    const chip = (px, t) => `<span class="dt-chip">${px ? `<i class="px" data-px="${px}"></i>` : ''}${esc(t)}</span>`;
    const chips = it.kind === 'mc'
      ? [it.edition && chip('', it.edition), support(it) && chip('cube', support(it)), ...uniq(it.vers.map((v) => v.loader)).map((l) => chip('', l))]
      : platforms(it).map((k) => chip(osInfo(k).px, osInfo(k).name));
    return chips.filter(Boolean).length ? `<p class="dt-meta"><span class="dt-meta-lbl">対応</span>${chips.filter(Boolean).join('')}</p>` : '';
  };

  /* `/reload` のように ` で囲んだところはコマンドの見た目にする */
  const rich = (s) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>');
  const verTxt = (u) => (u.version ? `v${u.version}` : '');

  /* アップデートのお知らせ（矢印のリボンに いちばん新しい内容を短く。押すと昔の版まで全部） */
  const upHtml = (it) => {
    const u = it.ups[0];
    if (!u) return '';
    return `
      <div class="dt-up">
        <div class="dt-up-rib">
          <button class="dt-up-bar" type="button" aria-expanded="false" aria-controls="dt-up-log" data-sfx>
            <span class="dt-up-tag"><i class="px" data-px="up"></i>UPDATE</span>
            <span class="dt-up-text">${verTxt(u) ? `<b>${esc(verTxt(u))}</b>` : ''}<span>${esc(u.title || 'アップデートしました')}</span></span>
            <span class="dt-up-more"><span>詳しく</span><i class="px" data-px="down"></i></span>
          </button>
        </div>
        <div class="dt-up-log" id="dt-up-log" hidden>
          <ol>${it.ups.map((x, i) => `
            <li${i ? '' : ' class="is-new"'}>
              <p class="dt-up-h">${verTxt(x) ? `<b>${esc(verTxt(x))}</b>` : ''}${i ? '' : '<span class="dt-up-new">最新</span>'}${x.date ? `<time datetime="${esc(x.date)}">${esc(fmtDate(x.date))}</time>` : ''}</p>
              ${x.title ? `<p class="dt-up-t">${esc(x.title)}</p>` : ''}
              ${(x.notes || []).length ? `<ul>${x.notes.map((n) => `<li>${rich(n)}</li>`).join('')}</ul>` : ''}
            </li>`).join('')}
          </ol>
        </div>
      </div>`;
  };

  const renderDetail = (it) => {
    prefer(it, !pick[it.id]);

    const pv = ytId(it.pv);
    const pvLabel = it.pvLabel || 'PV';
    const media = pv
      ? `<button class="dt-media" type="button" data-pv aria-label="${esc(`${it.title}の${pvLabel}を再生`)}" data-sfx>
          <img alt="" width="640" height="360"><span class="dt-tag">${esc(pvLabel)}</span><span class="dt-play">${PLAY}</span>
        </button>`
      : it.image
        ? `<div class="dt-media"><img src="${esc(it.image)}" alt="${esc(it.title)}の画面" loading="lazy"></div>`
        : `<div class="dt-media dt-art"><span class="dt-art-ic">${iconHtml(it)}</span><span class="dt-tag">${it.kind === 'game' ? 'PV 準備中' : '動画なし'}</span></div>`;
    /* 動画の下の一言（どの動画で使ったか など） */
    const cap = it.pvNote ? `<p class="dt-cap"><i class="px" data-px="tv"></i><span>${esc(it.pvNote)}</span>${pv ? `<a href="${esc(watchUrl({ id: pv }))}" target="_blank" rel="noopener" data-sfx>YouTubeで見る ↗</a>` : ''}</p>` : '';
    /* 紹介文は1行ずつ段落に。【 】だけの行は小見出し */
    const about = String(it.about || it.text || '').split(/\n+/).map((p) => p.trim()).filter(Boolean)
      .map((p) => (/^【[^【】]+】$/.test(p) ? `<p class="dt-sub">${esc(p.slice(1, -1))}</p>` : `<p>${rich(p)}</p>`)).join('');
    const howto = it.howto || [];

    detail.style.setProperty('--c', it.color);
    detail.innerHTML = `
      <header class="dt-head">
        <span class="dt-icon">${iconHtml(it)}</span>
        <div>
          <p class="dt-kicker"><span class="dt-type">${TYPE[it.kind]}</span><span class="dt-cat">${esc(it.cat)}</span>${it.series ? `<span class="dt-series">${esc(it.series)}</span>` : ''}<button class="dt-share" type="button" data-share data-sfx><i class="px" data-px="copy"></i><span>リンクをコピー</span></button></p>
          <h2 class="dt-title">${esc(it.title)}</h2>
          ${metaHtml(it)}
        </div>
      </header>
      ${upHtml(it)}
      ${media}
      ${cap}
      ${about ? `<div class="dt-about">${about}</div>` : ''}
      <div class="dt-box">
        <p class="dt-lbl">ダウンロード<small>DOWNLOAD</small></p>
        ${dimsOf(it).length ? '<div class="dt-picks"></div>' : ''}
        <div class="dt-dl"></div>
        ${it.discord ? `<p class="dt-alt"><span class="brand">${ICON.discord}</span><span>Discordの配布チャンネルでも配っています</span><a href="${esc(it.discord)}" target="_blank" rel="noopener" data-sfx>開く ↗</a></p>` : ''}
      </div>
      ${howto.length ? `
      <div class="dt-howto">
        <p class="howto-title"><i class="px" data-px="star"></i><span>導入のしかた</span></p>
        <ol>${howto.map((h) => `<li><span>${rich(h)}</span></li>`).join('')}</ol>
      </div>` : ''}`;

    paintPx(detail);
    paintPick(it);
    paintDl(it);
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
      pvBtn.addEventListener('click', () => openPlayer({ id: pv, title: it.title, kind: 'live', n: 0 }, `${pvLabel} / ${it.title}`));
    }
    /* アップデートのリボンを押すと、履歴を開く・閉じる */
    const upBar = $('.dt-up-bar', detail);
    if (upBar) {
      upBar.addEventListener('click', () => {
        const open = upBar.getAttribute('aria-expanded') !== 'true';
        upBar.setAttribute('aria-expanded', String(open));
        $('.dt-up-more span', upBar).textContent = open ? 'とじる' : '詳しく';
        $('#dt-up-log', detail).hidden = !open;
      });
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
    if (!matches(it)) resetFilters(true);   // 絞り込みで隠れている作品なら、条件を戻して見えるように
    select(it, { scroll: true });
  });

  /* 一覧の高さを CSS に渡す（画面より高いときに、下の端まで見えるように止める位置を変える） */
  const inv = $('.inv');
  if (window.ResizeObserver) new ResizeObserver(() => inv.style.setProperty('--inv-h', `${inv.offsetHeight}px`)).observe(inv);

  paintTabs();
  renderFilters();
  renderGrid();
  const linked = byId(hashId());
  /* URLに作品がないときは、ダウンロードできるものがある作品から見せる */
  select(linked || items.find((it) => it.vers.some((v) => v.file)) || items[0], { hash: Boolean(linked) });
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

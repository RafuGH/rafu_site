/* RAFU official site — REDHUB の参加のしかた（中身は content.js の join と server） */
(() => {
  'use strict';

  const { C, $, $$, esc, SFX, toast, copyText, paintPx, reveal, store, worldImg } = window.RAFU;
  const J = C.join || {};
  const S = C.server || {};
  const devices = (J.devices || []).filter((d) => d && d.id && J.methods && J.methods[d.method]);
  const KEY = 'rafu-join-device';

  /* 文の中の {account} {address} {port} を置きかえる */
  const VALUES = { account: J.account || '', address: S.address || '', port: S.bedrockPort || '' };
  const fill = (t) => String(t || '').replace(/\{(account|address|port)\}/g, (_, k) => VALUES[k]);

  /* コピーできる欄の種類 */
  const FIELDS = {
    address: { label: 'サーバーアドレス', en: 'SERVER ADDRESS' },
    port: { label: 'ポート', en: 'PORT' },
    account: { label: 'ゲーマータグ', en: 'GAMERTAG' },
  };

  /* 絵の中の「押す」マーク（ドットの矢印） */
  const HAND = '<svg class="jn-hand" viewBox="0 0 12 16" aria-hidden="true" shape-rendering="crispEdges"><path fill="#000" d="M0 0h2v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v2H8v1h1v2H8v1H6v-1H5v-2H4v1H3v1H0z"/><path fill="#fff" d="M1 2h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1H7v3h-1v-2H5v-1H4v1H3v1H1z"/></svg>';

  let uid = 0;
  const copyRow = (key) => {
    const f = FIELDS[key];
    const value = VALUES[key];
    if (!f || !value) return '';
    const id = `jn-copy-${++uid}`;
    return `
    <div class="jn-copy">
      <span class="jn-copy-lbl">${esc(f.label)}<small>${esc(f.en)}</small></span>
      <div class="jn-copy-row">
        <code class="jn-copy-val" id="${id}">${esc(value)}</code>
        <button class="pxbtn pxbtn-green copy-btn" type="button" data-copy="#${id}" data-sfx><span class="copy-lbl"><span data-l="">コピー</span><span data-l="done">コピーしました</span><span data-l="sel">選択しました</span></span></button>
      </div>
    </div>`;
  };

  /* 手順の絵（写真があれば写真、なければ押すボタンの絵） */
  const shot = (s) => (s.image
    ? `<figure class="jn-shot is-photo"><img src="${esc(s.image)}" alt="${esc(fill(s.alt || s.title))}" loading="lazy" decoding="async"></figure>`
    : `<figure class="jn-shot" aria-hidden="true">
        <span class="jn-screen">
          <span class="jn-bar"><i></i><i></i><i></i></span>
          <span class="jn-press"><span>${esc(fill(s.press || s.title))}</span>${HAND}</span>
        </span>
        <span class="jn-shot-tag">イメージ</span>
      </figure>`);

  /* 見出しの背景の写真（content.js の join.heroImage。無ければ夕焼けのドット絵のまま） */
  const heroEl = $('.jn-hero');
  if (heroEl && J.heroImage && worldImg) {
    const w = (S.world || []).find((x) => x && x.image === J.heroImage) || { image: J.heroImage };
    $('.mc-scene', heroEl).insertAdjacentHTML('beforeend', `<div class="jn-photo">${worldImg(w, ' sizes="(max-aspect-ratio: 3/2) 150vh, 110vw" fetchpriority="high"')}</div>`);
    heroEl.classList.add('has-photo');
  }

  const tabsEl = $('#jn-tabs');
  const panelEl = $('#jn-panel');
  const stepsEl = $('#jn-steps');

  const render = (d) => {
    const m = J.methods[d.method];
    const steps = (m.steps || []).filter((s) => s && s.title);
    $('#jn-method').textContent = m.title || '';
    $('#jn-device').textContent = d.sub || d.label;
    const noteEl = $('#jn-note');
    noteEl.hidden = !d.note;
    $('span', noteEl).textContent = fill(d.note);
    stepsEl.innerHTML = steps.map((s, i) => {
      const copies = [].concat(s.copy || []);
      return `
      <li class="jn-step">
        ${shot(s)}
        <div class="jn-body">
          <p class="jn-num"><span>STEP</span><b>${i + 1}</b></p>
          <h3 class="jn-title">${esc(fill(s.title))}</h3>
          <p class="jn-text">${esc(fill(s.text))}</p>
          ${copies.map(copyRow).join('')}
          ${s.tip ? `<p class="jn-tip"><b>ポイント</b><span>${esc(fill(s.tip))}</span></p>` : ''}
        </div>
      </li>`;
    }).join('');
    $('#jn-photo-note').hidden = steps.every((s) => s.image);
    panelEl.setAttribute('aria-labelledby', `jn-tab-${d.id}`);
  };

  const select = (id, { focus = false, save = true } = {}) => {
    const d = devices.find((x) => x.id === id) || devices[0];
    if (!d) return;
    $$('.jn-tab', tabsEl).forEach((t) => {
      const on = t.dataset.id === d.id;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    });
    render(d);
    if (save) {
      store.set(KEY, d.id);
      if (location.hash !== `#${d.id}`) history.replaceState(null, '', `#${d.id}`);
    }
  };

  /* はじめに出す機種（URLの # → 前に選んだもの → 使っている機器から推測） */
  const guess = () => {
    const ua = navigator.userAgent || '';
    if (/PlayStation/i.test(ua)) return 'ps';
    if (/Nintendo/i.test(ua)) return 'switch';
    if (/Xbox/i.test(ua)) return 'xbox';
    if (/iPhone|iPad|iPod|Android/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'mobile';
    return 'java';
  };
  const has = (id) => devices.some((d) => d.id === id);
  const fromHash = () => decodeURIComponent(location.hash.slice(1));

  if (tabsEl && panelEl && stepsEl && devices.length) {
    tabsEl.innerHTML = devices.map((d) => `
      <button class="jn-tab" type="button" role="tab" id="jn-tab-${esc(d.id)}" data-id="${esc(d.id)}" aria-controls="jn-panel" aria-selected="false" tabindex="-1" data-sfx>
        <span class="jn-tab-icon"><i class="px" data-px="${esc(d.icon || 'cube')}"></i></span>
        <span class="jn-tab-text"><b>${esc(d.label)}</b>${d.sub ? `<small>${esc(d.sub)}</small>` : ''}</span>
      </button>`).join('');

    tabsEl.addEventListener('click', (e) => {
      const t = e.target.closest('.jn-tab');
      if (t) select(t.dataset.id);
    });
    /* 矢印キーでタブを移る */
    tabsEl.addEventListener('keydown', (e) => {
      const tabs = $$('.jn-tab', tabsEl);
      const i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      const next = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (next === undefined) return;
      e.preventDefault();
      select(tabs[(next + tabs.length) % tabs.length].dataset.id, { focus: true });
    });
    addEventListener('hashchange', () => { if (has(fromHash())) select(fromHash()); });

    const first = [fromHash(), store.get(KEY), guess()].find(has);
    select(first, { save: false });
  }

  /* うまくいかないとき */
  const faqEl = $('#jn-faq');
  if (faqEl) {
    const faq = (J.faq || []).filter((f) => f && f.q);
    faqEl.innerHTML = faq.map((f) => `<details class="jn-faq-item"><summary data-sfx><span class="jn-q">Q</span><span>${esc(fill(f.q))}</span><i aria-hidden="true"></i></summary><p>${esc(fill(f.a))}</p></details>`).join('');
    if (!faq.length) faqEl.closest('.jn-faq').hidden = true;
  }

  /* コピーのボタン（手順を切りかえても効くように、親で受ける） */
  const timers = new WeakMap();
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.jn-main [data-copy]');
    if (!btn) return;
    const src = $(btn.dataset.copy);
    const text = src ? src.textContent.trim() : '';
    if (!text) return;
    if (await copyText(text)) {
      btn.dataset.state = 'done';
      btn.classList.add('is-done');
      SFX.ok();
      toast(`「${text}」をコピーしました`);
    } else {
      const r = document.createRange();
      r.selectNodeContents(src);
      const sel = getSelection();
      sel.removeAllRanges();
      sel.addRange(r);
      btn.dataset.state = 'sel';
    }
    clearTimeout(timers.get(btn));
    timers.set(btn, setTimeout(() => { btn.dataset.state = ''; btn.classList.remove('is-done'); }, 1800));
  });

  paintPx();
  reveal($$('[data-reveal]'));
  window.RAFU_READY = true;
})();

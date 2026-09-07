/* ═══════════════════════════════════════════════════════════
   Kharchaaaa — the interface.
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const $  = s => document.querySelector(s);
  const $$ = s => Array.prototype.slice.call(document.querySelectorAll(s));
  const esc = s => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  let screen = 'today';
  let logFilter = 'month';
  let statsRange = 'month';
  let sheetCtx = null;

  /* ─── ring colour follows how much trouble you are in ──── */
  function ringColour(pct) {
    if (pct >= 100) return getCSS('--over');
    if (pct >= 80)  return getCSS('--warn');
    return getCSS('--accent');
  }
  function getCSS(v) {
    return getComputedStyle(document.documentElement).getPropertyValue(v).trim() || '#00FF94';
  }

  /* ─── count-up, because a number that lands feels earned ── */
  function countUp(el, to, from) {
    const start = typeof from === 'number' ? from : 0;
    if (Math.abs(to - start) < 100 || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = K.money(to);
      return;
    }
    const t0 = performance.now(), dur = 900;
    (function step(t) {
      const p = Math.min((t - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = K.money(Math.round(start + (to - start) * eased));
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* ═══ TODAY ══════════════════════════════════════════════ */
  function renderToday() {
    const b = K.budgetState();
    const now = new Date();

    $('#todayEyebrow').textContent =
      now.toLocaleString('en-IN', { month: 'long' }).toLowerCase() +
      ' · day ' + b.day + ' of ' + b.daysInMonth;

    /* gauge */
    const C = 2 * Math.PI * 96;
    const frac = b.budget ? Math.min(b.pct / 100, 1) : 0;
    const arc = $('#gaugeArc');
    const colour = b.budget ? ringColour(b.pct) : getCSS('--muted-2');
    $('#gauge').style.setProperty('--ring', colour);
    requestAnimationFrame(() => { arc.style.strokeDashoffset = String(C * (1 - frac)); });

    const prev = parseFloat($('#gaugeAmount').dataset.v || '0');
    $('#gaugeAmount').dataset.v = String(b.spent);
    countUp($('#gaugeAmount'), b.spent, prev);

    if (b.budget) {
      $('#gaugeOf').innerHTML = b.left >= 0
        ? 'of ' + esc(K.money(b.budget)) + ' · <b>' + esc(K.money(b.left)) + ' left</b>'
        : 'of ' + esc(K.money(b.budget)) + ' · <b style="color:var(--over)">over by ' +
          esc(K.money(-b.left)) + '</b>';
    } else {
      $('#gaugeOf').innerHTML = 'no ceiling set · <b>add one in Setup</b>';
    }

    /* checkpoint ticks around the ring */
    const ticks = K.checkpointLevels(K.state().checkpoints).filter(l => l <= 100);
    $('#gaugeTicks').innerHTML = ticks.map(lv => {
      const a = (lv / 100) * 2 * Math.PI;
      const x1 = 120 + 86 * Math.cos(a), y1 = 120 + 86 * Math.sin(a);
      const x2 = 120 + 106 * Math.cos(a), y2 = 120 + 106 * Math.sin(a);
      const past = b.budget && b.pct >= lv ? ' class="is-past"' : '';
      return '<line' + past + ' x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) +
             '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '"/>';
    }).join('');

    /* pace */
    const cells = [];
    if (b.budget) {
      cells.push(cell('safe pace', rate(b.safeDaily) + '/day',
        b.daysLeft + ' day' + (b.daysLeft === 1 ? '' : 's') + ' to go', b.left < 0));
      cells.push(cell('your pace', rate(b.actualDaily) + '/day',
        b.actualDaily > b.safeDaily && b.left >= 0 ? 'faster than safe' : 'on the money',
        b.budget && b.actualDaily > b.safeDaily && b.left >= 0));
    } else {
      const t = K.sum(K.inRange('today'));
      const w = K.sum(K.inRange('week'));
      cells.push(cell('today', K.money(t), K.inRange('today').length + ' entries'));
      cells.push(cell('this week', K.money(w), K.inRange('week').length + ' entries'));
    }
    $('#paceStats').innerHTML = cells.join('');

    /* month strip */
    const monthEntries = K.inRange('month');
    const perDay = new Array(b.daysInMonth).fill(0);
    monthEntries.forEach(e => { perDay[new Date(e.ts).getDate() - 1] += e.amount; });
    const peak = Math.max.apply(null, perDay.concat([1]));
    $('#monthStrip').innerHTML = perDay.map((v, i) => {
      const h = v ? Math.max((v / peak) * 100, 6) : 3;
      const cls = i + 1 === b.day ? ' is-today' : (v ? ' is-spent' : '');
      return '<div class="strip__bar' + cls + '" style="height:' + h.toFixed(1) +
             '%;animation-delay:' + (i * 14) + 'ms" title="' + (i + 1) + '"></div>';
    }).join('');
    $('#monthStripTotal').textContent = K.money(b.spent) + ' · ' + monthEntries.length + ' entries';

    /* today's spine */
    const today = K.inRange('today').sort((a, c) => c.ts - a.ts || c.id - a.id);
    $('#todayTotal').textContent = today.length ? K.money(K.sum(today)) : '';
    $('#todaySpine').innerHTML = today.length
      ? today.map(rowHTML).join('')
      : '<div class="empty">Nothing yet today.<br>Type <code>uber 105</code> below and it files itself.</div>';
  }

  /* Rates read better without paise: ₹1,440/day, not ₹1,440.13/day. */
  const rate = paise => K.money(Math.round(paise / 100) * 100);

  function cell(k, v, n, bad) {
    return '<div class="cell"><div class="cell__k">' + esc(k) + '</div>' +
           '<div class="cell__v num' + (bad ? ' is-over' : '') + '">' + esc(v) + '</div>' +
           (n ? '<div class="cell__n">' + esc(n) + '</div>' : '') + '</div>';
  }

  function rowHTML(e, i) {
    const c = K.catMeta(e.category);
    const t = new Date(e.ts).toTimeString().slice(0, 5);
    return '<div class="row" style="--c:' + c.color + ';animation-delay:' + ((i || 0) * 45) + 'ms">' +
      '<span class="row__dot"></span>' +
      '<div class="row__main">' +
        '<div class="row__top">' +
          '<span class="row__merchant">' + esc(e.merchant) + '</span>' +
          '<span class="row__amt num">' + esc(K.money(e.amount)) + '</span>' +
        '</div>' +
        '<div class="row__meta">' +
          '<em data-cat="' + e.id + '">' + esc(c.name) + '</em>' +
          '<span>' + t + '</span>' +
          (e.note ? '<span>' + esc(e.note) + '</span>' : '') +
          (e.pending ? '<span class="row__pending">needs a category</span>' : '') +
        '</div>' +
      '</div>' +
      '<button class="row__del" data-del="' + e.id + '" aria-label="delete">✕</button>' +
    '</div>';
  }

  /* ═══ LOG ════════════════════════════════════════════════ */
  const LOG_RANGES = [['today','today'],['week','this week'],['month','this month'],['year','this year'],['all','everything']];

  function renderLog() {
    $('#logFilters').innerHTML = LOG_RANGES.map(([k, label]) =>
      '<button class="chip' + (logFilter === k ? ' is-on' : '') + '" data-log="' + k + '">' +
      esc(label) + '</button>').join('');

    const list = K.inRange(logFilter).sort((a, b) => b.ts - a.ts || b.id - a.id);
    if (!list.length) {
      $('#logBody').innerHTML = '<div class="empty">Nothing in this window.</div>';
      return;
    }

    const groups = {};
    list.forEach(e => {
      const d = new Date(e.ts);
      const key = d.toDateString();
      (groups[key] = groups[key] || []).push(e);
    });

    const todayKey = new Date().toDateString();
    const yestKey = new Date(Date.now() - 864e5).toDateString();

    $('#logBody').innerHTML = Object.keys(groups).map(key => {
      const rows = groups[key];
      const d = new Date(key);
      const label = key === todayKey ? 'today'
        : key === yestKey ? 'yesterday'
        : d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }).toLowerCase();
      return '<div class="daygroup"><div class="daygroup__head">' +
        '<span class="micro">' + esc(label) + '</span>' +
        '<span class="micro micro--dim num">' + esc(K.money(K.sum(rows))) + '</span>' +
        '</div><div class="spine">' + rows.map(rowHTML).join('') + '</div></div>';
    }).join('');
  }

  /* ═══ STATS ══════════════════════════════════════════════ */
  const STAT_RANGES = [['week','this week'],['month','this month'],['year','this year'],['all','all time']];

  function renderStats() {
    $('#statsRange').innerHTML = STAT_RANGES.map(([k, label]) =>
      '<button class="chip' + (statsRange === k ? ' is-on' : '') + '" data-stat="' + k + '">' +
      esc(label) + '</button>').join('');

    const avg = K.averages();
    if (!avg) {
      $('#statsMarquee').hidden = true;
      $('#statsBody').innerHTML = '<div class="empty">Nothing to shape yet. Add a few spends first.</div>';
      return;
    }
    $('#statsMarquee').hidden = false;

    const bits = [
      'spend till date <b>' + K.money(avg.total) + '</b>',
      avg.count + ' entries',
      'per day <b>' + K.money(avg.perDay) + '</b>',
      'per week <b>' + K.money(avg.perWeek) + '</b>',
      'per month <b>' + K.money(avg.perMonth) + '</b>',
      'per entry <b>' + K.money(avg.perEntry) + '</b>',
      'tracking ' + avg.days + ' day' + (avg.days === 1 ? '' : 's'),
    ];
    const strip = bits.map(b => '<span>' + b + '</span>').join('');
    $('#marqueeTrack').innerHTML = strip + strip;

    const list = K.inRange(statsRange);
    const total = K.sum(list);
    const cats = K.byCategory(list);

    let html = '<div class="stats">' +
      cell('spent', K.money(total), K.range(statsRange)[2]) +
      cell('entries', String(list.length),
        list.length ? 'avg ' + rate(Math.round(total / list.length)) : '—') +
      '</div>';

    if (cats.length) {
      html += '<div class="block"><div class="block__head">' +
        '<span class="micro">by category</span>' +
        '<span class="micro micro--dim">' + cats.length + ' in play</span></div>';
      html += cats.map((c, i) => {
        const pct = total ? (c.total / total) * 100 : 0;
        return '<div class="cat" style="--c:' + c.color + '">' +
          '<div class="cat__top">' +
            '<span class="cat__name"><i class="cat__swatch"></i>' + esc(c.name) + '</span>' +
            '<span class="cat__amt num">' + esc(K.money(c.total)) + '</span>' +
          '</div>' +
          '<div class="cat__bar"><div class="cat__fill" style="width:' + pct.toFixed(1) +
            '%;animation-delay:' + (i * 60) + 'ms"></div></div>' +
          '<div class="cat__pct">' + pct.toFixed(0) + '% · ' + c.count + ' entr' +
            (c.count === 1 ? 'y' : 'ies') + '</div>' +
        '</div>';
      }).join('') + '</div>';
    } else {
      html += '<div class="empty">Nothing in this window.</div>';
    }

    html += '<div class="block"><div class="block__head"><span class="micro">the long run</span></div>' +
      '<div class="stats">' +
        cell('per day', rate(avg.perDay), 'across ' + avg.days + ' days') +
        cell('per month', rate(avg.perMonth), 'projected') +
        cell('biggest', K.money(avg.biggest.amount), avg.biggest.merchant) +
        cell('heaviest', avg.top ? avg.top.name : '—',
             avg.top ? K.money(avg.top.total) : '') +
      '</div></div>';

    $('#statsBody').innerHTML = html;
  }

  /* ═══ SETUP ══════════════════════════════════════════════ */
  function renderSetup() {
    const s = K.state();
    const b = K.budgetState();
    const marks = [];
    for (let i = 1; i <= s.checkpoints; i++) marks.push(Math.round((100 * i) / s.checkpoints));

    let html = '';

    html += '<div class="field"><span class="micro field__k">monthly ceiling</span>' +
      '<input class="input num" id="budgetInput" type="text" inputmode="decimal" ' +
      'value="' + (s.budget ? (s.budget / 100) : '') + '" placeholder="45000">' +
      '<div class="field__hint">Any format works: <code>45000</code>, <code>45,000</code>, ' +
      '<code>45k</code>. ' + (s.budget
        ? 'Checkpoints land at ' + marks.map(m => m + '%').join(', ') + '.'
        : 'Set one and the gauge comes alive.') + '</div>' +
      '<div class="btnrow"><button class="btn" data-act="save-budget"><span>save ceiling</span></button></div></div>';

    html += '<div class="field"><span class="micro field__k">checkpoints</span>' +
      '<div class="btnrow">' + [3, 4, 5, 6].map(n =>
        '<button class="btn ' + (s.checkpoints === n ? '' : 'btn--ghost') +
        '" data-cp="' + n + '"><span>' + n + ' parts</span></button>').join('') + '</div>' +
      '<div class="field__hint">Five parts means a nudge at 20, 40, 60, 80 and 100 percent, ' +
      'then again at 125, 150 and 200 when you have blown through it.</div></div>';

    const cats = K.allCategories();
    const mine = cats.filter(c => c.custom);
    html += '<div class="field"><span class="micro field__k">categories</span>' +
      '<div class="chips" style="padding-bottom:6px;flex-wrap:wrap;overflow:visible">' +
        cats.map(c => '<span class="chip" style="border-color:' + c.color +
          '55;color:' + c.color + '">' + esc(c.name) + '</span>').join('') + '</div>' +
      '<div class="field__hint">Twenty built in, Smoking and Drinking kept separate. ' +
      'Tag a spend with something new, like <code>gift 900 #festivals</code>, and the ' +
      'category is created on the spot.</div>' +
      '<div class="btnrow">' +
        '<button class="btn" data-act="new-cat"><span>new category</span></button>' +
        (mine.length ? '<button class="btn btn--ghost" data-act="del-cat"><span>remove one of mine</span></button>' : '') +
      '</div></div>';

    html += '<div class="field"><span class="micro field__k">take it with you</span>' +
      '<div class="btnrow">' +
        '<button class="btn" data-act="csv"><span>export csv</span></button>' +
        '<button class="btn btn--ghost" data-act="json"><span>backup json</span></button>' +
        '<button class="btn btn--ghost" data-act="import"><span>restore</span></button>' +
      '</div>' +
      '<div class="field__hint">Everything lives on this device only, in local storage. ' +
      'Nothing is sent anywhere. Back up now and then.</div></div>';

    html += '<div class="field"><span class="micro field__k">wipe</span>' +
      '<div class="btnrow">' +
        '<button class="btn btn--danger" data-clear="month"><span>this month</span></button>' +
        '<button class="btn btn--danger" data-clear="year"><span>this year</span></button>' +
        '<button class="btn btn--danger" data-clear="all"><span>everything</span></button>' +
        '<button class="btn btn--ghost" data-act="unlearn"><span>forget learned shops</span></button>' +
      '</div>' +
      '<div class="field__hint">Each asks before it does anything. Your ceiling and your ' +
      'categories survive a wipe.</div></div>';

    html += '<div class="field"><span class="micro field__k">add to home screen</span>' +
      '<div class="field__hint">In Safari, tap Share, then <b>Add to Home Screen</b>. ' +
      'It opens full screen with no browser chrome, and works offline.</div></div>';

    html += '<div class="field" style="border-bottom:0"><span class="micro field__k">the other half</span>' +
      '<div class="field__hint">There is a Telegram bot, <b>@KharchaaaaBot</b>, that does all ' +
      'of this in chat and reads bank SMS and photographed bills. This app and that bot ' +
      'share the same data model, so they can be joined later without a migration.<br><br>' +
      '<span class="micro micro--dim">kharchaaaa · v1 · ' + s.entries.length + ' entries held</span>' +
      '</div></div>';

    $('#setupBody').innerHTML = html;
  }

  /* ═══ COMPOSER ═══════════════════════════════════════════ */
  /* The composer grows with the number of lines, up to a ceiling. */
  function grow() {
    const el = $('#entry');
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 128) + 'px';
  }

  function livePreview() {
    const text = $('#entry').value;
    const results = K.parseAll(text);
    const good = results.filter(r => r.parsed);

    const dot = $('#composerDot');
    const go = $('#go');

    if (!good.length) {
      $('#preview').hidden = true;
      dot.className = 'dot';
      dot.style.removeProperty('--c');
      go.classList.remove('is-ready');
      return;
    }

    go.classList.add('is-ready');
    const first = good[0].parsed;
    const meta = K.catMeta(first.category || 'uncategorized');
    dot.className = 'dot is-live';
    dot.style.setProperty('--c', meta.color);

    $('#previewRows').innerHTML = good.slice(0, 4).map(r => {
      const p = r.parsed;
      const c = K.catMeta(p.category || 'uncategorized');
      const label = p.unknownTag ? '＋ ' + p.unknownTag : (p.category ? c.name : 'needs a category');
      return '<div class="pchip" style="--c:' + c.color + '">' +
        '<span class="pchip__dot"></span>' +
        '<span class="pchip__m">' + esc(p.merchant) + '</span>' +
        '<span class="pchip__c">' + esc(label) + '</span>' +
        '<span class="pchip__a num">' + esc(K.money(p.amount)) + '</span>' +
      '</div>';
    }).join('');
    $('#preview').hidden = false;
  }

  function submit(ev) {
    if (ev) ev.preventDefault();
    const text = $('#entry').value;
    const results = K.parseAll(text);
    const good = results.filter(r => r.parsed);
    const bad = results.filter(r => !r.parsed);

    if (!good.length) {
      toast(text.trim() ? 'no amount in that' : 'type something like uber 105');
      return;
    }

    const added = [];
    good.forEach(r => {
      const p = r.parsed;
      if (p.unknownTag) {
        const slug = K.addCategory(p.unknownTag);
        if (slug) p.category = slug;
      }
      added.push(K.add(p, 'manual'));
    });

    $('#entry').value = '';
    grow();
    $('#preview').hidden = true;
    $('#composerDot').className = 'dot';
    $('#go').classList.remove('is-ready');
    $('#entry').blur();

    render();

    const hit = K.crossedCheckpoint();
    if (hit) {
      flash(hit);
    } else {
      const total = added.reduce((n, e) => n + e.amount, 0);
      toast(added.length === 1
        ? 'saved ' + K.money(total) + ' · ' + K.catMeta(added[0].category).name
        : added.length + ' saved · ' + K.money(total));
    }
    if (bad.length) setTimeout(() => toast('could not read: ' + bad[0].line.slice(0, 24)), 1800);

    const stillPending = added.filter(e => e.pending);
    if (stillPending.length) setTimeout(() => openSheet(stillPending[0].id), hit ? 2400 : 700);
  }

  /* ═══ CHECKPOINT TAKEOVER ════════════════════════════════ */
  function flash(hit) {
    const { level, b } = hit;
    const el = $('#flash');
    const colour = level >= 100 ? getCSS('--over') : level >= 80 ? getCSS('--warn') : getCSS('--accent');
    el.style.setProperty('--flash', colour);
    $('#flashPct').textContent = level + '%';
    $('#flashLabel').textContent = level >= 100
      ? 'of ' + b.label + ' spent' : 'of ' + b.label + ' gone';
    $('#flashSub').textContent = b.left >= 0
      ? K.money(b.left) + ' left for ' + b.daysLeft + ' day' + (b.daysLeft === 1 ? '' : 's') +
        '. Keep it under ' + K.money(b.safeDaily) + ' a day.'
      : 'Over by ' + K.money(-b.left) + '. You are overspending.';
    el.classList.add('is-on');
    if (navigator.vibrate) { try { navigator.vibrate(level >= 100 ? [40, 60, 40] : 30); } catch (e) {} }
    setTimeout(() => el.classList.remove('is-on'), 2100);
  }

  /* ═══ SHEET ══════════════════════════════════════════════ */
  function openSheet(entryId, mode) {
    sheetCtx = { entryId, mode: mode || 'pick' };
    const s = $('#sheet');

    if (sheetCtx.mode === 'pick') {
      const e = K.state().entries.find(x => x.id === entryId);
      $('#sheetTitle').textContent = e
        ? 'file ' + e.merchant + ' · ' + K.money(e.amount)
        : 'pick a category';
      $('#sheetBody').innerHTML =
        '<div class="catgrid">' + K.allCategories().map(c =>
          '<button class="catbtn" style="--c:' + c.color + '" data-pick="' + c.slug + '">' +
          '<i class="catbtn__d"></i><span>' + esc(c.name) + '</span></button>').join('') +
        '</div>' +
        '<div class="btnrow"><button class="btn" data-act="new-cat"><span>＋ new category</span></button>' +
        '<button class="btn btn--danger" data-act="drop"><span>delete entry</span></button></div>';
    } else if (sheetCtx.mode === 'del-cat') {
      const mine = K.allCategories().filter(c => c.custom);
      $('#sheetTitle').textContent = 'remove one of yours';
      $('#sheetBody').innerHTML = '<div class="catgrid">' + mine.map(c =>
        '<button class="catbtn" style="--c:' + c.color + '" data-rm="' + c.slug + '">' +
        '<i class="catbtn__d"></i><span>' + esc(c.name) + '</span></button>').join('') +
        '</div><div class="field__hint">Entries filed under it move to Misc.</div>';
    }
    s.hidden = false;
  }
  function closeSheet() { $('#sheet').hidden = true; sheetCtx = null; }

  /* ═══ TOAST ══════════════════════════════════════════════ */
  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 2600);
  }

  /* ═══ DOWNLOAD ═══════════════════════════════════════════ */
  function download(name, text, type) {
    const blob = new Blob([text], { type: type || 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /* ═══ ROUTING ════════════════════════════════════════════ */
  function go(name) {
    screen = name;
    $$('.screen').forEach(s => s.classList.toggle('is-active', s.id === 'screen-' + name));
    $$('.tab').forEach(t => t.classList.toggle('is-on', t.dataset.screen === name));
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    render();
  }

  function render() {
    if (screen === 'today') renderToday();
    else if (screen === 'log') renderLog();
    else if (screen === 'stats') renderStats();
    else renderSetup();
  }

  /* ═══ EVENTS ═════════════════════════════════════════════ */
  function wire() {
    $('#composer').addEventListener('submit', submit);
    $('#entry').addEventListener('input', () => { grow(); livePreview(); });
    /* Enter sends. Shift+Enter starts another spend on a new line. */
    $('#entry').addEventListener('keydown', ev => {
      if (ev.key === 'Enter' && !ev.shiftKey) { ev.preventDefault(); submit(); }
    });
    $('#composerCat').addEventListener('click', () => {
      const p = K.parseLine($('#entry').value);
      if (!p) { $('#entry').focus(); return; }
      toast(p.category ? K.catMeta(p.category).name : 'no category guessed yet');
    });

    $('#tabs').addEventListener('click', ev => {
      const t = ev.target.closest('.tab');
      if (t) go(t.dataset.screen);
    });

    document.addEventListener('click', ev => {
      const t = ev.target;

      const logChip = t.closest('[data-log]');
      if (logChip) { logFilter = logChip.dataset.log; renderLog(); return; }

      const statChip = t.closest('[data-stat]');
      if (statChip) { statsRange = statChip.dataset.stat; renderStats(); return; }

      const del = t.closest('[data-del]');
      if (del) {
        const e = K.remove(+del.dataset.del);
        if (e) { toast('deleted ' + K.money(e.amount)); render(); }
        return;
      }

      const catTap = t.closest('[data-cat]');
      if (catTap) { openSheet(+catTap.dataset.cat); return; }

      const pick = t.closest('[data-pick]');
      if (pick && sheetCtx) {
        K.setCategory(sheetCtx.entryId, pick.dataset.pick, true);
        const name = K.catMeta(pick.dataset.pick).name;
        closeSheet();
        render();
        toast('filed under ' + name + ' · remembered');
        const next = K.pending()[0];
        if (next) setTimeout(() => openSheet(next.id), 500);
        return;
      }

      const rm = t.closest('[data-rm]');
      if (rm) {
        const name = K.catMeta(rm.dataset.rm).name;
        const moved = K.removeCategory(rm.dataset.rm);
        closeSheet(); render();
        toast('removed ' + name + (moved ? ' · ' + moved + ' moved to misc' : ''));
        return;
      }

      if (t.closest('[data-close]')) { closeSheet(); return; }

      const cp = t.closest('[data-cp]');
      if (cp) {
        K.state().checkpoints = +cp.dataset.cp;
        K.resetAlerts(); K.save(); renderSetup();
        toast('budget split into ' + cp.dataset.cp + ' parts');
        return;
      }

      const clear = t.closest('[data-clear]');
      if (clear) {
        const kind = clear.dataset.clear;
        const n = K.inRange(kind).length;
        if (!n) { toast('nothing to clear there'); return; }
        const label = K.range(kind)[2];
        if (!confirm('Delete ' + n + ' entr' + (n === 1 ? 'y' : 'ies') + ' from ' +
                     label + '?\n\nThis cannot be undone.')) return;
        K.clearRange(kind);
        render();
        toast('cleared ' + label.toLowerCase());
        return;
      }

      const act = t.closest('[data-act]');
      if (act) handleAction(act.dataset.act);
    });

    /* Escape closes the sheet, handy on desktop */
    document.addEventListener('keydown', ev => {
      if (ev.key === 'Escape') closeSheet();
    });
  }

  function handleAction(act) {
    if (act === 'save-budget') {
      const raw = ($('#budgetInput') || {}).value || '';
      const p = K.parseLine('budget ' + raw);
      if (!p) { toast('could not read that amount'); return; }
      K.state().budget = p.amount;
      K.resetAlerts(); K.save();
      renderSetup();
      toast('ceiling set to ' + K.money(p.amount));
      return;
    }
    if (act === 'new-cat') {
      const name = prompt('Name the category');
      if (!name) return;
      const slug = K.addCategory(name);
      if (!slug) { toast('that name will not work'); return; }
      if (sheetCtx && sheetCtx.mode === 'pick' && sheetCtx.entryId) {
        K.setCategory(sheetCtx.entryId, slug, true);
        closeSheet();
      }
      render();
      toast('created ' + K.catMeta(slug).name);
      return;
    }
    if (act === 'del-cat') { openSheet(null, 'del-cat'); return; }
    if (act === 'drop') {
      if (sheetCtx && sheetCtx.entryId) K.remove(sheetCtx.entryId);
      closeSheet(); render(); toast('deleted');
      return;
    }
    if (act === 'csv') {
      download('kharchaaaa-' + K.monthKey() + '.csv', K.toCSV(), 'text/csv');
      toast('csv exported'); return;
    }
    if (act === 'json') {
      download('kharchaaaa-backup-' + K.monthKey() + '.json', K.toJSON(), 'application/json');
      toast('backup saved'); return;
    }
    if (act === 'import') {
      const inp = document.createElement('input');
      inp.type = 'file'; inp.accept = 'application/json,.json';
      inp.onchange = () => {
        const f = inp.files && inp.files[0];
        if (!f) return;
        const r = new FileReader();
        r.onload = () => {
          try {
            const data = JSON.parse(r.result);
            if (!data || !Array.isArray(data.entries)) throw new Error('shape');
            if (!confirm('Replace everything on this device with ' + data.entries.length +
                         ' entries from that file?')) return;
            K.replace(data);
            render(); toast('restored ' + data.entries.length + ' entries');
          } catch (e) { toast('that file is not a kharchaaaa backup'); }
        };
        r.readAsText(f);
      };
      inp.click();
      return;
    }
    if (act === 'unlearn') {
      const n = K.clearLearned();
      toast(n ? 'forgot ' + n + ' shop' + (n === 1 ? '' : 's') : 'nothing learned yet');
      return;
    }
  }

  /* ═══ BOOT ═══════════════════════════════════════════════ */
  function boot() {
    wire();
    go('today');

    const p = K.pending();
    if (p.length) setTimeout(() => openSheet(p[0].id), 900);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

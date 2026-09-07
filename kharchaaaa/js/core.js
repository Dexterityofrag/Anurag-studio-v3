/* ═══════════════════════════════════════════════════════════
   Kharchaaaa — core: categories, parsing, storage, budget maths.

   The data model is deliberately identical to the Telegram bot's:
   amounts are integer paise, categories are the same slugs. That is
   what makes it possible to link the two later without a migration.
   ═══════════════════════════════════════════════════════════ */
window.K = (function () {
  'use strict';

  /* ─── categories ──────────────────────────────────────── */
  const CATEGORIES = [
    ['food_delivery',  'Food delivery',    '#FF6B35'],
    ['quick_commerce', 'Quick commerce',   '#FFD23F'],
    ['groceries',      'Groceries',        '#7ED957'],
    ['dining',         'Dining out',       '#FF8FA3'],
    ['drinking',       'Drinking',         '#C77DFF'],
    ['smoking',        'Smoking',          '#94A3B8'],
    ['transport',      'Transport',        '#00FF94'],
    ['travel',         'Travel',           '#4CC9F0'],
    ['shopping',       'Shopping',         '#F72585'],
    ['bills',          'Bills',            '#FFB703'],
    ['rent',           'Rent',             '#E07A5F'],
    ['subscriptions',  'Subscriptions',    '#56CFE1'],
    ['entertainment',  'Entertainment',    '#D264E0'],
    ['health',         'Health',           '#06D6A0'],
    ['personal_care',  'Personal care',    '#FFAFCC'],
    ['education',      'Education',        '#A3B18A'],
    ['investments',    'Investments',      '#43AA8B'],
    ['transfers',      'Transfers',        '#9BA0AA'],
    ['misc',           'Misc',             '#6C757D'],
    ['uncategorized',  'Uncategorised',    '#4A4A4A'],
  ];

  const RULES = [
    ['quick_commerce', ['zepto','blinkit','grofers','instamart','dunzo','bbnow','swish','zapp','slikk','10 minute']],
    ['food_delivery',  ['swiggy','zomato','eatsure','faasos','behrouz','ovenstory','box8','dominos','domino','pizza hut','mcdonald','kfc','burger king','wow momo','biryani by kilo','eatfit','freshmenu','rebel foods','licious','freshtohome']],
    ['groceries',      ['dmart','d-mart','bigbasket','big basket','jiomart','jio mart','reliance fresh','reliance smart','more retail','star bazaar','spencer','nature basket','kirana','grocery','supermarket','vegetable','sabzi','milk','amul','country delight']],
    ['drinking',       ['beer','wine','whisky','whiskey','vodka','tequila','brandy','alcohol','liquor','booze','daaru','spirits','cocktail',' rum ',' gin ',' ale ','bira','kingfisher','budweiser','bud light','corona extra','heineken','tuborg','carlsberg','old monk','jack daniel','johnnie walker','chivas','absolut','smirnoff','bacardi','breezer','magic moments','sula','fratelli','wine shop','wineshop','liquor store','liquor shop','tasmac','living liquidz','madhuloka','wine store','cellar',' bar ',' pub ','brewery','brewpub','taproom','beer cafe','toit','doolally','geist']],
    ['smoking',        ['cigarette','cigarettes','cigar','ciggy','ciggies',' cigs ',' cig ','smoking',' smokes ','tobacco','tobacconist','nicotine','marlboro','gold flake','goldflake','classic milds','navy cut','wills navy','benson','dunhill','camel blue','vape','vaping','juul','e-cigarette','hookah','shisha','sheesha','beedi',' bidi ','rolling paper','paan','pan shop','paanwala',' zyn ',' snus ']],
    ['dining',         ['starbucks','cafe','café','coffee','third wave','blue tokai','chaayos','chai point','barbeque nation','restaurant','bistro','dhaba','social','eatery','kitchen','food court','canteen','smoke house',' chai ',' tea ',' lunch ',' dinner ',' breakfast ',' brunch ',' snacks ',' snack ',' juice ',' icecream ',' ice cream ',' samosa ',' dosa ',' thali ',' biryani ',' momos ',' shake ']],
    ['transport',      ['uber','ola ','olacabs','ola cabs','rapido','namma yatri','blusmart','meru','metro','dmrc','bmrcl','bmtc','best bus','irctc','redbus','abhibus','petrol','diesel','fuel','indian oil','indianoil','iocl','bharat petroleum','bpcl','hindustan petroleum','hpcl','shell ','nayara','fastag','toll','parking','auto ','yulu','bounce','chalo','quick ride','zoomcar']],
    ['travel',         ['makemytrip','make my trip','goibibo','cleartrip','ixigo','yatra','easemytrip','oyo','airbnb','booking.com','agoda','treebo','fabhotel','indigo','air india','vistara','spicejet','akasa','emirates','qatar airways','lufthansa','trivago','expedia','railway','visa fee','passport']],
    ['shopping',       ['amazon','flipkart','myntra','ajio','nykaa','meesho','tatacliq','tata cliq','snapdeal','decathlon','ikea','zara','h&m','uniqlo','westside','lifestyle','shoppers stop','pantaloons','croma','reliance digital','vijay sales','apple store','boat','urbanic','bewakoof','souled store','puma','adidas','nike','titan','tanishq','lenskart','firstcry','pepperfry','urban ladder','wakefit','macbook','iphone','ipad','laptop','airpods','headphone','earbuds','keyboard','monitor','charger','shoes','sneakers','tshirt','t-shirt','jeans','jacket','furniture']],
    ['bills',          ['airtel','jio ','reliance jio','vodafone',' vi ','bsnl','act fibernet','actcorp','hathway','excitel','tikona','electricity','bescom','mseb','adani electricity','tata power','torrent power','bses','cesc','water bill','gas bill','indane','hp gas','bharat gas','broadband','postpaid','prepaid','recharge','dth','tata play','dish tv','municipal','property tax','wifi']],
    ['rent',           ['rent','landlord','society maintenance','nobroker','nestaway','colive','zolo','stanza living','brokerage','housing.com']],
    ['subscriptions',  ['netflix','spotify','prime video','amazon prime','hotstar','jiocinema','sonyliv','zee5','youtube premium','google one','icloud','apple.com/bill','openai','chatgpt','anthropic','claude.ai','github','figma','notion','adobe','canva','midjourney','cursor','vercel','netlify','digitalocean','aws','godaddy','namecheap','cloudflare','linkedin premium','medium','audible','gaana','wynk','jiosaavn']],
    ['entertainment',  ['bookmyshow','book my show','pvr','inox','cinepolis','carnival cinema','district','paytm insider','insider.in','steam','playstation','xbox','nintendo','epic games','dream11','mpl','cinema','multiplex','concert','sunburn','comedy']],
    ['health',         ['apollo','pharmeasy','1mg','tata 1mg','netmeds','practo','medplus','wellness forever','cult.fit','cultfit','curefit','gym','fitness','hospital','clinic','diagnostic','pathlab','dr lal','thyrocare','medical','pharmacy','chemist','dentist','optic','physio']],
    ['personal_care',  ['salon','urban company','urbanclap','looks salon','naturals','toni & guy','barber','spa','grooming','bombay shaving','beardo','mamaearth','purplle']],
    ['education',      ['udemy','coursera','edx','unacademy','byju','vedantu','physics wallah','upgrad','scaler','great learning','skillshare','masterclass','school fee','college fee','tuition','exam fee','crossword','bookswagon']],
    ['investments',    ['zerodha','groww','upstox','angel one','icici direct','kuvera','coindcx','wazirx','binance','smallcase','mutual fund','sip ','nps','ppf','lic ','policybazaar','insurance','premium payment','indmoney','dhan']],
    ['transfers',      ['upi to','sent to','paytm wallet','phonepe wallet','gpay','google pay','cred ','credit card payment','card payment','loan emi','emi ','atm ','cash withdrawal','neft','imps','rtgs']],
  ];

  const ALIASES = {
    food:'food_delivery', qc:'quick_commerce', quick:'quick_commerce', grocery:'groceries',
    kirana:'groceries', cafe:'dining', restaurant:'dining', coffee:'dining', eatout:'dining',
    smoke:'smoking', smokes:'smoking', cig:'smoking', cigs:'smoking', cigarette:'smoking',
    cigarettes:'smoking', ciggy:'smoking', tobacco:'smoking', vape:'smoking', paan:'smoking',
    drink:'drinking', drinks:'drinking', alcohol:'drinking', booze:'drinking', beer:'drinking',
    liquor:'drinking', bar:'drinking', pub:'drinking', daaru:'drinking',
    cab:'transport', taxi:'transport', fuel:'transport', petrol:'transport',
    trip:'travel', flight:'travel', hotel:'travel', shop:'shopping', clothes:'shopping',
    utilities:'bills', bill:'bills', recharge:'bills', house:'rent', maintenance:'rent',
    subs:'subscriptions', sub:'subscriptions', movies:'entertainment', fun:'entertainment',
    games:'entertainment', medical:'health', pharmacy:'health', gym:'health', doctor:'health',
    salon:'personal_care', grooming:'personal_care', study:'education', course:'education',
    invest:'investments', sip:'investments', transfer:'transfers', upi:'transfers',
    other:'misc', others:'misc',
  };

  /* ─── storage ─────────────────────────────────────────── */
  const KEY = 'kharchaaaa.v1';
  const blank = () => ({
    entries: [], budget: 0, checkpoints: 5, currency: 'INR',
    custom: [], learned: {}, alerted: {}, nextId: 1,
  });

  let S = blank();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) S = Object.assign(blank(), JSON.parse(raw));
    } catch (e) { S = blank(); }
    return S;
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
  }
  const state = () => S;
  function replace(next) { S = Object.assign(blank(), next); save(); }

  /* ─── category helpers ────────────────────────────────── */
  function allCategories() {
    const out = CATEGORIES.filter(c => c[0] !== 'uncategorized').map(c => ({
      slug: c[0], name: c[1], color: c[2], custom: false,
    }));
    S.custom.forEach(c => out.push({ slug: c.slug, name: c.name, color: c.color, custom: true }));
    return out;
  }
  function catMeta(slug) {
    const b = CATEGORIES.find(c => c[0] === slug);
    if (b) return { slug, name: b[1], color: b[2], custom: false };
    const c = S.custom.find(x => x.slug === slug);
    if (c) return { slug, name: c.name, color: c.color, custom: true };
    return { slug, name: slug, color: '#4A4A4A', custom: false };
  }
  function makeSlug(name) {
    const b = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 20);
    return b ? 'u_' + b : '';
  }
  /* Custom categories get a stable hue derived from the name. */
  function colorFor(name) {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
    return `hsl(${h} 78% 62%)`;
  }
  function addCategory(rawName) {
    const name = rawName.trim().replace(/\s+/g, ' ').slice(0, 24);
    if (name.length < 2) return null;
    const existing = resolveCat(name);
    if (existing) return existing;
    const slug = makeSlug(name);
    if (!slug) return null;
    const pretty = name.replace(/\b\w/g, m => m.toUpperCase());
    S.custom.push({ slug, name: pretty, color: colorFor(pretty) });
    save();
    return slug;
  }
  function removeCategory(slug) {
    if (!slug.startsWith('u_')) return 0;
    let moved = 0;
    S.entries.forEach(e => { if (e.category === slug) { e.category = 'misc'; moved++; } });
    Object.keys(S.learned).forEach(k => { if (S.learned[k] === slug) delete S.learned[k]; });
    S.custom = S.custom.filter(c => c.slug !== slug);
    save();
    return moved;
  }
  function resolveCat(word) {
    if (!word) return null;
    const raw = String(word).toLowerCase().trim().replace(/^#/, '');
    const w = raw.replace(/[-\s]/g, '_');
    if (CATEGORIES.some(c => c[0] === w)) return w;
    if (ALIASES[w]) return ALIASES[w];
    for (const c of S.custom) {
      if (c.slug === w || c.slug === makeSlug(raw) || c.name.toLowerCase() === raw) return c.slug;
    }
    if (w.length >= 3) {
      const hit = CATEGORIES.find(c => c[0].startsWith(w));
      if (hit) return hit[0];
      const cc = S.custom.find(c => c.name.toLowerCase().startsWith(raw));
      if (cc) return cc.slug;
    }
    return null;
  }
  function guess(text) {
    if (!text) return null;
    const hay = ' ' + text.toLowerCase().trim() + ' ';
    for (const [slug, words] of RULES) {
      for (const w of words) if (hay.indexOf(w) !== -1) return slug;
    }
    return null;
  }
  function normalise(text) {
    return (text || '').toLowerCase()
      .replace(/[^a-z0-9&]+/g, ' ')
      .replace(/\b(pvt|private|ltd|limited|llp|inc|india|technologies|tech|solutions|services|store|stores|online|payment|payments|upi|com|in)\b/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }

  /* ─── money ───────────────────────────────────────────── */
  const NUM = '\\d{1,3}(?:,\\d{2,3})*(?:\\.\\d{1,2})?|\\d+(?:\\.\\d{1,2})?';
  const SUF = 'k|l|lakh|lakhs|lac|lacs|cr|crore';
  const AMOUNT_RE = new RegExp(
    '(?:^|[^\\w.])(?:(₹|rs\\.?|inr|rupees)\\s*)?(' + NUM + ')\\s*(' + SUF + ')?(?![\\w.])',
    'gi'
  );
  const MULT = { k: 1e3, l: 1e5, lakh: 1e5, lakhs: 1e5, lac: 1e5, lacs: 1e5, cr: 1e7, crore: 1e7 };

  function toPaise(num, suffix) {
    let v = parseFloat(String(num).replace(/,/g, ''));
    if (!isFinite(v)) return 0;
    if (suffix) v *= MULT[suffix.toLowerCase()] || 1;
    return Math.round(v * 100);
  }

  function money(paise, currency) {
    const cur = currency || S.currency || 'INR';
    const sym = { INR: '₹', USD: '$', EUR: '€', GBP: '£' }[cur] || (cur + ' ');
    const neg = paise < 0;
    const v = Math.abs(paise) / 100;
    let s = v.toFixed(2);
    let [i, d] = s.split('.');
    if (cur === 'INR' && i.length > 3) {
      const last3 = i.slice(-3);
      let rest = i.slice(0, -3);
      const parts = [];
      while (rest.length > 2) { parts.unshift(rest.slice(-2)); rest = rest.slice(0, -2); }
      if (rest) parts.unshift(rest);
      i = parts.concat([last3]).join(',');
    } else if (i.length > 3) {
      i = i.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    return (neg ? '-' : '') + sym + (d === '00' ? i : i + '.' + d);
  }
  /* Compact form for tight spots: ₹12.4k, ₹1.2L */
  function moneyShort(paise) {
    const v = Math.abs(paise) / 100;
    const sym = { INR: '₹', USD: '$', EUR: '€', GBP: '£' }[S.currency] || '';
    if (v >= 1e7) return sym + (v / 1e7).toFixed(1).replace(/\.0$/, '') + 'Cr';
    if (v >= 1e5) return sym + (v / 1e5).toFixed(1).replace(/\.0$/, '') + 'L';
    if (v >= 1000) return sym + (v / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return money(paise);
  }

  /* ─── parsing a typed line ────────────────────────────── */
  const TAG_RE = /(?:^|\s)#([A-Za-z_][A-Za-z0-9_ -]{1,24})\s*$/;
  const DATE_RE = /\b(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?\b/;

  function parseLine(line) {
    let text = (line || '').trim();
    if (!text) return null;

    let forced = null, unknownTag = null;
    const tm = text.match(TAG_RE);
    if (tm) {
      const tag = tm[1].trim();
      forced = resolveCat(tag);
      if (!forced) unknownTag = tag;
      text = text.slice(0, tm.index).trim();
    }

    let when = new Date();
    const dm = text.match(DATE_RE);
    if (dm) {
      const d = +dm[1], mo = +dm[2];
      let y = dm[3] ? +dm[3] : when.getFullYear();
      if (y < 100) y += 2000;
      if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31) {
        when = new Date(y, mo - 1, d, 12, 0, 0);
        text = (text.slice(0, dm.index) + ' ' + text.slice(dm.index + dm[0].length)).trim();
      }
    } else {
      const low = text.toLowerCase();
      const rel = [['day before', 2], ['yesterday', 1]];
      for (const [word, back] of rel) {
        const i = low.indexOf(word);
        if (i !== -1) {
          when = new Date(Date.now() - back * 864e5);
          text = (text.slice(0, i) + text.slice(i + word.length)).trim();
          break;
        }
      }
    }

    AMOUNT_RE.lastIndex = 0;
    const matches = [];
    let m;
    while ((m = AMOUNT_RE.exec(text)) !== null) {
      const lead = m[0].length - m[0].replace(/^[^\w₹]*/, '').length;
      matches.push({ cur: m[1], num: m[2], suf: m[3], start: m.index + lead, end: m.index + m[0].length });
    }
    if (!matches.length) return null;
    const chosen = matches.find(x => x.cur) || matches[matches.length - 1];

    const amount = toPaise(chosen.num, chosen.suf);
    if (amount <= 0) return null;

    const before = text.slice(0, chosen.start).replace(/[\s\-:,]+$/, '').trim();
    const after = text.slice(chosen.end).replace(/^[\s\-:,/=]+/, '').replace(/^-\s*/, '').trim();
    let merchant = before || after;
    let note = before ? after : '';
    merchant = merchant.replace(/\s+/g, ' ').replace(/^[\s\-:,]+|[\s\-:,]+$/g, '');
    if (!merchant) merchant = 'Unlabelled';

    const key = normalise(merchant);
    let category = forced || S.learned[key] || guess(merchant + ' ' + note) || null;

    return {
      amount, merchant: merchant.slice(0, 60), note: note.slice(0, 120),
      key, category, unknownTag, ts: when.getTime(),
    };
  }

  /* Multi-line: one spend per line. */
  function parseAll(text) {
    return (text || '').split('\n')
      .map(l => l.trim()).filter(Boolean)
      .map(l => ({ line: l, parsed: parseLine(l) }));
  }

  /* ─── entries ─────────────────────────────────────────── */
  function add(p, source) {
    const cat = p.category || null;
    const e = {
      id: S.nextId++, ts: p.ts, amount: p.amount,
      merchant: p.merchant, note: p.note || '',
      category: cat || 'uncategorized',
      pending: cat ? 0 : 1,
      source: source || 'manual',
    };
    S.entries.push(e);
    save();
    return e;
  }
  function remove(id) {
    const i = S.entries.findIndex(e => e.id === id);
    if (i === -1) return null;
    const [gone] = S.entries.splice(i, 1);
    save();
    return gone;
  }
  function setCategory(id, slug, learn) {
    const e = S.entries.find(x => x.id === id);
    if (!e) return null;
    e.category = slug;
    e.pending = 0;
    if (learn !== false) S.learned[normalise(e.merchant)] = slug;
    save();
    return e;
  }
  const pending = () => S.entries.filter(e => e.pending);
  const sorted = () => S.entries.slice().sort((a, b) => b.ts - a.ts || b.id - a.id);

  /* ─── periods ─────────────────────────────────────────── */
  const startOfDay = d => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
  function range(kind, ref) {
    const now = ref ? new Date(ref) : new Date();
    const t = startOfDay(now);
    switch (kind) {
      case 'today':  return [t.getTime(), t.getTime() + 864e5, 'Today'];
      case 'yesterday': return [t.getTime() - 864e5, t.getTime(), 'Yesterday'];
      case 'week': {
        const dow = (t.getDay() + 6) % 7;                  // Monday first
        const s = new Date(t); s.setDate(t.getDate() - dow);
        return [s.getTime(), s.getTime() + 7 * 864e5, 'This week'];
      }
      case 'month': {
        const s = new Date(now.getFullYear(), now.getMonth(), 1);
        const e = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        return [s.getTime(), e.getTime(),
          s.toLocaleString('en-IN', { month: 'long', year: 'numeric' })];
      }
      case 'year': {
        const s = new Date(now.getFullYear(), 0, 1);
        return [s.getTime(), new Date(now.getFullYear() + 1, 0, 1).getTime(), String(now.getFullYear())];
      }
      default: return [0, 8.64e15, 'All time'];
    }
  }
  function inRange(kind) {
    const [a, b] = range(kind);
    return S.entries.filter(e => e.ts >= a && e.ts < b);
  }
  const sum = list => list.reduce((n, e) => n + e.amount, 0);

  function byCategory(list) {
    const map = {};
    list.forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return Object.keys(map)
      .map(slug => Object.assign(catMeta(slug), { total: map[slug], count: list.filter(e => e.category === slug).length }))
      .sort((a, b) => b.total - a.total);
  }

  /* ─── budget and checkpoints ──────────────────────────── */
  function monthKey(d) {
    const x = d ? new Date(d) : new Date();
    return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0');
  }
  function budgetState() {
    const now = new Date();
    const spent = sum(inRange('month'));
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const day = now.getDate();
    const left = S.budget - spent;
    const daysLeft = daysInMonth - day + 1;
    return {
      budget: S.budget, spent, left, day, daysInMonth, daysLeft,
      pct: S.budget ? (spent / S.budget) * 100 : 0,
      safeDaily: S.budget && left > 0 ? Math.floor(left / daysLeft) : 0,
      actualDaily: Math.floor(spent / Math.max(day, 1)),
      label: range('month')[2],
      monthKey: monthKey(),
    };
  }
  function checkpointLevels(n) {
    const base = [];
    for (let i = 1; i <= (n || 5); i++) base.push(Math.round((100 * i) / (n || 5)));
    return base.concat([125, 150, 200]);
  }
  /* Highest checkpoint newly crossed, or null. Marks it so it fires once. */
  function crossedCheckpoint() {
    const b = budgetState();
    if (!b.budget) return null;
    const mk = b.monthKey;
    S.alerted[mk] = S.alerted[mk] || [];
    let hit = null;
    checkpointLevels(S.checkpoints).forEach(lv => {
      if (b.pct >= lv && S.alerted[mk].indexOf(lv) === -1) {
        S.alerted[mk].push(lv);
        hit = lv;
      }
    });
    save();
    return hit === null ? null : { level: hit, b };
  }
  function resetAlerts() { S.alerted = {}; save(); }

  /* ─── clearing ────────────────────────────────────────── */
  function clearRange(kind) {
    const [a, b] = range(kind);
    const before = S.entries.length;
    S.entries = S.entries.filter(e => !(e.ts >= a && e.ts < b));
    S.alerted = {};
    save();
    return before - S.entries.length;
  }
  function clearLearned() {
    const n = Object.keys(S.learned).length;
    S.learned = {};
    save();
    return n;
  }

  /* ─── export ──────────────────────────────────────────── */
  function toCSV() {
    const head = ['id', 'date', 'time', 'amount', 'currency', 'merchant', 'category', 'note', 'source'];
    const esc = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
    const rows = sorted().map(e => {
      const d = new Date(e.ts);
      return [
        e.id,
        d.toISOString().slice(0, 10),
        d.toTimeString().slice(0, 5),
        (e.amount / 100).toFixed(2),
        S.currency,
        e.merchant,
        catMeta(e.category).name,
        e.note,
        e.source,
      ].map(esc).join(',');
    });
    return head.join(',') + '\n' + rows.join('\n');
  }
  const toJSON = () => JSON.stringify(S, null, 2);

  /* ─── averages ────────────────────────────────────────── */
  function averages() {
    const all = S.entries;
    if (!all.length) return null;
    const total = sum(all);
    const first = Math.min.apply(null, all.map(e => e.ts));
    const days = Math.max(Math.round((startOfDay(new Date()) - startOfDay(first)) / 864e5) + 1, 1);
    const biggest = all.slice().sort((a, b) => b.amount - a.amount)[0];
    return {
      total, count: all.length, days, first,
      perEntry: Math.round(total / all.length),
      perDay: Math.round(total / days),
      perWeek: Math.round(total / Math.max(days / 7, 1)),
      perMonth: Math.round(total / Math.max(days / 30.44, 1)),
      biggest,
      top: byCategory(all)[0] || null,
    };
  }

  load();

  return {
    CATEGORIES, state, save, load, replace,
    allCategories, catMeta, addCategory, removeCategory, resolveCat, guess, normalise, colorFor,
    money, moneyShort, toPaise, parseLine, parseAll,
    add, remove, setCategory, pending, sorted,
    range, inRange, sum, byCategory, startOfDay,
    budgetState, checkpointLevels, crossedCheckpoint, resetAlerts,
    clearRange, clearLearned, toCSV, toJSON, averages, monthKey,
  };
})();

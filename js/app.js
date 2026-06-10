/* وِرد — suivi de lecture & mémorisation du Coran (Hafs)
   Vanilla JS · état en localStorage · données coraniques locales (data/quran.json) */
(function () {
  'use strict';

  // ── Constantes ──────────────────────────────────────────
  const KEY = 'wird:v1';
  const GOAL_MIN = 5, GOAL_MAX = 120, GOAL_STEP = 5;
  const THEME_COLOR = { night: '#0B1413', cream: '#F6EFE0' };

  // ── i18n ────────────────────────────────────────────────
  const STR = {
    ar: {
      appName: 'وِرد',
      tabs: { home: 'الرئيسية', surahs: 'السور', review: 'المراجعة', stats: 'الإحصاء' },
      themeBtn: 'تبديل المظهر', langBtn: 'Français',
      ofGoal: (g) => 'من هدف ' + g + ' دقيقة',
      recording: 'جارٍ تسجيل القراءة',
      saved: (m) => 'سُجِّلت الجلسة · ' + m,
      start: 'ابدأ القراءة', stop: 'إيقاف',
      startLabel: 'بدء القراءة', stopLabel: 'إيقاف القراءة',
      streakCard: 'سلسلة قراءة متتالية', dayUnit: 'يومًا',
      todayCard: 'قراءة اليوم', minUnit: 'دقيقة',
      surahsTitle: 'السور',
      surahsSub: (a, b) => a + ' من ' + b + ' سورة محفوظة',
      filters: { all: 'الكل', l: 'محفوظة', p: 'قيد الحفظ' },
      status: { l: 'محفوظة', p: 'قيد الحفظ', none: 'لم تبدأ' },
      verses: 'آيات', meccan: 'مكية', medinan: 'مدنية',
      statusBtn: (name, st) => 'حالة سورة ' + name + ': ' + st,
      emptyCat: 'لا توجد سور في هذه الفئة بعد',
      revTitle: 'المراجعة',
      revLead: 'سورة تُختار عشوائيًّا من محفوظاتك، ثم آية تتلوها من حفظك',
      revEmpty: 'عَلِّم سورة واحدة على الأقل كي تبدأ المراجعة',
      goSurahs: 'إلى قائمة السور',
      draw: 'اسحب سورة',
      poolCount: (n) => n + ' سورة في المراجعة',
      surahCap: 'سُورَة',
      verseOf: (i, n) => 'الآية ' + i + ' من ' + n + ' · اتلُها من حفظك',
      nextVerse: 'الآية التالية', anotherSurah: 'سورة أخرى',
      statsTitle: 'الإحصاء', statsSub: 'رحلتك مع المصحف',
      learnedCap: 'سور محفوظة', of114: (n) => 'من ' + n + ' سورة',
      totalCap: 'إجمالي وقت القراءة',
      hoursMins: (h, m) => 'ساعة و ' + m + ' دقيقة',
      minsOnly: 'دقيقة',
      streakCap: 'سلسلة الأيام',
      streakSub: (best) => 'يومًا متتاليًا · الأطول ' + best,
      weekCap: 'آخر ٧ أيام', weekUnit: 'دقيقة قراءة',
      histDays: 'اليوميات الأخيرة', histWeeks: 'الأسابيع الأخيرة',
      weekOf: (d) => 'أسبوع ' + d,
      noReading: 'لا قراءة بعد — ابدأ جلستك الأولى من الرئيسية',
      goalCap: 'الهدف اليومي', goalUnit: 'دقيقة',
      attribution: 'نص المصحف: مشروع تنزيل (رواية حفص عن عاصم) · الخط: مجمع الملك فهد لطباعة المصحف الشريف',
      dur: (h, m) => (h > 0 ? h + ' س ' + m + ' د' : m + ' د'),
      durS: (s) => s + ' ث'
    },
    fr: {
      appName: 'Wird · وِرد',
      tabs: { home: 'Accueil', surahs: 'Sourates', review: 'Révision', stats: 'Statistiques' },
      themeBtn: 'Changer de thème', langBtn: 'العربية',
      ofGoal: (g) => 'sur un objectif de ' + g + ' min',
      recording: 'Lecture en cours…',
      saved: (m) => 'Session enregistrée · ' + m,
      start: 'Commencer', stop: 'Arrêter',
      startLabel: 'Commencer la lecture', stopLabel: 'Arrêter la lecture',
      streakCard: 'jours de lecture consécutifs', dayUnit: '',
      todayCard: 'de lecture aujourd’hui', minUnit: 'min',
      surahsTitle: 'Sourates',
      surahsSub: (a, b) => a + ' sur ' + b + ' sourates mémorisées',
      filters: { all: 'Toutes', l: 'Mémorisées', p: 'En cours' },
      status: { l: 'mémorisée', p: 'en cours', none: 'non commencée' },
      verses: 'versets', meccan: 'mecquoise', medinan: 'médinoise',
      statusBtn: (name, st) => 'Statut de la sourate ' + name + ' : ' + st,
      emptyCat: 'Aucune sourate dans cette catégorie pour l’instant',
      revTitle: 'Révision',
      revLead: 'Une sourate est tirée au hasard parmi tes sourates mémorisées, puis un verset à réciter de mémoire',
      revEmpty: 'Marque au moins une sourate comme mémorisée pour commencer la révision',
      goSurahs: 'Voir les sourates',
      draw: 'Tirer une sourate',
      poolCount: (n) => n + (n > 1 ? ' sourates en révision' : ' sourate en révision'),
      surahCap: 'SOURATE',
      verseOf: (i, n) => 'Verset ' + i + ' sur ' + n + ' · récite-le de mémoire',
      nextVerse: 'Verset suivant', anotherSurah: 'Autre sourate',
      statsTitle: 'Statistiques', statsSub: 'Ton chemin avec le Mushaf',
      learnedCap: 'Sourates mémorisées', of114: (n) => 'sur ' + n,
      totalCap: 'Temps total de lecture',
      hoursMins: (h, m) => 'h ' + m + ' min',
      minsOnly: 'min',
      streakCap: 'Série de jours',
      streakSub: (best) => 'jours consécutifs · record ' + best,
      weekCap: '7 derniers jours', weekUnit: 'min de lecture',
      histDays: 'Derniers jours', histWeeks: 'Dernières semaines',
      weekOf: (d) => 'Semaine du ' + d,
      noReading: 'Pas encore de lecture — lance ta première session depuis l’accueil',
      goalCap: 'Objectif quotidien', goalUnit: 'min',
      attribution: 'Texte du Mushaf : projet Tanzil (riwāya Ḥafṣ ʿan ʿĀṣim) · Police : Complexe du Roi Fahd (KFGQPC)',
      dur: (h, m) => (h > 0 ? h + ' h ' + m + ' min' : m + ' min'),
      durS: (s) => s + ' s'
    }
  };

  // ── État ────────────────────────────────────────────────
  const DEFAULTS = {
    statuses: {},        // n -> 'l' (محفوظة) | 'p' (قيد الحفظ)
    sessions: [],        // { d: 'YYYY-MM-DD', t: epoch_ms, s: secondes }
    best: 0,             // plus longue série atteinte
    goalMin: 20,
    theme: 'night',
    lang: 'ar',
    tab: 'home',
    runningSince: null   // epoch_ms si une session est en cours
  };

  let state = loadState();
  let QURAN = null;          // { bismillah, surahs: [{n,name,tr,fr,medinan,verses}] }
  let filter = 'all';        // filtre de la liste des sourates
  let revSession = null;     // { surah, idx }
  let savedUntil = 0;        // affichage transitoire « session enregistrée »
  let savedText = '';
  let tickId = null;

  function loadState() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return Object.assign({}, DEFAULTS, JSON.parse(raw));
    } catch (e) { /* stockage indisponible : on reste en mémoire */ }
    return Object.assign({}, DEFAULTS);
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }

  // ── Helpers ─────────────────────────────────────────────
  const $ = (sel) => document.querySelector(sel);
  const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';
  const t = () => STR[state.lang];
  const isAr = () => state.lang === 'ar';

  function num(v) {
    const s = String(v);
    return isAr() ? s.replace(/[0-9]/g, (d) => AR_DIGITS[d]) : s;
  }
  const arNum = (v) => String(v).replace(/[0-9]/g, (d) => AR_DIGITS[d]);

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function pad2(n) { return String(n).padStart(2, '0'); }
  function dayKey(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function mondayOf(d) { const x = new Date(d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; }

  function fmtClock(sec) {
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    const str = h > 0 ? h + ':' + pad2(m) + ':' + pad2(s) : m + ':' + pad2(s);
    return num(str);
  }
  function fmtDur(sec) {
    if (sec < 60) return t().durS(num(sec));
    const h = Math.floor(sec / 3600), m = Math.round((sec % 3600) / 60);
    return t().dur(num(h), num(m));
  }

  function dateLine() {
    const now = new Date();
    try {
      if (isAr()) {
        return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura',
          { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now);
      }
      const g = new Intl.DateTimeFormat('fr-FR',
        { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now);
      let h = '';
      try {
        h = ' · ' + new Intl.DateTimeFormat('fr-u-ca-islamic-umalqura',
          { day: 'numeric', month: 'long', year: 'numeric' }).format(now);
      } catch (e) { /* calendrier non supporté */ }
      return g.charAt(0).toUpperCase() + g.slice(1) + h;
    } catch (e) {
      return now.toLocaleDateString(isAr() ? 'ar' : 'fr-FR');
    }
  }
  function shortDate(d) {
    try {
      return new Intl.DateTimeFormat(isAr() ? 'ar' : 'fr-FR',
        { weekday: 'short', day: 'numeric', month: 'short' }).format(d);
    } catch (e) { return dayKey(d); }
  }
  function narrowWeekday(d) {
    try {
      return new Intl.DateTimeFormat(isAr() ? 'ar' : 'fr-FR', { weekday: 'narrow' }).format(d);
    } catch (e) { return ''; }
  }

  // ── Agrégats de lecture ─────────────────────────────────
  function dayTotals() {
    const m = {};
    for (const s of state.sessions) m[s.d] = (m[s.d] || 0) + s.s;
    return m;
  }
  function runningElapsed() {
    return state.runningSince ? Math.max(0, Math.floor((Date.now() - state.runningSince) / 1000)) : 0;
  }
  function todaySec(totals) {
    return (totals[dayKey(new Date())] || 0) + runningElapsed();
  }
  function streakOf(totals) {
    let d = new Date(), n = 0;
    const todayActive = (totals[dayKey(d)] || 0) > 0 || !!state.runningSince;
    if (todayActive) { n = 1; }
    d = addDays(d, -1);
    if (!todayActive) {
      // aujourd'hui sans lecture : la série court encore depuis hier
      if (!((totals[dayKey(d)] || 0) > 0)) return 0;
    }
    while ((totals[dayKey(d)] || 0) > 0) { n++; d = addDays(d, -1); }
    return n;
  }
  function last7(totals) {
    const out = [];
    for (let i = 6; i >= 0; i--) {
      const d = addDays(new Date(), -i);
      out.push({ date: d, sec: (totals[dayKey(d)] || 0) + (i === 0 ? runningElapsed() : 0) });
    }
    return out;
  }
  function weekTotals(totals, count) {
    const out = [];
    let start = mondayOf(new Date());
    for (let w = 0; w < count; w++) {
      let sec = 0;
      for (let i = 0; i < 7; i++) sec += totals[dayKey(addDays(start, i))] || 0;
      if (w === 0) sec += runningElapsed();
      out.push({ start: new Date(start), sec });
      start = addDays(start, -7);
    }
    return out;
  }
  function learnedCount() {
    return Object.values(state.statuses).filter((s) => s === 'l').length;
  }

  // ── Ornements SVG ───────────────────────────────────────
  function star8(size, stroke) {
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<rect x="5.5" y="5.5" width="13" height="13" stroke="currentColor" stroke-width="' + stroke + '"></rect>' +
      '<rect x="5.5" y="5.5" width="13" height="13" stroke="currentColor" stroke-width="' + stroke + '" transform="rotate(45 12 12)"></rect>' +
      '<circle cx="12" cy="12" r="2.4" stroke="currentColor" stroke-width="' + stroke + '"></circle></svg>';
  }
  const CHECK_SVG = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none">' +
    '<path d="M2.5 6.2L5 8.7l4.5-5.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
  const PLAY_SVG = '<svg width="11" height="12" viewBox="0 0 11 12"><path d="M1.5 1.6c0-.8.9-1.3 1.6-.9l7 4.4c.7.4.7 1.4 0 1.8l-7 4.4c-.7.4-1.6-.1-1.6-.9z" fill="currentColor"></path></svg>';
  const STOP_SVG = '<svg width="11" height="11" viewBox="0 0 12 12"><rect x="1.5" y="1.5" width="9" height="9" rx="2" fill="currentColor"></rect></svg>';
  const SUN_SVG = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">' +
    '<circle cx="12" cy="12" r="4.2"></circle><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5 5l1.7 1.7M17.3 17.3L19 19M19 5l-1.7 1.7M6.7 17.3L5 19"></path></svg>';
  const MOON_SVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z"></path></svg>';
  const TAB_ICONS = {
    home: '<svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 20v-7.5C5 8 8 5 12 5s7 3 7 7.5V20"></path><path d="M3 20h18"></path><path d="M12 5V3.5"></path></svg>',
    surahs: '<svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5C6.4 4 9.6 4 12 5.5c2.4-1.5 5.6-1.5 8 0v13c-2.4-1.5-5.6-1.5-8 0-2.4-1.5-5.6-1.5-8 0z"></path><path d="M12 5.5v13"></path></svg>',
    review: '<svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5l2 6.5 6.5 2-6.5 2-2 6.5-2-6.5L3.5 12 10 10z"></path></svg>',
    stats: '<svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M5 20v-7"></path><path d="M12 20V6"></path><path d="M19 20v-10"></path></svg>'
  };

  // ── Écran accueil ───────────────────────────────────────
  const RING_R = 132, RING_C = 2 * Math.PI * RING_R;

  function ringOffset(sec) {
    const p = Math.min(1, sec / (state.goalMin * 60));
    return RING_C * (1 - p);
  }

  function homeHTML() {
    const totals = dayTotals();
    const today = todaySec(totals);
    const running = !!state.runningSince;
    const streak = streakOf(totals);
    const labelSaved = Date.now() < savedUntil && !running;
    const label = running ? t().recording : (labelSaved ? savedText : t().ofGoal(num(state.goalMin)));
    return '<section class="fade">' +
      '<div class="home-top">' +
        '<div class="home-salam">' + esc(t().appName) + '</div>' +
        '<div class="home-date">' + esc(dateLine()) + '</div>' +
      '</div>' +
      '<div class="ring-wrap">' +
        '<button class="ring-btn' + (running ? ' running' : '') + '" data-action="toggle-run" aria-label="' + (running ? t().stopLabel : t().startLabel) + '">' +
          '<svg viewBox="0 0 282 282">' +
            '<circle cx="141" cy="141" r="' + RING_R + '" fill="none" stroke="var(--ring-track)" stroke-width="5"></circle>' +
            '<circle id="ring-prog" class="' + (running ? 'breathing' : '') + '" cx="141" cy="141" r="' + RING_R + '" fill="none" stroke="var(--accent)" stroke-width="5" stroke-linecap="round" stroke-dasharray="' + RING_C + '" stroke-dashoffset="' + ringOffset(today) + '" transform="rotate(-90 141 141)" style="transition: stroke-dashoffset 1s linear"></circle>' +
            '<g fill="var(--accent-deep)" opacity="0.9"><circle cx="141" cy="9" r="2.2"></circle></g>' +
          '</svg>' +
          '<div class="ring-center">' +
            '<div class="ring-time" id="clock">' + fmtClock(today) + '</div>' +
            '<div class="ring-label' + (labelSaved ? ' saved' : '') + '" id="ring-label">' + esc(label) + '</div>' +
            '<div class="ring-cta">' + (running ? STOP_SVG : PLAY_SVG) + '<span>' + (running ? t().stop : t().start) + '</span></div>' +
          '</div>' +
        '</button>' +
      '</div>' +
      '<div class="stat-row">' +
        '<div class="stat-card"><div class="stat-glyph">' + star8(14, 1.2) + '</div>' +
          '<div class="stat-num"><b>' + num(streak) + '</b>' + (t().dayUnit ? ' ' + t().dayUnit : '') + '</div>' +
          '<div class="stat-cap">' + t().streakCard + '</div></div>' +
        '<div class="stat-card"><div class="stat-glyph">' + star8(14, 1.2) + '</div>' +
          '<div class="stat-num"><b id="today-min">' + num(Math.floor(today / 60)) + '</b> ' + t().minUnit + '</div>' +
          '<div class="stat-cap">' + t().todayCard + '</div></div>' +
      '</div>' +
    '</section>';
  }

  // ── Écran sourates ──────────────────────────────────────
  function surahMeta(s, st) {
    const kind = s.medinan ? t().medinan : t().meccan;
    const stTxt = st ? ' · ' + t().status[st] : '';
    if (isAr()) return num(s.verses.length) + ' ' + t().verses + ' · ' + kind + stTxt;
    return esc(s.fr) + ' · ' + s.verses.length + ' ' + t().verses + ' · ' + kind + stTxt;
  }

  function surahRowHTML(s) {
    const st = state.statuses[s.n] || '';
    const learned = st === 'l';
    return '<div class="surah-row" data-row="' + s.n + '">' +
      '<div class="num-badge' + (learned ? ' on' : '') + '">' + star8(40, 1) + '<span>' + num(s.n) + '</span></div>' +
      '<div class="surah-main">' +
        '<span class="surah-name" lang="ar" dir="rtl">' + esc(s.name) + '</span>' +
        '<span class="surah-meta">' + surahMeta(s, st) + '</span>' +
      '</div>' +
      '<button class="status-btn" data-action="cycle" data-n="' + s.n + '" aria-label="' +
        esc(t().statusBtn(s.name, t().status[st || 'none'])) + '">' +
        '<span class="status-dot ' + st + '">' + (learned ? CHECK_SVG : '') + '</span>' +
      '</button>' +
    '</div>';
  }

  function surahsHTML() {
    const rows = QURAN.surahs.filter((s) => filter === 'all' || state.statuses[s.n] === filter);
    const chips = ['all', 'l', 'p'].map((f) =>
      '<button class="chip' + (filter === f ? ' on' : '') + '" data-action="filter" data-f="' + f + '">' + t().filters[f] + '</button>'
    ).join('');
    const list = rows.length
      ? rows.map(surahRowHTML).join('')
      : '<div class="empty"><span style="color:var(--faint)">' + star8(26, 1.2) + '</span><p>' + t().emptyCat + '</p></div>';
    return '<section class="fade">' +
      '<div class="scr-head"><h1 class="scr-title">' + t().surahsTitle + '</h1>' +
      '<div class="scr-sub" id="learned-sub">' + t().surahsSub(num(learnedCount()), num(114)) + '</div></div>' +
      '<div class="chips">' + chips + '</div>' +
      '<div class="surah-list">' + list + '</div>' +
    '</section>';
  }

  // ── Écran révision ──────────────────────────────────────
  function revPool() {
    return QURAN.surahs.filter((s) => state.statuses[s.n] === 'l').map((s) => s.n);
  }

  function reviewHTML() {
    const pool = revPool();
    if (revSession && pool.indexOf(revSession.surah) === -1) revSession = null;

    if (!pool.length) {
      return '<section class="fade rev-stage">' +
        '<div class="rev-ornament">' + star8(44, 0.8) + '</div>' +
        '<p class="rev-lead">' + t().revEmpty + '</p>' +
        '<div style="height:26px"></div>' +
        '<button class="btn btn-gold" data-action="go-surahs">' + t().goSurahs + '</button>' +
      '</section>';
    }

    if (!revSession) {
      return '<section class="fade rev-stage">' +
        '<div class="rev-ornament">' + star8(44, 0.8) + '</div>' +
        '<h1 class="scr-title" style="margin-bottom:6px">' + t().revTitle + '</h1>' +
        '<p class="rev-lead">' + t().revLead + '</p>' +
        '<div style="height:30px"></div>' +
        '<button class="btn btn-gold" data-action="draw">' + t().draw + '</button>' +
        '<div style="height:10px"></div>' +
        '<div class="verse-count">' + t().poolCount(num(pool.length)) + '</div>' +
      '</section>';
    }

    const s = QURAN.surahs[revSession.surah - 1];
    const verse = s.verses[revSession.idx];
    const sizeClass = verse.length > 320 ? ' vlong' : verse.length > 140 ? ' long' : '';
    const frLine = isAr() ? '' :
      '<div class="rev-surah-fr">' + esc(s.tr) + ' · ' + esc(s.fr) + '</div>';
    const bismillah = (s.n !== 1 && s.n !== 9)
      ? '<div class="rev-bismillah" lang="ar">' + esc(QURAN.bismillah) + '</div>' : '';

    return '<section class="fade">' +
      '<div class="rev-frame" style="padding-top:14px">' +
        '<span class="rev-surah-cap">' + t().surahCap + '</span>' +
        '<h1 class="rev-surah-name" lang="ar" dir="rtl">' + esc(s.name) + '</h1>' + frLine +
        '<div class="rev-sep">' + star8(13, 1.2) + '</div>' + bismillah +
        '<div class="verse-zone">' +
          '<p class="verse-text verse-fade fade' + sizeClass + '" lang="ar">' + esc(verse) +
            '<span class="verse-num"> ﴿' + arNum(revSession.idx + 1) + '﴾</span></p>' +
          '<span class="verse-count">' + t().verseOf(num(revSession.idx + 1), num(s.verses.length)) + '</span>' +
        '</div>' +
        '<div class="rev-actions">' +
          '<button class="btn btn-gold" data-action="next-verse">' + t().nextVerse + '</button>' +
          '<button class="btn btn-ghost" data-action="draw">' + t().anotherSurah + '</button>' +
        '</div>' +
      '</div>' +
    '</section>';
  }

  function drawSurah() {
    const pool = revPool();
    if (!pool.length) return;
    let next = pool[Math.floor(Math.random() * pool.length)];
    if (pool.length > 1 && revSession && next === revSession.surah) {
      next = pool[(pool.indexOf(next) + 1) % pool.length];
    }
    const verses = QURAN.surahs[next - 1].verses;
    revSession = { surah: next, idx: Math.floor(Math.random() * verses.length) };
  }

  // ── Écran statistiques ──────────────────────────────────
  function statsHTML() {
    const totals = dayTotals();
    const learned = learnedCount();
    const totalSec = state.sessions.reduce((a, s) => a + s.s, 0) + runningElapsed();
    const hours = Math.floor(totalSec / 3600), mins = Math.floor((totalSec % 3600) / 60);
    const streak = streakOf(totals);
    const best = Math.max(state.best, streak);
    const week = last7(totals);
    const weekSec = week.reduce((a, d) => a + d.sec, 0);
    const max = Math.max.apply(null, week.map((d) => d.sec).concat(1));

    const bars = week.map((d, i) =>
      '<div class="wbar' + (i === 6 ? ' today' : '') + '">' +
        '<div class="wbar-fill" style="height:' + Math.max(8, d.sec / max * 62) + 'px"></div>' +
        '<span class="wbar-day">' + esc(narrowWeekday(d.date)) + '</span>' +
      '</div>'
    ).join('');

    const activeDays = Object.keys(totals).filter((k) => totals[k] > 0).sort().reverse().slice(0, 8);
    const histDays = activeDays.length
      ? activeDays.map((k) => {
          const d = new Date(k + 'T12:00:00');
          return '<div class="hist-row"><span class="hist-when">' + esc(shortDate(d)) + '</span>' +
            '<span class="hist-val">' + fmtDur(totals[k]) + '</span></div>';
        }).join('')
      : '<div class="hist-row"><span class="hist-when">' + t().noReading + '</span></div>';

    const weeks = weekTotals(totals, 4);
    const histWeeks = weeks.map((w) =>
      '<div class="hist-row"><span class="hist-when">' + esc(t().weekOf(shortDate(w.start))) + '</span>' +
      '<span class="hist-val">' + fmtDur(w.sec) + '</span></div>'
    ).join('');

    return '<section class="fade">' +
      '<div class="scr-head"><h1 class="scr-title">' + t().statsTitle + '</h1>' +
      '<div class="scr-sub">' + t().statsSub + '</div></div>' +
      '<div class="stats-grid">' +
        '<div class="big-stat">' +
          '<div class="big-cap">' + t().learnedCap + '</div>' +
          '<div class="big-num"><b>' + num(learned) + '</b><small>' + t().of114(num(114)) + '</small></div>' +
          '<div class="progress-track"><div class="progress-fill" style="width:' + (learned / 114 * 100) + '%"></div></div>' +
        '</div>' +
        '<div class="big-stat">' +
          '<div class="big-cap">' + t().totalCap + '</div>' +
          (hours > 0
            ? '<div class="big-num"><b>' + num(hours) + '</b><small>' + t().hoursMins(num(hours), num(mins)) + '</small></div>'
            : '<div class="big-num"><b>' + num(mins) + '</b><small>' + t().minsOnly + '</small></div>') +
        '</div>' +
        '<div class="big-stat">' +
          '<div class="big-cap">' + t().streakCap + '</div>' +
          '<div class="big-num"><b>' + num(streak) + '</b><small>' + t().streakSub(num(best)) + '</small></div>' +
        '</div>' +
        '<div class="big-stat">' +
          '<div class="big-cap">' + t().weekCap + '</div>' +
          '<div class="big-num"><b>' + num(Math.round(weekSec / 60)) + '</b><small>' + t().weekUnit + '</small></div>' +
          '<div class="week-bars">' + bars + '</div>' +
        '</div>' +
        '<div class="big-stat">' +
          '<div class="big-cap">' + t().histDays + '</div>' +
          '<div class="hist-list">' + histDays + '</div>' +
        '</div>' +
        '<div class="big-stat">' +
          '<div class="big-cap">' + t().histWeeks + '</div>' +
          '<div class="hist-list">' + histWeeks + '</div>' +
        '</div>' +
        '<div class="big-stat">' +
          '<div class="big-cap">' + t().goalCap + '</div>' +
          '<div class="goal-row">' +
            '<div class="goal-val">' + num(state.goalMin) + '<small>' + t().goalUnit + '</small></div>' +
            '<div class="goal-ctrl">' +
              '<button class="goal-btn" data-action="goal-dec" aria-label="−">−</button>' +
              '<button class="goal-btn" data-action="goal-inc" aria-label="+">+</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="attribution">' + t().attribution + '</div>' +
    '</section>';
  }

  // ── Chrome (topbar + tabbar) ────────────────────────────
  function renderChrome() {
    $('#topbar').innerHTML =
      '<button class="top-btn" data-action="theme" aria-label="' + t().themeBtn + '">' +
        (state.theme === 'night' ? SUN_SVG : MOON_SVG) + '</button>' +
      '<button class="top-btn" data-action="lang" aria-label="' + t().langBtn + '">' +
        (isAr() ? 'FR' : 'ع') + '</button>';

    $('#tabbar').innerHTML = ['home', 'surahs', 'review', 'stats'].map((id) =>
      '<button class="tab' + (state.tab === id ? ' on' : '') + '" data-action="tab" data-tab="' + id + '">' +
        TAB_ICONS[id] + '<span>' + t().tabs[id] + '</span></button>'
    ).join('');
  }

  function applyChrome() {
    document.documentElement.lang = state.lang;
    document.documentElement.dir = isAr() ? 'rtl' : 'ltr';
    $('#app').dataset.theme = state.theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = THEME_COLOR[state.theme];
  }

  // ── Rendu ───────────────────────────────────────────────
  function renderBody() {
    if (!QURAN) return;
    const body = $('#body');
    const html = { home: homeHTML, surahs: surahsHTML, review: reviewHTML, stats: statsHTML }[state.tab]();
    body.innerHTML = html;
    setTimeout(() => {
      body.querySelectorAll('.fade').forEach((el) => el.classList.add('in'));
    }, 30);
  }

  function render() {
    applyChrome();
    renderChrome();
    renderBody();
  }

  // ── Chrono ──────────────────────────────────────────────
  function startTick() {
    if (tickId) return;
    tickId = setInterval(() => {
      if (!state.runningSince || state.tab !== 'home') return;
      const totals = dayTotals();
      const today = todaySec(totals);
      const clock = $('#clock');
      if (clock) clock.textContent = fmtClock(today);
      const prog = $('#ring-prog');
      if (prog) prog.setAttribute('stroke-dashoffset', ringOffset(today));
      const tm = $('#today-min');
      if (tm) tm.textContent = num(Math.floor(today / 60));
    }, 1000);
  }

  function toggleRun() {
    if (state.runningSince) {
      const sec = runningElapsed();
      state.runningSince = null;
      if (sec >= 1) {
        state.sessions.push({ d: dayKey(new Date()), t: Date.now(), s: sec });
        state.best = Math.max(state.best, streakOf(dayTotals()));
        savedText = t().saved(fmtDur(sec));
        savedUntil = Date.now() + 3200;
        setTimeout(() => { if (state.tab === 'home' && !state.runningSince) renderBody(); }, 3400);
      }
      save();
    } else {
      state.runningSince = Date.now();
      savedUntil = 0;
      save();
    }
    renderBody();
  }

  // ── Statut des sourates ─────────────────────────────────
  function cycleSurah(n) {
    const cur = state.statuses[n];
    const next = cur === 'l' ? undefined : cur === 'p' ? 'l' : 'p';
    if (next) state.statuses[n] = next; else delete state.statuses[n];
    save();

    if (filter !== 'all') { renderBody(); return; }
    // mise à jour en place pour préserver la position de défilement
    const row = $('#body [data-row="' + n + '"]');
    if (!row) { renderBody(); return; }
    const s = QURAN.surahs[n - 1];
    const st = state.statuses[n] || '';
    row.querySelector('.num-badge').classList.toggle('on', st === 'l');
    row.querySelector('.surah-meta').innerHTML = surahMeta(s, st);
    const dot = row.querySelector('.status-dot');
    dot.className = 'status-dot ' + st;
    dot.innerHTML = st === 'l' ? CHECK_SVG : '';
    row.querySelector('.status-btn').setAttribute('aria-label', t().statusBtn(s.name, t().status[st || 'none']));
    const sub = $('#learned-sub');
    if (sub) sub.textContent = t().surahsSub(num(learnedCount()), num(114));
  }

  // ── Événements ──────────────────────────────────────────
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const action = el.dataset.action;
    switch (action) {
      case 'tab':
        state.tab = el.dataset.tab;
        save();
        renderChrome();
        renderBody();
        $('#body').scrollTop = 0;
        break;
      case 'toggle-run': toggleRun(); break;
      case 'cycle': cycleSurah(Number(el.dataset.n)); break;
      case 'filter': filter = el.dataset.f; renderBody(); break;
      case 'draw': drawSurah(); renderBody(); break;
      case 'next-verse':
        if (revSession) {
          const len = QURAN.surahs[revSession.surah - 1].verses.length;
          revSession.idx = (revSession.idx + 1) % len;
          renderBody();
        }
        break;
      case 'go-surahs':
        state.tab = 'surahs'; save(); renderChrome(); renderBody();
        break;
      case 'theme':
        state.theme = state.theme === 'night' ? 'cream' : 'night';
        save(); render();
        break;
      case 'lang':
        state.lang = isAr() ? 'fr' : 'ar';
        save(); render();
        break;
      case 'goal-dec':
        state.goalMin = Math.max(GOAL_MIN, state.goalMin - GOAL_STEP);
        save(); renderBody();
        break;
      case 'goal-inc':
        state.goalMin = Math.min(GOAL_MAX, state.goalMin + GOAL_STEP);
        save(); renderBody();
        break;
      case 'retry': boot(); break;
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && state.tab === 'home') renderBody();
  });

  // ── Démarrage ───────────────────────────────────────────
  function boot() {
    applyChrome();
    renderChrome();
    fetch('data/quran.json')
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then((data) => {
        QURAN = data;
        renderBody();
        startTick();
      })
      .catch(() => {
        $('#body').innerHTML = '<div class="splash err">' +
          '<p>تعذّر تحميل بيانات المصحف<br>Impossible de charger les données du Mushaf</p>' +
          '<button class="btn btn-ghost" data-action="retry">↻</button></div>';
      });
  }

  boot();

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => { /* hors https / non supporté */ });
    });
  }
})();

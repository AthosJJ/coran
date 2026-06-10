/* وِرد — suivi de lecture & mémorisation du Coran (Hafs)
   Vanilla JS · état en localStorage · données coraniques locales (data/quran.json) */
(function () {
  'use strict';

  // ── Constantes ──────────────────────────────────────────
  const KEY = 'wird:v1';
  const APP_VERSION = '1.1.0';
  const GOAL_MIN = 5, GOAL_MAX = 120, GOAL_STEP = 5;
  const THEME_COLOR = { night: '#0B1413', cream: '#F6EFE0' };

  // ── i18n ────────────────────────────────────────────────
  const STR = {
    ar: {
      appName: 'وِرد',
      tabs: { home: 'الرئيسية', surahs: 'السور', review: 'المراجعة', stats: 'الإحصاء', settings: 'الإعدادات' },
      themeBtn: 'تبديل المظهر', langBtn: 'Français',
      ofGoal: (g) => 'من هدف ' + g + ' دقيقة',
      recording: 'جارٍ تسجيل القراءة',
      saved: (m) => 'سُجِّلت الجلسة · ' + m,
      start: 'ابدأ القراءة', stop: 'إيقاف',
      startLabel: 'بدء القراءة', stopLabel: 'إيقاف القراءة',
      streakCard: 'سلسلة قراءة متتالية', dayUnit: 'يومًا',
      todayCard: 'قراءة اليوم', minUnit: 'دقيقة',
      resumeCap: 'متابعة القراءة',
      verseN: (v) => 'الآية ' + v,
      surahsTitle: 'السور',
      surahsSub: (a, b) => a + ' من ' + b + ' سورة محفوظة',
      filters: { all: 'الكل', l: 'محفوظة', p: 'قيد الحفظ' },
      sorts: { mushaf: 'ترتيب المصحف', length: 'الأقصر أولًا', status: 'حسب الحالة' },
      searchPh: 'ابحث: اسم أو رقم…',
      status: { l: 'محفوظة', p: 'قيد الحفظ', none: 'لم تبدأ' },
      verses: 'آيات', meccan: 'مكية', medinan: 'مدنية',
      statusBtn: (name, st) => 'حالة سورة ' + name + ': ' + st,
      openSurah: (name) => 'افتح سورة ' + name,
      emptyCat: 'لا توجد سور في هذه الفئة بعد',
      noResults: 'لا نتائج لهذا البحث',
      back: 'السور',
      readerHint: 'اضغط على آية لوضع علامة الاستئناف',
      revTitle: 'المراجعة',
      revLead: 'سورة من محفوظاتك — الأقل مراجعةً تُقدَّم — ثم آية تتلوها من حفظك',
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
      setTitle: 'الإعدادات', setSub: 'المظهر والبيانات والتحديث',
      grpLook: 'المظهر', grpReading: 'القراءة', grpData: 'البيانات', grpApp: 'التطبيق',
      themeRow: 'الوضع', themeNight: 'ليلي', themeDay: 'نهاري',
      langRow: 'اللغة',
      goalCap: 'الهدف اليومي', goalUnit: 'دقيقة',
      exportBtn: 'تصدير نسخة احتياطية', exportNote: 'ملف JSON يحوي جلساتك وحالات السور',
      importBtn: 'استيراد نسخة', importOk: 'تم الاستيراد بنجاح', importBad: 'ملف غير صالح',
      resetBtn: 'إعادة تعيين البيانات', resetConfirm: 'اضغط مجددًا للتأكيد',
      resetNote: 'يمسح الجلسات وحالات السور والعلامة', resetDone: 'أُعيد تعيين البيانات',
      updBtn: 'البحث عن تحديث',
      updChecking: 'جارٍ التحقق…', updReloading: 'تم التحديث · إعادة التشغيل…',
      updFail: 'تعذّر التحديث، حاول لاحقًا', updOffline: 'أنت غير متصل بالإنترنت',
      updateReady: 'إصدار جديد جاهز', updateBtn: 'تحديث',
      versionRow: 'الإصدار',
      attribution: 'نص المصحف: مشروع تنزيل (رواية حفص عن عاصم) · الخط: مجمع الملك فهد لطباعة المصحف الشريف',
      dur: (h, m) => (h > 0 ? h + ' س ' + m + ' د' : m + ' د'),
      durS: (s) => s + ' ث'
    },
    fr: {
      appName: 'Wird · وِرد',
      tabs: { home: 'Accueil', surahs: 'Sourates', review: 'Révision', stats: 'Stats', settings: 'Réglages' },
      themeBtn: 'Changer de thème', langBtn: 'العربية',
      ofGoal: (g) => 'sur un objectif de ' + g + ' min',
      recording: 'Lecture en cours…',
      saved: (m) => 'Session enregistrée · ' + m,
      start: 'Commencer', stop: 'Arrêter',
      startLabel: 'Commencer la lecture', stopLabel: 'Arrêter la lecture',
      streakCard: 'jours de lecture consécutifs', dayUnit: '',
      todayCard: 'de lecture aujourd’hui', minUnit: 'min',
      resumeCap: 'Reprendre la lecture',
      verseN: (v) => 'verset ' + v,
      surahsTitle: 'Sourates',
      surahsSub: (a, b) => a + ' sur ' + b + ' sourates mémorisées',
      filters: { all: 'Toutes', l: 'Mémorisées', p: 'En cours' },
      sorts: { mushaf: 'Ordre du mushaf', length: 'Les plus courtes', status: 'Par état' },
      searchPh: 'Rechercher : nom ou numéro…',
      status: { l: 'mémorisée', p: 'en cours', none: 'non commencée' },
      verses: 'versets', meccan: 'mecquoise', medinan: 'médinoise',
      statusBtn: (name, st) => 'Statut de la sourate ' + name + ' : ' + st,
      openSurah: (name) => 'Ouvrir la sourate ' + name,
      emptyCat: 'Aucune sourate dans cette catégorie pour l’instant',
      noResults: 'Aucun résultat pour cette recherche',
      back: 'Sourates',
      readerHint: 'Touche un verset pour poser le signet de reprise',
      revTitle: 'Révision',
      revLead: 'Une sourate parmi tes mémorisées — les moins révisées en priorité — puis un verset à réciter de mémoire',
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
      setTitle: 'Réglages', setSub: 'Apparence, données et mise à jour',
      grpLook: 'Apparence', grpReading: 'Lecture', grpData: 'Données', grpApp: 'Application',
      themeRow: 'Mode', themeNight: 'Nuit', themeDay: 'Jour',
      langRow: 'Langue',
      goalCap: 'Objectif quotidien', goalUnit: 'min',
      exportBtn: 'Exporter une sauvegarde', exportNote: 'Fichier JSON avec sessions et états des sourates',
      importBtn: 'Importer une sauvegarde', importOk: 'Sauvegarde importée', importBad: 'Fichier invalide',
      resetBtn: 'Réinitialiser les données', resetConfirm: 'Toucher à nouveau pour confirmer',
      resetNote: 'Efface sessions, états des sourates et signet', resetDone: 'Données réinitialisées',
      updBtn: 'Rechercher une mise à jour',
      updChecking: 'Vérification…', updReloading: 'Mise à jour installée · rechargement…',
      updFail: 'Échec de la mise à jour, réessaie plus tard', updOffline: 'Tu es hors ligne',
      updateReady: 'Nouvelle version prête', updateBtn: 'Actualiser',
      versionRow: 'Version',
      attribution: 'Texte du Mushaf : projet Tanzil (riwāya Ḥafṣ ʿan ʿĀṣim) · Police : Complexe du Roi Fahd (KFGQPC)',
      dur: (h, m) => (h > 0 ? h + ' h ' + m + ' min' : m + ' min'),
      durS: (s) => s + ' s'
    }
  };

  // ── État ────────────────────────────────────────────────
  function freshState() {
    return {
      statuses: {},        // n -> 'l' (محفوظة) | 'p' (قيد الحفظ)
      sessions: [],        // { d: 'YYYY-MM-DD', t: epoch_ms, s: secondes }
      lastReviewed: {},    // n -> epoch_ms du dernier tirage en révision
      bookmark: null,      // { surah, verse } signet de reprise
      best: 0,             // plus longue série atteinte
      goalMin: 20,
      theme: 'night',
      lang: 'ar',
      tab: 'home',
      runningSince: null   // epoch_ms si une session est en cours
    };
  }

  let state = loadState();
  let QURAN = null;          // { bismillah, surahs: [{n,name,tr,fr,medinan,verses}] }
  let filter = 'all';        // filtre de la liste des sourates
  let query = '';            // recherche dans la liste
  let sortMode = 'mushaf';   // mushaf | length | status
  let readerSurah = null;    // sourate ouverte en lecture complète
  let pendingVerse = null;   // verset vers lequel défiler à l'ouverture du lecteur
  let revSession = null;     // { surah, idx }
  let savedUntil = 0;        // affichage transitoire « session enregistrée »
  let savedText = '';
  let tickId = null;
  let resetArmed = false, resetTimer = null, updTimer = null;

  function loadState() {
    const base = freshState();
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return Object.assign(base, JSON.parse(raw));
    } catch (e) { /* stockage indisponible : on reste en mémoire */ }
    return base;
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
  const westNum = (s) => String(s).replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d)));

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function norm(s) {
    return String(s).toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')                  // accents latins
      .replace(/[\u064B-\u0652\u0670\u0653\u0640]/g, '') // harakāt + tatwīl
      .replace(/[أإآٱ]/g, 'ا')           // hamzas → alif
      .replace(/ى/g, 'ي').replace(/ة/g, 'ه')  // ى→ي · ة→ه
      .replace(/['’ʻ\-\s]/g, '');
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
  const CHEV_SVG = '<svg class="chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"></path></svg>';
  const TAB_ICONS = {
    home: '<svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 20v-7.5C5 8 8 5 12 5s7 3 7 7.5V20"></path><path d="M3 20h18"></path><path d="M12 5V3.5"></path></svg>',
    surahs: '<svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5C6.4 4 9.6 4 12 5.5c2.4-1.5 5.6-1.5 8 0v13c-2.4-1.5-5.6-1.5-8 0-2.4-1.5-5.6-1.5-8 0z"></path><path d="M12 5.5v13"></path></svg>',
    review: '<svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5l2 6.5 6.5 2-6.5 2-2 6.5-2-6.5L3.5 12 10 10z"></path></svg>',
    stats: '<svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M5 20v-7"></path><path d="M12 20V6"></path><path d="M19 20v-10"></path></svg>',
    settings: '<svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M4 7h9M17.5 7H20"></path><circle cx="15" cy="7" r="2.2"></circle><path d="M4 12h3M11.5 12H20"></path><circle cx="9" cy="12" r="2.2"></circle><path d="M4 17h10M18.5 17H20"></path><circle cx="16" cy="17" r="2.2"></circle></svg>'
  };

  // ── Écran accueil ───────────────────────────────────────
  const RING_R = 132, RING_C = 2 * Math.PI * RING_R;

  function ringOffset(sec) {
    const p = Math.min(1, sec / (state.goalMin * 60));
    return RING_C * (1 - p);
  }

  function resumeCardHTML() {
    const bm = state.bookmark;
    if (!bm || !QURAN.surahs[bm.surah - 1]) return '';
    const s = QURAN.surahs[bm.surah - 1];
    const name = isAr() ? s.name : s.tr;
    return '<button class="resume-card" data-action="resume">' +
      '<span class="resume-glyph">' + star8(18, 1.2) + '</span>' +
      '<span class="resume-main">' +
        '<span class="resume-cap">' + t().resumeCap + '</span>' +
        '<span class="resume-name">' + esc(name) + ' · ' + t().verseN(num(bm.verse)) + '</span>' +
      '</span>' + CHEV_SVG +
    '</button>';
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
      resumeCardHTML() +
    '</section>';
  }

  // ── Écran sourates (liste) ──────────────────────────────
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
      '<div class="surah-main" data-action="open-surah" data-n="' + s.n + '" role="button" tabindex="0" aria-label="' + esc(t().openSurah(s.name)) + '">' +
        '<span class="surah-name" lang="ar" dir="rtl">' + esc(s.name) + '</span>' +
        '<span class="surah-meta">' + surahMeta(s, st) + '</span>' +
      '</div>' +
      '<button class="status-btn" data-action="cycle" data-n="' + s.n + '" aria-label="' +
        esc(t().statusBtn(s.name, t().status[st || 'none'])) + '">' +
        '<span class="status-dot ' + st + '">' + (learned ? CHECK_SVG : '') + '</span>' +
      '</button>' +
    '</div>';
  }

  function filteredSurahs() {
    let arr = QURAN.surahs.filter((s) => filter === 'all' || state.statuses[s.n] === filter);
    const q = norm(query.trim());
    if (q) {
      const qn = westNum(query.trim());
      arr = arr.filter((s) =>
        norm(s.name).includes(q) || norm(s.tr).includes(q) || norm(s.fr).includes(q) ||
        (/^\d+$/.test(qn) && String(s.n).startsWith(qn)));
    }
    if (sortMode === 'length') {
      arr = arr.slice().sort((a, b) => a.verses.length - b.verses.length || a.n - b.n);
    } else if (sortMode === 'status') {
      const rank = { l: 0, p: 1, '': 2 };
      arr = arr.slice().sort((a, b) =>
        rank[state.statuses[a.n] || ''] - rank[state.statuses[b.n] || ''] || a.n - b.n);
    }
    return arr;
  }

  function surahListHTML() {
    const rows = filteredSurahs();
    if (!rows.length) {
      return '<div class="empty"><span style="color:var(--faint)">' + star8(26, 1.2) + '</span><p>' +
        (query.trim() ? t().noResults : t().emptyCat) + '</p></div>';
    }
    return rows.map(surahRowHTML).join('');
  }

  function surahsHTML() {
    if (readerSurah) return readerHTML();
    const chips = ['all', 'l', 'p'].map((f) =>
      '<button class="chip' + (filter === f ? ' on' : '') + '" data-action="filter" data-f="' + f + '">' + t().filters[f] + '</button>'
    ).join('');
    const sorts = ['mushaf', 'length', 'status'].map((m) =>
      '<button class="chip sm' + (sortMode === m ? ' on' : '') + '" data-action="sort" data-m="' + m + '">' + t().sorts[m] + '</button>'
    ).join('');
    return '<section class="fade">' +
      '<div class="scr-head"><h1 class="scr-title">' + t().surahsTitle + '</h1>' +
      '<div class="scr-sub" id="learned-sub">' + t().surahsSub(num(learnedCount()), num(114)) + '</div></div>' +
      '<div class="search-wrap"><input type="search" class="search" data-input="search" value="' + esc(query) + '" placeholder="' + esc(t().searchPh) + '" autocomplete="off"></div>' +
      '<div class="chips">' + chips + '</div>' +
      '<div class="chips sub">' + sorts + '</div>' +
      '<div class="surah-list" id="surah-list">' + surahListHTML() + '</div>' +
    '</section>';
  }

  // ── Lecture complète d'une sourate ──────────────────────
  function readerHTML() {
    const s = QURAN.surahs[readerSurah - 1];
    const bm = state.bookmark;
    const frLine = isAr() ? '' :
      '<div class="rev-surah-fr">' + esc(s.tr) + ' · ' + esc(s.fr) + '</div>';
    const bismillah = (s.n !== 1 && s.n !== 9)
      ? '<div class="rev-bismillah" lang="ar">' + esc(QURAN.bismillah) + '</div>' : '';
    const segs = s.verses.map((v, i) => {
      const n = i + 1;
      const marked = bm && bm.surah === s.n && bm.verse === n;
      return '<span class="verse-seg' + (marked ? ' bookmarked' : '') + '" data-action="mark-verse" data-v="' + n + '">' +
        esc(v) + ' <span class="verse-num">﴿' + arNum(n) + '﴾</span></span>';
    }).join(' ');
    return '<section class="fade">' +
      '<button class="back-btn" data-action="back-surahs">' + CHEV_SVG + '<span>' + t().back + '</span></button>' +
      '<div class="rev-frame">' +
        '<span class="rev-surah-cap">' + t().surahCap + '</span>' +
        '<h1 class="rev-surah-name" lang="ar" dir="rtl">' + esc(s.name) + '</h1>' + frLine +
        '<div class="rev-sep">' + star8(13, 1.2) + '</div>' +
        '<div class="reader-hint">' + t().readerHint + '</div>' +
        bismillah +
        '<p class="reader-text" lang="ar" dir="rtl">' + segs + '</p>' +
      '</div>' +
    '</section>';
  }

  function openReader(n, scrollVerse) {
    state.tab = 'surahs';
    save();
    readerSurah = n;
    pendingVerse = scrollVerse || null;
    renderChrome();
    renderBody();
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

  /* Tirage pondéré : plus une sourate n'a pas été révisée depuis longtemps,
     plus elle a de chances de sortir (jamais révisée = prioritaire). */
  function drawSurah() {
    const pool = revPool();
    if (!pool.length) return;
    let candidates = pool;
    if (revSession && pool.length > 1) candidates = pool.filter((n) => n !== revSession.surah);
    const now = Date.now();
    const weights = candidates.map((n) => {
      const last = state.lastReviewed[n] || 0;
      return Math.max(0.5, (now - last) / 3600000); // âge en heures
    });
    let r = Math.random() * weights.reduce((a, b) => a + b, 0);
    let next = candidates[candidates.length - 1];
    for (let i = 0; i < candidates.length; i++) {
      r -= weights[i];
      if (r <= 0) { next = candidates[i]; break; }
    }
    state.lastReviewed[next] = now;
    save();
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
      '</div>' +
    '</section>';
  }

  // ── Écran réglages ──────────────────────────────────────
  function segHTML(action, options) {
    return '<div class="seg">' + options.map((o) =>
      '<button class="seg-btn' + (o.on ? ' on' : '') + '" data-action="' + action + '" data-v="' + o.v + '">' + esc(o.label) + '</button>'
    ).join('') + '</div>';
  }

  function settingsHTML() {
    return '<section class="fade">' +
      '<div class="scr-head"><h1 class="scr-title">' + t().setTitle + '</h1>' +
      '<div class="scr-sub">' + t().setSub + '</div></div>' +
      '<div class="stats-grid">' +

        '<div class="big-stat">' +
          '<div class="big-cap">' + t().grpLook + '</div>' +
          '<div class="set-row"><span class="set-label">' + t().themeRow + '</span>' +
            segHTML('set-theme', [
              { v: 'night', label: t().themeNight, on: state.theme === 'night' },
              { v: 'cream', label: t().themeDay, on: state.theme === 'cream' }
            ]) + '</div>' +
          '<div class="set-row"><span class="set-label">' + t().langRow + '</span>' +
            segHTML('set-lang', [
              { v: 'ar', label: 'العربية', on: isAr() },
              { v: 'fr', label: 'Français', on: !isAr() }
            ]) + '</div>' +
        '</div>' +

        '<div class="big-stat">' +
          '<div class="big-cap">' + t().grpReading + '</div>' +
          '<div class="set-row"><span class="set-label">' + t().goalCap + '</span>' +
            '<div class="goal-ctrl">' +
              '<button class="goal-btn" data-action="goal-dec" aria-label="−">−</button>' +
              '<span class="goal-val">' + num(state.goalMin) + '<small>' + t().goalUnit + '</small></span>' +
              '<button class="goal-btn" data-action="goal-inc" aria-label="+">+</button>' +
            '</div></div>' +
        '</div>' +

        '<div class="big-stat">' +
          '<div class="big-cap">' + t().grpData + '</div>' +
          '<div class="set-row"><span class="set-label">' + t().exportBtn + '<span class="set-note">' + t().exportNote + '</span></span>' +
            '<button class="set-btn" data-action="export-data">⤓</button></div>' +
          '<div class="set-row"><span class="set-label">' + t().importBtn + '</span>' +
            '<button class="set-btn" data-action="import-data">⤒</button>' +
            '<input type="file" id="import-file" class="file-hidden" accept="application/json,.json"></div>' +
          '<div class="set-row"><span class="set-label">' + t().resetBtn + '<span class="set-note">' + t().resetNote + '</span></span>' +
            '<button class="set-btn danger" data-action="reset-data">✕</button></div>' +
        '</div>' +

        '<div class="big-stat">' +
          '<div class="big-cap">' + t().grpApp + '</div>' +
          '<div class="set-row"><span class="set-label">' + t().updBtn + '</span>' +
            '<button class="set-btn" data-action="check-update">↻</button></div>' +
          '<div class="upd-status" id="upd-status"></div>' +
          '<div class="set-row"><span class="set-label">' + t().versionRow + '</span>' +
            '<span class="set-value">' + num(APP_VERSION) + '</span></div>' +
        '</div>' +

      '</div>' +
      '<div class="attribution">' + t().attribution + '</div>' +
    '</section>';
  }

  // ── Export / import / reset ─────────────────────────────
  function exportData() {
    const payload = Object.assign(
      { _app: 'wird', _version: APP_VERSION, _exported: new Date().toISOString() },
      state, { runningSince: null, tab: 'home' });
    const json = JSON.stringify(payload, null, 2);
    const name = 'wird-' + dayKey(new Date()) + '.json';
    const file = new File([json], name, { type: 'application/json' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: name }).catch(() => { /* annulé */ });
      return;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }

  function importData(fileObj) {
    fileObj.text().then((txt) => {
      let obj;
      try { obj = JSON.parse(txt); } catch (e) { toast(t().importBad); return; }
      if (!obj || typeof obj !== 'object' || typeof obj.statuses !== 'object' || !Array.isArray(obj.sessions)) {
        toast(t().importBad);
        return;
      }
      const sessions = obj.sessions
        .filter((s) => s && typeof s.d === 'string' && Number(s.s) > 0)
        .map((s) => ({ d: s.d, t: Number(s.t) || 0, s: Math.floor(Number(s.s)) }));
      const statuses = {};
      for (const k of Object.keys(obj.statuses)) {
        const n = Number(k);
        if (n >= 1 && n <= 114 && (obj.statuses[k] === 'l' || obj.statuses[k] === 'p')) statuses[n] = obj.statuses[k];
      }
      state = Object.assign(freshState(), {
        statuses, sessions,
        lastReviewed: (obj.lastReviewed && typeof obj.lastReviewed === 'object') ? obj.lastReviewed : {},
        bookmark: (obj.bookmark && Number(obj.bookmark.surah) >= 1)
          ? { surah: Number(obj.bookmark.surah), verse: Number(obj.bookmark.verse) || 1 } : null,
        best: Number(obj.best) || 0,
        goalMin: Math.min(GOAL_MAX, Math.max(GOAL_MIN, Number(obj.goalMin) || 20)),
        theme: obj.theme === 'cream' ? 'cream' : 'night',
        lang: obj.lang === 'fr' ? 'fr' : 'ar',
        tab: 'settings'
      });
      save();
      revSession = null;
      readerSurah = null;
      render();
      toast(t().importOk);
    }).catch(() => toast(t().importBad));
  }

  function resetData(btn) {
    if (!resetArmed) {
      resetArmed = true;
      btn.classList.add('armed');
      btn.textContent = t().resetConfirm;
      resetTimer = setTimeout(() => { resetArmed = false; if (state.tab === 'settings') renderBody(); }, 5000);
      return;
    }
    clearTimeout(resetTimer);
    resetArmed = false;
    state = Object.assign(freshState(), { theme: state.theme, lang: state.lang, tab: 'settings' });
    save();
    revSession = null;
    readerSurah = null;
    renderBody();
    toast(t().resetDone);
  }

  // ── Mise à jour de l'app ────────────────────────────────
  function setUpdStatus(msg) {
    const el = $('#upd-status');
    if (el) el.textContent = msg;
  }

  function checkUpdate() {
    if (!navigator.onLine) { setUpdStatus(t().updOffline); return; }
    setUpdStatus(t().updChecking);
    if (!('serviceWorker' in navigator)) { location.reload(); return; }
    navigator.serviceWorker.getRegistration().then((reg) => {
      const p = reg ? reg.update().catch(() => {}) : Promise.resolve();
      return p.then(() => {
        const ctrl = navigator.serviceWorker.controller;
        if (!ctrl) { location.reload(); return; }
        // demande au SW de re-télécharger la coquille (requêtes conditionnelles)
        ctrl.postMessage({ type: 'REFRESH_SHELL' });
        clearTimeout(updTimer);
        updTimer = setTimeout(() => setUpdStatus(t().updFail), 25000);
      });
    }).catch(() => setUpdStatus(t().updFail));
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (e) => {
      if (!e.data || e.data.type !== 'SHELL_REFRESHED') return;
      clearTimeout(updTimer);
      if (e.data.ok) {
        setUpdStatus(t().updReloading);
        setTimeout(() => location.reload(), 600);
      } else {
        setUpdStatus(t().updFail);
      }
    });
  }

  // ── Toast ───────────────────────────────────────────────
  function toast(msg, opts) {
    opts = opts || {};
    const prev = $('#toast');
    if (prev) prev.remove();
    const el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    el.dataset.action = 'dismiss-toast'; // un tap hors du bouton referme le toast
    el.innerHTML = '<span>' + esc(msg) + '</span>' +
      (opts.label ? '<button class="toast-btn" data-action="' + opts.action + '">' + esc(opts.label) + '</button>' : '');
    $('#app').appendChild(el);
    requestAnimationFrame(() => el.classList.add('in'));
    if (!opts.sticky) {
      setTimeout(() => {
        el.classList.remove('in');
        setTimeout(() => el.remove(), 500);
      }, 3500);
    }
  }

  // ── Chrome (topbar + tabbar) ────────────────────────────
  function renderChrome() {
    $('#topbar').innerHTML =
      '<button class="top-btn" data-action="theme" aria-label="' + t().themeBtn + '">' +
        (state.theme === 'night' ? SUN_SVG : MOON_SVG) + '</button>' +
      '<button class="top-btn" data-action="lang" aria-label="' + t().langBtn + '">' +
        (isAr() ? 'FR' : 'ع') + '</button>';

    $('#tabbar').innerHTML = ['home', 'surahs', 'review', 'stats', 'settings'].map((id) =>
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
    const html = { home: homeHTML, surahs: surahsHTML, review: reviewHTML, stats: statsHTML, settings: settingsHTML }[state.tab]();
    body.innerHTML = html;
    setTimeout(() => {
      body.querySelectorAll('.fade').forEach((el) => el.classList.add('in'));
    }, 30);
    if (pendingVerse && readerSurah) {
      const v = pendingVerse;
      pendingVerse = null;
      setTimeout(() => {
        const seg = body.querySelector('[data-v="' + v + '"]');
        if (seg) {
          seg.scrollIntoView({ block: 'center' });
          seg.classList.add('flash');
        }
      }, 80);
    }
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

    if (filter !== 'all' || sortMode === 'status') {
      const list = $('#surah-list');
      if (list) list.innerHTML = surahListHTML();
    } else {
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
    }
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
        if (state.tab === 'surahs') readerSurah = null;
        save();
        renderChrome();
        renderBody();
        $('#body').scrollTop = 0;
        break;
      case 'toggle-run': toggleRun(); break;
      case 'cycle': cycleSurah(Number(el.dataset.n)); break;
      case 'filter': filter = el.dataset.f; renderBody(); break;
      case 'sort': sortMode = el.dataset.m; renderBody(); break;
      case 'open-surah':
        openReader(Number(el.dataset.n));
        $('#body').scrollTop = 0;
        break;
      case 'back-surahs':
        readerSurah = null;
        renderBody();
        break;
      case 'mark-verse': {
        const v = Number(el.dataset.v);
        const same = state.bookmark && state.bookmark.surah === readerSurah && state.bookmark.verse === v;
        state.bookmark = same ? null : { surah: readerSurah, verse: v };
        save();
        document.querySelectorAll('#body .verse-seg.bookmarked').forEach((x) => x.classList.remove('bookmarked'));
        if (!same) el.classList.add('bookmarked');
        break;
      }
      case 'resume':
        if (state.bookmark) openReader(state.bookmark.surah, state.bookmark.verse);
        break;
      case 'draw': drawSurah(); renderBody(); break;
      case 'next-verse':
        if (revSession) {
          const len = QURAN.surahs[revSession.surah - 1].verses.length;
          revSession.idx = (revSession.idx + 1) % len;
          renderBody();
        }
        break;
      case 'go-surahs':
        state.tab = 'surahs'; readerSurah = null; save(); renderChrome(); renderBody();
        break;
      case 'theme':
      case 'set-theme':
        state.theme = action === 'theme' ? (state.theme === 'night' ? 'cream' : 'night') : el.dataset.v;
        save(); render();
        break;
      case 'lang':
      case 'set-lang':
        state.lang = action === 'lang' ? (isAr() ? 'fr' : 'ar') : el.dataset.v;
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
      case 'export-data': exportData(); break;
      case 'import-data': { const f = $('#import-file'); if (f) f.click(); break; }
      case 'reset-data': resetData(el); break;
      case 'check-update': checkUpdate(); break;
      case 'reload-app': location.reload(); break;
      case 'dismiss-toast': el.remove(); break;
      case 'retry': boot(); break;
    }
  });

  document.addEventListener('input', (e) => {
    if (e.target.matches && e.target.matches('[data-input="search"]')) {
      query = e.target.value;
      const list = $('#surah-list');
      if (list) list.innerHTML = surahListHTML();
    }
  });

  document.addEventListener('change', (e) => {
    if (e.target.id === 'import-file' && e.target.files && e.target.files[0]) {
      importData(e.target.files[0]);
      e.target.value = '';
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
      navigator.serviceWorker.register('sw.js').then((reg) => {
        // signale les nouvelles versions installées en arrière-plan
        reg.addEventListener('updatefound', () => {
          // au tout premier install il n'y a pas encore de contrôleur :
          // ce n'est pas une mise à jour, on ne signale rien
          const isUpdate = !!navigator.serviceWorker.controller;
          const w = reg.installing;
          if (!w || !isUpdate) return;
          w.addEventListener('statechange', () => {
            if (w.state === 'activated') {
              toast(t().updateReady, { action: 'reload-app', label: t().updateBtn, sticky: true });
            }
          });
        });
      }).catch(() => { /* hors https / non supporté */ });
    });
  }
})();

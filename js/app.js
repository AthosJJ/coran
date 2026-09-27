/* وِرد — suivi de lecture & mémorisation du Coran (Hafs)
   Vanilla JS · état en localStorage · données coraniques locales (data/quran.json) */
(function () {
  'use strict';

  // ── Constantes ──────────────────────────────────────────
  const KEY = 'wird:v1';
  const APP_VERSION = '1.3.0';
  const GOAL_MIN = 5, GOAL_MAX = 120, GOAL_STEP = 5;
  const THEME_COLOR = { night: '#0B1413', cream: '#F6EFE0' };
  const MIN_SESSION_SEC = 10;          // en dessous : tap accidentel, rien n'est enregistré
  const MAX_RUN_SEC = 3 * 3600;        // au-delà : chrono sans doute oublié, on demande
  const PASSAGE = 20;                  // révision des longues sourates par passages de 20 versets
  const LONG_SURAH = 40;
  const NBSP = ' ';

  // ── Accords (العدد والمعدود / pluriels français) ────────
  const PR = {};
  function pl(lang, n, forms) {
    try {
      PR[lang] = PR[lang] || new Intl.PluralRules(lang);
      return forms[PR[lang].select(n)] || forms.other;
    } catch (e) { return forms.other; }
  }
  const AR_U = {
    day: { zero: 'يوم', one: 'يوم', two: 'يومان', few: 'أيام', many: 'يومًا', other: 'يوم' },
    dayRun: { zero: 'يوم', one: 'يوم', two: 'يومان متتاليان', few: 'أيام متتالية', many: 'يومًا متتاليًا', other: 'يوم متتالٍ' },
    min: { zero: 'دقيقة', one: 'دقيقة', two: 'دقيقتان', few: 'دقائق', many: 'دقيقة', other: 'دقيقة' },
    hour: { zero: 'ساعة', one: 'ساعة', two: 'ساعتان', few: 'ساعات', many: 'ساعة', other: 'ساعة' },
    verse: { zero: 'آية', one: 'آية', two: 'آيتان', few: 'آيات', many: 'آية', other: 'آية' },
    surah: { zero: 'سورة', one: 'سورة', two: 'سورتان', few: 'سور', many: 'سورة', other: 'سورة' },
    surahL: { zero: 'سورة محفوظة', one: 'سورة محفوظة', two: 'سورتان محفوظتان', few: 'سور محفوظة', many: 'سورة محفوظة', other: 'سورة محفوظة' },
    session: { zero: 'جلسة', one: 'جلسة', two: 'جلستان', few: 'جلسات', many: 'جلسة', other: 'جلسة' }
  };
  /* dans une phrase : « يوم واحد », « يومان » (le duel porte déjà le nombre), « ٣ أيام » */
  const AR_ONE = { day: 'يوم واحد', min: 'دقيقة واحدة', hour: 'ساعة واحدة', verse: 'آية واحدة', surah: 'سورة واحدة', surahL: 'سورة محفوظة واحدة', session: 'جلسة واحدة' };
  const arCount = (n, u) => (n === 1 ? AR_ONE[u] : n === 2 ? AR_U[u].two : arNum(n) + ' ' + ar(n, u));
  const ar = (n, u) => pl('ar', n, AR_U[u]);
  const fr = (n, one, other) => pl('fr', n, { one: one, other: other });

  // ── i18n ────────────────────────────────────────────────
  /* Toutes les fonctions reçoivent des nombres BRUTS : la conversion en
     chiffres arabes-indiens se fait ici, jamais avant une comparaison. */
  const STR = {
    ar: {
      appName: 'وِرد',
      tabs: { home: 'الرئيسية', surahs: 'السور', review: 'المراجعة', stats: 'الإحصاء', settings: 'الإعدادات' },
      themeBtn: 'تبديل المظهر', langBtn: 'Français',
      todayCap: 'اليوم',
      ofGoal: (g) => 'من هدف ' + arNum(g) + ' ' + ar(g, 'min'),
      goalDone: 'بلغتَ هدف اليوم ✓',
      sessionLbl: (c) => 'هذه الجلسة، ' + c,
      saved: (d) => 'سُجِّلت الجلسة، ' + d,
      tooShort: 'جلسة قصيرة جدًّا، لم تُسجَّل',
      staleRun: (d) => 'المؤقّت يعمل منذ ' + d + '. كم قرأت فعلًا؟',
      keepSome: 'حدّد المدة', keepAll: 'احفظ الكل', discardRun: 'تجاهلها',
      askMin: 'كم دقيقة قرأت فعلًا؟', discarded: 'تم تجاهل الجلسة',
      start: 'ابدأ القراءة', stop: 'إيقاف',
      recordingSR: 'بدأ تسجيل القراءة',
      pillLabel: 'القراءة جارية، اضغط للإيقاف',
      streakCard: () => 'سلسلة قراءة متتالية',
      dayUnit: (n) => ar(n, 'day'),
      todayCard: 'قراءة اليوم',
      minUnit: (n) => ar(n, 'min'),
      resumeCap: 'متابعة القراءة', resumeClear: 'إزالة العلامة',
      verseN: (v) => 'الآية ' + arNum(v),
      undo: 'تراجع',
      surahsTitle: 'السور',
      surahsSub: (a, b) => arNum(a) + ' من ' + arNum(b) + ' سورة محفوظة',
      filters: { all: 'الكل', l: 'محفوظة', p: 'قيد الحفظ' },
      sorts: { mushaf: 'المصحف', length: 'الأقصر', status: 'الحالة' },
      sortLabel: 'الترتيب',
      searchPh: 'ابحث: اسم أو رقم…', clearSearch: 'مسح البحث',
      status: { l: 'محفوظة', p: 'قيد الحفظ', none: 'لم تبدأ' },
      statusLegend: 'اضغط الدائرة بجانب السورة: مرة = قيد الحفظ، مرتين = محفوظة',
      versesCount: (n) => arNum(n) + ' ' + ar(n, 'verse'),
      meccan: 'مكية', medinan: 'مدنية',
      statusBtn: (name, st) => 'حالة سورة ' + name + ': ' + st,
      statusChanged: (name, st) => name + ': ' + st,
      openSurah: (name) => 'افتح سورة ' + name,
      emptyCat: 'لا سور في هذه الفئة بعد. اضغط الدائرة بجانب السورة: مرة = قيد الحفظ، مرتين = محفوظة',
      noResults: 'لا نتائج لهذا البحث',
      back: 'السور',
      readerHint: 'اضغط على آية لوضع علامة الاستئناف',
      bmSet: (name, v) => 'العلامة: ' + name + '، الآية ' + arNum(v),
      gotoPh: 'آية…', gotoLabel: 'الانتقال إلى آية',
      gotoBm: (v) => 'إلى العلامة، الآية ' + arNum(v),
      reviewThis: 'راجِعها مخفيّة',
      nextSurah: 'السورة التالية',
      statusRow: 'حالة السورة',
      revTitle: 'المراجعة',
      revLead: 'سورة من محفوظاتك — تُقدَّم الأبعدُ عهدًا بالمراجعة — تُعرض مخفيّة فتكشف آياتها واحدةً واحدة من حفظك',
      revEmpty: 'لا سور محفوظة بعد. في قائمة السور اضغط الدائرة بجانب السورة مرتين (قيد الحفظ ← محفوظة) لتبدأ المراجعة',
      goSurahs: 'إلى قائمة السور',
      draw: 'اختر سورة عشوائيًّا',
      poolCount: (n) => arCount(n, 'surah') + ' في المراجعة',
      surahCap: 'سُورَة',
      passage: (a, b) => 'الآيات ' + arNum(a) + '–' + arNum(b),
      revHint: 'اتلُ الآية من حفظك ثم اضغطها لكشفها',
      revealedOf: (i, n) => 'كُشِف ' + arNum(i) + ' من ' + arCount(n, 'verse'),
      revDone: 'تمّت مراجعة السورة ✓', passDone: 'تمّت مراجعة المقطع ✓',
      revealAll: 'كشف الكل', anotherSurah: 'سورة أخرى', nextPassage: 'المقطع التالي',
      restart: 'إعادة من البداية', closeRev: 'إنهاء',
      confirmAbandon: 'تأكيد التخلّي؟', confirmAbandonLong: 'اضغط مجددًا للتخلّي عن هذه المراجعة',
      revReplaced: 'استُبدلت المراجعة السابقة',
      maskedVerse: (n) => 'الآية ' + arNum(n) + ' مخفية، اضغط لكشفها',
      statsTitle: 'الإحصاء', statsSub: 'رحلتك مع المصحف',
      learnedCap: 'سور محفوظة', of114: (n) => 'من ' + arNum(n) + ' سورة',
      versesShare: (a, b, p) => arCount(a, 'verse') + ' من ' + arNum(b) + '، ' + arNum(p) + '٪ من المصحف',
      inProgress: (n) => arNum(n) + ' قيد الحفظ',
      totalCap: 'إجمالي وقت القراءة',
      hoursMins: (h, m) => ar(h, 'hour') + (m ? ' و' + arCount(m, 'min') : ''),
      minsOnly: (m) => ar(m, 'min'),
      streakCap: 'سلسلة الأيام',
      streakSub: (n, best) => ar(n, 'dayRun') + '، الأطول ' + arNum(best),
      weekCap: 'آخر ٧ أيام',
      histDays: 'الأيام الأخيرة', histWeeks: 'الأسابيع الأخيرة',
      thisWeek: 'هذا الأسبوع', weekOf: (d) => 'أسبوع ' + d,
      noReading: 'لا قراءة بعد — ابدأ جلستك الأولى من الرئيسية', noReadDay: 'لا قراءة',
      goalLine: 'الهدف',
      setTitle: 'الإعدادات', setSub: 'المظهر والقراءة والبيانات والتحديث',
      grpLook: 'المظهر', grpReading: 'القراءة', grpData: 'البيانات', grpApp: 'التطبيق',
      themeRow: 'الوضع', themeNight: 'ليلي', themeDay: 'نهاري',
      langRow: 'اللغة',
      goalCap: 'الهدف اليومي', goalUnit: (n) => ar(n, 'min'),
      goalDec: 'إنقاص الهدف', goalInc: 'زيادة الهدف',
      textSize: 'حجم نص المصحف', qsDec: 'تصغير النص', qsInc: 'تكبير النص',
      tajRow: 'تجويد ملوّن', tajOff: 'عادي', tajOn: 'ملوّن',
      tajNote: 'تلوين تقريبي مُولَّد آليًّا (مفتوح المصدر) — للاستئناس، لا يُغني عن التلقّي',
      tajFail: 'تعذّر تحميل بيانات التجويد',
      tajLegend: {
        m2: 'مدّ حركتان', m4: 'مدّ ٤–٥ حركات', m6: 'مدّ ٦ (لازم)',
        gh: 'غنّة وإدغام وإخفاء وإقلاب', ql: 'قلقلة', sl: 'لا يُنطق'
      },
      exportBtn: 'تصدير نسخة احتياطية', exportNote: 'ملف JSON يحوي جلساتك وحالات السور',
      lastExport: (d) => 'آخر نسخة: ' + d, exportOk: 'تم تصدير النسخة',
      importBtn: 'استيراد نسخة', importOk: 'تم الاستيراد', importBad: 'ملف غير صالح',
      importConfirm: (n, l, d) => 'استبدال بياناتك الحالية بهذه النسخة' + (d ? ' (' + d + ')' : '') + '؟\n' +
        (n ? arCount(n, 'session') : 'لا جلسات') + '، ' + (l ? arCount(l, 'surahL') : 'لا سور محفوظة'),
      resetBtn: 'إعادة تعيين البيانات', resetConfirm: 'اضغط مجددًا للتأكيد',
      resetNote: 'يمسح الجلسات وحالات السور والعلامة وسجلّ المراجعة والرقم القياسي (تبقى الإعدادات والجلسة الجارية)',
      resetDone: 'أُعيد تعيين البيانات',
      updBtn: 'البحث عن تحديث',
      updChecking: 'جارٍ التحقق…', updReloading: 'تم التحديث، إعادة التشغيل…', updInstalling: 'وُجد إصدار جديد، جارٍ التثبيت…',
      updLatest: (v) => 'لديك أحدث إصدار (' + arNum(v) + ')',
      updFail: 'تعذّر التحديث، حاول لاحقًا', updOffline: 'أنت غير متصل بالإنترنت',
      updateReady: 'إصدار جديد جاهز', updateBtn: 'تحديث',
      versionRow: 'الإصدار',
      attribution: 'نص المصحف: مشروع تنزيل (رواية حفص عن عاصم)، الخط: مجمع الملك فهد لطباعة المصحف الشريف',
      durS: (s) => arNum(s) + ' ث',
      durHM: (h, m) => h > 0 ? arNum(h) + ' س' + (m ? ' ' + arNum(m) + ' د' : '') : arNum(m) + ' د'
    },
    fr: {
      appName: 'Wird · وِرد',
      tabs: { home: 'Accueil', surahs: 'Sourates', review: 'Révision', stats: 'Stats', settings: 'Réglages' },
      themeBtn: 'Changer de thème', langBtn: 'العربية',
      todayCap: 'Aujourd’hui',
      ofGoal: (g) => 'sur un objectif de ' + g + NBSP + 'min',
      goalDone: 'Objectif du jour atteint ✓',
      sessionLbl: (c) => 'Cette séance · ' + c,
      saved: (d) => 'Session enregistrée · ' + d,
      tooShort: 'Session trop courte, non enregistrée',
      staleRun: (d) => 'Le chrono tourne depuis ' + d + '. Combien as-tu vraiment lu' + NBSP + '?',
      keepSome: 'Saisir la durée', keepAll: 'Tout garder', discardRun: 'Ignorer',
      askMin: 'Minutes réellement lues' + NBSP + '?', discarded: 'Session ignorée',
      start: 'Commencer', stop: 'Arrêter',
      recordingSR: 'Enregistrement de la lecture démarré',
      pillLabel: 'Lecture en cours, touche pour arrêter',
      streakCard: (n) => fr(n, 'jour de lecture consécutif', 'jours de lecture consécutifs'),
      dayUnit: () => '',
      todayCard: 'de lecture aujourd’hui',
      minUnit: () => 'min',
      resumeCap: 'Reprendre la lecture', resumeClear: 'Retirer le signet',
      verseN: (v) => 'verset ' + v,
      undo: 'Annuler',
      surahsTitle: 'Sourates',
      surahsSub: (a, b) => a + NBSP + fr(a, 'sourate mémorisée', 'sourates mémorisées') + ' sur ' + b,
      filters: { all: 'Toutes', l: 'Mémorisées', p: 'En cours' },
      sorts: { mushaf: 'Mushaf', length: 'Plus courtes', status: 'Par état' },
      sortLabel: 'Tri',
      searchPh: 'Rechercher' + NBSP + ': nom ou numéro…', clearSearch: 'Effacer la recherche',
      status: { l: 'mémorisée', p: 'en cours', none: 'non commencée' },
      statusLegend: 'Touche le cercle à droite d’une sourate' + NBSP + ': une fois = en cours, deux fois = mémorisée',
      versesCount: (n) => n + NBSP + fr(n, 'verset', 'versets'),
      meccan: 'mecquoise', medinan: 'médinoise',
      statusBtn: (name, st) => 'Statut de la sourate ' + name + NBSP + ': ' + st,
      statusChanged: (name, st) => name + NBSP + ': ' + st,
      openSurah: (name) => 'Ouvrir la sourate ' + name,
      emptyCat: 'Aucune sourate dans cette catégorie. Touche le cercle à droite d’une sourate' + NBSP + ': une fois = en cours, deux fois = mémorisée',
      noResults: 'Aucun résultat pour cette recherche',
      back: 'Sourates',
      readerHint: 'Touche un verset pour poser le signet de reprise',
      bmSet: (name, v) => 'Signet' + NBSP + ': ' + name + ' · verset ' + v,
      gotoPh: 'Verset…', gotoLabel: 'Aller au verset',
      gotoBm: (v) => 'Au signet · verset ' + v,
      reviewThis: 'Réviser (masqué)',
      nextSurah: 'Sourate suivante',
      statusRow: 'Statut de la sourate',
      revTitle: 'Révision',
      revLead: 'Une sourate parmi tes mémorisées — de préférence celle que tu n’as pas revue depuis le plus longtemps — s’affiche masquée' + NBSP + ': révèle ses versets un à un, de mémoire',
      revEmpty: 'Aucune sourate mémorisée pour l’instant. Dans Sourates, touche deux fois le cercle à droite d’une sourate (en cours → mémorisée).',
      goSurahs: 'Voir les sourates',
      draw: 'Tirer une sourate',
      poolCount: (n) => n + ' ' + fr(n, 'sourate', 'sourates') + ' en révision',
      surahCap: 'SOURATE',
      passage: (a, b) => 'Versets ' + a + '–' + b,
      revHint: 'Récite le verset de mémoire puis touche-le pour le révéler',
      revealedOf: (i, n) => i + ' sur ' + n + ' ' + fr(n, 'verset révélé', 'versets révélés'),
      revDone: 'Sourate révisée ✓', passDone: 'Passage révisé ✓',
      revealAll: 'Tout révéler', anotherSurah: 'Autre sourate', nextPassage: 'Passage suivant',
      restart: 'Recommencer', closeRev: 'Terminer',
      confirmAbandon: 'Abandonner' + NBSP + '?', confirmAbandonLong: 'Touche à nouveau pour abandonner cette révision',
      revReplaced: 'Révision précédente remplacée',
      maskedVerse: (n) => 'Verset ' + n + ' masqué, touche pour le révéler',
      statsTitle: 'Statistiques', statsSub: 'Ton chemin avec le Mushaf',
      learnedCap: 'Sourates mémorisées', of114: (n) => 'sur ' + n,
      versesShare: (a, b, p) => a + NBSP + fr(a, 'verset', 'versets') + ' sur ' + b + ' · ' + p + NBSP + '% du Mushaf',
      inProgress: (n) => n + ' en cours',
      totalCap: 'Temps total de lecture',
      hoursMins: (h, m) => 'h' + (m ? ' ' + m + NBSP + 'min' : ''),
      minsOnly: () => 'min',
      streakCap: 'Série de jours',
      streakSub: (n, best) => fr(n, 'jour consécutif', 'jours consécutifs') + ' · record ' + best,
      weekCap: '7 derniers jours',
      histDays: 'Derniers jours', histWeeks: 'Dernières semaines',
      thisWeek: 'Cette semaine', weekOf: (d) => 'Semaine du ' + d,
      noReading: 'Pas encore de lecture — lance ta première session depuis l’accueil', noReadDay: 'aucune lecture',
      goalLine: 'Objectif',
      setTitle: 'Réglages', setSub: 'Apparence, lecture, données et mise à jour',
      grpLook: 'Apparence', grpReading: 'Lecture', grpData: 'Données', grpApp: 'Application',
      themeRow: 'Mode', themeNight: 'Nuit', themeDay: 'Jour',
      langRow: 'Langue',
      goalCap: 'Objectif quotidien', goalUnit: () => 'min',
      goalDec: 'Diminuer l’objectif', goalInc: 'Augmenter l’objectif',
      textSize: 'Taille du texte coranique', qsDec: 'Réduire le texte', qsInc: 'Agrandir le texte',
      tajRow: 'Tajwid coloré', tajOff: 'Non', tajOn: 'Oui',
      tajNote: 'Coloration indicative générée automatiquement (open source) — une aide, qui ne remplace pas l’apprentissage auprès d’un enseignant',
      tajFail: 'Impossible de charger le tajwid (hors ligne' + NBSP + '?)',
      tajLegend: {
        m2: 'Madd 2 temps', m4: 'Madd 4–5 temps', m6: 'Madd 6 (lāzim)',
        gh: 'Ghunna, idghām, ikhfāʾ, iqlāb', ql: 'Qalqala', sl: 'Non prononcé'
      },
      exportBtn: 'Exporter une sauvegarde', exportNote: 'Fichier JSON avec sessions et états des sourates',
      lastExport: (d) => 'Dernière sauvegarde' + NBSP + ': ' + d, exportOk: 'Sauvegarde exportée',
      importBtn: 'Importer une sauvegarde', importOk: 'Sauvegarde importée', importBad: 'Fichier invalide',
      importConfirm: (n, l, d) => 'Remplacer tes données actuelles par cette sauvegarde' + (d ? ' du ' + d : '') + NBSP + '?\n' +
        n + NBSP + fr(n, 'session', 'sessions') + ' · ' + l + NBSP + fr(l, 'sourate mémorisée', 'sourates mémorisées'),
      resetBtn: 'Réinitialiser les données', resetConfirm: 'Touche à nouveau pour confirmer',
      resetNote: 'Efface sessions, états des sourates, signet, révisions et record (les réglages et la séance en cours sont conservés)',
      resetDone: 'Données réinitialisées',
      updBtn: 'Rechercher une mise à jour',
      updChecking: 'Vérification…', updReloading: 'Mise à jour installée · rechargement…', updInstalling: 'Nouvelle version trouvée, installation…',
      updLatest: (v) => 'Tu as déjà la dernière version (' + v + ')',
      updFail: 'Échec de la mise à jour, réessaie plus tard', updOffline: 'Tu es hors ligne',
      updateReady: 'Nouvelle version prête', updateBtn: 'Actualiser',
      versionRow: 'Version',
      attribution: 'Texte du Mushaf' + NBSP + ': projet Tanzil (riwāya Ḥafṣ ʿan ʿĀṣim) · Police' + NBSP + ': Complexe du Roi Fahd (KFGQPC)',
      durS: (s) => s + NBSP + 's',
      durHM: (h, m) => h > 0 ? h + NBSP + 'h' + (m ? ' ' + m + NBSP + 'min' : '') : m + NBSP + 'min'
    }
  };

  // ── État ────────────────────────────────────────────────
  function defaultLang() {
    const l = (navigator.languages && navigator.languages[0]) || navigator.language || '';
    return /^ar\b/i.test(l) ? 'ar' : 'fr';
  }
  function freshState() {
    return {
      statuses: {},        // n -> 'l' (محفوظة) | 'p' (قيد الحفظ)
      sessions: [],        // { d: 'YYYY-MM-DD', t: epoch_ms, s: secondes }
      lastReviewed: {},    // n -> epoch_ms de la dernière révision terminée
      revCursor: {},       // n -> premier verset du prochain passage (longues sourates)
      bookmark: null,      // { surah, verse } signet de reprise
      best: 0,             // plus longue série atteinte
      goalMin: 20,
      quranScale: 1,       // facteur de taille du texte coranique (1 → 2)
      tajweed: false,      // coloration tajwid
      theme: 'night',
      lang: defaultLang(),
      tab: 'home',
      runningSince: null,  // epoch_ms si une session est en cours
      reader: null,        // { surah, verse } lecteur ouvert (survit à une relance)
      rev: null,           // session de révision en cours (survit à une relance)
      lastExport: 0
    };
  }

  let state = loadState();
  let QURAN = null;          // { bismillah, surahs: [{n,name,tr,fr,medinan,verses}] }
  let TAJ = null;            // { groups: [classe par règle], spans: {'s:v': [[a,b,r],…]} }
  let tajLoading = null;
  let filter = 'all';        // filtre de la liste des sourates
  let query = '';            // recherche dans la liste
  let sortMode = 'mushaf';   // mushaf | length | status
  let listScroll = null;     // position de la liste à restaurer en fermant le lecteur
  let readerPx = null;       // position exacte du lecteur quand on change d'onglet
  let readerFrom = null;     // onglet d'où le lecteur a été ouvert (pour le retour)
  let pendingVerse = null;   // { v, flash } verset vers lequel défiler après le rendu
  let revSession = null;     // { surah, from, to, revealed: bool[], manual }
  let revScroll = 0;
  let recentDraws = [];
  let drawArmed = false, drawTimer = null;
  let savedUntil = 0;        // affichage transitoire « session enregistrée »
  let savedText = '';
  let tickId = null, lastTickDay = '', prevTodaySec = null, lastStatsMin = -1;
  let resetArmed = false, resetArmedAt = 0, resetTimer = null, updTimer = null;
  let toastActs = [];

  function loadState() {
    const base = freshState();
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = Object.assign(base, JSON.parse(raw));
        if (!s.revCursor || typeof s.revCursor !== 'object') s.revCursor = {};
        return s;
      }
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
  const arNum = (v) => String(v).replace(/[0-9]/g, (d) => AR_DIGITS[d]);
  const num = (v) => isAr() ? arNum(v) : String(v);
  const westNum = (s) => String(s).replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d)));
  const readerSurah = () => (state.reader ? state.reader.surah : null);
  const readerOpen = () => state.tab === 'surahs' && !!state.reader;
  const surahLabel = (s) => (isAr() ? s.name : s.tr);
  /* « Ya-Sin · Ya-Sin » : le nom français n'est répété que s'il diffère de la translittération */
  const frNames = (s) => esc(s.tr) + (norm(s.fr) === norm(s.tr) ? '' : ' · ' + esc(s.fr));
  /* le point médian ressemble au zéro arabe « ٠ » : virgule arabe en arabe */
  const SEP = () => (isAr() ? '، ' : ' · ');
  const COLON = () => (isAr() ? ': ' : NBSP + ': ');
  /* cartes à gros chiffre : en arabe le duel porte le nombre, on n'écrit pas « ٢ يومان » */
  const nb = (n) => (isAr() && n === 2 ? '' : num(n));

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function norm(s) {
    return String(s).toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')           // accents latins
      .replace(/[ً-ْٰٓـ]/g, '')          // harakāt + tatwīl
      .replace(/[أإآٱ]/g, 'ا')                                     // hamzas → alif
      .replace(/ى/g, 'ي').replace(/ة/g, 'ه')                       // ى→ي · ة→ه
      .replace(/['’ʻʿʾ\-\s]/g, '');
  }
  /* clé phonétique tolérante aux graphies françaises : nour, yassine, rahmane… */
  function fk(s) {
    return norm(s).replace(/ou/g, 'u').replace(/(.)\1+/g, '$1').replace(/e$/, '');
  }
  function trBase(s) {
    return fk(s.tr.replace(/^(A[lnrstdz]|Ash|Adh|Ath)[-’' ]/i, ''));
  }

  function pad2(n) { return String(n).padStart(2, '0'); }
  function dayKey(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function mondayOf(d) { const x = new Date(d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; }
  function nextMidnight(ms) { const d = new Date(ms); return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime(); }

  function fmtClock(sec) {
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    const str = h > 0 ? h + ':' + pad2(m) + ':' + pad2(s) : m + ':' + pad2(s);
    return num(str);
  }
  /* chiffres de largeur fixe : les chiffres arabes-indiens n'ont pas tous la même chasse */
  function clockHTML(sec) {
    return fmtClock(sec).split('').map((c) => '<span class="dg' + (c === ':' ? ' sep' : '') + '">' + c + '</span>').join('');
  }
  function fmtDur(sec) {
    if (!sec) return '—';
    if (sec < 60) return t().durS(sec);
    const tm = Math.floor(sec / 60);
    return t().durHM(Math.floor(tm / 60), tm % 60);
  }

  // ── Taille du texte coranique : échelle 1 → 10 (100 % → 200 %) ──
  const QS_LEVELS = 10;
  function qsLevel() {
    return Math.min(QS_LEVELS, Math.max(1, Math.round((state.quranScale - 1) * (QS_LEVELS - 1) + 1)));
  }
  function setQsLevel(lvl) {
    const l = Math.min(QS_LEVELS, Math.max(1, lvl));
    state.quranScale = Math.round((1 + (l - 1) / (QS_LEVELS - 1)) * 1000) / 1000;
  }
  function normalizeQuranScale() { setQsLevel(qsLevel()); }

  // ── Dates ───────────────────────────────────────────────
  const dLocale = () => (isAr() ? 'ar-u-nu-arab' : 'fr-FR');
  function dateLine() {
    const now = new Date();
    try {
      if (isAr()) {
        return { g: new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-arab',
          { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now), h: '' };
      }
      const g = new Intl.DateTimeFormat('fr-FR',
        { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now);
      let h = '';
      try {
        h = new Intl.DateTimeFormat('fr-u-ca-islamic-umalqura',
          { day: 'numeric', month: 'long', year: 'numeric' }).format(now).replace(/\s?AH$/, NBSP + 'H');
      } catch (e) { /* calendrier non supporté */ }
      return { g: g.charAt(0).toUpperCase() + g.slice(1), h: h };
    } catch (e) {
      return { g: now.toLocaleDateString(isAr() ? 'ar' : 'fr-FR'), h: '' };
    }
  }
  function dateHTML() {
    const dl = dateLine();
    return esc(dl.g) + (dl.h ? ' · <span class="nowrap">' + esc(dl.h) + '</span>' : '');
  }
  function shortDate(d) {
    try {
      return new Intl.DateTimeFormat(dLocale(), { weekday: 'short', day: 'numeric', month: 'short' }).format(d);
    } catch (e) { return dayKey(d); }
  }
  function dayMonth(d) {
    try { return new Intl.DateTimeFormat(dLocale(), { day: 'numeric', month: 'long' }).format(d); }
    catch (e) { return dayKey(d); }
  }
  function barDay(d) {
    try {
      if (isAr()) return new Intl.DateTimeFormat('ar-u-nu-arab', { weekday: 'narrow' }).format(d);
      return new Intl.DateTimeFormat('fr-FR', { weekday: 'short' }).format(d).replace('.', '').slice(0, 2);
    } catch (e) { return ''; }
  }

  // ── Agrégats de lecture ─────────────────────────────────
  /* découpe [a, b[ en morceaux par jour local (gère minuit et l'heure d'été) */
  function splitByDay(a, b) {
    const out = [];
    let s = a;
    while (s < b) {
      const e = Math.min(nextMidnight(s), b);
      const sec = Math.floor((e - s) / 1000);
      if (sec > 0) out.push({ d: dayKey(new Date(s)), t: e, s: sec });
      s = e;
    }
    return out;
  }
  function dayTotals() {
    const m = {};
    for (const s of state.sessions) m[s.d] = (m[s.d] || 0) + s.s;
    return m;
  }
  /* totaux enregistrés + part de la session en cours, jour par jour */
  function liveTotals() {
    const m = dayTotals();
    if (state.runningSince) {
      for (const p of splitByDay(state.runningSince, Date.now())) m[p.d] = (m[p.d] || 0) + p.s;
    }
    return m;
  }
  function runningElapsed() {
    return state.runningSince ? Math.max(0, Math.floor((Date.now() - state.runningSince) / 1000)) : 0;
  }
  function todaySec(totals) { return totals[dayKey(new Date())] || 0; }
  function streakOf(totals) {
    let d = new Date(), n = 0;
    const todayActive = (totals[dayKey(d)] || 0) > 0 || !!state.runningSince;
    if (todayActive) n = 1;
    d = addDays(d, -1);
    if (!todayActive && !((totals[dayKey(d)] || 0) > 0)) return 0;
    while ((totals[dayKey(d)] || 0) > 0) { n++; d = addDays(d, -1); }
    return n;
  }
  function last7(totals) {
    const out = [];
    for (let i = 6; i >= 0; i--) {
      const d = addDays(new Date(), -i);
      out.push({ date: d, sec: totals[dayKey(d)] || 0 });
    }
    return out;
  }
  function weekTotals(totals, count) {
    const out = [];
    let start = mondayOf(new Date());
    for (let w = 0; w < count; w++) {
      let sec = 0;
      for (let i = 0; i < 7; i++) sec += totals[dayKey(addDays(start, i))] || 0;
      out.push({ start: new Date(start), sec });
      start = addDays(start, -7);
    }
    return out;
  }
  function learnedCount() {
    return Object.values(state.statuses).filter((s) => s === 'l').length;
  }

  // ── Tajwid ──────────────────────────────────────────────
  /* Annotations dérivées de cpfair/quran-tajweed (BSD), réalignées et
     vérifiées caractère par caractère sur notre texte Tanzil. */
  const TJ_GROUP = {
    ghunnah: 'gh', idghaam_ghunnah: 'gh', idghaam_no_ghunnah: 'sl',
    idghaam_mutajanisayn: 'gh', idghaam_mutaqaribayn: 'gh', idghaam_shafawi: 'gh',
    ikhfa: 'gh', ikhfa_shafawi: 'gh', iqlab: 'gh',
    madd_2: 'm2', madd_246: 'm4', madd_muttasil: 'm4', madd_munfasil: 'm4', madd_6: 'm6',
    qalqalah: 'ql', hamzat_wasl: 'sl', lam_shamsiyyah: 'sl', silent: 'sl'
  };

  function loadTajweed() {
    if (TAJ) return Promise.resolve(TAJ);
    if (tajLoading) return tajLoading;
    tajLoading = fetch('data/tajweed.json')
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then((d) => {
        TAJ = { groups: d.rules.map((r) => TJ_GROUP[r] || 'sl'), spans: d.spans };
        return TAJ;
      })
      .catch((e) => { tajLoading = null; throw e; });
    return tajLoading;
  }

  /* HTML d'un verset, coloré si le tajwid est actif et les données chargées */
  function verseHTML(surah, verseNum, text) {
    if (!state.tajweed || !TAJ) return esc(text);
    const ann = TAJ.spans[surah + ':' + verseNum];
    if (!ann) return esc(text);
    let out = '', pos = 0;
    for (const sp of ann) {
      if (sp[0] > pos) out += esc(text.slice(pos, sp[0]));
      out += '<i class="tj-' + TAJ.groups[sp[2]] + '">' + esc(text.slice(sp[0], sp[1])) + '</i>';
      pos = sp[1];
    }
    return out + esc(text.slice(pos));
  }
  function bismillahHTML() {
    // la basmala est le verset 1:1 : on réutilise ses annotations
    return verseHTML(1, 1, QURAN.bismillah);
  }
  const verseNumHTML = (n) => NBSP + '<span class="verse-num">﴿' + arNum(n) + '﴾</span>';

  // ── Ornements SVG ───────────────────────────────────────
  function star8(size, stroke, noCore) {
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">' +
      '<rect x="5.5" y="5.5" width="13" height="13" stroke="currentColor" stroke-width="' + stroke + '"></rect>' +
      '<rect x="5.5" y="5.5" width="13" height="13" stroke="currentColor" stroke-width="' + stroke + '" transform="rotate(45 12 12)"></rect>' +
      (noCore ? '' : '<circle cx="12" cy="12" r="2.4" stroke="currentColor" stroke-width="' + stroke + '"></circle>') + '</svg>';
  }
  const SVG_A = ' aria-hidden="true" focusable="false"';
  const CHECK_SVG = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"' + SVG_A + '>' +
    '<path d="M2.5 6.2L5 8.7l4.5-5.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
  const PLAY_SVG = '<svg width="11" height="12" viewBox="0 0 11 12"' + SVG_A + '><path d="M1.5 1.6c0-.8.9-1.3 1.6-.9l7 4.4c.7.4.7 1.4 0 1.8l-7 4.4c-.7.4-1.6-.1-1.6-.9z" fill="currentColor"></path></svg>';
  const STOP_SVG = '<svg width="11" height="11" viewBox="0 0 12 12"' + SVG_A + '><rect x="1.5" y="1.5" width="9" height="9" rx="2" fill="currentColor"></rect></svg>';
  const SUN_SVG = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"' + SVG_A + '>' +
    '<circle cx="12" cy="12" r="4.2"></circle><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5 5l1.7 1.7M17.3 17.3L19 19M19 5l-1.7 1.7M6.7 17.3L5 19"></path></svg>';
  const MOON_SVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"' + SVG_A + '>' +
    '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z"></path></svg>';
  const CHEV_SVG = '<svg class="chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"' + SVG_A + '><path d="M9 5l7 7-7 7"></path></svg>';
  const REVIEW_SVG = '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"' + SVG_A + '><path d="M12 3.5l2 6.5 6.5 2-6.5 2-2 6.5-2-6.5L3.5 12 10 10z"></path></svg>';
  const SORT_SVG = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"' + SVG_A + '><path d="M7 4v16M3.5 16.5 7 20l3.5-3.5M17 20V4M13.5 7.5 17 4l3.5 3.5"></path></svg>';
  const TAB_ICONS = {
    home: '<svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"' + SVG_A + '><path d="M5 20v-7.5C5 8 8 5 12 5s7 3 7 7.5V20"></path><path d="M3 20h18"></path><path d="M12 5V3.5"></path></svg>',
    surahs: '<svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"' + SVG_A + '><path d="M4 5.5C6.4 4 9.6 4 12 5.5c2.4-1.5 5.6-1.5 8 0v13c-2.4-1.5-5.6-1.5-8 0-2.4-1.5-5.6-1.5-8 0z"></path><path d="M12 5.5v13"></path></svg>',
    review: '<svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"' + SVG_A + '><path d="M12 3.5l2 6.5 6.5 2-6.5 2-2 6.5-2-6.5L3.5 12 10 10z"></path></svg>',
    stats: '<svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"' + SVG_A + '><path d="M5 20v-7"></path><path d="M12 20V6"></path><path d="M19 20v-10"></path></svg>',
    settings: '<svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"' + SVG_A + '><path d="M4 7h9M17.5 7H20"></path><circle cx="15" cy="7" r="2.2"></circle><path d="M4 12h3M11.5 12H20"></path><circle cx="9" cy="12" r="2.2"></circle><path d="M4 17h10M18.5 17H20"></path><circle cx="16" cy="17" r="2.2"></circle></svg>'
  };

  // ── Écran accueil ───────────────────────────────────────
  /* Anneau extérieur : balaie une minute complète, comme un chronomètre.
     Anneau intérieur : progression vers l'objectif quotidien.
     Aucune règle CSS transform/transform-origin sur ces éléments : ils
     portent déjà un attribut SVG transform, les deux se composeraient. */
  const RING_R = 132, RING_C = 2 * Math.PI * RING_R;
  const GOAL_R = 116, GOAL_C = 2 * Math.PI * GOAL_R;
  let ringBaseMs = 0;   // lecture enregistrée aujourd'hui, hors session en cours
  let ringRaf = 0;

  function goalClass(sec) {
    return sec >= state.goalMin * 60 ? 'done' : sec < 1 ? 'empty' : '';
  }
  function goalOffset(sec) {
    return GOAL_C * (1 - Math.min(1, sec / (state.goalMin * 60)));
  }
  function todayStartMs() { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); }
  function minuteFrac() {
    let ms = ringBaseMs;
    if (state.runningSince) ms += Math.max(0, Date.now() - Math.max(state.runningSince, todayStartMs()));
    return (ms % 60000) / 60000;
  }
  function setRing(frac) {
    const arc = $('#ring-sec');
    if (arc) arc.setAttribute('stroke-dashoffset', (RING_C * (1 - frac)).toFixed(2));
    const head = $('#ring-head');
    if (head) head.setAttribute('transform', 'rotate(' + (frac * 360).toFixed(2) + ' 141 141)');
  }
  const reducedMotion = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* animation continue de l'arc tant que le chrono tourne et que l'accueil est visible */
  function startRing() {
    ringBaseMs = (dayTotals()[dayKey(new Date())] || 0) * 1000;
    cancelAnimationFrame(ringRaf);
    ringRaf = 0;
    setRing(minuteFrac());
    if (!state.runningSince || reducedMotion()) return;
    const frame = () => {
      if (!state.runningSince || state.tab !== 'home' || document.hidden || !$('#ring-sec')) { ringRaf = 0; return; }
      setRing(minuteFrac());
      ringRaf = requestAnimationFrame(frame);
    };
    ringRaf = requestAnimationFrame(frame);
  }

  function ringLabel(today) {
    if (state.runningSince) return { text: t().sessionLbl(fmtClock(runningElapsed())), ok: false };
    if (Date.now() < savedUntil) return { text: savedText, ok: true };
    if (today >= state.goalMin * 60) return { text: t().goalDone, ok: true };
    return { text: t().ofGoal(state.goalMin), ok: false };
  }

  function resumeCardHTML() {
    const bm = state.bookmark;
    if (!bm || !QURAN.surahs[bm.surah - 1]) return '';
    const s = QURAN.surahs[bm.surah - 1];
    return '<div class="resume-card">' +
      '<button class="resume-main" data-action="resume">' +
        '<span class="resume-glyph">' + star8(18, 1.2) + '</span>' +
        '<span class="resume-txt">' +
          '<span class="resume-cap">' + t().resumeCap + '</span>' +
          '<span class="resume-name">' + esc(surahLabel(s)) + SEP() + t().verseN(bm.verse) + '</span>' +
        '</span>' + CHEV_SVG +
      '</button>' +
      '<button class="resume-x" data-action="clear-bookmark" aria-label="' + esc(t().resumeClear) + '"><span aria-hidden="true">×</span></button>' +
    '</div>';
  }

  function homeHTML() {
    const totals = liveTotals();
    const today = todaySec(totals);
    const running = !!state.runningSince;
    const streak = streakOf(totals);
    const lbl = ringLabel(today);
    const frac = (today % 60) / 60;
    const todayMin = Math.floor(today / 60);
    return '<section class="fade">' +
      '<div class="home-top">' +
        '<h1 class="home-salam">' + esc(t().appName) + '</h1>' +
        '<div class="home-date" id="home-date">' + dateHTML() + '</div>' +
      '</div>' +
      '<div class="ring-wrap">' +
        '<button class="ring-btn' + (running ? ' running' : '') + '" data-action="toggle-run">' +
          '<svg viewBox="0 0 282 282"' + SVG_A + '>' +
            '<circle cx="141" cy="141" r="' + RING_R + '" fill="none" stroke="var(--ring-track)" stroke-width="5"></circle>' +
            '<circle id="ring-sec" cx="141" cy="141" r="' + RING_R + '" fill="none" stroke="var(--accent)" stroke-width="5" stroke-linecap="round" stroke-dasharray="' + RING_C.toFixed(2) + '" stroke-dashoffset="' + (RING_C * (1 - frac)).toFixed(2) + '" transform="rotate(-90 141 141)"></circle>' +
            '<circle cx="141" cy="141" r="' + GOAL_R + '" fill="none" stroke="var(--ring-track)" stroke-width="2.5"></circle>' +
            '<circle id="ring-goal" class="' + goalClass(today) + '" cx="141" cy="141" r="' + GOAL_R + '" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="' + GOAL_C.toFixed(2) + '" stroke-dashoffset="' + goalOffset(today).toFixed(2) + '" transform="rotate(-90 141 141)"></circle>' +
            '<g id="ring-head" class="' + (running ? 'live' : '') + '" transform="rotate(' + (frac * 360).toFixed(2) + ' 141 141)">' +
              '<circle class="ring-head-glow" cx="141" cy="9" r="9"></circle>' +
              '<circle cx="141" cy="9" r="4.5" fill="var(--accent)"></circle>' +
            '</g>' +
          '</svg>' +
          '<span class="ring-center">' +
            '<span class="ring-cap">' + t().todayCap + '</span>' +
            '<span class="ring-time" id="clock">' + clockHTML(today) + '</span>' +
            '<span class="ring-label' + (lbl.ok ? ' ok' : '') + '" id="ring-label">' + esc(lbl.text) + '</span>' +
            '<span class="ring-cta">' + (running ? STOP_SVG : PLAY_SVG) + '<span>' + (running ? t().stop : t().start) + '</span></span>' +
          '</span>' +
        '</button>' +
      '</div>' +
      resumeCardHTML() +
      '<div class="stat-row">' +
        '<div class="stat-card"><div class="stat-glyph">' + star8(14, 1.2) + '</div>' +
          '<div class="stat-num"><b id="streak-num">' + nb(streak) + '</b> <span id="streak-unit">' + t().dayUnit(streak) + '</span></div>' +
          '<div class="stat-cap" id="streak-cap">' + t().streakCard(streak) + '</div></div>' +
        '<div class="stat-card"><div class="stat-glyph">' + star8(14, 1.2) + '</div>' +
          '<div class="stat-num"><b id="today-min">' + nb(todayMin) + '</b> <span id="today-unit">' + t().minUnit(todayMin) + '</span></div>' +
          '<div class="stat-cap">' + t().todayCard + '</div></div>' +
      '</div>' +
    '</section>';
  }

  /* met à jour l'accueil en place (aucun re-rendu, donc aucun fondu) */
  function patchHome() {
    const btn = $('.ring-btn');
    if (!btn) { renderBody(true); return; }
    const totals = liveTotals();
    const today = todaySec(totals);
    const running = !!state.runningSince;
    const streak = streakOf(totals);
    const todayMin = Math.floor(today / 60);
    btn.classList.toggle('running', running);
    const head = $('#ring-head');
    if (head) head.setAttribute('class', running ? 'live' : '');
    $('#clock').innerHTML = clockHTML(today);
    const hd = $('#home-date');
    if (hd) hd.innerHTML = dateHTML();
    const lbl = ringLabel(today);
    const lb = $('#ring-label');
    lb.textContent = lbl.text;
    lb.classList.toggle('ok', lbl.ok);
    btn.querySelector('.ring-cta').innerHTML = (running ? STOP_SVG : PLAY_SVG) + '<span>' + (running ? t().stop : t().start) + '</span>';
    const goal = $('#ring-goal');
    goal.setAttribute('stroke-dashoffset', goalOffset(today).toFixed(2));
    goal.setAttribute('class', goalClass(today));
    $('#streak-num').textContent = nb(streak);
    $('#streak-unit').textContent = t().dayUnit(streak);
    $('#streak-cap').textContent = t().streakCard(streak);
    $('#today-min').textContent = nb(todayMin);
    $('#today-unit').textContent = t().minUnit(todayMin);
    startRing();
  }

  // ── Écran sourates (liste) ──────────────────────────────
  function surahMeta(s) {
    const kind = s.medinan ? t().medinan : t().meccan;
    if (isAr()) return t().versesCount(s.verses.length) + SEP() + kind;
    return esc(s.fr) + ' · ' + t().versesCount(s.verses.length) + ' · ' + kind;
  }

  function surahRowHTML(s) {
    const st = state.statuses[s.n] || '';
    const learned = st === 'l';
    const title = isAr()
      ? '<span class="surah-name" lang="ar" dir="rtl">' + esc(s.name) + '</span>'
      : '<span class="surah-title"><span class="surah-tr">' + esc(s.tr) + '</span><span class="surah-name" lang="ar" dir="rtl">' + esc(s.name) + '</span></span>';
    return '<div class="surah-row" data-row="' + s.n + '">' +
      '<div class="num-badge' + (learned ? ' on' : '') + (s.n >= 100 ? ' n3' : '') + '" data-action="open-surah" data-n="' + s.n + '" aria-hidden="true">' +
        star8(40, 1, true) + '<span>' + num(s.n) + '</span></div>' +
      '<div class="surah-main" data-action="open-surah" data-n="' + s.n + '" role="button" tabindex="0" aria-label="' + esc(t().openSurah(surahLabel(s))) + '">' +
        title + '<span class="surah-meta">' + surahMeta(s) + '</span>' +
      '</div>' +
      '<button class="status-btn" data-action="cycle" data-n="' + s.n + '" aria-label="' +
        esc(t().statusBtn(surahLabel(s), t().status[st || 'none'])) + '">' +
        '<span class="status-dot ' + st + '">' + (learned ? CHECK_SVG : '') + '</span>' +
      '</button>' +
    '</div>';
  }

  function qRank(s, fq) {
    let r = 3;
    for (const k of [fk(s.tr), trBase(s), fk(s.fr)]) {
      r = Math.min(r, k === fq ? 0 : k.startsWith(fq) ? 1 : k.includes(fq) ? 2 : 3);
    }
    return r;
  }

  function filteredSurahs() {
    let arr = QURAN.surahs.filter((s) => filter === 'all' || state.statuses[s.n] === filter);
    const raw = query.trim();
    const q = norm(raw);
    if (q) {
      const qn = westNum(raw);
      const fq = fk(raw);
      arr = arr.filter((s) =>
        norm(s.name).includes(q) || norm(s.tr).includes(q) || norm(s.fr).includes(q) ||
        (fq && (fk(s.tr).includes(fq) || trBase(s).includes(fq) || fk(s.fr).includes(fq))) ||
        (/^\d+$/.test(qn) && String(s.n).startsWith(qn)));
    }
    if (sortMode === 'length') {
      arr = arr.slice().sort((a, b) => a.verses.length - b.verses.length || a.n - b.n);
    } else if (sortMode === 'status') {
      const rank = { l: 0, p: 1, '': 2 };
      arr = arr.slice().sort((a, b) =>
        rank[state.statuses[a.n] || ''] - rank[state.statuses[b.n] || ''] || a.n - b.n);
    }
    if (q && !/^\d+$/.test(westNum(raw))) {
      const fq = fk(raw);
      arr = arr.slice().sort((a, b) => qRank(a, fq) - qRank(b, fq));
    }
    return arr;
  }

  function surahListHTML() {
    const rows = filteredSurahs();
    if (!rows.length) {
      return '<div class="empty"><span class="empty-glyph">' + star8(26, 1.2) + '</span><p>' +
        (query.trim() ? t().noResults : t().emptyCat) + '</p></div>';
    }
    return rows.map(surahRowHTML).join('');
  }

  function surahsHTML() {
    if (state.reader) return readerHTML();
    const chips = ['all', 'l', 'p'].map((f) =>
      '<button class="chip' + (filter === f ? ' on' : '') + '" data-action="filter" data-f="' + f + '" aria-pressed="' + (filter === f) + '">' + t().filters[f] + '</button>'
    ).join('') +
      '<button class="chip sort" data-action="sort-next" aria-label="' + esc(t().sortLabel + COLON() + t().sorts[sortMode]) + '">' + SORT_SVG + '<span>' + t().sorts[sortMode] + '</span></button>';
    const legend = Object.keys(state.statuses).length ? '' :
      '<div class="status-legend"><span class="lg-dot"></span><span class="lg-dot p"></span><span class="lg-dot l">' + CHECK_SVG + '</span>' +
      '<span>' + t().statusLegend + '</span></div>';
    return '<section class="fade">' +
      '<div class="scr-head compact"><h1 class="scr-title">' + t().surahsTitle + '</h1>' +
      '<div class="scr-sub" id="learned-sub">' + t().surahsSub(learnedCount(), 114) + '</div></div>' +
      '<div class="search-wrap">' +
        '<input type="search" class="search" data-input="search" value="' + esc(query) + '" placeholder="' + esc(t().searchPh) + '" aria-label="' + esc(t().searchPh) + '" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="search">' +
        '<button class="search-clear" data-action="clear-search" aria-label="' + esc(t().clearSearch) + '"' + (query ? '' : ' hidden') + '><span aria-hidden="true">×</span></button>' +
      '</div>' +
      '<div class="chips">' + chips + '</div>' +
      legend +
      '<div class="surah-list" id="surah-list">' + surahListHTML() + '</div>' +
    '</section>';
  }

  // ── Lecture complète d'une sourate ──────────────────────
  function readerHTML() {
    const s = QURAN.surahs[readerSurah() - 1];
    const bm = state.bookmark;
    const st = state.statuses[s.n] || 'none';
    const frLine = isAr() ? '' : '<div class="rev-surah-fr">' + frNames(s) + '</div>';
    const bismillah = (s.n !== 1 && s.n !== 9)
      ? '<div class="rev-bismillah" lang="ar">' + bismillahHTML() + '</div>' : '';
    const segs = s.verses.map((v, i) => {
      const n = i + 1;
      const marked = bm && bm.surah === s.n && bm.verse === n;
      return '<span class="verse-seg' + (marked ? ' bookmarked' : '') + '" data-action="mark-verse" data-v="' + n + '" role="button" tabindex="0"' +
        (marked ? ' aria-current="true"' : '') + '>' + verseHTML(s.n, n, v) + verseNumHTML(n) + '</span>';
    }).join(' ');
    const next = s.n < 114 ? QURAN.surahs[s.n] : null;
    return '<section class="fade reader">' +
      '<div class="reader-bar">' +
        '<button class="back-btn" data-action="back-surahs">' + CHEV_SVG + '<span>' + (readerFrom === 'home' ? t().tabs.home : t().back) + '</span></button>' +
        '<span class="reader-bar-name" lang="ar" dir="rtl" aria-hidden="true">' + esc(s.name) + '</span>' +
        '<button class="bar-icon" data-action="review-this" aria-label="' + esc(t().reviewThis) + '">' + REVIEW_SVG + '</button>' +
        '<input class="goto-verse" type="text" inputmode="numeric" enterkeyhint="go" data-input="goto-verse" placeholder="' + esc(t().gotoPh) + '" aria-label="' + esc(t().gotoLabel) + '" autocomplete="off">' +
      '</div>' +
      '<div class="rev-frame reader-head">' +
        '<h1 class="rev-surah-name" id="reader-title" lang="ar" dir="rtl">' + esc(s.name) + '</h1>' + frLine +
        '<div class="rev-sep">' + star8(13, 1.2) + '</div>' +
        '<div class="reader-tools" id="reader-tools">' + readerToolsHTML(s.n) + '</div>' +
        '<div class="reader-hint' + (bm ? ' sr-only' : '') + '" id="reader-hint">' + t().readerHint + '</div>' +
        bismillah +
        '<p class="reader-text" lang="ar" dir="rtl">' + segs + '</p>' +
        '<div class="reader-end">' +
          '<div class="set-row reader-status"><span class="set-label">' + t().statusRow + '</span>' +
            segHTML('set-status', [
              { v: 'none', label: t().status.none, on: st === 'none' },
              { v: 'p', label: t().status.p, on: st === 'p' },
              { v: 'l', label: t().status.l, on: st === 'l' }
            ]) + '</div>' +
          (next ? '<button class="btn btn-gold" data-action="open-surah" data-n="' + next.n + '">' +
            t().nextSurah + SEP() + (isAr() ? '<span lang="ar">' + esc(next.name) + '</span>' : esc(next.tr)) + '</button>' : '') +
        '</div>' +
      '</div>' +
    '</section>';
  }

  function readerToolsHTML(n) {
    const bm = state.bookmark;
    return bm && bm.surah === n ? '<button class="chip" data-action="goto-bookmark">' + esc(t().gotoBm(bm.verse)) + '</button>' : '';
  }
  function refreshBmChip() {
    const tools = $('#reader-tools');
    if (tools) tools.innerHTML = readerToolsHTML(readerSurah());
    const hint = $('#reader-hint');
    if (hint) hint.classList.toggle('sr-only', !!state.bookmark);
  }

  function openReader(n, verse, flash) {
    if (state.tab !== 'surahs') readerFrom = state.tab;
    else if (!state.reader) { readerFrom = 'surahs'; listScroll = $('#body').scrollTop; }
    // depuis le lecteur (sourate suivante) : on garde l'origine et la position de la liste
    state.tab = 'surahs';
    state.reader = { surah: n, verse: verse || 1 };
    readerPx = null;
    save();
    pendingVerse = verse ? { v: verse, flash: !!flash } : null;
    const hadFocus = document.activeElement && document.activeElement !== document.body;
    renderChrome();
    renderBody(true);
    if (!verse) $('#body').scrollTop = 0;
    if (hadFocus) { const h = $('#reader-title'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } }
  }

  /* toList : l'onglet Sourates ramène toujours à la liste ; le bouton retour et le glissement, à l'origine */
  function closeReader(toList) {
    const n = readerSurah();
    const from = toList ? 'surahs' : readerFrom;
    if (toList && readerFrom !== 'surahs') listScroll = null;
    const hadFocus = document.activeElement && document.activeElement !== document.body;
    state.reader = null;
    readerFrom = null;
    readerPx = null;
    if (from && from !== 'surahs' && from !== 'reader') {
      state.tab = from;
      save();
      renderChrome();
      renderBody(true);
      $('#body').scrollTop = 0;
      return;
    }
    save();
    renderBody(true);
    const body = $('#body');
    if (listScroll !== null) body.scrollTop = listScroll;
    else {
      const row = body.querySelector('[data-row="' + n + '"]');
      if (row) row.scrollIntoView({ block: 'center' });
    }
    listScroll = null;
    if (hadFocus) { const m = body.querySelector('[data-row="' + n + '"] .surah-main'); if (m) m.focus({ preventScroll: true }); }
  }

  /* barre du lecteur collée en haut : bas de la zone masquée par la barre */
  function readerTopInset() {
    const bar = $('.reader-bar');
    return bar ? bar.getBoundingClientRect().bottom + 6 : $('#body').getBoundingClientRect().top + 70;
  }
  function scrollToVerse(v, flash) {
    const body = $('#body');
    const seg = body.querySelector('.reader-text [data-v="' + v + '"]');
    if (!seg) return;
    const r = seg.getClientRects()[0] || seg.getBoundingClientRect();
    body.scrollTop += r.top - readerTopInset() - (flash ? 60 : 0);
    if (flash) {
      seg.classList.remove('flash');
      void seg.offsetWidth;
      seg.classList.add('flash');
    }
  }
  /* verset lu en haut de l'écran, mémorisé pour survivre à une relance. Les versets
     s'enchaînent sur une même ligne : si un verset commence sur la première ligne
     visible, c'est lui (et non la fin du précédent) qui compte. */
  function currentReaderVerse() {
    const top = readerTopInset();
    const segs = document.querySelectorAll('#body .reader-text .verse-seg');
    for (let i = 0; i < segs.length; i++) {
      const rs = segs[i].getClientRects();
      let vis = null;
      for (const r of rs) if (r.bottom > top + 4) { vis = r; break; }
      if (!vis) continue;
      if (Math.abs(rs[0].top - vis.top) < 4) return Number(segs[i].dataset.v);
      const nx = segs[i + 1] && segs[i + 1].getClientRects()[0];
      if (nx && Math.abs(nx.top - vis.top) < 4) return Number(segs[i + 1].dataset.v);
      return Number(segs[i].dataset.v);
    }
    return 1;
  }
  let readerSaveTimer = null;
  function trackReaderScroll() {
    if (!readerOpen()) return;
    clearTimeout(readerSaveTimer);
    readerSaveTimer = setTimeout(() => {
      if (!readerOpen()) return;
      state.reader.verse = currentReaderVerse();
      save();
    }, 400);
  }

  // ── Écran révision ──────────────────────────────────────
  function revPool() {
    return QURAN.surahs.filter((s) => state.statuses[s.n] === 'l').map((s) => s.n);
  }

  function makeSession(n, from, manual) {
    const len = QURAN.surahs[n - 1].verses.length;
    let a = 1, b = len;
    if (len > LONG_SURAH) {
      a = Math.min(Math.max(1, from || 1), len);
      if (len - a < 5) a = Math.max(1, len - PASSAGE + 1);   // jamais de passage minuscule en fin de sourate
      b = Math.min(len, a + PASSAGE - 1);
      if (len - b < 6) b = len;          // pas de minuscule reste en fin de sourate
    }
    const revealed = [];
    for (let v = a; v <= b; v++) revealed.push(v === a);
    return { surah: n, from: a, to: b, revealed: revealed, manual: !!manual };
  }
  function persistRev() {
    state.rev = revSession ? {
      surah: revSession.surah, from: revSession.from, to: revSession.to, manual: revSession.manual,
      revealed: revSession.revealed.map((b) => (b ? 1 : 0)).join('')
    } : null;
    save();
  }
  function restoreRev() {
    const r = state.rev;
    if (!r || !QURAN.surahs[r.surah - 1]) { state.rev = null; return; }
    const len = QURAN.surahs[r.surah - 1].verses.length;
    if (!(r.from >= 1 && r.to <= len && r.from <= r.to) || typeof r.revealed !== 'string' ||
        r.revealed.length !== r.to - r.from + 1 || (!r.manual && state.statuses[r.surah] !== 'l')) {
      state.rev = null;
      return;
    }
    revSession = { surah: r.surah, from: r.from, to: r.to, manual: !!r.manual, revealed: r.revealed.split('').map((c) => c === '1') };
  }
  const revDoneCount = () => revSession.revealed.filter(Boolean).length;
  const revComplete = () => revSession.revealed.every(Boolean);

  /* fin d'un passage ou d'une sourate : on enregistre la révision et on avance le curseur */
  function completeRev() {
    const n = revSession.surah;
    const len = QURAN.surahs[n - 1].verses.length;
    state.lastReviewed[n] = Date.now();
    if (len > LONG_SURAH) state.revCursor[n] = revSession.to >= len ? 1 : revSession.to + 1;
    save();
  }

  function revActionsHTML() {
    const s = QURAN.surahs[revSession.surah - 1];
    const pool = revPool();
    const others = pool.filter((n) => n !== revSession.surah).length;
    const long = s.verses.length > LONG_SURAH;
    const done = revComplete();
    const b = (cls, action, label) => '<button class="btn ' + cls + '" data-action="' + action + '">' + label + '</button>';
    let btns = '';
    if (done) {
      if (long && revSession.to < s.verses.length) {
        btns += b('btn-gold', 'next-passage', t().nextPassage);
        btns += others ? b('btn-ghost', 'draw', t().anotherSurah) : b('btn-ghost', 'close-rev', t().closeRev);
      } else if (others) {
        btns += b('btn-gold', 'draw', t().anotherSurah);
      } else {
        btns += pool.length ? b('btn-gold', 'draw', t().restart) : '';
        btns += b('btn-ghost', 'close-rev', t().closeRev);
      }
    } else {
      btns += b('btn-ghost', 'reveal-all', t().revealAll);
      btns += others ? b('btn-ghost', 'draw', t().anotherSurah)
        : pool.length ? b('btn-ghost', 'draw', t().restart) : b('btn-ghost', 'close-rev', t().closeRev);
    }
    const count = done ? (long && !(revSession.from === 1 && revSession.to === s.verses.length) ? t().passDone : t().revDone)
      : t().revealedOf(revDoneCount(), revSession.revealed.length);
    return '<div class="verse-count' + (done ? ' ok' : '') + '" id="rev-count" tabindex="-1">' + count + '</div>' +
      '<div class="rev-btns">' + btns + '</div>';
  }

  function maskedSegHTML(n, v) {
    return '<span class="verse-seg masked" data-action="reveal-verse" data-v="' + n + '" role="button" tabindex="0" aria-label="' +
      esc(t().maskedVerse(n)) + '">' + maskVerse(v) + verseNumHTML(n) + '</span>';
  }
  /* masque qui garde la largeur réelle de chaque mot : aucun décalage à la révélation */
  function maskVerse(v) {
    return v.split(' ').map((w) => '<span class="mw" aria-hidden="true">' + esc(w) + '</span>').join(' ');
  }

  function reviewHTML() {
    const pool = revPool();
    if (revSession && !revSession.manual && pool.indexOf(revSession.surah) === -1) { revSession = null; persistRev(); }

    if (!revSession && !pool.length) {
      return '<section class="fade rev-stage">' +
        '<div class="rev-ornament">' + star8(44, 0.8) + '</div>' +
        '<h1 class="scr-title">' + t().revTitle + '</h1>' +
        '<p class="rev-lead">' + t().revEmpty + '</p>' +
        '<div class="gap26"></div>' +
        '<button class="btn btn-gold" data-action="go-surahs">' + t().goSurahs + '</button>' +
      '</section>';
    }

    if (!revSession) {
      return '<section class="fade rev-stage">' +
        '<div class="rev-ornament">' + star8(44, 0.8) + '</div>' +
        '<h1 class="scr-title">' + t().revTitle + '</h1>' +
        '<p class="rev-lead">' + t().revLead + '</p>' +
        '<div class="gap30"></div>' +
        '<button class="btn btn-gold" data-action="draw">' + t().draw + '</button>' +
        '<div class="gap10"></div>' +
        '<div class="verse-count">' + t().poolCount(pool.length) + '</div>' +
      '</section>';
    }

    const s = QURAN.surahs[revSession.surah - 1];
    const frLine = isAr() ? '' : '<div class="rev-surah-fr">' + frNames(s) + '</div>';
    const partial = !(revSession.from === 1 && revSession.to === s.verses.length);
    const bismillah = (s.n !== 1 && s.n !== 9 && revSession.from === 1)
      ? '<div class="rev-bismillah" lang="ar">' + bismillahHTML() + '</div>' : '';
    const segs = [];
    for (let n = revSession.from; n <= revSession.to; n++) {
      const v = s.verses[n - 1];
      segs.push(revSession.revealed[n - revSession.from]
        ? '<span class="verse-seg" data-v="' + n + '">' + verseHTML(s.n, n, v) + verseNumHTML(n) + '</span>'
        : maskedSegHTML(n, v));
    }
    return '<section class="fade review">' +
      '<div class="rev-frame">' +
        '<span class="rev-surah-cap">' + t().surahCap + '</span>' +
        '<h1 class="rev-surah-name" lang="ar" dir="rtl">' + esc(s.name) + '</h1>' + frLine +
        (partial ? '<div class="rev-passage">' + t().passage(revSession.from, revSession.to) + '</div>' : '') +
        '<div class="rev-sep">' + star8(13, 1.2) + '</div>' +
        '<div class="reader-hint">' + t().revHint + '</div>' +
        bismillah +
        '<p class="reader-text" lang="ar" dir="rtl">' + segs.join(' ') + '</p>' +
      '</div>' +
      '<div class="rev-bar" id="rev-bar">' + revActionsHTML() + '</div>' +
    '</section>';
  }

  /* Tirage pondéré : plus une sourate n'a pas été révisée depuis longtemps,
     plus elle a de chances de sortir (jamais révisée = prioritaire). */
  function drawSurah() {
    const pool = revPool();
    if (!pool.length) return;
    let candidates = pool;
    const avoid = recentDraws.concat(revSession ? [revSession.surah] : []);
    if (pool.length > avoid.length) candidates = pool.filter((n) => avoid.indexOf(n) === -1);
    else if (revSession && pool.length > 1) candidates = pool.filter((n) => n !== revSession.surah);
    const now = Date.now();
    const weights = candidates.map((n) => Math.max(0.5, (now - (state.lastReviewed[n] || 0)) / 3600000));
    let r = Math.random() * weights.reduce((a, b) => a + b, 0);
    let next = candidates[candidates.length - 1];
    for (let i = 0; i < candidates.length; i++) {
      r -= weights[i];
      if (r <= 0) { next = candidates[i]; break; }
    }
    recentDraws = recentDraws.concat(next).slice(-2);
    revSession = makeSession(next, state.revCursor[next] || 1, false);
    revScroll = 0;
    persistRev();
  }

  function refreshRevBar() {
    drawArmed = false;
    clearTimeout(drawTimer);
    const bar = $('#rev-bar');
    if (bar) bar.innerHTML = revActionsHTML();
  }
  /* abandon d'une révision entamée : un second tap est demandé (libellé court, explication dans le compteur) */
  function armAbandon(el) {
    if (!revSession || revComplete() || revDoneCount() <= 1 || drawArmed) return false;
    drawArmed = true;
    el.textContent = t().confirmAbandon;
    const c = $('#rev-count');
    if (c) c.textContent = t().confirmAbandonLong;
    clearTimeout(drawTimer);
    drawTimer = setTimeout(refreshRevBar, 3000);
    return true;
  }
  /* position de reprise : le premier verset encore masqué, vers le haut de l'écran */
  function revPosition() {
    const m = $('#body .verse-seg.masked');
    if (!m) return;
    const body = $('#body');
    body.scrollTop += m.getClientRects()[0].top - body.getBoundingClientRect().top - body.clientHeight * 0.35;
  }

  // ── Écran statistiques ──────────────────────────────────
  function statsHTML() {
    const totals = liveTotals();
    const learned = learnedCount();
    const inProg = Object.values(state.statuses).filter((x) => x === 'p').length;
    const tv = QURAN.surahs.reduce((a, s) => a + s.verses.length, 0);
    const lv = QURAN.surahs.reduce((a, s) => a + (state.statuses[s.n] === 'l' ? s.verses.length : 0), 0);
    const pct = lv ? Math.max(1, Math.round(lv / tv * 100)) : 0;
    const totalSec = Object.values(totals).reduce((a, b) => a + b, 0);
    const streak = streakOf(totals);
    const best = Math.max(state.best, streak);
    const week = last7(totals);
    const weekSec = week.reduce((a, d) => a + d.sec, 0);
    const goalSec = state.goalMin * 60;
    const cap = Math.max(goalSec, ...week.map((d) => d.sec));
    const H = 62;

    const bars = week.map((d, i) =>
      '<div class="wbar' + (i === 6 ? ' today' : '') + (d.sec === 0 ? ' zero' : '') + (d.sec >= goalSec ? ' met' : '') +
        '" role="img" aria-label="' + esc(shortDate(d.date) + COLON() + (d.sec ? fmtDur(d.sec) : t().noReadDay)) + '">' +
        '<div class="wbar-track"><i class="wgoal" style="bottom:' + (goalSec / cap * H).toFixed(1) + 'px"></i>' +
        '<div class="wbar-fill" style="height:' + (d.sec ? Math.max(5, d.sec / cap * H) : 3).toFixed(1) + 'px"></div></div>' +
        '<span class="wbar-day" aria-hidden="true">' + esc(barDay(d.date)) + '</span>' +
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
    const histWeeks = weeks.map((w, i) =>
      '<div class="hist-row"><span class="hist-when">' + esc(i === 0 ? t().thisWeek : t().weekOf(dayMonth(w.start))) + '</span>' +
      '<span class="hist-val">' + fmtDur(w.sec) + '</span></div>'
    ).join('');

    const durBig = (sec) => {
      const tm = Math.floor(sec / 60), h = Math.floor(tm / 60), m = tm % 60;
      return h > 0
        ? '<div class="big-num"><b>' + nb(h) + '</b><small>' + t().hoursMins(h, m) + '</small></div>'
        : '<div class="big-num"><b>' + nb(m) + '</b><small>' + t().minsOnly(m) + '</small></div>';
    };

    return '<section class="fade">' +
      '<div class="scr-head"><h1 class="scr-title">' + t().statsTitle + '</h1>' +
      '<div class="scr-sub">' + t().statsSub + '</div></div>' +
      '<div class="stats-grid">' +
        '<div class="big-stat">' +
          '<div class="big-cap">' + t().learnedCap + '</div>' +
          '<div class="big-num"><b>' + num(learned) + '</b><small>' + t().of114(114) + '</small></div>' +
          '<div class="progress-track"><div class="progress-fill" style="width:' + (lv / tv * 100).toFixed(2) + '%"></div></div>' +
          '<div class="big-foot">' + t().versesShare(lv, tv, pct) + (inProg ? SEP() + t().inProgress(inProg) : '') + '</div>' +
        '</div>' +
        '<div class="big-stat">' +
          '<div class="big-cap">' + t().totalCap + '</div>' + durBig(totalSec) +
        '</div>' +
        '<div class="big-stat">' +
          '<div class="big-cap">' + t().streakCap + '</div>' +
          '<div class="big-num"><b>' + nb(streak) + '</b><small>' + t().streakSub(streak, best) + '</small></div>' +
        '</div>' +
        '<div class="big-stat">' +
          '<div class="big-cap">' + t().weekCap + '</div>' + durBig(weekSec) +
          '<div class="week-bars">' + bars + '</div>' +
          '<div class="big-foot"><i class="wgoal-key"></i>' + t().goalLine + SEP() + fmtDur(goalSec) + '</div>' +
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
    return '<div class="seg" role="group">' + options.map((o) =>
      '<button class="seg-btn' + (o.on ? ' on' : '') + '" data-action="' + action + '" data-v="' + o.v + '" aria-pressed="' + !!o.on + '"' +
        (o.lang ? ' lang="' + o.lang + '"' : '') + '>' + esc(o.label) + '</button>'
    ).join('') + '</div>';
  }
  function stepperHTML(dec, inc, decLabel, incLabel, valHTML) {
    return '<div class="goal-ctrl">' +
      '<button class="goal-btn" data-action="' + dec + '" aria-label="' + esc(decLabel) + '"><span aria-hidden="true">−</span></button>' +
      '<span class="goal-val">' + valHTML + '</span>' +
      '<button class="goal-btn" data-action="' + inc + '" aria-label="' + esc(incLabel) + '"><span aria-hidden="true">+</span></button>' +
    '</div>';
  }
  const goalValHTML = () => num(state.goalMin) + '<small>' + t().goalUnit(state.goalMin) + '</small>';
  const qsValHTML = () => num(qsLevel()) + '<small>/ ' + num(QS_LEVELS) + '</small>';

  function actionRowHTML(action, label, glyph, note) {
    return '<div class="set-row act" data-action="' + action + '" role="button" tabindex="0" aria-label="' + esc(label) + '">' +
      '<span class="set-label">' + label + (note ? '<span class="set-note">' + note + '</span>' : '') + '</span>' +
      '<span class="set-btn" aria-hidden="true">' + glyph + '</span></div>';
  }

  function settingsHTML() {
    const exportNote = t().exportNote + (state.lastExport ? '<br>' + esc(t().lastExport(dayMonth(new Date(state.lastExport)))) : '');
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
              { v: 'ar', label: 'العربية', on: isAr(), lang: 'ar' },
              { v: 'fr', label: 'Français', on: !isAr(), lang: 'fr' }
            ]) + '</div>' +
        '</div>' +

        '<div class="big-stat">' +
          '<div class="big-cap">' + t().grpReading + '</div>' +
          '<div class="set-row"><span class="set-label">' + t().goalCap + '</span>' +
            stepperHTML('goal-dec', 'goal-inc', t().goalDec, t().goalInc, goalValHTML()) + '</div>' +
          '<div class="set-row no-line"><span class="set-label">' + t().textSize + '</span>' +
            stepperHTML('qs-dec', 'qs-inc', t().qsDec, t().qsInc, qsValHTML()) + '</div>' +
          '<div class="reader-text qs-preview" lang="ar" dir="rtl" aria-hidden="true">' + bismillahHTML() + '</div>' +
          '<div class="set-row"><span class="set-label">' + t().tajRow + '</span>' +
            segHTML('set-taj', [
              { v: 'off', label: t().tajOff, on: !state.tajweed },
              { v: 'on', label: t().tajOn, on: state.tajweed }
            ]) + '</div>' +
          (state.tajweed
            ? '<div class="tj-legend">' + ['m2', 'm4', 'm6', 'gh', 'ql', 'sl'].map((g) =>
                '<span class="tj-key"><i class="tj-dot tj-' + g + '"></i><span>' + esc(t().tajLegend[g]) + '</span></span>').join('') + '</div>' +
              '<div class="set-note tj-note">' + t().tajNote + '</div>'
            : '') +
        '</div>' +

        '<div class="big-stat">' +
          '<div class="big-cap">' + t().grpData + '</div>' +
          actionRowHTML('export-data', t().exportBtn, '⤓', exportNote) +
          actionRowHTML('import-data', t().importBtn, '⤒', '') +
          '<input type="file" id="import-file" class="file-hidden" accept="application/json,.json" tabindex="-1" aria-hidden="true">' +
          '<div class="set-row"><span class="set-label">' + t().resetBtn + '<span class="set-note" id="reset-note">' + t().resetNote + '</span></span>' +
            '<button class="set-btn danger" data-action="reset-data" aria-label="' + esc(t().resetBtn) + '"><span aria-hidden="true">✕</span></button></div>' +
        '</div>' +

        '<div class="big-stat">' +
          '<div class="big-cap">' + t().grpApp + '</div>' +
          actionRowHTML('check-update', t().updBtn, '↻', '') +
          '<div class="upd-status" id="upd-status" role="status" aria-live="polite"></div>' +
          '<div class="set-row"><span class="set-label">' + t().versionRow + '</span>' +
            '<span class="set-value">' + num(APP_VERSION) + '</span></div>' +
        '</div>' +

      '</div>' +
      '<div class="attribution">' + t().attribution + '</div>' +
    '</section>';
  }

  // ── Export / import / reset ─────────────────────────────
  function downloadJson(json, name) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  function exportDone() {
    state.lastExport = Date.now();
    save();
    toast(t().exportOk);
    if (state.tab === 'settings') renderBody(true);
  }
  function exportData() {
    const live = state.runningSince ? splitByDay(state.runningSince, Date.now()) : [];
    const payload = Object.assign(
      { _app: 'wird', _version: APP_VERSION, _exported: new Date().toISOString() },
      state, { runningSince: null, tab: 'home', reader: null, rev: null, sessions: state.sessions.concat(live) });
    const json = JSON.stringify(payload, null, 2);
    const name = 'wird-' + dayKey(new Date()) + '.json';
    let file = null;
    try { file = new File([json], name, { type: 'application/json' }); } catch (e) { /* ancien WebKit */ }
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: name })
        .then(exportDone)
        .catch((e) => { if (e && e.name === 'NotAllowedError') { downloadJson(json, name); exportDone(); } });
      return;
    }
    downloadJson(json, name);
    exportDone();
  }

  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  function importData(fileObj) {
    fileObj.text().then((txt) => {
      let obj;
      try { obj = JSON.parse(txt); } catch (e) { toast(t().importBad); return; }
      if (!obj || typeof obj !== 'object' || obj._app !== 'wird' ||
          typeof obj.statuses !== 'object' || !obj.statuses || !Array.isArray(obj.sessions)) {
        toast(t().importBad);
        return;
      }
      const sessions = obj.sessions
        .filter((s) => s && DATE_RE.test(s.d) && dayKey(new Date(s.d + 'T12:00:00')) === s.d && Number(s.s) > 0)
        .map((s) => ({ d: s.d, t: Number(s.t) || 0, s: Math.floor(Number(s.s)) }));
      const statuses = {};
      for (const k of Object.keys(obj.statuses)) {
        const n = Number(k);
        if (n >= 1 && n <= 114 && (obj.statuses[k] === 'l' || obj.statuses[k] === 'p')) statuses[n] = obj.statuses[k];
      }
      const numMap = (src, ok) => {
        const out = {};
        if (src && typeof src === 'object') {
          for (const k of Object.keys(src)) {
            const n = Number(k), v = Number(src[k]);
            if (n >= 1 && n <= 114 && ok(v)) out[n] = v;
          }
        }
        return out;
      };
      const nL = Object.values(statuses).filter((x) => x === 'l').length;
      const when = typeof obj._exported === 'string' && !isNaN(new Date(obj._exported))
        ? dayMonth(new Date(obj._exported)) : '';
      if (!window.confirm(t().importConfirm(sessions.length, nL, when))) return;

      const backup = JSON.stringify(state);
      const prev = state;
      state = Object.assign(freshState(), {
        statuses, sessions,
        lastReviewed: numMap(obj.lastReviewed, (v) => v > 0),
        revCursor: numMap(obj.revCursor, (v) => v >= 1),   // borné ci-dessous par la longueur de chaque sourate
        bookmark: (obj.bookmark && Number(obj.bookmark.surah) >= 1 && Number(obj.bookmark.surah) <= 114)
          ? { surah: Number(obj.bookmark.surah), verse: Math.max(1, Number(obj.bookmark.verse) || 1) } : null,
        best: Number(obj.best) || 0,
        goalMin: Number(obj.goalMin) ? Math.min(GOAL_MAX, Math.max(GOAL_MIN, Number(obj.goalMin))) : prev.goalMin,
        quranScale: Number(obj.quranScale) || prev.quranScale,
        tajweed: typeof obj.tajweed === 'boolean' ? obj.tajweed : prev.tajweed,
        theme: (obj.theme === 'cream' || obj.theme === 'night') ? obj.theme : prev.theme,
        lang: (obj.lang === 'fr' || obj.lang === 'ar') ? obj.lang : prev.lang,
        lastExport: prev.lastExport,
        runningSince: prev.runningSince,
        tab: 'settings'
      });
      if (state.bookmark) {
        const len = QURAN.surahs[state.bookmark.surah - 1].verses.length;
        state.bookmark.verse = Math.min(state.bookmark.verse, len);
      }
      for (const k of Object.keys(state.revCursor)) {
        if (state.revCursor[k] > QURAN.surahs[k - 1].verses.length) delete state.revCursor[k];
      }
      readerPx = null;
      normalizeQuranScale();
      save();
      if (state.tajweed && !TAJ) loadTajweed().catch(() => {});
      revSession = null;
      render(true);
      toast(t().importOk, { actions: [{ label: t().undo, fn: () => restoreBackup(backup) }], duration: 8000 });
    }).catch(() => toast(t().importBad));
  }
  function restoreBackup(json) {
    try {
      state = Object.assign(freshState(), JSON.parse(json), { tab: state.tab });
      normalizeQuranScale();
      save();
      revSession = null;
      readerPx = null;
      restoreRev();
      render(true);
      tick();
    } catch (e) { /* ignore */ }
  }

  function resetData(btn) {
    const note = $('#reset-note');
    if (!resetArmed) {
      resetArmed = true;
      resetArmedAt = Date.now();
      btn.classList.add('armed');
      btn.setAttribute('aria-label', t().resetConfirm);
      // la note garde sa hauteur : le bouton ne bouge pas sous le doigt
      if (note) { note.style.minHeight = note.offsetHeight + 'px'; note.textContent = t().resetConfirm; note.classList.add('warn'); }
      clearTimeout(resetTimer);
      resetTimer = setTimeout(disarmReset, 5000);
      return;
    }
    if (Date.now() - resetArmedAt < 700) return;   // double-tap accidentel : on attend un vrai second geste
    clearTimeout(resetTimer);
    resetArmed = false;
    const backup = JSON.stringify(state);
    state = Object.assign(freshState(), {
      theme: state.theme, lang: state.lang, goalMin: state.goalMin, quranScale: state.quranScale,
      tajweed: state.tajweed, lastExport: state.lastExport, runningSince: state.runningSince, tab: 'settings'
    });
    save();
    revSession = null;
    render(true);
    toast(t().resetDone, { actions: [{ label: t().undo, fn: () => restoreBackup(backup) }], duration: 8000 });
  }
  function disarmReset() {
    resetArmed = false;
    clearTimeout(resetTimer);
    const btn = $('[data-action="reset-data"]');
    if (btn) { btn.classList.remove('armed'); btn.setAttribute('aria-label', t().resetBtn); }
    const note = $('#reset-note');
    if (note) { note.textContent = t().resetNote; note.classList.remove('warn'); note.style.minHeight = ''; }
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
        // un nouveau service worker a été trouvé : il s'installera et le bandeau le signalera
        if (reg && (reg.installing || reg.waiting)) {
          setUpdStatus(t().updInstalling);
          navigator.serviceWorker.addEventListener('controllerchange', () => location.reload(), { once: true });
          return;
        }
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
      if (e.data.ok && e.data.changed) {
        setUpdStatus(t().updReloading);
        setTimeout(() => location.reload(), 600);
      } else if (e.data.ok) {
        setUpdStatus(t().updLatest(APP_VERSION));
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
    toastActs = opts.actions || [];
    const el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    el.dataset.action = 'dismiss-toast'; // un tap hors des boutons referme le toast
    el.innerHTML = '<span class="toast-msg">' + esc(msg) + '</span>' +
      (toastActs.length ? '<span class="toast-acts">' + toastActs.map((a, i) =>
        '<button class="toast-btn' + (i ? ' ghost' : '') + '" data-action="toast-act" data-i="' + i + '">' + esc(a.label) + '</button>').join('') + '</span>' : '');
    $('#app').appendChild(el);
    announce(msg);
    requestAnimationFrame(() => el.classList.add('in'));
    if (!opts.sticky) {
      setTimeout(() => {
        if (!el.isConnected) return;
        el.classList.remove('in');
        setTimeout(() => el.remove(), 500);
      }, opts.duration || 3500);
    }
  }
  function closeToast() { const el = $('#toast'); if (el) el.remove(); toastActs = []; }
  function announce(msg) {
    const sr = $('#sr-status');
    if (!sr) return;
    sr.textContent = '';
    setTimeout(() => { sr.textContent = msg; }, 60);
  }

  // ── Chrome (topbar + tabbar) ────────────────────────────
  function showPill() { return !!state.runningSince && (state.tab !== 'home'); }
  function renderChrome() {
    $('#topbar').innerHTML =
      '<button class="top-btn" data-action="theme" aria-label="' + t().themeBtn + '">' +
        (state.theme === 'night' ? SUN_SVG : MOON_SVG) + '</button>' +
      (showPill()
        ? '<button class="top-btn run-pill" data-action="toggle-run" aria-label="' + esc(t().pillLabel) + '">' + STOP_SVG +
          '<span id="pill-clock">' + clockHTML(runningElapsed()) + '</span></button>'
        : '') +
      '<button class="top-btn" data-action="lang" lang="' + (isAr() ? 'fr' : 'ar') + '" aria-label="' + t().langBtn + '">' +
        (isAr() ? 'FR' : 'ع') + '</button>';

    $('#tabbar').innerHTML = ['home', 'surahs', 'review', 'stats', 'settings'].map((id) =>
      '<button class="tab' + (state.tab === id ? ' on' : '') + (id === 'home' && state.runningSince ? ' live' : '') +
        '" data-action="tab" data-tab="' + id + '"' + (state.tab === id ? ' aria-current="page"' : '') + '>' +
        TAB_ICONS[id] + '<span>' + t().tabs[id] + '</span></button>'
    ).join('');
  }

  function applyChrome() {
    document.documentElement.lang = state.lang;
    document.documentElement.dir = isAr() ? 'rtl' : 'ltr';
    document.documentElement.style.backgroundColor = THEME_COLOR[state.theme];
    const app = $('#app');
    app.dataset.theme = state.theme;
    app.style.setProperty('--qs', state.quranScale);
    app.classList.toggle('qs-big', qsLevel() >= 7);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = THEME_COLOR[state.theme];
  }

  // ── Rendu ───────────────────────────────────────────────
  function renderBody(noFade) {
    if (!QURAN) return;
    const body = $('#body');
    const html = { home: homeHTML, surahs: surahsHTML, review: reviewHTML, stats: statsHTML, settings: settingsHTML }[state.tab]();
    body.innerHTML = html;
    resetArmed = false;
    clearTimeout(resetTimer);
    drawArmed = false;
    clearTimeout(drawTimer);
    $('#app').classList.toggle('quran-screen', readerOpen() || (state.tab === 'review' && !!revSession));
    if (noFade) {
      body.querySelectorAll('.fade').forEach((el) => el.classList.add('in'));
    } else {
      setTimeout(() => body.querySelectorAll('.fade').forEach((el) => el.classList.add('in')), 30);
    }
    if (state.tab === 'home') startRing();
    if (readerOpen()) {
      observeReaderTitle();
      if (pendingVerse) {
        const pv = pendingVerse;
        pendingVerse = null;
        requestAnimationFrame(() => scrollToVerse(pv.v, pv.flash));
      }
    }
    syncWakeLock();
  }

  function render(noFade) {
    applyChrome();
    renderChrome();
    renderBody(noFade);
  }

  /* le nom de la sourate n'apparaît dans la barre du lecteur qu'une fois le titre défilé */
  let titleObs = null;
  function observeReaderTitle() {
    if (titleObs) titleObs.disconnect();
    const title = $('#reader-title'), name = $('.reader-bar-name');
    if (!title || !name || !('IntersectionObserver' in window)) { if (name) name.classList.add('show'); return; }
    const bar = $('.reader-bar');
    const hidden = Math.round(bar.getBoundingClientRect().bottom - $('#body').getBoundingClientRect().top);
    titleObs = new IntersectionObserver((entries) => {
      for (const e of entries) name.classList.toggle('show', !e.isIntersecting);
    }, { root: $('#body'), rootMargin: '-' + hidden + 'px 0px 0px 0px' });
    titleObs.observe(title);
  }

  // ── Écran allumé pendant la lecture et la révision ─────
  let wakeLock = null, wakePending = false;
  function wantWake() { return (readerOpen() || (state.tab === 'review' && !!revSession)) && document.visibilityState === 'visible'; }
  function syncWakeLock() {
    if (!('wakeLock' in navigator)) return;
    const want = wantWake();
    if (want && !wakeLock && !wakePending) {
      wakePending = true;
      navigator.wakeLock.request('screen').then((l) => {
        wakeLock = l;
        l.addEventListener('release', () => { if (wakeLock === l) wakeLock = null; });
        if (!wantWake()) syncWakeLock();
      }).catch(() => {}).then(() => { wakePending = false; });
    } else if (!want && wakeLock) {
      const l = wakeLock;
      wakeLock = null;
      l.release().catch(() => {});
    }
  }

  // ── Chrono ──────────────────────────────────────────────
  /* tick calé sur les secondes de la session (pas de retard ni de seconde doublée) */
  function tick() {
    clearTimeout(tickId);
    tickId = null;
    const today = dayKey(new Date());
    if (lastTickDay && lastTickDay !== today) {             // passage de minuit (ou retour le lendemain)
      if (state.tab === 'home') patchHome();
      else if (state.tab === 'stats') { const y = $('#body').scrollTop; renderBody(true); $('#body').scrollTop = y; }
    }
    lastTickDay = today;
    if (!state.runningSince) {
      prevTodaySec = null;
      tickId = setTimeout(tick, nextMidnight(Date.now()) - Date.now() + 1000);   // au repos : réveil à minuit
      return;
    }

    const totals = liveTotals();
    const ts = todaySec(totals);
    const pill = $('#pill-clock');
    if (pill) pill.innerHTML = clockHTML(runningElapsed());
    if (state.tab === 'home') {
      const clock = $('#clock');
      if (clock) clock.innerHTML = clockHTML(ts);
      const lb = $('#ring-label');
      if (lb && Date.now() >= savedUntil) { lb.textContent = t().sessionLbl(fmtClock(runningElapsed())); lb.classList.remove('ok'); }
      const goal = $('#ring-goal');
      if (goal) {
        goal.setAttribute('stroke-dashoffset', goalOffset(ts).toFixed(2));
        goal.setAttribute('class', goalClass(ts));
      }
      const m = Math.floor(ts / 60);
      const tm = $('#today-min');
      if (tm) tm.textContent = nb(m);
      const tu = $('#today-unit');
      if (tu) tu.textContent = t().minUnit(m);
      if (reducedMotion()) setRing(minuteFrac());
      else if (!ringRaf) startRing();
    } else if (state.tab === 'stats') {
      const m = Math.floor(runningElapsed() / 60);
      if (m !== lastStatsMin) {
        if (lastStatsMin !== -1) { const y = $('#body').scrollTop; renderBody(true); $('#body').scrollTop = y; }
        lastStatsMin = m;
      }
    }
    const goalSec = state.goalMin * 60;
    if (prevTodaySec !== null && prevTodaySec < goalSec && ts >= goalSec) toast(t().goalDone);
    prevTodaySec = ts;
    const ms = 1000 - ((Date.now() - state.runningSince) % 1000) + 15;
    tickId = setTimeout(tick, ms);
  }

  /* chrono oublié : on demande avant d'enregistrer des heures fantômes */
  function checkStaleRun() {
    if (!state.runningSince || runningElapsed() <= MAX_RUN_SEC) return false;
    toast(t().staleRun(fmtDur(runningElapsed())), {
      sticky: true,
      actions: [
        { label: t().keepSome, fn: () => {
          const m = parseInt(westNum(window.prompt(t().askMin, String(state.goalMin)) || ''), 10);
          if (m > 0) stopRun(true, state.runningSince + Math.min(m * 60, runningElapsed()) * 1000);
          else checkStaleRun();
        } },
        { label: t().keepAll, fn: () => stopRun(true) },
        { label: t().discardRun, fn: () => {
          const since = state.runningSince;
          state.runningSince = null;
          save();
          afterRunChange();
          toast(t().discarded, { duration: 8000, actions: [{ label: t().undo, fn: () => {
            state.runningSince = since; save(); afterRunChange(); checkStaleRun();
          } }] });
        } }
      ]
    });
    return true;
  }

  function afterRunChange() {
    renderChrome();
    if (state.tab === 'home') patchHome();
    else if (state.tab === 'stats') renderBody(true);
    tick();
  }

  /* endMs : fin retenue (chrono oublié, durée saisie) ; par défaut, maintenant */
  function stopRun(force, endMs) {
    if (!force && checkStaleRun()) return;
    const since = state.runningSince;
    const end = Math.min(endMs || Date.now(), Date.now());
    const sec = Math.max(0, Math.floor((end - since) / 1000));
    state.runningSince = null;
    if (sec < MIN_SESSION_SEC) {
      save();
      savedUntil = 0;
      afterRunChange();
      toast(t().tooShort);
      return;
    }
    const parts = splitByDay(since, since + sec * 1000);
    const prevBest = state.best;
    state.sessions.push(...parts);
    state.best = Math.max(state.best, streakOf(dayTotals()));
    save();
    savedText = t().saved(fmtDur(sec));
    savedUntil = Date.now() + 3200;
    setTimeout(() => { if (state.tab === 'home' && !state.runningSince) patchHome(); }, 3400);
    afterRunChange();
    toast(savedText, {
      duration: 6000,
      actions: [{ label: t().undo, fn: () => {
        state.sessions.splice(state.sessions.length - parts.length, parts.length);
        state.best = prevBest;
        savedUntil = 0;
        save();
        afterRunChange();
      } }]
    });
  }

  function toggleRun() {
    if (state.runningSince) { stopRun(false); return; }
    state.runningSince = Date.now();
    savedUntil = 0;
    save();
    closeToast();
    afterRunChange();
    announce(t().recordingSR);
  }

  /* met à jour la valeur d'un stepper sans re-rendre l'écran */
  function patchStepper(btn, html) {
    const row = btn.closest('.set-row');
    const val = row && row.querySelector('.goal-val');
    if (val) val.innerHTML = html;
    else renderBody(true);
  }

  // ── Statut des sourates ─────────────────────────────────
  function setSurahStatus(n, next, fromList) {
    const cur = state.statuses[n];
    if (next) state.statuses[n] = next; else delete state.statuses[n];
    save();
    const s = QURAN.surahs[n - 1];
    // mise à jour en place : la ligne ne saute pas et ne disparaît pas
    const row = $('#body [data-row="' + n + '"]');
    if (row) {
      const st = state.statuses[n] || '';
      row.querySelector('.num-badge').classList.toggle('on', st === 'l');
      const dot = row.querySelector('.status-dot');
      dot.className = 'status-dot ' + st;
      dot.innerHTML = st === 'l' ? CHECK_SVG : '';
      row.querySelector('.status-btn').setAttribute('aria-label', t().statusBtn(surahLabel(s), t().status[st || 'none']));
    }
    const sub = $('#learned-sub');
    if (sub) sub.textContent = t().surahsSub(learnedCount(), 114);
    const legend = $('.status-legend');
    if (legend && Object.keys(state.statuses).length) legend.remove();
    if (fromList && cur === 'l' && !next) {
      toast(t().statusChanged(surahLabel(s), t().status.none), {
        actions: [{ label: t().undo, fn: () => setSurahStatus(n, 'l', true) }]
      });
    }
  }
  function cycleSurah(n) {
    const cur = state.statuses[n];
    setSurahStatus(n, cur === 'l' ? undefined : cur === 'p' ? 'l' : 'p', true);
  }

  // ── Navigation ──────────────────────────────────────────
  function goTab(id) {
    const body = $('#body');
    if (id === state.tab) {
      if (body.scrollTop > 0) {
        // en douceur sur une courte distance ; instantané dans une longue sourate
        const far = body.scrollTop > 3 * body.clientHeight;
        body.scrollTo({ top: 0, behavior: reducedMotion() || far ? 'auto' : 'smooth' });
        return;
      }
      if (id === 'surahs' && state.reader) closeReader(true);
      return;
    }
    if (state.tab === 'review' && revSession) revScroll = body.scrollTop;
    if (readerOpen()) { state.reader.verse = currentReaderVerse(); readerPx = body.scrollTop; }
    const from = state.tab;
    state.tab = id;
    if (id === 'surahs' && !state.reader && from !== 'surahs') { query = ''; listScroll = null; }
    if (id === 'stats') lastStatsMin = -1;
    if (id !== 'review') drawArmed = false;
    save();
    renderChrome();
    const reopenVerse = id === 'surahs' && state.reader ? state.reader.verse : null;
    renderBody(true);
    if (id === 'surahs' && state.reader && readerPx !== null) { body.scrollTop = readerPx; readerPx = null; }   // retour exact
    else if (reopenVerse && reopenVerse > 1) scrollToVerse(reopenVerse, false);
    else if (id === 'review' && revSession) { if (revScroll) body.scrollTop = revScroll; else revPosition(); }
    else body.scrollTop = 0;
  }

  function restoreFocus(sel) {
    if (!sel) return;
    const a = document.activeElement;
    if (a && a !== document.body && a.isConnected) return;
    const x = document.querySelector(sel);
    if (x) x.focus();
  }
  function focusSelector(el) {
    if (!(el === document.activeElement || el.contains(document.activeElement))) return null;
    let sel = '[data-action="' + el.dataset.action + '"]';
    for (const k of ['tab', 'f', 'v', 'n']) if (el.dataset[k]) sel += '[data-' + k + '="' + el.dataset[k] + '"]';
    return sel;
  }

  // ── Événements ──────────────────────────────────────────
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const action = el.dataset.action;
    const refocus = focusSelector(el);
    switch (action) {
      case 'tab': goTab(el.dataset.tab); break;
      case 'toggle-run': toggleRun(); break;
      case 'cycle': cycleSurah(Number(el.dataset.n)); break;
      case 'filter': filter = el.dataset.f; renderBody(true); break;
      case 'sort-next':
        sortMode = { mushaf: 'length', length: 'status', status: 'mushaf' }[sortMode];
        renderBody(true);
        break;
      case 'clear-search': {
        query = '';
        const i = $('.search');
        if (i) { i.value = ''; i.focus(); }
        el.hidden = true;
        const l = $('#surah-list');
        if (l) l.innerHTML = surahListHTML();
        break;
      }
      case 'open-surah': openReader(Number(el.dataset.n)); break;
      case 'back-surahs': closeReader(); break;
      case 'mark-verse': {
        const n = readerSurah();
        if (!n) break;
        const v = Number(el.dataset.v);
        const prev = state.bookmark;
        if (prev && prev.surah === n && prev.verse === v) break;   // retoucher ne retire plus le signet
        state.bookmark = { surah: n, verse: v };
        save();
        document.querySelectorAll('#body .verse-seg.bookmarked').forEach((x) => { x.classList.remove('bookmarked'); x.removeAttribute('aria-current'); });
        el.classList.add('bookmarked');
        el.setAttribute('aria-current', 'true');
        refreshBmChip();
        const s = QURAN.surahs[n - 1];
        toast(t().bmSet(surahLabel(s), v), prev ? { actions: [{ label: t().undo, fn: () => {
          state.bookmark = prev;
          save();
          document.querySelectorAll('#body .verse-seg.bookmarked').forEach((x) => { x.classList.remove('bookmarked'); x.removeAttribute('aria-current'); });
          if (prev.surah === readerSurah()) {
            const seg = $('#body .reader-text [data-v="' + prev.verse + '"]');
            if (seg) { seg.classList.add('bookmarked'); seg.setAttribute('aria-current', 'true'); }
          }
          refreshBmChip();
        } }] } : {});
        break;
      }
      case 'goto-bookmark':
        if (state.bookmark && state.bookmark.surah === readerSurah()) scrollToVerse(state.bookmark.verse, true);
        break;
      case 'resume':
        if (state.bookmark) openReader(state.bookmark.surah, state.bookmark.verse, true);
        break;
      case 'clear-bookmark': {
        const prev = state.bookmark;
        state.bookmark = null;
        save();
        const card = $('.resume-card');
        if (card) card.remove();
        toast(t().resumeClear, { actions: [{ label: t().undo, fn: () => { state.bookmark = prev; save(); if (state.tab === 'home') renderBody(true); } }] });
        break;
      }
      case 'set-status': {
        const n = readerSurah();
        if (!n) break;
        setSurahStatus(n, el.dataset.v === 'none' ? undefined : el.dataset.v, false);
        el.parentNode.querySelectorAll('.seg-btn').forEach((b) => {
          b.classList.toggle('on', b === el);
          b.setAttribute('aria-pressed', String(b === el));
        });
        break;
      }
      case 'review-this': {
        const n = readerSurah();
        if (!n) break;
        const cur = currentReaderVerse();
        const bm = state.bookmark;
        const from = cur > 1 ? cur : (bm && bm.surah === n ? bm.verse : (state.revCursor[n] || 1));
        state.reader.verse = cur;
        readerPx = $('#body').scrollTop;
        const prevRev = revSession && !revComplete() && revDoneCount() > 1 && revSession.surah !== n ? revSession : null;
        revSession = makeSession(n, from, true);
        revScroll = 0;
        persistRev();
        if (prevRev) toast(t().revReplaced, { duration: 7000, actions: [{ label: t().undo, fn: () => {
          revSession = prevRev; revScroll = 0; persistRev(); if (state.tab === 'review') { renderBody(true); revPosition(); }
        } }] });
        state.tab = 'review';
        save();
        renderChrome();
        renderBody(true);
        $('#body').scrollTop = 0;
        break;
      }
      case 'draw': {
        if (armAbandon(el)) break;
        drawArmed = false;
        clearTimeout(drawTimer);
        drawSurah();
        renderBody(true);
        $('#body').scrollTop = 0;
        break;
      }
      case 'next-passage': {
        if (!revSession) break;
        const n = revSession.surah;
        revSession = makeSession(n, state.revCursor[n] || revSession.to + 1, revSession.manual);
        persistRev();
        renderBody(true);
        $('#body').scrollTop = 0;
        break;
      }
      case 'close-rev': {
        if (armAbandon(el)) break;
        const wasManual = revSession && revSession.manual;
        revSession = null;
        persistRev();
        if (wasManual && state.reader) {       // révision lancée depuis le lecteur : on y retourne
          state.tab = 'surahs';
          save();
          renderChrome();
          renderBody(true);
          if (readerPx !== null) { $('#body').scrollTop = readerPx; readerPx = null; } else scrollToVerse(state.reader.verse, false);
          break;
        }
        renderBody(true);
        $('#body').scrollTop = 0;
        break;
      }
      case 'reveal-verse': {
        if (!revSession) break;
        const v = Number(el.dataset.v);
        const s = QURAN.surahs[revSession.surah - 1];
        revSession.revealed[v - revSession.from] = true;
        el.classList.remove('masked');
        el.removeAttribute('data-action');
        el.removeAttribute('role');
        el.removeAttribute('tabindex');
        el.removeAttribute('aria-label');
        el.innerHTML = verseHTML(s.n, v, s.verses[v - 1]) + verseNumHTML(v);
        if (revComplete()) completeRev();
        persistRev();
        refreshRevBar();
        revealScroll(v);
        if (refocus) { const nx = $('#body .verse-seg.masked'); (nx || $('#rev-count')).focus({ preventScroll: true }); }
        break;
      }
      case 'reveal-all': {
        if (!revSession) break;
        const s = QURAN.surahs[revSession.surah - 1];
        const anchor = $('#rev-bar');
        const y0 = anchor ? anchor.getBoundingClientRect().top : 0;
        revSession.revealed = revSession.revealed.map(() => true);
        document.querySelectorAll('#body .verse-seg.masked').forEach((seg) => {
          const v = Number(seg.dataset.v);
          seg.classList.remove('masked');
          ['data-action', 'role', 'tabindex', 'aria-label'].forEach((a) => seg.removeAttribute(a));
          seg.innerHTML = verseHTML(s.n, v, s.verses[v - 1]) + verseNumHTML(v);
        });
        completeRev();
        persistRev();
        refreshRevBar();
        if (anchor) $('#body').scrollTop += anchor.getBoundingClientRect().top - y0;
        break;
      }
      case 'go-surahs':
        filter = 'all'; query = ''; sortMode = 'mushaf';
        state.tab = 'surahs'; state.reader = null; save(); renderChrome(); renderBody(true);
        $('#body').scrollTop = 0;
        break;
      case 'theme':
      case 'set-theme':
        state.theme = action === 'theme' ? (state.theme === 'night' ? 'cream' : 'night') : el.dataset.v;
        save();
        applyChrome();
        renderChrome();
        if (state.tab === 'settings') { const y = $('#body').scrollTop; renderBody(true); $('#body').scrollTop = y; }
        break;
      case 'lang':
      case 'set-lang': {
        const keepVerse = readerOpen() ? currentReaderVerse() : null;
        const y = $('#body').scrollTop;
        readerPx = null;
        state.lang = action === 'lang' ? (isAr() ? 'fr' : 'ar') : el.dataset.v;
        save();
        render(true);
        if (keepVerse) scrollToVerse(keepVerse, false);
        else $('#body').scrollTop = y;
        break;
      }
      case 'goal-dec':
      case 'goal-inc': {
        const d = action === 'goal-inc' ? GOAL_STEP : -GOAL_STEP;
        state.goalMin = Math.min(GOAL_MAX, Math.max(GOAL_MIN, state.goalMin + d));
        save();
        patchStepper(el, goalValHTML());
        break;
      }
      case 'qs-dec':
      case 'qs-inc':
        readerPx = null;
        setQsLevel(qsLevel() + (action === 'qs-inc' ? 1 : -1));
        save();
        applyChrome();
        patchStepper(el, qsValHTML());
        break;
      case 'set-taj': {
        state.tajweed = el.dataset.v === 'on';
        save();
        const y = $('#body').scrollTop;
        if (state.tajweed && !TAJ) {
          loadTajweed().then(() => { if (state.tab === 'settings') { const y2 = $('#body').scrollTop; renderBody(true); $('#body').scrollTop = y2; restoreFocus(refocus); } })
            .catch(() => {
              state.tajweed = false;
              save();
              if (state.tab === 'settings') renderBody(true);
              toast(t().tajFail);
            });
        }
        renderBody(true);
        $('#body').scrollTop = y;
        break;
      }
      case 'export-data': exportData(); break;
      case 'import-data': { const f = $('#import-file'); if (f) f.click(); break; }
      case 'reset-data': resetData(el); break;
      case 'check-update': checkUpdate(); break;
      case 'reload-app': location.reload(); break;
      case 'toast-act': {
        const a = toastActs[Number(el.dataset.i)];
        closeToast();
        if (a && a.fn) a.fn();
        break;
      }
      case 'dismiss-toast': closeToast(); break;
      case 'retry': boot(); break;
    }
    restoreFocus(refocus);
  });

  /* après une révélation : faire apparaître le prochain verset masqué s'il passe sous la barre */
  function revealScroll(v) {
    const cur = $('#body .verse-seg[data-v="' + v + '"]');
    const next = $('#body .verse-seg.masked[data-v="' + (v + 1) + '"]');
    const bar = $('#rev-bar');
    if (!cur || !next || !bar) return;
    const body = $('#body');
    const r = next.getClientRects()[0];
    const limit = bar.getBoundingClientRect().top - 20;
    if (!r || r.bottom <= limit) return;
    const topInset = body.getBoundingClientRect().top + parseFloat(getComputedStyle(body).paddingTop);
    // ne jamais faire sortir par le haut le début du verset qu'on vient de révéler
    const d = Math.min(r.bottom - limit + 40, cur.getClientRects()[0].top - topInset);
    if (d > 0) body.scrollBy({ top: d, behavior: reducedMotion() ? 'auto' : 'smooth' });
  }

  document.addEventListener('keydown', (e) => {
    const tg = e.target;
    if (!tg || !tg.matches) return;
    if (e.key === 'Enter' && tg.matches('[data-input="search"]')) {
      e.preventDefault();
      tg.blur();
      const rows = filteredSurahs();
      if (rows.length === 1) openReader(rows[0].n);
      return;
    }
    if (e.key === 'Enter' && tg.matches('[data-input="goto-verse"]')) {
      e.preventDefault();
      gotoVerse(tg);
      return;
    }
    if ((e.key === 'Enter' || e.key === ' ') && tg.matches('[role="button"][data-action]')) {
      e.preventDefault();
      tg.click();
    }
  });

  function gotoVerse(input) {
    const v = parseInt(westNum(input.value), 10);
    input.value = '';
    input.blur();
    const n = readerSurah();
    if (!n || !v) return;
    const len = QURAN.surahs[n - 1].verses.length;
    scrollToVerse(Math.min(Math.max(1, v), len), true);
  }

  document.addEventListener('input', (e) => {
    if (e.target.matches && e.target.matches('[data-input="search"]')) {
      query = e.target.value;
      const c = $('.search-clear');
      if (c) c.hidden = !query;
      const list = $('#surah-list');
      if (list) list.innerHTML = surahListHTML();
    }
  });

  document.addEventListener('change', (e) => {
    if (e.target.id === 'import-file' && e.target.files && e.target.files[0]) {
      importData(e.target.files[0]);
      e.target.value = '';
    } else if (e.target.matches && e.target.matches('[data-input="goto-verse"]') && e.target.value) {
      gotoVerse(e.target);
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (readerOpen()) state.reader.verse = currentReaderVerse();
      save();
    } else {
      if (state.tab === 'home') patchHome();
      renderChrome();
      tick();
      checkStaleRun();
    }
    syncWakeLock();
  });
  window.addEventListener('pagehide', () => {
    if (readerOpen()) state.reader.verse = currentReaderVerse();
    save();
  });

  const bodyEl = document.getElementById('body');
  bodyEl.addEventListener('scroll', trackReaderScroll, { passive: true });

  // ── Geste de retour (glisser vers l'extérieur dans le lecteur) ──
  let swipeStart = null;
  bodyEl.addEventListener('touchstart', (e) => {
    swipeStart = e.touches.length === 1 && !(e.target.closest && e.target.closest('input'))
      ? { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() }
      : null;
  }, { passive: true });
  bodyEl.addEventListener('touchend', (e) => {
    if (!swipeStart || !e.changedTouches.length) return;
    const dx = e.changedTouches[0].clientX - swipeStart.x;
    const dy = e.changedTouches[0].clientY - swipeStart.y;
    const dt = Date.now() - swipeStart.t;
    swipeStart = null;
    // geste franchement horizontal uniquement (une diagonale en lisant ne ferme rien)
    if (dt > 700 || Math.abs(dx) < 80 || Math.abs(dy) > 40 || Math.abs(dx) < 3 * Math.abs(dy)) return;
    const back = isAr() ? dx < 0 : dx > 0;       // sens du « retour » iOS selon la direction d'écriture
    if (back && readerOpen()) closeReader();
  }, { passive: true });

  // ── Démarrage ───────────────────────────────────────────
  /* métadonnées de sourates (pas le texte coranique) : graphies corrigées */
  const NAME_FIX = {
    3: { fr: 'La famille d’Imran' }, 30: { fr: 'Les Romains' }, 21: { tr: 'Al-Anbiya' },
    14: { name: 'إبراهيم' }, 76: { name: 'الإنسان' }, 82: { name: 'الانفطار' }, 84: { name: 'الانشقاق' }
  };
  function prepareData(data) {
    for (const s of data.surahs) {
      Object.assign(s, NAME_FIX[s.n] || {});
      s.fr = s.fr.replace(/'/g, '’');
      s.tr = s.tr.replace(/'/g, '’');
      /* Affichage uniquement : la police KFGQPC n'a pas de glyphe combinant pour
         U+06ED (petit mîm bas) et dessine un cercle pointillé. Après une kasra,
         U+06E2 y est positionné sous la lettre, comme dans le Mushaf de Médine.
         Même longueur : les indices du tajwid restent valides. */
      s.verses = s.verses.map((v) => v.replace(/ِۭ/g, 'ِۢ'));
    }
    return data;
  }

  function boot() {
    normalizeQuranScale();
    applyChrome();
    renderChrome();
    if (navigator.storage && navigator.storage.persist) {
      navigator.storage.persisted().then((p) => p || navigator.storage.persist()).catch(() => {});
    }
    fetch('data/quran.json')
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then((data) => {
        QURAN = prepareData(data);
        if (state.reader && !QURAN.surahs[state.reader.surah - 1]) state.reader = null;
        restoreRev();
        if (state.tab === 'surahs' && state.reader) {
          readerFrom = 'surahs';
          pendingVerse = state.reader.verse > 1 ? { v: state.reader.verse, flash: false } : null;
        }
        renderBody();
        if (state.tab === 'review' && revSession) {
          const pos = () => revPosition();
          if (document.fonts && document.fonts.ready) document.fonts.ready.then(pos); else pos();
        }
        lastTickDay = dayKey(new Date());
        tick();
        checkStaleRun();
        if (state.tajweed) {
          loadTajweed().then(() => {
            if (readerOpen() || (state.tab === 'review' && revSession) || state.tab === 'settings') {
              const y = $('#body').scrollTop;
              renderBody(true);
              $('#body').scrollTop = y;
            }
          }).catch(() => {});
        }
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
          // au tout premier install il n'y a pas encore de contrôleur : ce n'est pas une mise à jour
          const isUpdate = !!navigator.serviceWorker.controller;
          const w = reg.installing;
          if (!w || !isUpdate) return;
          w.addEventListener('statechange', () => {
            if (w.state === 'activated') {
              toast(t().updateReady, { sticky: true, actions: [{ label: t().updateBtn, fn: () => location.reload() }] });
            }
          });
        });
      }).catch(() => { /* hors https / non supporté */ });
    });
  }
})();

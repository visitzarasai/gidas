/* ════════════════════════════════════════════════════════════════
   Zarasų krašto gidas — shared client logic
   Used by index.html (landing) and map.html (viewer)
   Loaded BEFORE the page-specific <script> blocks.
   ════════════════════════════════════════════════════════════════ */
'use strict';

// ── LANGUAGE CONSTANTS ───────────────────────────────────────
const ALL_LANGS   = ['lt', 'lv', 'en', 'de', 'pl', 'ru'];
const LANG_LABELS = {
  lt: 'Lietuvių',
  lv: 'Latviešu',
  en: 'English',
  de: 'Deutsch',
  pl: 'Polski',
  ru: 'Русский',
};

// ── UI STRINGS (page chrome translations) ────────────────────
// All translatable UI text. Use t('key') to read. Always falls back to LT.
const UI_STRINGS = {
  lt: {
    loading:         'Kraunama...',
    error:           'Nepavyko įkelti duomenų',
    subtitle:        'Lankytinos vietos',
    back:            '← Atgal',
    close:           'Uždaryti',
    all:             'Visi',
    introTitle:      'Atraskite kraštą',
    introDesc:       'Pasirinkite kelionės kolekciją, kad pamatytumėte žemėlapį.',
    cardCta:         'Atidaryti žemėlapį →',
    noTranslation:   'Vertimas neprieinamas.',
    fallbackTooltip: 'Vertimas neprieinamas — rodomas tekstas',
    prev:            'Ankstesnis',
    next:            'Kitas',
  },
  lv: {
    loading:         'Notiek ielāde...',
    error:           'Neizdevās ielādēt datus',
    subtitle:        'Apskatāmās vietas',
    back:            '← Atpakaļ',
    close:           'Aizvērt',
    all:             'Visi',
    introTitle:      'Iepazīstiet reģionu',
    introDesc:       'Izvēlieties kolekciju, lai redzētu to kartē.',
    cardCta:         'Atvērt karti →',
    noTranslation:   'Tulkojums nav pieejams.',
    fallbackTooltip: 'Tulkojums nav pieejams — rādīts teksts',
    prev:            'Iepriekšējais',
    next:            'Nākamais',
  },
  en: {
    loading:         'Loading...',
    error:           'Failed to load data',
    subtitle:        'Places to visit',
    back:            '← Back',
    close:           'Close',
    all:             'All',
    introTitle:      'Discover the region',
    introDesc:       'Choose a collection to see it on the map.',
    cardCta:         'Open map →',
    noTranslation:   'No translation available.',
    fallbackTooltip: 'No translation available — showing text',
    prev:            'Previous',
    next:            'Next',
  },
  de: {
    loading:         'Wird geladen...',
    error:           'Daten konnten nicht geladen werden',
    subtitle:        'Sehenswürdigkeiten',
    back:            '← Zurück',
    close:           'Schließen',
    all:             'Alle',
    introTitle:      'Region entdecken',
    introDesc:       'Wählen Sie eine Sammlung, um sie auf der Karte zu sehen.',
    cardCta:         'Karte öffnen →',
    noTranslation:   'Keine Übersetzung verfügbar.',
    fallbackTooltip: 'Keine Übersetzung verfügbar — angezeigter Text',
    prev:            'Vorheriger',
    next:            'Nächster',
  },
  pl: {
    loading:         'Ładowanie...',
    error:           'Nie udało się załadować danych',
    subtitle:        'Miejsca do zwiedzania',
    back:            '← Wstecz',
    close:           'Zamknij',
    all:             'Wszystkie',
    introTitle:      'Odkryj region',
    introDesc:       'Wybierz kolekcję, aby zobaczyć ją na mapie.',
    cardCta:         'Otwórz mapę →',
    noTranslation:   'Brak tłumaczenia.',
    fallbackTooltip: 'Brak tłumaczenia — wyświetlany tekst',
    prev:            'Poprzedni',
    next:            'Następny',
  },
  ru: {
    loading:         'Загрузка...',
    error:           'Не удалось загрузить данные',
    subtitle:        'Места для посещения',
    back:            '← Назад',
    close:           'Закрыть',
    all:             'Все',
    introTitle:      'Откройте регион',
    introDesc:       'Выберите коллекцию, чтобы увидеть ее на карте.',
    cardCta:         'Открыть карту →',
    noTranslation:   'Перевод недоступен.',
    fallbackTooltip: 'Перевод недоступен — показан текст',
    prev:            'Предыдущий',
    next:            'Следующий',
  },
};

// Lookup helper. activeLang is set by each page; falls back to LT then to the key itself.
function t(key) {
  const lang = (typeof activeLang !== 'undefined' && activeLang) || 'lt';
  return (UI_STRINGS[lang] && UI_STRINGS[lang][key]) ||
         (UI_STRINGS.lt && UI_STRINGS.lt[key]) ||
         key;
}

// Apply translations to every element marked with data-t="key".
// For elements that should also localize their title/aria-label, use data-t-title="key" too.
function applyTranslations() {
  document.querySelectorAll('[data-t]').forEach(el => {
    el.textContent = t(el.dataset.t);
  });
  document.querySelectorAll('[data-t-title]').forEach(el => {
    const val = t(el.dataset.tTitle);
    el.title = val;
    if (el.hasAttribute('aria-label')) el.setAttribute('aria-label', val);
  });
}

// ── HTML ESCAPING (XSS-safe interpolation into innerHTML) ────
function esc(str) {
  const d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}

// ── LANGUAGE DROPDOWN ────────────────────────────────────────
// Open/close
function toggleLangDropdown() {
  document.getElementById('lang-btn').classList.toggle('open');
  document.getElementById('lang-dropdown').classList.toggle('open');
}
function closeLangDropdown() {
  document.getElementById('lang-btn').classList.remove('open');
  document.getElementById('lang-dropdown').classList.remove('open');
}

// Build the dropdown's option rows. The page provides its current active
// lang and a callback to run when an option is clicked.
function buildLangDropdown(activeLang, onSelect) {
  const dd = document.getElementById('lang-dropdown');
  dd.innerHTML = '';
  ALL_LANGS.forEach(lang => {
    const opt = document.createElement('div');
    opt.className = 'lang-option' + (lang === activeLang ? ' active' : '');
    opt.dataset.lang = lang;
    opt.role = 'option';
    opt.innerHTML = '<span class="dot"></span><span>' + esc(LANG_LABELS[lang]) + '</span>';
    opt.onclick = () => onSelect(lang);
    dd.appendChild(opt);
  });
}

// Update header label to the language's display name.
function setLangLabel(lang) {
  document.getElementById('lang-label').textContent = LANG_LABELS[lang] || lang;
}

// Toggle the .active class on dropdown options to reflect the current pick.
function syncLangDropdownActive(lang) {
  document.querySelectorAll('.lang-option').forEach(o => {
    o.classList.toggle('active', o.dataset.lang === lang);
  });
}

// Persist the chosen language. Wrapped because sessionStorage can throw
// in private mode or when the host blocks storage.
function saveLang(lang) {
  try { sessionStorage.setItem('gidas-lang', lang); } catch (e) {}
}
function loadSavedLang() {
  try {
    const s = sessionStorage.getItem('gidas-lang');
    if (s && LANG_LABELS[s]) return s;
  } catch (e) {}
  return null;
}

// ── UI STATE TRANSITIONS ─────────────────────────────────────
function showApp() {
  document.getElementById('loading').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
}
function showError() {
  document.getElementById('loading').classList.add('hidden');
  document.getElementById('error').classList.remove('hidden');
}

// BikeSetup.Pro — shared nav renderer
// activePage: 'home' | 'calculators' | 'suspension' | 'guides'
// activeSubPage: optional, e.g. 'pressure', 'build-a-wheel', 'fit-basics'

// ── AUTO UNIT DETECTION ──
const IMPERIAL_COUNTRIES = new Set(['US', 'GB', 'MM', 'LR']);

async function detectUnits() {
  try {
    const cached = sessionStorage.getItem('bsp_units');
    if (cached) return cached;
    const ctrl = new AbortController();
    const tid = setTimeout(function() { ctrl.abort(); }, 3000);
    const res = await fetch('https://ipapi.co/json/', { signal: ctrl.signal });
    clearTimeout(tid);
    const data = await res.json();
    const country = (data.country_code || '').toUpperCase();
    const units = IMPERIAL_COUNTRIES.has(country) ? 'imperial' : 'metric';
    sessionStorage.setItem('bsp_units', units);
    sessionStorage.setItem('bsp_country', country);
    return units;
  } catch (e) { return 'metric'; }
}

function applyGuideUnits(units) {
  document.querySelectorAll('[data-metric]').forEach(function(el) {
    el.textContent = units === 'imperial' ? el.getAttribute('data-imperial') : el.getAttribute('data-metric');
  });
}

function applySelectUnits(units) {
  var target = units === 'imperial' ? 'lbs' : 'kg';
  document.querySelectorAll('select').forEach(function(sel) {
    var hasLbs = Array.from(sel.options).some(function(o) { return o.value === 'lbs'; });
    var hasKg  = Array.from(sel.options).some(function(o) { return o.value === 'kg'; });
    if (hasLbs && hasKg) sel.value = target;
  });
}

async function applyGeoUnits() {
  var units = await detectUnits();
  applySelectUnits(units);
  applyGuideUnits(units);
  document.dispatchEvent(new CustomEvent('unitsdetected', { detail: { units: units } }));
}

// ── NAV STRUCTURE ──
// Each top-level item has a label and grouped dropdown links.
function buildNav(activePage, activeSubPage) {
  var ap = activePage || '';
  var asp = activeSubPage || '';

  // Helper: build one dropdown link
  function link(href, label, tag, subKey) {
    var isActive = asp === subKey ? ' active' : '';
    var tagHtml = tag ? '<span class="nav-item-tag">' + tag + '</span>' : '';
    return '<a href="' + href + '" class="' + isActive + '">' + label + tagHtml + '</a>';
  }

  // Helper: build a labelled section inside a dropdown
  function section(sectionLabel, links) {
    return '<div class="nav-dropdown-section">' +
      '<div class="nav-dropdown-label">' + sectionLabel + '</div>' +
      links +
      '</div>';
  }

  // Helper: build a full nav-item with dropdown
  function navItem(label, dropdownHtml, isActive) {
    return '<div class="nav-item' + (isActive ? ' active-section' : '') + '">' +
      '<button class="nav-label">' + label + '<span class="nav-chevron">&#9660;</span></button>' +
      '<div class="nav-dropdown">' + dropdownHtml + '</div>' +
      '</div>';
  }

  // ── WHEELS & TIRES ──
  var wheelsActive = ap === 'calculators' || ['pressure','spoke','sealant','build-a-wheel','seat-tubeless','tubeless-conversion','true-a-wheel'].indexOf(asp) > -1;
  var wheelsDropdown =
    section('Calculators',
      link('/calculators.html#pressure',            'Tire Pressure',         'Calc', 'pressure') +
      link('/calculators.html#spoke',               'Spoke Tension',         'Calc', 'spoke') +
      link('/calculators.html#sealant',             'Tubeless Sealant',      'Calc', 'sealant')
    ) +
    section('Guides',
      link('/guides/build-a-wheel.html',            'Build a Wheel',         'Guide', 'build-a-wheel') +
      link('/guides/seat-tubeless-tire.html',       'Seat a Tubeless Tire',  'Guide', 'seat-tubeless') +
      link('/guides/tubeless-conversion.html',      'Tubeless Conversion',   'Guide', 'tubeless-conversion') +
      link('/guides/true-a-wheel.html',             'True a Wheel',          'Guide', 'true-a-wheel')
    );

  // ── SUSPENSION ──
  var suspActive = ap === 'suspension' || ['fork-setup','shock-setup','sag','suspension-setup'].indexOf(asp) > -1;
  var suspDropdown =
    section('Calculators',
      link('/suspension.html#fork',    'Fork Setup',              'Calc', 'fork-setup') +
      link('/suspension.html#shock',   'Rear Shock Setup',        'Calc', 'shock-setup') +
      link('/suspension.html#sag',     'Sag Calculator',          'Calc', 'sag') +
      link('/suspension.html#service', 'Service Intervals',       'Calc', 'service')
    ) +
    section('Guides',
      link('/guides/suspension-setup.html', 'MTB Suspension Setup', 'Guide', 'suspension-setup')
    );

  // ── FITNESS & PERFORMANCE ──
  var fitActive = ['gear','speed','power','climbing','fit-basics'].indexOf(asp) > -1;
  var fitDropdown =
    section('Calculators',
      link('/calculators.html#gear',     'Gear Ratio',            'Calc', 'gear') +
      link('/calculators.html#speed',    'Speed & Cadence',       'Calc', 'speed') +
      link('/calculators.html#power',    'Power & Watts',         'Calc', 'power') +
      link('/calculators.html#climbing', 'Climbing & VAM',        'Calc', 'climbing')
    ) +
    section('Guides',
      link('/guides/fit-basics.html',    'Bike Fit Basics',       'Guide', 'fit-basics')
    );

  // ── BRAKES ──
  var brakesActive = ['set-up-brakes'].indexOf(asp) > -1;
  var brakesDropdown =
    section('Guides',
      link('/guides/set-up-brakes.html', 'Disc Brake Bleed & Alignment', 'Guide', 'set-up-brakes')
    );

  return (
    '<a href="/index.html"' + (ap === 'home' ? ' class="active"' : '') + ' style="color:' + (ap==='home'?'#fff':'#888') + ';text-decoration:none;font-family:\'Barlow Condensed\',sans-serif;font-weight:700;font-size:.82rem;letter-spacing:.1em;text-transform:uppercase;padding:.5rem .7rem;border-radius:3px;transition:color .15s,background .15s;white-space:nowrap" onmouseover="this.style.color=\'#fff\';this.style.background=\'rgba(255,255,255,0.06)\'" onmouseout="this.style.color=\'' + (ap==='home'?'#fff':'#888') + '\';this.style.background=\'\'">Home</a>' +
    navItem('Wheels &amp; Tires', wheelsDropdown, wheelsActive) +
    navItem('Suspension',         suspDropdown,   suspActive) +
    navItem('Fitness &amp; Performance', fitDropdown, fitActive) +
    navItem('Brakes',             brakesDropdown, brakesActive) +
    '<a href="/calculators.html" class="btn-nav" style="background:#e8000d;color:#fff;padding:.45rem 1.1rem;margin-left:.4rem;border-radius:3px;text-decoration:none;font-family:\'Barlow Condensed\',sans-serif;font-weight:700;font-size:.82rem;letter-spacing:.1em;text-transform:uppercase;white-space:nowrap">All Calculators</a>'
  );
}

// ── NAV RENDERER ──
function renderSiteHeader(activePage, activeSubPage) {
  var header = document.getElementById('site-header');
  if (!header) return;

  header.innerHTML =
    '<a href="/index.html" class="header-logo">' +
    '<span class="wordmark">BikeSetup<span class="dot">.</span><span class="pro">PRO</span></span>' +
    '</a>' +
    '<button class="hamburger" id="hamburger" aria-label="Menu">' +
    '<span></span><span></span><span></span>' +
    '</button>' +
    '<nav class="site-nav" id="site-nav">' +
    buildNav(activePage, activeSubPage) +
    '</nav>';

  // Hamburger toggle
  document.getElementById('hamburger').addEventListener('click', function() {
    header.classList.toggle('nav-open');
  });

  // Dropdown toggle on click (for touch/mobile)
  document.querySelectorAll('.nav-item > .nav-label').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      var item = btn.closest('.nav-item');
      var wasOpen = item.classList.contains('open');
      document.querySelectorAll('.nav-item').forEach(function(i) { i.classList.remove('open'); });
      if (!wasOpen) item.classList.add('open');
    });
  });

  // Close dropdowns on outside click
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.nav-item')) {
      document.querySelectorAll('.nav-item').forEach(function(i) { i.classList.remove('open'); });
    }
  });

  applyGeoUnits();
}

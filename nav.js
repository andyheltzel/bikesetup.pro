// BikeSetup.Pro - shared nav renderer
// Call renderSiteHeader('home'|'calculators'|'suspension'|'guides') after DOM ready

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
  } catch (e) {
    return 'metric';
  }
}

// ── UNIT CONVERSION FOR GUIDE TEXT ──
// Converts tagged spans in guide pages: <span data-metric="VALUE UNIT" data-imperial="VALUE UNIT">
// Tags use data attributes so both values are always in the DOM and swapping is instant.
function applyGuideUnits(units) {
  document.querySelectorAll('[data-metric]').forEach(function(el) {
    var imperial = el.getAttribute('data-imperial');
    var metric   = el.getAttribute('data-metric');
    el.textContent = units === 'imperial' ? imperial : metric;
  });
}

// ── UNIT TOGGLE SELECTS (calculators) ──
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

// ── NAV RENDERER ──
function renderSiteHeader(activePage) {
  var header = document.getElementById('site-header');
  if (!header) return;
  header.innerHTML =
    '<a href="/index.html" class="header-logo">' +
    '<span class="wordmark">BikeSetup<span class="dot">.</span><span class="pro">PRO</span></span>' +
    '</a>' +
    '<button class="hamburger" id="hamburger" aria-label="Menu">' +
    '<span></span><span></span><span></span>' +
    '</button>' +
    '<nav class="site-nav">' +
    '<a href="/index.html"' + (activePage === 'home'        ? ' class="active"' : '') + '>Home</a>' +
    '<a href="/calculators.html"' + (activePage === 'calculators' ? ' class="active"' : '') + '>Calculators</a>' +
    '<a href="/suspension.html"' + (activePage === 'suspension'  ? ' class="active"' : '') + '>Suspension</a>' +
    '<a href="/guides/index.html"' + (activePage === 'guides'      ? ' class="active"' : '') + '>Guides</a>' +
    '<a href="/calculators.html" class="btn-nav">Open Calculator</a>' +
    '</nav>';
  document.getElementById('hamburger').addEventListener('click', function() {
    header.classList.toggle('nav-open');
  });
  applyGeoUnits();
}

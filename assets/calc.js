/* CalcCraftScope — calculator logic (runs in the browser; nothing is sent anywhere) */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var num = function (id) { var el = $(id); if (!el) return NaN; var v = String(el.value).replace(/,/g, '').trim(); return v === '' ? NaN : parseFloat(v); };
  var fmt = function (n, d) { if (!isFinite(n)) return '—'; d = d == null ? 2 : d; var s = n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: d }); return s === '-0' ? '0' : s; };
  var money = function (n) { return isFinite(n) ? n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'; };
  var set = function (id, html) { var el = $(id); if (el) el.innerHTML = html; };
  var bind = function (form, fn) { form.querySelectorAll('input,select').forEach(function (el) { el.addEventListener('input', fn); el.addEventListener('change', fn); }); fn(); };
  var parseDate = function (id) { var v = $(id) && $(id).value; if (!v) return null; var p = v.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); };
  var iso = function (d) { var m = d.getMonth() + 1, day = d.getDate(); return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (day < 10 ? '0' : '') + day; };
  var nice = function (d) { return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); };
  var DAY = 864e5;
  var daysBetween = function (a, b) { return Math.round((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / DAY); };
  var ymd = function (a, b) { // a <= b
    var y = b.getFullYear() - a.getFullYear(), m = b.getMonth() - a.getMonth(), d = b.getDate() - a.getDate();
    if (d < 0) { m--; d += new Date(b.getFullYear(), b.getMonth(), 0).getDate(); }
    if (m < 0) { y--; m += 12; }
    return { y: y, m: m, d: d };
  };
  var plural = function (n, w) { return fmt(n, 0) + ' ' + w + (n === 1 ? '' : 's'); };
  var addMonths = function (d, n) { var t = new Date(d.getFullYear(), d.getMonth() + n, 1); var last = new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate(); t.setDate(Math.min(d.getDate(), last)); return t; };

  // default dates = today
  document.querySelectorAll('input[type=date][data-today]').forEach(function (el) { if (!el.value) el.value = iso(new Date()); });

  var C = {
    'percentage-calculator': function () {
      var a = num('p1x'), b = num('p1y'); set('p1r', isFinite(a) && isFinite(b) ? fmt(a * b / 100, 6) : '—');
      var c = num('p2x'), d = num('p2y'); set('p2r', isFinite(c) && isFinite(d) && d !== 0 ? fmt(c / d * 100, 6) + '%' : '—');
      var e = num('p3x'), f = num('p3y'); set('p3r', isFinite(e) && isFinite(f) && e !== 0 ? ((f - e) / Math.abs(e) * 100 > 0 ? '+' : '') + fmt((f - e) / Math.abs(e) * 100, 4) + '%' : '—');
    },
    'percent-change-calculator': function () {
      var o = num('pc-old'), n = num('pc-new');
      if (!isFinite(o) || !isFinite(n) || o === 0) { set('pc-main', '—'); set('pc-detail', o === 0 ? 'Percent change from zero is undefined.' : ''); return; }
      var ch = (n - o) / Math.abs(o) * 100;
      set('pc-main', (ch > 0 ? '+' : '') + fmt(ch, 4) + '% ' + (ch > 0 ? 'increase' : ch < 0 ? 'decrease' : 'no change'));
      set('pc-detail', 'Difference: ' + (n - o > 0 ? '+' : '') + fmt(n - o, 6) + ' · Multiplier: ×' + fmt(n / o, 6));
    },
    'discount-calculator': function () {
      var p = num('d-price'), d1 = num('d-off') || 0, d2 = num('d-off2') || 0, t = num('d-tax') || 0;
      if (!isFinite(p)) { set('d-main', '—'); set('d-detail', ''); return; }
      var sale = p * (1 - d1 / 100) * (1 - d2 / 100), total = sale * (1 + t / 100), saved = p - sale, eff = p ? saved / p * 100 : 0;
      set('d-main', money(total));
      set('d-detail', 'You save ' + money(saved) + ' (' + fmt(eff, 2) + '% total discount) · Price after discount: ' + money(sale) + (t ? ' · Tax: ' + money(total - sale) : ''));
    },
    'tip-calculator': function () {
      var b = num('t-bill'), pct = num('t-pct'), n = Math.max(1, Math.round(num('t-people') || 1));
      if (!isFinite(b) || !isFinite(pct)) { set('t-main', '—'); set('t-detail', ''); return; }
      var tip = b * pct / 100, tot = b + tip;
      set('t-main', money(tot / n) + ' <small>per person</small>');
      set('t-detail', 'Tip: ' + money(tip) + ' · Total: ' + money(tot) + (n > 1 ? ' · Tip per person: ' + money(tip / n) : ''));
    },
    'rule-of-three-calculator': function () {
      var a = num('r-a'), b = num('r-b'), c = num('r-c'), inv = $('r-mode').value === 'inverse';
      var x = inv ? (a * b / c) : (b * c / a);
      set('r-main', isFinite(x) && (inv ? c : a) !== 0 ? 'X = ' + fmt(x, 6) : '—');
      set('r-detail', inv ? 'Inverse: X = A × B ÷ C' : 'Direct: X = B × C ÷ A');
    },
    'simple-interest-calculator': function () {
      var p = num('si-p'), r = num('si-r'), t = num('si-t'), unit = $('si-unit').value;
      var yrs = unit === 'months' ? t / 12 : unit === 'days' ? t / 365 : t;
      if (![p, r, t].every(isFinite)) { set('si-main', '—'); set('si-detail', ''); return; }
      var i = p * r / 100 * yrs;
      set('si-main', money(i) + ' <small>interest</small>');
      set('si-detail', 'Total amount: ' + money(p + i) + ' · Time used: ' + fmt(yrs, 4) + ' years' + (unit === 'days' ? ' (365-day year)' : ''));
    },
    'compound-interest-calculator': function () {
      var p = num('ci-p') || 0, pm = num('ci-pm') || 0, r = (num('ci-r') || 0) / 100, y = num('ci-y'), n = parseInt($('ci-n').value, 10);
      if (!isFinite(y) || y <= 0) { set('ci-main', '—'); set('ci-detail', ''); set('ci-table', ''); return; }
      var mr = Math.pow(1 + r / n, n / 12) - 1, months = Math.round(y * 12), bal = p, dep = p, rows = [];
      for (var k = 1; k <= months; k++) { bal = bal * (1 + mr) + pm; dep += pm; if (k % 12 === 0 || k === months) rows.push([Math.ceil(k / 12), dep, bal - dep, bal]); }
      set('ci-main', money(bal) + ' <small>after ' + fmt(y, 2) + ' years</small>');
      set('ci-detail', 'Total contributions: ' + money(dep) + ' · Interest earned: ' + money(bal - dep));
      set('ci-table', '<table><thead><tr><th>Year</th><th>Contributions</th><th>Interest</th><th>Balance</th></tr></thead><tbody>' + rows.map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + money(r[1]) + '</td><td>' + money(r[2]) + '</td><td>' + money(r[3]) + '</td></tr>'; }).join('') + '</tbody></table>');
    },
    'loan-calculator': function () {
      var P = num('l-p'), r = (num('l-r') || 0) / 100 / 12, t = num('l-t'), unit = $('l-unit').value;
      var n = Math.round(unit === 'years' ? t * 12 : t);
      if (!isFinite(P) || !(n > 0)) { set('l-main', '—'); set('l-detail', ''); set('l-table', ''); return; }
      var pay = r === 0 ? P / n : P * r / (1 - Math.pow(1 + r, -n)), bal = P, rows = [], totI = 0;
      for (var k = 1; k <= n; k++) { var it = bal * r, pr = pay - it; bal -= pr; totI += it; rows.push('<tr><td>' + k + '</td><td>' + money(pay) + '</td><td>' + money(pr) + '</td><td>' + money(it) + '</td><td>' + money(Math.max(0, bal)) + '</td></tr>'); }
      set('l-main', money(pay) + ' <small>per month</small>');
      set('l-detail', n + ' payments · Total interest: ' + money(totI) + ' · Total paid: ' + money(pay * n));
      set('l-table', '<table><thead><tr><th>#</th><th>Payment</th><th>Principal</th><th>Interest</th><th>Balance</th></tr></thead><tbody>' + rows.join('') + '</tbody></table>');
    },
    'age-calculator': function () {
      var b = parseDate('a-birth'), at = parseDate('a-at');
      if (!b || !at || at < b) { set('a-main', at && b && at < b ? 'The “as of” date is before the birth date.' : '—'); set('a-detail', ''); return; }
      var r = ymd(b, at), days = daysBetween(b, at);
      var next = new Date(at.getFullYear(), b.getMonth(), b.getDate()); if (b.getMonth() === 1 && b.getDate() === 29 && next.getMonth() !== 1) next = new Date(at.getFullYear(), 2, 1);
      if (next <= at) { next = new Date(at.getFullYear() + 1, b.getMonth(), b.getDate()); if (b.getMonth() === 1 && b.getDate() === 29 && next.getMonth() !== 1) next = new Date(at.getFullYear() + 1, 2, 1); }
      set('a-main', plural(r.y, 'year') + ', ' + plural(r.m, 'month') + ', ' + plural(r.d, 'day'));
      set('a-detail', 'Total: ' + fmt(days, 0) + ' days (' + fmt(Math.floor(days / 7), 0) + ' weeks and ' + (days % 7) + ' days) · Next birthday in ' + plural(daysBetween(at, next), 'day') + ', on ' + nice(next));
    },
    'date-difference-calculator': function () {
      var a = parseDate('dd-a'), b = parseDate('dd-b'), inc = $('dd-inc').checked;
      if (!a || !b) { set('dd-main', '—'); set('dd-detail', ''); return; }
      var neg = b < a; if (neg) { var tmp = a; a = b; b = tmp; }
      var days = daysBetween(a, b) + (inc ? 1 : 0), r = ymd(a, b), bd = 0;
      var end = inc ? new Date(b.getTime() + DAY) : b;
      for (var d = new Date(a); d < end; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) { var w = d.getDay(); if (w !== 0 && w !== 6) bd++; }
      set('dd-main', plural(days, 'day'));
      set('dd-detail', fmt(Math.floor(days / 7), 0) + ' weeks and ' + (days % 7) + ' days · ' + plural(r.y, 'year') + ', ' + plural(r.m, 'month') + ', ' + plural(r.d, 'day') + ' · Business days (Mon–Fri): ' + fmt(bd, 0) + (neg ? ' · (end date is before start date)' : ''));
    },
    'add-days-calculator': function () {
      var s = parseDate('ad-s'), n = num('ad-n'), unit = $('ad-unit').value, sign = $('ad-op').value === 'sub' ? -1 : 1;
      if (!s || !isFinite(n)) { set('ad-main', '—'); return; }
      var k = Math.round(n) * sign, r;
      if (unit === 'days') r = new Date(s.getFullYear(), s.getMonth(), s.getDate() + k);
      else if (unit === 'weeks') r = new Date(s.getFullYear(), s.getMonth(), s.getDate() + 7 * k);
      else if (unit === 'months') r = addMonths(s, k);
      else r = addMonths(s, 12 * k);
      set('ad-main', nice(r));
    }
  };

  // Unit converters
  var U = window.CCS_UNITS;
  var conv = function (type, v, from, to) {
    if (type === 'temperature') {
      var c = from === 'c' ? v : from === 'f' ? (v - 32) * 5 / 9 : v - 273.15;
      return to === 'c' ? c : to === 'f' ? c * 9 / 5 + 32 : c + 273.15;
    }
    var f = {}; U[type].units.forEach(function (u) { f[u[0]] = u[2]; });
    return v * f[from] / f[to];
  };
  document.querySelectorAll('form.calc[data-type]').forEach(function (form) {
    var typeSel = form.querySelector('.u-type'), fromSel = form.querySelector('.u-from'), toSel = form.querySelector('.u-to');
    var fill = function () {
      var t = typeSel ? typeSel.value : form.getAttribute('data-type');
      var opts = U[t].units.map(function (u) { return '<option value="' + u[0] + '">' + u[1] + '</option>'; }).join('');
      fromSel.innerHTML = opts; toSel.innerHTML = opts; toSel.selectedIndex = Math.min(1, U[t].units.length - 1);
      if (t === 'length') { fromSel.value = 'km'; toSel.value = 'mi'; } if (t === 'weight') { fromSel.value = 'kg'; toSel.value = 'lb'; }
      if (t === 'temperature') { fromSel.value = 'c'; toSel.value = 'f'; } if (t === 'volume') { fromSel.value = 'l'; toSel.value = 'gal'; }
      if (t === 'area') { fromSel.value = 'm2'; toSel.value = 'ft2'; } if (t === 'speed') { fromSel.value = 'kmh'; toSel.value = 'mph'; }
    };
    var run = function () {
      var t = typeSel ? typeSel.value : form.getAttribute('data-type'), v = parseFloat(String(form.querySelector('.u-val').value).replace(/,/g, ''));
      if (!isFinite(v)) { form.querySelector('.u-out').textContent = '—'; form.querySelector('.u-all').innerHTML = ''; return; }
      var r = conv(t, v, fromSel.value, toSel.value), name = function (k) { return U[t].units.filter(function (u) { return u[0] === k; })[0][1]; };
      form.querySelector('.u-out').textContent = fmt(v, 6) + ' ' + name(fromSel.value) + ' = ' + fmt(r, 6) + ' ' + name(toSel.value);
      form.querySelector('.u-all').innerHTML = U[t].units.filter(function (u) { return u[0] !== fromSel.value; }).map(function (u) { return '<li><span>' + u[1] + '</span><strong>' + fmt(conv(t, v, fromSel.value, u[0]), 6) + '</strong></li>'; }).join('');
    };
    if (typeSel) typeSel.addEventListener('change', function () { fill(); run(); });
    form.querySelector('.u-swap').addEventListener('click', function (e) { e.preventDefault(); var a = fromSel.value; fromSel.value = toSel.value; toSel.value = a; run(); });
    fill();
    form.querySelectorAll('input,select').forEach(function (el) { if (el === typeSel) return; el.addEventListener('input', run); el.addEventListener('change', run); });
    run();
  });

  document.querySelectorAll('form.calc[data-calc]').forEach(function (form) {
    var fn = C[form.getAttribute('data-calc')]; if (fn) bind(form, fn);
    form.addEventListener('submit', function (e) { e.preventDefault(); });
  });

  // Home search
  var s = $('calc-search');
  if (s) {
    var items = document.querySelectorAll('[data-search]'), empty = $('no-results');
    var go = function () { var q = s.value.trim().toLowerCase(), n = 0; items.forEach(function (it) { var hit = !q || it.getAttribute('data-search').indexOf(q) > -1; it.style.display = hit ? '' : 'none'; if (hit) n++; }); empty.style.display = n ? 'none' : 'block'; };
    s.addEventListener('input', go);
  }
})();

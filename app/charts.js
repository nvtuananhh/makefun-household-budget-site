// Hearth Ledger — hand-rolled SVG charts (no libraries, no network).
//
// Every chart is built as an SVG string from plain numbers: a donut for the
// spending mix, horizontal bars for budget-vs-actual and for the benchmark
// comparison, and a small line chart for income against spending across the
// months on file. Colours come from the category table in data.js.

export function money(n) {
  return '$' + Math.round(n).toLocaleString('en-US');
}

export function moneyCents(n) {
  return '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function polar(cx, cy, r, angleDeg) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

// Donut of category shares. `slices` is [{label, value, color}]; the centre
// shows the total. Returns an SVG string with a legend-free chart (the
// legend is rendered beside it by the caller).
export function donutChart(slices, total, size = 220) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 14;
  const inner = r - 30;
  let angle = 0;
  const parts = [];
  for (const s of slices) {
    if (s.value <= 0) continue;
    const sweep = (s.value / total) * 360;
    const [x1, y1] = polar(cx, cy, r, angle);
    const [x2, y2] = polar(cx, cy, r, angle + sweep);
    const [ix2, iy2] = polar(cx, cy, inner, angle + sweep);
    const [ix1, iy1] = polar(cx, cy, inner, angle);
    const large = sweep > 180 ? 1 : 0;
    parts.push(
      `<path d="M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} L ${ix2.toFixed(1)} ${iy2.toFixed(1)} A ${inner} ${inner} 0 ${large} 0 ${ix1.toFixed(1)} ${iy1.toFixed(1)} Z" fill="${s.color}"><title>${s.label}: ${money(s.value)}</title></path>`,
    );
    angle += sweep;
  }
  return `<svg viewBox="0 0 ${size} ${size}" role="img" aria-label="Spending by category, total ${money(total)}" class="chart-svg">${parts.join('')}
  <text x="${cx}" y="${cy - 6}" text-anchor="middle" class="donut-total">${money(total)}</text>
  <text x="${cx}" y="${cy + 16}" text-anchor="middle" class="donut-label">spent this month</text></svg>`;
}

// Horizontal bars: [{label, value, max, color, note}]. `max` scales the
// track; the note (e.g. "82% of budget") is printed at the end of the bar.
export function barChart(rows, opts = {}) {
  const unit = opts.unit || money;
  const bars = rows
    .map((row) => {
      const pct = row.max > 0 ? Math.min(100, (row.value / row.max) * 100) : 0;
      const over = row.value > row.max;
      return `<div class="bar-row">
      <div class="bar-head"><span class="bar-label"><span class="dot" style="background:${row.color}"></span>${row.label}</span>
      <span class="bar-value">${unit(row.value)}${row.note ? ` <span class="bar-note">${row.note}</span>` : ''}</span></div>
      <div class="bar-track"><div class="bar-fill${over ? ' over' : ''}" style="width:${pct.toFixed(1)}%;background:${row.color}"></div></div>
    </div>`;
    })
    .join('');
  return `<div class="bar-chart">${bars}</div>`;
}

// Income vs spending across months: two lines, income in green, spending
// in terracotta, with a dot and a label on each point.
export function lineChart(months, income, spending, width = 640, height = 220) {
  const padL = 56;
  const padR = 16;
  const padT = 18;
  const padB = 28;
  const maxV = Math.max(...income, ...spending) * 1.08;
  const x = (i) => padL + ((width - padL - padR) * i) / Math.max(1, months.length - 1);
  const y = (v) => padT + (height - padT - padB) * (1 - v / maxV);
  const points = (vals) => vals.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const grid = [0.25, 0.5, 0.75, 1].map((f) => {
    const gy = padT + (height - padT - padB) * (1 - f);
    return `<line x1="${padL}" y1="${gy.toFixed(1)}" x2="${width - padR}" y2="${gy.toFixed(1)}" class="grid-line"/><text x="${padL - 8}" y="${(gy + 4).toFixed(1)}" text-anchor="end" class="grid-label">${money(maxV * f)}</text>`;
  }).join('');
  const dots = (vals, color) =>
    vals.map((v, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="4.5" fill="${color}" stroke="#fff" stroke-width="1.5"><title>${months[i]}: ${money(v)}</title></circle>`).join('');
  const labels = months
    .map((m, i) => {
      const anchor = i === 0 ? 'start' : i === months.length - 1 ? 'end' : 'middle';
      const lx = i === 0 ? padL : i === months.length - 1 ? width - padR : x(i);
      return `<text x="${lx.toFixed(1)}" y="${height - 8}" text-anchor="${anchor}" class="grid-label">${m}</text>`;
    })
    .join('');
  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Income versus spending by month" class="chart-svg line-chart">${grid}
  <polyline points="${points(income)}" class="line-income"/>
  <polyline points="${points(spending)}" class="line-spending"/>
  ${dots(income, '#2e6b4f')}${dots(spending, '#b0483f')}${labels}</svg>`;
}

// A slim 50/30/20 stacked bar: three segments sized by share of take-home.
export function splitBar(needs, wants, saved, takeHome) {
  const seg = (value, cls, label) => {
    const pct = takeHome > 0 ? (value / takeHome) * 100 : 0;
    return `<div class="${cls}" style="width:${pct.toFixed(1)}%" title="${label}: ${money(value)} (${pct.toFixed(0)}%)"></div>`;
  };
  return `<div class="split-bar" role="img" aria-label="Needs ${money(needs)}, wants ${money(wants)}, saved ${money(saved)} of ${money(takeHome)} take-home pay">
  ${seg(needs, 'seg-needs', 'Needs')}${seg(wants, 'seg-wants', 'Wants')}${seg(saved, 'seg-saved', 'Saved')}</div>`;
}

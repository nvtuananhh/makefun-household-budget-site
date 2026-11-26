// Hearth Ledger — the pages. Each renderer takes the state and returns an
// HTML string for #view. Every figure comes from the ledger (data.js seed
// plus the household's own edits); nothing on a page is typed in by hand
// except the benchmark column, which is labelled with its BLS source.

import { BLS_SOURCE, CATEGORIES, HOUSEHOLD, MONTHS, categoryById } from './data.js';
import { barChart, donutChart, lineChart, money, moneyCents, splitBar } from './charts.js';
import { debtPayoff, emergencyFund, monthlyToGoal, split503020, targets503020 } from './calculators.js';
import { actualByCategory, monthIncome, monthLabel, monthSpending, monthTransactions } from './main.js';

// The household's "today" for due-date math: the last day of the seeded
// month, so the screenshots always show the same bills as due and overdue.
export const TODAY = '2026-11-29';
export const OPENING_BALANCE = 4280;

function esc(text) {
  return String(text ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function fmtDate(dateStr) {
  const [, m, d] = dateStr.split('-').map(Number);
  return `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m - 1]} ${d}`;
}

function pct(part, whole) {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}

function categoryOptions(selected) {
  return CATEGORIES.map((c) => `<option value="${c.id}"${c.id === selected ? ' selected' : ''}>${c.label}</option>`).join('');
}

function statCard(label, value, sub, tone = '') {
  return `<div class="stat-card ${tone}"><div class="stat-label">${label}</div><div class="stat-value">${value}</div><div class="stat-sub">${sub}</div></div>`;
}

// ---------------- Dashboard ----------------

export function renderDashboard(state) {
  const actual = actualByCategory(state, state.month);
  const spent = monthSpending(state, state.month);
  const income = monthIncome(state, state.month);
  const saved = income - spent;
  const rate = income > 0 ? (saved / income) * 100 : 0;
  const unpaid = state.bills.filter((b) => !b.paid);
  const unpaidTotal = unpaid.reduce((s, b) => s + b.amount, 0);

  const slices = CATEGORIES.map((c) => ({ label: c.label, value: actual[c.id], color: c.color }))
    .filter((s) => s.value > 0)
    .sort((a, b) => b.value - a.value);
  const topRows = slices.slice(0, 6).map((s) => ({
    label: s.label,
    value: s.value,
    max: Math.max(...slices.map((x) => x.value)),
    color: s.color,
    note: `${pct(s.value, spent)}%`,
  }));

  const months = MONTHS.map((m) => m.label.replace(' 2026', ''));
  const incomes = MONTHS.map((m) => monthIncome(state, m.id));
  const spendings = MONTHS.map((m) => monthSpending(state, m.id));

  const overruns = CATEGORIES.map((c) => ({ label: c.label, over: actual[c.id] - (state.budget[c.id] || 0) }))
    .filter((o) => o.over > 0)
    .sort((a, b) => b.over - a.over);
  const leakLine = overruns.length === 0
    ? 'Every category is inside its plan so far this month.'
    : `The leak to watch: ${overruns[0].label} is ${money(overruns[0].over)} over its plan so far.`;
  const upcoming = [...state.bills].sort((a, b) => a.dueDay - b.dueDay).slice(0, 5);
  const goals = state.goals.slice(0, 3);

  return `<section class="page-head">
    <div><h1>November at a glance</h1>
    <p class="lede">${esc(HOUSEHOLD.name)} — ${esc(HOUSEHOLD.members)}, ${esc(HOUSEHOLD.place)}. Every dollar below comes from the household's own ledger; the U.S. average column is the BLS Consumer Expenditure Survey 2024.</p></div>
  </section>
  <section class="stat-grid">
    ${statCard('Take-home pay', money(income), '2 paychecks · gross ' + money(HOUSEHOLD.grossMonthly) + '/mo')}
    ${statCard('Spent in ' + monthLabel(state.month).split(' ')[0], money(spent), 'U.S. average ' + money(6545) + '/mo', spent > 6545 ? 'warn' : 'good')}
    ${statCard('Saved', money(saved), rate.toFixed(1) + '% savings rate · plan 17.4%', rate >= 15 ? 'good' : 'warn')}
    ${statCard('Bills still to pay', money(unpaidTotal), unpaid.length + ' of ' + state.bills.length + ' bills unpaid', unpaidTotal > 0 ? 'warn' : 'good')}
  </section>
  <div class="two-col">
    <section class="card">
      <h2>Income vs spending — last 3 months</h2>
      <p class="card-sub">Take-home pay against what the household actually spent. September ran lean after back-to-school costs; November is tracking to save ${money(saved)}.</p>
      ${lineChart(months, incomes, spendings)}
      <div class="legend"><span><i class="swatch" style="background:#2e6b4f"></i>Take-home pay</span><span><i class="swatch" style="background:#b0483f"></i>Spending</span></div>
    </section>
    <section class="card">
      <h2>Where November's money went</h2>
      <p class="card-sub">Housing is a third of spending — close to the U.S. average share. ${leakLine}</p>
      <div class="donut-wrap">${donutChart(slices, spent)}
      <div class="donut-legend">${slices.slice(0, 7).map((s) => `<span><i class="swatch" style="background:${s.color}"></i>${s.label} · ${money(s.value)}</span>`).join('')}</div></div>
    </section>
  </div>
  <div class="two-col">
    <section class="card">
      <h2>Biggest categories</h2>
      ${barChart(topRows)}
      <p class="fineprint"><a href="#/spending">See all 14 categories vs the U.S. average →</a></p>
    </section>
    <section class="card">
      <h2>Coming up</h2>
      <ul class="bill-mini">${upcoming.map((b) => `<li><span class="bill-day">Nov ${b.dueDay}</span><span class="bill-name">${esc(b.name)}</span><span class="bill-amt">${money(b.amount)}</span><span class="pill ${b.paid ? 'paid' : 'due'}">${b.paid ? 'Paid' : 'Due'}</span></li>`).join('')}</ul>
      <p class="fineprint"><a href="#/bills">All bills &amp; due dates →</a></p>
      <h2 class="subhead">Savings goals</h2>
      ${goals.map((g) => `<div class="goal-mini"><div class="goal-mini-head"><span>${esc(g.name)}</span><span>${money(g.saved)} of ${money(g.target)}</span></div><div class="progress"><div style="width:${pct(g.saved, g.target)}%;background:${g.color}"></div></div></div>`).join('')}
      <p class="fineprint"><a href="#/goals">All savings goals →</a></p>
    </section>
  </div>
  <section class="card strip">
    <h2>How the Alvarez household compares to the average American household</h2>
    <p>U.S. average spending is ${money(6545)}/mo (BLS CES 2024). This household spends ${money(spent)}/mo — ${money(6545 - spent)} less — and saves ${money(saved)}/mo, a ${rate.toFixed(1)}% savings rate. The gap comes mostly from housing: rent of $1,650 vs the $2,189 average. <a href="#/planner">Check the 50/30/20 split →</a></p>
  </section>`;
}

// ---------------- Budget planner ----------------

export function renderBudget(state) {
  const actual = actualByCategory(state, state.month);
  const plannedTotal = CATEGORIES.reduce((s, c) => s + (state.budget[c.id] || 0), 0);
  const spent = monthSpending(state, state.month);
  const rows = CATEGORIES.map((c) => {
    const planned = state.budget[c.id] || 0;
    const spentCat = actual[c.id];
    const diff = planned - spentCat;
    const used = planned > 0 ? Math.min(100, (spentCat / planned) * 100) : 0;
    return `<div class="budget-row${spentCat > planned ? ' over' : ''}">
      <div class="budget-cat"><span class="dot" style="background:${c.color}"></span><span>${c.label}</span><span class="fineprint">U.S. avg ${money(c.bls)}</span></div>
      <label class="budget-input">$<input type="number" min="0" step="1" name="budget-${c.id}" value="${planned}" aria-label="${c.label} budget"></label>
      <div class="budget-bar"><div class="progress"><div style="width:${used.toFixed(1)}%;background:${c.color}"></div></div>
      <div class="budget-figs"><span>spent ${money(spentCat)}</span><span class="${diff < 0 ? 'over-text' : 'under-text'}">${diff < 0 ? money(-diff) + ' over' : money(diff) + ' left'}</span></div></div>
    </div>`;
  }).join('');

  return `<section class="page-head"><div><h1>Monthly budget planner</h1>
  <p class="lede">Set the plan for ${monthLabel(state.month)}, then watch the bars fill as spending lands. The U.S. average beside each category is the BLS Consumer Expenditure Survey 2024 (monthly). Edit any number and press Save plan — the dashboard, spending page and 50/30/20 split all update from it.</p></div></section>
  <form id="budget-form" class="card">
    <div class="budget-head"><span>Category</span><span>Monthly plan</span><span>Progress in ${monthLabel(state.month)}</span></div>
    ${rows}
    <div class="budget-total"><span>Total planned</span><strong>${money(plannedTotal)}</strong><span>Spent so far ${money(spent)} · ${money(state.takeHome - plannedTotal)} left to save if the plan holds</span></div>
    <div class="form-actions"><button type="submit" class="btn primary">Save plan</button>
    <button type="button" class="btn" data-action="reset-demo">Reset demo data</button></div>
  </form>`;
}

// ---------------- Spending by category ----------------

export function renderSpending(state) {
  const actual = actualByCategory(state, state.month);
  const spent = monthSpending(state, state.month);
  const slices = CATEGORIES.map((c) => ({ label: c.label, value: actual[c.id], color: c.color }))
    .filter((s) => s.value > 0)
    .sort((a, b) => b.value - a.value);
  const maxActual = Math.max(...slices.map((s) => s.value), 1);
  const bars = slices.map((s) => ({
    label: s.label,
    value: s.value,
    max: maxActual,
    color: s.color,
    note: `${pct(s.value, spent)}% of spending`,
  }));

  const compareRows = CATEGORIES.map((c) => {
    const yours = actual[c.id];
    const diff = yours - c.bls;
    const verdict = yours === 0 && c.bls > 0 ? '—' : diff <= 0 ? `${money(-diff)} under` : `${money(diff)} over`;
    return `<tr><td><span class="dot" style="background:${c.color}"></span>${c.label}</td>
      <td class="num">${money(yours)}</td><td class="num">${money(c.bls)}</td>
      <td class="num ${diff > 0 ? 'over-text' : 'under-text'}">${verdict}</td>
      <td class="num">${c.bls > 0 ? pct(yours, c.bls) + '%' : '—'}</td></tr>`;
  }).join('');

  const trend = MONTHS.map((m) => {
    const a = actualByCategory(state, m.id);
    const top = CATEGORIES.map((c) => [c.label, a[c.id]]).sort((x, y) => y[1] - x[1])[0];
    return `<tr><td>${m.label}</td><td class="num">${money(monthSpending(state, m.id))}</td><td class="num">${money(monthIncome(state, m.id) - monthSpending(state, m.id))}</td><td>${top[0]} · ${money(top[1])}</td></tr>`;
  }).join('');

  return `<section class="page-head"><div><h1>Spending by category</h1>
  <p class="lede">${monthLabel(state.month)} spending, next to what the average American household spends (BLS Consumer Expenditure Survey 2024, annual averages ÷ 12). Change the month in the header to see September and October.</p></div></section>
  <div class="two-col">
    <section class="card"><h2>${monthLabel(state.month)} — ${money(spent)} total</h2>${donutChart(slices, spent, 240)}</section>
    <section class="card"><h2>Every category, largest first</h2>${barChart(bars)}</section>
  </div>
  <section class="card">
    <h2>You vs the U.S. average — ${monthLabel(state.month)}</h2>
    <table class="data-table"><thead><tr><th>Category</th><th class="num">You spent</th><th class="num">U.S. average</th><th class="num">Difference</th><th class="num">% of average</th></tr></thead>
    <tbody>${compareRows}</tbody>
    <tfoot><tr><td>Total</td><td class="num">${money(spent)}</td><td class="num">${money(6545)}</td><td class="num under-text">${money(6545 - spent)} under</td><td class="num">${pct(spent, 6545)}%</td></tr></tfoot></table>
    <p class="fineprint">Source: ${esc(BLS_SOURCE)}. U.S. average income before taxes is ${money(8684)}/mo; this household's gross pay matches it and its take-home pay is ${money(state.takeHome)}/mo.</p>
  </section>
  <section class="card">
    <h2>Three-month trend</h2>
    <table class="data-table"><thead><tr><th>Month</th><th class="num">Spent</th><th class="num">Saved</th><th>Biggest category</th></tr></thead><tbody>${trend}</tbody></table>
  </section>`;
}

// ---------------- Transactions ledger ----------------

export function renderTransactions(state, helpers, filter = { category: 'all', q: '' }) {
  const all = monthTransactions(state, state.month);
  const shown = all.filter((t) => {
    if (filter.category !== 'all' && t.category !== filter.category) return false;
    if (filter.q) {
      const q = filter.q.toLowerCase();
      if (!`${t.merchant} ${t.note || ''}`.toLowerCase().includes(q)) return false;
    }
    return true;
  });
  const spentShown = shown.filter((t) => t.category !== 'income').reduce((s, t) => s + t.amount, 0);
  const incomeShown = shown.filter((t) => t.category === 'income').reduce((s, t) => s + -t.amount, 0);

  // Running balance: walk oldest first from the opening balance, then show newest first.
  const ascending = [...all].sort((a, b) => (a.date < b.date ? -1 : 1));
  const balanceAfter = new Map();
  let running = OPENING_BALANCE;
  for (const t of ascending) {
    running += -t.amount;
    balanceAfter.set(t.id, running);
  }

  const rows = shown.map((t) => {
    const cat = t.category === 'income' ? { label: 'Income', color: '#2e6b4f' } : categoryById[t.category];
    return `<tr class="tx-row" id="tx-${t.id}" data-category="${t.category}" data-amount="${t.amount}" data-search="${esc(`${t.merchant} ${t.note || ''}`.toLowerCase())}">
      <td>${fmtDate(t.date)}</td>
      <td><strong>${esc(t.merchant)}</strong><div class="fineprint">${esc(t.note || '')}</div></td>
      <td><span class="pill cat" style="--cat:${cat.color}">${cat.label}</span></td>
      <td class="num ${t.amount < 0 ? 'under-text' : ''}">${t.amount < 0 ? '+' : '−'}${moneyCents(t.amount)}</td>
      <td class="num">${money(balanceAfter.get(t.id) ?? 0)}</td>
      <td class="row-actions"><button class="btn small" data-action="edit-tx" data-tx="${t.id}">Edit</button>
      <button class="btn small danger" data-action="delete-tx" data-tx="${t.id}">Delete</button></td></tr>`;
  }).join('');

  return `<section class="page-head"><div><h1>Transactions ledger</h1>
  <p class="lede">${monthLabel(state.month)} — every dollar in and out, with a running checking balance from an opening balance of ${money(OPENING_BALANCE)} on 1 September 2026. Add, edit or delete a row; the dashboard, budget bars and charts all follow.</p></div></section>
  <section class="card">
    <form id="tx-add-form" class="tx-form">
      <input name="merchant" type="text" placeholder="Merchant or paycheck" required aria-label="Merchant">
      <input name="amount" type="number" min="0.01" step="0.01" placeholder="Amount" required aria-label="Amount">
      <select name="category" aria-label="Category">${categoryOptions('food')}</select>
      <input name="date" type="date" value="${state.month}-29" aria-label="Date">
      <input name="note" type="text" placeholder="Note (optional)" aria-label="Note">
      <button type="submit" class="btn primary">Add transaction</button>
    </form>
    <form id="tx-edit-form" class="tx-form edit-form">
      <strong>Edit transaction</strong>
      <input name="merchant" type="text" placeholder="Merchant" required aria-label="Merchant">
      <input name="amount" type="number" min="0.01" step="0.01" placeholder="Amount" required aria-label="Amount">
      <select name="category" aria-label="Category">${categoryOptions('food')}</select>
      <input name="date" type="date" aria-label="Date">
      <input name="note" type="text" placeholder="Note (optional)" aria-label="Note">
      <button type="submit" class="btn primary">Save changes</button>
      <button type="button" class="btn" data-action="cancel-edit">Cancel</button>
    </form>
  </section>
  <section class="card">
    <div class="filters">
      <label>Category <select id="tx-filter-cat" data-filter="category">${['all', ...CATEGORIES.map((c) => c.id)].map((id) => `<option value="${id}"${id === filter.category ? ' selected' : ''}>${id === 'all' ? 'All categories' : categoryById[id].label}</option>`).join('')}</select></label>
      <label>Search <input id="tx-filter-q" data-filter="q" type="search" placeholder="Merchant or note…" value="${esc(filter.q)}"></label>
      <span class="filter-summary" id="tx-summary">${shown.length} of ${all.length} rows · in ${money(incomeShown)} · out ${money(spentShown)}</span>
    </div>
    <div class="table-scroll"><table class="data-table">
      <thead><tr><th>Date</th><th>Merchant</th><th>Category</th><th class="num">Amount</th><th class="num">Balance</th><th></th></tr></thead>
      <tbody id="tx-body">${rows || '<tr><td colspan="6">No transactions match this filter.</td></tr>'}</tbody>
    </table></div>
  </section>`;
}

// ---------------- Bills & due dates ----------------

export function renderBills(state) {
  const month = state.month;
  const daysInMonth = new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0).getDate();
  const firstWeekday = new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1, 1).getDay();
  const dueByDay = new Map();
  for (const b of state.bills) {
    if (!dueByDay.has(b.dueDay)) dueByDay.set(b.dueDay, []);
    dueByDay.get(b.dueDay).push(b);
  }
  const cells = [];
  for (let i = 0; i < firstWeekday; i += 1) cells.push('<td class="cal-empty"></td>');
  for (let day = 1; day <= daysInMonth; day += 1) {
    const bills = dueByDay.get(day) || [];
    cells.push(`<td class="${bills.length ? 'cal-due' : ''}"><div class="cal-day">${day}</div>${bills.map((b) => `<div class="cal-bill ${b.paid ? 'paid' : ''}">${esc(b.name.split(' — ')[0])} · ${money(b.amount)}</div>`).join('')}</td>`);
  }
  const rows = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(`<tr>${cells.slice(i, i + 7).join('')}</tr>`);

  const sorted = [...state.bills].sort((a, b) => a.dueDay - b.dueDay);
  const totalDue = sorted.reduce((s, b) => s + b.amount, 0);
  const paidTotal = sorted.filter((b) => b.paid).reduce((s, b) => s + b.amount, 0);
  const todayDay = Number(TODAY.slice(8, 10));
  const list = sorted.map((b) => {
    const status = b.paid ? 'Paid' : b.dueDay < todayDay ? `Overdue ${todayDay - b.dueDay}d` : b.dueDay === todayDay ? 'Due today' : `Due in ${b.dueDay - todayDay}d`;
    return `<li class="bill-row ${b.paid ? 'is-paid' : ''}">
      <span class="bill-day">Nov ${b.dueDay}</span>
      <span class="bill-name"><strong>${esc(b.name)}</strong><span class="fineprint">${categoryById[b.category].label}${b.autopay ? ' · autopay on' : ' · pay manually'}</span></span>
      <span class="bill-amt">${money(b.amount)}</span>
      <span class="pill ${b.paid ? 'paid' : b.dueDay < todayDay ? 'overdue' : 'due'}">${status}</span>
      <button class="btn small" data-action="toggle-bill" data-bill="${b.id}">${b.paid ? 'Mark unpaid' : 'Mark paid'}</button></li>`;
  }).join('');

  return `<section class="page-head"><div><h1>Bills &amp; due dates</h1>
  <p class="lede">${monthLabel(state.month)} — ${money(totalDue)} of bills, ${money(paidTotal)} already paid. Tap “Mark paid” as each one clears; the calendar and the dashboard's “bills still to pay” follow. Autopay bills are marked paid on their due day.</p></div></section>
  <section class="stat-grid">
    ${statCard('Total due', money(totalDue), state.bills.length + ' recurring bills')}
    ${statCard('Paid so far', money(paidTotal), sorted.filter((b) => b.paid).length + ' bills cleared', 'good')}
    ${statCard('Still to pay', money(totalDue - paidTotal), sorted.filter((b) => !b.paid).length + ' bills open', totalDue - paidTotal > 0 ? 'warn' : 'good')}
  </section>
  <section class="card"><h2>${monthLabel(state.month)} calendar</h2>
    <div class="table-scroll"><table class="calendar"><thead><tr><th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th></tr></thead><tbody>${rows.join('')}</tbody></table></div>
  </section>
  <section class="card"><h2>All bills, by due date</h2><ul class="bill-list">${list}</ul></section>`;
}

// ---------------- Savings goals ----------------

export function renderGoals(state) {
  const totalSaved = state.goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = state.goals.reduce((s, g) => s + g.target, 0);
  const emergency = state.goals.find((g) => g.id === 'g-emergency') || state.goals[0];
  const cards = state.goals.map((g) => {
    const remaining = g.target - g.saved;
    const perMonth = monthlyToGoal(g.target, g.saved, 6);
    return `<article class="card goal-card">
      <h2>${esc(g.name)}</h2>
      <p class="card-sub">${esc(g.why)}</p>
      <div class="goal-numbers"><strong>${money(g.saved)}</strong><span>of ${money(g.target)} · ${pct(g.saved, g.target)}%</span></div>
      <div class="progress big"><div style="width:${pct(g.saved, g.target)}%;background:${g.color}"></div></div>
      <p class="fineprint">${money(remaining)} to go — ${money(perMonth)}/mo finishes it in 6 months.</p>
      <div class="goal-add">
        <label>$ <input id="add-${g.id}" type="number" min="1" step="1" value="100" aria-label="Amount to add to ${esc(g.name)}"></label>
        <button class="btn primary" data-action="add-money" data-goal="${g.id}">Add money</button>
        <span class="fineprint">Moves from checking; the ledger records the transfer.</span>
      </div>
    </article>`;
  }).join('');

  return `<section class="page-head"><div><h1>Savings goals</h1>
  <p class="lede">${money(totalSaved)} saved across ${state.goals.length} goals, of ${money(totalTarget)} in total. The emergency fund comes first: three months of essentials, ${money(emergency.target)}, before the fun goals get extra.</p></div></section>
  <div class="goal-grid">${cards}</div>
  <section class="card strip"><h2>How the household saves</h2>
  <p>Every month the plan sets aside ${money(1215)} — 17.4% of take-home pay — split by standing order: $500 to the emergency fund, $300 to the house fund, $215 to the car fund and $200 to the vacation fund. November's actual saving is ${money(monthIncome(state, state.month) - monthSpending(state, state.month))}, so the emergency fund is ${pct(emergency.saved, emergency.target)}% funded and on pace to be full in ${Math.ceil((emergency.target - emergency.saved) / 500)} months.</p></section>`;
}

// ---------------- 50/30/20 & calculators ----------------

export function plannerResultsHTML(state, inputs) {
  const actual = actualByCategory(state, state.month);
  const takeHome = inputs.takeHome;
  const split = split503020(takeHome, actual, CATEGORIES);
  const targets = targets503020(takeHome);
  const ef = emergencyFund(inputs.essentials, inputs.efMonths, inputs.efSaved, inputs.efMonthly);
  const debt = debtPayoff(inputs.debtBalance, inputs.debtApr, inputs.debtPayment);
  const verdict = (value, target) => (value <= target ? 'On target' : `${money(value - target)} over target`);

  return `<div class="two-col">
    <section class="card">
      <h2>Your split vs the 50/30/20 targets</h2>
      ${splitBar(split.needs, split.wants, split.saved, takeHome)}
      <div class="legend"><span><i class="swatch" style="background:#2e6b4f"></i>Needs ${money(split.needs)} (${pct(split.needs, takeHome)}%)</span><span><i class="swatch" style="background:#c98a2b"></i>Wants ${money(split.wants)} (${pct(split.wants, takeHome)}%)</span><span><i class="swatch" style="background:#3e7ca8"></i>Saved ${money(split.saved)} (${pct(split.saved, takeHome)}%)</span></div>
      <table class="data-table"><thead><tr><th></th><th class="num">You</th><th class="num">50/30/20 target</th><th>Verdict</th></tr></thead><tbody>
      <tr><td>Needs — housing, transport, food, insurance, healthcare, clothing, education</td><td class="num">${money(split.needs)}</td><td class="num">${money(targets.needs)}</td><td>${verdict(split.needs, targets.needs)}</td></tr>
      <tr><td>Wants — dining out, entertainment, giving, extras</td><td class="num">${money(split.wants)}</td><td class="num">${money(targets.wants)}</td><td>${verdict(split.wants, targets.wants)}</td></tr>
      <tr><td>Saved</td><td class="num">${money(split.saved)}</td><td class="num">${money(targets.saved)}</td><td>${split.saved >= targets.saved ? 'On target' : money(targets.saved - split.saved) + ' short'}</td></tr>
      </tbody></table>
      <p class="fineprint">Needs run ${pct(split.needs, takeHome)}% of take-home pay — above the 50% target, mostly because rent and the car payment are fixed. The household still saves ${pct(split.saved, takeHome)}% by keeping wants to ${pct(split.wants, takeHome)}%.</p>
    </section>
    <section class="card">
      <h2>Emergency fund</h2>
      <p class="result-big">${money(ef.target)} <span>target — ${inputs.efMonths} months × ${money(inputs.essentials)} of essentials</span></p>
      <p>Saved so far ${money(inputs.efSaved)} (${ef.pct.toFixed(0)}% funded). ${money(ef.remaining)} to go${ef.monthsToGo === Infinity ? ', at the current pace it never gets there — raise the monthly amount.' : `, about ${ef.monthsToGo} month${ef.monthsToGo === 1 ? '' : 's'} at ${money(inputs.efMonthly)}/mo.`}</p>
      <h2 class="subhead">Debt payoff — Everyday Rewards card</h2>
      ${debt.paysOff
        ? `<p class="result-big">${debt.months} months <span>to clear ${money(inputs.debtBalance)} at ${money(inputs.debtPayment)}/mo, ${inputs.debtApr}% APR</span></p>
           <p>Total interest ${money(debt.interest)}; total paid ${money(debt.total)}. Paying ${money(inputs.debtPayment + 50)}/mo instead would clear it in ${debtPayoff(inputs.debtBalance, inputs.debtApr, inputs.debtPayment + 50).months} months and save ${money(debt.interest - debtPayoff(inputs.debtBalance, inputs.debtApr, inputs.debtPayment + 50).interest)} of interest.</p>`
        : `<p class="over-text">The ${money(inputs.debtPayment)} payment does not cover the monthly interest — the balance grows every month. Raise the payment above ${moneyCents(inputs.debtBalance * (inputs.debtApr / 100 / 12))} just to stand still.</p>`}
    </section>
  </div>`;
}

export function readPlannerInputs(state) {
  const get = (id, fallback) => {
    const el = document.getElementById(id);
    const v = el ? Number(el.value) : NaN;
    return Number.isFinite(v) && v >= 0 ? v : fallback;
  };
  return {
    takeHome: get('calc-takehome', state.takeHome),
    essentials: get('calc-essentials', 4150),
    efMonths: get('calc-ef-months', 3),
    efSaved: get('calc-ef-saved', 8450),
    efMonthly: get('calc-ef-monthly', 500),
    debtBalance: get('calc-debt-balance', 2400),
    debtApr: get('calc-debt-apr', 24.99),
    debtPayment: get('calc-debt-payment', 150),
  };
}

// Recompute the planner's results from whatever the form currently holds.
export function refreshPlanner(state) {
  const holder = document.getElementById('calc-results');
  if (holder) holder.innerHTML = plannerResultsHTML(state, readPlannerInputs(state));
}

export function renderPlanner(state) {
  const inputs = {
    takeHome: state.takeHome,
    essentials: 4150,
    efMonths: 3,
    efSaved: 8450,
    efMonthly: 500,
    debtBalance: 2400,
    debtApr: 24.99,
    debtPayment: 150,
  };
  return `<section class="page-head"><div><h1>50/30/20 planner &amp; calculators</h1>
  <p class="lede">The 50/30/20 rule — 50% of take-home pay for needs, 30% for wants, 20% for saving — applied to ${monthLabel(state.month)}'s real spending, plus two calculators the household actually uses: how big an emergency fund to hold, and what a card balance really costs to clear. Change any number; the answers update as you type.</p></div></section>
  <form id="planner-form" class="card calc-form">
    <div class="calc-fields">
      <label>Take-home pay /mo <input id="calc-takehome" type="number" min="0" step="10" value="${inputs.takeHome}"></label>
      <label>Monthly essentials <input id="calc-essentials" type="number" min="0" step="10" value="${inputs.essentials}"></label>
      <label>Months of cover <input id="calc-ef-months" type="number" min="1" max="12" step="1" value="${inputs.efMonths}"></label>
      <label>Emergency fund saved <input id="calc-ef-saved" type="number" min="0" step="10" value="${inputs.efSaved}"></label>
      <label>Saving to it /mo <input id="calc-ef-monthly" type="number" min="0" step="10" value="${inputs.efMonthly}"></label>
      <label>Card balance <input id="calc-debt-balance" type="number" min="0" step="10" value="${inputs.debtBalance}"></label>
      <label>Card APR % <input id="calc-debt-apr" type="number" min="0" step="0.01" value="${inputs.debtApr}"></label>
      <label>Monthly payment <input id="calc-debt-payment" type="number" min="0" step="5" value="${inputs.debtPayment}"></label>
    </div>
    <p class="fineprint">Essentials here are rent, utilities, groceries, transport, insurance and minimum payments — ${money(4150)}/mo for this household. The 50/30/20 split above uses ${monthLabel(state.month)}'s actual spending from the ledger.</p>
  </form>
  <div id="calc-results">${plannerResultsHTML(state, inputs)}</div>`;
}

// Hearth Ledger — state, routing and bootstrap.
//
// State lives in localStorage (key below) so edits survive a reload; the
// first visit seeds it from data.js. The router is hash-based, so every
// page is a link: #/ dashboard, #/budget planner, #/spending by category,
// #/transactions ledger, #/bills due dates, #/goals savings goals,
// #/planner 50/30/20 and calculators. Views render into #view; actions are
// handled by one delegated click/submit listener, so no inline handlers.

import {
  CATEGORIES,
  CURRENT_MONTH,
  HOUSEHOLD,
  MONTHS,
  PLANNED_BUDGET,
  SEED_BILLS,
  SEED_DEBT,
  SEED_GOALS,
  SEED_TRANSACTIONS,
} from './data.js';
import { refreshPlanner, renderBills, renderBudget, renderDashboard, renderGoals, renderPlanner, renderSpending, renderTransactions } from './views.js';

const STORAGE_KEY = 'hearth-ledger-v1';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.transactions) && parsed.budget) return parsed;
    }
  } catch (err) {
    // A browser that blocks storage still gets the seeded household.
  }
  return {
    month: CURRENT_MONTH,
    budget: clone(PLANNED_BUDGET),
    transactions: clone(SEED_TRANSACTIONS),
    bills: clone(SEED_BILLS),
    goals: clone(SEED_GOALS),
    debt: clone(SEED_DEBT),
    takeHome: HOUSEHOLD.takeHomeMonthly,
  };
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    // Storage full or blocked: the in-memory state still works for the visit.
  }
}

export function resetState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    // Nothing to clear.
  }
  return loadState();
}

// ---- Month figures, computed from the ledger (never typed in) ----

export function monthTransactions(state, monthId) {
  return state.transactions
    .filter((t) => t.date.startsWith(monthId))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export function actualByCategory(state, monthId) {
  const totals = Object.fromEntries(CATEGORIES.map((c) => [c.id, 0]));
  for (const t of state.transactions) {
    if (t.date.startsWith(monthId) && t.category !== 'income' && totals[t.category] !== undefined) {
      totals[t.category] += t.amount;
    }
  }
  return totals;
}

export function monthIncome(state, monthId) {
  let income = 0;
  for (const t of state.transactions) {
    if (t.date.startsWith(monthId) && t.category === 'income') income += -t.amount;
  }
  return income > 0 ? income : state.takeHome;
}

export function monthSpending(state, monthId) {
  const actual = actualByCategory(state, monthId);
  return Object.values(actual).reduce((sum, v) => sum + v, 0);
}

export function monthLabel(monthId) {
  return (MONTHS.find((m) => m.id === monthId) || { label: monthId }).label;
}

export function monthOptions(state) {
  return MONTHS.map(
    (m) => `<option value="${m.id}"${m.id === state.month ? ' selected' : ''}>${m.label}</option>`,
  ).join('');
}

// ---- Router ----

const ROUTES = {
  '/': renderDashboard,
  '/budget': renderBudget,
  '/spending': renderSpending,
  '/transactions': renderTransactions,
  '/bills': renderBills,
  '/goals': renderGoals,
  '/planner': renderPlanner,
};

const NAV = [
  ['/', 'Dashboard'],
  ['/budget', 'Budget planner'],
  ['/spending', 'Spending'],
  ['/transactions', 'Transactions'],
  ['/bills', 'Bills'],
  ['/goals', 'Savings goals'],
  ['/planner', '50/30/20 & calculators'],
];

function currentRoute() {
  const hash = location.hash.replace(/^#/, '') || '/';
  return ROUTES[hash] ? hash : '/';
}

let state = loadState();

// The ledger's filters live outside the saved state: they are a view
// preference, not household data, and they survive page switches.
let txFilter = { category: 'all', q: '' };

export function render() {
  const route = currentRoute();
  const view = ROUTES[route];
  document.getElementById('view').innerHTML = view(state, { monthLabel, monthOptions }, txFilter);
  document.querySelectorAll('.nav-link').forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === `#${route}`);
    if (link.getAttribute('href') === `#${route}`) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  window.scrollTo(0, 0);
}

function rerender() {
  saveState(state);
  render();
}

function uid(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
}

function onAction(event) {
  const el = event.target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action;

  if (action === 'set-month') {
    state.month = el.value;
    rerender();
    return;
  }
  if (action === 'reset-demo') {
    if (window.confirm('Reset the Alvarez household to its starting figures? Your edits will be lost.')) {
      state = resetState();
      render();
    }
    return;
  }
  if (action === 'toggle-bill') {
    const bill = state.bills.find((b) => b.id === el.dataset.bill);
    if (bill) {
      bill.paid = !bill.paid;
      rerender();
    }
    return;
  }
  if (action === 'add-money') {
    const goal = state.goals.find((g) => g.id === el.dataset.goal);
    const input = document.getElementById(`add-${el.dataset.goal}`);
    const amount = input ? Number(input.value) : 0;
    if (goal && amount > 0) {
      goal.saved = Math.min(goal.target, goal.saved + amount);
      state.transactions.push({
        id: uid('t'),
        date: `${state.month}-29`,
        merchant: `Transfer to ${goal.name}`,
        category: 'misc',
        amount,
        note: 'Moved to savings goal',
      });
      rerender();
    }
    return;
  }
  if (action === 'edit-tx') {
    const tx = state.transactions.find((t) => t.id === el.dataset.tx);
    if (!tx) return;
    const row = document.getElementById(`tx-${tx.id}`);
    if (row) row.classList.add('editing');
    const form = document.getElementById('tx-edit-form');
    if (form) {
      form.dataset.tx = tx.id;
      form.elements.merchant.value = tx.merchant;
      form.elements.amount.value = Math.abs(tx.amount).toFixed(2);
      form.elements.category.value = tx.category === 'income' ? 'food' : tx.category;
      form.elements.date.value = tx.date;
      form.elements.note.value = tx.note || '';
      form.scrollIntoView({ block: 'nearest' });
    }
    return;
  }
  if (action === 'delete-tx') {
    const tx = state.transactions.find((t) => t.id === el.dataset.tx);
    if (tx && window.confirm(`Delete “${tx.merchant}” ($${Math.abs(tx.amount).toFixed(2)})?`)) {
      state.transactions = state.transactions.filter((t) => t.id !== tx.id);
      rerender();
    }
    return;
  }
  if (action === 'cancel-edit') {
    const form = document.getElementById('tx-edit-form');
    if (form) {
      form.reset();
      delete form.dataset.tx;
    }
    document.querySelectorAll('.tx-row.editing').forEach((row) => row.classList.remove('editing'));
    return;
  }
}

function onSubmit(event) {
  if (event.target.id === 'tx-add-form') {
    event.preventDefault();
    const form = event.target;
    const amount = Number(form.elements.amount.value);
    if (!form.elements.merchant.value.trim() || !(amount > 0)) return;
    state.transactions.push({
      id: uid('t'),
      date: form.elements.date.value || `${state.month}-29`,
      merchant: form.elements.merchant.value.trim(),
      category: form.elements.category.value,
      amount,
      note: form.elements.note.value.trim(),
    });
    rerender();
    return;
  }
  if (event.target.id === 'tx-edit-form') {
    event.preventDefault();
    const form = event.target;
    const tx = state.transactions.find((t) => t.id === form.dataset.tx);
    if (!tx) return;
    const amount = Number(form.elements.amount.value);
    if (!form.elements.merchant.value.trim() || !(amount > 0)) return;
    tx.merchant = form.elements.merchant.value.trim();
    tx.amount = tx.category === 'income' ? -amount : amount;
    tx.category = form.elements.category.value;
    tx.date = form.elements.date.value || tx.date;
    tx.note = form.elements.note.value.trim();
    rerender();
    return;
  }
  if (event.target.id === 'budget-form') {
    event.preventDefault();
    const form = event.target;
    for (const c of CATEGORIES) {
      const input = form.elements[`budget-${c.id}`];
      if (input) state.budget[c.id] = Math.max(0, Number(input.value) || 0);
    }
    rerender();
    return;
  }
}

function applyTxFilter() {
  const body = document.getElementById('tx-body');
  if (!body) return;
  const q = txFilter.q.trim().toLowerCase();
  let shown = 0;
  let income = 0;
  let out = 0;
  for (const row of body.querySelectorAll('.tx-row')) {
    const okCat = txFilter.category === 'all' || row.dataset.category === txFilter.category;
    const okQ = !q || (row.dataset.search || '').includes(q);
    const show = okCat && okQ;
    row.style.display = show ? '' : 'none';
    if (show) {
      shown += 1;
      const amount = Number(row.dataset.amount || 0);
      if (amount < 0) income += -amount;
      else out += amount;
    }
  }
  const summary = document.getElementById('tx-summary');
  if (summary) {
    summary.textContent = `${shown} rows shown · in $${Math.round(income).toLocaleString('en-US')} · out $${Math.round(out).toLocaleString('en-US')}`;
  }
}

function onInput(event) {
  // Live-recalculate the planner's calculators as the household types,
  // without re-rendering the form (which would lose the cursor).
  if (event.target.closest('#planner-form')) refreshPlanner(state);
  // Ledger filters hide rows in place, so typing in Search never loses focus.
  if (event.target.matches('[data-filter]')) {
    txFilter[event.target.dataset.filter] = event.target.value;
    applyTxFilter();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('main-nav');
  nav.innerHTML = NAV.map(([path, label]) => `<a class="nav-link" href="#${path}">${label}</a>`).join('');
  document.getElementById('month-picker').innerHTML =
    `<label for="month-select">Month</label><select id="month-select" data-action="set-month" aria-label="Month to view">${monthOptions(state)}</select>`;
  document.addEventListener('click', onAction);
  document.addEventListener('change', (event) => {
    if (event.target.matches('[data-action="set-month"]')) onAction(event);
    if (event.target.matches('[data-filter]')) {
      txFilter[event.target.dataset.filter] = event.target.value;
      applyTxFilter();
    }
  });
  document.addEventListener('submit', onSubmit);
  document.addEventListener('input', onInput);
  window.addEventListener('hashchange', render);
  render();
});

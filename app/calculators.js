// Hearth Ledger — the calculators: 50/30/20, emergency fund, debt payoff.
//
// All three are pure functions of their inputs, so the planner page can
// recompute them live as the household types, and the same functions feed
// the dashboard's "how your month splits" strip. Amounts are dollars per
// month unless a function says otherwise.

// Split take-home pay into needs / wants / savings by the 50/30/20 rule,
// from the month's actual spending. A category counts as a need when the
// category table in data.js flags it; everything else spent is a want, and
// whatever is left of take-home pay is saved.
export function split503020(takeHome, actualByCategory, categories) {
  let needs = 0;
  let wants = 0;
  for (const c of categories) {
    const spent = actualByCategory[c.id] || 0;
    if (c.needs) needs += spent;
    else wants += spent;
  }
  const saved = Math.max(0, takeHome - needs - wants);
  return { needs, wants, saved, takeHome };
}

// The 50/30/20 targets for a given take-home pay.
export function targets503020(takeHome) {
  return { needs: takeHome * 0.5, wants: takeHome * 0.3, saved: takeHome * 0.2 };
}

// Emergency fund: how many months of essentials the household wants covered,
// and how long the current saving pace takes to get there.
export function emergencyFund(essentialsMonthly, monthsCovered, savedSoFar, savingPerMonth) {
  const target = essentialsMonthly * monthsCovered;
  const remaining = Math.max(0, target - savedSoFar);
  const monthsToGo = savingPerMonth > 0 ? Math.ceil(remaining / savingPerMonth) : Infinity;
  return { target, remaining, monthsToGo, pct: target > 0 ? Math.min(100, (savedSoFar / target) * 100) : 0 };
}

// Debt payoff: fixed monthly payment against a balance at an APR. Returns
// the months to pay off, total interest, and total paid. A payment that
// does not cover the monthly interest never pays the debt off.
export function debtPayoff(balance, aprPercent, payment) {
  const monthlyRate = aprPercent / 100 / 12;
  if (balance <= 0) return { months: 0, interest: 0, total: 0, paysOff: true };
  if (payment <= balance * monthlyRate) {
    return { months: Infinity, interest: Infinity, total: Infinity, paysOff: false };
  }
  const months = Math.ceil(-Math.log(1 - (balance * monthlyRate) / payment) / Math.log(1 + monthlyRate));
  let remaining = balance;
  let interest = 0;
  for (let i = 0; i < months; i += 1) {
    const thisInterest = remaining * monthlyRate;
    interest += thisInterest;
    remaining = remaining + thisInterest - payment;
  }
  return { months, interest, total: balance + interest, paysOff: true };
}

// How much a month the household must set aside to reach a goal by a date.
export function monthlyToGoal(target, saved, monthsLeft) {
  if (monthsLeft <= 0) return Math.max(0, target - saved);
  return Math.max(0, (target - saved) / monthsLeft);
}

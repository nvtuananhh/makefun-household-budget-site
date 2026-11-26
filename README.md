# Hearth Ledger — a household budget that balances

[![make.fun · best-household-budget-site-20261126-1457](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/nvtuananhh/makefun-household-budget-site/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/nvtuananhh/makefun-household-budget-site/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)

Hearth Ledger is a working household budget site for the Alvarez household — Maya & Daniel, two children, Columbus, Ohio. It runs entirely offline from static files: no network requests, no accounts, no cookies. Edits are saved in the browser only.

## What it does

- **Dashboard** — the month at a glance: take-home pay, spending, savings rate, income vs spending over three months, where the money went, bills still to pay, and savings-goal progress.
- **Budget planner** — an editable monthly plan for all 14 spending categories, with progress bars, over/under against actual spending, and the U.S. average beside every category.
- **Spending by category** — hand-rolled SVG donut and bar charts, a month switcher that changes every figure, and a you-vs-average table.
- **Transactions ledger** — add, edit and delete transactions, filter by category, search by merchant or note, and a running checking balance.
- **Bills & due dates** — a month calendar of due days, mark-paid toggles, autopay flags, and paid / still-to-pay totals.
- **Savings goals** — emergency fund, vacation, next car and a first home, with progress and add-money transfers that the ledger records.
- **50/30/20 planner & calculators** — the household's real split against the 50/30/20 targets, an emergency-fund calculator, and a debt-payoff calculator that shows months to clear and interest paid. All three recompute live as you type.

## The figures are real

Every “U.S. average” figure is the U.S. Bureau of Labor Statistics, Consumer Expenditure Survey 2024 (news release USDL-25-1586, December 2025): average annual expenditures of all consumer units, divided by 12. Total spending $78,535/yr ($6,545/mo); income before taxes $104,207/yr ($8,684/mo); housing $2,189/mo (33.4%), transportation $1,110/mo (17.0%), food $847/mo (12.9%), personal insurance & pensions $816/mo (12.5%), healthcare $516/mo (7.9%), entertainment $301/mo (4.6%). The example household's gross pay matches the national average; its take-home pay is $6,980/mo, its plan is $5,765/mo, and every total on the site is computed from its ledger rows — never typed in.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library (`vendor/makefun-frontend.ts`, unchanged from the kit).

## Layout

- `app/index.html` — page shell: header, navigation, month picker, footer
- `app/style.css` — the whole design, system fonts only
- `app/data.js` — seed data: BLS 2024 benchmarks, the household plan, three months of transactions, bills, savings goals
- `app/charts.js` — hand-rolled SVG donut, bar, line and split-bar charts
- `app/calculators.js` — 50/30/20 split, emergency fund, debt payoff
- `app/views.js` — the seven pages
- `app/main.js` — state (localStorage over the seed), hash router, actions
- `screenshots/` — renders of the site in a browser (desktop + phone)
- `shots.json` — which view each screenshot shows

## License

MIT — see `LICENSE`.

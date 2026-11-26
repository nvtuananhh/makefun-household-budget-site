// Hearth Ledger — seed data (all figures are the example household's own
// records, except the benchmark column, which is labelled with its source).
//
// BENCHMARK SOURCE — every "U.S. average" figure in this file is the U.S.
// Bureau of Labor Statistics, Consumer Expenditure Survey, 2024 (news
// release USDL-25-1586, published 19 December 2025): average annual
// expenditures of all consumer units, divided by 12 for a monthly figure.
// Total: $78,535/yr ($6,545/mo). Income before taxes: $104,207/yr
// ($8,684/mo). Housing $26,266/yr ($2,189/mo, 33.4%); transportation
// $13,318/yr ($1,110/mo, 17.0%); food $10,169/yr ($847/mo, 12.9% — at home
// $6,224/yr, away $3,945/yr); personal insurance & pensions $9,797/yr
// ($816/mo, 12.5%); healthcare $6,197/yr ($516/mo, 7.9%); entertainment
// $3,609/yr ($301/mo, 4.6%); cash contributions $2,292/yr ($191/mo, 2.9%);
// apparel & services $2,001/yr ($167/mo, 2.5%); education $1,569/yr
// ($131/mo, 2.0%); miscellaneous $1,218/yr ($102/mo, 1.6%); personal care
// $978/yr ($82/mo, 1.2%); alcoholic beverages $643/yr ($54/mo, 0.8%);
// tobacco $352/yr ($29/mo, 0.4%); reading $125/yr ($10/mo, 0.2%).
// Utilities $4,736/yr ($395/mo) and shelter $16,317/yr ($1,360/mo) sit
// inside the housing total. Monthly figures are the annual averages
// divided by 12 and rounded to the dollar.

export const BLS_SOURCE =
  'U.S. Bureau of Labor Statistics, Consumer Expenditure Survey 2024 (USDL-25-1586, Dec 2025) — annual averages ÷ 12';

export const CATEGORIES = [
  { id: 'housing', label: 'Housing', color: '#2e6b4f', needs: true, bls: 2189 },
  { id: 'transportation', label: 'Transportation', color: '#3e7ca8', needs: true, bls: 1110 },
  { id: 'food', label: 'Food', color: '#c98a2b', needs: true, bls: 847 },
  { id: 'insurance', label: 'Insurance & pensions', color: '#6a5a9e', needs: true, bls: 816 },
  { id: 'healthcare', label: 'Healthcare', color: '#b0483f', needs: true, bls: 516 },
  { id: 'entertainment', label: 'Entertainment', color: '#c65d7b', needs: false, bls: 301 },
  { id: 'contributions', label: 'Giving', color: '#7a8a3d', needs: false, bls: 191 },
  { id: 'apparel', label: 'Clothing', color: '#8a6d4b', needs: true, bls: 167 },
  { id: 'education', label: 'Education', color: '#4a7d8c', needs: true, bls: 131 },
  { id: 'misc', label: 'Household & misc', color: '#7d7d7d', needs: false, bls: 102 },
  { id: 'personalcare', label: 'Personal care', color: '#a86ba0', needs: true, bls: 82 },
  { id: 'alcohol', label: 'Alcohol', color: '#9e7b3f', needs: false, bls: 54 },
  { id: 'tobacco', label: 'Tobacco', color: '#5d5d5d', needs: false, bls: 29 },
  { id: 'reading', label: 'Reading', color: '#4f6b8a', needs: false, bls: 10 },
];

export const categoryById = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

// The Alvarez household — Maya & Daniel, two children, Columbus, Ohio.
// Gross pay matches the BLS 2024 average income before taxes ($8,684/mo);
// take-home is after payroll taxes and 401(k) contributions.
export const HOUSEHOLD = {
  name: 'The Alvarez Household',
  members: 'Maya & Daniel, with Sofia (9) and Leo (6)',
  place: 'Columbus, Ohio',
  grossMonthly: 8684,
  takeHomeMonthly: 6980,
  paychecks: [
    { who: 'Maya — school district payroll', amount: 3740, day: 1 },
    { who: 'Daniel — logistics company', amount: 3240, day: 15 },
  ],
};

// The household's own monthly plan, set against the BLS averages above.
// Planned saving: $6,980 − $5,765 = $1,215/mo (17.4% of take-home).
export const PLANNED_BUDGET = {
  housing: 1950,
  transportation: 940,
  food: 780,
  insurance: 820,
  healthcare: 420,
  entertainment: 240,
  contributions: 150,
  apparel: 140,
  education: 110,
  misc: 90,
  personalcare: 70,
  alcohol: 40,
  tobacco: 0,
  reading: 15,
};

export const MONTHS = [
  { id: '2026-09', label: 'September 2026' },
  { id: '2026-10', label: 'October 2026' },
  { id: '2026-11', label: 'November 2026' },
];
export const CURRENT_MONTH = '2026-11';

// Every transaction the ledger starts with. Amounts are dollars; a negative
// amount is a refund. The totals the site shows are computed from these
// rows, never typed in by hand.
export const SEED_TRANSACTIONS = [
  // ---- November 2026 ----
  { id: 't-nov-01', date: '2026-11-01', merchant: 'Maple Court Apartments', category: 'housing', amount: 1650.0, note: 'November rent' },
  { id: 't-nov-02', date: '2026-11-01', merchant: 'Maya — paycheck', category: 'income', amount: -3740.0, note: 'School district, direct deposit' },
  { id: 't-nov-03', date: '2026-11-01', merchant: 'City Health Plan', category: 'healthcare', amount: 285.0, note: 'Monthly premium' },
  { id: 't-nov-04', date: '2026-11-02', merchant: 'Green Mart', category: 'food', amount: 96.4, note: 'Weekly groceries' },
  { id: 't-nov-05', date: '2026-11-03', merchant: 'Riverside Gym', category: 'healthcare', amount: 45.0, note: 'Family membership' },
  { id: 't-nov-06', date: '2026-11-04', merchant: 'Shell — High St', category: 'transportation', amount: 46.2, note: 'Fuel, Daniel’s car' },
  { id: 't-nov-07', date: '2026-11-05', merchant: 'NorthStar Internet', category: 'housing', amount: 65.0, note: 'Fiber 500 Mbps' },
  { id: 't-nov-08', date: '2026-11-06', merchant: 'Bright Path Tutoring', category: 'education', amount: 85.0, note: 'Sofia, math, 4 sessions' },
  { id: 't-nov-09', date: '2026-11-07', merchant: 'Piano Lessons — Mrs. Okafor', category: 'education', amount: 25.0, note: 'Leo, weekly lesson' },
  { id: 't-nov-10', date: '2026-11-07', merchant: 'Café Aroma', category: 'food', amount: 34.5, note: 'Saturday breakfast out' },
  { id: 't-nov-11', date: '2026-11-08', merchant: 'StreamBox + Music', category: 'entertainment', amount: 46.0, note: 'Streaming bundle' },
  { id: 't-nov-12', date: '2026-11-09', merchant: 'Green Mart', category: 'food', amount: 88.15, note: 'Weekly groceries' },
  { id: 't-nov-13', date: '2026-11-10', merchant: 'Honda Financial', category: 'transportation', amount: 320.0, note: 'Car payment' },
  { id: 't-nov-14', date: '2026-11-11', merchant: 'Corner Pharmacy', category: 'healthcare', amount: 34.0, note: 'Prescriptions' },
  { id: 't-nov-15', date: '2026-11-12', merchant: 'Columbus Power & Light', category: 'housing', amount: 132.0, note: 'Electric, October usage' },
  { id: 't-nov-16', date: '2026-11-13', merchant: 'Taco Fiesta', category: 'food', amount: 42.8, note: 'Family dinner out' },
  { id: 't-nov-17', date: '2026-11-14', merchant: 'Kids Shoes Outlet', category: 'apparel', amount: 68.0, note: 'Winter boots for Sofia' },
  { id: 't-nov-18', date: '2026-11-15', merchant: 'Daniel — paycheck', category: 'income', amount: -3240.0, note: 'Logistics company, direct deposit' },
  { id: 't-nov-19', date: '2026-11-15', merchant: 'SafeDrive Auto Insurance', category: 'transportation', amount: 148.0, note: 'Monthly premium, two cars' },
  { id: 't-nov-20', date: '2026-11-16', merchant: 'Green Mart', category: 'food', amount: 91.7, note: 'Weekly groceries' },
  { id: 't-nov-21', date: '2026-11-17', merchant: '401(k) — Maya', category: 'insurance', amount: 410.0, note: 'Payroll deduction' },
  { id: 't-nov-22', date: '2026-11-17', merchant: '401(k) — Daniel', category: 'insurance', amount: 290.0, note: 'Payroll deduction' },
  { id: 't-nov-23', date: '2026-11-18', merchant: 'City Water Dept', category: 'housing', amount: 48.0, note: 'Water & sewer' },
  { id: 't-nov-24', date: '2026-11-19', merchant: 'Regal Cinema', category: 'entertainment', amount: 38.0, note: 'Family movie night' },
  { id: 't-nov-25', date: '2026-11-20', merchant: 'Metro Transit', category: 'transportation', amount: 60.0, note: 'Monthly bus passes' },
  { id: 't-nov-26', date: '2026-11-20', merchant: 'Cellular One', category: 'housing', amount: 110.0, note: 'Two lines, unlimited' },
  { id: 't-nov-27', date: '2026-11-21', merchant: 'Green Mart', category: 'food', amount: 104.3, note: 'Thanksgiving groceries' },
  { id: 't-nov-28', date: '2026-11-22', merchant: 'LifeSecure Insurance', category: 'insurance', amount: 62.0, note: 'Term life, Maya & Daniel' },
  { id: 't-nov-29', date: '2026-11-22', merchant: 'Umbrella Policy — SafeDrive', category: 'insurance', amount: 58.0, note: 'Annual policy, monthly share' },
  { id: 't-nov-30', date: '2026-11-23', merchant: 'Shell — High St', category: 'transportation', amount: 41.5, note: 'Fuel, Maya’s car' },
  { id: 't-nov-31', date: '2026-11-23', merchant: 'Downtown Dental', category: 'healthcare', amount: 45.0, note: 'Leo check-up copay' },
  { id: 't-nov-32', date: '2026-11-24', merchant: 'Community Church', category: 'contributions', amount: 100.0, note: 'Monthly tithe' },
  { id: 't-nov-33', date: '2026-11-24', merchant: 'Food Pantry Donation', category: 'contributions', amount: 50.0, note: 'Thanksgiving drive' },
  { id: 't-nov-34', date: '2026-11-25', merchant: 'Green Mart', category: 'food', amount: 87.9, note: 'Weekly groceries' },
  { id: 't-nov-35', date: '2026-11-25', merchant: 'Book Nook', category: 'reading', amount: 12.0, note: 'Sofia’s chapter books' },
  { id: 't-nov-36', date: '2026-11-26', merchant: 'Quick Lube', category: 'transportation', amount: 89.0, note: 'Oil change + inspection' },
  { id: 't-nov-37', date: '2026-11-26', merchant: 'Hair Studio', category: 'personalcare', amount: 58.0, note: 'Haircuts, Maya & Leo' },
  { id: 't-nov-38', date: '2026-11-26', merchant: 'Corner Store', category: 'alcohol', amount: 36.0, note: 'Wine for Thanksgiving' },
  { id: 't-nov-39', date: '2026-11-27', merchant: 'Home Depot', category: 'misc', amount: 64.0, note: 'Weather stripping + bulbs' },
  { id: 't-nov-40', date: '2026-11-27', merchant: 'Target', category: 'misc', amount: 38.0, note: 'Gift wrap + batteries' },
  { id: 't-nov-41', date: '2026-11-27', merchant: 'Jacket — Outdoor Co.', category: 'apparel', amount: 54.0, note: 'Winter jacket, Daniel' },
  { id: 't-nov-42', date: '2026-11-28', merchant: 'Café Aroma', category: 'food', amount: 28.6, note: 'Coffee + pastries' },
  { id: 't-nov-43', date: '2026-11-28', merchant: 'Concert Hall — Nutcracker', category: 'entertainment', amount: 120.0, note: 'Four tickets, December show' },
  { id: 't-nov-44', date: '2026-11-29', merchant: 'Drugstore', category: 'personalcare', amount: 24.0, note: 'Toiletries' },
  { id: 't-nov-45', date: '2026-11-29', merchant: 'Green Mart', category: 'food', amount: 76.5, note: 'Weekly groceries' },
  // ---- October 2026 ----
  { id: 't-oct-01', date: '2026-10-01', merchant: 'Maple Court Apartments', category: 'housing', amount: 1650.0, note: 'October rent' },
  { id: 't-oct-02', date: '2026-10-01', merchant: 'Maya — paycheck', category: 'income', amount: -3740.0, note: 'School district, direct deposit' },
  { id: 't-oct-03', date: '2026-10-02', merchant: 'Green Mart', category: 'food', amount: 102.5, note: 'Weekly groceries' },
  { id: 't-oct-04', date: '2026-10-03', merchant: 'City Health Plan', category: 'healthcare', amount: 285.0, note: 'Monthly premium' },
  { id: 't-oct-05', date: '2026-10-05', merchant: 'NorthStar Internet', category: 'housing', amount: 65.0, note: 'Fiber 500 Mbps' },
  { id: 't-oct-06', date: '2026-10-06', merchant: 'Shell — High St', category: 'transportation', amount: 52.0, note: 'Fuel' },
  { id: 't-oct-07', date: '2026-10-07', merchant: 'Bright Path Tutoring', category: 'education', amount: 85.0, note: 'Sofia, math, 4 sessions' },
  { id: 't-oct-08', date: '2026-10-09', merchant: 'Green Mart', category: 'food', amount: 94.8, note: 'Weekly groceries' },
  { id: 't-oct-09', date: '2026-10-10', merchant: 'Honda Financial', category: 'transportation', amount: 320.0, note: 'Car payment' },
  { id: 't-oct-10', date: '2026-10-11', merchant: 'Pumpkin Patch Farm', category: 'entertainment', amount: 64.0, note: 'Fall outing, family of four' },
  { id: 't-oct-11', date: '2026-10-12', merchant: 'Columbus Power & Light', category: 'housing', amount: 118.0, note: 'Electric, September usage' },
  { id: 't-oct-12', date: '2026-10-14', merchant: 'Olive Garden', category: 'food', amount: 58.4, note: 'Birthday dinner' },
  { id: 't-oct-13', date: '2026-10-15', merchant: 'Daniel — paycheck', category: 'income', amount: -3240.0, note: 'Logistics company, direct deposit' },
  { id: 't-oct-14', date: '2026-10-15', merchant: 'SafeDrive Auto Insurance', category: 'transportation', amount: 148.0, note: 'Monthly premium, two cars' },
  { id: 't-oct-15', date: '2026-10-16', merchant: 'Green Mart', category: 'food', amount: 89.2, note: 'Weekly groceries' },
  { id: 't-oct-16', date: '2026-10-17', merchant: '401(k) — Maya', category: 'insurance', amount: 410.0, note: 'Payroll deduction' },
  { id: 't-oct-17', date: '2026-10-17', merchant: '401(k) — Daniel', category: 'insurance', amount: 290.0, note: 'Payroll deduction' },
  { id: 't-oct-18', date: '2026-10-18', merchant: 'City Water Dept', category: 'housing', amount: 44.0, note: 'Water & sewer' },
  { id: 't-oct-19', date: '2026-10-20', merchant: 'Metro Transit', category: 'transportation', amount: 60.0, note: 'Monthly bus passes' },
  { id: 't-oct-20', date: '2026-10-20', merchant: 'Cellular One', category: 'housing', amount: 110.0, note: 'Two lines, unlimited' },
  { id: 't-oct-21', date: '2026-10-21', merchant: 'Green Mart', category: 'food', amount: 97.6, note: 'Weekly groceries' },
  { id: 't-oct-22', date: '2026-10-22', merchant: 'LifeSecure Insurance', category: 'insurance', amount: 62.0, note: 'Term life, Maya & Daniel' },
  { id: 't-oct-23', date: '2026-10-23', merchant: 'Shell — High St', category: 'transportation', amount: 48.5, note: 'Fuel' },
  { id: 't-oct-24', date: '2026-10-24', merchant: 'Community Church', category: 'contributions', amount: 100.0, note: 'Monthly tithe' },
  { id: 't-oct-25', date: '2026-10-25', merchant: 'StreamBox + Music', category: 'entertainment', amount: 46.0, note: 'Streaming bundle' },
  { id: 't-oct-26', date: '2026-10-26', merchant: 'Corner Pharmacy', category: 'healthcare', amount: 28.0, note: 'Prescriptions' },
  { id: 't-oct-27', date: '2026-10-27', merchant: 'Old Navy', category: 'apparel', amount: 86.0, note: 'School clothes, kids' },
  { id: 't-oct-28', date: '2026-10-28', merchant: 'Green Mart', category: 'food', amount: 83.4, note: 'Weekly groceries' },
  { id: 't-oct-29', date: '2026-10-29', merchant: 'Halloween Store', category: 'misc', amount: 52.0, note: 'Costumes for Sofia & Leo' },
  { id: 't-oct-30', date: '2026-10-30', merchant: 'Hair Studio', category: 'personalcare', amount: 42.0, note: 'Haircuts' },
  { id: 't-oct-31', date: '2026-10-31', merchant: 'Pizza Place', category: 'food', amount: 31.5, note: 'Halloween pizza night' },
  // ---- September 2026 ----
  { id: 't-sep-01', date: '2026-09-01', merchant: 'Maple Court Apartments', category: 'housing', amount: 1650.0, note: 'September rent' },
  { id: 't-sep-02', date: '2026-09-01', merchant: 'Maya — paycheck', category: 'income', amount: -3740.0, note: 'School district, direct deposit' },
  { id: 't-sep-03', date: '2026-09-02', merchant: 'Green Mart', category: 'food', amount: 98.7, note: 'Weekly groceries' },
  { id: 't-sep-04', date: '2026-09-03', merchant: 'City Health Plan', category: 'healthcare', amount: 285.0, note: 'Monthly premium' },
  { id: 't-sep-05', date: '2026-09-05', merchant: 'NorthStar Internet', category: 'housing', amount: 65.0, note: 'Fiber 500 Mbps' },
  { id: 't-sep-06', date: '2026-09-08', merchant: 'Honda Financial', category: 'transportation', amount: 320.0, note: 'Car payment' },
  { id: 't-sep-07', date: '2026-09-09', merchant: 'Green Mart', category: 'food', amount: 91.2, note: 'Weekly groceries' },
  { id: 't-sep-08', date: '2026-09-10', merchant: 'Bright Path Tutoring', category: 'education', amount: 85.0, note: 'Sofia, math, 4 sessions' },
  { id: 't-sep-09', date: '2026-09-12', merchant: 'Columbus Power & Light', category: 'housing', amount: 141.0, note: 'Electric, August usage' },
  { id: 't-sep-10', date: '2026-09-14', merchant: 'School Supplies Store', category: 'education', amount: 74.0, note: 'Back-to-school supplies' },
  { id: 't-sep-11', date: '2026-09-15', merchant: 'Daniel — paycheck', category: 'income', amount: -3240.0, note: 'Logistics company, direct deposit' },
  { id: 't-sep-12', date: '2026-09-15', merchant: 'SafeDrive Auto Insurance', category: 'transportation', amount: 148.0, note: 'Monthly premium, two cars' },
  { id: 't-sep-13', date: '2026-09-16', merchant: 'Green Mart', category: 'food', amount: 95.6, note: 'Weekly groceries' },
  { id: 't-sep-14', date: '2026-09-17', merchant: '401(k) — Maya', category: 'insurance', amount: 410.0, note: 'Payroll deduction' },
  { id: 't-sep-15', date: '2026-09-17', merchant: '401(k) — Daniel', category: 'insurance', amount: 290.0, note: 'Payroll deduction' },
  { id: 't-sep-16', date: '2026-09-18', merchant: 'City Water Dept', category: 'housing', amount: 46.0, note: 'Water & sewer' },
  { id: 't-sep-17', date: '2026-09-20', merchant: 'Cellular One', category: 'housing', amount: 110.0, note: 'Two lines, unlimited' },
  { id: 't-sep-18', date: '2026-09-21', merchant: 'Shell — High St', category: 'transportation', amount: 44.0, note: 'Fuel' },
  { id: 't-sep-19', date: '2026-09-23', merchant: 'Green Mart', category: 'food', amount: 88.9, note: 'Weekly groceries' },
  { id: 't-sep-20', date: '2026-09-24', merchant: 'Community Church', category: 'contributions', amount: 100.0, note: 'Monthly tithe' },
  { id: 't-sep-21', date: '2026-09-25', merchant: 'StreamBox + Music', category: 'entertainment', amount: 46.0, note: 'Streaming bundle' },
  { id: 't-sep-22', date: '2026-09-27', merchant: 'Regal Cinema', category: 'entertainment', amount: 32.0, note: 'Movie night' },
  { id: 't-sep-23', date: '2026-09-28', merchant: 'Corner Pharmacy', category: 'healthcare', amount: 22.0, note: 'Prescriptions' },
  { id: 't-sep-24', date: '2026-09-30', merchant: 'Café Aroma', category: 'food', amount: 26.8, note: 'Coffee + pastries' },
];

// Recurring bills. `paid` is seeded for November 2026; marking a bill paid
// toggles it for the month being viewed, and the change is saved locally.
export const SEED_BILLS = [
  { id: 'b-rent', name: 'Rent — Maple Court Apartments', amount: 1650, dueDay: 1, category: 'housing', autopay: true, paid: true },
  { id: 'b-health', name: 'Health insurance premium', amount: 285, dueDay: 1, category: 'healthcare', autopay: true, paid: true },
  { id: 'b-gym', name: 'Riverside Gym — family', amount: 45, dueDay: 3, category: 'healthcare', autopay: true, paid: true },
  { id: 'b-internet', name: 'NorthStar Internet', amount: 65, dueDay: 5, category: 'housing', autopay: true, paid: true },
  { id: 'b-piano', name: 'Piano lessons — Leo', amount: 100, dueDay: 7, category: 'education', autopay: false, paid: true },
  { id: 'b-stream', name: 'StreamBox + Music', amount: 46, dueDay: 8, category: 'entertainment', autopay: true, paid: true },
  { id: 'b-car', name: 'Car payment — Honda', amount: 320, dueDay: 10, category: 'transportation', autopay: true, paid: true },
  { id: 'b-electric', name: 'Columbus Power & Light', amount: 132, dueDay: 12, category: 'housing', autopay: false, paid: true },
  { id: 'b-autoins', name: 'SafeDrive auto insurance', amount: 148, dueDay: 15, category: 'transportation', autopay: false, paid: true },
  { id: 'b-water', name: 'City Water Dept', amount: 48, dueDay: 18, category: 'housing', autopay: false, paid: true },
  { id: 'b-phone', name: 'Cellular One — two lines', amount: 110, dueDay: 20, category: 'housing', autopay: true, paid: true },
  { id: 'b-life', name: 'LifeSecure term life', amount: 62, dueDay: 22, category: 'insurance', autopay: true, paid: true },
  { id: 'b-transit', name: 'Metro Transit passes', amount: 60, dueDay: 20, category: 'transportation', autopay: false, paid: false },
  { id: 'b-tutor', name: 'Bright Path Tutoring', amount: 85, dueDay: 25, category: 'education', autopay: false, paid: false },
  { id: 'b-church', name: 'Community Church tithe', amount: 100, dueDay: 24, category: 'contributions', autopay: false, paid: false },
];

// Savings goals. `saved` is the balance on 29 November 2026.
export const SEED_GOALS = [
  { id: 'g-emergency', name: 'Emergency fund', why: '3 months of essential spending ($4,150/mo), so a lost paycheck never becomes a crisis.', target: 12450, saved: 8450, color: '#2e6b4f' },
  { id: 'g-vacation', name: 'Florida family vacation', why: 'A week at the beach in June — flights, hotel and park tickets, booked early.', target: 3200, saved: 1875, color: '#3e7ca8' },
  { id: 'g-car', name: 'Next car — down payment', why: 'Replace the 2016 Civic before it needs another major repair.', target: 6000, saved: 2300, color: '#c98a2b' },
  { id: 'g-house', name: 'A house of our own', why: 'A 10% down payment on a first home in the school district.', target: 40000, saved: 9600, color: '#6a5a9e' },
];

// The household's one debt, used by the debt-payoff calculator's defaults.
export const SEED_DEBT = { balance: 2400, apr: 24.99, payment: 150, name: 'Everyday Rewards card' };

// Monthly essentials for the emergency-fund calculator's defaults:
// rent + utilities + groceries + transport + insurance + minimum debt payment.
export const ESSENTIALS_MONTHLY = 4150;

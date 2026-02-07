import { useState, useCallback, useMemo } from "react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ComposedChart, ReferenceLine, Cell } from "recharts";

// ─── COLOUR PALETTE ──────────────────────────────────────────────────────────
const C = {
  bg: "#F8FAFC", card: "#FFFFFF", cardAlt: "#F1F5F9", border: "#E2E8F0", borderLight: "#CBD5E1",
  accent: "#2563EB", accentDim: "#DBEAFE", success: "#059669", successDim: "#D1FAE5",
  danger: "#DC2626", dangerDim: "#FEE2E2", warning: "#D97706", warningDim: "#FEF3C7",
  purple: "#7C3AED", purpleDim: "#EDE9FE", cyan: "#0891B2", cyanDim: "#CFFAFE",
  text: "#1E293B", muted: "#475569", dim: "#94A3B8",
  ch: ["#2563EB","#059669","#7C3AED","#D97706","#0891B2","#DC2626","#DB2777","#0D9488"],
  step: ["#2563EB","#7C3AED","#D97706","#059669"],
};

const fmt = (n) => { if(n==null) return "—"; const a=Math.abs(n); if(a>=1e6) return `${(n/1e6).toFixed(1)}M`; if(a>=1e3) return `${(n/1e3).toFixed(1)}K`; return n.toFixed(0); };
const fmtC = (n) => { if(n==null) return "—"; const s=n<0?"-":"",a=Math.abs(n); if(a>=1e6) return `${s}£${(a/1e6).toFixed(2)}M`; if(a>=1e3) return `${s}£${(a/1e3).toFixed(1)}K`; return `${s}£${a.toFixed(0)}`; };
const fmtP = (n) => n==null?"—":`${(n*100).toFixed(1)}%`;

// ─── TEMPLATES ───────────────────────────────────────────────────────────────
const TEMPLATES = {
  custom: {
    name: "Custom (Blank)", icon: "⚡", desc: "Start from scratch",
    revenueStreams: [{ name: "Product/Service", pricePerUnit: 50, unitsPerTransaction: 1, frequencyPerYear: 12, initialCustomers: 20, customerGrowthRate: 5, churnRate: 0 }],
    operatingAssets: [
      { name: "Equipment / Facilities", type: "fixed", cost: 30000, usefulLifeYears: 5 },
      { name: "Team (payroll)", type: "operating", monthlyCost: 8000, growthRate: 10, daysPayable: 0, scaleWithRevenue: false },
      { name: "Rent & Utilities", type: "operating", monthlyCost: 2000, growthRate: 3, daysPayable: 0, scaleWithRevenue: false },
    ],
    variableCosts: [{ name: "Direct materials / COGS", percentOfRevenue: 25 }],
    workingCapital: { daysReceivable: 30, daysInventory: 0 },
    initialCash: 50000,
    fundingRounds: [],
  },
  saas: {
    name: "SaaS / Subscription", icon: "☁️", desc: "Recurring revenue with churn",
    revenueStreams: [
      { name: "Basic Plan", pricePerUnit: 29, unitsPerTransaction: 1, frequencyPerYear: 12, initialCustomers: 50, customerGrowthRate: 8, churnRate: 3 },
      { name: "Pro Plan", pricePerUnit: 99, unitsPerTransaction: 1, frequencyPerYear: 12, initialCustomers: 10, customerGrowthRate: 6, churnRate: 2 },
    ],
    operatingAssets: [
      { name: "Engineering Team", type: "operating", monthlyCost: 25000, growthRate: 15, daysPayable: 0, scaleWithRevenue: false },
      { name: "Cloud Infrastructure", type: "operating", monthlyCost: 3000, growthRate: 20, daysPayable: 30, scaleWithRevenue: true },
      { name: "Office & Tools", type: "operating", monthlyCost: 4000, growthRate: 5, daysPayable: 15, scaleWithRevenue: false },
      { name: "Sales & Marketing", type: "operating", monthlyCost: 8000, growthRate: 12, daysPayable: 20, scaleWithRevenue: true },
    ],
    variableCosts: [
      { name: "Hosting (per-user)", percentOfRevenue: 5 },
      { name: "Payment Processing", percentOfRevenue: 3 },
      { name: "Customer Support", percentOfRevenue: 4 },
    ],
    workingCapital: { daysReceivable: 0, daysInventory: 0 },
    initialCash: 150000,
    fundingRounds: [{ name: "Seed Round", month: 12, amount: 500000, type: "equity" }],
  },
  marketplace: {
    name: "Marketplace / Platform", icon: "🏪", desc: "GMV-based with take rate",
    revenueStreams: [
      { name: "Transaction Commission", pricePerUnit: 8, unitsPerTransaction: 1, frequencyPerYear: 24, initialCustomers: 100, customerGrowthRate: 10, churnRate: 5 },
      { name: "Premium Seller Plans", pricePerUnit: 49, unitsPerTransaction: 1, frequencyPerYear: 12, initialCustomers: 20, customerGrowthRate: 7, churnRate: 4 },
    ],
    operatingAssets: [
      { name: "Platform Development", type: "operating", monthlyCost: 20000, growthRate: 15, daysPayable: 0, scaleWithRevenue: false },
      { name: "Trust & Safety Team", type: "operating", monthlyCost: 6000, growthRate: 10, daysPayable: 0, scaleWithRevenue: true },
      { name: "Growth Marketing", type: "operating", monthlyCost: 12000, growthRate: 15, daysPayable: 30, scaleWithRevenue: true },
      { name: "Operations", type: "operating", monthlyCost: 5000, growthRate: 8, daysPayable: 15, scaleWithRevenue: false },
    ],
    variableCosts: [
      { name: "Payment Processing", percentOfRevenue: 4 },
      { name: "Fraud & Chargebacks", percentOfRevenue: 2 },
    ],
    workingCapital: { daysReceivable: 7, daysInventory: 0 },
    initialCash: 200000,
    fundingRounds: [
      { name: "Pre-Seed", month: 6, amount: 300000, type: "equity" },
      { name: "Seed", month: 18, amount: 1000000, type: "equity" },
    ],
  },
  ecommerce: {
    name: "E-Commerce / DTC", icon: "📦", desc: "Product sales with inventory",
    revenueStreams: [
      { name: "Online Store", pricePerUnit: 45, unitsPerTransaction: 1.8, frequencyPerYear: 4, initialCustomers: 200, customerGrowthRate: 7, churnRate: 0 },
    ],
    operatingAssets: [
      { name: "Warehouse Lease", type: "fixed", cost: 60000, usefulLifeYears: 5 },
      { name: "Fulfilment Team", type: "operating", monthlyCost: 10000, growthRate: 12, daysPayable: 0, scaleWithRevenue: true },
      { name: "Marketing & Brand", type: "operating", monthlyCost: 12000, growthRate: 15, daysPayable: 30, scaleWithRevenue: true },
      { name: "Operations Team", type: "operating", monthlyCost: 8000, growthRate: 10, daysPayable: 0, scaleWithRevenue: false },
    ],
    variableCosts: [
      { name: "COGS", percentOfRevenue: 35 },
      { name: "Shipping", percentOfRevenue: 8 },
      { name: "Returns & Refunds", percentOfRevenue: 4 },
    ],
    workingCapital: { daysReceivable: 3, daysInventory: 30 },
    initialCash: 120000,
    fundingRounds: [{ name: "Inventory Loan", month: 1, amount: 50000, type: "debt", termMonths: 36, interestRate: 8 }],
  },
  services: {
    name: "Professional Services", icon: "💼", desc: "Billable hours & retainers",
    revenueStreams: [
      { name: "Consulting Retainers", pricePerUnit: 5000, unitsPerTransaction: 1, frequencyPerYear: 12, initialCustomers: 3, customerGrowthRate: 4, churnRate: 2 },
      { name: "Project Work", pricePerUnit: 12000, unitsPerTransaction: 1, frequencyPerYear: 3, initialCustomers: 2, customerGrowthRate: 5, churnRate: 0 },
    ],
    operatingAssets: [
      { name: "Consultants (salaries)", type: "operating", monthlyCost: 18000, growthRate: 10, daysPayable: 0, scaleWithRevenue: true },
      { name: "Office & Admin", type: "operating", monthlyCost: 3000, growthRate: 5, daysPayable: 15, scaleWithRevenue: false },
    ],
    variableCosts: [
      { name: "Subcontractors", percentOfRevenue: 15 },
      { name: "Travel & Expenses", percentOfRevenue: 5 },
    ],
    workingCapital: { daysReceivable: 45, daysInventory: 0 },
    initialCash: 40000,
    fundingRounds: [],
  },
  manufacturing: {
    name: "Manufacturing / Hardware", icon: "🏭", desc: "Physical production with equipment & inventory",
    revenueStreams: [
      { name: "Wholesale / B2B", pricePerUnit: 120, unitsPerTransaction: 25, frequencyPerYear: 12, initialCustomers: 8, customerGrowthRate: 3, churnRate: 1 },
      { name: "Direct-to-Consumer", pricePerUnit: 199, unitsPerTransaction: 1, frequencyPerYear: 6, initialCustomers: 40, customerGrowthRate: 6, churnRate: 0 },
    ],
    operatingAssets: [
      { name: "Production Equipment", type: "fixed", cost: 150000, usefulLifeYears: 7 },
      { name: "Tooling & Moulds", type: "fixed", cost: 40000, usefulLifeYears: 4 },
      { name: "Factory Lease", type: "operating", monthlyCost: 5000, growthRate: 3, daysPayable: 0, scaleWithRevenue: false },
      { name: "Production Workers", type: "operating", monthlyCost: 16000, growthRate: 8, daysPayable: 0, scaleWithRevenue: true },
      { name: "Quality & Engineering", type: "operating", monthlyCost: 8000, growthRate: 10, daysPayable: 0, scaleWithRevenue: false },
      { name: "Sales & Distribution", type: "operating", monthlyCost: 4000, growthRate: 12, daysPayable: 20, scaleWithRevenue: true },
      { name: "Admin & Overheads", type: "operating", monthlyCost: 3000, growthRate: 5, daysPayable: 15, scaleWithRevenue: false },
    ],
    variableCosts: [
      { name: "Raw Materials", percentOfRevenue: 30 },
      { name: "Components & Parts", percentOfRevenue: 10 },
      { name: "Packaging", percentOfRevenue: 4 },
      { name: "Shipping & Logistics", percentOfRevenue: 6 },
      { name: "Waste & Scrap", percentOfRevenue: 2 },
    ],
    workingCapital: { daysReceivable: 45, daysInventory: 45 },
    initialCash: 80000,
    fundingRounds: [
      { name: "Equipment Finance", month: 1, amount: 120000, type: "debt", termMonths: 60, interestRate: 6 },
      { name: "Seed Equity", month: 3, amount: 200000, type: "equity" },
    ],
  },
  retail: {
    name: "Retail Shop", icon: "🏬", desc: "Brick-and-mortar with foot traffic",
    revenueStreams: [
      { name: "In-Store Sales", pricePerUnit: 35, unitsPerTransaction: 2.2, frequencyPerYear: 8, initialCustomers: 150, customerGrowthRate: 3, churnRate: 0 },
      { name: "Online / Click & Collect", pricePerUnit: 40, unitsPerTransaction: 1.8, frequencyPerYear: 4, initialCustomers: 50, customerGrowthRate: 8, churnRate: 0 },
    ],
    operatingAssets: [
      { name: "Shop Fit-Out", type: "fixed", cost: 45000, usefulLifeYears: 5 },
      { name: "POS & IT Systems", type: "fixed", cost: 8000, usefulLifeYears: 4 },
      { name: "Premises Lease", type: "operating", monthlyCost: 4500, growthRate: 3, daysPayable: 0, scaleWithRevenue: false },
      { name: "Shop Staff", type: "operating", monthlyCost: 9000, growthRate: 5, daysPayable: 0, scaleWithRevenue: true },
      { name: "Manager / Owner Draw", type: "operating", monthlyCost: 3500, growthRate: 5, daysPayable: 0, scaleWithRevenue: false },
      { name: "Utilities & Insurance", type: "operating", monthlyCost: 1200, growthRate: 4, daysPayable: 30, scaleWithRevenue: false },
      { name: "Local Marketing", type: "operating", monthlyCost: 800, growthRate: 8, daysPayable: 15, scaleWithRevenue: true },
    ],
    variableCosts: [
      { name: "Cost of Goods (wholesale)", percentOfRevenue: 45 },
      { name: "Card Processing Fees", percentOfRevenue: 2 },
      { name: "Bags & Packaging", percentOfRevenue: 1 },
    ],
    workingCapital: { daysReceivable: 0, daysInventory: 30 },
    initialCash: 35000,
    fundingRounds: [
      { name: "Fit-Out Loan", month: 1, amount: 40000, type: "debt", termMonths: 48, interestRate: 7 },
    ],
  },
  restaurant: {
    name: "Café / Restaurant", icon: "☕", desc: "Food & beverage with seating capacity",
    revenueStreams: [
      { name: "Dine-In", pricePerUnit: 18, unitsPerTransaction: 1, frequencyPerYear: 24, initialCustomers: 80, customerGrowthRate: 3, churnRate: 1 },
      { name: "Takeaway / Delivery", pricePerUnit: 14, unitsPerTransaction: 1, frequencyPerYear: 30, initialCustomers: 40, customerGrowthRate: 6, churnRate: 2 },
      { name: "Coffee & Drinks", pricePerUnit: 4.5, unitsPerTransaction: 1, frequencyPerYear: 100, initialCustomers: 60, customerGrowthRate: 4, churnRate: 1 },
    ],
    operatingAssets: [
      { name: "Kitchen Equipment", type: "fixed", cost: 50000, usefulLifeYears: 7 },
      { name: "Interior Fit-Out", type: "fixed", cost: 35000, usefulLifeYears: 5 },
      { name: "Coffee Machine & Bar", type: "fixed", cost: 12000, usefulLifeYears: 5 },
      { name: "Premises Lease", type: "operating", monthlyCost: 5000, growthRate: 3, daysPayable: 0, scaleWithRevenue: false },
      { name: "Kitchen Staff", type: "operating", monthlyCost: 10000, growthRate: 6, daysPayable: 0, scaleWithRevenue: true },
      { name: "Front-of-House Staff", type: "operating", monthlyCost: 7000, growthRate: 6, daysPayable: 0, scaleWithRevenue: true },
      { name: "Utilities & Insurance", type: "operating", monthlyCost: 1800, growthRate: 5, daysPayable: 30, scaleWithRevenue: false },
      { name: "Marketing & Social Media", type: "operating", monthlyCost: 600, growthRate: 10, daysPayable: 15, scaleWithRevenue: true },
    ],
    variableCosts: [
      { name: "Food Cost", percentOfRevenue: 28 },
      { name: "Beverage Cost", percentOfRevenue: 8 },
      { name: "Disposables & Packaging", percentOfRevenue: 3 },
      { name: "Delivery Platform Fees", percentOfRevenue: 4 },
      { name: "Waste & Spoilage", percentOfRevenue: 3 },
    ],
    workingCapital: { daysReceivable: 0, daysInventory: 5 },
    initialCash: 30000,
    fundingRounds: [
      { name: "Start-Up Loan", month: 1, amount: 60000, type: "debt", termMonths: 48, interestRate: 7.5 },
      { name: "Family & Friends", month: 1, amount: 25000, type: "equity" },
    ],
  },
};

// ─── FINANCIAL ENGINE ────────────────────────────────────────────────────────
function runProjection(model, months = 60, stochastic = false, vol = {}) {
  const data = [];
  let cumulativeCash = model.initialCash;
  let breakevenMonth = null;
  let retainedEarnings = 0;
  let cumulativeEquity = model.initialCash; // initial cash = founder equity
  const customerCounts = model.revenueStreams.map(s => s.initialCustomers);

  // Fixed asset gross cost and total useful life for NBV calc
  const totalFixedAssetCost = model.operatingAssets.filter(a => a.type === "fixed").reduce((s, a) => s + a.cost, 0);

  // Track outstanding debt balances
  const debtBalances = {};
  model.fundingRounds.forEach((r, i) => {
    if (r.type === "debt") debtBalances[i] = { remaining: 0, startMonth: r.month };
  });

  for (let m = 1; m <= months; m++) {
    // ── STEP 1: Revenue ──
    let totalRevenue = 0;
    const streamDetails = model.revenueStreams.map((stream, idx) => {
      let growthRate = stream.customerGrowthRate / 100;
      let churnRate = (stream.churnRate || 0) / 100;
      let pricePerUnit = stream.pricePerUnit;
      if (stochastic) {
        const gV = (vol.growthVol || 30) / 100, cV = (vol.churnVol || 20) / 100, pV = (vol.priceVol || 20) / 100;
        growthRate *= (1 + (Math.random() - 0.5) * 2 * gV);
        churnRate = Math.max(0, churnRate * (1 + (Math.random() - 0.5) * 2 * cV));
        pricePerUnit *= (1 + (Math.random() - 0.5) * 2 * pV);
      }
      const newCust = customerCounts[idx] * growthRate;
      const churned = customerCounts[idx] * churnRate;
      customerCounts[idx] = Math.max(0, customerCounts[idx] + newCust - churned);
      const monthlyRev = customerCounts[idx] * stream.unitsPerTransaction * pricePerUnit * (stream.frequencyPerYear / 12);
      totalRevenue += monthlyRev;
      return { customers: customerCounts[idx], revenue: monthlyRev };
    });

    // ── STEP 2 & 3: Operating asset costs ──
    let fixedAssetDepreciation = 0;
    let totalOperatingCosts = 0;
    let opCostPayablesWeighted = 0; // for WC: sum of (cost × daysPayable/30)

    model.operatingAssets.forEach(asset => {
      if (asset.type === "fixed") {
        const dep = asset.cost / (asset.usefulLifeYears * 12);
        fixedAssetDepreciation += dep;
        totalOperatingCosts += dep;
      } else {
        let cost = asset.monthlyCost * Math.pow(1 + (asset.growthRate || 0) / 100, (m - 1) / 12);
        if (stochastic) {
          const cVol = (vol.costVol || 15) / 100;
          cost *= (1 + (Math.random() - 0.5) * 2 * cVol);
        }
        totalOperatingCosts += cost;
        // Each operating cost has its own payment terms
        opCostPayablesWeighted += cost * (asset.daysPayable || 0) / 30;
      }
    });

    // Variable costs
    let variableCosts = 0;
    model.variableCosts.forEach(vc => {
      let pct = vc.percentOfRevenue / 100;
      if (stochastic) {
        const cVol = (vol.costVol || 15) / 100;
        pct *= (1 + (Math.random() - 0.5) * 2 * cVol);
      }
      variableCosts += totalRevenue * pct;
    });

    const totalCostsBeforeDebt = totalOperatingCosts + variableCosts;
    const grossProfit = totalRevenue - variableCosts;
    const ebit = totalRevenue - totalCostsBeforeDebt;

    // ── Debt: interest expense & principal repayment ──
    let interestExpense = 0;
    let principalRepayment = 0;
    let equityFunding = 0;
    let debtFunding = 0;

    model.fundingRounds.forEach((round, i) => {
      if (round.type === "debt") {
        // Initialise balance when debt is disbursed
        if (round.month === m) {
          debtBalances[i] = { remaining: round.amount, startMonth: m };
          debtFunding += round.amount;
        }
        const bal = debtBalances[i];
        if (bal && bal.remaining > 0 && m >= round.month) {
          const monthlyRate = (round.interestRate || 0) / 100 / 12;
          const term = round.termMonths || 60;
          interestExpense += bal.remaining * monthlyRate;
          // Straight-line principal repayment
          const monthlyPrincipal = round.amount / term;
          const actualPrincipal = Math.min(monthlyPrincipal, bal.remaining);
          principalRepayment += actualPrincipal;
          bal.remaining = Math.max(0, bal.remaining - actualPrincipal);
        }
      } else {
        // Equity
        if (round.month === m) equityFunding += round.amount;
      }
    });

    const totalCosts = totalCostsBeforeDebt + interestExpense;
    const netIncome = totalRevenue - totalCosts;
    const grossMargin = totalRevenue > 0 ? grossProfit / totalRevenue : 0;

    // ── STEP 4: Working capital ──
    const wc = model.workingCapital;
    const dailyRevenue = totalRevenue / 30;
    const dailyCOGS = variableCosts / 30;
    const receivables = dailyRevenue * wc.daysReceivable;
    const inventory = dailyCOGS * (wc.daysInventory || 0);
    // Payables = variable cost payables (use general COGS terms) + operating cost payables (per-item)
    const cogsPayables = dailyCOGS * (wc.daysPayableCOGS || 30);
    const payables = cogsPayables + opCostPayablesWeighted;
    const netWorkingCapital = receivables + inventory - payables;

    const prevMonth = data.length > 0 ? data[data.length - 1] : null;
    const prevNWC = prevMonth ? prevMonth.netWorkingCapital : 0;
    const wcChange = netWorkingCapital - prevNWC;

    // Cash flow: operating CF = net income + depreciation (non-cash) - WC increase
    // Investing CF = capital expenditure (fixed asset purchases)
    // Financing CF = equity + debt proceeds - principal repayment
    const operatingCashFlow = netIncome + fixedAssetDepreciation - wcChange;
    const capEx = m === 1 ? totalFixedAssetCost : 0; // Fixed assets purchased in Month 1
    const investingCashFlow = -capEx;
    const financingCashFlow = equityFunding + debtFunding - principalRepayment;
    cumulativeCash += operatingCashFlow + investingCashFlow + financingCashFlow;

    if (!breakevenMonth && netIncome > 0) breakevenMonth = m;

    // ── Balance Sheet ──
    retainedEarnings += netIncome;
    cumulativeEquity += equityFunding;

    // Assets
    const accumulatedDepreciation = model.operatingAssets.filter(a => a.type === "fixed")
      .reduce((s, a) => s + Math.min(a.cost, (a.cost / (a.usefulLifeYears * 12)) * m), 0);
    const fixedAssetNBV = totalFixedAssetCost - accumulatedDepreciation;
    const totalAssets = cumulativeCash + receivables + inventory + fixedAssetNBV;

    // Liabilities
    const debtOut = Object.values(debtBalances).reduce((s, b) => s + (b.remaining || 0), 0);
    const totalLiabilities = payables + debtOut;

    // Equity
    const totalEquitySide = cumulativeEquity + retainedEarnings;

    data.push({
      month: m, year: Math.ceil(m / 12),
      revenue: totalRevenue, variableCosts, operatingCosts: totalOperatingCosts, totalCosts,
      grossProfit, grossMargin, ebit, interestExpense, netIncome,
      depreciation: fixedAssetDepreciation, principalRepayment,
      receivables, payables, inventory, netWorkingCapital, wcChange,
      operatingCashFlow, capEx, investingCashFlow, financingCashFlow, cumulativeCash,
      equityFunding, debtFunding,
      totalCustomers: streamDetails.reduce((s, d) => s + d.customers, 0),
      debtOutstanding: debtOut,
      // Balance sheet
      fixedAssetNBV, totalAssets, totalLiabilities,
      retainedEarnings, cumulativeEquity, totalEquitySide,
    });
  }

  let minCash = model.initialCash, minCashMonth = 0;
  for (const d of data) { if (d.cumulativeCash < minCash) { minCash = d.cumulativeCash; minCashMonth = d.month; } }
  const fundingGap = minCash < 0 ? -minCash : 0;
  return { data, breakevenMonth, fundingGap, minCash, minCashMonth };
}

function runMonteCarlo(model, numRuns = 500, vol = {}, defThreshold = 50) {
  const totalFunding = model.initialCash + model.fundingRounds.reduce((s, r) => s + r.amount, 0);
  const threshold = -(totalFunding * (defThreshold / 100));
  return Array.from({ length: numRuns }, (_, i) => {
    const { data, breakevenMonth } = runProjection(model, 60, true, vol);
    const final = data[59];
    let minCash = Infinity, defaulted = false;
    for (const d of data) { if (d.cumulativeCash < minCash) minCash = d.cumulativeCash; if (d.cumulativeCash < threshold) defaulted = true; }
    const irr = totalFunding > 0 ? Math.pow(Math.max(0, (final.cumulativeCash + totalFunding) / totalFunding), 0.2) - 1 : 0;
    let npv = -model.initialCash;
    const dr = 0.10 / 12;
    for (const d of data) { npv += d.operatingCashFlow / Math.pow(1 + dr, d.month); }
    return { run: i + 1, breakevenMonth, finalRevenue: final.revenue * 12, finalNetIncome: final.netIncome * 12, finalCash: final.cumulativeCash, finalEBIT: final.ebit * 12, minCash, irr, npv, defaulted };
  });
}

// ─── UI PRIMITIVES ───────────────────────────────────────────────────────────
const fonts = "'Source Sans 3',-apple-system,sans-serif";
const mono = "'JetBrains Mono',monospace";
const ttStyle = { background: "#FFFFFF", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" };

function Metric({ label, value, sub, color = C.accent, icon }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 18px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: color, opacity: 0.7 }} />
      <div style={{ fontSize: 13, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 }}>{icon && <span style={{ marginRight: 5 }}>{icon}</span>}{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: C.text, fontFamily: mono }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: C.dim, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function Input({ label, value, onChange, type = "number", step, min, max, suffix, style: sx, options }) {
  if (options) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 3, ...sx }}>
        {label && <label style={{ fontSize: 12, color: C.muted, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</label>}
        <select value={value} onChange={e => onChange(e.target.value)}
          style={{ background: "#FFFFFF", border: `1px solid ${C.border}`, borderRadius: 7, padding: "6px 10px", color: C.text, fontSize: 14, outline: "none" }}>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3, ...sx }}>
      {label && <label style={{ fontSize: 12, color: C.muted, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</label>}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <input type={type} value={value} onChange={e => onChange(type === "number" ? parseFloat(e.target.value) || 0 : e.target.value)} step={step} min={min} max={max}
          style={{ background: "#FFFFFF", border: `1px solid ${C.border}`, borderRadius: 7, padding: "6px 10px", color: C.text, fontSize: 14, fontFamily: mono, width: "100%", outline: "none" }} />
        {suffix && <span style={{ fontSize: 12, color: C.dim, whiteSpace: "nowrap" }}>{suffix}</span>}
      </div>
    </div>
  );
}

function Slider({ label, value, onChange, min = 0, max = 100, step = 1, suffix = "%", color = C.accent }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 14, color: C.muted }}>{label}</span>
        <span style={{ fontSize: 14, color: C.text, fontFamily: mono, fontWeight: 600 }}>{value}{suffix}</span>
      </div>
      <input type="range" value={value} onChange={e => onChange(parseFloat(e.target.value))} min={min} max={max} step={step}
        style={{ width: "100%", accentColor: color, height: 4 }} />
    </div>
  );
}

function Card({ children, style, className }) { return <div className={className} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 22, boxShadow: "0 1px 3px rgba(0,0,0,0.04)", ...style }}>{children}</div>; }
function Hdr({ children, sub, color }) {
  return (<div style={{ marginBottom: 14 }}><h3 style={{ fontSize: 17, fontWeight: 600, color: color || C.text, margin: 0 }}>{children}</h3>{sub && <p style={{ fontSize: 13, color: C.dim, margin: "3px 0 0 0" }}>{sub}</p>}</div>);
}
function Btn({ children, onClick, small, color = C.accent, danger, primary, disabled, style: sx }) {
  return (<button onClick={onClick} disabled={disabled} style={{
    background: primary ? `linear-gradient(135deg,${C.accent},${C.purple})` : danger ? C.dangerDim : "transparent",
    color: primary ? "#fff" : danger ? C.danger : color, border: primary ? "none" : `1px solid ${danger ? C.danger+"60" : color+"50"}`,
    borderRadius: small ? 6 : 10, padding: small ? "4px 10px" : "10px 20px", fontSize: small ? 12 : 14,
    cursor: disabled ? "not-allowed" : "pointer", fontWeight: primary ? 600 : 500, opacity: disabled ? 0.5 : 1, ...sx,
  }}>{children}</button>);
}
function TabBtn({ active, onClick, children, icon, color }) {
  return (<button onClick={onClick} style={{
    background: active ? (color || C.accent) : "transparent", color: active ? "#fff" : C.text,
    border: active ? "none" : `1px solid ${C.border}`, borderRadius: 10, padding: "10px 18px", fontSize: 14,
    fontWeight: active ? 600 : 400, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, whiteSpace: "nowrap",
  }}>{icon && <span style={{ fontSize: 16 }}>{icon}</span>}{children}</button>);
}
function StepInd({ number, label, color, active }) {
  return (<div style={{ display: "flex", alignItems: "center", gap: 10, opacity: active ? 1 : 0.6, cursor: "pointer" }}>
    <div style={{ width: 28, height: 28, borderRadius: "50%", background: active ? color : "transparent", border: `2px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: active ? "#fff" : color }}>{number}</div>
    <span style={{ fontSize: 14, color: active ? C.text : C.muted, fontWeight: active ? 600 : 400 }}>{label}</span>
  </div>);
}
function Badge({ children, color }) {
  return <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 4, background: color + "20", color: color, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{children}</span>;
}

// ─── TEMPLATE SELECTOR ──────────────────────────────────────────────────────
function TemplateSelector({ onSelect }) {
  return (
    <div className="template-grid">
      {Object.entries(TEMPLATES).map(([key, t]) => (
        <button key={key} onClick={() => onSelect(key)} style={{
          background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, cursor: "pointer", textAlign: "left", transition: "all 0.2s",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.background = "#EFF6FF"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.card; }}
        >
          <div style={{ fontSize: 28, marginBottom: 8 }}>{t.icon}</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 4 }}>{t.name}</div>
          <div style={{ fontSize: 13, color: C.dim }}>{t.desc}</div>
        </button>
      ))}
    </div>
  );
}

// ─── STEP 1: REVENUE MODEL ──────────────────────────────────────────────────
function Step1Revenue({ model, setModel }) {
  const add = () => setModel(m => ({ ...m, revenueStreams: [...m.revenueStreams, { name: `Stream ${m.revenueStreams.length + 1}`, pricePerUnit: 50, unitsPerTransaction: 1, frequencyPerYear: 12, initialCustomers: 10, customerGrowthRate: 5, churnRate: 0 }] }));
  const upd = (i, f, v) => setModel(m => ({ ...m, revenueStreams: m.revenueStreams.map((s, j) => j === i ? { ...s, [f]: v } : s) }));
  const rem = (i) => setModel(m => ({ ...m, revenueStreams: m.revenueStreams.filter((_, j) => j !== i) }));
  const previews = model.revenueStreams.map(s => s.initialCustomers * s.unitsPerTransaction * s.pricePerUnit * s.frequencyPerYear);
  const totalYear1 = previews.reduce((a, b) => a + b, 0);

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <Hdr color={C.step[0]} sub="Revenue = Customers × Units per Transaction × Price per Unit × Frequency">
          <span style={{ marginRight: 8, fontSize: 18 }}>💰</span>Step 1: Revenue Model
        </Hdr>
        <Btn onClick={add} small>+ Add Stream</Btn>
      </div>
      <div style={{ background: C.step[0]+"10", border: `1px solid ${C.step[0]}25`, borderRadius: 10, padding: "12px 16px", marginBottom: 18, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ fontSize: 14, color: C.step[0], fontFamily: mono, fontWeight: 500 }}>
          Revenue = <span style={{ color: C.ch[1] }}>Customers</span> × <span style={{ color: C.ch[2] }}>Units/Txn</span> × <span style={{ color: C.ch[3] }}>Price</span> × <span style={{ color: C.ch[4] }}>Frequency</span>
        </div>
        <div style={{ marginLeft: "auto", fontSize: 15, color: C.text, fontFamily: mono, fontWeight: 700 }}>Year 1: {fmtC(totalYear1)}</div>
      </div>
      {model.revenueStreams.map((s, i) => (
        <div key={i} style={{ background: C.bg, borderRadius: 10, padding: 16, marginBottom: 10, border: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 4, height: 20, borderRadius: 2, background: C.ch[i % C.ch.length] }} />
              <input value={s.name} onChange={e => upd(i, "name", e.target.value)} style={{ background: "transparent", border: "none", color: C.text, fontSize: 16, fontWeight: 600, outline: "none" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 14, color: C.ch[i % C.ch.length], fontFamily: mono, fontWeight: 600 }}>Year 1: {fmtC(previews[i])}</span>
              <Btn onClick={() => rem(i)} small danger>✕</Btn>
            </div>
          </div>
          <div className="input-grid-3" style={{ marginBottom: 8 }}>
            <Input label="Price per Unit (£)" value={s.pricePerUnit} onChange={v => upd(i, "pricePerUnit", v)} step={1} />
            <Input label="Units per Transaction" value={s.unitsPerTransaction} onChange={v => upd(i, "unitsPerTransaction", v)} step={0.1} min={0.1} />
            <Input label="Frequency (per year)" value={s.frequencyPerYear} onChange={v => upd(i, "frequencyPerYear", v)} step={1} min={1} />
          </div>
          <div className="input-grid-3">
            <Input label="Initial Customers" value={s.initialCustomers} onChange={v => upd(i, "initialCustomers", v)} step={1} min={0} />
            <Input label="Monthly Customer Growth (%)" value={s.customerGrowthRate} onChange={v => upd(i, "customerGrowthRate", v)} step={0.5} />
            <Input label="Monthly Churn (%)" value={s.churnRate} onChange={v => upd(i, "churnRate", v)} step={0.1} min={0} />
          </div>
        </div>
      ))}
    </Card>
  );
}

// ─── STEP 2: OPERATING ASSETS ────────────────────────────────────────────────
function Step2Assets({ model, setModel }) {
  const addFixed = () => setModel(m => ({ ...m, operatingAssets: [...m.operatingAssets, { name: "New Fixed Asset", type: "fixed", cost: 10000, usefulLifeYears: 5 }] }));
  const addOp = () => setModel(m => ({ ...m, operatingAssets: [...m.operatingAssets, { name: "New Operating Cost", type: "operating", monthlyCost: 2000, growthRate: 5, daysPayable: 0, scaleWithRevenue: false }] }));
  const upd = (i, f, v) => setModel(m => ({ ...m, operatingAssets: m.operatingAssets.map((a, j) => j === i ? { ...a, [f]: v } : a) }));
  const rem = (i) => setModel(m => ({ ...m, operatingAssets: m.operatingAssets.filter((_, j) => j !== i) }));

  const fixedAssets = model.operatingAssets.filter(a => a.type === "fixed");
  const opItems = model.operatingAssets.filter(a => a.type === "operating");
  const totalMonthlyFixed = fixedAssets.reduce((s, a) => s + (a.cost / (a.usefulLifeYears * 12)), 0);
  const totalMonthlyOp = opItems.reduce((s, a) => s + a.monthlyCost, 0);

  return (
    <Card>
      <Hdr color={C.step[1]} sub="What activities does revenue generation require? What operating assets need to be in place?">
        <span style={{ marginRight: 8, fontSize: 18 }}>🏗️</span>Step 2: Operating Assets & Activities
      </Hdr>
      <div style={{ background: C.step[1]+"10", border: `1px solid ${C.step[1]}25`, borderRadius: 10, padding: "12px 16px", marginBottom: 18, display: "flex", gap: 20, fontSize: 14 }}>
        <span style={{ color: C.muted }}>Fixed depreciation: <strong style={{ color: C.text, fontFamily: mono }}>{fmtC(totalMonthlyFixed)}</strong>/mo</span>
        <span style={{ color: C.muted }}>Operating costs: <strong style={{ color: C.text, fontFamily: mono }}>{fmtC(totalMonthlyOp)}</strong>/mo</span>
        <span style={{ color: C.muted, marginLeft: "auto" }}>Total: <strong style={{ color: C.text, fontFamily: mono }}>{fmtC(totalMonthlyFixed + totalMonthlyOp)}</strong>/mo</span>
      </div>

      {/* Fixed Assets */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>Fixed Assets (depreciated)</span>
        <Btn onClick={addFixed} small>+ Fixed Asset</Btn>
      </div>
      {fixedAssets.map((a) => {
        const i = model.operatingAssets.indexOf(a);
        return (
          <div key={i} style={{ background: C.bg, borderRadius: 8, padding: 12, marginBottom: 8, border: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
              <Input label="Asset Name" value={a.name} onChange={v => upd(i, "name", v)} type="text" sx={{ flex: 2 }} />
              <Input label="Cost (£)" value={a.cost} onChange={v => upd(i, "cost", v)} step={1000} sx={{ flex: 1 }} />
              <Input label="Useful Life (yrs)" value={a.usefulLifeYears} onChange={v => upd(i, "usefulLifeYears", v)} min={1} sx={{ flex: 1 }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
                <label style={{ fontSize: 12, color: C.muted, textTransform: "uppercase" }}>Depr./mo</label>
                <div style={{ padding: "6px 10px", fontSize: 14, fontFamily: mono, color: C.warning }}>{fmtC(a.cost / (a.usefulLifeYears * 12))}</div>
              </div>
              <Btn onClick={() => rem(i)} small danger>✕</Btn>
            </div>
          </div>
        );
      })}

      {/* Operating Costs with payment terms */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "18px 0 10px" }}>
        <div>
          <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>Operating Costs</span>
          <span style={{ fontSize: 12, color: C.dim, marginLeft: 8 }}>people, rent, services — each with payment terms</span>
        </div>
        <Btn onClick={addOp} small>+ Operating Cost</Btn>
      </div>
      {opItems.map((a) => {
        const i = model.operatingAssets.indexOf(a);
        return (
          <div key={i} style={{ background: C.bg, borderRadius: 8, padding: 12, marginBottom: 8, border: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
              <Input label="Name" value={a.name} onChange={v => upd(i, "name", v)} type="text" sx={{ flex: 2 }} />
              <Input label="Monthly (£)" value={a.monthlyCost} onChange={v => upd(i, "monthlyCost", v)} step={500} sx={{ flex: 1 }} />
              <Input label="Growth %/yr" value={a.growthRate} onChange={v => upd(i, "growthRate", v)} step={1} sx={{ flex: 0.7 }} />
              <Input label="Days Payable" value={a.daysPayable} onChange={v => upd(i, "daysPayable", v)} min={0} max={90} step={1} sx={{ flex: 0.7 }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <label style={{ fontSize: 12, color: C.muted, textTransform: "uppercase" }}>Scales?</label>
                <button onClick={() => upd(i, "scaleWithRevenue", !a.scaleWithRevenue)} style={{
                  background: a.scaleWithRevenue ? C.successDim : C.bg, color: a.scaleWithRevenue ? C.success : C.dim,
                  border: `1px solid ${a.scaleWithRevenue ? C.success+"50" : C.border}`, borderRadius: 6, padding: "5px 10px", fontSize: 12, cursor: "pointer",
                }}>{a.scaleWithRevenue ? "Yes" : "No"}</button>
              </div>
              <Btn onClick={() => rem(i)} small danger>✕</Btn>
            </div>
            {a.daysPayable === 0 && <div style={{ fontSize: 12, color: C.dim, marginTop: 4, paddingLeft: 4 }}>⚡ Paid immediately (e.g. payroll, direct debits)</div>}
          </div>
        );
      })}
    </Card>
  );
}

// ─── STEP 3: VARIABLE COSTS ─────────────────────────────────────────────────
function Step3Costs({ model, setModel }) {
  const add = () => setModel(m => ({ ...m, variableCosts: [...m.variableCosts, { name: `Cost ${m.variableCosts.length + 1}`, percentOfRevenue: 10 }] }));
  const upd = (i, f, v) => setModel(m => ({ ...m, variableCosts: m.variableCosts.map((c, j) => j === i ? { ...c, [f]: v } : c) }));
  const rem = (i) => setModel(m => ({ ...m, variableCosts: m.variableCosts.filter((_, j) => j !== i) }));
  const totalVarPct = model.variableCosts.reduce((s, c) => s + c.percentOfRevenue, 0);

  return (
    <Card>
      <Hdr color={C.step[2]} sub="Costs that scale directly with each unit of revenue (COGS, shipping, commissions)">
        <span style={{ marginRight: 8, fontSize: 18 }}>📊</span>Step 3: Variable Costs
      </Hdr>
      <div style={{ background: C.step[2]+"10", border: `1px solid ${C.step[2]}25`, borderRadius: 10, padding: "12px 16px", marginBottom: 18, fontSize: 14 }}>
        <span style={{ color: C.muted }}>Total variable cost: </span><strong style={{ color: C.text, fontFamily: mono }}>{totalVarPct.toFixed(1)}%</strong>
        <span style={{ color: C.muted, marginLeft: 12 }}>→ Contribution margin: </span>
        <strong style={{ color: totalVarPct < 60 ? C.success : C.danger, fontFamily: mono }}>{(100 - totalVarPct).toFixed(1)}%</strong>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}><Btn onClick={add} small>+ Variable Cost</Btn></div>
      {model.variableCosts.map((c, i) => (
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-end" }}>
          <Input label="Name" value={c.name} onChange={v => upd(i, "name", v)} type="text" sx={{ flex: 2 }} />
          <Input label="% of Revenue" value={c.percentOfRevenue} onChange={v => upd(i, "percentOfRevenue", v)} step={1} min={0} max={100} sx={{ flex: 1 }} />
          <Btn onClick={() => rem(i)} small danger>✕</Btn>
        </div>
      ))}
    </Card>
  );
}

// ─── STEP 4: FUNDING & WORKING CAPITAL ──────────────────────────────────────
function Step4Funding({ model, setModel, fundingGap }) {
  const addRound = (type) => setModel(m => ({ ...m, fundingRounds: [...m.fundingRounds,
    type === "debt"
      ? { name: `Loan ${m.fundingRounds.filter(r=>r.type==="debt").length+1}`, month: 6, amount: 100000, type: "debt", termMonths: 36, interestRate: 8 }
      : { name: `Round ${m.fundingRounds.filter(r=>r.type!=="debt").length+1}`, month: 12, amount: 200000, type: "equity" }
  ] }));
  const updRound = (i, f, v) => setModel(m => ({ ...m, fundingRounds: m.fundingRounds.map((r, j) => j === i ? { ...r, [f]: v } : r) }));
  const remRound = (i) => setModel(m => ({ ...m, fundingRounds: m.fundingRounds.filter((_, j) => j !== i) }));

  const totalEquity = model.initialCash + model.fundingRounds.filter(r => r.type !== "debt").reduce((s, r) => s + r.amount, 0);
  const totalDebt = model.fundingRounds.filter(r => r.type === "debt").reduce((s, r) => s + r.amount, 0);

  // Compute effective operating cost CCC
  const opItems = model.operatingAssets.filter(a => a.type === "operating");
  const totalOpCost = opItems.reduce((s, a) => s + a.monthlyCost, 0);
  const weightedDaysPayable = totalOpCost > 0 ? opItems.reduce((s, a) => s + a.monthlyCost * (a.daysPayable || 0), 0) / totalOpCost : 0;
  const ccc = model.workingCapital.daysReceivable + (model.workingCapital.daysInventory || 0) - weightedDaysPayable;

  return (
    <Card>
      <Hdr color={C.step[3]} sub="How do we fund the necessary operating assets? Working capital cycle and capital structure.">
        <span style={{ marginRight: 8, fontSize: 18 }}>🏦</span>Step 4: Funding & Working Capital
      </Hdr>

      {fundingGap > 0 ? (
        <div style={{ background: C.dangerDim, border: `1px solid ${C.danger}40`, borderRadius: 10, padding: "12px 16px", marginBottom: 18, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 18 }}>⚠️</span>
          <div><div style={{ fontSize: 15, color: C.danger, fontWeight: 600 }}>Funding Gap: {fmtC(fundingGap)}</div>
          <div style={{ fontSize: 13, color: C.muted }}>Your model runs out of cash. Add funding or adjust the model.</div></div>
        </div>
      ) : (
        <div style={{ background: C.successDim, border: `1px solid ${C.success}40`, borderRadius: 10, padding: "12px 16px", marginBottom: 18, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 18 }}>✅</span>
          <div style={{ fontSize: 15, color: C.success, fontWeight: 600 }}>Fully funded — no cash shortfall over 5 years.</div>
        </div>
      )}

      {/* Working Capital */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 10 }}>Working Capital Cycle</div>
        <div style={{ background: C.step[3]+"10", border: `1px solid ${C.step[3]}25`, borderRadius: 10, padding: "14px 16px", marginBottom: 12, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, color: C.muted }}>Cash Conversion Cycle:</span>
          <span style={{ fontSize: 16, fontFamily: mono, fontWeight: 700, color: ccc <= 0 ? C.success : ccc < 30 ? C.warning : C.danger }}>{ccc.toFixed(0)} days</span>
          <span style={{ fontSize: 12, color: C.dim }}>
            = {model.workingCapital.daysReceivable}d receivables + {model.workingCapital.daysInventory||0}d inventory − {weightedDaysPayable.toFixed(0)}d wtd payables
          </span>
        </div>
        <div className="grid-2-col" style={{ gap: 10 }}>
          <Input label="Days Receivable (customer payment terms)" value={model.workingCapital.daysReceivable} onChange={v => setModel(m => ({ ...m, workingCapital: { ...m.workingCapital, daysReceivable: v } }))} min={0} max={120} />
          <Input label="Days Inventory" value={model.workingCapital.daysInventory || 0} onChange={v => setModel(m => ({ ...m, workingCapital: { ...m.workingCapital, daysInventory: v } }))} min={0} max={120} />
        </div>
        <div style={{ fontSize: 12, color: C.dim, marginTop: 8, padding: "0 4px" }}>
          💡 Supplier/operating cost payment terms are set per item in Step 2. Payroll at 0 days = paid immediately from cash.
        </div>
      </div>

      {/* Capital */}
      <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 10 }}>Capital Structure</div>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-end", marginBottom: 16 }}>
        <Input label="Initial Cash (£)" value={model.initialCash} onChange={v => setModel(m => ({ ...m, initialCash: v }))} step={10000} sx={{ flex: 1 }} />
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <label style={{ fontSize: 12, color: C.muted, textTransform: "uppercase" }}>Total Equity</label>
            <div style={{ padding: "6px 10px", fontSize: 16, fontFamily: mono, color: C.success, fontWeight: 600 }}>{fmtC(totalEquity)}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <label style={{ fontSize: 12, color: C.muted, textTransform: "uppercase" }}>Total Debt</label>
            <div style={{ padding: "6px 10px", fontSize: 16, fontFamily: mono, color: C.warning, fontWeight: 600 }}>{fmtC(totalDebt)}</div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 14, color: C.muted }}>Funding Rounds</span>
        <div style={{ display: "flex", gap: 6 }}>
          <Btn onClick={() => addRound("equity")} small color={C.success}>+ Equity</Btn>
          <Btn onClick={() => addRound("debt")} small color={C.warning}>+ Debt</Btn>
        </div>
      </div>
      {model.fundingRounds.map((r, i) => (
        <div key={i} style={{ background: C.bg, borderRadius: 8, padding: 12, marginBottom: 8, border: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap" }}>
            <Input label="Name" value={r.name} onChange={v => updRound(i, "name", v)} type="text" sx={{ flex: 1.5 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <label style={{ fontSize: 12, color: C.muted, textTransform: "uppercase" }}>Type</label>
              <Badge color={r.type === "debt" ? C.warning : C.success}>{r.type === "debt" ? "Debt" : "Equity"}</Badge>
            </div>
            <Input label="Month" value={r.month} onChange={v => updRound(i, "month", v)} min={1} max={60} sx={{ flex: 0.6 }} />
            <Input label="Amount (£)" value={r.amount} onChange={v => updRound(i, "amount", v)} step={10000} sx={{ flex: 1 }} />
            {r.type === "debt" && (
              <>
                <Input label="Term (months)" value={r.termMonths || 36} onChange={v => updRound(i, "termMonths", v)} min={6} max={120} sx={{ flex: 0.7 }} />
                <Input label="Interest (%/yr)" value={r.interestRate || 8} onChange={v => updRound(i, "interestRate", v)} step={0.5} min={0} sx={{ flex: 0.7 }} />
              </>
            )}
            <Btn onClick={() => remRound(i)} small danger>✕</Btn>
          </div>
          {r.type === "debt" && (
            <div style={{ fontSize: 12, color: C.dim, marginTop: 6, paddingLeft: 4 }}>
              Monthly: {fmtC(r.amount / (r.termMonths || 36))} principal + {fmtC(r.amount * (r.interestRate || 8) / 100 / 12)} interest (initial)
              = {fmtC(r.amount / (r.termMonths || 36) + r.amount * (r.interestRate || 8) / 100 / 12)} total payment
            </div>
          )}
        </div>
      ))}

      {/* Export Model Inputs Button */}
      <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
        <Btn onClick={() => exportModelInputs(model)} small>Export Model Inputs (CSV)</Btn>
      </div>
    </Card>
  );
}

// Export model inputs to CSV
function exportModelInputs(model) {
  const rows = [];
  rows.push(["Financial Model - Detailed Inputs"]);
  rows.push(["Exported", new Date().toLocaleString()]);
  rows.push([]);

  // Revenue Streams
  rows.push(["REVENUE STREAMS"]);
  rows.push(["Name", "Price/Unit (£)", "Units/Transaction", "Frequency/Year", "Initial Customers", "Monthly Growth (%)", "Monthly Churn (%)"]);
  model.revenueStreams.forEach(s => {
    rows.push([s.name, s.pricePerUnit, s.unitsPerTransaction, s.frequencyPerYear, s.initialCustomers, s.customerGrowthRate, s.churnRate]);
  });
  rows.push([]);

  // Operating Assets
  rows.push(["OPERATING ASSETS"]);
  rows.push(["Name", "Type", "Monthly Cost (£)", "Initial Cost (£)", "Useful Life (Years)", "Monthly Growth (%)", "Days Payable", "Scale with Revenue"]);
  model.operatingAssets.forEach(a => {
    if (a.type === "operating") {
      rows.push([a.name, "Operating", a.monthlyCost, "", "", a.growthRate || 0, a.daysPayable || 0, a.scaleWithRevenue ? "Yes" : "No"]);
    } else {
      rows.push([a.name, "Fixed Asset", "", a.cost, a.usefulLifeYears, "", "", ""]);
    }
  });
  rows.push([]);

  // Variable Costs
  rows.push(["VARIABLE COSTS"]);
  rows.push(["Name", "% of Revenue"]);
  model.variableCosts.forEach(c => {
    rows.push([c.name, c.percentOfRevenue]);
  });
  rows.push([]);

  // Working Capital
  rows.push(["WORKING CAPITAL"]);
  rows.push(["Days Receivable", model.workingCapital.daysReceivable]);
  rows.push(["Days Inventory", model.workingCapital.daysInventory || 0]);
  rows.push([]);

  // Capital Structure
  rows.push(["CAPITAL STRUCTURE"]);
  rows.push(["Initial Cash (£)", model.initialCash]);
  rows.push([]);

  // Funding Rounds
  if (model.fundingRounds.length > 0) {
    rows.push(["FUNDING ROUNDS"]);
    rows.push(["Name", "Type", "Month", "Amount (£)", "Term (Months)", "Interest Rate (%)"]);
    model.fundingRounds.forEach(r => {
      rows.push([r.name, r.type, r.month, r.amount, r.type === "debt" ? (r.termMonths || 36) : "", r.type === "debt" ? (r.interestRate || 8) : ""]);
    });
  }

  // Convert to CSV string
  const csvContent = rows.map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");

  // Trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "model-inputs.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ─── MODEL BUILDER TAB ──────────────────────────────────────────────────────
function ModelBuilderTab({ model, setModel }) {
  const [activeStep, setActiveStep] = useState(0);
  const { fundingGap } = useMemo(() => runProjection(model), [model]);
  const steps = [
    { num: 1, label: "Revenue Model", color: C.step[0] },
    { num: 2, label: "Operating Assets", color: C.step[1] },
    { num: 3, label: "Variable Costs", color: C.step[2] },
    { num: 4, label: "Funding & Working Capital", color: C.step[3] },
  ];
  const renderStep = (n) => {
    if (n === 0) return <Step1Revenue model={model} setModel={setModel} />;
    if (n === 1) return <Step2Assets model={model} setModel={setModel} />;
    if (n === 2) return <Step3Costs model={model} setModel={setModel} />;
    return <Step4Funding model={model} setModel={setModel} fundingGap={fundingGap} />;
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 24, padding: "12px 0", borderBottom: `1px solid ${C.border}`, flexWrap: "wrap" }}>
        {steps.map((s, i) => (<div key={i} onClick={() => setActiveStep(i)}><StepInd number={s.num} label={s.label} color={s.color} active={activeStep === i} /></div>))}
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <Btn onClick={() => setActiveStep(Math.min(3, activeStep + 1))} small disabled={activeStep === 3}>Next →</Btn>
          <Btn onClick={() => setActiveStep(-1)} small color={C.dim}>All</Btn>
        </div>
      </div>
      {activeStep === -1 ? <>{[0,1,2,3].map(n => <div key={n}>{renderStep(n)}</div>)}</> : renderStep(activeStep)}
      {activeStep >= 0 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
          {activeStep > 0 && <Btn onClick={() => setActiveStep(activeStep - 1)} small>← Previous</Btn>}
          {activeStep < 3 && <Btn onClick={() => setActiveStep(activeStep + 1)} small color={steps[activeStep].color}>Next: {steps[activeStep + 1]?.label} →</Btn>}
        </div>
      )}
    </div>
  );
}

// ─── PROJECTIONS TAB ────────────────────────────────────────────────────────
function ProjectionsTab({ model }) {
  const { data, breakevenMonth, fundingGap, minCashMonth } = useMemo(() => runProjection(model), [model]);
  const annualData = useMemo(() => {
    const years = [];
    for (let y = 1; y <= 5; y++) {
      const yd = data.filter(d => d.year === y); const last = yd[yd.length - 1];
      const prevYearEnd = y > 1 ? data.filter(d => d.year === y - 1).slice(-1)[0] : null;
      const beginCash = prevYearEnd ? prevYearEnd.cumulativeCash : model.initialCash;
      years.push({
        year: `Year ${y}`,
        // P&L items
        revenue: yd.reduce((s,d)=>s+d.revenue,0),
        variableCosts: yd.reduce((s,d)=>s+d.variableCosts,0),
        grossProfit: yd.reduce((s,d)=>s+d.grossProfit,0),
        operatingCosts: yd.reduce((s,d)=>s+d.operatingCosts,0),
        depreciation: yd.reduce((s,d)=>s+d.depreciation,0),
        totalCosts: yd.reduce((s,d)=>s+d.totalCosts,0),
        ebit: yd.reduce((s,d)=>s+d.ebit,0),
        interest: yd.reduce((s,d)=>s+d.interestExpense,0),
        netIncome: yd.reduce((s,d)=>s+d.netIncome,0),
        // Cash flow items
        opCF: yd.reduce((s,d)=>s+d.operatingCashFlow,0),
        wcChange: yd.reduce((s,d)=>s+d.wcChange,0),
        capEx: yd.reduce((s,d)=>s+d.capEx,0),
        investingCF: yd.reduce((s,d)=>s+d.investingCashFlow,0),
        equityFunding: yd.reduce((s,d)=>s+d.equityFunding,0),
        debtFunding: yd.reduce((s,d)=>s+d.debtFunding,0),
        principalRepayment: yd.reduce((s,d)=>s+d.principalRepayment,0),
        financingCF: yd.reduce((s,d)=>s+d.financingCashFlow,0),
        beginCash,
        endCash: last?.cumulativeCash||0,
        // Other metrics
        nwc: last?.netWorkingCapital||0,
        customers: last?.totalCustomers||0,
        debt: last?.debtOutstanding||0,
        // Balance sheet (end-of-year snapshot)
        fixedAssets: last?.fixedAssetNBV||0, receivables: last?.receivables||0, inventory: last?.inventory||0,
        totalAssets: last?.totalAssets||0, payables: last?.payables||0, totalLiabilities: last?.totalLiabilities||0,
        equity: last?.cumulativeEquity||0, retainedEarnings: last?.retainedEarnings||0, totalEquity: last?.totalEquitySide||0,
      });
    }
    return years;
  }, [data, model.initialCash]);
  const qData = useMemo(() => {
    const q = [];
    for (let i = 0; i < 20; i++) { const qd = data.slice(i*3,(i+1)*3); if(!qd.length) continue;
      q.push({ label: `Y${Math.floor(i/4)+1}Q${(i%4)+1}`, revenue: qd.reduce((s,d)=>s+d.revenue,0), totalCosts: qd.reduce((s,d)=>s+d.totalCosts,0), netIncome: qd.reduce((s,d)=>s+d.netIncome,0), ebit: qd.reduce((s,d)=>s+d.ebit,0), grossProfit: qd.reduce((s,d)=>s+d.grossProfit,0), cash: qd[qd.length-1]?.cumulativeCash||0, nwc: qd[qd.length-1]?.netWorkingCapital||0, customers: qd[qd.length-1]?.totalCustomers||0, debt: qd[qd.length-1]?.debtOutstanding||0 }); }
    return q;
  }, [data]);
  const final = data[59];
  const y5Rev = annualData[4]?.revenue||0;
  const opItems = model.operatingAssets.filter(a => a.type === "operating");
  const totalOpCost = opItems.reduce((s, a) => s + a.monthlyCost, 0);
  const wtdPay = totalOpCost > 0 ? opItems.reduce((s, a) => s + a.monthlyCost * (a.daysPayable||0), 0) / totalOpCost : 0;
  const ccc = model.workingCapital.daysReceivable + (model.workingCapital.daysInventory||0) - wtdPay;

  // CSV Export function
  const exportCSV = () => {
    const rows = [];
    // Header
    rows.push(["Financial Model - 5-Year Projections"]);
    rows.push([]);

    // Annual Summary
    rows.push(["ANNUAL SUMMARY"]);
    rows.push(["", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5"]);
    rows.push(["Revenue", ...annualData.map(r => r.revenue.toFixed(0))]);
    rows.push(["EBIT", ...annualData.map(r => r.ebit.toFixed(0))]);
    rows.push(["Interest", ...annualData.map(r => r.interest.toFixed(0))]);
    rows.push(["Net Income", ...annualData.map(r => r.netIncome.toFixed(0))]);
    rows.push(["Operating Cash Flow", ...annualData.map(r => r.opCF.toFixed(0))]);
    rows.push(["Cash (End of Year)", ...annualData.map(r => r.endCash.toFixed(0))]);
    rows.push(["Net Working Capital", ...annualData.map(r => r.nwc.toFixed(0))]);
    rows.push(["Debt Outstanding", ...annualData.map(r => r.debt.toFixed(0))]);
    rows.push(["Customers", ...annualData.map(r => r.customers.toFixed(0))]);
    rows.push([]);

    // P&L Statement
    rows.push(["PROFIT & LOSS STATEMENT"]);
    rows.push(["", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5"]);
    rows.push(["Revenue", ...annualData.map(r => r.revenue.toFixed(0))]);
    rows.push(["Cost of Goods Sold", ...annualData.map(r => (-r.variableCosts).toFixed(0))]);
    rows.push(["Gross Profit", ...annualData.map(r => r.grossProfit.toFixed(0))]);
    rows.push(["Operating Costs", ...annualData.map(r => (-(r.operatingCosts - r.depreciation)).toFixed(0))]);
    rows.push(["Depreciation", ...annualData.map(r => (-r.depreciation).toFixed(0))]);
    rows.push(["Total Operating Expenses", ...annualData.map(r => (-r.operatingCosts).toFixed(0))]);
    rows.push(["EBIT", ...annualData.map(r => r.ebit.toFixed(0))]);
    rows.push(["Interest Expense", ...annualData.map(r => (-r.interest).toFixed(0))]);
    rows.push(["Net Income", ...annualData.map(r => r.netIncome.toFixed(0))]);
    rows.push([]);

    // Cash Flow Statement
    rows.push(["CASH FLOW STATEMENT"]);
    rows.push(["", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5"]);
    rows.push(["Net Income", ...annualData.map(r => r.netIncome.toFixed(0))]);
    rows.push(["Add: Depreciation", ...annualData.map(r => r.depreciation.toFixed(0))]);
    rows.push(["Less: Change in WC", ...annualData.map(r => (-r.wcChange).toFixed(0))]);
    rows.push(["Net Cash from Operations", ...annualData.map(r => r.opCF.toFixed(0))]);
    rows.push(["Capital Expenditure", ...annualData.map(r => (-r.capEx).toFixed(0))]);
    rows.push(["Net Cash from Investing", ...annualData.map(r => r.investingCF.toFixed(0))]);
    rows.push(["Equity Raised", ...annualData.map(r => r.equityFunding.toFixed(0))]);
    rows.push(["Debt Proceeds", ...annualData.map(r => r.debtFunding.toFixed(0))]);
    rows.push(["Debt Repayment", ...annualData.map(r => (-r.principalRepayment).toFixed(0))]);
    rows.push(["Net Cash from Financing", ...annualData.map(r => r.financingCF.toFixed(0))]);
    rows.push(["Beginning Cash", ...annualData.map(r => r.beginCash.toFixed(0))]);
    rows.push(["Ending Cash", ...annualData.map(r => r.endCash.toFixed(0))]);
    rows.push([]);

    // Balance Sheet
    rows.push(["BALANCE SHEET (END OF YEAR)"]);
    rows.push(["", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5"]);
    rows.push(["Cash", ...annualData.map(r => r.endCash.toFixed(0))]);
    rows.push(["Receivables", ...annualData.map(r => r.receivables.toFixed(0))]);
    rows.push(["Inventory", ...annualData.map(r => r.inventory.toFixed(0))]);
    rows.push(["Fixed Assets (NBV)", ...annualData.map(r => r.fixedAssets.toFixed(0))]);
    rows.push(["Total Assets", ...annualData.map(r => r.totalAssets.toFixed(0))]);
    rows.push(["Payables", ...annualData.map(r => r.payables.toFixed(0))]);
    rows.push(["Debt Outstanding", ...annualData.map(r => r.debt.toFixed(0))]);
    rows.push(["Total Liabilities", ...annualData.map(r => r.totalLiabilities.toFixed(0))]);
    rows.push(["Equity Invested", ...annualData.map(r => r.equity.toFixed(0))]);
    rows.push(["Retained Earnings", ...annualData.map(r => r.retainedEarnings.toFixed(0))]);
    rows.push(["Total Equity", ...annualData.map(r => r.totalEquity.toFixed(0))]);

    // Convert to CSV string
    const csvContent = rows.map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");

    // Trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "financial-projections.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // PDF Export function (uses browser print)
  const exportPDF = () => {
    window.print();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
        <Metric label="Year 5 ARR" value={fmtC(y5Rev)} icon="📈" color={C.success} />
        <Metric label="Break-Even" value={breakevenMonth?`Month ${breakevenMonth}`:"Not reached"} icon="⚖️" color={breakevenMonth?C.success:C.danger} />
        <Metric label="Cash (Y5)" value={fmtC(final?.cumulativeCash||0)} icon="💰" color={(final?.cumulativeCash||0)>=0?C.success:C.danger} />
        <Metric label="Funding Gap" value={fundingGap>0?fmtC(fundingGap):"None"} sub={fundingGap>0?`Lowest Mo ${minCashMonth}`:""} icon="🏦" color={fundingGap>0?C.danger:C.success} />
        <Metric label="Cash Cycle" value={`${ccc.toFixed(0)}d`} icon="🔄" color={ccc<=0?C.success:ccc<30?C.warning:C.danger} />
        <Metric label="Debt Outstanding (Y5)" value={fmtC(final?.debtOutstanding||0)} icon="📋" color={final?.debtOutstanding>0?C.warning:C.success} />
      </div>

      <div className="export-buttons" style={{ display: "flex", gap: 10, marginBottom: 6 }}>
        <Btn onClick={exportCSV} small>Export CSV</Btn>
        <Btn onClick={exportPDF} small>Export PDF</Btn>
      </div>

      <Card className="no-print">
        <Hdr sub="Quarterly revenue, EBIT, and net income (after interest)">P&L Overview</Hdr>
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={qData}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: C.dim }} interval={1} />
            <YAxis tick={{ fontSize: 12, fill: C.dim }} tickFormatter={fmt} />
            <Tooltip contentStyle={ttStyle} formatter={v => fmtC(v)} />
            <Legend wrapperStyle={{ fontSize: 13 }} />
            <Area type="monotone" dataKey="revenue" name="Revenue" fill={C.success+"20"} stroke={C.success} strokeWidth={2} />
            <Area type="monotone" dataKey="totalCosts" name="Total Costs" fill={C.danger+"12"} stroke={C.danger} strokeWidth={2} />
            <Line type="monotone" dataKey="ebit" name="EBIT" stroke={C.purple} strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="netIncome" name="Net Income" stroke={C.accent} strokeWidth={2.5} dot={false} />
            <ReferenceLine y={0} stroke={C.dim} strokeDasharray="3 3" />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid-2-col no-print">
        <Card>
          <Hdr sub="Cash position including WC effects and debt service">Cash Flow</Hdr>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={data.filter((_,i)=>i%3===0)}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: C.dim }} tickFormatter={v=>`M${v}`} />
              <YAxis tick={{ fontSize: 12, fill: C.dim }} tickFormatter={fmt} />
              <Tooltip contentStyle={ttStyle} formatter={v=>fmtC(v)} labelFormatter={l=>`Month ${l}`} />
              <ReferenceLine y={0} stroke={C.dim} strokeDasharray="3 3" />
              <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.accent} stopOpacity={0.3}/><stop offset="95%" stopColor={C.accent} stopOpacity={0.02}/></linearGradient></defs>
              <Area type="monotone" dataKey="cumulativeCash" name="Cash" fill="url(#cg)" stroke={C.accent} strokeWidth={2.5} />
              {final?.debtOutstanding > 0 && <Line type="monotone" dataKey="debtOutstanding" name="Debt Outstanding" stroke={C.warning} strokeWidth={1.5} strokeDasharray="4 4" dot={false} />}
            </ComposedChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <Hdr sub="Net working capital over time">Working Capital</Hdr>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={data.filter((_,i)=>i%3===0)}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: C.dim }} tickFormatter={v=>`M${v}`} />
              <YAxis tick={{ fontSize: 12, fill: C.dim }} tickFormatter={fmt} />
              <Tooltip contentStyle={ttStyle} formatter={v=>fmtC(v)} labelFormatter={l=>`Month ${l}`} />
              <ReferenceLine y={0} stroke={C.dim} strokeDasharray="3 3" />
              <Area type="monotone" dataKey="netWorkingCapital" name="Net WC" fill={C.warning+"15"} stroke={C.warning} strokeWidth={2} />
              <Bar dataKey="wcChange" name="WC Change" fill={C.purple+"60"} />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <Hdr sub="Year-by-year financial summary">Annual Summary</Hdr>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead><tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {["","Revenue","EBIT","Interest","Net Income","Op. CF","Cash","NWC","Debt","Customers"].map(h=>(
                <th key={h} style={{ textAlign: h?"right":"left", padding: "8px 8px", color: C.muted, fontSize: 12, textTransform: "uppercase", fontWeight: 500 }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>{annualData.map((r,i)=>(
              <tr key={i} style={{ borderBottom: `1px solid ${C.border}18` }}>
                <td style={{ padding: "8px", color: C.text, fontWeight: 600 }}>{r.year}</td>
                <td style={{ padding: "8px", textAlign: "right", color: C.success, fontFamily: mono }}>{fmtC(r.revenue)}</td>
                <td style={{ padding: "8px", textAlign: "right", color: r.ebit>=0?C.purple:C.danger, fontFamily: mono }}>{fmtC(r.ebit)}</td>
                <td style={{ padding: "8px", textAlign: "right", color: C.warning, fontFamily: mono }}>{r.interest>0?`(${fmtC(r.interest)})`:fmtC(0)}</td>
                <td style={{ padding: "8px", textAlign: "right", color: r.netIncome>=0?C.success:C.danger, fontFamily: mono }}>{fmtC(r.netIncome)}</td>
                <td style={{ padding: "8px", textAlign: "right", color: r.opCF>=0?C.success:C.danger, fontFamily: mono }}>{fmtC(r.opCF)}</td>
                <td style={{ padding: "8px", textAlign: "right", color: r.endCash>=0?C.accent:C.danger, fontFamily: mono }}>{fmtC(r.endCash)}</td>
                <td style={{ padding: "8px", textAlign: "right", color: C.warning, fontFamily: mono }}>{fmtC(r.nwc)}</td>
                <td style={{ padding: "8px", textAlign: "right", color: r.debt>0?C.warning:C.dim, fontFamily: mono }}>{fmtC(r.debt)}</td>
                <td style={{ padding: "8px", textAlign: "right", color: C.cyan, fontFamily: mono }}>{fmt(r.customers)}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </Card>

      {/* Profit & Loss Statement */}
      <Card>
        <Hdr sub="Annual income statement with gross and operating margins">Profit & Loss Statement</Hdr>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead><tr style={{ borderBottom: `2px solid ${C.border}` }}>
              {["","Year 1","Year 2","Year 3","Year 4","Year 5"].map(h=>(
                <th key={h} style={{ textAlign: h?"right":"left", padding: "8px 10px", color: C.muted, fontSize: 12, textTransform: "uppercase", fontWeight: 500 }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {/* Revenue */}
              <tr style={{ borderBottom: `1px solid ${C.border}20` }}>
                <td style={{ padding: "8px 10px", fontWeight: 700, color: C.success }}>Revenue</td>
                {annualData.map((r,i) => <td key={i} style={{ padding: "8px 10px", textAlign: "right", fontFamily: mono, fontWeight: 700, color: C.success, fontSize: 13 }}>{fmtC(r.revenue)}</td>)}
              </tr>
              {/* COGS / Variable Costs */}
              <tr style={{ borderBottom: `1px solid ${C.border}10` }}>
                <td style={{ padding: "5px 10px 5px 20px", color: C.muted, fontSize: 13 }}>Cost of Goods Sold</td>
                {annualData.map((r,i) => <td key={i} style={{ padding: "5px 10px", textAlign: "right", fontFamily: mono, color: C.danger, fontSize: 13 }}>({fmtC(r.variableCosts)})</td>)}
              </tr>
              {/* Gross Profit */}
              <tr style={{ borderBottom: `2px solid ${C.border}40` }}>
                <td style={{ padding: "6px 10px", fontWeight: 600, color: C.text, fontSize: 13 }}>Gross Profit</td>
                {annualData.map((r,i) => <td key={i} style={{ padding: "6px 10px", textAlign: "right", fontFamily: mono, fontWeight: 600, color: r.grossProfit>=0?C.text:C.danger, fontSize: 13 }}>{fmtC(r.grossProfit)}</td>)}
              </tr>
              {/* Gross Margin % */}
              <tr style={{ borderBottom: `1px solid ${C.border}10`, background: C.bg }}>
                <td style={{ padding: "4px 10px 4px 20px", color: C.dim, fontSize: 12, fontStyle: "italic" }}>Gross Margin %</td>
                {annualData.map((r,i) => <td key={i} style={{ padding: "4px 10px", textAlign: "right", fontFamily: mono, color: C.dim, fontSize: 12 }}>{r.revenue>0?fmtP(r.grossProfit/r.revenue):"—"}</td>)}
              </tr>
              {/* Operating Expenses header */}
              <tr><td colSpan={6} style={{ padding: "10px 10px 4px", fontSize: 13, fontWeight: 700, color: C.warning, textTransform: "uppercase", letterSpacing: "0.04em" }}>Operating Expenses</td></tr>
              {/* Operating Costs (excl depreciation) */}
              <tr style={{ borderBottom: `1px solid ${C.border}10` }}>
                <td style={{ padding: "5px 10px 5px 20px", color: C.muted, fontSize: 13 }}>Operating Costs</td>
                {annualData.map((r,i) => <td key={i} style={{ padding: "5px 10px", textAlign: "right", fontFamily: mono, color: C.warning, fontSize: 13 }}>({fmtC(r.operatingCosts - r.depreciation)})</td>)}
              </tr>
              {/* Depreciation */}
              <tr style={{ borderBottom: `1px solid ${C.border}10` }}>
                <td style={{ padding: "5px 10px 5px 20px", color: C.muted, fontSize: 13 }}>Depreciation</td>
                {annualData.map((r,i) => <td key={i} style={{ padding: "5px 10px", textAlign: "right", fontFamily: mono, color: C.purple, fontSize: 13 }}>({fmtC(r.depreciation)})</td>)}
              </tr>
              {/* Total Operating Expenses */}
              <tr style={{ borderBottom: `1px solid ${C.border}40` }}>
                <td style={{ padding: "6px 10px", fontWeight: 500, color: C.muted, fontSize: 13 }}>Total Operating Expenses</td>
                {annualData.map((r,i) => <td key={i} style={{ padding: "6px 10px", textAlign: "right", fontFamily: mono, fontWeight: 500, color: C.muted, fontSize: 13 }}>({fmtC(r.operatingCosts)})</td>)}
              </tr>
              {/* EBIT */}
              <tr style={{ borderBottom: `2px solid ${C.purple}40` }}>
                <td style={{ padding: "8px 10px", fontWeight: 700, color: C.purple, fontSize: 13 }}>EBIT (Operating Income)</td>
                {annualData.map((r,i) => <td key={i} style={{ padding: "8px 10px", textAlign: "right", fontFamily: mono, fontWeight: 700, color: r.ebit>=0?C.purple:C.danger, fontSize: 13 }}>{fmtC(r.ebit)}</td>)}
              </tr>
              {/* Operating Margin % */}
              <tr style={{ borderBottom: `1px solid ${C.border}10`, background: C.bg }}>
                <td style={{ padding: "4px 10px 4px 20px", color: C.dim, fontSize: 12, fontStyle: "italic" }}>Operating Margin %</td>
                {annualData.map((r,i) => <td key={i} style={{ padding: "4px 10px", textAlign: "right", fontFamily: mono, color: C.dim, fontSize: 12 }}>{r.revenue>0?fmtP(r.ebit/r.revenue):"—"}</td>)}
              </tr>
              {/* Interest Expense */}
              <tr style={{ borderBottom: `1px solid ${C.border}10` }}>
                <td style={{ padding: "5px 10px 5px 20px", color: C.muted, fontSize: 13 }}>Interest Expense</td>
                {annualData.map((r,i) => <td key={i} style={{ padding: "5px 10px", textAlign: "right", fontFamily: mono, color: r.interest>0?C.warning:C.dim, fontSize: 13 }}>{r.interest>0?`(${fmtC(r.interest)})`:"—"}</td>)}
              </tr>
              {/* Net Income */}
              <tr style={{ borderBottom: `2px solid ${C.success}40`, background: C.cardAlt }}>
                <td style={{ padding: "10px 10px", fontWeight: 700, color: C.text, fontSize: 14 }}>Net Income</td>
                {annualData.map((r,i) => <td key={i} style={{ padding: "10px 10px", textAlign: "right", fontFamily: mono, fontWeight: 700, color: r.netIncome>=0?C.success:C.danger, fontSize: 14 }}>{fmtC(r.netIncome)}</td>)}
              </tr>
              {/* Net Margin % */}
              <tr style={{ background: C.bg }}>
                <td style={{ padding: "4px 10px 4px 20px", color: C.dim, fontSize: 12, fontStyle: "italic" }}>Net Margin %</td>
                {annualData.map((r,i) => <td key={i} style={{ padding: "4px 10px", textAlign: "right", fontFamily: mono, color: C.dim, fontSize: 12 }}>{r.revenue>0?fmtP(r.netIncome/r.revenue):"—"}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Cash Flow Statement */}
      <Card>
        <Hdr sub="Annual cash flows from operating, investing, and financing activities">Cash Flow Statement</Hdr>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead><tr style={{ borderBottom: `2px solid ${C.border}` }}>
              {["","Year 1","Year 2","Year 3","Year 4","Year 5"].map(h=>(
                <th key={h} style={{ textAlign: h?"right":"left", padding: "8px 10px", color: C.muted, fontSize: 12, textTransform: "uppercase", fontWeight: 500 }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {/* Operating Activities header */}
              <tr><td colSpan={6} style={{ padding: "10px 10px 4px", fontSize: 13, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: "0.04em" }}>Cash Flows from Operating Activities</td></tr>
              {/* Net Income */}
              <tr style={{ borderBottom: `1px solid ${C.border}10` }}>
                <td style={{ padding: "5px 10px 5px 20px", color: C.muted, fontSize: 13 }}>Net Income</td>
                {annualData.map((r,i) => <td key={i} style={{ padding: "5px 10px", textAlign: "right", fontFamily: mono, color: r.netIncome>=0?C.success:C.danger, fontSize: 13 }}>{fmtC(r.netIncome)}</td>)}
              </tr>
              {/* Add: Depreciation */}
              <tr style={{ borderBottom: `1px solid ${C.border}10` }}>
                <td style={{ padding: "5px 10px 5px 20px", color: C.muted, fontSize: 13 }}>Add: Depreciation</td>
                {annualData.map((r,i) => <td key={i} style={{ padding: "5px 10px", textAlign: "right", fontFamily: mono, color: C.purple, fontSize: 13 }}>{fmtC(r.depreciation)}</td>)}
              </tr>
              {/* Less: Change in Working Capital */}
              <tr style={{ borderBottom: `1px solid ${C.border}10` }}>
                <td style={{ padding: "5px 10px 5px 20px", color: C.muted, fontSize: 13 }}>Less: Change in Working Capital</td>
                {annualData.map((r,i) => <td key={i} style={{ padding: "5px 10px", textAlign: "right", fontFamily: mono, color: r.wcChange>0?C.danger:C.success, fontSize: 13 }}>{r.wcChange>0?`(${fmtC(r.wcChange)})`:fmtC(-r.wcChange)}</td>)}
              </tr>
              {/* Operating Cash Flow */}
              <tr style={{ borderBottom: `2px solid ${C.accent}40` }}>
                <td style={{ padding: "8px 10px", fontWeight: 700, color: C.accent, fontSize: 13 }}>Net Cash from Operations</td>
                {annualData.map((r,i) => <td key={i} style={{ padding: "8px 10px", textAlign: "right", fontFamily: mono, fontWeight: 700, color: r.opCF>=0?C.accent:C.danger, fontSize: 13 }}>{fmtC(r.opCF)}</td>)}
              </tr>

              {/* Investing Activities header */}
              <tr><td colSpan={6} style={{ padding: "12px 10px 4px", fontSize: 13, fontWeight: 700, color: C.purple, textTransform: "uppercase", letterSpacing: "0.04em" }}>Cash Flows from Investing Activities</td></tr>
              {/* Capital Expenditure */}
              <tr style={{ borderBottom: `1px solid ${C.border}10` }}>
                <td style={{ padding: "5px 10px 5px 20px", color: C.muted, fontSize: 13 }}>Capital Expenditure (Fixed Assets)</td>
                {annualData.map((r,i) => <td key={i} style={{ padding: "5px 10px", textAlign: "right", fontFamily: mono, color: r.capEx>0?C.danger:C.dim, fontSize: 13 }}>{r.capEx>0?`(${fmtC(r.capEx)})`:"—"}</td>)}
              </tr>
              {/* Investing Cash Flow */}
              <tr style={{ borderBottom: `2px solid ${C.purple}40` }}>
                <td style={{ padding: "8px 10px", fontWeight: 700, color: C.purple, fontSize: 13 }}>Net Cash from Investing</td>
                {annualData.map((r,i) => <td key={i} style={{ padding: "8px 10px", textAlign: "right", fontFamily: mono, fontWeight: 700, color: r.investingCF>=0?C.purple:C.danger, fontSize: 13 }}>{fmtC(r.investingCF)}</td>)}
              </tr>

              {/* Financing Activities header */}
              <tr><td colSpan={6} style={{ padding: "12px 10px 4px", fontSize: 13, fontWeight: 700, color: C.success, textTransform: "uppercase", letterSpacing: "0.04em" }}>Cash Flows from Financing Activities</td></tr>
              {/* Equity Funding */}
              <tr style={{ borderBottom: `1px solid ${C.border}10` }}>
                <td style={{ padding: "5px 10px 5px 20px", color: C.muted, fontSize: 13 }}>Equity Raised</td>
                {annualData.map((r,i) => <td key={i} style={{ padding: "5px 10px", textAlign: "right", fontFamily: mono, color: r.equityFunding>0?C.success:C.dim, fontSize: 13 }}>{r.equityFunding>0?fmtC(r.equityFunding):"—"}</td>)}
              </tr>
              {/* Debt Funding */}
              <tr style={{ borderBottom: `1px solid ${C.border}10` }}>
                <td style={{ padding: "5px 10px 5px 20px", color: C.muted, fontSize: 13 }}>Debt Proceeds</td>
                {annualData.map((r,i) => <td key={i} style={{ padding: "5px 10px", textAlign: "right", fontFamily: mono, color: r.debtFunding>0?C.warning:C.dim, fontSize: 13 }}>{r.debtFunding>0?fmtC(r.debtFunding):"—"}</td>)}
              </tr>
              {/* Principal Repayment */}
              <tr style={{ borderBottom: `1px solid ${C.border}10` }}>
                <td style={{ padding: "5px 10px 5px 20px", color: C.muted, fontSize: 13 }}>Less: Debt Repayment</td>
                {annualData.map((r,i) => <td key={i} style={{ padding: "5px 10px", textAlign: "right", fontFamily: mono, color: r.principalRepayment>0?C.danger:C.dim, fontSize: 13 }}>{r.principalRepayment>0?`(${fmtC(r.principalRepayment)})`:"—"}</td>)}
              </tr>
              {/* Financing Cash Flow */}
              <tr style={{ borderBottom: `2px solid ${C.success}40` }}>
                <td style={{ padding: "8px 10px", fontWeight: 700, color: C.success, fontSize: 13 }}>Net Cash from Financing</td>
                {annualData.map((r,i) => <td key={i} style={{ padding: "8px 10px", textAlign: "right", fontFamily: mono, fontWeight: 700, color: r.financingCF>=0?C.success:C.danger, fontSize: 13 }}>{fmtC(r.financingCF)}</td>)}
              </tr>

              {/* Summary */}
              <tr><td colSpan={6} style={{ padding: "12px 10px 4px", fontSize: 13, fontWeight: 700, color: C.text, textTransform: "uppercase", letterSpacing: "0.04em" }}>Cash Summary</td></tr>
              {/* Net Change in Cash */}
              <tr style={{ borderBottom: `1px solid ${C.border}10` }}>
                <td style={{ padding: "5px 10px 5px 20px", color: C.muted, fontSize: 13 }}>Net Change in Cash</td>
                {annualData.map((r,i) => <td key={i} style={{ padding: "5px 10px", textAlign: "right", fontFamily: mono, color: (r.opCF+r.investingCF+r.financingCF)>=0?C.success:C.danger, fontSize: 13 }}>{fmtC(r.opCF + r.investingCF + r.financingCF)}</td>)}
              </tr>
              {/* Beginning Cash */}
              <tr style={{ borderBottom: `1px solid ${C.border}10` }}>
                <td style={{ padding: "5px 10px 5px 20px", color: C.muted, fontSize: 13 }}>Beginning Cash</td>
                {annualData.map((r,i) => <td key={i} style={{ padding: "5px 10px", textAlign: "right", fontFamily: mono, color: C.muted, fontSize: 13 }}>{fmtC(r.beginCash)}</td>)}
              </tr>
              {/* Ending Cash */}
              <tr style={{ borderBottom: `2px solid ${C.accent}40`, background: C.cardAlt }}>
                <td style={{ padding: "10px 10px", fontWeight: 700, color: C.text, fontSize: 14 }}>Ending Cash</td>
                {annualData.map((r,i) => <td key={i} style={{ padding: "10px 10px", textAlign: "right", fontFamily: mono, fontWeight: 700, color: r.endCash>=0?C.accent:C.danger, fontSize: 14 }}>{fmtC(r.endCash)}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Balance Sheet */}
      <Card>
        <Hdr sub="End-of-year balance sheet — Assets = Liabilities + Equity">Balance Sheet</Hdr>
        <div className="grid-2-col no-print" style={{ marginBottom: 18 }}>
          <div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={annualData} stackOffset="sign">
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis dataKey="year" tick={{ fontSize: 12, fill: C.dim }} />
                <YAxis tick={{ fontSize: 12, fill: C.dim }} tickFormatter={fmt} />
                <Tooltip contentStyle={ttStyle} formatter={v=>fmtC(v)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="endCash" name="Cash" stackId="a" fill={C.accent} radius={[0,0,0,0]} />
                <Bar dataKey="receivables" name="Receivables" stackId="a" fill={C.cyan} />
                <Bar dataKey="inventory" name="Inventory" stackId="a" fill={C.warning} />
                <Bar dataKey="fixedAssets" name="Fixed Assets (NBV)" stackId="a" fill={C.purple} radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
            <div style={{ textAlign: "center", fontSize: 12, color: C.dim, marginTop: 4 }}>Asset Composition</div>
          </div>
          <div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={annualData} stackOffset="sign">
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis dataKey="year" tick={{ fontSize: 12, fill: C.dim }} />
                <YAxis tick={{ fontSize: 12, fill: C.dim }} tickFormatter={fmt} />
                <Tooltip contentStyle={ttStyle} formatter={v=>fmtC(v)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <ReferenceLine y={0} stroke={C.dim} strokeDasharray="3 3" />
                <Bar dataKey="payables" name="Payables" stackId="b" fill={C.danger+"90"} />
                <Bar dataKey="debt" name="Debt" stackId="b" fill={C.warning+"90"} />
                <Bar dataKey="equity" name="Equity Invested" stackId="b" fill={C.success+"70"} />
                <Bar dataKey="retainedEarnings" name="Retained Earnings" stackId="b" fill={C.success} radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
            <div style={{ textAlign: "center", fontSize: 12, color: C.dim, marginTop: 4 }}>Liabilities + Equity</div>
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead><tr style={{ borderBottom: `2px solid ${C.border}` }}>
              {["","Year 1","Year 2","Year 3","Year 4","Year 5"].map(h=>(
                <th key={h} style={{ textAlign: h?"right":"left", padding: "8px 10px", color: C.muted, fontSize: 12, textTransform: "uppercase", fontWeight: 500 }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {/* Assets */}
              <tr><td colSpan={6} style={{ padding: "10px 10px 4px", fontSize: 13, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: "0.04em" }}>Assets</td></tr>
              {[
                { label: "Cash", key: "endCash", color: C.accent },
                { label: "Receivables", key: "receivables", color: C.cyan },
                { label: "Inventory", key: "inventory", color: C.warning },
                { label: "Fixed Assets (NBV)", key: "fixedAssets", color: C.purple },
              ].map(row => (
                <tr key={row.key} style={{ borderBottom: `1px solid ${C.border}10` }}>
                  <td style={{ padding: "5px 10px 5px 20px", color: C.muted, fontSize: 13 }}>{row.label}</td>
                  {annualData.map((r,i) => <td key={i} style={{ padding: "5px 10px", textAlign: "right", fontFamily: mono, color: row.color, fontSize: 13 }}>{fmtC(r[row.key])}</td>)}
                </tr>
              ))}
              <tr style={{ borderBottom: `2px solid ${C.accent}40` }}>
                <td style={{ padding: "6px 10px", fontWeight: 700, color: C.text, fontSize: 13 }}>Total Assets</td>
                {annualData.map((r,i) => <td key={i} style={{ padding: "6px 10px", textAlign: "right", fontFamily: mono, fontWeight: 700, color: C.text, fontSize: 13 }}>{fmtC(r.totalAssets)}</td>)}
              </tr>

              {/* Liabilities */}
              <tr><td colSpan={6} style={{ padding: "12px 10px 4px", fontSize: 13, fontWeight: 700, color: C.danger, textTransform: "uppercase", letterSpacing: "0.04em" }}>Liabilities</td></tr>
              {[
                { label: "Payables", key: "payables", color: C.danger },
                { label: "Debt Outstanding", key: "debt", color: C.warning },
              ].map(row => (
                <tr key={row.key} style={{ borderBottom: `1px solid ${C.border}10` }}>
                  <td style={{ padding: "5px 10px 5px 20px", color: C.muted, fontSize: 13 }}>{row.label}</td>
                  {annualData.map((r,i) => <td key={i} style={{ padding: "5px 10px", textAlign: "right", fontFamily: mono, color: row.color, fontSize: 13 }}>{fmtC(r[row.key])}</td>)}
                </tr>
              ))}
              <tr style={{ borderBottom: `1px solid ${C.border}40` }}>
                <td style={{ padding: "6px 10px", fontWeight: 600, color: C.text, fontSize: 13 }}>Total Liabilities</td>
                {annualData.map((r,i) => <td key={i} style={{ padding: "6px 10px", textAlign: "right", fontFamily: mono, fontWeight: 600, color: C.text, fontSize: 13 }}>{fmtC(r.totalLiabilities)}</td>)}
              </tr>

              {/* Equity */}
              <tr><td colSpan={6} style={{ padding: "12px 10px 4px", fontSize: 13, fontWeight: 700, color: C.success, textTransform: "uppercase", letterSpacing: "0.04em" }}>Equity</td></tr>
              {[
                { label: "Equity Invested", key: "equity", color: C.success },
                { label: "Retained Earnings", key: "retainedEarnings", color: null },
              ].map(row => (
                <tr key={row.key} style={{ borderBottom: `1px solid ${C.border}10` }}>
                  <td style={{ padding: "5px 10px 5px 20px", color: C.muted, fontSize: 13 }}>{row.label}</td>
                  {annualData.map((r,i) => <td key={i} style={{ padding: "5px 10px", textAlign: "right", fontFamily: mono, color: row.color || (r[row.key]>=0?C.success:C.danger), fontSize: 13 }}>{fmtC(r[row.key])}</td>)}
                </tr>
              ))}
              <tr style={{ borderBottom: `2px solid ${C.success}40` }}>
                <td style={{ padding: "6px 10px", fontWeight: 700, color: C.text, fontSize: 13 }}>Total Equity</td>
                {annualData.map((r,i) => <td key={i} style={{ padding: "6px 10px", textAlign: "right", fontFamily: mono, fontWeight: 700, color: C.text, fontSize: 13 }}>{fmtC(r.totalEquity)}</td>)}
              </tr>

              {/* Check line */}
              <tr style={{ background: C.bg }}>
                <td style={{ padding: "8px 10px", fontWeight: 600, color: C.dim, fontSize: 12 }}>Liabilities + Equity</td>
                {annualData.map((r,i) => <td key={i} style={{ padding: "8px 10px", textAlign: "right", fontFamily: mono, fontWeight: 600, color: Math.abs(r.totalAssets - (r.totalLiabilities + r.totalEquity)) < 1 ? C.success : C.danger, fontSize: 13 }}>{fmtC(r.totalLiabilities + r.totalEquity)}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── SCENARIO EXPLORER TAB ──────────────────────────────────────────────────
function ScenarioTab({ model }) {
  const [ov, setOv] = useState({
    priceAdj: 0, freqAdj: 0, custGrowthAdj: 0, churnAdj: 0,
    opCostMult: 100, varCostAdj: 0,
    daysRecAdj: 0, daysPayAdj: 0, daysInvAdj: 0,
    addEquity: 0, addDebtAmt: 0, addDebtRate: 8, addDebtTerm: 36,
  });

  const scenarioModel = useMemo(() => {
    const m = JSON.parse(JSON.stringify(model));
    m.revenueStreams = m.revenueStreams.map(s => ({
      ...s, pricePerUnit: s.pricePerUnit * (1 + ov.priceAdj / 100),
      frequencyPerYear: Math.max(1, s.frequencyPerYear + ov.freqAdj),
      customerGrowthRate: s.customerGrowthRate + ov.custGrowthAdj,
      churnRate: Math.max(0, s.churnRate + ov.churnAdj),
    }));
    m.operatingAssets = m.operatingAssets.map(a => a.type === "operating" ? { ...a, monthlyCost: a.monthlyCost * (ov.opCostMult / 100) } : a);
    m.variableCosts = m.variableCosts.map(c => ({ ...c, percentOfRevenue: Math.max(0, c.percentOfRevenue + ov.varCostAdj) }));
    m.workingCapital = {
      daysReceivable: Math.max(0, m.workingCapital.daysReceivable + ov.daysRecAdj),
      daysInventory: Math.max(0, (m.workingCapital.daysInventory||0) + ov.daysInvAdj),
    };
    // Adjust operating cost payment terms
    if (ov.daysPayAdj !== 0) m.operatingAssets = m.operatingAssets.map(a => a.type === "operating" ? { ...a, daysPayable: Math.max(0, (a.daysPayable||0) + ov.daysPayAdj) } : a);
    if (ov.addEquity > 0) m.fundingRounds = [...m.fundingRounds, { name: "Scenario Equity", month: 18, amount: ov.addEquity, type: "equity" }];
    if (ov.addDebtAmt > 0) m.fundingRounds = [...m.fundingRounds, { name: "Scenario Debt", month: 12, amount: ov.addDebtAmt, type: "debt", termMonths: ov.addDebtTerm, interestRate: ov.addDebtRate }];
    return m;
  }, [model, ov]);

  const base = useMemo(() => runProjection(model), [model]);
  const scenario = useMemo(() => runProjection(scenarioModel), [scenarioModel]);

  const comp = useMemo(() => base.data.filter((_,i)=>i%3===0).map((d,i) => ({
    month: d.month,
    baseRev: d.revenue, scRev: scenario.data[i*3]?.revenue||0,
    baseCash: d.cumulativeCash, scCash: scenario.data[i*3]?.cumulativeCash||0,
    baseEBIT: d.ebit, scEBIT: scenario.data[i*3]?.ebit||0,
    baseNI: d.netIncome, scNI: scenario.data[i*3]?.netIncome||0,
  })), [base, scenario]);

  const bf = base.data[59], sf = scenario.data[59];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <Card>
        <Hdr sub="Adjust parameters relative to your base case">Scenario Parameters</Hdr>
        <div className="scenario-grid">
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.step[0], marginBottom: 10 }}>📈 Revenue Levers</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Slider label="Price Adjustment" value={ov.priceAdj} onChange={v=>setOv(o=>({...o,priceAdj:v}))} min={-50} max={50} suffix="%" color={C.step[0]} />
              <Slider label="Frequency Adj." value={ov.freqAdj} onChange={v=>setOv(o=>({...o,freqAdj:v}))} min={-6} max={12} step={1} suffix="/yr" color={C.ch[2]} />
              <Slider label="Customer Growth" value={ov.custGrowthAdj} onChange={v=>setOv(o=>({...o,custGrowthAdj:v}))} min={-10} max={10} step={0.5} suffix="pp" color={C.ch[1]} />
              <Slider label="Churn Adj." value={ov.churnAdj} onChange={v=>setOv(o=>({...o,churnAdj:v}))} min={-5} max={10} step={0.5} suffix="pp" color={C.ch[5]} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.step[2], marginBottom: 10 }}>💸 Cost & Funding</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Slider label="Operating Cost ×" value={ov.opCostMult} onChange={v=>setOv(o=>({...o,opCostMult:v}))} min={50} max={200} suffix="%" color={C.step[2]} />
              <Slider label="Variable Cost Adj." value={ov.varCostAdj} onChange={v=>setOv(o=>({...o,varCostAdj:v}))} min={-20} max={20} step={1} suffix="pp" color={C.danger} />
              <Slider label="Add Equity (£K)" value={ov.addEquity/1000} onChange={v=>setOv(o=>({...o,addEquity:v*1000}))} min={0} max={2000} step={50} suffix="K" color={C.success} />
              <Slider label="Add Debt (£K)" value={ov.addDebtAmt/1000} onChange={v=>setOv(o=>({...o,addDebtAmt:v*1000}))} min={0} max={1000} step={25} suffix="K" color={C.warning} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.step[3], marginBottom: 10 }}>🔄 Working Capital</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Slider label="Days Receivable" value={ov.daysRecAdj} onChange={v=>setOv(o=>({...o,daysRecAdj:v}))} min={-30} max={60} step={5} suffix="d" color={C.warning} />
              <Slider label="Days Payable (all)" value={ov.daysPayAdj} onChange={v=>setOv(o=>({...o,daysPayAdj:v}))} min={-15} max={30} step={5} suffix="d" color={C.purple} />
              <Slider label="Days Inventory" value={ov.daysInvAdj} onChange={v=>setOv(o=>({...o,daysInvAdj:v}))} min={-30} max={60} step={5} suffix="d" color={C.cyan} />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid-5-col">
        <Metric label="Y5 Revenue" value={fmtC((sf?.revenue||0)*12)} sub={`Base: ${fmtC((bf?.revenue||0)*12)}`} color={C.success} />
        <Metric label="Y5 EBIT" value={fmtC((sf?.ebit||0)*12)} sub={`Base: ${fmtC((bf?.ebit||0)*12)}`} color={C.purple} />
        <Metric label="Break-Even" value={scenario.breakevenMonth?`Mo ${scenario.breakevenMonth}`:"N/A"} sub={`Base: ${base.breakevenMonth?`Mo ${base.breakevenMonth}`:"N/A"}`} color={C.accent} />
        <Metric label="Cash (Y5)" value={fmtC(sf?.cumulativeCash||0)} sub={`Base: ${fmtC(bf?.cumulativeCash||0)}`} color={(sf?.cumulativeCash||0)>=0?C.success:C.danger} />
        <Metric label="Funding Gap" value={scenario.fundingGap>0?fmtC(scenario.fundingGap):"None"} sub={`Base: ${base.fundingGap>0?fmtC(base.fundingGap):"None"}`} color={scenario.fundingGap>0?C.danger:C.success} />
      </div>

      <div className="grid-3-col">
        <Card>
          <Hdr sub="Base vs scenario">Revenue</Hdr>
          <ResponsiveContainer width="100%" height={250}>
            <ComposedChart data={comp}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.dim }} tickFormatter={v=>`M${v}`} />
              <YAxis tick={{ fontSize: 11, fill: C.dim }} tickFormatter={fmt} />
              <Tooltip contentStyle={ttStyle} formatter={v=>fmtC(v)} labelFormatter={l=>`Month ${l}`} />
              <Line type="monotone" dataKey="baseRev" name="Base" stroke={C.dim} strokeWidth={2} strokeDasharray="5 5" dot={false} />
              <Line type="monotone" dataKey="scRev" name="Scenario" stroke={C.success} strokeWidth={2.5} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <Hdr sub="Base vs scenario">EBIT</Hdr>
          <ResponsiveContainer width="100%" height={250}>
            <ComposedChart data={comp}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.dim }} tickFormatter={v=>`M${v}`} />
              <YAxis tick={{ fontSize: 11, fill: C.dim }} tickFormatter={fmt} />
              <Tooltip contentStyle={ttStyle} formatter={v=>fmtC(v)} labelFormatter={l=>`Month ${l}`} />
              <ReferenceLine y={0} stroke={C.dim} strokeDasharray="3 3" />
              <Line type="monotone" dataKey="baseEBIT" name="Base" stroke={C.dim} strokeWidth={2} strokeDasharray="5 5" dot={false} />
              <Line type="monotone" dataKey="scEBIT" name="Scenario" stroke={C.purple} strokeWidth={2.5} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <Hdr sub="Base vs scenario">Cash Position</Hdr>
          <ResponsiveContainer width="100%" height={250}>
            <ComposedChart data={comp}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.dim }} tickFormatter={v=>`M${v}`} />
              <YAxis tick={{ fontSize: 11, fill: C.dim }} tickFormatter={fmt} />
              <Tooltip contentStyle={ttStyle} formatter={v=>fmtC(v)} labelFormatter={l=>`Month ${l}`} />
              <ReferenceLine y={0} stroke={C.dim} strokeDasharray="3 3" />
              <Area type="monotone" dataKey="baseCash" name="Base" fill={C.dim+"08"} stroke={C.dim} strokeWidth={2} strokeDasharray="5 5" />
              <Area type="monotone" dataKey="scCash" name="Scenario" fill={C.accent+"12"} stroke={C.accent} strokeWidth={2.5} />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

// ─── MONTE CARLO TAB ────────────────────────────────────────────────────────
function MonteCarloTab({ model }) {
  const [numRuns, setNumRuns] = useState(500);
  const [vol, setVol] = useState({ growthVol: 30, churnVol: 25, priceVol: 20, costVol: 15 });
  const [defThreshold, setDefThreshold] = useState(50);
  const [results, setResults] = useState(null);
  const [running, setRunning] = useState(false);

  const run = useCallback(() => { setRunning(true); setTimeout(() => { setResults(runMonteCarlo(model, numRuns, vol, defThreshold)); setRunning(false); }, 50); }, [model, numRuns, vol, defThreshold]);

  const stats = useMemo(() => {
    if (!results) return null;
    const s = (arr) => [...arr].sort((a,b)=>a-b);
    const pct = (arr,p) => { const sorted=s(arr); return sorted[Math.floor(sorted.length*p/100)]; };
    const mean = (arr) => arr.reduce((a,b)=>a+b,0)/arr.length;
    const be = results.filter(r=>r.breakevenMonth).map(r=>r.breakevenMonth);
    const dr = results.filter(r=>r.defaulted).length/results.length;
    return {
      survivalRate: 1-dr, defaultRate: dr, breakevenProb: be.length/results.length,
      medianBE: be.length>0?pct(be,50):null,
      medianIRR: pct(results.map(r=>r.irr),50), p10IRR: pct(results.map(r=>r.irr),10), p90IRR: pct(results.map(r=>r.irr),90),
      medianNPV: pct(results.map(r=>r.npv),50), p10NPV: pct(results.map(r=>r.npv),10), p90NPV: pct(results.map(r=>r.npv),90),
      meanY5Rev: mean(results.map(r=>r.finalRevenue)), p10Y5Rev: pct(results.map(r=>r.finalRevenue),10), p90Y5Rev: pct(results.map(r=>r.finalRevenue),90),
    };
  }, [results]);

  const dists = useMemo(() => {
    if (!results) return {};
    const buckets = (vals, n=25) => {
      const mn=Math.min(...vals),mx=Math.max(...vals),rng=mx-mn||1,sz=rng/n;
      const b=Array(n).fill(0).map((_,i)=>({min:mn+i*sz,max:mn+(i+1)*sz,label:fmt(mn+(i+0.5)*sz),count:0,freq:0}));
      vals.forEach(v=>{const idx=Math.min(n-1,Math.floor((v-mn)/sz));b[idx].count++;});
      b.forEach(x=>x.freq=x.count/vals.length*100); return b;
    };
    return {
      be: buckets(results.filter(r=>r.breakevenMonth).map(r=>r.breakevenMonth),20),
      irr: buckets(results.map(r=>r.irr*100),25),
      npv: buckets(results.map(r=>r.npv),25),
      cash: buckets(results.map(r=>r.finalCash),25),
    };
  }, [results]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <Card>
        <Hdr sub="Set volatility to stress-test stochastically">Simulation Configuration</Hdr>
        <div className="mc-controls">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Slider label="Runs" value={numRuns} onChange={setNumRuns} min={100} max={2000} step={100} suffix="" color={C.accent} />
            <Slider label="Growth Volatility" value={vol.growthVol} onChange={v=>setVol(x=>({...x,growthVol:v}))} min={5} max={80} color={C.success} />
            <Slider label="Churn Volatility" value={vol.churnVol} onChange={v=>setVol(x=>({...x,churnVol:v}))} min={5} max={80} color={C.warning} />
            <Slider label="Price Volatility" value={vol.priceVol} onChange={v=>setVol(x=>({...x,priceVol:v}))} min={5} max={50} color={C.purple} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Slider label="Cost Volatility" value={vol.costVol} onChange={v=>setVol(x=>({...x,costVol:v}))} min={5} max={50} color={C.danger} />
            <div>
              <Slider label="Default Threshold" value={defThreshold} onChange={setDefThreshold} min={20} max={100} suffix="%" color={C.danger} />
              <div style={{ fontSize: 11, color: C.dim, marginTop: 4 }}>Fail if cash falls below −{defThreshold}% of total funding</div>
            </div>
            <Btn onClick={run} disabled={running} primary style={{ width: "100%", padding: "14px", marginTop: 4 }}>
              {running?"Running...": `Run ${numRuns} Simulations ▶`}
            </Btn>
          </div>
        </div>
      </Card>

      {results && stats && (<>
        <div className="metrics-grid">
          <Metric label="Survival Rate" value={fmtP(stats.survivalRate)} sub={`${(stats.defaultRate*100).toFixed(1)}% default risk`} icon="🛡️" color={stats.survivalRate>0.7?C.success:C.danger} />
          <Metric label="Break-Even Prob." value={fmtP(stats.breakevenProb)} sub={stats.medianBE?`Median: Mo ${stats.medianBE.toFixed(0)}`:""} icon="⚖️" color={stats.breakevenProb>0.7?C.success:C.warning} />
          <Metric label="Median IRR" value={`${(stats.medianIRR*100).toFixed(1)}%`} sub={`P10–P90: ${(stats.p10IRR*100).toFixed(0)}%–${(stats.p90IRR*100).toFixed(0)}%`} icon="📊" color={stats.medianIRR>0.15?C.success:C.warning} />
          <Metric label="Median NPV" value={fmtC(stats.medianNPV)} sub={`P10–P90: ${fmtC(stats.p10NPV)}–${fmtC(stats.p90NPV)}`} icon="💎" color={stats.medianNPV>0?C.success:C.danger} />
          <Metric label="Mean Y5 Revenue" value={fmtC(stats.meanY5Rev)} sub={`P10–P90: ${fmtC(stats.p10Y5Rev)}–${fmtC(stats.p90Y5Rev)}`} icon="🎯" color={C.cyan} />
        </div>

        <div className="grid-2-col">
          {[
            { title: "Break-Even Timing", sub: `${(stats.breakevenProb*100).toFixed(0)}% reach break-even`, data: dists.be, posColor: C.success },
            { title: "IRR Distribution", sub: `Median: ${(stats.medianIRR*100).toFixed(1)}%`, data: dists.irr, splitZero: true },
            { title: "NPV Distribution (10%)", sub: `Median: ${fmtC(stats.medianNPV)}`, data: dists.npv, splitZero: true },
            { title: "Year 5 Cash Position", sub: `Default: ${(stats.defaultRate*100).toFixed(1)}%`, data: dists.cash, splitZero: true },
          ].map((ch,ci) => (
            <Card key={ci}>
              <Hdr sub={ch.sub}>{ch.title}</Hdr>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={ch.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: C.dim }} interval={3} />
                  <YAxis tick={{ fontSize: 11, fill: C.dim }} tickFormatter={v=>`${v.toFixed(0)}%`} />
                  <Tooltip contentStyle={ttStyle} formatter={v=>`${v.toFixed(1)}%`} />
                  <Bar dataKey="freq" radius={[3,3,0,0]}>
                    {ch.data.map((e,idx)=>(
                      <Cell key={idx} fill={ch.splitZero?(e.min+(e.max-e.min)/2>0?C.success:C.danger):(ch.posColor||C.accent)}
                        opacity={0.3+e.freq/Math.max(...ch.data.map(b=>b.freq),1)*0.7} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          ))}
        </div>

        <Card>
          <Hdr sub="Each dot = one simulation — colour = survival">IRR vs NPV</Hdr>
          <ResponsiveContainer width="100%" height={320}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="irr" tick={{ fontSize: 12, fill: C.dim }} tickFormatter={v=>`${(v*100).toFixed(0)}%`} />
              <YAxis dataKey="npv" tick={{ fontSize: 12, fill: C.dim }} tickFormatter={fmt} />
              <Tooltip contentStyle={ttStyle} formatter={(v,name)=>name==="IRR"?`${(v*100).toFixed(1)}%`:fmtC(v)} />
              <ReferenceLine y={0} stroke={C.dim} strokeDasharray="3 3" />
              <ReferenceLine x={0} stroke={C.dim} strokeDasharray="3 3" />
              <Scatter data={results.filter(r=>!r.defaulted).slice(0,250)} fill={C.success} opacity={0.35} r={3} />
              <Scatter data={results.filter(r=>r.defaulted).slice(0,250)} fill={C.danger} opacity={0.35} r={3} />
            </ScatterChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 18, justifyContent: "center", marginTop: 6 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: C.muted }}><span style={{ width: 9, height: 9, borderRadius: "50%", background: C.success, display: "inline-block" }}/> Survived</span>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: C.muted }}><span style={{ width: 9, height: 9, borderRadius: "50%", background: C.danger, display: "inline-block" }}/> Defaulted</span>
          </div>
        </Card>
      </>)}

      {!results && (
        <Card style={{ textAlign: "center", padding: 50 }}>
          <div style={{ fontSize: 48, marginBottom: 14 }}>🎲</div>
          <div style={{ fontSize: 19, color: C.text, marginBottom: 6 }}>Ready to simulate</div>
          <div style={{ fontSize: 14, color: C.muted, maxWidth: 400, margin: "0 auto" }}>Configure volatility and run {numRuns} stochastic scenarios.</div>
        </Card>
      )}
    </div>
  );
}

// ─── ABOUT SECTION ──────────────────────────────────────────────────────────
function AboutPanel({ expanded, onToggle, inline }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", ...(inline ? { margin: "0 0 24px" } : {}) }}>
      <button onClick={onToggle} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", background: "transparent", border: "none", cursor: "pointer", color: C.text }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>About this tool</span>
        <span style={{ fontSize: 16, color: C.dim, transition: "transform 0.2s", transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
      </button>
      {expanded && (
        <div style={{ padding: "0 18px 18px", fontSize: 13, lineHeight: 1.7, color: C.muted }}>
          <p style={{ margin: "0 0 12px" }}>An <strong style={{ color: C.text }}>interactive 5-year financial planning tool</strong> for entrepreneurship education. Students build financial models by following a structured four-step process — from revenue decomposition through to funding requirements — and then explore scenarios and run Monte Carlo simulations to stress-test their assumptions.</p>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 8 }}>Pedagogical Framework</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginBottom: 14 }}>
            {[
              { n: "1", c: C.step[0], title: "Revenue Model", desc: "Decompose revenue into customers, units, price, and frequency" },
              { n: "2", c: C.step[1], title: "Operating Assets", desc: "Identify fixed assets and operating costs with payment terms" },
              { n: "3", c: C.step[2], title: "Variable Costs", desc: "Define costs that scale with revenue (COGS, shipping, etc.)" },
              { n: "4", c: C.step[3], title: "Funding & Working Capital", desc: "Model the cash conversion cycle and determine funding needs" },
            ].map(s => (
              <div key={s.n} style={{ display: "flex", gap: 10, padding: "10px 12px", background: s.c + "08", border: `1px solid ${s.c}20`, borderRadius: 8 }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: s.c, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0, marginTop: 1 }}>{s.n}</div>
                <div><div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 2 }}>{s.title}</div><div style={{ fontSize: 12, color: C.dim }}>{s.desc}</div></div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 8 }}>Key Features</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 6, marginBottom: 10 }}>
            {[
              { icon: "🔧", label: "Model Builder", desc: "8 templates, step-by-step guidance" },
              { icon: "📈", label: "5-Year Projections", desc: "P&L, cash flow, balance sheet" },
              { icon: "🔀", label: "Scenario Explorer", desc: "Revenue, cost & WC levers" },
              { icon: "🎲", label: "Monte Carlo", desc: "Stochastic simulation & risk analysis" },
            ].map(f => (
              <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: C.bg, borderRadius: 6, fontSize: 12 }}>
                <span style={{ fontSize: 15 }}>{f.icon}</span>
                <div><strong style={{ color: C.text }}>{f.label}</strong> <span style={{ color: C.dim }}>— {f.desc}</span></div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 10, paddingTop: 10, fontSize: 12, color: C.dim, textAlign: "center" }}>Dimo Dimov | Entrepreneurial Finance Tools</div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ───────────────────────────────────────────────────────────────
export default function FinancialModelSimulator() {
  const [tab, setTab] = useState("builder");
  const [model, setModel] = useState(null);
  const [tmplKey, setTmplKey] = useState(null);
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);

  const selectTemplate = (key) => {
    const t = TEMPLATES[key];
    setModel({
      revenueStreams: JSON.parse(JSON.stringify(t.revenueStreams)),
      operatingAssets: JSON.parse(JSON.stringify(t.operatingAssets)),
      variableCosts: JSON.parse(JSON.stringify(t.variableCosts)),
      workingCapital: { ...t.workingCapital },
      initialCash: t.initialCash,
      fundingRounds: JSON.parse(JSON.stringify(t.fundingRounds)),
    });
    setTmplKey(key); setTab("builder");
  };

  // Save model to JSON file
  const saveModel = () => {
    const exportData = {
      version: "1.0",
      savedAt: new Date().toISOString(),
      templateKey: tmplKey,
      model: model,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `financial-model-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Load model from JSON file
  const loadModel = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target.result);
        if (data.model) {
          setModel(data.model);
          setTmplKey(data.templateKey || null);
          setTab("builder");
        } else {
          alert("Invalid model file format");
        }
      } catch (err) {
        alert("Failed to parse model file: " + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // Reset so same file can be loaded again
  };

  if (!model) {
    return (
      <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: fonts, padding: "40px 24px" }}>
        <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=Source+Sans+3:wght@300;400;600&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <div style={{ display: "inline-flex", background: C.accentDim+"60", border: `1px solid ${C.accent}30`, borderRadius: 8, padding: "5px 12px", fontSize: 12, color: C.accent, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Financial Model Simulator</div>
            <h1 style={{ fontSize: 38, fontWeight: 700, margin: "0 0 10px", background: `linear-gradient(135deg,${C.text},${C.accent})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Build Your 5-Year Financial Plan</h1>
            <p style={{ fontSize: 16, color: C.muted, maxWidth: 560, margin: "0 auto 8px" }}>Define revenue, identify operating assets, derive costs, determine funding requirements.</p>
          </div>
          <AboutPanel expanded={aboutExpanded} onToggle={() => setAboutExpanded(e => !e)} inline />
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "center", gap: 20, margin: "0 0 24px" }}>
              {[{n:1,l:"Revenue",c:C.step[0]},{n:2,l:"Assets",c:C.step[1]},{n:3,l:"Costs",c:C.step[2]},{n:4,l:"Funding",c:C.step[3]}].map(s=>(
                <div key={s.n} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: s.c, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff" }}>{s.n}</div>
                  <span style={{ fontSize: 14, color: C.muted }}>{s.l}</span>
                  {s.n < 4 && <span style={{ color: C.dim, fontSize: 16, marginLeft: 8 }}>→</span>}
                </div>
              ))}
            </div>
          </div>
          <TemplateSelector onSelect={selectTemplate} />
          <div style={{ textAlign: "center", marginTop: 24, paddingTop: 24, borderTop: `1px solid ${C.border}` }}>
            <p style={{ fontSize: 14, color: C.dim, marginBottom: 12 }}>Or load a previously saved model:</p>
            <label style={{ display: "inline-block", background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 20px", color: C.text, fontSize: 14, cursor: "pointer", fontWeight: 500 }}>
              Load Saved Model
              <input type="file" accept=".json" onChange={loadModel} style={{ display: "none" }} />
            </label>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: fonts }}>
      <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=Source+Sans+3:wght@300;400;600&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div className="app-header" style={{ borderBottom: `1px solid ${C.border}`, background: C.card, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <div className="app-header-title">
          <span style={{ fontSize: 13, color: C.accent, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Financial Model Simulator</span>
          {tmplKey && <span className="hide-mobile" style={{ fontSize: 13, color: C.dim, padding: "2px 8px", background: C.bg, borderRadius: 4 }}>{TEMPLATES[tmplKey]?.icon} {TEMPLATES[tmplKey]?.name}</span>}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button onClick={saveModel} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 7, padding: "5px 12px", color: C.muted, fontSize: 13, cursor: "pointer" }}>Save</button>
          <label style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 7, padding: "5px 12px", color: C.muted, fontSize: 13, cursor: "pointer" }}>
            Load
            <input type="file" accept=".json" onChange={loadModel} style={{ display: "none" }} />
          </label>
          <button onClick={() => setAboutModalOpen(o => !o)} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 7, padding: "5px 12px", color: C.muted, fontSize: 13, cursor: "pointer" }}>About</button>
          <button onClick={() => { setModel(null); setTmplKey(null); setTab("builder"); }} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 7, padding: "5px 12px", color: C.muted, fontSize: 13, cursor: "pointer" }}>↩ New</button>
        </div>
      </div>
      {aboutModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={() => setAboutModalOpen(false)}>
          <div style={{ maxWidth: 700, width: "100%", maxHeight: "80vh", overflowY: "auto", borderRadius: 16, boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }} onClick={e => e.stopPropagation()}>
            <AboutPanel expanded onToggle={() => setAboutModalOpen(false)} />
          </div>
        </div>
      )}
      <div className="tab-nav" style={{ borderBottom: `1px solid ${C.border}` }}>
        <TabBtn active={tab==="builder"} onClick={()=>setTab("builder")} icon="🔧" color={C.accent}>Model Builder</TabBtn>
        <TabBtn active={tab==="projections"} onClick={()=>setTab("projections")} icon="📈" color={C.success}>5-Year Projections</TabBtn>
        <TabBtn active={tab==="scenarios"} onClick={()=>setTab("scenarios")} icon="🔀" color={C.purple}>Scenario Explorer</TabBtn>
        <TabBtn active={tab==="montecarlo"} onClick={()=>setTab("montecarlo")} icon="🎲" color={C.warning}>Monte Carlo</TabBtn>
      </div>
      <div className="main-content" style={{ maxWidth: 1100, margin: "0 auto" }}>
        {tab==="builder" && <ModelBuilderTab model={model} setModel={setModel} />}
        {tab==="projections" && <ProjectionsTab model={model} />}
        {tab==="scenarios" && <ScenarioTab model={model} />}
        {tab==="montecarlo" && <MonteCarloTab model={model} />}
      </div>
    </div>
  );
}

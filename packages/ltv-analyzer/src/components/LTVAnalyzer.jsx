import React, { useState, useMemo, useCallback } from 'react';

const revenueModels = {
  subscription: {
    name: 'Subscription / SaaS',
    description: 'Recurring revenue with monthly or annual billing cycles',
    icon: '↻',
    params: {
      monthlyPrice: { label: 'Monthly Price (£)', min: 1, max: 5000, step: 1, default: 49 },
      billingCycle: { label: 'Billing Cycle', type: 'select', options: ['Monthly', 'Annual'], default: 'Monthly' },
      annualDiscount: { label: 'Annual Discount (%)', min: 0, max: 50, step: 1, default: 17 },
      monthlyChurn: { label: 'Monthly Churn Rate (%)', min: 0.1, max: 20, step: 0.1, default: 3.5 },
      expansionRate: { label: 'Monthly Expansion Revenue (%)', min: 0, max: 10, step: 0.1, default: 1.2 },
      grossMargin: { label: 'Gross Margin (%)', min: 10, max: 99, step: 1, default: 78 },
      onboardingCost: { label: 'Onboarding Cost (£)', min: 0, max: 10000, step: 10, default: 150 },
    },
    compute: (p) => {
      const effectiveMonthly = p.billingCycle === 'Annual'
        ? p.monthlyPrice * 12 * (1 - p.annualDiscount / 100) / 12
        : p.monthlyPrice;
      const netChurn = Math.max(0.1, p.monthlyChurn - p.expansionRate) / 100;
      const avgLifespanMonths = 1 / netChurn;
      const lifetimeRevenue = effectiveMonthly * avgLifespanMonths;
      const lifetimeGrossProfit = lifetimeRevenue * (p.grossMargin / 100) - p.onboardingCost;
      const monthlyRevenues = [];
      const survivalCurve = [];
      let cumRevenue = 0;
      let retention = 1;
      const months = Math.min(Math.ceil(avgLifespanMonths * 2.5), 120);
      for (let m = 0; m < months; m++) {
        retention *= (1 - p.monthlyChurn / 100);
        const expandedPrice = effectiveMonthly * Math.pow(1 + p.expansionRate / 100, m);
        const rev = expandedPrice * retention;
        cumRevenue += rev;
        monthlyRevenues.push({ month: m + 1, revenue: rev, cumulative: cumRevenue, retention: retention * 100 });
        survivalCurve.push({ month: m + 1, pct: retention * 100 });
      }
      return {
        ltv: lifetimeGrossProfit,
        lifetimeRevenue,
        avgLifespanMonths,
        arpu: effectiveMonthly,
        annualValue: effectiveMonthly * 12,
        netChurnRate: netChurn * 100,
        monthlyRevenues,
        survivalCurve,
        keyMetrics: [
          { label: 'Monthly ARPU', value: `£${effectiveMonthly.toFixed(0)}` },
          { label: 'Annual Contract Value', value: `£${(effectiveMonthly * 12).toFixed(0)}` },
          { label: 'Net Monthly Churn', value: `${(netChurn * 100).toFixed(1)}%` },
          { label: 'Avg Lifespan', value: `${avgLifespanMonths.toFixed(1)} months` },
          { label: 'Lifetime Revenue', value: `£${lifetimeRevenue.toFixed(0)}` },
          { label: 'Lifetime Gross Profit (LTV)', value: `£${lifetimeGrossProfit.toFixed(0)}` },
        ],
      };
    }
  },
  transaction: {
    name: 'Transactional / E-commerce',
    description: 'Revenue per purchase with repeat buying behaviour',
    icon: '⇄',
    params: {
      avgOrderValue: { label: 'Average Order Value (£)', min: 1, max: 5000, step: 1, default: 65 },
      purchaseFrequency: { label: 'Purchases per Year', min: 0.5, max: 52, step: 0.5, default: 4 },
      repeatRate: { label: 'Annual Repeat Rate (%)', min: 5, max: 95, step: 1, default: 35 },
      avgBasketGrowth: { label: 'Annual Basket Growth (%)', min: -10, max: 30, step: 0.5, default: 5 },
      grossMargin: { label: 'Gross Margin (%)', min: 5, max: 90, step: 1, default: 42 },
      shippingCost: { label: 'Avg Fulfillment Cost per Order (£)', min: 0, max: 100, step: 0.5, default: 8 },
      acquisitionDiscount: { label: 'First-Purchase Discount (%)', min: 0, max: 50, step: 1, default: 15 },
    },
    compute: (p) => {
      const annualChurn = 1 - p.repeatRate / 100;
      const avgLifespanYears = 1 / annualChurn;
      const avgLifespanMonths = avgLifespanYears * 12;
      const monthlyRevenues = [];
      const survivalCurve = [];
      let cumRevenue = 0;
      let retention = 1;
      const years = Math.min(Math.ceil(avgLifespanYears * 2.5), 10);
      const months = years * 12;
      let lifetimeRevenue = 0;
      let lifetimeCosts = 0;
      const firstOrderValue = p.avgOrderValue * (1 - p.acquisitionDiscount / 100);

      for (let m = 0; m < months; m++) {
        const year = m / 12;
        if (m > 0 && m % 12 === 0) retention *= (p.repeatRate / 100);
        const aov = m === 0 ? firstOrderValue : p.avgOrderValue * Math.pow(1 + p.avgBasketGrowth / 100, year);
        const monthlyPurchases = p.purchaseFrequency / 12;
        const rev = aov * monthlyPurchases * retention;
        const cost = p.shippingCost * monthlyPurchases * retention;
        cumRevenue += rev;
        lifetimeRevenue += rev;
        lifetimeCosts += cost;
        monthlyRevenues.push({ month: m + 1, revenue: rev, cumulative: cumRevenue, retention: retention * 100 });
        survivalCurve.push({ month: m + 1, pct: retention * 100 });
      }

      const ltv = lifetimeRevenue * (p.grossMargin / 100) - lifetimeCosts;

      return {
        ltv,
        lifetimeRevenue,
        avgLifespanMonths,
        arpu: p.avgOrderValue * p.purchaseFrequency / 12,
        annualValue: p.avgOrderValue * p.purchaseFrequency,
        netChurnRate: annualChurn * 100,
        monthlyRevenues,
        survivalCurve,
        keyMetrics: [
          { label: 'Avg Order Value', value: `£${p.avgOrderValue.toFixed(0)}` },
          { label: 'Annual Revenue / Customer', value: `£${(p.avgOrderValue * p.purchaseFrequency).toFixed(0)}` },
          { label: 'Annual Retention', value: `${p.repeatRate}%` },
          { label: 'Avg Lifespan', value: `${avgLifespanMonths.toFixed(1)} months` },
          { label: 'Lifetime Revenue', value: `£${lifetimeRevenue.toFixed(0)}` },
          { label: 'Lifetime Gross Profit (LTV)', value: `£${ltv.toFixed(0)}` },
        ],
      };
    }
  },
  contract: {
    name: 'Contract / Enterprise',
    description: 'Fixed-term contracts with renewal cycles',
    icon: '▣',
    params: {
      annualContractValue: { label: 'Annual Contract Value (£)', min: 1000, max: 5000000, step: 1000, default: 120000 },
      contractLength: { label: 'Contract Length (months)', min: 3, max: 60, step: 3, default: 12 },
      renewalRate: { label: 'Renewal Rate (%)', min: 30, max: 99, step: 1, default: 82 },
      upsellOnRenewal: { label: 'Avg Upsell on Renewal (%)', min: 0, max: 50, step: 1, default: 12 },
      grossMargin: { label: 'Gross Margin (%)', min: 10, max: 95, step: 1, default: 65 },
      implementationCost: { label: 'Implementation Cost (£)', min: 0, max: 500000, step: 1000, default: 25000 },
      supportCostAnnual: { label: 'Annual Support Cost (£)', min: 0, max: 200000, step: 500, default: 15000 },
    },
    compute: (p) => {
      const contractYears = p.contractLength / 12;
      const renewalsExpected = 1 / (1 - p.renewalRate / 100) - 1;
      const totalContracts = 1 + renewalsExpected;
      const avgLifespanMonths = totalContracts * p.contractLength;

      const monthlyRevenues = [];
      const survivalCurve = [];
      let cumRevenue = 0;
      let retention = 1;
      let currentACV = p.annualContractValue;
      const maxMonths = Math.min(Math.ceil(avgLifespanMonths * 2), 120);
      let lifetimeRevenue = 0;
      let lifetimeSupportCost = 0;

      for (let m = 0; m < maxMonths; m++) {
        if (m > 0 && m % p.contractLength === 0) {
          retention *= (p.renewalRate / 100);
          currentACV *= (1 + p.upsellOnRenewal / 100);
        }
        const monthlyRev = (currentACV / 12) * retention;
        cumRevenue += monthlyRev;
        lifetimeRevenue += monthlyRev;
        lifetimeSupportCost += (p.supportCostAnnual / 12) * retention;
        monthlyRevenues.push({ month: m + 1, revenue: monthlyRev, cumulative: cumRevenue, retention: retention * 100 });
        survivalCurve.push({ month: m + 1, pct: retention * 100 });
      }

      const ltv = lifetimeRevenue * (p.grossMargin / 100) - p.implementationCost - lifetimeSupportCost;

      return {
        ltv,
        lifetimeRevenue,
        avgLifespanMonths,
        arpu: p.annualContractValue / 12,
        annualValue: p.annualContractValue,
        netChurnRate: (1 - p.renewalRate / 100) * (12 / p.contractLength) * 100,
        monthlyRevenues,
        survivalCurve,
        keyMetrics: [
          { label: 'Annual Contract Value', value: `£${(p.annualContractValue / 1000).toFixed(0)}K` },
          { label: 'Contract Length', value: `${p.contractLength} months` },
          { label: 'Renewal Rate', value: `${p.renewalRate}%` },
          { label: 'Expected Renewals', value: renewalsExpected.toFixed(1) },
          { label: 'Avg Lifespan', value: `${avgLifespanMonths.toFixed(0)} months` },
          { label: 'Lifetime Gross Profit (LTV)', value: `£${(ltv / 1000).toFixed(0)}K` },
        ],
      };
    }
  },
  marketplace: {
    name: 'Marketplace / Platform',
    description: 'Take rate on transactions facilitated through a platform',
    icon: '◈',
    params: {
      avgTransactionValue: { label: 'Avg Transaction Value (£)', min: 1, max: 10000, step: 1, default: 85 },
      takeRate: { label: 'Take Rate / Commission (%)', min: 1, max: 40, step: 0.5, default: 12 },
      transactionsPerMonth: { label: 'Transactions per Month', min: 0.1, max: 100, step: 0.5, default: 3 },
      monthlyChurn: { label: 'Monthly Churn (%)', min: 0.5, max: 25, step: 0.5, default: 6 },
      gmvGrowthPerUser: { label: 'Monthly GMV Growth per User (%)', min: -5, max: 10, step: 0.5, default: 2 },
      grossMargin: { label: 'Margin on Take Rate (%)', min: 30, max: 99, step: 1, default: 72 },
      supplyVsDemand: { label: 'Side', type: 'select', options: ['Supply (seller/provider)', 'Demand (buyer)'], default: 'Demand (buyer)' },
    },
    compute: (p) => {
      const netChurn = p.monthlyChurn / 100;
      const avgLifespanMonths = 1 / netChurn;
      const monthlyTakeRevenue = p.avgTransactionValue * p.takeRate / 100 * p.transactionsPerMonth;

      const monthlyRevenues = [];
      const survivalCurve = [];
      let cumRevenue = 0;
      let retention = 1;
      const months = Math.min(Math.ceil(avgLifespanMonths * 2.5), 120);
      let lifetimeRevenue = 0;

      for (let m = 0; m < months; m++) {
        retention *= (1 - netChurn);
        const growthFactor = Math.pow(1 + p.gmvGrowthPerUser / 100, m);
        const rev = monthlyTakeRevenue * growthFactor * retention;
        cumRevenue += rev;
        lifetimeRevenue += rev;
        monthlyRevenues.push({ month: m + 1, revenue: rev, cumulative: cumRevenue, retention: retention * 100 });
        survivalCurve.push({ month: m + 1, pct: retention * 100 });
      }

      const ltv = lifetimeRevenue * (p.grossMargin / 100);

      return {
        ltv,
        lifetimeRevenue,
        avgLifespanMonths,
        arpu: monthlyTakeRevenue,
        annualValue: monthlyTakeRevenue * 12,
        netChurnRate: p.monthlyChurn,
        monthlyRevenues,
        survivalCurve,
        keyMetrics: [
          { label: `Side Analyzed`, value: p.supplyVsDemand === 'Supply (seller/provider)' ? 'Supply' : 'Demand' },
          { label: 'Monthly Take Revenue', value: `£${monthlyTakeRevenue.toFixed(2)}` },
          { label: 'Implied Monthly GMV', value: `£${(p.avgTransactionValue * p.transactionsPerMonth).toFixed(0)}` },
          { label: 'Avg Lifespan', value: `${avgLifespanMonths.toFixed(1)} months` },
          { label: 'Lifetime Revenue', value: `£${lifetimeRevenue.toFixed(0)}` },
          { label: 'Lifetime Gross Profit (LTV)', value: `£${ltv.toFixed(0)}` },
        ],
      };
    }
  },
  usage: {
    name: 'Usage / Consumption',
    description: 'Pay-per-use with variable consumption patterns',
    icon: '△',
    params: {
      avgMonthlyUsage: { label: 'Avg Monthly Usage (units)', min: 1, max: 1000, step: 1, default: 500 },
      pricePerUnit: { label: 'Price per Unit (£)', min: 0.001, max: 100, step: 0.001, default: 0.12 },
      usageGrowthRate: { label: 'Monthly Usage Growth (%)', min: -5, max: 20, step: 0.5, default: 3 },
      monthlyChurn: { label: 'Monthly Churn (%)', min: 0.5, max: 20, step: 0.5, default: 4 },
      grossMargin: { label: 'Gross Margin (%)', min: 10, max: 95, step: 1, default: 60 },
      minimumCommitment: { label: 'Monthly Minimum (£)', min: 0, max: 10000, step: 10, default: 0 },
      usageVariability: { label: 'Monthly Variability (±%)', min: 0, max: 50, step: 5, default: 20 },
    },
    compute: (p) => {
      const netChurn = p.monthlyChurn / 100;
      const avgLifespanMonths = 1 / netChurn;
      const baseMonthlyRevenue = Math.max(p.avgMonthlyUsage * p.pricePerUnit, p.minimumCommitment);

      const monthlyRevenues = [];
      const survivalCurve = [];
      let cumRevenue = 0;
      let retention = 1;
      const months = Math.min(Math.ceil(avgLifespanMonths * 2.5), 120);
      let lifetimeRevenue = 0;

      for (let m = 0; m < months; m++) {
        retention *= (1 - netChurn);
        const usageGrowth = Math.pow(1 + p.usageGrowthRate / 100, m);
        const usage = p.avgMonthlyUsage * usageGrowth;
        const rev = Math.max(usage * p.pricePerUnit, p.minimumCommitment) * retention;
        cumRevenue += rev;
        lifetimeRevenue += rev;
        monthlyRevenues.push({ month: m + 1, revenue: rev, cumulative: cumRevenue, retention: retention * 100 });
        survivalCurve.push({ month: m + 1, pct: retention * 100 });
      }

      const ltv = lifetimeRevenue * (p.grossMargin / 100);

      return {
        ltv,
        lifetimeRevenue,
        avgLifespanMonths,
        arpu: baseMonthlyRevenue,
        annualValue: baseMonthlyRevenue * 12,
        netChurnRate: p.monthlyChurn,
        monthlyRevenues,
        survivalCurve,
        keyMetrics: [
          { label: 'Avg Monthly Revenue', value: `£${baseMonthlyRevenue.toFixed(2)}` },
          { label: 'Price per Unit', value: `£${p.pricePerUnit.toFixed(3)}` },
          { label: 'Usage Growth / Month', value: `${p.usageGrowthRate}%` },
          { label: 'Avg Lifespan', value: `${avgLifespanMonths.toFixed(1)} months` },
          { label: 'Lifetime Revenue', value: `£${lifetimeRevenue.toFixed(0)}` },
          { label: 'Lifetime Gross Profit (LTV)', value: `£${ltv.toFixed(0)}` },
        ],
      };
    }
  },
};

// ── CAC & Unit Economics Panel ──
const cacDefaults = {
  monthlySalesSpend: 8000,
  monthlyMarketingSpend: 12000,
  customersAcquiredMonthly: 45,
};

// ── Mini chart components ──
const MiniBarChart = ({ data, xKey, yKey, width = 540, height = 180, color = '#5a7a9a', label }) => {
  if (!data || data.length === 0) return null;
  const maxVal = Math.max(...data.map(d => d[yKey]));
  const barCount = Math.min(data.length, 60);
  const sampled = data.length > barCount
    ? data.filter((_, i) => i % Math.ceil(data.length / barCount) === 0)
    : data;
  const barW = Math.max(2, (width - 60) / sampled.length - 1);

  return (
    <div style={{ position: 'relative' }}>
      {label && <div style={{ fontSize: 11, color: '#8a9ab5', marginBottom: 6, fontFamily: "'DM Mono', monospace", letterSpacing: 0.5 }}>{label}</div>}
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
        {sampled.map((d, i) => {
          const barH = maxVal > 0 ? (d[yKey] / maxVal) * (height - 30) : 0;
          return (
            <rect
              key={i}
              x={50 + i * (barW + 1)}
              y={height - 20 - barH}
              width={barW}
              height={barH}
              fill={color}
              opacity={0.7 + 0.3 * (d[yKey] / maxVal)}
              rx={1}
            />
          );
        })}
        {/* Y-axis labels */}
        <text x={46} y={15} textAnchor="end" fontSize={9} fill="#8a9ab5" fontFamily="'DM Mono', monospace">
          £{maxVal >= 1000 ? `${(maxVal / 1000).toFixed(0)}K` : maxVal.toFixed(0)}
        </text>
        <text x={46} y={height - 20} textAnchor="end" fontSize={9} fill="#8a9ab5" fontFamily="'DM Mono', monospace">0</text>
        {/* X-axis labels */}
        <text x={50} y={height - 5} fontSize={9} fill="#8a9ab5" fontFamily="'DM Mono', monospace">1</text>
        <text x={50 + sampled.length * (barW + 1) - 10} y={height - 5} fontSize={9} fill="#8a9ab5" fontFamily="'DM Mono', monospace">
          {sampled[sampled.length - 1][xKey]}
        </text>
      </svg>
    </div>
  );
};

const RetentionCurve = ({ data, width = 540, height = 160 }) => {
  if (!data || data.length < 2) return null;
  const sampled = data.length > 60 ? data.filter((_, i) => i % Math.ceil(data.length / 60) === 0) : data;
  const xScale = (width - 70) / (sampled.length - 1);

  const pathD = sampled.map((d, i) => {
    const x = 50 + i * xScale;
    const y = (height - 25) - (d.pct / 100) * (height - 40);
    return `${i === 0 ? 'M' : 'L'}${x},${y}`;
  }).join(' ');

  const areaD = pathD + ` L${50 + (sampled.length - 1) * xScale},${height - 25} L50,${height - 25} Z`;

  const halfLifeIdx = sampled.findIndex(d => d.pct <= 50);

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ fontSize: 11, color: '#8a9ab5', marginBottom: 6, fontFamily: "'DM Mono', monospace", letterSpacing: 0.5 }}>
        RETENTION CURVE (survival %)
      </div>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
        <defs>
          <linearGradient id="retGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5a8a6a" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#5a8a6a" stopOpacity="0.03" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#retGrad)" />
        <path d={pathD} fill="none" stroke="#5a8a6a" strokeWidth={2} />
        {/* 50% line */}
        <line x1={50} y1={(height - 25) - 0.5 * (height - 40)} x2={width - 10} y2={(height - 25) - 0.5 * (height - 40)}
          stroke="#8a9ab5" strokeWidth={0.5} strokeDasharray="4,3" />
        <text x={width - 8} y={(height - 25) - 0.5 * (height - 40) - 3} textAnchor="end" fontSize={8} fill="#8a9ab5" fontFamily="'DM Mono', monospace">50%</text>
        {halfLifeIdx > 0 && (
          <>
            <circle cx={50 + halfLifeIdx * xScale} cy={(height - 25) - (sampled[halfLifeIdx].pct / 100) * (height - 40)} r={3} fill="#c47a5a" />
            <text x={50 + halfLifeIdx * xScale} y={(height - 25) - (sampled[halfLifeIdx].pct / 100) * (height - 40) - 8}
              textAnchor="middle" fontSize={9} fill="#c47a5a" fontFamily="'DM Mono', monospace" fontWeight="600">
              Mo {sampled[halfLifeIdx].month}
            </text>
          </>
        )}
        {/* Axes */}
        <text x={46} y={15} textAnchor="end" fontSize={9} fill="#8a9ab5" fontFamily="'DM Mono', monospace">100%</text>
        <text x={46} y={height - 22} textAnchor="end" fontSize={9} fill="#8a9ab5" fontFamily="'DM Mono', monospace">0%</text>
        <text x={50} y={height - 5} fontSize={9} fill="#8a9ab5" fontFamily="'DM Mono', monospace">1</text>
        <text x={50 + (sampled.length - 1) * xScale} y={height - 5} textAnchor="end" fontSize={9} fill="#8a9ab5" fontFamily="'DM Mono', monospace">
          {sampled[sampled.length - 1].month}
        </text>
      </svg>
    </div>
  );
};

const SensitivityTable = ({ model, params }) => {
  const paramKeys = Object.entries(revenueModels[model].params)
    .filter(([_, cfg]) => cfg.type !== 'select')
    .slice(0, 5);

  const baseResult = revenueModels[model].compute(params);
  const baseLTV = baseResult.ltv;

  const rows = paramKeys.map(([key, cfg]) => {
    const downVal = Math.max(cfg.min, params[key] * 0.8);
    const upVal = Math.min(cfg.max, params[key] * 1.2);
    const downParams = { ...params, [key]: downVal };
    const upParams = { ...params, [key]: upVal };
    const downLTV = revenueModels[model].compute(downParams).ltv;
    const upLTV = revenueModels[model].compute(upParams).ltv;
    const impact = Math.abs(upLTV - downLTV);
    return { key, label: cfg.label, base: params[key], downVal, upVal, downLTV, upLTV, impact };
  }).sort((a, b) => b.impact - a.impact);

  const maxImpact = Math.max(...rows.map(r => r.impact), 1);

  return (
    <div>
      <div style={{ fontSize: 11, color: '#8a9ab5', marginBottom: 10, fontFamily: "'DM Mono', monospace", letterSpacing: 0.5 }}>
        SENSITIVITY ANALYSIS (±20%)
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {rows.map(r => {
          const leftW = baseLTV > 0 ? Math.abs(r.downLTV - baseLTV) / maxImpact * 120 : 0;
          const rightW = baseLTV > 0 ? Math.abs(r.upLTV - baseLTV) / maxImpact * 120 : 0;
          const downColor = r.downLTV < baseLTV ? '#b85c4a' : '#5a8a6a';
          const upColor = r.upLTV > baseLTV ? '#5a8a6a' : '#b85c4a';
          return (
            <div key={r.key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 170, fontSize: 10, color: '#7a8a9a', fontFamily: "'DM Mono', monospace", textAlign: 'right', flexShrink: 0 }}>
                {r.label.replace(' (£)', '').replace(' (%)', '')}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', width: 260 }}>
                <div style={{ width: 125, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                  <span style={{ fontSize: 8, color: '#8a9ab5', marginRight: 4, fontFamily: "'DM Mono', monospace" }}>
                    £{r.downLTV >= 1000 ? `${(r.downLTV / 1000).toFixed(1)}K` : r.downLTV.toFixed(0)}
                  </span>
                  <div style={{ width: leftW, height: 14, background: downColor, opacity: 0.6, borderRadius: '2px 0 0 2px' }} />
                </div>
                <div style={{ width: 2, height: 20, background: '#4a5a6a', flexShrink: 0 }} />
                <div style={{ width: 125, display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: rightW, height: 14, background: upColor, opacity: 0.6, borderRadius: '0 2px 2px 0' }} />
                  <span style={{ fontSize: 8, color: '#8a9ab5', marginLeft: 4, fontFamily: "'DM Mono', monospace" }}>
                    £{r.upLTV >= 1000 ? `${(r.upLTV / 1000).toFixed(1)}K` : r.upLTV.toFixed(0)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 9, color: '#5a6a7a', marginTop: 8, fontFamily: "'DM Mono', monospace", textAlign: 'center' }}>
        ◂ −20% from base │ base LTV: £{baseLTV >= 1000 ? `${(baseLTV / 1000).toFixed(1)}K` : baseLTV.toFixed(0)} │ +20% from base ▸
      </div>
    </div>
  );
};


// ── Cohort Projection ──
const CohortProjection = ({ model, params, cac }) => {
  const result = revenueModels[model].compute(params);
  const cacPerCustomer = cac.customersAcquiredMonthly > 0
    ? (cac.monthlySalesSpend + cac.monthlyMarketingSpend) / cac.customersAcquiredMonthly
    : 0;

  const months = Math.min(36, Math.max(24, Math.ceil(result.avgLifespanMonths * 1.5)));
  const cohortSize = cac.customersAcquiredMonthly;
  const data = [];
  let cumProfit = -cacPerCustomer * cohortSize;

  for (let m = 0; m < months; m++) {
    const rev = result.monthlyRevenues[m] ? result.monthlyRevenues[m].revenue * cohortSize : 0;
    const gp = rev * (params.grossMargin / 100);
    cumProfit += gp;
    data.push({ month: m + 1, cumProfit, gp, paybackReached: cumProfit >= 0 });
  }

  const paybackMonth = data.findIndex(d => d.paybackReached);
  const maxAbs = Math.max(...data.map(d => Math.abs(d.cumProfit)), 1);
  const chartW = 540;
  const chartH = 150;
  const barW = Math.max(2, (chartW - 60) / data.length - 1);
  const zeroY = chartH / 2;

  return (
    <div>
      <div style={{ fontSize: 11, color: '#8a9ab5', marginBottom: 6, fontFamily: "'DM Mono', monospace", letterSpacing: 0.5 }}>
        COHORT CUMULATIVE PROFIT (cohort of {cohortSize})
      </div>
      <svg width={chartW} height={chartH + 20} viewBox={`0 0 ${chartW} ${chartH + 20}`} style={{ display: 'block' }}>
        <line x1={50} y1={zeroY} x2={chartW - 10} y2={zeroY} stroke="#3a4a5a" strokeWidth={0.5} />
        {data.map((d, i) => {
          const barH = (Math.abs(d.cumProfit) / maxAbs) * (chartH / 2 - 10);
          const y = d.cumProfit >= 0 ? zeroY - barH : zeroY;
          const color = d.cumProfit >= 0 ? '#5a8a6a' : '#b85c4a';
          return (
            <rect key={i} x={50 + i * (barW + 1)} y={y} width={barW} height={barH}
              fill={color} opacity={0.65} rx={1} />
          );
        })}
        {paybackMonth >= 0 && (
          <>
            <line x1={50 + paybackMonth * (barW + 1)} y1={5} x2={50 + paybackMonth * (barW + 1)} y2={chartH - 5}
              stroke="#d4aa6a" strokeWidth={1} strokeDasharray="3,2" />
            <text x={50 + paybackMonth * (barW + 1)} y={12} textAnchor="middle" fontSize={9}
              fill="#d4aa6a" fontFamily="'DM Mono', monospace" fontWeight="600">
              Payback: Mo {paybackMonth + 1}
            </text>
          </>
        )}
        <text x={46} y={15} textAnchor="end" fontSize={8} fill="#5a8a6a" fontFamily="'DM Mono', monospace">
          +£{(maxAbs / 1000).toFixed(0)}K
        </text>
        <text x={46} y={chartH - 5} textAnchor="end" fontSize={8} fill="#b85c4a" fontFamily="'DM Mono', monospace">
          −£{(maxAbs / 1000).toFixed(0)}K
        </text>
        <text x={50} y={chartH + 15} fontSize={9} fill="#8a9ab5" fontFamily="'DM Mono', monospace">Mo 1</text>
        <text x={chartW - 15} y={chartH + 15} textAnchor="end" fontSize={9} fill="#8a9ab5" fontFamily="'DM Mono', monospace">Mo {months}</text>
      </svg>
    </div>
  );
};


// ── Main Component ──
const LTVAnalyzer = () => {
  const [selectedModel, setSelectedModel] = useState('subscription');
  const [params, setParams] = useState(() => {
    const defaults = {};
    Object.entries(revenueModels.subscription.params).forEach(([k, v]) => {
      defaults[k] = v.default;
    });
    return defaults;
  });
  const [cac, setCac] = useState(cacDefaults);
  const [activeTab, setActiveTab] = useState('model');

  const handleModelChange = useCallback((modelKey) => {
    setSelectedModel(modelKey);
    const defaults = {};
    Object.entries(revenueModels[modelKey].params).forEach(([k, v]) => {
      defaults[k] = v.default;
    });
    setParams(defaults);
  }, []);

  const handleParamChange = useCallback((key, value) => {
    setParams(prev => ({ ...prev, [key]: value }));
  }, []);

  const result = useMemo(() => {
    return revenueModels[selectedModel].compute(params);
  }, [selectedModel, params]);

  const cacPerCustomer = useMemo(() => {
    return cac.customersAcquiredMonthly > 0
      ? (cac.monthlySalesSpend + cac.monthlyMarketingSpend) / cac.customersAcquiredMonthly
      : 0;
  }, [cac]);

  const ltvCacRatio = cacPerCustomer > 0 ? result.ltv / cacPerCustomer : null;

  const getRatioAssessment = (ratio) => {
    if (ratio === null) return { label: 'N/A', color: '#8a9ab5', note: 'Enter CAC data' };
    if (ratio < 1) return { label: 'Critical', color: '#c44a3a', note: 'Losing money on every customer' };
    if (ratio < 2) return { label: 'Weak', color: '#c47a5a', note: 'Margins too thin for sustainable growth' };
    if (ratio < 3) return { label: 'Acceptable', color: '#b8a04a', note: 'Viable but limited growth headroom' };
    if (ratio < 5) return { label: 'Healthy', color: '#5a8a6a', note: 'Strong unit economics' };
    return { label: 'Excellent', color: '#4a7a5a', note: 'Consider investing more in growth' };
  };

  const assessment = getRatioAssessment(ltvCacRatio);

  return (
    <div style={{
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      background: '#0e1520',
      color: '#c8d4e0',
      minHeight: '100vh',
      padding: '0',
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@300;400;500&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* ── Header ── */}
      <div style={{
        background: 'linear-gradient(135deg, #121e2e 0%, #0e1520 50%, #1a1e28 100%)',
        borderBottom: '1px solid #1e2e3e',
        padding: '28px 36px 24px',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 4 }}>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 28,
              fontWeight: 500,
              color: '#e8eef4',
              margin: 0,
              letterSpacing: -0.5,
            }}>
              Customer Lifetime Value
            </h1>
            <span style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              color: '#5a7a9a',
              letterSpacing: 1.5,
              textTransform: 'uppercase',
            }}>
              Financial Planning Tool
            </span>
          </div>
          <p style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 11,
            color: '#4a6a8a',
            margin: 0,
            letterSpacing: 0.3,
          }}>
            Model LTV across revenue types · Analyse unit economics · Stress-test assumptions
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 36px' }}>

        {/* ── Revenue Model Selector ── */}
        <div style={{
          display: 'flex',
          gap: 8,
          marginBottom: 28,
          flexWrap: 'wrap',
        }}>
          {Object.entries(revenueModels).map(([key, model]) => (
            <button
              key={key}
              onClick={() => handleModelChange(key)}
              style={{
                background: selectedModel === key ? '#1a2e3e' : 'transparent',
                border: `1px solid ${selectedModel === key ? '#2a4a6a' : '#1e2e3e'}`,
                borderRadius: 6,
                padding: '10px 16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s',
                opacity: selectedModel === key ? 1 : 0.6,
              }}
            >
              <span style={{ fontSize: 16, filter: selectedModel === key ? 'none' : 'grayscale(1)' }}>{model.icon}</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 12,
                  fontWeight: 500,
                  color: selectedModel === key ? '#c8d4e0' : '#6a7a8a',
                  letterSpacing: 0.2,
                }}>{model.name}</div>
              </div>
            </button>
          ))}
        </div>

        <div style={{ fontSize: 12, color: '#5a7a9a', marginBottom: 24, fontStyle: 'italic', fontFamily: "'DM Sans', sans-serif" }}>
          {revenueModels[selectedModel].description}
        </div>

        {/* ── Tab navigation ── */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '1px solid #1e2e3e' }}>
          {[
            { key: 'model', label: 'Parameters' },
            { key: 'economics', label: 'Unit Economics' },
            { key: 'sensitivity', label: 'Sensitivity' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: `2px solid ${activeTab === tab.key ? '#5a8a9a' : 'transparent'}`,
                padding: '8px 20px 10px',
                cursor: 'pointer',
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                letterSpacing: 1,
                color: activeTab === tab.key ? '#c8d4e0' : '#4a6a8a',
                textTransform: 'uppercase',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* ── Left Column: Inputs ── */}
          <div style={{ flex: '0 0 340px', minWidth: 300 }}>

            {activeTab === 'model' && (
              <div style={{
                background: '#121e2a',
                border: '1px solid #1e2e3e',
                borderRadius: 8,
                padding: 20,
              }}>
                <div style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 10,
                  color: '#5a7a9a',
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                  marginBottom: 16,
                }}>
                  {revenueModels[selectedModel].name} Parameters
                </div>
                {Object.entries(revenueModels[selectedModel].params).map(([key, cfg]) => (
                  <div key={key} style={{ marginBottom: 14 }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 5,
                    }}>
                      <label style={{
                        fontSize: 11,
                        color: '#8a9ab5',
                        fontFamily: "'DM Sans', sans-serif",
                      }}>{cfg.label}</label>
                      {cfg.type !== 'select' && (
                        <span style={{
                          fontFamily: "'DM Mono', monospace",
                          fontSize: 12,
                          color: '#c8d4e0',
                          fontWeight: 500,
                        }}>
                          {cfg.label.includes('(£)')
                            ? `£${params[key] >= 10000 ? (params[key] / 1000).toFixed(0) + 'K' : params[key].toLocaleString()}`
                            : cfg.label.includes('(%)')
                              ? `${params[key]}%`
                              : params[key].toLocaleString()
                          }
                        </span>
                      )}
                    </div>
                    {cfg.type === 'select' ? (
                      <select
                        value={params[key]}
                        onChange={(e) => handleParamChange(key, e.target.value)}
                        style={{
                          width: '100%',
                          background: '#0e1520',
                          border: '1px solid #1e2e3e',
                          borderRadius: 4,
                          padding: '6px 8px',
                          color: '#c8d4e0',
                          fontFamily: "'DM Mono', monospace",
                          fontSize: 11,
                        }}
                      >
                        {cfg.options.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="range"
                        min={cfg.min}
                        max={cfg.max}
                        step={cfg.step}
                        value={params[key]}
                        onChange={(e) => handleParamChange(key, parseFloat(e.target.value))}
                        style={{
                          width: '100%',
                          accentColor: '#5a8a9a',
                          height: 3,
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'economics' && (
              <div style={{
                background: '#121e2a',
                border: '1px solid #1e2e3e',
                borderRadius: 8,
                padding: 20,
              }}>
                <div style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 10,
                  color: '#5a7a9a',
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                  marginBottom: 16,
                }}>
                  Customer Acquisition Cost
                </div>
                {[
                  { key: 'monthlySalesSpend', label: 'Monthly Sales Spend (£)', min: 0, max: 200000, step: 500 },
                  { key: 'monthlyMarketingSpend', label: 'Monthly Marketing Spend (£)', min: 0, max: 500000, step: 500 },
                  { key: 'customersAcquiredMonthly', label: 'Customers Acquired / Month', min: 1, max: 1000, step: 1 },
                ].map(field => (
                  <div key={field.key} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <label style={{ fontSize: 11, color: '#8a9ab5', fontFamily: "'DM Sans', sans-serif" }}>{field.label}</label>
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: '#c8d4e0', fontWeight: 500 }}>
                        {field.key === 'customersAcquiredMonthly'
                          ? cac[field.key]
                          : `£${cac[field.key].toLocaleString()}`
                        }
                      </span>
                    </div>
                    <input
                      type="range"
                      min={field.min}
                      max={field.max}
                      step={field.step}
                      value={cac[field.key]}
                      onChange={(e) => setCac(prev => ({ ...prev, [field.key]: parseFloat(e.target.value) }))}
                      style={{ width: '100%', accentColor: '#5a8a9a', height: 3 }}
                    />
                  </div>
                ))}

                <div style={{
                  background: '#0e1520',
                  borderRadius: 6,
                  padding: 14,
                  marginTop: 16,
                  border: '1px solid #1e2e3e',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 11, color: '#8a9ab5', fontFamily: "'DM Mono', monospace" }}>CAC</span>
                    <span style={{ fontSize: 18, color: '#c47a5a', fontFamily: "'DM Mono', monospace", fontWeight: 500 }}>
                      £{cacPerCustomer.toFixed(0)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 11, color: '#8a9ab5', fontFamily: "'DM Mono', monospace" }}>LTV</span>
                    <span style={{ fontSize: 18, color: '#5a8a6a', fontFamily: "'DM Mono', monospace", fontWeight: 500 }}>
                      £{result.ltv >= 1000 ? `${(result.ltv / 1000).toFixed(1)}K` : result.ltv.toFixed(0)}
                    </span>
                  </div>
                  <div style={{
                    borderTop: '1px solid #1e2e3e',
                    paddingTop: 10,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <span style={{ fontSize: 11, color: '#8a9ab5', fontFamily: "'DM Mono', monospace" }}>LTV : CAC</span>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        fontSize: 22,
                        color: assessment.color,
                        fontFamily: "'Playfair Display', serif",
                        fontWeight: 600,
                      }}>
                        {ltvCacRatio !== null ? `${ltvCacRatio.toFixed(1)}x` : '—'}
                      </span>
                      <div style={{
                        fontSize: 9,
                        color: assessment.color,
                        fontFamily: "'DM Mono', monospace",
                        marginTop: 2,
                      }}>
                        {assessment.label} · {assessment.note}
                      </div>
                    </div>
                  </div>

                  {/* Visual ratio bar */}
                  {ltvCacRatio !== null && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{
                        display: 'flex',
                        height: 8,
                        borderRadius: 4,
                        overflow: 'hidden',
                        background: '#1a2a3a',
                      }}>
                        <div style={{
                          width: `${Math.min(100, (1 / Math.max(ltvCacRatio, 0.1)) * 100)}%`,
                          background: '#c47a5a',
                          borderRadius: '4px 0 0 4px',
                          transition: 'width 0.3s',
                        }} />
                        <div style={{
                          flex: 1,
                          background: `linear-gradient(90deg, ${assessment.color}88, ${assessment.color}44)`,
                          borderRadius: '0 4px 4px 0',
                          transition: 'background 0.3s',
                        }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                        <span style={{ fontSize: 8, color: '#c47a5a', fontFamily: "'DM Mono', monospace" }}>CAC</span>
                        <span style={{ fontSize: 8, color: '#5a8a6a', fontFamily: "'DM Mono', monospace" }}>LTV</span>
                      </div>
                    </div>
                  )}

                  {/* Months to payback */}
                  {cacPerCustomer > 0 && result.arpu > 0 && (
                    <div style={{
                      marginTop: 12,
                      padding: '8px 0 0',
                      borderTop: '1px solid #1e2e3e',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}>
                      <span style={{ fontSize: 10, color: '#6a7a8a', fontFamily: "'DM Mono', monospace" }}>
                        Months to Payback
                      </span>
                      <span style={{ fontSize: 12, color: '#b8a04a', fontFamily: "'DM Mono', monospace", fontWeight: 500 }}>
                        {(cacPerCustomer / (result.arpu * (params.grossMargin / 100))).toFixed(1)} months
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'sensitivity' && (
              <div style={{
                background: '#121e2a',
                border: '1px solid #1e2e3e',
                borderRadius: 8,
                padding: 20,
              }}>
                <SensitivityTable model={selectedModel} params={params} />
              </div>
            )}
          </div>

          {/* ── Right Column: Outputs ── */}
          <div style={{ flex: 1, minWidth: 400 }}>

            {/* LTV Hero */}
            <div style={{
              display: 'flex',
              gap: 16,
              marginBottom: 24,
              flexWrap: 'wrap',
            }}>
              <div style={{
                flex: '1 1 200px',
                background: 'linear-gradient(135deg, #1a2e3e 0%, #121e2a 100%)',
                border: '1px solid #2a4a6a',
                borderRadius: 8,
                padding: '20px 24px',
                textAlign: 'center',
              }}>
                <div style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 9,
                  color: '#5a8a9a',
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}>
                  Customer LTV
                </div>
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 36,
                  fontWeight: 600,
                  color: result.ltv >= 0 ? '#e8eef4' : '#c44a3a',
                  lineHeight: 1,
                }}>
                  £{Math.abs(result.ltv) >= 100000
                    ? `${(result.ltv / 1000).toFixed(0)}K`
                    : Math.abs(result.ltv) >= 1000
                      ? `${(result.ltv / 1000).toFixed(1)}K`
                      : result.ltv.toFixed(0)
                  }
                </div>
                <div style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 10,
                  color: '#4a6a8a',
                  marginTop: 6,
                }}>
                  gross profit / customer
                </div>
              </div>
              <div style={{
                flex: '1 1 200px',
                background: '#121e2a',
                border: '1px solid #1e2e3e',
                borderRadius: 8,
                padding: '14px 18px',
              }}>
                {result.keyMetrics.slice(0, 4).map((m, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '5px 0',
                    borderBottom: i < 3 ? '1px solid #1a2a3a' : 'none',
                  }}>
                    <span style={{ fontSize: 10, color: '#6a7a8a', fontFamily: "'DM Mono', monospace" }}>{m.label}</span>
                    <span style={{ fontSize: 11, color: '#c8d4e0', fontFamily: "'DM Mono', monospace", fontWeight: 500 }}>{m.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Charts */}
            <div style={{
              background: '#121e2a',
              border: '1px solid #1e2e3e',
              borderRadius: 8,
              padding: 20,
              marginBottom: 20,
            }}>
              <MiniBarChart
                data={result.monthlyRevenues}
                xKey="month"
                yKey="revenue"
                color="#5a7a9a"
                label="MONTHLY REVENUE PER CUSTOMER (decaying)"
              />
            </div>

            <div style={{
              background: '#121e2a',
              border: '1px solid #1e2e3e',
              borderRadius: 8,
              padding: 20,
              marginBottom: 20,
            }}>
              <RetentionCurve data={result.survivalCurve} />
            </div>

            <div style={{
              background: '#121e2a',
              border: '1px solid #1e2e3e',
              borderRadius: 8,
              padding: 20,
              marginBottom: 20,
            }}>
              <MiniBarChart
                data={result.monthlyRevenues}
                xKey="month"
                yKey="cumulative"
                color="#5a8a6a"
                label="CUMULATIVE REVENUE PER CUSTOMER"
              />
            </div>

            {activeTab === 'economics' && (
              <div style={{
                background: '#121e2a',
                border: '1px solid #1e2e3e',
                borderRadius: 8,
                padding: 20,
                marginBottom: 20,
              }}>
                <CohortProjection model={selectedModel} params={params} cac={cac} />
              </div>
            )}

            {activeTab === 'sensitivity' && (
              <div style={{
                background: '#121e2a',
                border: '1px solid #1e2e3e',
                borderRadius: 8,
                padding: 20,
              }}>
                <div style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 10,
                  color: '#5a7a9a',
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                  marginBottom: 14,
                }}>
                  Interpretation Guide
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    {
                      title: 'Churn / Retention',
                      body: 'Typically the highest-leverage parameter. A 1 percentage point reduction in monthly churn can double LTV. Focus retention efforts before optimising price.',
                      color: '#5a8a9a',
                    },
                    {
                      title: 'Gross Margin',
                      body: 'LTV scales linearly with margin. If margin is low, volume-driven models need very high retention to be viable. Margin improvements compound with lifespan.',
                      color: '#5a8a6a',
                    },
                    {
                      title: 'Expansion / Growth',
                      body: 'Revenue expansion within existing customers (upsell, cross-sell, usage growth) can offset churn. Net negative churn (expansion > churn) creates exponential LTV.',
                      color: '#b8a04a',
                    },
                    {
                      title: 'LTV : CAC Benchmarks',
                      body: '< 1x: unsustainable. 1–2x: marginal. 3x: healthy target for most businesses. 5x+: consider whether you are under-investing in growth.',
                      color: '#c47a5a',
                    },
                  ].map((item, i) => (
                    <div key={i} style={{
                      padding: '10px 14px',
                      background: '#0e1520',
                      borderRadius: 6,
                      borderLeft: `3px solid ${item.color}`,
                    }}>
                      <div style={{ fontSize: 11, color: item.color, fontFamily: "'DM Mono', monospace", fontWeight: 500, marginBottom: 4 }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: 11, color: '#7a8a9a', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>
                        {item.body}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Revenue model comparison hint */}
            {activeTab === 'model' && (
              <div style={{
                background: '#0e1520',
                border: '1px solid #1e2e3e',
                borderRadius: 8,
                padding: 16,
                marginTop: 4,
              }}>
                <div style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 10,
                  color: '#4a6a8a',
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  marginBottom: 10,
                }}>
                  Model-Specific Notes
                </div>
                {selectedModel === 'subscription' && (
                  <div style={{ fontSize: 11, color: '#6a7a8a', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>
                    <strong style={{ color: '#8a9ab5' }}>Subscription LTV</strong> is calculated as ARPU × (1 / net churn rate) × gross margin, minus onboarding costs.
                    Net churn = gross churn − expansion rate. When expansion exceeds churn (net negative churn), LTV grows
                    exponentially — the holy grail of SaaS. Annual billing with discount typically improves retention and cash flow,
                    even though per-month revenue is lower.
                  </div>
                )}
                {selectedModel === 'transaction' && (
                  <div style={{ fontSize: 11, color: '#6a7a8a', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>
                    <strong style={{ color: '#8a9ab5' }}>Transactional LTV</strong> depends on repeat purchase behaviour. Unlike subscription models where
                    revenue is predictable, transactional businesses must estimate purchase frequency and annual repeat rates. The
                    first-purchase discount reduces initial revenue but is common for customer acquisition. Basket growth over time
                    (through upselling and cross-selling) is a key lever — even modest annual growth compounds significantly over a
                    multi-year customer lifespan.
                  </div>
                )}
                {selectedModel === 'contract' && (
                  <div style={{ fontSize: 11, color: '#6a7a8a', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>
                    <strong style={{ color: '#8a9ab5' }}>Contract LTV</strong> differs from subscription in that churn is discrete (at renewal points)
                    rather than continuous. Implementation costs are front-loaded, making initial contracts unprofitable in many
                    enterprise models. The renewal rate and upsell-on-renewal compound together: each renewal is larger than the last.
                    Support costs are ongoing and reduce effective margin over the lifetime.
                  </div>
                )}
                {selectedModel === 'marketplace' && (
                  <div style={{ fontSize: 11, color: '#6a7a8a', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>
                    <strong style={{ color: '#8a9ab5' }}>Marketplace LTV</strong> must be computed separately for supply and demand sides, as each has
                    different churn rates, transaction patterns, and strategic value. Revenue is the take rate on GMV, not the full
                    transaction value. Users who grow their GMV over time (increasing transaction frequency or value) generate
                    exponentially more revenue — making user engagement and activation critical metrics alongside retention.
                  </div>
                )}
                {selectedModel === 'usage' && (
                  <div style={{ fontSize: 11, color: '#6a7a8a', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>
                    <strong style={{ color: '#8a9ab5' }}>Usage-based LTV</strong> is inherently variable. Monthly consumption fluctuates, making
                    forecasting harder than subscription models. Minimum commitments provide a revenue floor but may constrain
                    adoption. The key dynamic is usage growth rate: as customers integrate deeper into a platform, consumption
                    typically grows — but this must be validated with cohort data rather than assumed.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LTVAnalyzer;

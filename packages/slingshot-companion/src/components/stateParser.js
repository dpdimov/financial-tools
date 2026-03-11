/**
 * Parses and validates game state from The Slingshot.
 *
 * Accepts either:
 *   1. A base64-encoded JSON string (from URL ?state= parameter)
 *   2. A raw JSON string (from paste input)
 *
 * The extraction snippet that players run in the game console:
 *
 *   copy(JSON.stringify({
 *     company: game.company?.name,
 *     companyId: game.company?.id,
 *     founder: game.founder?.name,
 *     founderProfile: game.founder?.profile?.id,
 *     location: game.location?.name,
 *     turn: game.turn,
 *     metrics: { ...game.metrics },
 *     investorStakes: game.investorStakes,
 *     equityGrants: game.equityGrants,
 *     investors: game.investors?.map(i => ({
 *       name: i.funder?.name,
 *       type: i.funder?.type,
 *       cash: i.funder?.cash,
 *       equity: i.funder?.equity,
 *       val: i.funder?.val,
 *       dilutionProtection: i.funder?.dilutionProtection,
 *       relationship: i.relationship
 *     })),
 *     funder: game.funder ? {
 *       name: game.funder.name,
 *       type: game.funder.type,
 *       cash: game.funder.cash,
 *       equity: game.funder.equity,
 *       val: game.funder.val,
 *       dilutionProtection: game.funder.dilutionProtection
 *     } : null,
 *     completedMilestones: game.completedMilestones,
 *     milestone: game.milestone ? { name: game.milestone.name, difficulty: game.milestone.difficulty } : null,
 *     milestoneProgress: game.milestoneProgress,
 *     quarterlyRevenue: game.quarterlyRevenue || 0,
 *     revenueModel: game.revenueModel?.id,
 *     quarterSummaries: game.quarterSummaries,
 *     investorRelationship: game.investorRelationship,
 *     pivotHistory: game.pivotHistory,
 *     extremeMode: game.extremeMode,
 *     ukGrantHistory: game.ukGrantHistory
 *   }))
 */

export function parseGameState(input) {
  if (!input || typeof input !== 'string') return null;

  let raw = input.trim();

  // Try base64 decode first
  if (!raw.startsWith('{')) {
    try {
      raw = atob(raw);
    } catch {
      // Not base64, treat as raw JSON
    }
  }

  try {
    const state = JSON.parse(raw);
    return validateState(state);
  } catch {
    return null;
  }
}

function validateState(s) {
  // Minimum viable state: must have metrics and turn
  if (!s || typeof s.turn !== 'number' || !s.metrics) return null;

  return {
    company: s.company || 'Unknown Startup',
    companyId: s.companyId || null,
    founder: s.founder || 'Unknown Founder',
    founderProfile: s.founderProfile || null,
    location: s.location || null,
    turn: s.turn,
    metrics: {
      cash: s.metrics.cash ?? 0,
      val: s.metrics.val ?? 0,
      equity: s.metrics.equity ?? 100,
      staff: s.metrics.staff ?? 0,
      burn: s.metrics.burn ?? 0,
      sci: s.metrics.sci ?? 0,
      dev: s.metrics.dev ?? 0,
      mkt: s.metrics.mkt ?? 0,
      hr: s.metrics.hr ?? 0,
    },
    investorStakes: Array.isArray(s.investorStakes) ? s.investorStakes : [],
    equityGrants: Array.isArray(s.equityGrants) ? s.equityGrants : [],
    investors: Array.isArray(s.investors) ? s.investors : [],
    funder: s.funder || null,
    completedMilestones: Array.isArray(s.completedMilestones) ? s.completedMilestones : [],
    milestone: s.milestone || null,
    milestoneProgress: s.milestoneProgress ?? 0,
    quarterlyRevenue: s.quarterlyRevenue ?? 0,
    revenueModel: s.revenueModel || null,
    quarterSummaries: Array.isArray(s.quarterSummaries) ? s.quarterSummaries : [],
    investorRelationship: s.investorRelationship ?? 1,
    pivotHistory: Array.isArray(s.pivotHistory) ? s.pivotHistory : [],
    extremeMode: s.extremeMode ?? false,
    ukGrantHistory: Array.isArray(s.ukGrantHistory) ? s.ukGrantHistory : [],
  };
}

/**
 * Calculate risk metrics from a milestones array.
 * Exported so the UI can recalculate interactively when the user toggles milestones.
 * @param {Array} milestones — array of { name, risk, months, achieved }
 * @param {number} currentValuation — current post-money valuation (£k)
 * @returns {Object} risk profile with metrics, progression, and valuation step-ups
 */
export function calculateRiskMetrics(milestones, currentValuation = 0) {
  const achieved = milestones.filter(ms => ms.achieved).length;
  const unachieved = milestones.filter(ms => !ms.achieved);
  const successProb = unachieved.reduce((acc, ms) => acc * (1 - ms.risk), 1);
  const compositeRisk = 1 - successProb;
  const requiredMultiple = successProb > 0 ? 1 / successProb : Infinity;
  const remainingMonths = unachieved.reduce((s, ms) => s + ms.months, 0);
  const remainingYears = remainingMonths / 12;
  const requiredIRR = remainingYears > 0 && requiredMultiple !== Infinity
    ? (Math.pow(requiredMultiple, 1 / remainingYears) - 1) * 100 : 0;

  // Inferred funding stage
  let fundingStage;
  if (achieved <= 2) fundingStage = 'Pre-Seed / Angel';
  else if (achieved === 3) fundingStage = 'Seed';
  else if (achieved === 4) fundingStage = 'Seed / Series A';
  else if (achieved === 5) fundingStage = 'Series A';
  else if (achieved === 6) fundingStage = 'Series B';
  else if (achieved <= 8) fundingStage = 'Series B / Growth';
  else fundingStage = 'Growth / Pre-IPO';

  // Risk reduction progression — shows cumulative risk as each milestone is achieved in order
  const progression = [{ stage: 'Start', risk: 100, success: 0 }];
  milestones.forEach((ms, idx) => {
    const achievedUpTo = milestones.map((m, i) => ({ ...m, achieved: i <= idx }));
    const unach = achievedUpTo.filter(m => !m.achieved);
    const prob = unach.reduce((acc, m) => acc * (1 - m.risk), 1);
    progression.push({
      stage: ms.name,
      risk: +((1 - prob) * 100).toFixed(1),
      success: +(prob * 100).toFixed(1),
      achieved: ms.achieved,
    });
  });

  // Valuation step-ups: for each unachieved milestone, show what valuation would be
  // if that specific risk were removed. Formula: val_after = val_now / (1 - milestone_risk)
  // Already-achieved milestones show current valuation (their risk is already removed).
  const valuationStepUps = milestones.map((ms) => {
    // If already achieved, this risk is already priced in — no additional step-up
    const impliedVal = ms.achieved
      ? currentValuation
      : Math.round(currentValuation / (1 - ms.risk));
    const stepUpPct = ms.achieved ? 0 : +((ms.risk / (1 - ms.risk)) * 100).toFixed(1);
    return {
      name: ms.name,
      achieved: ms.achieved,
      risk: ms.risk,
      impliedValuation: impliedVal,
      stepUpPct,
    };
  });

  return {
    milestones,
    achieved,
    total: milestones.length,
    compositeRisk: +(compositeRisk * 100).toFixed(1),
    successProb: +(successProb * 100).toFixed(1),
    requiredMultiple: requiredMultiple === Infinity ? Infinity : +requiredMultiple.toFixed(1),
    requiredIRR: +requiredIRR.toFixed(0),
    remainingMonths,
    fundingStage,
    progression,
    valuationStepUps,
  };
}

/**
 * Derive financial analysis from parsed game state.
 */
export function analyseFinancials(state) {
  if (!state) return null;

  const m = state.metrics;

  // --- Ownership breakdown ---
  const totalInvestorEquity = state.investorStakes.reduce((sum, s) => sum + s.equity, 0);
  const totalEmployeeEquity = state.equityGrants.reduce((sum, g) => sum + g.equity, 0);
  const founderEquity = Math.max(0, 100 - totalInvestorEquity - totalEmployeeEquity);

  // --- Runway ---
  const netBurn = Math.max(0, m.burn - (state.quarterlyRevenue || 0));
  const runway = netBurn > 0 ? m.cash / netBurn : Infinity;
  const runwayQuarters = runway === Infinity ? Infinity : Math.floor(runway);

  // --- Valuation metrics ---
  const postMoneyVal = m.val;
  const founderStakeValue = (founderEquity / 100) * postMoneyVal;

  // --- Implied pre-money for each round ---
  const rounds = state.investorStakes.map(stake => {
    // Find matching investor details
    const inv = state.investors.find(i => i.name === stake.name);
    const cashInvested = inv?.cash || 0;
    const equityTaken = stake.equity;
    const impliedPostMoney = equityTaken > 0 ? (cashInvested / equityTaken) * 100 : 0;
    const impliedPreMoney = impliedPostMoney - cashInvested;

    return {
      name: stake.name,
      round: stake.round || 'Unknown',
      turn: stake.turn,
      equity: equityTaken,
      cashInvested,
      impliedPostMoney,
      impliedPreMoney,
      dilutionProtection: stake.dilutionProtection || 0,
      protectionLabel: stake.dilutionProtection >= 1 ? 'Full' :
                       stake.dilutionProtection >= 0.5 ? 'Partial' : 'None',
    };
  });

  // --- Dilution history from quarter summaries ---
  const equityTimeline = state.quarterSummaries.map(q => ({
    quarter: q.quarter,
    equity: q.metrics?.equity ?? null,
    cash: q.cash ?? q.metrics?.cash ?? null,
    valuation: q.valuation ?? q.metrics?.val ?? null,
    burn: q.metrics?.burn ?? null,
    runway: q.runway ?? null,
  })).filter(q => q.equity !== null);

  // --- Burn rate trend ---
  const burnTrend = state.quarterSummaries.map(q => ({
    quarter: q.quarter,
    burn: q.metrics?.burn ?? 0,
    revenue: 0, // Game doesn't store per-quarter revenue in summaries
    cash: q.cash ?? q.metrics?.cash ?? 0,
  }));

  // --- Annual Recurring Revenue (if available) ---
  const arr = (state.quarterlyRevenue || 0) * 4;

  // --- SEIS/EIS eligibility heuristic ---
  // UK tax-advantaged schemes: SEIS for <£350k raised, <25 employees, <2 years old
  // EIS for <£5M/year, <250 employees, <7 years old
  const totalRaised = rounds.reduce((sum, r) => sum + r.cashInvested, 0);
  const yearsOld = state.turn / 4;
  const seisEligible = totalRaised <= 350 && m.staff <= 25 && yearsOld <= 2;
  const eisEligible = m.staff <= 250 && yearsOld <= 7;

  // --- What-if: next round dilution scenarios ---
  const nextRoundScenarios = [250, 500, 1000, 2000].map(raiseAmount => {
    // Estimate pre-money as current valuation
    const preMoney = postMoneyVal;
    const postMoney = preMoney + raiseAmount;
    const newInvestorPct = (raiseAmount / postMoney) * 100;
    const dilutionFactor = preMoney / postMoney;

    // Calculate post-round founder equity
    const newFounderEquity = founderEquity * dilutionFactor;
    const newFounderValue = (newFounderEquity / 100) * postMoney;

    return {
      raiseAmount,
      preMoney,
      postMoney,
      newInvestorPct: +newInvestorPct.toFixed(1),
      founderEquityBefore: +founderEquity.toFixed(1),
      founderEquityAfter: +newFounderEquity.toFixed(1),
      founderValueBefore: Math.round(founderStakeValue),
      founderValueAfter: Math.round(newFounderValue),
      dilutionPct: +((1 - dilutionFactor) * 100).toFixed(1),
    };
  });

  // --- Grant funding summary ---
  const grantSummary = {
    totalApplied: state.ukGrantHistory.length,
    totalAwarded: state.ukGrantHistory.filter(g => g.outcome === 'funded' || g.status === 'funded').length,
    totalCash: state.ukGrantHistory
      .filter(g => g.outcome === 'funded' || g.status === 'funded')
      .reduce((sum, g) => sum + (g.amount || g.award || 0), 0),
  };

  // --- SAFE / convertible note scenarios ---
  // Shows what happens if next round uses a SAFE at various cap/discount combos
  const safeScenarios = (() => {
    const caps = [1000, 2000, 3000, 5000]; // valuation caps in £k
    const discounts = [10, 15, 20, 25]; // discount percentages
    const noteAmount = 250; // £250k convertible note

    return caps.map(cap => {
      const capResults = discounts.map(discount => {
        // Series A price based on current valuation
        const seriesAPrice = postMoneyVal; // pre-money for next round
        const postMoney = seriesAPrice + noteAmount;

        // Discount method: buy shares at discounted price
        const discountedVal = seriesAPrice * (1 - discount / 100);
        const discountPct = (noteAmount / (discountedVal + noteAmount)) * 100;

        // Cap method: ceiling on conversion valuation
        const capPct = (noteAmount / (cap + noteAmount)) * 100;

        // Effective: whichever gives more equity to note holder (better deal)
        const effectivePct = Math.max(discountPct, capPct);
        const effectiveMethod = capPct >= discountPct ? 'cap' : 'discount';

        // Founder dilution
        const newFounderEquity = founderEquity * (1 - effectivePct / 100);

        return {
          discount,
          discountPct: +discountPct.toFixed(1),
          capPct: +capPct.toFixed(1),
          effectivePct: +effectivePct.toFixed(1),
          effectiveMethod,
          founderEquityAfter: +newFounderEquity.toFixed(1),
        };
      });
      return { cap, noteAmount, results: capResults };
    });
  })();

  // --- Liquidation preference waterfall ---
  // Model exit scenarios showing who gets paid what
  const liquidationWaterfall = (() => {
    const exitMultiples = [0.5, 1, 2, 3, 5, 10]; // exit as multiple of current valuation
    return exitMultiples.map(mult => {
      const exitVal = postMoneyVal * mult;
      let remaining = exitVal;
      const payouts = [];

      // Step 1: Preferred shareholders get liquidation preference (1x, LIFO order)
      const sortedRounds = [...rounds].reverse(); // latest round first (seniority)
      sortedRounds.forEach(r => {
        const prefAmount = r.cashInvested * (r.dilutionProtection >= 1 ? 1 : 1); // 1x liquidation pref
        const payout = Math.min(prefAmount, remaining);
        remaining -= payout;
        payouts.push({
          name: r.name,
          round: r.round,
          invested: r.cashInvested,
          equity: r.equity,
          prefPayout: payout,
          participationPayout: 0,
          totalPayout: payout,
          multiple: 0,
          isPreferred: true,
        });
      });

      // Step 2: Remaining distributed pro-rata to all (common + preferred participating)
      if (remaining > 0) {
        // Non-participating preferred: remaining goes to common holders only
        // Participating preferred: they get pro-rata share of remainder too
        // In Slingshot, investors with dilution protection >= 1 participate
        const participatingRounds = payouts.filter((_, i) =>
          sortedRounds[i].dilutionProtection >= 1
        );
        const participatingEquity = participatingRounds.reduce((s, p) => s + p.equity, 0);
        const commonEquity = founderEquity + totalEmployeeEquity +
          rounds.filter(r => r.dilutionProtection < 1).reduce((s, r) => s + r.equity, 0);
        const totalParticipating = participatingEquity + commonEquity;

        // Founder payout from remaining
        const founderShare = totalParticipating > 0 ? (founderEquity / totalParticipating) * remaining : remaining;

        // Participating preferred get additional pro-rata
        participatingRounds.forEach(p => {
          const share = totalParticipating > 0 ? (p.equity / totalParticipating) * remaining : 0;
          p.participationPayout = share;
          p.totalPayout += share;
        });

        // Non-participating preferred: check if converting to common is better
        payouts.forEach((p, i) => {
          if (sortedRounds[i].dilutionProtection < 1) {
            // They could convert: get pro-rata of whole exit
            const convertValue = (p.equity / 100) * exitVal;
            if (convertValue > p.totalPayout) {
              p.totalPayout = convertValue;
              p.prefPayout = 0;
              p.participationPayout = convertValue;
            }
          }
          p.multiple = p.invested > 0 ? +(p.totalPayout / p.invested).toFixed(1) : 0;
        });

        // Employee share
        const employeeShare = totalParticipating > 0 ? (totalEmployeeEquity / totalParticipating) * remaining : 0;

        return {
          exitMultiple: mult,
          exitVal,
          founderPayout: Math.round(founderShare),
          founderMultiple: founderStakeValue > 0 ? +(founderShare / founderStakeValue).toFixed(1) : 0,
          employeePayout: Math.round(employeeShare),
          investorPayouts: payouts.map(p => ({
            ...p,
            prefPayout: Math.round(p.prefPayout),
            participationPayout: Math.round(p.participationPayout),
            totalPayout: Math.round(p.totalPayout),
          })),
          totalDistributed: Math.round(founderShare + employeeShare + payouts.reduce((s, p) => s + p.totalPayout, 0)),
        };
      }

      // No remaining for common after preferences paid out
      return {
        exitMultiple: mult,
        exitVal,
        founderPayout: 0,
        founderMultiple: 0,
        employeePayout: 0,
        investorPayouts: payouts.map(p => ({
          ...p,
          prefPayout: Math.round(p.prefPayout),
          participationPayout: 0,
          totalPayout: Math.round(p.prefPayout),
          multiple: p.invested > 0 ? +(p.prefPayout / p.invested).toFixed(1) : 0,
        })),
        totalDistributed: Math.round(payouts.reduce((s, p) => s + p.prefPayout, 0)),
      };
    });
  })();

  // --- VC valuation range ---
  // Infer stage and suggest valuation range using simplified VC method
  const valuationRange = (() => {
    const milestonesCompleted = state.completedMilestones.length;
    const hasRevenue = (state.quarterlyRevenue || 0) > 0;

    // Infer funding stage from game state
    let stage, stageLabel, survivalRate, yearsToEstablished, baseDiscount, terminalMultiple;
    if (yearsOld <= 0.5 && totalRaised <= 0) {
      stage = 'pre-seed';
      stageLabel = 'Pre-Seed';
      survivalRate = 0.10; yearsToEstablished = 6; baseDiscount = 0.20; terminalMultiple = 20;
    } else if (yearsOld <= 1 && totalRaised <= 500) {
      stage = 'seed';
      stageLabel = 'Seed';
      survivalRate = 0.20; yearsToEstablished = 5; baseDiscount = 0.18; terminalMultiple = 15;
    } else if (yearsOld <= 2 && totalRaised <= 2000) {
      stage = 'series-a';
      stageLabel = 'Series A';
      survivalRate = 0.35; yearsToEstablished = 4; baseDiscount = 0.15; terminalMultiple = 12;
    } else if (yearsOld <= 3) {
      stage = 'series-b';
      stageLabel = 'Series B';
      survivalRate = 0.50; yearsToEstablished = 3; baseDiscount = 0.12; terminalMultiple = 10;
    } else {
      stage = 'growth';
      stageLabel = 'Growth';
      survivalRate = 0.70; yearsToEstablished = 2; baseDiscount = 0.10; terminalMultiple = 8;
    }

    // Risk-adjusted discount rate (from VC valuation tool)
    const annualFailure = 1 - Math.pow(survivalRate, 1 / yearsToEstablished);
    const riskAdjustedRate = (baseDiscount + annualFailure) / (1 - annualFailure);

    // Simple revenue-based valuation if revenue exists
    let revenueValuation = null;
    if (hasRevenue) {
      revenueValuation = arr * terminalMultiple;
    }

    // DCF-style forward estimate: project 3 years of cash flows
    const projectedGrowthRate = hasRevenue ? 1.0 : 0; // 100% YoY for early-stage
    let projectedRevenue = arr;
    let dcfValue = 0;
    for (let y = 1; y <= 3; y++) {
      projectedRevenue = projectedRevenue * (1 + projectedGrowthRate);
      const cashFlow = projectedRevenue * 0.3; // assume 30% margin at scale
      dcfValue += cashFlow / Math.pow(1 + riskAdjustedRate, y);
    }
    // Terminal value
    const terminalValue = projectedRevenue * terminalMultiple / Math.pow(1 + riskAdjustedRate, 3);
    dcfValue += terminalValue;

    // Comparable stage-based ranges (£k) — typical UK AI startup
    const stageRanges = {
      'pre-seed': { low: 500, mid: 1000, high: 2000 },
      'seed': { low: 1500, mid: 3000, high: 6000 },
      'series-a': { low: 5000, mid: 10000, high: 20000 },
      'series-b': { low: 15000, mid: 30000, high: 60000 },
      'growth': { low: 40000, mid: 80000, high: 150000 },
    };
    const comparable = stageRanges[stage];

    // Blend: weight comparable heavily for pre-revenue, shift to revenue-based with revenue
    const low = hasRevenue ? Math.min(comparable.low, dcfValue * 0.5) : comparable.low;
    const high = hasRevenue ? Math.max(comparable.high, dcfValue * 1.2) : comparable.high;
    const mid = hasRevenue ? (dcfValue + comparable.mid) / 2 : comparable.mid;

    // Investment sizing: what equity % for typical raise amounts at these valuations
    const raiseAmounts = [250, 500, 1000, 2000];
    const investmentScenarios = raiseAmounts.map(raise => ({
      raise,
      atLow: +((raise / (low + raise)) * 100).toFixed(1),
      atMid: +((raise / (mid + raise)) * 100).toFixed(1),
      atHigh: +((raise / (high + raise)) * 100).toFixed(1),
    }));

    return {
      stage, stageLabel, survivalRate, yearsToEstablished,
      riskAdjustedRate: +(riskAdjustedRate * 100).toFixed(1),
      revenueValuation: revenueValuation ? Math.round(revenueValuation) : null,
      dcfValue: Math.round(dcfValue),
      low: Math.round(low), mid: Math.round(mid), high: Math.round(high),
      currentVal: postMoneyVal,
      investmentScenarios,
    };
  })();

  // --- Risk profile & investor return expectations ---
  // Maps game state to risk framework from the risk visualizer
  // --- Risk profile: initial milestone definitions with auto-detected achieved state ---
  const riskMilestones = (() => {
    const milestonesCompleted = state.completedMilestones.length;
    const hasRevenue = (state.quarterlyRevenue || 0) > 0;
    return [
      { name: 'Problem-Solution Fit', risk: 0.40, months: 6, achieved: milestonesCompleted >= 1 || yearsOld > 0.5 },
      { name: 'Team Assembly', risk: 0.35, months: 6, achieved: m.staff >= 3 },
      { name: 'Technology Readiness', risk: 0.30, months: 12, achieved: m.sci >= 2 || m.dev >= 2 },
      { name: 'Product Development', risk: 0.25, months: 9, achieved: milestonesCompleted >= 2 },
      { name: 'Product-Market Fit', risk: 0.22, months: 12, achieved: hasRevenue && milestonesCompleted >= 2 },
      { name: 'Unit Economics', risk: 0.18, months: 9, achieved: hasRevenue && arr > m.burn * 4 },
      { name: 'Scalable Growth', risk: 0.15, months: 9, achieved: arr > m.burn * 8 },
      { name: 'Capital Structure', risk: 0.15, months: 6, achieved: rounds.length >= 2 && founderEquity > 50 },
      { name: 'Cash Flow Positive', risk: 0.12, months: 12, achieved: state.quarterlyRevenue > m.burn },
    ];
  })();
  const riskProfile = calculateRiskMetrics(riskMilestones, postMoneyVal);

  // --- Enhanced burn trend with revenue ---
  const burnRevenueData = state.quarterSummaries.map((q, i) => {
    const burn = q.metrics?.burn ?? 0;
    const cash = q.cash ?? q.metrics?.cash ?? 0;
    // Estimate revenue: if current quarter has revenue, assume linear ramp from 0
    const revFraction = state.quarterSummaries.length > 1
      ? i / (state.quarterSummaries.length - 1)
      : 1;
    const estimatedRevenue = (state.quarterlyRevenue || 0) * revFraction;
    return {
      quarter: q.quarter,
      burn,
      revenue: Math.round(estimatedRevenue),
      netBurn: Math.round(Math.max(0, burn - estimatedRevenue)),
      cash,
    };
  });

  return {
    // Ownership
    founderEquity,
    totalInvestorEquity,
    totalEmployeeEquity,
    founderStakeValue,

    // Runway
    runway: runwayQuarters === Infinity ? null : runwayQuarters,
    runwayExact: runway === Infinity ? null : +runway.toFixed(1),
    monthsRunway: runway === Infinity ? null : +(runway * 3).toFixed(0), // quarters to months

    // Valuation
    postMoneyVal,
    arr,

    // Rounds
    rounds,
    totalRaised,

    // Tax schemes
    seisEligible,
    eisEligible,

    // Timelines
    equityTimeline,
    burnTrend,

    // What-if
    nextRoundScenarios,

    // Grants
    grantSummary,

    // Vesting
    equityGrants: state.equityGrants,

    // NEW: SAFE / convertible notes
    safeScenarios,

    // NEW: Liquidation preference waterfall
    liquidationWaterfall,

    // NEW: VC valuation range
    valuationRange,

    // NEW: Risk profile & investor returns
    riskProfile,

    // NEW: Enhanced burn/revenue data
    burnRevenueData,
  };
}

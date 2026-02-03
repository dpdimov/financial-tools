import React, { useState, useMemo, useCallback } from 'react';

// ── Acquisition models keyed to mirror LTV revenue models ──
const acquisitionModels = {
  subscription: {
    name: 'Subscription / SaaS',
    icon: '↻',
    description: 'Product-led or sales-led funnel with trial/demo conversion stages',
    funnel: [
      { key: 'visitors', label: 'Website Visitors / Month', min: 100, max: 1000000, step: 100, default: 25000 },
      { key: 'signups', label: 'Signup / Trial Rate (%)', min: 0.5, max: 30, step: 0.1, default: 4.5 },
      { key: 'activation', label: 'Activation Rate (%)', min: 10, max: 95, step: 1, default: 55 },
      { key: 'conversion', label: 'Trial → Paid Conversion (%)', min: 1, max: 80, step: 0.5, default: 18 },
    ],
    channels: [
      { key: 'contentSeo', label: 'Content & SEO', defaultSpend: 4000, defaultShare: 25 },
      { key: 'paidSearch', label: 'Paid Search (SEM)', defaultSpend: 5500, defaultShare: 30 },
      { key: 'paidSocial', label: 'Paid Social', defaultSpend: 3000, defaultShare: 18 },
      { key: 'partnerships', label: 'Partnerships & Affiliates', defaultSpend: 1500, defaultShare: 10 },
      { key: 'salesTeam', label: 'Inside Sales / SDR', defaultSpend: 8000, defaultShare: 0, isSales: true },
      { key: 'events', label: 'Events & Webinars', defaultSpend: 2000, defaultShare: 8 },
      { key: 'referral', label: 'Referral Programme', defaultSpend: 800, defaultShare: 9 },
    ],
    overheadItems: [
      { key: 'tools', label: 'Marketing Tools & CRM', default: 1200 },
      { key: 'creative', label: 'Creative & Design', default: 2000 },
      { key: 'analytics', label: 'Analytics & Attribution', default: 400 },
    ],
    notes: 'SaaS funnels typically bifurcate into product-led (self-serve trial → activation → paid) and sales-led (demo request → qualification → close). The activation step is critical: users who reach the "aha moment" convert at 3–5x the rate of those who don\'t. Free trials reduce top-of-funnel friction but can inflate visitor-to-signup rates while masking poor activation. Track time-to-activation alongside conversion rate.',
  },
  transaction: {
    name: 'Transactional / E-commerce',
    icon: '⇄',
    description: 'Traffic-driven funnel with browse, cart, and purchase stages',
    funnel: [
      { key: 'visitors', label: 'Store Visitors / Month', min: 100, max: 2000000, step: 500, default: 50000 },
      { key: 'productView', label: 'Product View Rate (%)', min: 10, max: 90, step: 1, default: 45 },
      { key: 'addToCart', label: 'Add-to-Cart Rate (%)', min: 1, max: 40, step: 0.5, default: 8 },
      { key: 'checkout', label: 'Checkout Completion (%)', min: 20, max: 95, step: 1, default: 62 },
    ],
    channels: [
      { key: 'paidSocial', label: 'Paid Social (Meta, TikTok)', defaultSpend: 8000, defaultShare: 35 },
      { key: 'paidSearch', label: 'Google Shopping / SEM', defaultSpend: 6000, defaultShare: 28 },
      { key: 'seo', label: 'Organic / SEO', defaultSpend: 2500, defaultShare: 18 },
      { key: 'email', label: 'Email & Lifecycle', defaultSpend: 1000, defaultShare: 8 },
      { key: 'influencer', label: 'Influencer & UGC', defaultSpend: 3000, defaultShare: 6 },
      { key: 'affiliates', label: 'Affiliate Network', defaultSpend: 1500, defaultShare: 5 },
    ],
    overheadItems: [
      { key: 'tools', label: 'E-commerce Platform & Tools', default: 800 },
      { key: 'creative', label: 'Photography & Creative', default: 2500 },
      { key: 'returns', label: 'Returns Processing Cost', default: 1200 },
    ],
    notes: 'E-commerce funnels are traffic-intensive with low per-visit conversion rates but high volume. Cart abandonment (typically 65–80%) is the largest leak. Retargeting, abandoned cart emails, and checkout optimisation are high-leverage interventions. Blended CAC must account for the proportion of organic vs paid traffic — a business acquiring 60% of customers organically has fundamentally different economics from one that is 90% paid.',
  },
  contract: {
    name: 'Contract / Enterprise',
    icon: '▣',
    description: 'Sales-led pipeline with qualification, proposal, and close stages',
    funnel: [
      { key: 'leads', label: 'Inbound Leads / Month', min: 5, max: 5000, step: 5, default: 120 },
      { key: 'qualified', label: 'Lead → MQL Rate (%)', min: 5, max: 60, step: 1, default: 28 },
      { key: 'opportunity', label: 'MQL → SQL / Opportunity (%)', min: 5, max: 60, step: 1, default: 35 },
      { key: 'proposal', label: 'Proposal / Demo Rate (%)', min: 20, max: 90, step: 1, default: 55 },
      { key: 'close', label: 'Close Rate (%)', min: 5, max: 60, step: 1, default: 22 },
    ],
    channels: [
      { key: 'salesTeam', label: 'Sales Team (AEs + SDRs)', defaultSpend: 25000, defaultShare: 0, isSales: true },
      { key: 'contentAbm', label: 'Content & ABM', defaultSpend: 6000, defaultShare: 30 },
      { key: 'events', label: 'Trade Shows & Events', defaultSpend: 8000, defaultShare: 20 },
      { key: 'paidSearch', label: 'Paid Search / LinkedIn', defaultSpend: 5000, defaultShare: 25 },
      { key: 'partnerships', label: 'Channel Partners', defaultSpend: 4000, defaultShare: 15 },
      { key: 'referral', label: 'Customer Referrals', defaultSpend: 1000, defaultShare: 10 },
    ],
    overheadItems: [
      { key: 'crm', label: 'CRM & Sales Tools', default: 3000 },
      { key: 'travel', label: 'Travel & Entertainment', default: 4000 },
      { key: 'proposals', label: 'Proposal & Legal', default: 2000 },
    ],
    notes: 'Enterprise sales funnels are long-cycle (3–12 months), high-touch, and expensive. Sales team costs dominate CAC and are often 50–70% of the total. The funnel has more stages and each requires different capabilities: SDRs for qualification, AEs for demos and proposals, executives for enterprise closes. The critical ratio is pipeline-to-close — if close rate is low, the upstream investment in pipeline generation is wasted. Quota attainment directly affects blended CAC.',
  },
  marketplace: {
    name: 'Marketplace / Platform',
    icon: '◈',
    description: 'Dual-sided acquisition with separate supply and demand funnels',
    funnel: [
      { key: 'visitors', label: 'Platform Visitors / Month', min: 500, max: 2000000, step: 500, default: 80000 },
      { key: 'signup', label: 'Signup Rate (%)', min: 1, max: 30, step: 0.5, default: 6 },
      { key: 'firstAction', label: 'First Transaction Rate (%)', min: 5, max: 70, step: 1, default: 28 },
      { key: 'repeatAction', label: 'Second Transaction Rate (%)', min: 10, max: 80, step: 1, default: 45 },
    ],
    channels: [
      { key: 'demandPaid', label: 'Demand: Paid Acquisition', defaultSpend: 6000, defaultShare: 30 },
      { key: 'demandOrganic', label: 'Demand: Organic & SEO', defaultSpend: 3000, defaultShare: 25 },
      { key: 'supplyOutreach', label: 'Supply: Direct Outreach', defaultSpend: 5000, defaultShare: 0, isSales: true },
      { key: 'supplyIncentive', label: 'Supply: Onboarding Incentives', defaultSpend: 4000, defaultShare: 20 },
      { key: 'referral', label: 'Referral (both sides)', defaultSpend: 2000, defaultShare: 15 },
      { key: 'community', label: 'Community & PR', defaultSpend: 2000, defaultShare: 10 },
    ],
    overheadItems: [
      { key: 'tools', label: 'Platform & Analytics', default: 1500 },
      { key: 'trust', label: 'Trust & Safety', default: 2000 },
      { key: 'support', label: 'Onboarding Support', default: 1500 },
    ],
    notes: 'Marketplace CAC must be computed per side. The chicken-and-egg problem means early-stage marketplaces often subsidise one side heavily (typically supply) to bootstrap liquidity. A common error is reporting blended CAC across both sides, which obscures the true cost structure. Supply-side CAC often involves direct sales or incentives; demand-side is more traditional marketing. The critical metric is not just acquisition but activation — a signed-up provider who never lists, or a buyer who never transacts, has zero value.',
  },
  usage: {
    name: 'Usage / Consumption',
    icon: '△',
    description: 'Developer or API-led funnel with integration and activation stages',
    funnel: [
      { key: 'visitors', label: 'Docs / Landing Visitors / Month', min: 500, max: 500000, step: 500, default: 35000 },
      { key: 'signup', label: 'API Key / Account Signup (%)', min: 1, max: 25, step: 0.5, default: 7 },
      { key: 'integration', label: 'First API Call / Integration (%)', min: 10, max: 80, step: 1, default: 38 },
      { key: 'activation', label: 'Meaningful Usage Threshold (%)', min: 5, max: 70, step: 1, default: 25 },
    ],
    channels: [
      { key: 'devContent', label: 'Developer Content & Docs', defaultSpend: 5000, defaultShare: 30 },
      { key: 'community', label: 'Community & Open Source', defaultSpend: 3000, defaultShare: 20 },
      { key: 'paidSearch', label: 'Paid Search (technical)', defaultSpend: 4000, defaultShare: 18 },
      { key: 'partnerships', label: 'Technology Partnerships', defaultSpend: 3000, defaultShare: 12 },
      { key: 'salesAssist', label: 'Sales-Assist (high-usage)', defaultSpend: 6000, defaultShare: 0, isSales: true },
      { key: 'events', label: 'Hackathons & Dev Events', defaultSpend: 2000, defaultShare: 10 },
      { key: 'referral', label: 'Developer Referral', defaultSpend: 1000, defaultShare: 10 },
    ],
    overheadItems: [
      { key: 'tools', label: 'Dev Platform & Monitoring', default: 2000 },
      { key: 'sandbox', label: 'Sandbox / Free Tier Cost', default: 3000 },
      { key: 'support', label: 'Technical Support', default: 2500 },
    ],
    notes: 'Usage-based models often rely on developer-led or product-led growth, where the "funnel" is documentation → signup → first API call → meaningful usage. Free tiers and sandbox environments are acquisition costs in disguise — they don\'t appear in marketing budgets but directly enable conversion. The activation threshold (what constitutes "meaningful usage") is a critical definition: too low and you count tire-kickers; too high and you undercount genuine early adopters still ramping. Sales-assist layers on top for enterprise accounts that need hand-holding.',
  },
};

// ── Funnel Visualization ──
const FunnelChart = ({ stages, width = 520, height = 200 }) => {
  if (!stages || stages.length === 0) return null;
  const maxVal = stages[0].value;
  const barH = Math.min(32, (height - 20) / stages.length - 4);
  const labelW = 140;
  const chartW = width - labelW - 80;

  return (
    <div>
      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8, fontFamily: "'Source Sans 3', sans-serif", fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
        CONVERSION FUNNEL
      </div>
      <svg width={width} height={stages.length * (barH + 6) + 10} viewBox={`0 0 ${width} ${stages.length * (barH + 6) + 10}`}>
        {stages.map((s, i) => {
          const w = maxVal > 0 ? (s.value / maxVal) * chartW : 0;
          const y = i * (barH + 6) + 4;
          const opacity = 0.5 + 0.5 * (1 - i / stages.length);
          const xOff = (chartW - w) / 2 + labelW;
          return (
            <g key={i}>
              <text x={labelW - 8} y={y + barH / 2 + 4} textAnchor="end" fontSize={10}
                fill="#64748b" fontFamily="'Source Sans 3', sans-serif">{s.label}</text>
              <rect x={xOff} y={y} width={Math.max(2, w)} height={barH}
                fill="#0d9488" opacity={opacity} rx={3} />
              <text x={xOff + w + 6} y={y + barH / 2 + 4} fontSize={10}
                fill="#1e293b" fontFamily="'Source Sans 3', sans-serif" fontWeight="600">
                {s.value >= 1000 ? `${(s.value / 1000).toFixed(1)}K` : s.value.toFixed(0)}
              </text>
              {i > 0 && (
                <text x={xOff + w + (s.value >= 1000 ? 50 : 36)} y={y + barH / 2 + 4} fontSize={9}
                  fill={s.rate >= 30 ? '#16a34a' : s.rate >= 15 ? '#ca8a04' : '#dc2626'}
                  fontFamily="'Source Sans 3', sans-serif">
                  {s.rate.toFixed(1)}%
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// ── Channel Mix Donut ──
const ChannelDonut = ({ channels, width = 240, height = 240 }) => {
  const total = channels.reduce((s, c) => s + c.spend, 0);
  if (total === 0) return null;
  const cx = width / 2, cy = height / 2, r = 80, inner = 50;
  const colors = ['#0d9488', '#16a34a', '#ca8a04', '#ea580c', '#7c3aed', '#0891b2', '#be185d'];
  let cumAngle = -Math.PI / 2;

  const arcs = channels.filter(c => c.spend > 0).map((c, i) => {
    const angle = (c.spend / total) * Math.PI * 2;
    const startAngle = cumAngle;
    cumAngle += angle;
    const endAngle = cumAngle;
    const largeArc = angle > Math.PI ? 1 : 0;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const ix1 = cx + inner * Math.cos(startAngle);
    const iy1 = cy + inner * Math.sin(startAngle);
    const ix2 = cx + inner * Math.cos(endAngle);
    const iy2 = cy + inner * Math.sin(endAngle);
    const d = `M${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2} L${ix2},${iy2} A${inner},${inner} 0 ${largeArc} 0 ${ix1},${iy1} Z`;
    return { ...c, d, color: colors[i % colors.length], pct: (c.spend / total * 100).toFixed(0) };
  });

  return (
    <div>
      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8, fontFamily: "'Source Sans 3', sans-serif", fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
        CHANNEL MIX
      </div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          {arcs.map((a, i) => (
            <path key={i} d={a.d} fill={a.color} opacity={0.8} stroke="#ffffff" strokeWidth={1.5} />
          ))}
          <text x={cx} y={cy - 6} textAnchor="middle" fontSize={16} fill="#1e293b"
            fontFamily="'Crimson Pro', serif" fontWeight="600">
            £{total >= 1000 ? `${(total / 1000).toFixed(0)}K` : total}
          </text>
          <text x={cx} y={cy + 10} textAnchor="middle" fontSize={9} fill="#64748b"
            fontFamily="'Source Sans 3', sans-serif">total / month</text>
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {arcs.map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: a.color, opacity: 0.8, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: '#64748b', fontFamily: "'Source Sans 3', sans-serif", fontWeight: 500, minWidth: 28 }}>{a.pct}%</span>
              <span style={{ fontSize: 11, color: '#64748b', fontFamily: "'Source Sans 3', sans-serif" }}>{a.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Efficiency Scatter ──
const EfficiencyChart = ({ channels, width = 520, height = 180 }) => {
  const valid = channels.filter(c => c.spend > 0 && c.customers > 0);
  if (valid.length === 0) return null;
  const maxCac = Math.max(...valid.map(c => c.spend / c.customers));
  const maxCust = Math.max(...valid.map(c => c.customers));
  const colors = ['#0d9488', '#16a34a', '#ca8a04', '#ea580c', '#7c3aed', '#0891b2', '#be185d'];
  const plotL = 60, plotR = width - 20, plotT = 10, plotB = height - 30;

  return (
    <div>
      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8, fontFamily: "'Source Sans 3', sans-serif", fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
        CHANNEL EFFICIENCY (cost per customer vs volume)
      </div>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Grid */}
        <line x1={plotL} y1={plotB} x2={plotR} y2={plotB} stroke="#e2e8f0" strokeWidth={0.5} />
        <line x1={plotL} y1={plotT} x2={plotL} y2={plotB} stroke="#e2e8f0" strokeWidth={0.5} />
        <text x={width / 2} y={height - 4} textAnchor="middle" fontSize={9} fill="#64748b" fontFamily="'Source Sans 3', sans-serif">
          Customers Acquired →
        </text>
        <text x={12} y={(plotT + plotB) / 2} textAnchor="middle" fontSize={9} fill="#64748b"
          fontFamily="'Source Sans 3', sans-serif" transform={`rotate(-90, 12, ${(plotT + plotB) / 2})`}>
          CAC (£) →
        </text>
        {valid.map((c, i) => {
          const cac = c.spend / c.customers;
          const x = plotL + (c.customers / maxCust) * (plotR - plotL - 20);
          const y = plotB - (cac / maxCac) * (plotB - plotT - 10);
          const bubbleR = 4 + (c.spend / Math.max(...valid.map(v => v.spend))) * 14;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={bubbleR} fill={colors[i % colors.length]} opacity={0.4} />
              <circle cx={x} cy={y} r={2.5} fill={colors[i % colors.length]} />
              <text x={x} y={y - bubbleR - 4} textAnchor="middle" fontSize={8} fill="#64748b" fontFamily="'Source Sans 3', sans-serif">
                {c.label.length > 16 ? c.label.slice(0, 14) + '…' : c.label}
              </text>
            </g>
          );
        })}
        {/* Axis values */}
        <text x={plotL - 4} y={plotT + 6} textAnchor="end" fontSize={8} fill="#64748b" fontFamily="'Source Sans 3', sans-serif">
          £{maxCac.toFixed(0)}
        </text>
        <text x={plotL - 4} y={plotB - 2} textAnchor="end" fontSize={8} fill="#64748b" fontFamily="'Source Sans 3', sans-serif">£0</text>
        <text x={plotR} y={plotB + 12} textAnchor="end" fontSize={8} fill="#64748b" fontFamily="'Source Sans 3', sans-serif">
          {maxCust.toFixed(0)}
        </text>
      </svg>
    </div>
  );
};

// ── Sensitivity Tornado ──
const CACSensitivity = ({ model, funnelParams, channelSpends, overheads, computeCAC }) => {
  const baseCAC = computeCAC(funnelParams, channelSpends, overheads);
  if (baseCAC <= 0 || !isFinite(baseCAC)) return null;

  const funnelEntries = acquisitionModels[model].funnel.slice(1); // skip top-of-funnel volume
  const rows = funnelEntries.map(f => {
    const downP = { ...funnelParams, [f.key]: Math.max(f.min, funnelParams[f.key] * 0.8) };
    const upP = { ...funnelParams, [f.key]: Math.min(f.max, funnelParams[f.key] * 1.2) };
    const downCAC = computeCAC(downP, channelSpends, overheads);
    const upCAC = computeCAC(upP, channelSpends, overheads);
    return { label: f.label.replace(' (%)', '').replace(' Rate', ''), downCAC, upCAC, impact: Math.abs(upCAC - downCAC) };
  });

  // Add total spend sensitivity
  const spendDown = {};
  const spendUp = {};
  Object.keys(channelSpends).forEach(k => {
    spendDown[k] = channelSpends[k] * 0.8;
    spendUp[k] = channelSpends[k] * 1.2;
  });
  const overDown = {};
  const overUp = {};
  Object.keys(overheads).forEach(k => {
    overDown[k] = overheads[k] * 0.8;
    overUp[k] = overheads[k] * 1.2;
  });
  rows.push({
    label: 'Total Spend',
    downCAC: computeCAC(funnelParams, spendDown, overDown),
    upCAC: computeCAC(funnelParams, spendUp, overUp),
    impact: Math.abs(computeCAC(funnelParams, spendUp, overUp) - computeCAC(funnelParams, spendDown, overDown)),
  });

  rows.sort((a, b) => b.impact - a.impact);
  const maxImpact = Math.max(...rows.map(r => r.impact), 1);

  return (
    <div>
      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 10, fontFamily: "'Source Sans 3', sans-serif", fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
        CAC SENSITIVITY (±20%)
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {rows.map((r, i) => {
          const leftW = Math.abs(r.downCAC - baseCAC) / maxImpact * 100;
          const rightW = Math.abs(r.upCAC - baseCAC) / maxImpact * 100;
          // For CAC, lower is better — so color logic is inverted from LTV
          const downColor = r.downCAC < baseCAC ? '#16a34a' : '#dc2626';
          const upColor = r.upCAC < baseCAC ? '#16a34a' : '#dc2626';
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 140, fontSize: 11, color: '#64748b', fontFamily: "'Source Sans 3', sans-serif", textAlign: 'right', flexShrink: 0 }}>
                {r.label}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', width: 240 }}>
                <div style={{ width: 115, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                  <span style={{ fontSize: 9, color: '#64748b', marginRight: 4, fontFamily: "'Source Sans 3', sans-serif" }}>
                    £{r.downCAC.toFixed(0)}
                  </span>
                  <div style={{ width: leftW, height: 14, background: downColor, opacity: 0.7, borderRadius: '2px 0 0 2px' }} />
                </div>
                <div style={{ width: 2, height: 20, background: '#94a3b8', flexShrink: 0 }} />
                <div style={{ width: 115, display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: rightW, height: 14, background: upColor, opacity: 0.7, borderRadius: '0 2px 2px 0' }} />
                  <span style={{ fontSize: 9, color: '#64748b', marginLeft: 4, fontFamily: "'Source Sans 3', sans-serif" }}>
                    £{r.upCAC.toFixed(0)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 10, color: '#64748b', marginTop: 8, fontFamily: "'Source Sans 3', sans-serif", textAlign: 'center' }}>
        ◂ −20% │ base CAC: £{baseCAC.toFixed(0)} │ +20% ▸
      </div>
    </div>
  );
};

// ── Monthly CAC Trend ──
const CACTrendChart = ({ monthlyData, width = 520, height = 160 }) => {
  if (!monthlyData || monthlyData.length < 2) return null;
  const maxCAC = Math.max(...monthlyData.map(d => d.cac));
  const minCAC = Math.min(...monthlyData.map(d => d.cac));
  const range = maxCAC - minCAC || 1;
  const xScale = (width - 70) / (monthlyData.length - 1);

  const pathD = monthlyData.map((d, i) => {
    const x = 50 + i * xScale;
    const y = (height - 25) - ((d.cac - minCAC) / range) * (height - 45);
    return `${i === 0 ? 'M' : 'L'}${x},${y}`;
  }).join(' ');

  return (
    <div>
      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6, fontFamily: "'Source Sans 3', sans-serif", fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
        PROJECTED CAC TRAJECTORY (with scale efficiencies)
      </div>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
        <defs>
          <linearGradient id="cacGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ea580c" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ea580c" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={pathD + ` L${50 + (monthlyData.length - 1) * xScale},${height - 25} L50,${height - 25} Z`}
          fill="url(#cacGrad)" />
        <path d={pathD} fill="none" stroke="#ea580c" strokeWidth={2} />
        {/* Start and end dots */}
        <circle cx={50} cy={(height - 25) - ((monthlyData[0].cac - minCAC) / range) * (height - 45)}
          r={3} fill="#ea580c" />
        <circle cx={50 + (monthlyData.length - 1) * xScale}
          cy={(height - 25) - ((monthlyData[monthlyData.length - 1].cac - minCAC) / range) * (height - 45)}
          r={3} fill="#ea580c" />
        {/* Labels */}
        <text x={46} y={18} textAnchor="end" fontSize={9} fill="#dc2626" fontFamily="'Source Sans 3', sans-serif">
          £{maxCAC.toFixed(0)}
        </text>
        <text x={46} y={height - 22} textAnchor="end" fontSize={9} fill="#16a34a" fontFamily="'Source Sans 3', sans-serif">
          £{minCAC.toFixed(0)}
        </text>
        <text x={50} y={height - 5} fontSize={9} fill="#64748b" fontFamily="'Source Sans 3', sans-serif">Mo 1</text>
        <text x={50 + (monthlyData.length - 1) * xScale} y={height - 5} textAnchor="end" fontSize={9}
          fill="#64748b" fontFamily="'Source Sans 3', sans-serif">Mo {monthlyData.length}</text>
      </svg>
    </div>
  );
};


// ══════════════════════════════════════════
// ── Main Component ──
// ══════════════════════════════════════════
const CACAnalyzer = () => {
  const [selectedModel, setSelectedModel] = useState('subscription');
  const [activeTab, setActiveTab] = useState('funnel');

  // Funnel params
  const [funnelParams, setFunnelParams] = useState(() => {
    const d = {};
    acquisitionModels.subscription.funnel.forEach(f => { d[f.key] = f.default; });
    return d;
  });

  // Channel spends
  const [channelSpends, setChannelSpends] = useState(() => {
    const d = {};
    acquisitionModels.subscription.channels.forEach(c => { d[c.key] = c.defaultSpend; });
    return d;
  });

  // Channel traffic share (% of visitors driven by each channel — for non-sales channels)
  const [channelShares, setChannelShares] = useState(() => {
    const d = {};
    acquisitionModels.subscription.channels.forEach(c => { d[c.key] = c.defaultShare; });
    return d;
  });

  // Overheads
  const [overheads, setOverheads] = useState(() => {
    const d = {};
    acquisitionModels.subscription.overheadItems.forEach(o => { d[o.key] = o.default; });
    return d;
  });

  // Scaling assumptions
  const [scaling, setScaling] = useState({
    organicGrowthRate: 5, // % monthly growth in organic traffic
    cpcInflation: 2,      // % monthly increase in paid costs
    conversionImprovement: 1, // % monthly improvement in funnel conversion
    months: 12,
  });

  const handleModelChange = useCallback((modelKey) => {
    setSelectedModel(modelKey);
    const fd = {};
    acquisitionModels[modelKey].funnel.forEach(f => { fd[f.key] = f.default; });
    setFunnelParams(fd);
    const cd = {};
    acquisitionModels[modelKey].channels.forEach(c => { cd[c.key] = c.defaultSpend; });
    setChannelSpends(cd);
    const sd = {};
    acquisitionModels[modelKey].channels.forEach(c => { sd[c.key] = c.defaultShare; });
    setChannelShares(sd);
    const od = {};
    acquisitionModels[modelKey].overheadItems.forEach(o => { od[o.key] = o.default; });
    setOverheads(od);
  }, []);

  // ── Core computation ──
  const computeCAC = useCallback((fp, cs, oh) => {
    const model = acquisitionModels[selectedModel];
    const topOfFunnel = fp[model.funnel[0].key];
    let throughput = topOfFunnel;
    for (let i = 1; i < model.funnel.length; i++) {
      throughput *= (fp[model.funnel[i].key] / 100);
    }
    const customersAcquired = Math.max(1, throughput);
    const totalChannelSpend = Object.values(cs).reduce((s, v) => s + v, 0);
    const totalOverhead = Object.values(oh).reduce((s, v) => s + v, 0);
    const totalSpend = totalChannelSpend + totalOverhead;
    return totalSpend / customersAcquired;
  }, [selectedModel]);

  const result = useMemo(() => {
    const model = acquisitionModels[selectedModel];
    const topOfFunnel = funnelParams[model.funnel[0].key];
    const stages = [{ label: model.funnel[0].label.replace(' / Month', '').replace(' / Month', ''), value: topOfFunnel, rate: 100 }];
    let throughput = topOfFunnel;
    for (let i = 1; i < model.funnel.length; i++) {
      const rate = funnelParams[model.funnel[i].key];
      throughput *= (rate / 100);
      stages.push({
        label: model.funnel[i].label.replace(' Rate (%)', '').replace(' (%)', ''),
        value: throughput,
        rate,
      });
    }
    const customersAcquired = Math.max(1, throughput);
    const totalChannelSpend = Object.values(channelSpends).reduce((s, v) => s + v, 0);
    const totalOverhead = Object.values(overheads).reduce((s, v) => s + v, 0);
    const totalSpend = totalChannelSpend + totalOverhead;
    const blendedCAC = totalSpend / customersAcquired;

    // Channel-level metrics
    const channelMetrics = model.channels.map(ch => {
      const spend = channelSpends[ch.key] || 0;
      const share = channelShares[ch.key] || 0;
      let customers;
      if (ch.isSales) {
        // Sales channels: assume their spend drives a proportional share of pipeline
        // Use ratio of sales spend to total spend as proxy
        customers = customersAcquired * (spend / totalSpend);
      } else {
        // Marketing channels: share of traffic × funnel conversion
        const traffic = topOfFunnel * (share / 100);
        let conv = 1;
        for (let i = 1; i < model.funnel.length; i++) {
          conv *= (funnelParams[model.funnel[i].key] / 100);
        }
        customers = traffic * conv;
      }
      return {
        ...ch,
        spend,
        share,
        customers: Math.max(0, customers),
        cac: customers > 0 ? spend / customers : Infinity,
      };
    });

    // Trend projection
    const monthlyData = [];
    for (let m = 0; m < scaling.months; m++) {
      const organicMult = Math.pow(1 + scaling.organicGrowthRate / 100, m);
      const cpcMult = Math.pow(1 + scaling.cpcInflation / 100, m);
      const convMult = Math.pow(1 + scaling.conversionImprovement / 100, m);
      const adjTraffic = topOfFunnel * organicMult;
      let adjThroughput = adjTraffic;
      for (let i = 1; i < model.funnel.length; i++) {
        adjThroughput *= (funnelParams[model.funnel[i].key] / 100 * convMult);
      }
      const adjSpend = totalChannelSpend * cpcMult + totalOverhead;
      const adjCust = Math.max(1, adjThroughput);
      monthlyData.push({ month: m + 1, cac: adjSpend / adjCust, customers: adjCust, spend: adjSpend });
    }

    // Overall funnel conversion
    const overallConversion = customersAcquired / topOfFunnel * 100;

    return {
      blendedCAC,
      customersAcquired,
      totalSpend,
      totalChannelSpend,
      totalOverhead,
      stages,
      channelMetrics,
      monthlyData,
      overallConversion,
      costPerLead: totalSpend / stages[1]?.value || 0,
    };
  }, [selectedModel, funnelParams, channelSpends, channelShares, overheads, scaling]);

  return (
    <div style={{
      fontFamily: "'Source Sans 3', 'Helvetica Neue', sans-serif",
      background: '#f8fafc',
      color: '#1e293b',
      minHeight: '100vh',
      padding: '0',
    }}>

      {/* ── Header ── */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '28px 36px 24px',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 4, flexWrap: 'wrap' }}>
            <h1 style={{
              fontFamily: "'Crimson Pro', serif",
              fontSize: 28,
              fontWeight: 600,
              color: '#1e293b',
              margin: 0,
              letterSpacing: -0.5,
            }}>
              Customer Acquisition Cost
            </h1>
            <span style={{
              fontFamily: "'Source Sans 3', sans-serif",
              fontSize: 12,
              color: '#64748b',
              letterSpacing: 0.5,
              textTransform: 'uppercase',
            }}>
              Financial Planning Tool
            </span>
          </div>
          <p style={{
            fontFamily: "'Source Sans 3', sans-serif",
            fontSize: 13,
            color: '#64748b',
            margin: 0,
          }}>
            Model acquisition funnels · Analyse channel efficiency · Project scaling economics
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 36px' }}>

        {/* ── Revenue Model Selector ── */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
          {Object.entries(acquisitionModels).map(([key, model]) => (
            <button key={key} onClick={() => handleModelChange(key)}
              style={{
                background: selectedModel === key ? '#ea580c' : '#ffffff',
                border: `1px solid ${selectedModel === key ? '#ea580c' : '#e2e8f0'}`,
                borderRadius: 6, padding: '10px 16px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
                transition: 'all 0.2s', opacity: selectedModel === key ? 1 : 0.7,
              }}>
              <span style={{ fontSize: 16, filter: selectedModel === key ? 'none' : 'grayscale(0.5)' }}>{model.icon}</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{
                  fontFamily: "'Source Sans 3', sans-serif", fontSize: 13, fontWeight: 500,
                  color: selectedModel === key ? '#ffffff' : '#64748b', letterSpacing: 0.2,
                }}>{model.name}</div>
              </div>
            </button>
          ))}
        </div>

        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 24, fontStyle: 'italic', fontFamily: "'Source Sans 3', sans-serif" }}>
          {acquisitionModels[selectedModel].description}
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '1px solid #e2e8f0' }}>
          {[
            { key: 'funnel', label: 'Funnel' },
            { key: 'channels', label: 'Channel Mix' },
            { key: 'scaling', label: 'Scaling' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              style={{
                background: 'transparent', border: 'none',
                borderBottom: `2px solid ${activeTab === tab.key ? '#ea580c' : 'transparent'}`,
                padding: '8px 20px 10px', cursor: 'pointer',
                fontFamily: "'Source Sans 3', sans-serif", fontSize: 13, fontWeight: 500, letterSpacing: 0.5,
                color: activeTab === tab.key ? '#1e293b' : '#64748b',
                textTransform: 'uppercase', transition: 'all 0.2s',
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* ── Left: Inputs ── */}
          <div style={{ flex: '0 0 340px', minWidth: 300 }}>

            {activeTab === 'funnel' && (
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 20 }}>
                <div style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 10, color: '#0d9488', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 16 }}>
                  Funnel Parameters
                </div>
                {acquisitionModels[selectedModel].funnel.map(f => (
                  <div key={f.key} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <label style={{ fontSize: 11, color: '#8a9ab5', fontFamily: "'Source Sans 3', sans-serif" }}>{f.label}</label>
                      <span style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 12, color: '#1e293b', fontWeight: 500 }}>
                        {f.label.includes('(%)') ? `${funnelParams[f.key]}%`
                          : funnelParams[f.key] >= 1000 ? `${(funnelParams[f.key] / 1000).toFixed(1)}K`
                          : funnelParams[f.key]}
                      </span>
                    </div>
                    <input type="range" min={f.min} max={f.max} step={f.step} value={funnelParams[f.key]}
                      onChange={e => setFunnelParams(p => ({ ...p, [f.key]: parseFloat(e.target.value) }))}
                      style={{ width: '100%', accentColor: '#dc2626', height: 3 }} />
                  </div>
                ))}

                {/* Overheads */}
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 14, marginTop: 8 }}>
                  <div style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 10, color: '#0d9488', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>
                    Overhead Costs (monthly)
                  </div>
                  {acquisitionModels[selectedModel].overheadItems.map(o => (
                    <div key={o.key} style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <label style={{ fontSize: 11, color: '#8a9ab5', fontFamily: "'Source Sans 3', sans-serif" }}>{o.label}</label>
                        <span style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 12, color: '#1e293b', fontWeight: 500 }}>
                          £{overheads[o.key]?.toLocaleString()}
                        </span>
                      </div>
                      <input type="range" min={0} max={o.default * 5} step={100} value={overheads[o.key] || 0}
                        onChange={e => setOverheads(p => ({ ...p, [o.key]: parseFloat(e.target.value) }))}
                        style={{ width: '100%', accentColor: '#0d9488', height: 3 }} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'channels' && (
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 20 }}>
                <div style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 10, color: '#0d9488', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 16 }}>
                  Channel Spend & Attribution
                </div>
                {acquisitionModels[selectedModel].channels.map(ch => (
                  <div key={ch.key} style={{
                    marginBottom: 16, paddingBottom: 12,
                    borderBottom: '1px solid #f1f5f9',
                  }}>
                    <div style={{ fontSize: 11, color: '#a0b0c0', fontFamily: "'Source Sans 3', sans-serif", fontWeight: 500, marginBottom: 8 }}>
                      {ch.label}
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                          <span style={{ fontSize: 9, color: '#64748b', fontFamily: "'Source Sans 3', sans-serif" }}>Spend</span>
                          <span style={{ fontSize: 10, color: '#1e293b', fontFamily: "'Source Sans 3', sans-serif" }}>
                            £{(channelSpends[ch.key] || 0).toLocaleString()}
                          </span>
                        </div>
                        <input type="range" min={0} max={ch.defaultSpend * 5} step={100}
                          value={channelSpends[ch.key] || 0}
                          onChange={e => setChannelSpends(p => ({ ...p, [ch.key]: parseFloat(e.target.value) }))}
                          style={{ width: '100%', accentColor: '#dc2626', height: 3 }} />
                      </div>
                      {!ch.isSales && (
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                            <span style={{ fontSize: 9, color: '#64748b', fontFamily: "'Source Sans 3', sans-serif" }}>Traffic %</span>
                            <span style={{ fontSize: 10, color: '#1e293b', fontFamily: "'Source Sans 3', sans-serif" }}>
                              {channelShares[ch.key] || 0}%
                            </span>
                          </div>
                          <input type="range" min={0} max={80} step={1}
                            value={channelShares[ch.key] || 0}
                            onChange={e => setChannelShares(p => ({ ...p, [ch.key]: parseFloat(e.target.value) }))}
                            style={{ width: '100%', accentColor: '#0d9488', height: 3 }} />
                        </div>
                      )}
                      {ch.isSales && (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: 9, color: '#64748b', fontFamily: "'Source Sans 3', sans-serif", fontStyle: 'italic' }}>
                            Sales-driven
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div style={{
                  background: '#f8fafc', borderRadius: 6, padding: 10, marginTop: 4,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ fontSize: 10, color: '#64748b', fontFamily: "'Source Sans 3', sans-serif" }}>
                    Traffic attribution total
                  </span>
                  <span style={{
                    fontSize: 12, fontFamily: "'Source Sans 3', sans-serif", fontWeight: 500,
                    color: (() => {
                      const total = Object.entries(channelShares)
                        .filter(([k]) => !acquisitionModels[selectedModel].channels.find(c => c.key === k)?.isSales)
                        .reduce((s, [, v]) => s + v, 0);
                      return Math.abs(total - 100) < 2 ? '#16a34a' : '#dc2626';
                    })(),
                  }}>
                    {Object.entries(channelShares)
                      .filter(([k]) => !acquisitionModels[selectedModel].channels.find(c => c.key === k)?.isSales)
                      .reduce((s, [, v]) => s + v, 0)}%
                  </span>
                </div>
              </div>
            )}

            {activeTab === 'scaling' && (
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 20 }}>
                <div style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 10, color: '#0d9488', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 16 }}>
                  Scaling Assumptions
                </div>
                {[
                  { key: 'organicGrowthRate', label: 'Organic Traffic Growth (% / month)', min: -5, max: 20, step: 0.5 },
                  { key: 'cpcInflation', label: 'Paid Cost Inflation (% / month)', min: -5, max: 15, step: 0.5 },
                  { key: 'conversionImprovement', label: 'Conversion Improvement (% / month)', min: -3, max: 10, step: 0.5 },
                  { key: 'months', label: 'Projection Horizon (months)', min: 3, max: 36, step: 1 },
                ].map(s => (
                  <div key={s.key} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <label style={{ fontSize: 11, color: '#8a9ab5', fontFamily: "'Source Sans 3', sans-serif" }}>{s.label}</label>
                      <span style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 12, color: '#1e293b', fontWeight: 500 }}>
                        {s.key === 'months' ? scaling[s.key] : `${scaling[s.key]}%`}
                      </span>
                    </div>
                    <input type="range" min={s.min} max={s.max} step={s.step} value={scaling[s.key]}
                      onChange={e => setScaling(p => ({ ...p, [s.key]: parseFloat(e.target.value) }))}
                      style={{ width: '100%', accentColor: '#ca8a04', height: 3 }} />
                  </div>
                ))}

                {/* Sensitivity */}
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 14, marginTop: 8 }}>
                  <CACSensitivity
                    model={selectedModel}
                    funnelParams={funnelParams}
                    channelSpends={channelSpends}
                    overheads={overheads}
                    computeCAC={computeCAC}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Outputs ── */}
          <div style={{ flex: 1, minWidth: 280 }}>

            {/* CAC Hero */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
              <div style={{
                flex: '1 1 200px',
                background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.1) 0%, #ffffff 100%)',
                border: '1px solid rgba(234, 88, 12, 0.3)',
                borderRadius: 8, padding: '20px 24px', textAlign: 'center',
              }}>
                <div style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 9, color: '#dc2626', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
                  Blended CAC
                </div>
                <div style={{
                  fontFamily: "'Crimson Pro', serif", fontSize: 36, fontWeight: 600,
                  color: '#1e293b', lineHeight: 1,
                }}>
                  £{result.blendedCAC >= 1000
                    ? `${(result.blendedCAC / 1000).toFixed(1)}K`
                    : result.blendedCAC.toFixed(0)}
                </div>
                <div style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 10, color: '#64748b', marginTop: 6 }}>
                  per customer acquired
                </div>
              </div>

              <div style={{
                flex: '1 1 200px',
                background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '14px 18px',
              }}>
                {[
                  { label: 'Customers / Month', value: result.customersAcquired.toFixed(0) },
                  { label: 'Total Monthly Spend', value: `£${result.totalSpend >= 1000 ? `${(result.totalSpend / 1000).toFixed(1)}K` : result.totalSpend.toFixed(0)}` },
                  { label: 'Overall Funnel Conv.', value: `${result.overallConversion.toFixed(2)}%` },
                  { label: 'Channel Spend', value: `£${result.totalChannelSpend >= 1000 ? `${(result.totalChannelSpend / 1000).toFixed(1)}K` : result.totalChannelSpend.toFixed(0)}` },
                ].map((m, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', padding: '5px 0',
                    borderBottom: i < 3 ? '1px solid #f1f5f9' : 'none',
                  }}>
                    <span style={{ fontSize: 10, color: '#64748b', fontFamily: "'Source Sans 3', sans-serif" }}>{m.label}</span>
                    <span style={{ fontSize: 11, color: '#1e293b', fontFamily: "'Source Sans 3', sans-serif", fontWeight: 500 }}>{m.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Funnel chart */}
            {activeTab === 'funnel' && (
              <>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 20, marginBottom: 20, overflowX: 'auto' }}>
                  <FunnelChart stages={result.stages} />
                </div>

                {/* Per-stage drop-off analysis */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 20, marginBottom: 20, overflowX: 'auto' }}>
                  <div style={{ fontSize: 11, color: '#8a9ab5', marginBottom: 10, fontFamily: "'Source Sans 3', sans-serif", letterSpacing: 0.5 }}>
                    STAGE DROP-OFF ANALYSIS
                  </div>
                  {result.stages.map((s, i) => {
                    if (i === 0) return null;
                    const prev = result.stages[i - 1];
                    const lost = prev.value - s.value;
                    const lostPct = (lost / prev.value * 100);
                    return (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0',
                        borderBottom: i < result.stages.length - 1 ? '1px solid #f1f5f9' : 'none',
                      }}>
                        <div style={{ width: 120, fontSize: 10, color: '#64748b', fontFamily: "'Source Sans 3', sans-serif" }}>
                          {prev.label.slice(0, 14)} →
                        </div>
                        <div style={{ flex: 1, height: 10, background: '#f1f5f9', borderRadius: 5, overflow: 'hidden' }}>
                          <div style={{
                            width: `${100 - lostPct}%`, height: '100%',
                            background: lostPct > 80 ? '#dc2626' : lostPct > 50 ? '#ca8a04' : '#16a34a',
                            borderRadius: 5, transition: 'width 0.3s',
                          }} />
                        </div>
                        <div style={{ width: 80, textAlign: 'right' }}>
                          <span style={{
                            fontSize: 10, fontFamily: "'Source Sans 3', sans-serif", fontWeight: 500,
                            color: lostPct > 80 ? '#dc2626' : lostPct > 50 ? '#ca8a04' : '#16a34a',
                          }}>
                            {lostPct.toFixed(0)}% lost
                          </span>
                          <div style={{ fontSize: 8, color: '#5a6a7a', fontFamily: "'Source Sans 3', sans-serif" }}>
                            {lost >= 1000 ? `${(lost / 1000).toFixed(1)}K` : lost.toFixed(0)} people
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Channel mix charts */}
            {activeTab === 'channels' && (
              <>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 20, marginBottom: 20, overflowX: 'auto' }}>
                  <ChannelDonut channels={result.channelMetrics} />
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 20, marginBottom: 20, overflowX: 'auto' }}>
                  <EfficiencyChart channels={result.channelMetrics} />
                </div>

                {/* Channel breakdown table */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 20 }}>
                  <div style={{ fontSize: 11, color: '#8a9ab5', marginBottom: 10, fontFamily: "'Source Sans 3', sans-serif", letterSpacing: 0.5 }}>
                    CHANNEL-LEVEL CAC
                  </div>
                  {result.channelMetrics
                    .filter(c => c.spend > 0)
                    .sort((a, b) => a.cac - b.cac)
                    .map((c, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '7px 0', borderBottom: '1px solid #f1f5f9',
                    }}>
                      <span style={{ fontSize: 10, color: '#8a9ab5', fontFamily: "'Source Sans 3', sans-serif", flex: 1 }}>{c.label}</span>
                      <span style={{ fontSize: 10, color: '#64748b', fontFamily: "'Source Sans 3', sans-serif", width: 70, textAlign: 'right' }}>
                        £{c.spend.toLocaleString()}
                      </span>
                      <span style={{ fontSize: 10, color: '#64748b', fontFamily: "'Source Sans 3', sans-serif", width: 50, textAlign: 'right' }}>
                        {c.customers.toFixed(0)} cust
                      </span>
                      <span style={{
                        fontSize: 11, fontFamily: "'Source Sans 3', sans-serif", fontWeight: 500, width: 65, textAlign: 'right',
                        color: c.cac <= result.blendedCAC ? '#16a34a' : '#dc2626',
                      }}>
                        £{c.cac >= 1000 ? `${(c.cac / 1000).toFixed(1)}K` : c.cac.toFixed(0)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Scaling tab outputs */}
            {activeTab === 'scaling' && (
              <>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 20, marginBottom: 20, overflowX: 'auto' }}>
                  <CACTrendChart monthlyData={result.monthlyData} />
                </div>

                {/* Scaling summary */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 20, marginBottom: 20 }}>
                  <div style={{ fontSize: 11, color: '#8a9ab5', marginBottom: 10, fontFamily: "'Source Sans 3', sans-serif", letterSpacing: 0.5 }}>
                    PROJECTION SUMMARY
                  </div>
                  {result.monthlyData.length > 0 && (() => {
                    const first = result.monthlyData[0];
                    const last = result.monthlyData[result.monthlyData.length - 1];
                    const cacChange = ((last.cac - first.cac) / first.cac * 100);
                    const custChange = ((last.customers - first.customers) / first.customers * 100);
                    return (
                      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        {[
                          { label: `CAC at Mo ${last.month}`, value: `£${last.cac.toFixed(0)}`, sub: `${cacChange >= 0 ? '+' : ''}${cacChange.toFixed(0)}%`, color: cacChange <= 0 ? '#16a34a' : '#dc2626' },
                          { label: `Customers at Mo ${last.month}`, value: last.customers.toFixed(0), sub: `${custChange >= 0 ? '+' : ''}${custChange.toFixed(0)}%`, color: custChange >= 0 ? '#16a34a' : '#dc2626' },
                          { label: `Monthly Spend at Mo ${last.month}`, value: `£${last.spend >= 1000 ? `${(last.spend / 1000).toFixed(0)}K` : last.spend.toFixed(0)}`, sub: 'projected', color: '#0d9488' },
                        ].map((item, i) => (
                          <div key={i} style={{
                            flex: '1 1 140px', background: '#f8fafc', borderRadius: 6, padding: 12,
                            border: '1px solid #e2e8f0', textAlign: 'center',
                          }}>
                            <div style={{ fontSize: 9, color: '#0d9488', fontFamily: "'Source Sans 3', sans-serif", marginBottom: 4, textTransform: 'uppercase' }}>
                              {item.label}
                            </div>
                            <div style={{ fontSize: 20, color: '#1e293b', fontFamily: "'Crimson Pro', serif", fontWeight: 600 }}>
                              {item.value}
                            </div>
                            <div style={{ fontSize: 10, color: item.color, fontFamily: "'Source Sans 3', sans-serif", marginTop: 2 }}>
                              {item.sub}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </>
            )}

            {/* Model notes — always visible */}
            <div style={{
              background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 16, marginTop: 4,
            }}>
              <div style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 10, color: '#64748b', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>
                Model-Specific Notes
              </div>
              <div style={{ fontSize: 11, color: '#64748b', fontFamily: "'Source Sans 3', sans-serif", lineHeight: 1.6 }}>
                {acquisitionModels[selectedModel].notes}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CACAnalyzer;

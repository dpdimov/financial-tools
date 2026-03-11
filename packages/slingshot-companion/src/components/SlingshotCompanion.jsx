import React, { useState, useMemo, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, ComposedChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, ReferenceLine
} from 'recharts';
import { Upload, ClipboardPaste, TrendingUp, Shield, AlertCircle, ChevronDown, ChevronUp, Target, Zap, BarChart3 } from 'lucide-react';
import { parseGameState, analyseFinancials, calculateRiskMetrics } from './stateParser';

// Colour palette — matches financial-tools conventions
const C = {
  bg: '#F8FAFC',
  card: '#FFFFFF',
  border: '#E2E8F0',
  text: '#1E293B',
  textMuted: '#64748B',
  teal: '#0D9488',
  blue: '#2563EB',
  red: '#DC2626',
  amber: '#D97706',
  purple: '#7C3AED',
  green: '#16A34A',
  emerald: '#059669',
  rose: '#E11D48',
  slate300: '#CBD5E1',
};

const PIE_COLOURS = [C.teal, C.blue, C.amber, C.purple, C.rose, C.emerald, '#6366F1', '#F97316'];

const fmt = (v) => {
  if (v === undefined || v === null) return '-';
  if (v >= 1000) return `${(v / 1000).toFixed(1)}M`;
  return `${Math.round(v)}k`;
};
const fmtP = (v) => `${(+v).toFixed(1)}%`;
const fmtCash = (v) => `\u00A3${fmt(v)}`;

// ---------------------------------------------------------------------------
// Extraction snippet shown to users
// ---------------------------------------------------------------------------
const EXTRACTION_SNIPPET = `copy(JSON.stringify({
  company: game.company?.name,
  companyId: game.company?.id,
  founder: game.founder?.name,
  founderProfile: game.founder?.profile?.id,
  location: game.location?.name,
  turn: game.turn,
  metrics: { ...game.metrics },
  investorStakes: game.investorStakes,
  equityGrants: game.equityGrants,
  investors: game.investors?.map(i => ({
    name: i.funder?.name, type: i.funder?.type,
    cash: i.funder?.cash, equity: i.funder?.equity,
    val: i.funder?.val,
    dilutionProtection: i.funder?.dilutionProtection,
    relationship: i.relationship
  })),
  funder: game.funder ? {
    name: game.funder.name, type: game.funder.type,
    cash: game.funder.cash, equity: game.funder.equity,
    val: game.funder.val,
    dilutionProtection: game.funder.dilutionProtection
  } : null,
  completedMilestones: game.completedMilestones,
  milestone: game.milestone ? {
    name: game.milestone.name,
    difficulty: game.milestone.difficulty
  } : null,
  milestoneProgress: game.milestoneProgress,
  quarterlyRevenue: game.quarterlyRevenue || 0,
  revenueModel: game.revenueModel?.id,
  quarterSummaries: game.quarterSummaries,
  investorRelationship: game.investorRelationship,
  pivotHistory: game.pivotHistory,
  extremeMode: game.extremeMode,
  ukGrantHistory: game.ukGrantHistory
}))`;

// ---------------------------------------------------------------------------
// Section wrapper
// ---------------------------------------------------------------------------
const Section = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, marginBottom: 20, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: "'Crimson Pro', serif", fontSize: '1.25rem', fontWeight: 600, color: C.text,
        }}
      >
        {title}
        {open ? <ChevronUp size={18} color={C.textMuted} /> : <ChevronDown size={18} color={C.textMuted} />}
      </button>
      {open && <div style={{ padding: '0 20px 20px' }}>{children}</div>}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Metric card
// ---------------------------------------------------------------------------
const Metric = ({ label, value, sub, colour = C.text }) => (
  <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '12px 16px', minWidth: 120 }}>
    <div style={{ fontSize: '0.75rem', color: C.textMuted, marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: colour, fontFamily: "'Source Sans 3', sans-serif" }}>{value}</div>
    {sub && <div style={{ fontSize: '0.7rem', color: C.textMuted, marginTop: 2 }}>{sub}</div>}
  </div>
);

// ===========================================================================
// MAIN COMPONENT
// ===========================================================================
const SlingshotCompanion = () => {
  const [rawInput, setRawInput] = useState('');
  const [gameState, setGameState] = useState(null);
  const [error, setError] = useState(null);
  const [riskOverrides, setRiskOverrides] = useState(null); // null = use auto-detected

  // Check URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('state');
    if (encoded) {
      const parsed = parseGameState(encoded);
      if (parsed) {
        setGameState(parsed);
        setRawInput('(loaded from URL)');
      } else {
        setError('Could not parse the state data from the URL.');
      }
    }
  }, []);

  const handleImport = () => {
    setError(null);
    const parsed = parseGameState(rawInput);
    if (parsed) {
      setGameState(parsed);
    } else {
      setError('Could not parse that input. Make sure you copied the full JSON output from the browser console.');
    }
  };

  const analysis = useMemo(() => analyseFinancials(gameState), [gameState]);

  // Reset risk overrides when game state changes
  useEffect(() => { setRiskOverrides(null); }, [gameState]);

  // Interactive risk: if user has toggled milestones, recalculate from overrides
  const liveRisk = useMemo(() => {
    if (!analysis) return null;
    if (!riskOverrides) return analysis.riskProfile;
    return calculateRiskMetrics(riskOverrides, analysis.postMoneyVal);
  }, [analysis, riskOverrides]);

  // -------------------------------------------------------------------------
  // Import screen
  // -------------------------------------------------------------------------
  if (!gameState) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 20px', fontFamily: "'Source Sans 3', sans-serif" }}>
        <h1 style={{ fontFamily: "'Crimson Pro', serif", fontSize: '2rem', fontWeight: 700, color: C.text, marginBottom: 8 }}>
          Slingshot Finance Companion
        </h1>
        <p style={{ color: C.textMuted, marginBottom: 32, lineHeight: 1.6 }}>
          Deeper financial analysis for your game in <em>The Slingshot: An AI Startup Simulation</em>.
          Extract your game state and paste it below to explore cap table dynamics, dilution scenarios,
          runway projections, and tax scheme eligibility.
        </p>

        {/* Step 1 */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <h2 style={{ fontFamily: "'Crimson Pro', serif", fontSize: '1.1rem', fontWeight: 600, color: C.text, marginBottom: 12 }}>
            Step 1: Extract game data
          </h2>
          <p style={{ color: C.textMuted, fontSize: '0.9rem', marginBottom: 12 }}>
            Open the browser console in your Slingshot game tab (F12 or Cmd+Option+J) and paste this snippet:
          </p>
          <pre style={{
            background: '#1E293B', color: '#E2E8F0', padding: 16, borderRadius: 8,
            fontSize: '0.75rem', lineHeight: 1.5, overflowX: 'auto', whiteSpace: 'pre-wrap',
            wordBreak: 'break-all', maxHeight: 200,
          }}>
            {EXTRACTION_SNIPPET}
          </pre>
          <button
            onClick={() => navigator.clipboard.writeText(EXTRACTION_SNIPPET)}
            style={{
              marginTop: 8, padding: '6px 14px', background: C.teal, color: 'white',
              border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
            }}
          >
            Copy snippet
          </button>
          <p style={{ color: C.textMuted, fontSize: '0.8rem', marginTop: 8 }}>
            This copies your financial state to the clipboard. No data is sent anywhere.
          </p>
        </div>

        {/* Step 2 */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <h2 style={{ fontFamily: "'Crimson Pro', serif", fontSize: '1.1rem', fontWeight: 600, color: C.text, marginBottom: 12 }}>
            Step 2: Paste here
          </h2>
          <textarea
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            placeholder='Paste the copied JSON here...'
            rows={6}
            style={{
              width: '100%', padding: 12, borderRadius: 8, border: `1px solid ${C.border}`,
              fontFamily: 'monospace', fontSize: '0.8rem', resize: 'vertical',
              background: C.bg, color: C.text, boxSizing: 'border-box',
            }}
          />
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.red, fontSize: '0.85rem', marginTop: 8 }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}
          <button
            onClick={handleImport}
            disabled={!rawInput.trim()}
            style={{
              marginTop: 12, padding: '10px 24px', background: rawInput.trim() ? C.blue : C.slate300,
              color: 'white', border: 'none', borderRadius: 8, cursor: rawInput.trim() ? 'pointer' : 'default',
              fontSize: '0.95rem', fontWeight: 600,
            }}
          >
            Analyse
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Analysis dashboard
  // -------------------------------------------------------------------------
  const a = analysis;
  const s = gameState;

  // Ownership pie data
  const ownershipData = [
    { name: 'Founder', value: +a.founderEquity.toFixed(1) },
    ...s.investorStakes.map(inv => ({ name: inv.name, value: +inv.equity.toFixed(1) })),
    ...(a.totalEmployeeEquity > 0 ? [{ name: 'Employee pool', value: +a.totalEmployeeEquity.toFixed(1) }] : []),
  ];

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 20px', fontFamily: "'Source Sans 3', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Crimson Pro', serif", fontSize: '1.75rem', fontWeight: 700, color: C.text, margin: 0 }}>
            {s.company}
          </h1>
          <p style={{ color: C.textMuted, fontSize: '0.85rem', margin: '4px 0 0' }}>
            Q{s.turn} &middot; {s.founder} &middot; {s.completedMilestones.length}/3 milestones
            {s.extremeMode && <span style={{ color: C.rose, fontWeight: 600 }}> &middot; Extreme mode</span>}
          </p>
        </div>
        <button
          onClick={() => { setGameState(null); setRawInput(''); setError(null); }}
          style={{ padding: '6px 14px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem', color: C.textMuted }}
        >
          Load different game
        </button>
      </div>

      {/* Key metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 24 }}>
        <Metric label="Founder equity" value={fmtP(a.founderEquity)} colour={a.founderEquity < 50 ? C.amber : C.teal} />
        <Metric label="Valuation" value={fmtCash(a.postMoneyVal)} colour={C.blue} />
        <Metric label="Your stake value" value={fmtCash(a.founderStakeValue)} colour={C.emerald} />
        <Metric label="Cash" value={fmtCash(s.metrics.cash)} colour={s.metrics.cash < s.metrics.burn * 2 ? C.red : C.text} />
        <Metric label="Burn / quarter" value={fmtCash(s.metrics.burn)} colour={C.textMuted} />
        <Metric label="Runway" value={a.runway == null ? 'No net burn' : `${a.runway}q (${a.monthsRunway}m)`} colour={a.runway == null ? C.green : a.runway <= 2 ? C.red : a.runway <= 4 ? C.amber : C.text} />
        <Metric label="Total raised" value={fmtCash(a.totalRaised)} colour={C.purple} />
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* OWNERSHIP */}
      {/* ----------------------------------------------------------------- */}
      <Section title="Ownership breakdown">
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24, alignItems: 'start' }}>
          {/* Pie chart */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ResponsiveContainer width={260} height={260}>
              <PieChart>
                <Pie data={ownershipData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}
                  label={({ name, value }) => `${name.split(' ')[0]} ${value}%`}
                  labelLine={{ stroke: C.slate300 }}
                  style={{ fontSize: '0.7rem' }}
                >
                  {ownershipData.map((_, i) => <Cell key={i} fill={PIE_COLOURS[i % PIE_COLOURS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                  <th style={{ textAlign: 'left', padding: '8px 4px', color: C.textMuted, fontWeight: 600 }}>Stakeholder</th>
                  <th style={{ textAlign: 'right', padding: '8px 4px', color: C.textMuted, fontWeight: 600 }}>Equity</th>
                  <th style={{ textAlign: 'right', padding: '8px 4px', color: C.textMuted, fontWeight: 600 }}>Value</th>
                  <th style={{ textAlign: 'center', padding: '8px 4px', color: C.textMuted, fontWeight: 600 }}>Protection</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: '8px 4px', fontWeight: 600, color: C.teal }}>Founder ({s.founder?.split(' ')[0]})</td>
                  <td style={{ textAlign: 'right', padding: '8px 4px' }}>{fmtP(a.founderEquity)}</td>
                  <td style={{ textAlign: 'right', padding: '8px 4px' }}>{fmtCash(a.founderStakeValue)}</td>
                  <td style={{ textAlign: 'center', padding: '8px 4px', color: C.textMuted }}>-</td>
                </tr>
                {a.rounds.map((r, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: '8px 4px' }}>{r.name} <span style={{ color: C.textMuted, fontSize: '0.75rem' }}>({r.round})</span></td>
                    <td style={{ textAlign: 'right', padding: '8px 4px' }}>{fmtP(r.equity)}</td>
                    <td style={{ textAlign: 'right', padding: '8px 4px' }}>{fmtCash((r.equity / 100) * a.postMoneyVal)}</td>
                    <td style={{ textAlign: 'center', padding: '8px 4px' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 600,
                        background: r.dilutionProtection >= 1 ? '#FEE2E2' : r.dilutionProtection >= 0.5 ? '#FEF3C7' : '#F0FDF4',
                        color: r.dilutionProtection >= 1 ? C.red : r.dilutionProtection >= 0.5 ? C.amber : C.green,
                      }}>
                        {r.protectionLabel}
                      </span>
                    </td>
                  </tr>
                ))}
                {a.totalEmployeeEquity > 0 && (
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: '8px 4px', color: C.textMuted }}>Employee grants ({s.equityGrants.length})</td>
                    <td style={{ textAlign: 'right', padding: '8px 4px' }}>{fmtP(a.totalEmployeeEquity)}</td>
                    <td style={{ textAlign: 'right', padding: '8px 4px' }}>{fmtCash((a.totalEmployeeEquity / 100) * a.postMoneyVal)}</td>
                    <td style={{ textAlign: 'center', padding: '8px 4px', color: C.textMuted }}>None</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      {/* ----------------------------------------------------------------- */}
      {/* DILUTION SCENARIOS */}
      {/* ----------------------------------------------------------------- */}
      <Section title="Next round: dilution scenarios">
        <p style={{ color: C.textMuted, fontSize: '0.85rem', marginBottom: 16 }}>
          What happens to your ownership if you raise at the current valuation ({fmtCash(a.postMoneyVal)} pre-money)?
          These assume simple equity rounds with no anti-dilution or protection clauses.
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', minWidth: 500 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                <th style={{ textAlign: 'left', padding: '8px 6px', color: C.textMuted }}>Raise amount</th>
                <th style={{ textAlign: 'right', padding: '8px 6px', color: C.textMuted }}>Post-money val</th>
                <th style={{ textAlign: 'right', padding: '8px 6px', color: C.textMuted }}>New investor gets</th>
                <th style={{ textAlign: 'right', padding: '8px 6px', color: C.textMuted }}>Your equity after</th>
                <th style={{ textAlign: 'right', padding: '8px 6px', color: C.textMuted }}>Dilution</th>
                <th style={{ textAlign: 'right', padding: '8px 6px', color: C.textMuted }}>Your stake value</th>
              </tr>
            </thead>
            <tbody>
              {a.nextRoundScenarios.map((sc, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: '8px 6px', fontWeight: 600 }}>{fmtCash(sc.raiseAmount)}</td>
                  <td style={{ textAlign: 'right', padding: '8px 6px' }}>{fmtCash(sc.postMoney)}</td>
                  <td style={{ textAlign: 'right', padding: '8px 6px' }}>{fmtP(sc.newInvestorPct)}</td>
                  <td style={{ textAlign: 'right', padding: '8px 6px', color: sc.founderEquityAfter < 50 ? C.amber : C.text }}>
                    {fmtP(sc.founderEquityAfter)}
                  </td>
                  <td style={{ textAlign: 'right', padding: '8px 6px', color: C.red }}>{fmtP(sc.dilutionPct)}</td>
                  <td style={{ textAlign: 'right', padding: '8px 6px', color: sc.founderValueAfter > sc.founderValueBefore ? C.green : C.amber }}>
                    {fmtCash(sc.founderValueAfter)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ color: C.textMuted, fontSize: '0.8rem', marginTop: 12 }}>
          Note: Dilution reduces your %, but a higher valuation can still increase the value of your stake.
          This is the classic trade-off of fundraising.
        </p>
      </Section>

      {/* ----------------------------------------------------------------- */}
      {/* SAFE / CONVERTIBLE NOTE SCENARIOS */}
      {/* ----------------------------------------------------------------- */}
      <Section title="SAFE / convertible note scenarios" defaultOpen={false}>
        <p style={{ color: C.textMuted, fontSize: '0.85rem', marginBottom: 16 }}>
          What if your next round uses a SAFE (Simple Agreement for Future Equity) instead of a priced equity round?
          This shows how different valuation cap and discount combinations affect conversion and dilution for a £250k note.
        </p>
        {a.safeScenarios.map((scenario, idx) => (
          <div key={idx} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: C.text, marginBottom: 8 }}>
              Valuation cap: {fmtCash(scenario.cap)}
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', minWidth: 480 }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                    <th style={{ textAlign: 'left', padding: '6px 6px', color: C.textMuted }}>Discount</th>
                    <th style={{ textAlign: 'right', padding: '6px 6px', color: C.textMuted }}>Via discount</th>
                    <th style={{ textAlign: 'right', padding: '6px 6px', color: C.textMuted }}>Via cap</th>
                    <th style={{ textAlign: 'right', padding: '6px 6px', color: C.textMuted }}>Effective %</th>
                    <th style={{ textAlign: 'center', padding: '6px 6px', color: C.textMuted }}>Method</th>
                    <th style={{ textAlign: 'right', padding: '6px 6px', color: C.textMuted }}>Your equity after</th>
                  </tr>
                </thead>
                <tbody>
                  {scenario.results.map((r, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: '6px 6px', fontWeight: 600 }}>{r.discount}%</td>
                      <td style={{ textAlign: 'right', padding: '6px 6px' }}>{fmtP(r.discountPct)}</td>
                      <td style={{ textAlign: 'right', padding: '6px 6px' }}>{fmtP(r.capPct)}</td>
                      <td style={{ textAlign: 'right', padding: '6px 6px', fontWeight: 600, color: C.purple }}>{fmtP(r.effectivePct)}</td>
                      <td style={{ textAlign: 'center', padding: '6px 6px' }}>
                        <span style={{
                          padding: '2px 6px', borderRadius: 4, fontSize: '0.65rem', fontWeight: 600,
                          background: r.effectiveMethod === 'cap' ? '#EDE9FE' : '#DBEAFE',
                          color: r.effectiveMethod === 'cap' ? C.purple : C.blue,
                        }}>
                          {r.effectiveMethod}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', padding: '6px 6px', color: r.founderEquityAfter < 50 ? C.amber : C.text }}>
                        {fmtP(r.founderEquityAfter)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
        <p style={{ color: C.textMuted, fontSize: '0.8rem', marginTop: 8, lineHeight: 1.6 }}>
          A SAFE converts at whichever method gives the note holder more shares (lower price).
          When the valuation cap binds, investors get a better deal than the discount alone would give.
          Lower caps and higher discounts = more dilution for founders.
        </p>
      </Section>

      {/* ----------------------------------------------------------------- */}
      {/* LIQUIDATION PREFERENCE WATERFALL */}
      {/* ----------------------------------------------------------------- */}
      <Section title="Exit waterfall: who gets paid what" defaultOpen={false}>
        <p style={{ color: C.textMuted, fontSize: '0.85rem', marginBottom: 16 }}>
          At different exit valuations, how do proceeds flow to shareholders? Investors with liquidation
          preferences get paid first; the remainder is split pro-rata. This shows the impact of investor protections on founder returns.
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', minWidth: 600 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                <th style={{ textAlign: 'left', padding: '8px 6px', color: C.textMuted }}>Exit value</th>
                <th style={{ textAlign: 'right', padding: '8px 6px', color: C.textMuted }}>Multiple</th>
                <th style={{ textAlign: 'right', padding: '8px 6px', color: C.teal }}>Founder gets</th>
                {a.rounds.length > 0 && a.rounds.map((r, i) => (
                  <th key={i} style={{ textAlign: 'right', padding: '8px 6px', color: C.blue, fontSize: '0.75rem' }}>{r.name}</th>
                ))}
                {a.totalEmployeeEquity > 0 && (
                  <th style={{ textAlign: 'right', padding: '8px 6px', color: C.textMuted }}>Employees</th>
                )}
              </tr>
            </thead>
            <tbody>
              {a.liquidationWaterfall.map((exit, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.border}`, background: exit.exitMultiple === 1 ? '#F0FDF4' : 'transparent' }}>
                  <td style={{ padding: '8px 6px', fontWeight: 600 }}>{fmtCash(exit.exitVal)}</td>
                  <td style={{ textAlign: 'right', padding: '8px 6px', color: C.textMuted }}>{exit.exitMultiple}x</td>
                  <td style={{ textAlign: 'right', padding: '8px 6px', fontWeight: 600, color: exit.founderPayout > 0 ? C.teal : C.red }}>
                    {fmtCash(exit.founderPayout)}
                    <span style={{ fontSize: '0.7rem', color: C.textMuted, marginLeft: 4 }}>
                      ({exit.founderMultiple}x)
                    </span>
                  </td>
                  {exit.investorPayouts.map((ip, j) => (
                    <td key={j} style={{ textAlign: 'right', padding: '8px 6px', fontSize: '0.75rem' }}>
                      {fmtCash(ip.totalPayout)}
                      <span style={{ fontSize: '0.65rem', color: ip.multiple >= 1 ? C.green : C.red, marginLeft: 3 }}>
                        {ip.multiple}x
                      </span>
                    </td>
                  ))}
                  {a.totalEmployeeEquity > 0 && (
                    <td style={{ textAlign: 'right', padding: '8px 6px', fontSize: '0.75rem', color: C.textMuted }}>
                      {fmtCash(exit.employeePayout)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ color: C.textMuted, fontSize: '0.8rem', marginTop: 12, lineHeight: 1.6 }}>
          The highlighted row (1x) shows what happens if the company exits at its current valuation.
          Investors with full dilution protection have stronger liquidation preferences.
          At low exit values, preferences consume most of the proceeds before founders see anything.
        </p>
      </Section>

      {/* ----------------------------------------------------------------- */}
      {/* VC VALUATION RANGE */}
      {/* ----------------------------------------------------------------- */}
      <Section title="Valuation range & investment sizing">
        <p style={{ color: C.textMuted, fontSize: '0.85rem', marginBottom: 16 }}>
          Based on your stage (<strong>{a.valuationRange.stageLabel}</strong>), survival rate
          ({(a.valuationRange.survivalRate * 100).toFixed(0)}%), and revenue, here is a suggested valuation range
          and what different raise amounts would cost in equity.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 16 }}>
          <Metric label="Inferred stage" value={a.valuationRange.stageLabel} colour={C.purple} />
          <Metric label="Risk-adjusted rate" value={`${a.valuationRange.riskAdjustedRate}%`} colour={C.red} sub="Discount rate incl. failure" />
          <Metric label="Low estimate" value={fmtCash(a.valuationRange.low)} colour={C.textMuted} />
          <Metric label="Mid estimate" value={fmtCash(a.valuationRange.mid)} colour={C.blue} />
          <Metric label="High estimate" value={fmtCash(a.valuationRange.high)} colour={C.emerald} />
          <Metric label="Current (game)" value={fmtCash(a.valuationRange.currentVal)} colour={C.amber}
            sub={a.valuationRange.currentVal < a.valuationRange.low ? 'Below range' :
                 a.valuationRange.currentVal > a.valuationRange.high ? 'Above range' : 'Within range'} />
        </div>

        {/* Valuation bar */}
        <div style={{ margin: '8px 0 20px', padding: 16, background: C.bg, borderRadius: 8, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: '0.75rem', color: C.textMuted, marginBottom: 8 }}>Valuation range (pre-money)</div>
          <div style={{ position: 'relative', height: 32, background: C.border, borderRadius: 6 }}>
            {/* Range bar */}
            {(() => {
              const max = Math.max(a.valuationRange.high, a.valuationRange.currentVal) * 1.2;
              const lowPct = (a.valuationRange.low / max) * 100;
              const highPct = (a.valuationRange.high / max) * 100;
              const currentPct = (a.valuationRange.currentVal / max) * 100;
              return (
                <>
                  <div style={{
                    position: 'absolute', left: `${lowPct}%`, width: `${highPct - lowPct}%`,
                    height: '100%', background: `linear-gradient(90deg, ${C.blue}40, ${C.emerald}40)`,
                    borderRadius: 6,
                  }} />
                  <div style={{
                    position: 'absolute', left: `${currentPct}%`, top: -4, width: 3, height: 40,
                    background: C.amber, borderRadius: 2,
                  }} />
                  <div style={{ position: 'absolute', left: `${currentPct}%`, top: -18, transform: 'translateX(-50%)', fontSize: '0.65rem', color: C.amber, fontWeight: 600, whiteSpace: 'nowrap' }}>
                    Current {fmtCash(a.valuationRange.currentVal)}
                  </div>
                </>
              );
            })()}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: '0.7rem', color: C.textMuted }}>
            <span>£0</span>
            <span>{fmtCash(Math.max(a.valuationRange.high, a.valuationRange.currentVal) * 1.2)}</span>
          </div>
        </div>

        {/* Investment sizing table */}
        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: C.text, marginBottom: 8 }}>
          Ownership cost: equity % given up per raise amount
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', minWidth: 400 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                <th style={{ textAlign: 'left', padding: '8px 6px', color: C.textMuted }}>Raise</th>
                <th style={{ textAlign: 'right', padding: '8px 6px', color: C.textMuted }}>At low val</th>
                <th style={{ textAlign: 'right', padding: '8px 6px', color: C.blue }}>At mid val</th>
                <th style={{ textAlign: 'right', padding: '8px 6px', color: C.emerald }}>At high val</th>
              </tr>
            </thead>
            <tbody>
              {a.valuationRange.investmentScenarios.map((sc, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: '8px 6px', fontWeight: 600 }}>{fmtCash(sc.raise)}</td>
                  <td style={{ textAlign: 'right', padding: '8px 6px', color: sc.atLow > 25 ? C.red : C.text }}>{fmtP(sc.atLow)}</td>
                  <td style={{ textAlign: 'right', padding: '8px 6px', color: sc.atMid > 25 ? C.amber : C.text }}>{fmtP(sc.atMid)}</td>
                  <td style={{ textAlign: 'right', padding: '8px 6px', color: C.text }}>{fmtP(sc.atHigh)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ color: C.textMuted, fontSize: '0.8rem', marginTop: 12, lineHeight: 1.6 }}>
          Higher valuations mean less dilution for the same raise amount. The range is estimated using stage-based
          comparables for UK AI startups and risk-adjusted DCF analysis (accounting for a {(a.valuationRange.survivalRate * 100).toFixed(0)}% survival rate).
        </p>
      </Section>

      {/* ----------------------------------------------------------------- */}
      {/* RISK PROFILE & INVESTOR RETURNS (interactive) */}
      {/* ----------------------------------------------------------------- */}
      <Section title="Risk profile & investor return expectations">
        <p style={{ color: C.textMuted, fontSize: '0.85rem', marginBottom: 12 }}>
          Toggle milestones to explore how de-risking affects investor return expectations and implied valuation.
          Checked milestones reflect your current game state — click any to model what-if scenarios.
        </p>

        {/* Reset button if user has overrides */}
        {riskOverrides && (
          <button
            onClick={() => setRiskOverrides(null)}
            style={{
              marginBottom: 12, padding: '4px 12px', fontSize: '0.75rem', fontWeight: 600,
              background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6,
              cursor: 'pointer', color: C.textMuted,
            }}
          >
            Reset to game state
          </button>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 16 }}>
          <Metric label="Milestones achieved" value={`${liveRisk.achieved} / ${liveRisk.total}`} colour={C.teal} />
          <Metric label="Funding stage" value={liveRisk.fundingStage} colour={C.purple} />
          <Metric label="Composite risk" value={`${liveRisk.compositeRisk}%`}
            colour={liveRisk.compositeRisk > 70 ? C.red : liveRisk.compositeRisk > 40 ? C.amber : C.green} />
          <Metric label="Success probability" value={`${liveRisk.successProb}%`}
            colour={liveRisk.successProb < 10 ? C.red : liveRisk.successProb < 30 ? C.amber : C.green} />
          <Metric label="Required multiple" value={liveRisk.requiredMultiple === Infinity ? 'N/A' : `${liveRisk.requiredMultiple}x`}
            colour={C.amber} sub="To break even on expected value" />
          <Metric label="Required IRR" value={`${liveRisk.requiredIRR}%`}
            colour={liveRisk.requiredIRR > 50 ? C.red : C.amber}
            sub={`Over ${(liveRisk.remainingMonths / 12).toFixed(1)} years`} />
        </div>

        {/* Interactive milestone checklist + valuation step-ups */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          {liveRisk.milestones.map((ms, i) => {
            const stepUp = liveRisk.valuationStepUps[i];
            const isAutoDetected = a.riskProfile.milestones[i].achieved;
            const isOverridden = riskOverrides && ms.achieved !== isAutoDetected;
            return (
              <button key={i}
                onClick={() => {
                  const current = riskOverrides || a.riskProfile.milestones.map(m => ({ ...m }));
                  const updated = current.map((m, j) => j === i ? { ...m, achieved: !m.achieved } : { ...m });
                  setRiskOverrides(updated);
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                  borderRadius: 6, fontSize: '0.8rem', cursor: 'pointer',
                  background: ms.achieved ? '#F0FDF4' : C.bg,
                  border: `1px solid ${ms.achieved ? '#BBF7D0' : C.border}`,
                  outline: isOverridden ? `2px solid ${C.purple}` : 'none',
                  textAlign: 'left', width: '100%',
                }}
              >
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>{ms.achieved ? '\u2705' : '\u2B1C'}</span>
                <span style={{ flex: 1, color: ms.achieved ? C.green : C.textMuted, fontWeight: ms.achieved ? 600 : 400 }}>
                  {ms.name}
                  {isOverridden && <span style={{ fontSize: '0.65rem', color: C.purple, marginLeft: 4 }}>(what-if)</span>}
                </span>
                <span style={{ flexShrink: 0, textAlign: 'right' }}>
                  <span style={{ fontSize: '0.7rem', color: C.textMuted, display: 'block' }}>
                    {(ms.risk * 100).toFixed(0)}% risk
                  </span>
                  {!ms.achieved && (
                    <span style={{ fontSize: '0.65rem', color: C.blue, display: 'block' }}>
                      +{stepUp.stepUpPct}% &rarr; {fmtCash(stepUp.impliedValuation)}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* Valuation step-up chart — only unachieved milestones */}
        {(() => {
          const stepUpData = liveRisk.valuationStepUps.filter(s => !s.achieved);
          return stepUpData.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: C.text, marginBottom: 4 }}>
                Valuation uplift per milestone
              </div>
              <div style={{ fontSize: '0.75rem', color: C.textMuted, marginBottom: 8 }}>
                Each bar shows the new implied valuation if that single milestone is achieved next.
                Formula: valuation / (1 &minus; milestone risk).
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <ComposedChart data={stepUpData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="name" tick={{ fontSize: 8, fill: C.textMuted }} angle={-25} textAnchor="end" height={65} />
                  <YAxis tickFormatter={(v) => fmt(v)} tick={{ fontSize: 11, fill: C.blue }} />
                  <Tooltip formatter={(v) => fmtCash(v)} />
                  <ReferenceLine y={a.postMoneyVal} stroke={C.amber} strokeDasharray="5 3"
                    label={{ value: `Current ${fmtCash(a.postMoneyVal)}`, fill: C.amber, fontSize: 10, position: 'insideTopLeft' }} />
                  <Bar dataKey="impliedValuation" name="If achieved"
                    fill={C.blue} fillOpacity={0.7} radius={[4, 4, 0, 0]}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          );
        })()}

        {/* Risk reduction progression chart */}
        {liveRisk.progression.length > 1 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: C.text, marginBottom: 8 }}>
              Risk reduction journey
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart data={liveRisk.progression} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis dataKey="stage" tick={{ fontSize: 8, fill: C.textMuted }} angle={-30} textAnchor="end" height={60} />
                <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: C.textMuted }} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Area type="monotone" dataKey="risk" name="Composite risk" fill={C.red} fillOpacity={0.15} stroke={C.red} strokeWidth={2} />
                <Line type="monotone" dataKey="success" name="Success probability" stroke={C.green} strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        <p style={{ color: C.textMuted, fontSize: '0.8rem', marginTop: 8, lineHeight: 1.6 }}>
          Investors need a <strong>{liveRisk.requiredMultiple === Infinity ? 'very high' : `${liveRisk.requiredMultiple}x`}</strong> return
          to justify the current risk level. Each milestone dramatically reduces composite risk and increases implied valuation.
          {riskOverrides && <span style={{ color: C.purple }}> Purple outlines indicate milestones you've manually toggled for what-if analysis.</span>}
        </p>
      </Section>

      {/* ----------------------------------------------------------------- */}
      {/* EQUITY TIMELINE */}
      {/* ----------------------------------------------------------------- */}
      {a.equityTimeline.length > 1 && (
        <Section title="Financial timeline">
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={a.equityTimeline} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="quarter" tickFormatter={(q) => `Q${q}`} tick={{ fontSize: 12, fill: C.textMuted }} />
              <YAxis yAxisId="pct" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12, fill: C.textMuted }} />
              <YAxis yAxisId="cash" orientation="right" tickFormatter={(v) => `${v}k`} tick={{ fontSize: 12, fill: C.textMuted }} />
              <Tooltip />
              <Legend />
              <Area yAxisId="pct" type="monotone" dataKey="equity" name="Founder equity %" fill={C.teal} fillOpacity={0.15} stroke={C.teal} strokeWidth={2} />
              <Line yAxisId="cash" type="monotone" dataKey="cash" name="Cash (k)" stroke={C.blue} strokeWidth={2} dot={false} />
              <Line yAxisId="cash" type="monotone" dataKey="valuation" name="Valuation (k)" stroke={C.purple} strokeWidth={2} dot={false} strokeDasharray="5 3" />
            </ComposedChart>
          </ResponsiveContainer>
        </Section>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* RUNWAY & BURN */}
      {/* ----------------------------------------------------------------- */}
      <Section title="Runway & burn analysis">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 16 }}>
          <Metric label="Current cash" value={fmtCash(s.metrics.cash)} />
          <Metric label="Quarterly burn" value={fmtCash(s.metrics.burn)} />
          <Metric label="Quarterly revenue" value={fmtCash(s.quarterlyRevenue)} />
          <Metric label="Net burn" value={fmtCash(Math.max(0, s.metrics.burn - s.quarterlyRevenue))} colour={s.metrics.burn > s.quarterlyRevenue ? C.red : C.green} />
          <Metric label="Runway" value={a.runway == null ? 'No net burn' : `${a.runway} quarters`} colour={a.runway == null ? C.green : a.runway <= 2 ? C.red : a.runway <= 4 ? C.amber : C.green} />
          <Metric label="ARR" value={fmtCash(a.arr)} sub="Quarterly rev x 4" />
        </div>
        {a.runway != null && a.runway <= 3 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12, background: '#FEF2F2', border: `1px solid #FECACA`, borderRadius: 8, fontSize: '0.85rem', color: C.red, marginBottom: 16 }}>
            <AlertCircle size={18} />
            <span><strong>Warning:</strong> Runway is critically low. You need to raise funds or cut burn within {a.runway} quarter{a.runway !== 1 ? 's' : ''} to avoid bankruptcy.</span>
          </div>
        )}
        {/* Enhanced burn/revenue chart */}
        {a.burnRevenueData.length > 1 && (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: C.text, marginBottom: 8 }}>
              Burn, revenue & cash over time
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={a.burnRevenueData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis dataKey="quarter" tickFormatter={(q) => `Q${q}`} tick={{ fontSize: 12, fill: C.textMuted }} />
                <YAxis yAxisId="left" tickFormatter={(v) => `${v}k`} tick={{ fontSize: 11, fill: C.textMuted }} />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${v}k`} tick={{ fontSize: 11, fill: C.textMuted }} />
                <Tooltip formatter={(v) => `£${v}k`} />
                <Legend />
                <Bar yAxisId="left" dataKey="burn" name="Burn" fill={C.red} fillOpacity={0.6} />
                <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill={C.green} fillOpacity={0.6} />
                <Line yAxisId="right" type="monotone" dataKey="cash" name="Cash" stroke={C.blue} strokeWidth={2} dot={false} />
                <Line yAxisId="left" type="monotone" dataKey="netBurn" name="Net burn" stroke={C.amber} strokeWidth={2} dot={false} strokeDasharray="5 3" />
              </ComposedChart>
            </ResponsiveContainer>
            <p style={{ color: C.textMuted, fontSize: '0.75rem', marginTop: 4 }}>
              Revenue is estimated as a linear ramp to current quarterly revenue ({fmtCash(s.quarterlyRevenue)}/q).
              The gap between burn and revenue is your net cash consumption.
            </p>
          </div>
        )}
      </Section>

      {/* ----------------------------------------------------------------- */}
      {/* TAX SCHEMES */}
      {/* ----------------------------------------------------------------- */}
      <Section title="UK tax-advantaged schemes (SEIS / EIS)">
        <p style={{ color: C.textMuted, fontSize: '0.85rem', marginBottom: 16 }}>
          These UK schemes give your investors significant tax relief, making your startup more attractive.
          Eligibility is estimated from your game state.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* SEIS */}
          <div style={{
            padding: 16, borderRadius: 8, border: `1px solid ${a.seisEligible ? '#BBF7D0' : '#FECACA'}`,
            background: a.seisEligible ? '#F0FDF4' : '#FEF2F2',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Shield size={20} color={a.seisEligible ? C.green : C.red} />
              <strong style={{ color: C.text }}>SEIS</strong>
              <span style={{
                padding: '2px 8px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 600,
                background: a.seisEligible ? '#DCFCE7' : '#FEE2E2',
                color: a.seisEligible ? C.green : C.red,
              }}>
                {a.seisEligible ? 'Likely eligible' : 'Likely ineligible'}
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: C.textMuted, lineHeight: 1.6 }}>
              <div>Investors get <strong>50% income tax</strong> relief + CGT exemption</div>
              <div>Raise up to <strong>£250k</strong> (lifetime per company)</div>
              <div style={{ marginTop: 8, fontSize: '0.75rem' }}>
                Requires: &le;£350k gross assets, &le;25 employees, &lt;2 years old, &lt;£350k total SEIS raised
              </div>
              <div style={{ marginTop: 4, fontSize: '0.75rem' }}>
                Your status: {fmtCash(a.totalRaised)} raised, {s.metrics.staff} staff, {(s.turn / 4).toFixed(1)} years
              </div>
            </div>
          </div>

          {/* EIS */}
          <div style={{
            padding: 16, borderRadius: 8, border: `1px solid ${a.eisEligible ? '#BBF7D0' : '#FECACA'}`,
            background: a.eisEligible ? '#F0FDF4' : '#FEF2F2',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Shield size={20} color={a.eisEligible ? C.green : C.red} />
              <strong style={{ color: C.text }}>EIS</strong>
              <span style={{
                padding: '2px 8px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 600,
                background: a.eisEligible ? '#DCFCE7' : '#FEE2E2',
                color: a.eisEligible ? C.green : C.red,
              }}>
                {a.eisEligible ? 'Likely eligible' : 'Likely ineligible'}
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: C.textMuted, lineHeight: 1.6 }}>
              <div>Investors get <strong>30% income tax</strong> relief + CGT deferral</div>
              <div>Raise up to <strong>£5M per year</strong> (£12M lifetime)</div>
              <div style={{ marginTop: 8, fontSize: '0.75rem' }}>
                Requires: &le;250 employees, &lt;7 years old, &lt;£15M gross assets
              </div>
              <div style={{ marginTop: 4, fontSize: '0.75rem' }}>
                Your status: {s.metrics.staff} staff, {(s.turn / 4).toFixed(1)} years
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ----------------------------------------------------------------- */}
      {/* GRANTS */}
      {/* ----------------------------------------------------------------- */}
      {a.grantSummary.totalApplied > 0 && (
        <Section title="UK grant funding summary">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
            <Metric label="Applications" value={a.grantSummary.totalApplied} />
            <Metric label="Awards" value={a.grantSummary.totalAwarded} colour={C.green} />
            <Metric label="Success rate" value={a.grantSummary.totalApplied > 0 ? fmtP((a.grantSummary.totalAwarded / a.grantSummary.totalApplied) * 100) : '-'} />
            <Metric label="Total grant cash" value={fmtCash(a.grantSummary.totalCash)} colour={C.emerald} sub="Non-dilutive" />
          </div>
          <p style={{ color: C.textMuted, fontSize: '0.8rem', marginTop: 12 }}>
            Grant funding is non-dilutive: it increases your cash without reducing your equity.
            Compare this to raising {fmtCash(a.grantSummary.totalCash)} via equity at current valuation,
            which would dilute you by approximately {a.postMoneyVal > 0 ? fmtP((a.grantSummary.totalCash / (a.postMoneyVal + a.grantSummary.totalCash)) * 100) : '?'}.
          </p>
        </Section>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* VESTING */}
      {/* ----------------------------------------------------------------- */}
      {s.equityGrants.length > 0 && (
        <Section title="Employee equity & vesting" defaultOpen={false}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                <th style={{ textAlign: 'left', padding: '8px 4px', color: C.textMuted }}>Recipient</th>
                <th style={{ textAlign: 'right', padding: '8px 4px', color: C.textMuted }}>Equity</th>
                <th style={{ textAlign: 'right', padding: '8px 4px', color: C.textMuted }}>Cliff</th>
                <th style={{ textAlign: 'right', padding: '8px 4px', color: C.textMuted }}>Vesting</th>
                <th style={{ textAlign: 'right', padding: '8px 4px', color: C.textMuted }}>Granted</th>
              </tr>
            </thead>
            <tbody>
              {s.equityGrants.map((g, i) => {
                const grantQuarter = g.grantedQuarter || g.grantQuarter || 1;
                const quartersSince = s.turn - grantQuarter;
                const yearsSince = quartersSince / 4;
                const vestedPct = yearsSince < g.cliff ? 0 : Math.min(100, (yearsSince / g.vestingYears) * 100);
                return (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: '8px 4px' }}>{g.name || `Grant #${i + 1}`}</td>
                    <td style={{ textAlign: 'right', padding: '8px 4px' }}>{fmtP(g.equity)}</td>
                    <td style={{ textAlign: 'right', padding: '8px 4px' }}>{g.cliff}yr</td>
                    <td style={{ textAlign: 'right', padding: '8px 4px' }}>{g.vestingYears}yr</td>
                    <td style={{ textAlign: 'right', padding: '8px 4px' }}>
                      Q{grantQuarter}
                      <span style={{ color: C.textMuted, fontSize: '0.75rem', marginLeft: 6 }}>
                        ({vestedPct.toFixed(0)}% vested)
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Section>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* INVESTOR RELATIONSHIP */}
      {/* ----------------------------------------------------------------- */}
      <Section title="Investor relationship" defaultOpen={false}>
        {(() => {
          const level = s.investorRelationship;
          const labels = ['Skeptical', 'Neutral', 'Supportive', 'Champion'];
          const colours = [C.red, C.amber, C.blue, C.green];
          const label = labels[Math.min(3, Math.max(0, Math.round(level)))];
          const colour = colours[Math.min(3, Math.max(0, Math.round(level)))];
          return (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: colour }}>{label}</div>
                <div style={{ flex: 1, height: 8, background: C.border, borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${(level / 3) * 100}%`, height: '100%', background: colour, borderRadius: 4, transition: 'width 0.3s' }} />
                </div>
                <div style={{ fontSize: '0.8rem', color: C.textMuted }}>{level.toFixed(1)} / 3</div>
              </div>
              <p style={{ color: C.textMuted, fontSize: '0.8rem', lineHeight: 1.6 }}>
                Investor relationship affects the terms you get on future funding rounds. A Champion relationship
                unlocks better valuations, more favourable terms, and follow-on investment. Relationship improves
                when you hit milestones and follow investor advice; it drops when you miss deadlines or ignore guidance.
              </p>
            </div>
          );
        })()}
      </Section>
    </div>
  );
};

export default SlingshotCompanion;

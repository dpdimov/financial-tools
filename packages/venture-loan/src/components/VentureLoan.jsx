import React, { useState, useMemo } from 'react';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';

const VentureLoan = () => {
  // Loan terms
  const [loanAmount, setLoanAmount] = useState(500000);
  const [discount, setDiscount] = useState(20);
  const [valuationCap, setValuationCap] = useState(6000000);
  const [interestRate, setInterestRate] = useState(4);
  const [yearsToConversion, setYearsToConversion] = useState(1);

  // Round parameters
  const [nextRoundSize, setNextRoundSize] = useState(3000000);
  const [currentShares, setCurrentShares] = useState(2040000);

  // Selected price row
  const [selectedPrice, setSelectedPrice] = useState(2.50);

  const calculations = useMemo(() => {
    const convertingAmount = loanAmount * (1 + (interestRate / 100) * yearsToConversion);
    const roundShares = nextRoundSize > 0 ? nextRoundSize / selectedPrice : 0;

    const prices = [];
    for (let p = 0.50; p <= 8.00; p += 0.25) {
      prices.push(Math.round(p * 100) / 100);
    }

    let crossoverPrice = null;
    let prevDiscBetter = null;

    const tableData = prices.map((price) => {
      // Discount method
      const discountPrice = price * (1 - discount / 100);
      const discountShares = discountPrice > 0 ? convertingAmount / discountPrice : 0;
      const discRoundShares = price > 0 ? nextRoundSize / price : 0;
      const discTotalShares = currentShares + discRoundShares + discountShares;
      const discountOwnership = discTotalShares > 0 ? (discountShares / discTotalShares) * 100 : 0;

      // Cap method
      const capPrice = valuationCap / (currentShares + (price > 0 ? nextRoundSize / price : 0));
      const capShares = capPrice > 0 ? convertingAmount / capPrice : 0;
      const capRoundShares = price > 0 ? nextRoundSize / price : 0;
      const capTotalShares = currentShares + capRoundShares + capShares;
      const capOwnership = capTotalShares > 0 ? (capShares / capTotalShares) * 100 : 0;

      // Effective = whichever gives more shares (lower price = better for note holder)
      const effectivePrice = Math.min(discountPrice, capPrice);
      const effectiveShares = Math.max(discountShares, capShares);
      const effectiveTotalShares = currentShares + (price > 0 ? nextRoundSize / price : 0) + effectiveShares;
      const effectiveOwnership = effectiveTotalShares > 0 ? (effectiveShares / effectiveTotalShares) * 100 : 0;
      const effectiveMethod = discountPrice <= capPrice ? 'discount' : 'cap';

      // Find crossover
      const discBetter = discountPrice <= capPrice;
      if (prevDiscBetter !== null && discBetter !== prevDiscBetter) {
        // Interpolate crossover
        const prevPrice = price - 0.25;
        const prevDiscP = prevPrice * (1 - discount / 100);
        const prevCapP = valuationCap / (currentShares + (prevPrice > 0 ? nextRoundSize / prevPrice : 0));
        const currDiscP = discountPrice;
        const currCapP = capPrice;
        // Solve: p*(1-d) = cap/(shares + round/p) approximately via linear interpolation
        const prevDiff = prevDiscP - prevCapP;
        const currDiff = currDiscP - currCapP;
        if (currDiff !== prevDiff) {
          crossoverPrice = prevPrice + 0.25 * (-prevDiff) / (currDiff - prevDiff);
        }
      }
      prevDiscBetter = discBetter;

      return {
        price,
        discountPrice,
        discountShares,
        discountOwnership,
        capPrice,
        capShares,
        capOwnership,
        effectivePrice,
        effectiveShares,
        effectiveOwnership,
        effectiveMethod
      };
    });

    // Find selected row details
    const selectedRow = tableData.find(r => Math.abs(r.price - selectedPrice) < 0.01) || tableData[0];
    const seriesAShares = selectedPrice > 0 ? nextRoundSize / selectedPrice : 0;
    const noteShares = selectedRow.effectiveShares;
    const totalShares = currentShares + seriesAShares + noteShares;

    return {
      convertingAmount,
      tableData,
      crossoverPrice,
      selectedRow,
      capTable: {
        founders: { shares: currentShares, pct: totalShares > 0 ? (currentShares / totalShares) * 100 : 0 },
        seriesA: { shares: seriesAShares, pct: totalShares > 0 ? (seriesAShares / totalShares) * 100 : 0 },
        noteHolder: { shares: noteShares, pct: totalShares > 0 ? (noteShares / totalShares) * 100 : 0 },
        total: { shares: totalShares, pct: 100 }
      }
    };
  }, [loanAmount, discount, valuationCap, interestRate, yearsToConversion, nextRoundSize, currentShares, selectedPrice]);

  const formatDollar = (val) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val.toFixed(2)}`;
  };

  const formatShares = (val) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
    return val.toFixed(0);
  };

  return (
    <div className="page-wrapper">
      <style>{`
        * { box-sizing: border-box; }

        .page-wrapper {
          min-height: 100vh;
          background: #f8fafc;
          color: #334155;
          font-family: 'Source Sans 3', -apple-system, sans-serif;
          padding: 40px;
        }

        .page-title {
          font-family: 'Crimson Pro', Georgia, serif;
          font-size: 32px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 10px;
          letter-spacing: -0.5px;
        }

        .panel {
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(203, 213, 225, 0.6);
          border-radius: 8px;
          padding: 20px;
        }

        .section-title {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #94a3b8;
          margin-bottom: 14px;
          font-weight: 600;
        }

        .input-row {
          margin-bottom: 16px;
        }
        .input-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
          font-size: 11px;
        }
        .input-label { color: #64748b; }
        .input-value {
          font-family: monospace;
          color: #2563eb;
          font-weight: 500;
        }
        input[type="range"] {
          width: 100%;
          height: 4px;
          -webkit-appearance: none;
          background: rgba(203, 213, 225, 0.5);
          border-radius: 2px;
          outline: none;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px;
          height: 12px;
          background: #2563eb;
          border-radius: 50%;
          cursor: pointer;
        }

        .metric-card {
          background: rgba(241, 245, 249, 0.8);
          border: 1px solid rgba(203, 213, 225, 0.5);
          border-radius: 8px;
          padding: 16px;
          text-align: center;
        }
        .metric-value {
          font-family: monospace;
          font-size: 24px;
          color: #2563eb;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .metric-label {
          font-size: 10px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }

        .main-layout {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 24px;
        }

        .conversion-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
          font-family: monospace;
        }
        .conversion-table th {
          font-family: 'Source Sans 3', sans-serif;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: #94a3b8;
          font-weight: 600;
          padding: 8px 6px;
          text-align: right;
          border-bottom: 1px solid rgba(203, 213, 225, 0.5);
        }
        .conversion-table th:first-child { text-align: left; }
        .conversion-table td {
          padding: 7px 6px;
          text-align: right;
          border-bottom: 1px solid rgba(203, 213, 225, 0.2);
          color: #334155;
        }
        .conversion-table td:first-child { text-align: left; }
        .conversion-table tr {
          cursor: pointer;
          transition: background 0.1s;
        }
        .conversion-table tr:hover {
          background: rgba(37, 99, 235, 0.03);
        }
        .conversion-table tr.selected {
          background: rgba(37, 99, 235, 0.06);
        }
        .conversion-table tr.selected td {
          color: #2563eb;
          font-weight: 600;
        }
        .conversion-table .method-disc { color: #2563eb; }
        .conversion-table .method-cap { color: #d97706; }

        .cap-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
        }
        .cap-table th {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: #94a3b8;
          font-weight: 600;
          padding: 8px 6px;
          text-align: right;
          border-bottom: 1px solid rgba(203, 213, 225, 0.5);
        }
        .cap-table th:first-child { text-align: left; }
        .cap-table td {
          padding: 8px 6px;
          text-align: right;
          border-bottom: 1px solid rgba(203, 213, 225, 0.2);
          font-family: monospace;
          color: #334155;
        }
        .cap-table td:first-child {
          font-family: 'Source Sans 3', sans-serif;
          text-align: left;
          color: #64748b;
        }
        .cap-table tr:last-child td {
          font-weight: 600;
          border-top: 1px solid rgba(203, 213, 225, 0.5);
          border-bottom: none;
          color: #1e293b;
        }

        .pct-bar {
          height: 6px;
          background: rgba(203, 213, 225, 0.4);
          border-radius: 3px;
          overflow: hidden;
          margin-top: 4px;
        }
        .pct-fill {
          height: 100%;
          border-radius: 3px;
        }

        @media (max-width: 1200px) {
          .metrics-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 900px) {
          .page-wrapper { padding: 20px; }
          .page-title { font-size: 26px; }
          .main-layout { grid-template-columns: 1fr; }
          .metrics-grid { grid-template-columns: repeat(2, 1fr); }
          .metric-value { font-size: 20px; }
        }
        @media (max-width: 500px) {
          .metrics-grid { grid-template-columns: 1fr 1fr; }
          .metric-card { padding: 12px; }
          .metric-value { font-size: 18px; }
        }
      `}</style>

      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '36px' }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '2px', color: '#94a3b8', marginBottom: '12px', fontWeight: 600 }}>
            Convertible Note Analysis
          </div>
          <h1 className="page-title">Venture Loan</h1>
          <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '700px', lineHeight: '1.6', margin: 0 }}>
            Explore how discount and valuation cap provisions interact across Series A pricing scenarios.
            The discount method scales linearly with price while the cap method provides a ceiling — understanding where they cross over is key.
          </p>
        </div>

        {/* Metric Cards */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-value">
              {calculations.crossoverPrice ? `$${calculations.crossoverPrice.toFixed(2)}` : '—'}
            </div>
            <div className="metric-label">Crossover Price</div>
          </div>
          <div className="metric-card">
            <div className="metric-value" style={{ color: '#16a34a' }}>
              ${calculations.selectedRow.effectivePrice.toFixed(2)}
            </div>
            <div className="metric-label">Effective Price</div>
          </div>
          <div className="metric-card">
            <div className="metric-value" style={{ color: '#d97706' }}>
              {calculations.selectedRow.effectiveOwnership.toFixed(2)}%
            </div>
            <div className="metric-label">Note Ownership</div>
          </div>
          <div className="metric-card">
            <div className="metric-value" style={{ color: '#7c3aed' }}>
              {formatDollar(calculations.convertingAmount)}
            </div>
            <div className="metric-label">Converting Amount</div>
          </div>
        </div>

        {/* Main Layout */}
        <div className="main-layout">
          {/* Left: Inputs */}
          <div>
            <div className="panel" style={{ marginBottom: '16px' }}>
              <div className="section-title">Loan Terms</div>

              <div className="input-row">
                <div className="input-header">
                  <span className="input-label">Loan Amount</span>
                  <span className="input-value">{formatDollar(loanAmount)}</span>
                </div>
                <input type="range" min="0" max="2000000" step="25000" value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))} />
              </div>

              <div className="input-row">
                <div className="input-header">
                  <span className="input-label">Discount</span>
                  <span className="input-value">{discount}%</span>
                </div>
                <input type="range" min="0" max="50" step="1" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
              </div>

              <div className="input-row">
                <div className="input-header">
                  <span className="input-label">Valuation Cap</span>
                  <span className="input-value">{formatDollar(valuationCap)}</span>
                </div>
                <input type="range" min="1000000" max="20000000" step="250000" value={valuationCap} onChange={(e) => setValuationCap(Number(e.target.value))} />
              </div>

              <div className="input-row">
                <div className="input-header">
                  <span className="input-label">Interest Rate</span>
                  <span className="input-value">{interestRate}%</span>
                </div>
                <input type="range" min="0" max="12" step="0.5" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} />
              </div>

              <div className="input-row">
                <div className="input-header">
                  <span className="input-label">Years to Conversion</span>
                  <span className="input-value">{yearsToConversion}</span>
                </div>
                <input type="range" min="0.5" max="3" step="0.25" value={yearsToConversion} onChange={(e) => setYearsToConversion(Number(e.target.value))} />
              </div>
            </div>

            <div className="panel">
              <div className="section-title">Round Parameters</div>

              <div className="input-row">
                <div className="input-header">
                  <span className="input-label">Next Round Size</span>
                  <span className="input-value">{formatDollar(nextRoundSize)}</span>
                </div>
                <input type="range" min="500000" max="10000000" step="250000" value={nextRoundSize} onChange={(e) => setNextRoundSize(Number(e.target.value))} />
              </div>

              <div className="input-row">
                <div className="input-header">
                  <span className="input-label">Current Shares Outstanding</span>
                  <span className="input-value">{formatShares(currentShares)}</span>
                </div>
                <input type="range" min="100000" max="10000000" step="10000" value={currentShares} onChange={(e) => setCurrentShares(Number(e.target.value))} />
              </div>
            </div>
          </div>

          {/* Right: Table + Chart + Cap Table */}
          <div>
            {/* Conversion Table */}
            <div className="panel" style={{ marginBottom: '16px' }}>
              <div className="section-title">Conversion Analysis by Share Price</div>
              <div style={{ overflowX: 'auto' }}>
                <table className="conversion-table">
                  <thead>
                    <tr>
                      <th>Price</th>
                      <th>Disc. Price</th>
                      <th>Disc. Own%</th>
                      <th>Cap Price</th>
                      <th>Cap Own%</th>
                      <th>Effective</th>
                      <th>Eff. Own%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculations.tableData.map((row) => (
                      <tr
                        key={row.price}
                        className={Math.abs(row.price - selectedPrice) < 0.01 ? 'selected' : ''}
                        onClick={() => setSelectedPrice(row.price)}
                      >
                        <td>${row.price.toFixed(2)}</td>
                        <td>${row.discountPrice.toFixed(2)}</td>
                        <td>{row.discountOwnership.toFixed(2)}%</td>
                        <td>${row.capPrice.toFixed(2)}</td>
                        <td>{row.capOwnership.toFixed(2)}%</td>
                        <td className={row.effectiveMethod === 'discount' ? 'method-disc' : 'method-cap'}>
                          ${row.effectivePrice.toFixed(2)}
                        </td>
                        <td className={row.effectiveMethod === 'discount' ? 'method-disc' : 'method-cap'}>
                          {row.effectiveOwnership.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Chart */}
            <div className="panel" style={{ marginBottom: '16px' }}>
              <div className="section-title">Discount vs Cap Ownership</div>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={calculations.tableData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(203, 213, 225, 0.4)" />
                  <XAxis
                    dataKey="price"
                    tickFormatter={(v) => `$${v.toFixed(2)}`}
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    axisLine={{ stroke: 'rgba(203, 213, 225, 0.5)' }}
                    label={{ value: 'Series A Share Price', position: 'bottom', offset: -2, style: { fontSize: 10, fill: '#94a3b8' } }}
                  />
                  <YAxis
                    tickFormatter={(v) => `${v.toFixed(1)}%`}
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    axisLine={{ stroke: 'rgba(203, 213, 225, 0.5)' }}
                    label={{ value: 'Note Holder Ownership %', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 10, fill: '#94a3b8' } }}
                  />
                  <Tooltip
                    formatter={(value, name) => [`${value.toFixed(2)}%`, name]}
                    labelFormatter={(v) => `Share Price: $${Number(v).toFixed(2)}`}
                    contentStyle={{ fontSize: '11px', border: '1px solid rgba(203, 213, 225, 0.5)', borderRadius: '6px', background: 'rgba(255,255,255,0.95)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="discountOwnership"
                    name="Discount Method"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="capOwnership"
                    name="Cap Method"
                    stroke="#d97706"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  {calculations.crossoverPrice && (() => {
                    const cp = calculations.crossoverPrice;
                    const closest = calculations.tableData.reduce((best, row) =>
                      Math.abs(row.price - cp) < Math.abs(best.price - cp) ? row : best
                    );
                    return (
                      <ReferenceDot
                        x={closest.price}
                        y={closest.discountOwnership}
                        r={6}
                        fill="#dc2626"
                        stroke="#fff"
                        strokeWidth={2}
                        label={{ value: 'Crossover', position: 'top', style: { fontSize: 10, fill: '#dc2626', fontWeight: 600 } }}
                      />
                    );
                  })()}
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Cap Table */}
            <div className="panel">
              <div className="section-title">
                Cap Table at ${selectedPrice.toFixed(2)} per Share
                <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'none', letterSpacing: 0, marginLeft: '8px', fontWeight: 400 }}>
                  ({calculations.selectedRow.effectiveMethod} method applies)
                </span>
              </div>
              <table className="cap-table">
                <thead>
                  <tr>
                    <th>Shareholder</th>
                    <th>Shares</th>
                    <th>Ownership</th>
                    <th style={{ width: '120px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Founders</td>
                    <td>{Math.round(calculations.capTable.founders.shares).toLocaleString()}</td>
                    <td>{calculations.capTable.founders.pct.toFixed(2)}%</td>
                    <td>
                      <div className="pct-bar">
                        <div className="pct-fill" style={{ width: `${calculations.capTable.founders.pct}%`, background: '#2563eb' }} />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>Series A Investors</td>
                    <td>{Math.round(calculations.capTable.seriesA.shares).toLocaleString()}</td>
                    <td>{calculations.capTable.seriesA.pct.toFixed(2)}%</td>
                    <td>
                      <div className="pct-bar">
                        <div className="pct-fill" style={{ width: `${calculations.capTable.seriesA.pct}%`, background: '#7c3aed' }} />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>Note Holder</td>
                    <td>{Math.round(calculations.capTable.noteHolder.shares).toLocaleString()}</td>
                    <td>{calculations.capTable.noteHolder.pct.toFixed(2)}%</td>
                    <td>
                      <div className="pct-bar">
                        <div className="pct-fill" style={{ width: `${calculations.capTable.noteHolder.pct}%`, background: '#d97706' }} />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>Total</td>
                    <td>{Math.round(calculations.capTable.total.shares).toLocaleString()}</td>
                    <td>100.00%</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VentureLoan;

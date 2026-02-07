import React, { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const StartupRiskVisualizer = () => {
  // Add responsive CSS
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
      }
      .chart-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
      }
      .framework-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
      }
      .model-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
      }
      .investment-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
      }
      .milestone-row {
        display: grid;
        grid-template-columns: 40px 2fr 1.5fr 120px 100px 100px;
        gap: 16px;
        align-items: center;
      }
      .milestone-question {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .milestone-controls-wrapper {
        display: contents;
      }

      @media (max-width: 768px) {
        .metrics-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        .chart-grid {
          grid-template-columns: 1fr;
          gap: 16px;
        }
        .framework-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        .model-grid {
          grid-template-columns: 1fr;
          gap: 12px;
        }
        .investment-grid {
          grid-template-columns: 1fr;
          gap: 16px;
        }
        .milestone-row {
          grid-template-columns: 28px 1fr;
          gap: 12px;
          grid-template-areas:
            "check name"
            "check controls";
        }
        .milestone-checkbox { grid-area: check; }
        .milestone-name { grid-area: name; }
        .milestone-question { display: none; }
        .milestone-controls-wrapper {
          grid-area: controls;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .milestone-risk,
        .milestone-months {
          flex: 1;
          min-width: 100px;
        }
        .milestone-impact {
          min-width: 80px;
        }
      }

      @media (max-width: 480px) {
        .metrics-grid {
          grid-template-columns: 1fr;
          gap: 12px;
        }
        .framework-grid {
          grid-template-columns: 1fr;
          gap: 12px;
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  const [milestones, setMilestones] = useState([
    { 
      id: 1, 
      name: 'Problem-Solution Fit', 
      risk: 0.40, 
      months: 6, 
      achieved: false,
      assessment: 'Opportunity',
      model: 'Discovery',
      question: 'Is there a real, painful problem? Does our solution direction resonate?',
      evidence: 'Customer interviews, problem validation, early interest signals'
    },
    { 
      id: 2, 
      name: 'Team Assembly', 
      risk: 0.35, 
      months: 6, 
      achieved: false,
      assessment: 'Execution',
      model: 'Foundation',
      question: 'Do we have the right capabilities? Can this team execute?',
      evidence: 'Key hires made, complementary skills, relevant experience'
    },
    { 
      id: 3, 
      name: 'Technology Readiness', 
      risk: 0.30, 
      months: 12, 
      achieved: false,
      assessment: 'Execution',
      model: 'Pre-product',
      question: 'Can we prove the core technology/science works?',
      evidence: 'Working prototype, IP secured, technical feasibility proven'
    },
    { 
      id: 4, 
      name: 'Product Development', 
      risk: 0.25, 
      months: 9, 
      achieved: false,
      assessment: 'Execution',
      model: 'Cost Model',
      question: 'Can we turn it into a shippable, manufacturable product?',
      evidence: 'Production-ready product, quality metrics, cost-to-produce known'
    },
    { 
      id: 5, 
      name: 'Product-Market Fit', 
      risk: 0.22, 
      months: 12, 
      achieved: false,
      assessment: 'Opportunity',
      model: 'Revenue Model',
      question: 'Repeatable sales? Clear customer segments? People paying?',
      evidence: 'Retention metrics, NPS, repeatable sales process, clear ICP'
    },
    { 
      id: 6, 
      name: 'Unit Economics Validation', 
      risk: 0.18, 
      months: 9, 
      achieved: false,
      assessment: 'Scalability',
      model: 'Cost Model',
      question: 'Do margins work at scale? CAC < LTV?',
      evidence: 'Gross margin targets hit, CAC payback < 18mo, LTV/CAC > 3x'
    },
    { 
      id: 7, 
      name: 'Scalable Growth', 
      risk: 0.15, 
      months: 9, 
      achieved: false,
      assessment: 'Scalability',
      model: 'Revenue Model',
      question: 'Can we capture market share efficiently?',
      evidence: 'Revenue growth rate, market share gains, channel efficiency'
    },
    { 
      id: 8, 
      name: 'Favorable Capital Structure', 
      risk: 0.15, 
      months: 6, 
      achieved: false,
      assessment: 'Return',
      model: 'Investment Model',
      question: 'Can we raise growth capital without toxic terms eroding early stakeholder returns?',
      evidence: 'Clean cap table, non-participating preferred, reasonable liquidation prefs, founder-friendly terms'
    },
    { 
      id: 9, 
      name: 'Cash Flow Positive', 
      risk: 0.12, 
      months: 12, 
      achieved: false,
      assessment: 'Execution',
      model: 'Cash Model',
      question: 'Can we operate without external funding?',
      evidence: 'Operating cash flow positive, runway > 24 months, path to profitability'
    }
  ]);

  const [showFormulas, setShowFormulas] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [viewMode, setViewMode] = useState('journey'); // 'journey' or 'framework'

  // Calculate composite risk from unachieved milestones
  const calculateCompositeRisk = (milestonesList) => {
    const unachieved = milestonesList.filter(m => !m.achieved);
    if (unachieved.length === 0) return 0;
    const successProb = unachieved.reduce((acc, m) => acc * (1 - m.risk), 1);
    return 1 - successProb;
  };

  // Calculate remaining months
  const calculateRemainingMonths = (milestonesList) => {
    return milestonesList.filter(m => !m.achieved).reduce((acc, m) => acc + m.months, 0);
  };

  // Calculate required multiple and IRR
  const calculations = useMemo(() => {
    const compositeRisk = calculateCompositeRisk(milestones);
    const successProb = 1 - compositeRisk;
    const requiredMultiple = successProb > 0 ? 1 / successProb : Infinity;
    const remainingMonths = calculateRemainingMonths(milestones);
    const remainingYears = remainingMonths / 12;
    const irr = remainingYears > 0 && requiredMultiple !== Infinity 
      ? (Math.pow(requiredMultiple, 1 / remainingYears) - 1) * 100 
      : 0;
    
    return {
      compositeRisk,
      successProb,
      requiredMultiple,
      remainingMonths,
      remainingYears,
      irr
    };
  }, [milestones]);

  // Generate progression data for chart
  const progressionData = useMemo(() => {
    let data = [{ 
      stage: 'Start', 
      risk: calculateCompositeRisk(milestones.map(m => ({...m, achieved: false}))) * 100,
      success: (1 - calculateCompositeRisk(milestones.map(m => ({...m, achieved: false})))) * 100,
      months: 0
    }];
    
    let cumulativeMonths = 0;
    milestones.forEach((milestone, idx) => {
      cumulativeMonths += milestone.months;
      const achievedUpToThis = milestones.map((m, i) => ({...m, achieved: i <= idx}));
      const risk = calculateCompositeRisk(achievedUpToThis) * 100;
      data.push({
        stage: milestone.name.split(' ').slice(0, 2).join(' '),
        fullName: milestone.name,
        risk: risk,
        success: 100 - risk,
        months: cumulativeMonths,
        achieved: milestone.achieved
      });
    });
    return data;
  }, [milestones]);

  // Toggle milestone achievement
  const toggleMilestone = (id) => {
    setMilestones(prev => prev.map(m => 
      m.id === id ? {...m, achieved: !m.achieved} : m
    ));
  };

  // Update milestone risk
  const updateRisk = (id, newRisk) => {
    setMilestones(prev => prev.map(m => 
      m.id === id ? {...m, risk: parseFloat(newRisk)} : m
    ));
  };

  // Update milestone months
  const updateMonths = (id, newMonths) => {
    setMilestones(prev => prev.map(m => 
      m.id === id ? {...m, months: parseInt(newMonths)} : m
    ));
  };

  // Group milestones by assessment criterion
  const milestonesByAssessment = useMemo(() => {
    return {
      'Opportunity': milestones.filter(m => m.assessment === 'Opportunity'),
      'Scalability': milestones.filter(m => m.assessment === 'Scalability'),
      'Execution': milestones.filter(m => m.assessment === 'Execution'),
      'Return': milestones.filter(m => m.assessment === 'Return')
    };
  }, [milestones]);

  // Assessment colors
  const assessmentColors = {
    'Opportunity': { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
    'Scalability': { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
    'Execution': { bg: '#f3e8ff', border: '#a855f7', text: '#6b21a8' },
    'Return': { bg: '#dcfce7', border: '#22c55e', text: '#166534' }
  };

  // Model colors
  const modelColors = {
    'Discovery': '#6b7280',
    'Foundation': '#6b7280',
    'Pre-product': '#6b7280',
    'Revenue Model': '#059669',
    'Cost Model': '#dc2626',
    'Cash Model': '#2563eb',
    'Investment Model': '#7c3aed'
  };

  return (
    <div style={{
      fontFamily: "'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif",
      background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)',
      minHeight: '100vh',
      padding: 'clamp(16px, 4vw, 32px)',
      color: '#1e293b'
    }}>
      {/* Header */}
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: 'clamp(20px, 4vw, 32px)' }}>
          <h1 style={{
            fontFamily: "'Crimson Pro', Georgia, serif",
            fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
            fontWeight: '600',
            letterSpacing: '-0.02em',
            marginBottom: '8px',
            background: 'linear-gradient(90deg, #1e293b, #475569)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Startup Risk Visualizer
          </h1>
          <p style={{ color: '#64748b', fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)' }}>
            Multiplicative risk framework for entrepreneurial finance
          </p>
        </div>

        {/* Key Metrics Dashboard */}
        <div className="metrics-grid" style={{ marginBottom: 'clamp(20px, 4vw, 32px)' }}>
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <div style={{ color: '#b91c1c', fontSize: '0.85rem', marginBottom: '4px' }}>Composite Risk</div>
            <div style={{ fontSize: '2rem', fontWeight: '600', color: '#ef4444' }}>
              {(calculations.compositeRisk * 100).toFixed(1)}%
            </div>
          </div>
          <div style={{
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <div style={{ color: '#166534', fontSize: '0.85rem', marginBottom: '4px' }}>Success Probability</div>
            <div style={{ fontSize: '2rem', fontWeight: '600', color: '#22c55e' }}>
              {(calculations.successProb * 100).toFixed(1)}%
            </div>
          </div>
          <div style={{
            background: 'rgba(251, 191, 36, 0.1)',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <div style={{ color: '#b45309', fontSize: '0.85rem', marginBottom: '4px' }}>Required Multiple</div>
            <div style={{ fontSize: '2rem', fontWeight: '600', color: '#fbbf24' }}>
              {calculations.requiredMultiple === Infinity ? '∞' : calculations.requiredMultiple.toFixed(1)}x
            </div>
          </div>
          <div style={{
            background: 'rgba(168, 85, 247, 0.1)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <div style={{ color: '#6b21a8', fontSize: '0.85rem', marginBottom: '4px' }}>Required IRR</div>
            <div style={{ fontSize: '2rem', fontWeight: '600', color: '#a855f7' }}>
              {calculations.irr === Infinity || calculations.irr > 999 ? '>999%' : calculations.irr.toFixed(0)}%
            </div>
            <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
              over {calculations.remainingYears.toFixed(1)} years
            </div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div style={{ marginBottom: '24px', display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setViewMode('journey')}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              background: viewMode === 'journey' ? '#3b82f6' : '#ffffff',
              color: viewMode === 'journey' ? '#fff' : '#64748b',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
          >
            Journey View
          </button>
          <button
            onClick={() => setViewMode('framework')}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              background: viewMode === 'framework' ? '#3b82f6' : '#ffffff',
              color: viewMode === 'framework' ? '#fff' : '#64748b',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
          >
            Framework View
          </button>
          <button
            onClick={() => setShowFormulas(!showFormulas)}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              background: showFormulas ? '#059669' : '#ffffff',
              color: showFormulas ? '#fff' : '#64748b',
              cursor: 'pointer',
              fontWeight: '500',
              marginLeft: 'auto',
              transition: 'all 0.2s'
            }}
          >
            {showFormulas ? 'Hide Formulas' : 'Show Formulas'}
          </button>
        </div>

        {/* Formulas Panel */}
        {showFormulas && (
          <div style={{
            background: '#f1f5f9',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
            fontFamily: "monospace",
            fontSize: '0.9rem',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div>
                <span style={{ color: '#64748b' }}>Composite Risk = </span>
                <span style={{ color: '#1e293b' }}>1 - ∏(1 - rᵢ)</span>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Required Multiple = </span>
                <span style={{ color: '#1e293b' }}>1 / P(success)</span>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>IRR = </span>
                <span style={{ color: '#1e293b' }}>(Multiple)^(1/years) - 1</span>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Total Timeline = </span>
                <span style={{ color: '#1e293b' }}>{milestones.reduce((a, m) => a + m.months, 0)} months ({(milestones.reduce((a, m) => a + m.months, 0) / 12).toFixed(1)} years)</span>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area - Journey View */}
        {viewMode === 'journey' && (
          <div className="chart-grid" style={{ marginBottom: 'clamp(20px, 4vw, 32px)' }}>
            
            {/* Chart */}
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{ marginBottom: '16px', fontWeight: '500', color: '#1e293b' }}>
                Risk Reduction Journey
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={progressionData}>
                  <defs>
                    <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="stage" 
                    tick={{ fill: '#94a3b8', fontSize: 10 }} 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    tick={{ fill: '#94a3b8' }} 
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#f1f5f9', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                    formatter={(value, name) => [`${value.toFixed(1)}%`, name]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="risk" 
                    stroke="#ef4444" 
                    fill="url(#riskGradient)"
                    name="Composite Risk"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="success" 
                    stroke="#22c55e" 
                    fill="url(#successGradient)"
                    name="Success Probability"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Selected Milestone Detail or Summary */}
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #e2e8f0'
            }}>
              {selectedMilestone ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                    <h3 style={{ fontWeight: '500', color: '#1e293b' }}>
                      {selectedMilestone.name}
                    </h3>
                    <button 
                      onClick={() => setSelectedMilestone(null)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        fontSize: '1.2rem'
                      }}
                    >×</button>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    gap: '8px', 
                    marginBottom: '16px' 
                  }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      background: assessmentColors[selectedMilestone.assessment].bg,
                      color: assessmentColors[selectedMilestone.assessment].text
                    }}>
                      {selectedMilestone.assessment}
                    </span>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      background: 'rgba(0,0,0,0.04)',
                      color: modelColors[selectedMilestone.model]
                    }}>
                      {selectedMilestone.model}
                    </span>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '4px' }}>Key Question</div>
                    <div style={{ color: '#1e293b', fontStyle: 'italic' }}>"{selectedMilestone.question}"</div>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '4px' }}>Evidence of Achievement</div>
                    <div style={{ color: '#475569' }}>{selectedMilestone.evidence}</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '4px' }}>Stage Risk</div>
                      <div style={{ color: '#ef4444', fontSize: '1.5rem', fontWeight: '600' }}>
                        {(selectedMilestone.risk * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div>
                      <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '4px' }}>Duration</div>
                      <div style={{ color: '#3b82f6', fontSize: '1.5rem', fontWeight: '600' }}>
                        {selectedMilestone.months} months
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 style={{ marginBottom: '16px', fontWeight: '500', color: '#1e293b' }}>
                    Journey Summary
                  </h3>
                  <div style={{ color: '#64748b', marginBottom: '16px', lineHeight: '1.6' }}>
                    Click on any milestone below to see detailed information about the key question, evidence of achievement, and risk parameters.
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                      <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '4px' }}>Total Journey</div>
                      <div style={{ color: '#1e293b', fontSize: '1.5rem', fontWeight: '600' }}>
                        {milestones.reduce((a, m) => a + m.months, 0)} months
                      </div>
                      <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                        ({(milestones.reduce((a, m) => a + m.months, 0) / 12).toFixed(1)} years)
                      </div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                      <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '4px' }}>Time Remaining</div>
                      <div style={{ color: '#3b82f6', fontSize: '1.5rem', fontWeight: '600' }}>
                        {calculations.remainingMonths} months
                      </div>
                      <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                        ({calculations.remainingYears.toFixed(1)} years)
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content Area - Framework View */}
        {viewMode === 'framework' && (
          <div style={{ marginBottom: '32px' }}>
            {/* Assessment Criteria x Models Matrix */}
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #e2e8f0',
              marginBottom: '24px'
            }}>
              <h3 style={{ marginBottom: '20px', fontWeight: '500', color: '#1e293b' }}>
                Assessment Criteria & Business Models
              </h3>
              
              {/* Four Assessment Criteria */}
              <div className="framework-grid" style={{ marginBottom: '24px' }}>
                {Object.entries(milestonesByAssessment).map(([assessment, ms]) => {
                  const achievedCount = ms.filter(m => m.achieved).length;
                  const unachieved = ms.filter(m => !m.achieved);
                  const compositeRisk = unachieved.length > 0
                    ? 1 - unachieved.reduce((acc, m) => acc * (1 - m.risk), 1)
                    : 0;
                  return (
                    <div 
                      key={assessment}
                      style={{
                        background: assessmentColors[assessment].bg,
                        borderRadius: '12px',
                        padding: '16px',
                        border: `2px solid ${assessmentColors[assessment].border}`
                      }}
                    >
                      <div style={{ 
                        fontWeight: '700', 
                        color: assessmentColors[assessment].text,
                        marginBottom: '12px',
                        fontSize: '1.1rem'
                      }}>
                        {assessment}
                      </div>
                      <div style={{ marginBottom: '12px' }}>
                        {ms.map(m => (
                          <div 
                            key={m.id}
                            onClick={() => setSelectedMilestone(m)}
                            style={{ 
                              fontSize: '0.85rem', 
                              color: assessmentColors[assessment].text,
                              opacity: m.achieved ? 0.5 : 1,
                              textDecoration: m.achieved ? 'line-through' : 'none',
                              marginBottom: '6px',
                              padding: '6px 8px',
                              background: 'rgba(255,255,255,0.3)',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <span>{m.name}</span>
                            <span style={{ 
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              opacity: 0.8
                            }}>
                              {m.achieved ? '✓' : `${(m.risk * 100).toFixed(0)}%`}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div style={{
                        borderTop: `1px solid ${assessmentColors[assessment].border}`,
                        paddingTop: '8px',
                        fontSize: '0.8rem',
                        color: assessmentColors[assessment].text
                      }}>
                        {achievedCount}/{ms.length} achieved • {(compositeRisk * 100).toFixed(0)}% remaining risk
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Four Business Models */}
              <h4 style={{ marginBottom: '16px', fontWeight: '500', color: '#1e293b' }}>
                Four Business Models
              </h4>
              <div className="model-grid">
                {['Revenue Model', 'Cost Model', 'Cash Model', 'Investment Model'].map(model => {
                  const modelMilestones = milestones.filter(m => m.model === model);
                  return (
                    <div 
                      key={model}
                      style={{
                        background: '#f1f5f9',
                        borderRadius: '12px',
                        padding: '16px',
                        borderLeft: `4px solid ${modelColors[model]}`
                      }}
                    >
                      <div style={{ 
                        fontWeight: '600', 
                        color: modelColors[model],
                        marginBottom: '12px',
                        fontSize: '0.95rem'
                      }}>
                        {model}
                      </div>
                      {modelMilestones.length > 0 ? (
                        modelMilestones.map(m => (
                          <div 
                            key={m.id}
                            onClick={() => setSelectedMilestone(m)}
                            style={{ 
                              fontSize: '0.85rem', 
                              color: '#475569',
                              opacity: m.achieved ? 0.5 : 1,
                              textDecoration: m.achieved ? 'line-through' : 'none',
                              marginBottom: '4px',
                              cursor: 'pointer',
                              padding: '4px 0'
                            }}
                          >
                            #{m.id} {m.name}
                          </div>
                        ))
                      ) : (
                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
                          No milestones directly mapped
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Milestone Detail Panel */}
            {selectedMilestone && (
              <div style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                  <h3 style={{ fontWeight: '500', color: '#1e293b' }}>
                    #{selectedMilestone.id} {selectedMilestone.name}
                  </h3>
                  <button 
                    onClick={() => setSelectedMilestone(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                      fontSize: '1.2rem'
                    }}
                  >×</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
                  <div>
                    <div style={{ 
                      display: 'flex', 
                      gap: '8px', 
                      marginBottom: '16px' 
                    }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        background: assessmentColors[selectedMilestone.assessment].bg,
                        color: assessmentColors[selectedMilestone.assessment].text
                      }}>
                        {selectedMilestone.assessment}
                      </span>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        background: 'rgba(0,0,0,0.04)',
                        color: modelColors[selectedMilestone.model]
                      }}>
                        {selectedMilestone.model}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '4px' }}>Stage Risk</div>
                        <div style={{ color: '#ef4444', fontSize: '1.5rem', fontWeight: '600' }}>
                          {(selectedMilestone.risk * 100).toFixed(0)}%
                        </div>
                      </div>
                      <div>
                        <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '4px' }}>Duration</div>
                        <div style={{ color: '#3b82f6', fontSize: '1.5rem', fontWeight: '600' }}>
                          {selectedMilestone.months} mo
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '4px' }}>Key Question</div>
                    <div style={{ color: '#1e293b', fontStyle: 'italic', lineHeight: '1.5' }}>"{selectedMilestone.question}"</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '4px' }}>Evidence of Achievement</div>
                    <div style={{ color: '#475569', lineHeight: '1.5' }}>{selectedMilestone.evidence}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Milestones Grid */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ marginBottom: '20px', fontWeight: '500', color: '#1e293b' }}>
            9-Milestone Framework
          </h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {milestones.map((milestone, idx) => (
              <div
                key={milestone.id}
                className="milestone-row"
                style={{
                  padding: 'clamp(12px, 2vw, 16px)',
                  background: milestone.achieved ? 'rgba(34, 197, 94, 0.08)' : '#f8fafc',
                  borderRadius: '10px',
                  border: milestone.achieved ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid #e2e8f0',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={() => setSelectedMilestone(milestone)}
              >
                {/* Checkbox */}
                <div
                  className="milestone-checkbox"
                  onClick={(e) => { e.stopPropagation(); toggleMilestone(milestone.id); }}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    border: milestone.achieved ? 'none' : '2px solid #94a3b8',
                    background: milestone.achieved ? '#22c55e' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {milestone.achieved && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </div>

                {/* Name and Tags */}
                <div className="milestone-name">
                  <div style={{
                    fontWeight: '500',
                    color: milestone.achieved ? '#16a34a' : '#1e293b',
                    marginBottom: '4px',
                    fontSize: 'clamp(0.9rem, 2vw, 1rem)'
                  }}>
                    {idx + 1}. {milestone.name}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontSize: 'clamp(0.65rem, 1.5vw, 0.7rem)',
                      background: assessmentColors[milestone.assessment].bg,
                      color: assessmentColors[milestone.assessment].text
                    }}>
                      {milestone.assessment}
                    </span>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontSize: 'clamp(0.65rem, 1.5vw, 0.7rem)',
                      background: 'rgba(0,0,0,0.04)',
                      color: modelColors[milestone.model]
                    }}>
                      {milestone.model}
                    </span>
                  </div>
                </div>

                {/* Question Preview */}
                <div className="milestone-question" style={{
                  fontSize: '0.75rem',
                  color: '#64748b',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {milestone.question.slice(0, 50)}...
                </div>

                {/* Controls wrapper - display:contents on desktop, flex on mobile */}
                <div className="milestone-controls-wrapper">
                  {/* Risk Slider */}
                  <div className="milestone-risk" onClick={(e) => e.stopPropagation()}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '2px' }}>
                      Risk: {(milestone.risk * 100).toFixed(0)}%
                    </div>
                    <input
                      type="range"
                      min="0.05"
                      max="0.60"
                      step="0.01"
                      value={milestone.risk}
                      onChange={(e) => updateRisk(milestone.id, e.target.value)}
                      style={{ width: '100%', accentColor: '#ef4444' }}
                    />
                  </div>

                  {/* Months */}
                  <div className="milestone-months" onClick={(e) => e.stopPropagation()}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '2px' }}>
                      Months
                    </div>
                    <input
                      type="number"
                      min="1"
                      max="36"
                      value={milestone.months}
                      onChange={(e) => updateMonths(milestone.id, e.target.value)}
                      style={{
                        width: '60px',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: '1px solid #e2e8f0',
                        background: '#f1f5f9',
                        color: '#1e293b',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>

                  {/* Impact */}
                  <div className="milestone-impact" style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>De-risk</div>
                    <div style={{
                      color: '#22c55e',
                      fontWeight: '600',
                      opacity: milestone.achieved ? 0.5 : 1
                    }}>
                      -{(milestone.risk * 100).toFixed(0)}pp
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Investment Implications */}
        <div style={{
          marginTop: '24px',
          background: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ marginBottom: '16px', fontWeight: '500', color: '#1e293b' }}>
            Investment Implications
          </h3>
          <div className="investment-grid">
            <div>
              <div style={{ color: '#64748b', marginBottom: '8px' }}>At Current Stage</div>
              <div style={{ fontSize: '0.95rem', color: '#475569' }}>
                An investor would need <strong style={{ color: '#fbbf24' }}>{calculations.requiredMultiple.toFixed(1)}x</strong> return 
                over <strong style={{ color: '#3b82f6' }}>{calculations.remainingYears.toFixed(1)} years</strong> to 
                break even on expected value, implying an IRR 
                of <strong style={{ color: '#a855f7' }}>{calculations.irr.toFixed(0)}%</strong>.
              </div>
            </div>
            <div>
              <div style={{ color: '#64748b', marginBottom: '8px' }}>Milestones Achieved</div>
              <div style={{ fontSize: '2rem', fontWeight: '600', color: '#22c55e' }}>
                {milestones.filter(m => m.achieved).length} / 9
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                {milestones.reduce((a, m) => a + (m.achieved ? m.months : 0), 0)} months of progress
              </div>
            </div>
            <div>
              <div style={{ color: '#64748b', marginBottom: '8px' }}>Typical Funding Stage</div>
              <div style={{ fontSize: '1.1rem', color: '#1e293b' }}>
                {milestones.filter(m => m.achieved).length <= 2 && 'Pre-Seed / Angel'}
                {milestones.filter(m => m.achieved).length === 3 && 'Seed'}
                {milestones.filter(m => m.achieved).length === 4 && 'Seed / Series A'}
                {milestones.filter(m => m.achieved).length === 5 && 'Series A'}
                {milestones.filter(m => m.achieved).length === 6 && 'Series B'}
                {milestones.filter(m => m.achieved).length === 7 && 'Series B / C'}
                {milestones.filter(m => m.achieved).length >= 8 && 'Growth / Pre-IPO'}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '32px',
          paddingTop: '32px',
          textAlign: 'center',
          color: '#64748b',
          fontSize: '0.9rem',
          borderTop: '1px solid #e2e8f0'
        }}>
          Dimo Dimov | Entrepreneurial Finance Tools
        </div>
      </div>
    </div>
  );
};

export default StartupRiskVisualizer;

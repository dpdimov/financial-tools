# Entrepreneurial Finance Tools — Guide

These tools are designed to help you reason about the financial architecture of new ventures. Each one takes a question you can't answer directly — "What is this company worth?", "How much is a customer worth?", "Why is this profitable business running out of cash?" — and breaks it into smaller questions you *can* answer.

That's worth pausing on, because it's the fundamental skill these tools are trying to teach.

### A Note on Analytical Decomposition

Think of it this way. Someone asks you "How much is a customer worth?" You can't answer that as a single number — it depends on too many things. But you *can* answer: "How much do they pay per month?", "How long do they stay?", and "What margin do we earn on each pound of revenue?" Combine those three answers and you have LTV. Each sub-question is estimable. The whole question, taken as a lump, is not.

Every tool in this guide follows this pattern:

1. **Start with a question** that's too complex to answer directly
2. **Decompose** it into component factors — the inputs you see in the tool
3. **Specify the relationships** between those factors — the formulas
4. **Recombine** them to produce the answer — the outputs

When you're using these tools, pay attention not just to what the inputs *are*, but to **why these specific inputs were chosen** as the right decomposition of the problem. Each tool section includes a subsection called *"How the Problem Is Decomposed"* that makes this explicit. Understanding this decomposition logic is far more transferable than memorising any single formula — it teaches you how to build models for questions that no existing tool covers.

The tools are presented in a logical learning sequence:

| # | Tool | Core Question |
|---|------|---------------|
| 1 | [Business Modelling](#1-business-modelling) | How does this business create and capture value? |
| 2 | [Market Projection](#2-market-projection) | How large is the opportunity, realistically? |
| 3 | [Risk Visualizer](#3-risk-visualizer) | What must go right for this venture to succeed? |
| 4 | [VC Valuation](#4-vc-valuation) | What is this company worth today? |
| 5 | [Cap Table](#5-cap-table) | Who owns what, and what happens at exit? |
| 6 | [J-Curve Explorer](#6-j-curve-explorer) | What does the startup's cash journey look like? |
| 7 | [J-Curve Fund](#7-j-curve-fund) | What does the investor's cash journey look like? |
| 8 | [Financial Model](#8-financial-model) | Can this business sustain itself financially? |
| 9 | [LTV Analyzer](#9-ltv-analyzer) | How much is a customer worth over their lifetime? |
| 10 | [CAC Analyzer](#10-cac-analyzer) | What does it cost to acquire a customer? |
| 11 | [Cash Management](#11-cash-management) | Why can a profitable business run out of cash? |

---

## 1. Business Modelling

### What It Does

This is the starting point — and it's the only tool with no numbers in it at all. It maps the qualitative architecture of a business: who the customers are, what they pay for, how you reach them, and what resources you need to deliver. Get this logic right before you try to model the numbers. A financial model built on a confused business architecture will produce precise but meaningless projections.

### How the Problem Is Decomposed

The question is: *"How does this business work?"* — a question so broad it paralyses most first attempts at modelling.

The tool breaks it apart by separating **demand** from **supply**, and then tracing the causal chain within each:

```
"How does this business work?"
  │
  ├─ DEMAND: "Who pays, and for what?"
  │    ├─ Customer Types         → who are the distinct buyer segments?
  │    ├─ Revenue Streams        → what does each segment pay for, and how?
  │    ├─ Channels               → how do we reach each segment?
  │    └─ Activities             → what sales/marketing actions drive each channel?
  │
  └─ SUPPLY: "What do we need to deliver it?"
       ├─ Activities             → what operational work is required?
       ├─ Resources              → what assets/people does each activity consume?
       └─ Partnerships           → what external relationships are required?
```

Each element is then classified along two dimensions that determine its financial behaviour: **fixed vs. variable** (does it scale with volume?) and **direct vs. indirect** (can you attribute it to a specific revenue stream?). These four combinations — fixed-direct, variable-direct, fixed-indirect, variable-indirect — are the building blocks of any cost structure.

Here's the thing: this decomposition *is* the output. There are no numbers because the purpose is to establish the *structure* that numbers will later inhabit. If the tree is confused, every number you put on it later will be unreliable.

### Structure

The tool has three connected sections:

**Market Interface (Demand Side)**
You define Customer Types, link each to Revenue Streams (subscription, contract, item-sold, or usage-based), assign Channels (how you reach the customer), and specify Activities (sales or marketing actions per channel).

**Operational Infrastructure (Supply Side)**
Activities from the Market Interface flow here automatically. You then attach Resources and Partnerships to each activity, classifying them as:
- **Fixed or Variable** (does the cost change with volume?)
- **Direct or Indirect** (is it attributable to a specific revenue stream?)

**Financial Model Architecture (Output)**
A tree view showing the complete chain: Customer Type → Revenue Stream → Channel → Activity → Resource. This is the skeleton that the Financial Model tool (Tool 8) will put numbers on.

### How to Think About the Inputs

**Start from the customer, not the product.** The tool deliberately forces you to begin with "Who pays?" and "What do they pay for?" before asking "What do we need to deliver it?" This is how investors think about businesses — and it's a useful discipline even if you find it unnatural at first.

**Revenue type matters enormously.** The choice between subscription, contract, item-sold, and usage-based isn't cosmetic — it determines your entire cash flow profile, working capital needs, and growth dynamics. A subscription business and an item-sold business with identical annual revenue will have completely different financial models. If you're not sure why, that's exactly what Tools 8-11 are designed to show you.

**Watch for shared entities.** When a channel or activity serves multiple revenue streams, the tool marks it as "shared." That's a feature, not a problem — shared infrastructure creates operating leverage. If you have too few shared elements, your cost structure may not scale. If everything is shared, you may lack focus.

**Use the fixed/variable and direct/indirect classifications deliberately.** These aren't just labels — they determine how costs behave as you grow:
- Fixed + Direct: Capacity costs (e.g., a dedicated production line). These create step-function scaling.
- Variable + Direct: Unit costs (e.g., raw materials). These scale linearly with revenue.
- Fixed + Indirect: Overhead (e.g., office rent). These create operating leverage — good at scale, dangerous when small.
- Variable + Indirect: Shared services that scale (e.g., customer support). Often the hardest to manage.

**The output tree is your financial model blueprint.** Before moving to Tool 8, study this tree. Every branch on the revenue side needs a pricing assumption. Every branch on the cost side needs a £ figure and a behaviour rule. If the tree doesn't make sense to you, the financial model won't either.

---

## 2. Market Projection

### What It Does

Sizes the market opportunity using the TAM → SAM → SOM framework, with both top-down (market share) and bottom-up (sales capacity or marketing spend) approaches.

### How the Problem Is Decomposed

The question is: *"How large is the market opportunity?"* — a question that, answered as a single number, is almost always either too large (the whole industry) or too small (just the customers you know about).

The tool breaks it apart through **progressive narrowing** and **dual estimation**:

```
"How large is our market?"
  │
  ├─ NARROWING: TAM → SAM → SOM
  │    ├─ TAM: "What if everyone who could buy, did?"
  │    ├─ Geographic filter    → "Where can we actually operate?"
  │    ├─ Segment filter       → "Which customers actually need this?"
  │    ├─ Channel filter       → "Which of those can our model reach?"
  │    ├─ Regulatory filter    → "Where are we allowed to sell?"
  │    └─ SAM: the result of all four filters applied sequentially
  │
  ├─ TOP-DOWN: "What share of SAM can we capture?"
  │    ├─ Competitive intensity → how many rivals share this SAM?
  │    ├─ Initial share         → what % is realistic in Year 1?
  │    └─ Share growth rate     → how fast can share expand?
  │
  └─ BOTTOM-UP: "What can we actually sell with the resources we have?"
       ├─ B2B path: sales team size × productivity × deal size
       └─ B2C path: marketing spend ÷ CAC × average revenue per customer
```

The insight is that market sizing is not one estimation problem but two *different* estimation problems that should converge. The top-down approach asks "what fraction of the market can we win?" The bottom-up approach asks "what can our machine actually produce?" When these two disagree — and they often do — the gap reveals either over-ambitious assumptions or under-investment in capacity. The decomposition forces this cross-check, and the cross-check is where the real thinking happens.

### Computational Structure

**TAM → SAM Waterfall** (sequential filters)
```
SAM = TAM × geographic_reach × target_segment% × channel_reach% × regulatory_access%
```
Each filter narrows the global market to what you can actually address.

**Top-Down SOM** (market share approach, 5-year projection)
```
Market share grows annually at growth_rate%, capped at min(40%, 100%/(competitors+1))
SOM = SAM × market_share%
```

**Bottom-Up B2B** (sales-driven)
```
Reps grow linearly: base_reps + reps_added × year
SOM = reps × deals_per_rep × average_deal_size
```

**Bottom-Up B2C** (marketing-driven)
```
Marketing spend grows at marketing_growth_rate% annually
Customers acquired = cumulative(spend / CAC)
SOM = cumulative_customers × average_price
```

**Validation checks:** LTV:CAC ratio (healthy = 3:1 to 7:1), deal size alignment with market pricing, top-down vs. bottom-up cross-check.

### How to Think About the Inputs

**TAM is not your market.** The global TAM is the theoretical ceiling — every possible customer in every possible geography buying the maximum amount. It exists to provide context, not to impress. Investors are far more interested in your SAM and SOM logic. People sometimes put a huge TAM number on a slide and think that's persuasive. It's not. It tells the audience nothing about *your* business.

**The SAM filters are where the rigour lives.** Each filter represents a real constraint:
- *Geographic reach:* Where can you actually sell? A UK startup claiming 100% global reach in Year 1 is not credible.
- *Target segment:* Within your geography, which customers actually need your product? Be specific.
- *Channel reach:* Of those who need it, how many can your sales/distribution model actually touch?
- *Regulatory access:* Are there markets where regulation prevents you from operating?

**Resist the temptation to keep all filters at 100%.** The value of this tool is in forcing honest narrowing. A TAM of $50B filtered to a SAM of $800M is far more credible than a SAM of $50B with no filtering. The filtering *is* the analysis.

**The competitor count matters more than you think.** The implied market share ceiling — `100% / (competitors + 1)` — is a rough but useful discipline. If there are 10 incumbents, claiming more than ~9% share requires a strong justification. What makes you different enough to take more than your "fair share"?

**Year 1 share should be small.** Even 1-2% of SAM in Year 1 is ambitious for most startups. The growth rate slider lets you model how quickly you capture more, but the starting point anchors credibility.

**Use both top-down and bottom-up, then compare.** This is the most powerful feature. If your top-down projection says £20M in Year 3 but your bottom-up sales model (reps × deals × deal size) produces £5M, something is wrong. Either your market share assumption is too aggressive or your sales team is too small. The gap between the two approaches is where the most important strategic questions live.

**For B2C bottom-up:** The marketing spend growth rate is the most leveraged input. Doubling your marketing budget only works if CAC stays constant — in practice, CAC rises as you exhaust efficient channels. Model conservatively here.

---

## 3. Risk Visualizer

### What It Does

Models startup risk as a series of nine independent milestone gates. The key insight: risks compound multiplicatively, not additively. That distinction matters enormously, and most people get it wrong.

### How the Problem Is Decomposed

The question is: *"How risky is this venture?"* — typically answered with vague language ("it's high-risk") that obscures more than it reveals.

The tool breaks aggregate risk into **independent milestone gates**, each with two measurable dimensions:

```
"How risky is this venture?"
  │
  ├─ DECOMPOSE into sequential milestones
  │    ├─ Problem-Solution Fit   → "Is the problem real and our solution valid?"
  │    ├─ Team Assembly          → "Can we build the right team?"
  │    ├─ Technology Readiness   → "Can we build the product?"
  │    ├─ Product Development    → "Can we ship it?"
  │    ├─ Product-Market Fit     → "Do customers want it?"
  │    ├─ Unit Economics         → "Can we make money per customer?"
  │    ├─ Scalable Growth        → "Can we grow efficiently?"
  │    ├─ Capital Structure      → "Can we fund the growth?"
  │    └─ Cash Flow Positive     → "Can we sustain ourselves?"
  │
  ├─ PER MILESTONE: two dimensions
  │    ├─ Probability of failure → how likely is it that this gate blocks us?
  │    └─ Time to resolve        → how long until we know?
  │
  └─ RECOMBINE multiplicatively
       Success = (1−r₁) × (1−r₂) × ... × (1−r₉)
       Required Multiple = 1 / Success
       Required IRR = f(Required Multiple, Remaining Time)
```

The decomposition works because each milestone represents a *qualitatively different* type of risk — market risk, technology risk, execution risk, financial risk. Lumping them into a single "risk level" loses the diagnostic power. By separating them, you can see which specific gate poses the greatest threat, how much de-risking each achievement provides, and what return profile investors need to compensate for the remaining uncertainty. The multiplicative recombination reflects the reality that *all* gates must be passed — failure at any one is fatal.

### Computational Structure

```
Composite Risk = 1 − (1−r₁) × (1−r₂) × ... × (1−r₉)    [unachieved milestones only]
Success Probability = 1 − Composite Risk
Required Return Multiple = 1 / Success Probability
Required IRR = (Required Multiple)^(1/Remaining Years) − 1
```

**Nine Milestones** (default sequence):
1. Problem-Solution Fit (40% risk, 6 months)
2. Team Assembly (35% risk, 6 months)
3. Technology Readiness (30% risk, 12 months)
4. Product Development (25% risk, 9 months)
5. Product-Market Fit (22% risk, 12 months)
6. Unit Economics Validation (18% risk, 9 months)
7. Scalable Growth (15% risk, 9 months)
8. Favourable Capital Structure (15% risk, 6 months)
9. Cash Flow Positive (12% risk, 12 months)

### How to Think About the Inputs

**Multiplicative risk is unintuitive — and that's the point.** If you have five milestones each with "only" 20% failure probability, your overall success probability is not 80% — it's 0.8⁵ = 33%. That tells you something important about why most startups fail even when each individual risk seems manageable.

**The risk slider for each milestone is a subjective judgment, and that's fine.** The tool isn't claiming precision. It's forcing you to have an explicit conversation about *where* the risk lies. A team that sets Problem-Solution Fit at 10% risk should be able to explain what evidence supports that confidence. If they can't, the number is wishful thinking.

**Toggle milestones to "achieved" to see their de-risking impact.** This is the most instructive exercise. Watch how each achievement drops the composite risk and required return multiple. Early milestones (Problem-Solution Fit, Team) often have the highest individual risk — achieving them has outsized impact on the overall picture.

**The Required Multiple tells you what investors need.** If the composite risk implies a 10% success probability, investors need a 10x return to break even *in expectation*. This is why early-stage investors demand such high potential returns — it's not greed, it's arithmetic. The maths requires it.

**Required IRR connects risk to time.** A 10x return over 3 years requires a 115% IRR. The same 10x over 7 years requires "only" 39% IRR. This is why investors care about both the magnitude of risk *and* how long it takes to resolve. The months input for each milestone directly affects this calculation.

**Experiment with risk ordering.** What happens if you swap the highest-risk milestone to later in the sequence? The composite risk doesn't change (multiplication is commutative), but the *progression chart* changes — and that matters for fundraising. Investors want to see the biggest risks addressed earliest.

---

## 4. VC Valuation

### What It Does

Triangulates a startup valuation using three approaches: DCF (discounted cash flow), comparable company multiples, and quality adjustments. The distinctive feature is a risk-adjusted discount rate that embeds survival probability — the risk that there may be no company at all, which is quite different from the risk that revenues might be volatile.

### How the Problem Is Decomposed

The question is: *"What is this company worth?"* — one of the hardest questions in finance, and especially hard for startups that may have no revenue, no profit, and a high probability of ceasing to exist.

The tool breaks it into three independent estimation approaches, then blends them:

```
"What is this company worth?"
  │
  ├─ APPROACH 1: Discounted Cash Flow
  │    ├─ Revenue trajectory    → "What will revenue be in Years 1-5?"
  │    │    └─ Current ARR × growth rates (year by year)
  │    ├─ Profitability         → "How much cash does each £ of revenue generate?"
  │    │    └─ Gross margin − operating expenses
  │    ├─ Terminal value         → "What is it worth at Year 5?"
  │    │    └─ Year 5 Revenue × exit multiple
  │    └─ Discount rate          → "What rate reflects the risk?"
  │         ├─ Base rate         → time value of money
  │         └─ Survival risk     → probability of extinction
  │              ├─ Survival rate  → % chance of reaching maturity
  │              └─ Time horizon   → years until "established"
  │
  ├─ APPROACH 2: Comparable Companies
  │    ├─ Peer multiples        → "What do similar companies trade at?"
  │    │    └─ Valuation ÷ Revenue for each comparable
  │    └─ Apply median to current revenue
  │
  ├─ APPROACH 3: Quality Adjustment
  │    └─ "Is this company better or worse than the comparables?"
  │         ├─ Team quality       (weighted 20%)
  │         ├─ Product quality    (weighted 20%)
  │         ├─ Market quality     (weighted 15%)
  │         ├─ Traction           (weighted 15%)
  │         └─ Defensibility      (weighted 10%)
  │
  └─ BLEND: average across approaches → valuation range
```

The key decomposition insight is the **separation of operating performance from existential risk**. Traditional DCF uses a single discount rate to capture both the time value of money and company-specific risk. This tool separates them: the base rate handles time value, and the survival probability handles the risk that the company simply ceases to exist. That's more honest for startups, where the dominant risk isn't volatility around a forecast — it's that there may be no company at all.

The triangulation across three methods is itself a decomposition principle: no single method is reliable for startups, but consistent signals across methods increase confidence.

### Computational Structure

**Risk-Adjusted Discount Rate** (the core innovation)
```
Annual failure rate = 1 − survival_rate^(1/years_to_established)
Adjusted rate = (base_rate + failure_rate) / (1 − failure_rate)
```
Example: 35% survival over 4 years → 23% annual failure → 15% base rate becomes ~50% effective rate.

**DCF**
```
Revenue[t] = Revenue[t-1] × (1 + growth_rate[t])
Cash Flow[t] = Revenue[t] × gross_margin − Revenue[t] × opex%
Terminal Value = Year 5 Revenue × terminal_multiple
DCF = Σ(CF[t] / (1 + rate)^t) + Terminal Value / (1 + rate)⁵
```
Calculated twice: once with the base rate, once with the risk-adjusted rate.

**Comparable Analysis**
```
Median multiple = median of (valuation / revenue) across comparable companies
Comparable Value = current_revenue × median_multiple × quality_multiplier
```

**Quality Multiplier** (five factors, weighted)
```
Per factor: multiplier = 1 + ((score − 3) / 2) × weight
Total = product of all five factors
```
Scores of 1–5 map to 0.7x–1.3x per factor (centred on neutral at 3).

**Valuation Range:** Low/Mid/High blended from both approaches.

### How to Think About the Inputs

**The stage preset is your starting point, not your answer.** Selecting "Series A" pre-fills survival rate (35%), years to established (4), and base discount rate (15%). These are market averages. If you believe a specific company is lower-risk than a typical Series A, adjust the survival rate upward — but be prepared to explain why.

**Survival rate is the single most powerful lever.** Moving survival from 35% to 50% dramatically reduces the risk-adjusted discount rate, which in turn dramatically increases the DCF valuation. That tells you something important: de-risking (Tool 3) is the most value-creative activity a startup can undertake. It's not just about reducing risk — it directly increases what the company is worth.

**Growth rates should tell a story, not just go up.** The five individual growth rate inputs (Y1–Y5) let you model a trajectory. A typical pattern: high initial growth (100%+) that decelerates over time (to 30-50% by Year 5). Flat or accelerating growth over 5 years is rare. If your model shows that, ask yourself: is there a reason, or is this wishful thinking?

**Gross margin and OpEx% together determine your cash flow.** If gross margin is 70% and OpEx is 80% of revenue, your cash flow is *negative* — you're spending more on operations than you earn after COGS. This is normal for early-stage companies (they're investing in growth), but your growth rates need to be high enough that revenue eventually outpaces OpEx. If the crossover never happens in your projection, the business model has a structural problem.

**Terminal multiple deserves careful thought.** This single number often dominates the DCF. A 15x revenue multiple on Year 5 revenue assumes the market will value the company richly at maturity. Public SaaS companies trade at 5-15x revenue; most other sectors are lower. If your terminal multiple accounts for more than 70% of total DCF value, your valuation is essentially a bet on the exit, not on the cash flows. That's not necessarily wrong, but you should know it's happening.

**Quality scores are subjective — use them for relative comparison.** Score a company 3/5 on everything first (neutral baseline). Then ask: "Is this team *above average* or *below average* for companies at this stage?" Only move scores you can justify. The compounding effect matters: five scores of 4 (slightly above average) compound to a 1.16x multiplier — a meaningful 16% premium.

**Compare DCF and comparable valuations.** If the DCF is much higher than the comparable, your revenue projections may be too aggressive. If comparables are much higher, the market may be overvalued — or your projections are too conservative. The *gap* between the two methods is where the most useful conversation happens.

---

## 5. Cap Table

### What It Does

Models equity ownership across multiple funding rounds, including option pools, anti-dilution protections, and liquidation preferences. Shows who owns what at each stage and — crucially — who gets what at exit, which is not the same thing.

### How the Problem Is Decomposed

The question is: *"Who owns what, and what does everyone get at exit?"* — a question that seems like simple arithmetic but becomes complex once you account for the legal and economic structures layered onto equity.

The tool breaks it into two distinct sub-problems: **ownership tracking** and **proceeds distribution**:

```
"Who owns what, and who gets what?"
  │
  ├─ OWNERSHIP (computed per round, cumulative)
  │    ├─ Share price          → "What is one share worth?"
  │    │    └─ Pre-money valuation ÷ total pre-money shares
  │    ├─ New shares issued    → "How many shares does the investor get?"
  │    │    └─ Investment amount ÷ share price
  │    ├─ Option pool          → "How many shares are reserved for employees?"
  │    │    └─ Pool% × existing shares, with timing (pre/post money)
  │    ├─ Anti-dilution        → "Are previous investors compensated for down rounds?"
  │    │    └─ Share repricing via full ratchet or weighted average
  │    └─ Ownership%           → shares held ÷ total shares (fully diluted)
  │
  └─ PROCEEDS (computed at exit)
       ├─ Liquidation preferences → "Who gets paid first?"
       │    └─ Each preferred investor: min(invested × multiple, remaining)
       ├─ Participation rights    → "Do preferred investors also share the upside?"
       │    └─ Pro-rata share of remainder, up to a cap
       └─ Common distribution     → "What's left for founders and employees?"
            └─ Residual ÷ common shares
```

Here's the thing: **ownership percentage and economic outcome are not the same thing**. A founder might hold 25% of shares but receive nothing at a low exit because of liquidation preferences. At a very high exit, preferences become irrelevant and ownership percentages govern. The tool separates the ownership calculation (mechanical, based on share counts) from the proceeds calculation (contractual, based on preference terms) precisely because these two systems can produce very different answers for the same person.

### Computational Structure

**Per Round:**
```
Share Price = Pre-Money Valuation / Pre-Money Total Shares
New Investor Shares = Investment Amount / Share Price
Post-Money = Pre-Money + Investment
Ownership% = Shares / Total Shares
```

**Option Pool (pre-money timing):**
```
Pool Shares = Pool% × Existing Shares / (1 − Pool%)
```
Pre-money pools dilute founders *before* the new investor's price is set — a significant difference from post-money pools.

**Anti-Dilution (on down rounds):**
- Full Ratchet: Adjusted Shares = Invested / New Lower Price
- Weighted Average: New Price = (Old Price × Old Shares + New Investment) / (Old Shares + New Shares)

**Liquidation Waterfall (at exit):**
1. Preferred shareholders paid first (newest to oldest): Invested × Preference Multiple
2. Participating preferred: also get pro-rata share of remainder, up to a cap
3. Common shareholders: split whatever remains

### How to Think About the Inputs

**Pre-money valuation is the negotiation.** Every other number flows from it. A higher pre-money means the founder gives up less ownership for the same investment. But a valuation that's too high creates a "down round" risk in the next raise — and that triggers anti-dilution clauses, which can be painful.

**Option pool timing is not a detail — it's economics.** A 15% option pool created *pre-money* effectively reduces the founder's valuation, because the pool dilutes existing shareholders before the new share price is calculated. The same pool created *post-money* dilutes everyone equally, including the new investor. In practice, investors almost always insist on pre-money pools. Try switching between the two to see the ownership impact — the difference is larger than most founders expect.

**Liquidation preferences protect downside, not upside.** A 1x non-participating preference means the investor gets their money back before anyone else — but then converts to common shares for the upside. A 1x *participating* preference means they get their money back *and* share in the upside. This distinction only matters when exit valuations are modest — which, statistically, is most of the time.

**Run the exit waterfall at multiple valuations.** This is where the tool becomes really instructive. Compare exit distributions at a low exit (e.g., 1x the total invested), a modest exit (3-5x), and a large exit (10x+). At low exits, liquidation preferences dominate — founders may get nothing. At high exits, preferences become irrelevant and ownership percentages govern. The crossover point is where the real economics become visible.

**Anti-dilution provisions are insurance that founders pay for.** Full ratchet is severe: if the next round is at a lower price, the protected investor's shares are repriced as if they'd invested at the lower price, issuing them additional shares. Weighted average is gentler. Toggle between the two during a down round scenario to see the dilution impact on founders.

**Watch cumulative dilution across rounds.** After Seed, Series A, Series B with option pools at each stage, founders often hold 15-25% of the company. That's normal — but it's worth understanding the trajectory. The ownership evolution chart makes this visible.

---

## 6. J-Curve Explorer

### What It Does

Visualises the classic startup J-curve: the cumulative cash flow trajectory from initial investment, through the cash-burning trough, to breakeven and beyond. It's simple by design — five inputs, one powerful visual.

### How the Problem Is Decomposed

The question is: *"What does this startup's cash journey look like over time?"* — a dynamic question that requires modelling two distinct phases of a business's life.

The tool breaks it into the simplest possible formulation that still captures the essential shape:

```
"What is the cash trajectory?"
  │
  ├─ PHASE 1: Pre-revenue (pure burn)
  │    ├─ Initial capital      → "How deep is the starting hole?"
  │    ├─ Monthly burn rate    → "How fast does cash deplete?"
  │    └─ Months to revenue    → "How long does this phase last?"
  │
  └─ PHASE 2: Post-revenue (burn vs. growing income)
       ├─ Revenue ramp rate    → "How quickly does revenue grow?"
       └─ Gross margin         → "What fraction of revenue is usable cash?"
```

This is an intentionally minimal decomposition — five inputs — and that's its strength. The J-curve shape emerges from the interaction of just two dynamics: a constant outflow (burn) and a linearly growing inflow (margin-adjusted revenue). The trough depth, the breakeven timing, and the recovery slope are all *derived* from these five primitives.

Think of it this way: a useful model does not need to capture every detail. By reducing "startup cash flow" to five factors, the tool makes visible the structural relationships — burn duration × burn rate = funding requirement; margin × ramp = recovery speed — that get lost in more complex models. Start simple, understand the shape, then add complexity with purpose.

### Computational Structure

```
Month 0:        cumulative = −initial_capital
Months 1 to M:  cumulative −= monthly_burn                    [pre-revenue]
Months M+1–60:  revenue = ramp_rate × (month−M) × margin%
                cumulative += revenue − monthly_burn            [post-revenue]
```
Revenue grows **linearly** (not exponentially) — a deliberate simplification for clarity.

Key metrics: Peak deficit (= total funding needed), breakeven month, months of runway.

### How to Think About the Inputs

**Initial capital sets the depth of the curve's starting point.** This is what you raise. It must be enough to survive until revenue exceeds burn — if it isn't, the curve never recovers, and you need another funding round.

**Monthly burn rate is the slope of the descent.** Higher burn means faster descent toward the trough, but it also (usually) means you're investing more in growth. The question isn't "how do I minimise burn?" — it's "is this burn rate buying enough progress toward revenue?"

**Months to first revenue is the width of the trough.** This is perhaps the most critical input for capital planning. Every additional month of delay adds one month of pure burn to the deficit. A biotech company (36 months to revenue) needs fundamentally different capital than a consulting firm (3 months). That seemingly simple difference — time to revenue — drives everything else.

**Revenue ramp rate determines recovery speed.** This is how fast monthly revenue increases once it starts. A higher ramp means faster climb out of the trough. But ramp rate is constrained by your business model — SaaS can ramp quickly through subscriptions; hardware ramps slowly through production scaling.

**Gross margin determines how much of each revenue £ covers burn.** At 80% margin (SaaS), most revenue goes toward closing the deficit. At 35% margin (hardware), COGS consumes most of the top line, and recovery is much slower even with the same revenue ramp.

**Use the presets to build intuition, then go custom.** Compare SaaS (shallow, narrow J) with Biotech (deep, wide J) and Hardware (deep, slow recovery). The *shape* differences are more instructive than the specific numbers. Then model your own venture: does its J-curve look like any preset, or is it a hybrid?

**The comparison mode is the hidden gem.** Overlay two curves to see how changing a single variable reshapes the entire trajectory. Try the same business with 6 months vs. 12 months to revenue. The peak deficit roughly doubles, and breakeven moves by much more than 6 months — because you're burning cash the whole time.

**If the curve doesn't recover within 60 months, you need more capital.** The tool simulates 5 years. If your curve is still below zero at month 60, the business model either needs restructuring (lower burn, faster revenue, higher margin) or additional funding rounds. That's not a failure of the model — it's telling you something important.

---

## 7. J-Curve Fund

### What It Does

Models the cash flow experience from the **investor's perspective** — how a venture fund's portfolio of investments creates capital calls (money going out) and distributions (money coming back) over its lifetime.

**A note on fund structure.** Venture capital funds are typically structured as **Limited Liability Partnerships (LLPs)** with two key features. First, they have a **limited lifespan** — usually 10-12 years (the tool models 15 to capture late exits). Second, they separate the people who provide the capital from the people who invest it. The investors who put money into the fund are called **Limited Partners (LPs)** — "limited" because they have no control over which companies get funded. The fund managers who make the investment decisions are called **General Partners (GPs)**. LPs commit capital upfront but it gets drawn down ("called") over time as the GP finds and funds companies. Returns flow back to LPs as portfolio companies are exited. The J-curve in this tool is the LP's experience: money going out in the early years (capital calls), then money coming back in the later years (distributions).

### How the Problem Is Decomposed

The question is: *"What does the LP's cash flow experience look like?"* — a portfolio-level question that aggregates many individual company outcomes into a single fund trajectory.

The tool breaks it through **two levels** — strategy decisions at the fund level, and outcome modelling at the company level:

```
"What is the fund's cash trajectory?"
  │
  ├─ FUND STRATEGY (top-level choices)
  │    ├─ Fund size             → total capital available
  │    ├─ Number of companies   → portfolio breadth
  │    ├─ Deployment period     → how fast capital goes out
  │    ├─ Follow-on reserve     → how much is held back for winners
  │    └─ Stage allocation      → % in Seed / Series A / Series B
  │
  └─ COMPANY OUTCOMES (per stage profile, per company)
       ├─ Initial check size    → first investment
       ├─ Follow-on rounds      → conditional on survival at each stage
       │    ├─ Survival probability to next stage
       │    └─ Additional capital if survived
       ├─ Time to exit          → when returns arrive
       └─ Exit multiple distribution → probability-weighted outcomes
            └─ e.g., 60% fail, 20% return 2x, 12% return 8x, ...
```

The decomposition principle here is **aggregation from the bottom up**. The fund's J-curve is not modelled directly — it *emerges* from simulating each company independently and summing the results. This mirrors how venture funds actually work: the GP makes individual investment decisions, and the fund-level outcome is the aggregate.

The stage allocation input is where strategy meets arithmetic. By shifting the mix between Seed (high risk, long duration, power-law returns) and Series B (lower risk, shorter duration, compressed returns), you change the *shape* of the aggregate curve without changing any individual company model. That tells you something important: portfolio construction — not individual deal selection — is the primary determinant of fund-level cash flow timing.

### Computational Structure

**Per Company (staggered across deployment period):**
```
Month of investment: capital call = −initial_check
Follow-on A: additional capital × survival_probability_to_A
Follow-on B: additional capital × cumulative_survival
Exit: total_capital_in_company × expected_multiple × survival_to_exit
```

**Fund Level (180-month aggregation):**
```
Monthly net flow = Σ(all company capital calls + distributions)
Cumulative J-curve = running sum of net flows
TVPI = total_returned / total_invested
DPI @ Year 10 = distributions_through_month_120 / calls_through_month_120
```

Stage profiles encode survival chains and exit multiple distributions (e.g., Seed: 60% fail at 0x, 20% return 2x, 12% return 8x, 6% return 15x, 2% return 30x).

### How to Think About the Inputs

**Stage allocation is the primary strategic choice.** This determines the *shape* of the fund's J-curve:
- Seed-heavy funds: deep trough, long wait (7+ years to exits), high variance, potential for outlier returns
- Series B-heavy funds: shallow trough, faster exits (3-4 years), lower variance, compressed multiples
- Multi-stage: smoother curve but more capital-intensive (follow-ons)

**Number of companies vs. fund size determines check size.** A £100M fund investing in 20 companies deploys ~£5M per company (including follow-ons). A 40-company fund deploys ~£2.5M. More companies = better diversification but smaller ownership stakes. Fewer companies = concentrated bets with higher variance.

**Follow-on reserve is often underestimated.** At 50% reserve, half the fund is held back for follow-on rounds in winners. This means initial deployment is only half the fund size, spread over the deployment period. Too little reserve (20%) means you can't support your winners. Too much (70%) means tiny initial checks and limited portfolio breadth.

**Deployment period shapes the early curve.** A 3-year deployment means rapid capital calls — the J-curve drops steeply. A 6-year deployment spreads calls out, creating a shallower descent but a longer time to peak capital call.

**Compare the four presets to understand fund strategy trade-offs:**
- Seed Specialist: Highest risk, highest potential TVPI, latest breakeven
- Series A Focused: Balanced — the "default" VC model
- Growth/Series B: Fastest DPI, lowest TVPI, shallowest curve
- Multi-Stage: Smoothest curve, but requires the most capital management skill

**DPI at Year 10 is what LPs care about most.** TVPI includes unrealised gains (paper returns). DPI is cash returned. A fund with 2.5x TVPI but 0.5x DPI at Year 10 has mostly unrealised value — LPs haven't actually gotten their money back yet. This is the fundamental tension in early-stage VC.

**The survival chain is the reality check.** For Seed investments: only 40% survive to Series A, 65% of those to Series B, 70% of those to exit. Cumulative: ~18% of seed investments produce an exit. This is why the 2% chance of a 30x return matters so much — a small number of outliers drive all fund returns. If you take away one number from this tool, take that one.

---

## 8. Financial Model

### What It Does

A complete 5-year financial projection engine producing monthly P&L, cash flow, and balance sheet forecasts, with scenario analysis and Monte Carlo simulation. This is the most comprehensive tool in the suite — and it requires the most inputs, for good reason.

### How the Problem Is Decomposed

The question is: *"Can this business sustain itself financially?"* — the most comprehensive question in the suite, requiring a model of the entire business over time.

The tool breaks it into four interdependent systems, mirroring the structure of actual financial statements:

```
"Can this business sustain itself?"
  │
  ├─ REVENUE ENGINE: "How does money come in?"
  │    ├─ Customer base        → initial count, growth rate, churn rate
  │    ├─ Transaction value    → price × units × frequency
  │    └─ Timing               → when does revenue start?
  │
  ├─ COST STRUCTURE: "How does money go out?"
  │    ├─ Variable costs       → % of revenue (scale automatically)
  │    ├─ Operating costs      → fixed base with annual growth rate
  │    │    ├─ Scale-with-revenue? → does this cost grow with the business?
  │    │    └─ Pre-revenue only?   → does this cost disappear after launch?
  │    ├─ Depreciation         → fixed asset cost ÷ useful life
  │    └─ Interest             → debt balance × rate
  │
  ├─ WORKING CAPITAL: "How does timing trap cash?"
  │    ├─ Days receivable      → how long before customers pay?
  │    ├─ Days inventory       → how long is stock held?
  │    └─ Days payable         → how long before we pay suppliers?
  │
  └─ FUNDING: "Where does capital come from?"
       ├─ Initial cash         → founder's own capital
       ├─ Equity rounds        → external investment (month, amount)
       └─ Debt rounds          → borrowed capital (month, amount, rate, term)
```

The four-step builder mirrors this decomposition — each step corresponds to one system. Here's the thing: **revenue alone does not determine financial viability**. A business can have excellent revenue and still fail because its cost structure is wrong (Step 2), its working capital cycle traps cash (Step 3), or its funding arrives too late (Step 4). The decomposition forces you to address all four systems, because the output — cumulative cash position — depends on all of them simultaneously.

The three analysis modes (deterministic projection, scenario explorer, Monte Carlo) then stress-test the model at increasing levels of uncertainty, revealing which components of the decomposition are most fragile.

### Computational Structure

**Revenue (per stream, per month):**
```
Customers[m] = Customers[m-1] × (1 + monthly_growth) − Customers[m-1] × monthly_churn
Revenue[m] = Customers × units × price × (frequency / 12)
```

**Costs:**
```
Variable Costs = Revenue × Σ(% of revenue items)
Operating Costs[m] = monthly_cost × (1 + annual_growth%)^((m-1)/12)
Depreciation = asset_cost / (useful_life_years × 12)
Interest = debt_balance × (annual_rate / 12)
```

**Working Capital:**
```
Receivables = (Revenue / 30) × days_receivable
Inventory = (Variable_Costs / 30) × days_inventory
Payables = (Costs / 30) × days_payable
WC Change = Δ(Receivables + Inventory − Payables)
```

**Cash Flow:**
```
Operating CF = Net Income + Depreciation − WC Change
Investing CF = −CapEx
Financing CF = Equity + Debt Proceeds − Principal Repayment
Cumulative Cash = prior + Op CF + Inv CF + Fin CF
```

**Monte Carlo:** Runs 100-2,000 simulations with random variation on growth, churn, price, and costs. Outputs survival rate, breakeven probability, IRR/NPV distributions.

### How to Think About the Inputs

**Step 1 — Revenue: Growth rate minus churn rate is what matters.**
Think of a bathtub: new customers flow in through the tap, and existing customers drain out through the plughole. If monthly growth is 8% and monthly churn is 5%, your net customer growth is ~3%/month. But if churn exceeds growth, your customer base *shrinks* — and no amount of pricing will save you. Always model growth and churn together.

**First revenue month is a critical capital planning input.** Every month before revenue is pure burn. The tool's "funding gap" alert calculates whether your initial cash plus any funding rounds cover the pre-revenue period. If the gap is red, you need more capital or faster time-to-revenue.

**Multiple revenue streams let you model portfolio businesses.** A marketplace might have a transaction fee stream (high volume, low price) and a subscription stream (lower volume, higher price, different start month). Model them separately to understand which drives economics.

**Step 2 — Operating costs: Fixed vs. scaling matters.**
The "Scale with Revenue" toggle determines whether a cost grows with the business or stays flat. Misclassifying this creates misleading projections. Rent is fixed. Customer support likely scales. Marketing could be either, depending on your strategy. Think carefully about each cost line.

**The "Pre-Revenue Only" toggle models startup-specific costs.** Some costs (market research, product development sprints) exist only before launch. Flagging them as pre-revenue-only ensures they disappear once revenue begins, producing a more accurate projection.

**Step 3 — Variable costs directly determine your contribution margin.** If variable costs sum to 40% of revenue, your contribution margin is 60%. This is the ceiling on your gross margin. Every £1 of revenue generates only £0.60 to cover fixed costs. If your contribution margin is thin, you need very high volume to break even.

**Step 4 — Working capital: the Cash Conversion Cycle (CCC) is the hidden story.**
```
CCC = Days Receivable + Days Inventory − Days Payable
```
A positive CCC means you pay suppliers before customers pay you — cash is trapped in the cycle. A negative CCC (e.g., SaaS with upfront annual billing and no inventory) means customers fund your growth. The CCC often determines whether a growing business needs external funding. If you take away one thing from this step, make it the CCC.

**Funding rounds: match timing to the cash trough.** The cumulative cash chart shows when cash hits its minimum. Time your equity or debt round to arrive *before* that point. The model shows the exact month and magnitude of the funding gap.

**Scenario Explorer: test the edges, not the middle.** Ask yourself:
- What if growth is half what you expect?
- What if churn is double?
- What if revenue starts 12 months late?
- What if you add £500k of debt at 8%?

The side-by-side comparison shows how each scenario changes breakeven, Year 5 EBIT, and cash position. The scenarios that break the model reveal which of your assumptions are fragile — and those are the ones that need the most evidence.

**Monte Carlo: focus on the distribution shape, not the median.**
- If 30% of simulations default (run out of cash), the business is fragile regardless of the median outcome.
- The P10/P90 range tells you the realistic range of outcomes.
- The IRR vs. NPV scatter shows whether high returns require taking on disproportionate risk.

The value isn't in the final number the simulation produces — it's in what you learn about which assumptions drive the most variation.

---

## 9. LTV Analyzer

### What It Does

Calculates Customer Lifetime Value — the total gross profit a customer generates over their entire relationship with the business — across six revenue model archetypes.

### How the Problem Is Decomposed

The question is: *"How much is a customer worth?"* — a question that can't be answered as a single estimate but breaks apart naturally into three factors.

```
"How much is a customer worth?"
  │
  ├─ REVENUE PER PERIOD: "How much do they pay while they're here?"
  │    ├─ Base price/ARPU     → what they pay initially
  │    └─ Expansion/growth    → how spending changes over time
  │         ├─ Subscription: expansion revenue rate
  │         ├─ Transactional: basket growth rate
  │         ├─ Contract: upsell on renewal
  │         ├─ Marketplace: GMV growth per user
  │         └─ Usage: consumption growth rate
  │
  ├─ DURATION: "How long do they stay?"
  │    ├─ Churn rate          → probability of leaving each period
  │    └─ Average lifespan    → 1 ÷ churn rate
  │         (varies by model: monthly, annual, or at renewal points)
  │
  └─ PROFITABILITY: "How much do we keep from each £?"
       ├─ Gross margin %      → revenue minus direct costs
       └─ Upfront costs       → onboarding, implementation, acquisition discount
```

The decomposition `LTV = Revenue per Period × Duration × Margin − Upfront Costs` reveals why LTV is so sensitive to churn: duration is the *multiplicative* term. Doubling the price doubles LTV linearly. Halving churn doubles LTV through the duration term — and if there is revenue expansion, the compounding over a longer lifetime creates a super-linear effect. That seemingly small difference in churn — say 1% versus 2.1% per month — can be the difference between a viable business and one that bleeds money on every cohort.

The six revenue models are not six different tools — they are six different decompositions of "revenue per period," reflecting the different mechanics by which customers generate value. The duration and margin logic is structurally identical across all six. Recognising this shared structure beneath the model-specific details is the analytical payoff.

### Computational Structure

**Core pattern (month-by-month iteration):**
```
retention = 1.0
For each month:
    retention × = (1 − churn_rate)
    revenue = base_price × growth_factor^month × retention
    cumulative += revenue

LTV = cumulative_revenue × gross_margin% − upfront_costs
```

**Model-specific mechanics:**
- *Subscription:* Net churn = max(0.1%, churn − expansion_rate). Expansion revenue reduces effective churn.
- *Transactional:* Retention drops at annual intervals. Basket size grows yearly.
- *Contract:* Discrete renewal points. ACV increases by upsell% at each renewal.
- *Marketplace:* GMV per user grows monthly. Take rate determines revenue share.
- *Usage:* Monthly usage grows with a floor at minimum commitment.

**Unit Economics:**
```
CAC = (sales_spend + marketing_spend) / customers_acquired
LTV:CAC Ratio = LTV / CAC
Months to Payback = CAC / (monthly_ARPU × gross_margin%)
```

### How to Think About the Inputs

**Churn is the most powerful lever in the entire tool.** Small changes in monthly churn produce enormous LTV changes. At 5% monthly churn, average lifespan = 20 months. At 3%, it's 33 months — a 65% increase in lifetime from a 2-percentage-point improvement. This is why retention is often called the most important startup metric. If you can't make the unit economics work by adjusting churn, nothing else will save you.

**Expansion revenue can create "negative net churn" — the holy grail.** If existing customers increase their spending (through upsells, usage growth, or price increases) faster than other customers leave, your revenue from existing cohorts *grows* over time even with some churn. Set the expansion rate slider above the churn rate and watch what happens to LTV. This is how the best SaaS companies grow.

**Gross margin scales LTV linearly, but upfront costs reduce it by a fixed amount.** A £10 onboarding cost is trivial for a £500 LTV customer but devastating for a £15 LTV customer. Make sure the ratio is sensible for your model.

**The retention curve tells you whether your product has found fit.** A steep early decline that flattens out (an "L-shape") suggests you lose uncommitted users quickly but retain engaged ones indefinitely. A steady linear decline suggests ongoing dissatisfaction. The *shape* matters as much as the level.

**LTV:CAC ratio benchmarks:**
- Below 1x: You lose money on every customer. Stop spending on acquisition.
- 1-2x: Marginal; growth is self-defeating.
- 2-3x: Acceptable if you're early and improving.
- 3-5x: Healthy. This is the target for most businesses.
- Above 5x: Either you're under-investing in growth or your CAC will rise as you scale.

**Months to payback is the cash flow constraint.** Even with a healthy LTV:CAC ratio, if payback takes 24 months, you need to fund 24 months of customer acquisition before seeing returns. Payback under 12 months is where businesses become self-funding.

**Use the sensitivity analysis to identify your leverage point.** The tornado chart shows which parameter moves LTV the most when varied ±20%. If you increase churn by 20% and the model barely moves, churn isn't your critical assumption. But if you increase churn and the whole business becomes unviable, that's the assumption that needs the most evidence and attention.

---

## 10. CAC Analyzer

### What It Does

Models customer acquisition cost through funnel mechanics and channel-by-channel attribution across five business archetypes. Shows not just what CAC is today, but how it evolves as you scale — which is where most projections go wrong.

### How the Problem Is Decomposed

The question is: *"What does it cost to acquire a customer?"* — a question that seems simple (spend ÷ customers) but hides critical detail about *where* the cost comes from and *how* it changes.

The tool breaks it into three layers:

```
"What does it cost to acquire a customer?"
  │
  ├─ FUNNEL MECHANICS: "How do prospects become customers?"
  │    ├─ Top-of-funnel volume → how many people enter?
  │    └─ Stage conversion rates → what fraction survive each step?
  │         ├─ SaaS: visitor → signup → activation → paid
  │         ├─ E-commerce: visitor → product view → cart → checkout
  │         ├─ Enterprise: lead → MQL → SQL → proposal → close
  │         ├─ Marketplace: visitor → signup → first transaction → repeat
  │         └─ Usage: docs visitor → signup → integration → activation
  │
  ├─ COST ATTRIBUTION: "Where does the money go?"
  │    ├─ Channel spend        → budget per acquisition channel
  │    ├─ Traffic attribution  → what % of top-of-funnel does each drive?
  │    ├─ Overhead             → fixed marketing infrastructure costs
  │    └─ Channel CAC          → each channel's cost per customer
  │
  └─ SCALING DYNAMICS: "How does CAC change over time?"
       ├─ Organic traffic growth    → free traffic compounds (reduces CAC)
       ├─ Paid cost inflation       → ad costs rise (increases CAC)
       └─ Conversion improvement    → funnel optimisation (reduces CAC)
```

The first layer — funnel mechanics — is itself a decomposition. Rather than treating "getting a customer" as a single event, it breaks acquisition into sequential stages. This reveals the *bottleneck*: the stage with the lowest conversion rate is where most prospects are lost and where improvement has the highest leverage. You can work backwards — if you need 100 customers and the funnel converts at 2%, you need 5,000 visitors. What does that cost? That leads you to the second layer.

The third layer — scaling dynamics — is what distinguishes a capital plan from a snapshot. CAC is not a fixed number. It changes as organic effects, competition, and optimisation interact over time.

### Computational Structure

**Funnel throughput:**
```
Customers = Top_of_Funnel × conversion_rate_1 × conversion_rate_2 × ... × conversion_rate_n
```

**Blended CAC:**
```
CAC = (Total_Channel_Spend + Total_Overhead) / Customers_Acquired
```

**Channel-level CAC (marketing channels):**
```
Channel_Customers = Top_of_Funnel × channel_traffic_share% × overall_conversion_rate
Channel_CAC = Channel_Spend / Channel_Customers
```

**Scaling trajectory (per month):**
```
Traffic[m] = base × (1 + organic_growth%)^m
Spend[m] = base_spend × (1 + CPC_inflation%)^m + overhead
Conversion[m] = base_rates × (1 + conversion_improvement%)^m
CAC[m] = Spend[m] / Customers[m]
```

### How to Think About the Inputs

**The funnel is where operational truth lives.** Each conversion rate represents a real-world step where customers decide to continue or drop off. The biggest drop-off (lowest conversion rate) is your bottleneck. Improving a 2% conversion rate to 4% doubles your customer output. Improving a 50% rate to 55% barely moves the needle. Focus on the weakest link.

**Top-of-funnel volume and conversion rates have inverse dynamics.** You can get more customers by increasing traffic (expensive, diminishing returns) or by improving conversion (often cheaper, compounding returns). The tool lets you experiment with both — try it. You'll find that conversion improvement is usually the higher-leverage move.

**Channel CAC varies enormously — and that's the insight.** Organic/SEO might produce £30 CAC while paid social produces £200 CAC. Both contribute customers, but at very different economics. The channel mix donut and efficiency scatter reveal which channels deserve more budget and which to scale back.

**Overhead gets allocated across all customers.** Marketing tools, design, analytics — these fixed costs are divided by total customers acquired. At low volume, overhead dominates CAC. At scale, channel spend dominates. This is why CAC naturally decreases with early growth (you're spreading overhead) before increasing again (paid channel saturation).

**The scaling assumptions are the most strategically important inputs:**
- *Organic growth rate:* Compounds monthly. Even 5%/month organic growth dramatically reduces CAC over 12-24 months as free traffic replaces paid.
- *Paid cost inflation:* CPC and CPM tend to rise 2-5%/month as you exhaust cheap inventory and face more competition. Ignoring this makes projections dangerously optimistic.
- *Conversion improvement:* A/B testing, UX improvements, and better targeting can improve conversion 1-3%/month — but these gains slow over time.

**Project CAC over 12-24 months.** The trajectory chart is essential for capital planning. If CAC rises faster than revenue per customer, your unit economics deteriorate with growth — you're running faster to stand still. If CAC falls (due to organic growth and conversion improvement), growth becomes self-reinforcing.

**Compare channel CAC to blended CAC.** Channels with CAC below blended are pulling the average down — invest more there. Channels above blended are dragging performance — either optimise or cut. But be careful: some "expensive" channels may bring higher-LTV customers. The point is not to minimise CAC blindly but to understand what each channel actually delivers.

---

## 11. Cash Management

### What It Does

Demonstrates why profitable businesses can run out of cash. Uses seven operational levers that affect profit, cash, or both — making the profit-cash gap tangible and actionable. This is one of the most counter-intuitive topics in entrepreneurial finance, and the tool is designed to make it feel like arithmetic rather than magic.

### How the Problem Is Decomposed

The question is: *"Why can a profitable business run out of cash?"* — a question that confuses even experienced managers, because profit and cash feel like they should be the same thing. They're not.

The tool breaks it by separating the question into **two parallel systems** that share some inputs but produce different outputs:

```
"Why is cash different from profit?"
  │
  ├─ THE P&L SYSTEM: "What did we earn?"
  │    ├─ Revenue
  │    ├─ − COGS           → gross profit
  │    ├─ − Operating expenses
  │    └─ = Net Profit
  │
  ├─ THE CASH SYSTEM: "What cash do we have?"
  │    ├─ Net Profit       → starting point (shared with P&L)
  │    ├─ + Depreciation   → non-cash charge added back
  │    ├─ − ΔReceivables   → revenue earned but not yet collected
  │    ├─ − ΔInventory     → stock purchased but not yet sold
  │    ├─ + ΔPayables      → costs incurred but not yet paid
  │    └─ = Operating Cash Flow
  │
  └─ THE GAP: working capital timing
       ├─ DSO (Days Sales Outstanding)   → collection delay
       ├─ DIO (Days Inventory Outstanding) → stock holding period
       ├─ DPO (Days Payable Outstanding)   → payment delay
       └─ CCC = DSO + DIO − DPO           → net cash trapped in operations
```

The seven levers are then classified by which system they affect:
- **Levers 1-4** (price, volume, COGS, OPEX) affect the P&L system — and their cash impact is the P&L impact *modified by working capital timing*
- **Levers 5-7** (debtor days, inventory days, creditor days) affect *only* the cash system — they are invisible on the P&L

This decomposition makes the profit-cash gap structural rather than mysterious. The gap is not random — it is exactly equal to the change in working capital, which is exactly determined by the timing metrics (DSO, DIO, DPO). Once you see profit and cash as two parallel computations from the same inputs, with working capital as the bridge between them, the "paradox" of profitable insolvency becomes arithmetic.

### Computational Structure

**Baseline metrics (from two-year financials):**
```
DSO (Days Sales Outstanding) = (Accounts Receivable / Revenue) × 365
DIO (Days Inventory Outstanding) = (Inventory / COGS) × 365
DPO (Days Payable Outstanding) = (Accounts Payable / COGS) × 365
CCC (Cash Conversion Cycle) = DSO + DIO − DPO

Operating Cash Flow = Net Profit + Depreciation − ΔAR − ΔInventory + ΔAP
```

**Seven Levers and their dual impact:**

| Lever | Profit Impact | Cash Impact |
|-------|--------------|-------------|
| Price Increase | +Revenue × lever% | +Revenue × lever% × (1 − DSO/365) |
| Volume Increase | +Margin gain | +Margin gain − working capital investment |
| COGS Reduction | +Savings | +Savings × (1 + DIO/365) |
| OPEX Reduction | +Savings | +Savings (identical) |
| Reduce Debtor Days | None | +Daily Revenue × days reduced |
| Reduce Inventory Days | None | +Daily COGS × days reduced |
| Increase Creditor Days | None | +Daily COGS × days extended |

### How to Think About the Inputs

**Start with a template to understand the baseline.** Each template represents a different profit-cash dynamic:
- *John's Gadgets:* Profitable but cash-constrained due to growth and working capital
- *SaaS:* Favourable cash dynamics (prepaid subscriptions, no inventory)
- *Manufacturing:* Long CCC, capital-intensive
- *Retail:* Fast inventory turns, thin margins
- *Consulting:* Revenue timing issues (long receivables)

**The Cash Conversion Cycle is the single most diagnostic metric.** It tells you how many days cash is trapped between paying suppliers and collecting from customers. A CCC of 60 days means every £1 of daily revenue requires £60 of working capital. A CCC of −10 days (possible in SaaS and retail) means customers fund your operations. If someone asks you "how cash-intensive is this business?" — look at the CCC first.

**The "Volume Paradox" (Lever 2) is the key teaching moment.** Increase volume by 10% and watch: profit rises (good!) but cash often *falls* (bad!). Why? Because growth requires working capital investment — you need to carry more inventory and fund more receivables before customers pay. This is why fast-growing profitable companies go bankrupt. The profit impact is positive, but the cash impact is profit minus the working capital investment, which can be negative. If you take away one idea from this tool, take this one.

**Levers 5-7 (working capital days) affect only cash, never profit.** This is the most counter-intuitive lesson. Collecting from customers 10 days faster adds zero to your P&L — but it releases significant cash. Negotiating 10 extra days to pay suppliers costs you nothing on paper but conserves cash. These are "free" levers that many entrepreneurs overlook because they focus exclusively on the P&L.

**Compare the two waterfall charts side by side.** The EBIT waterfall shows what happens to profitability. The Cash Flow waterfall shows what happens to cash. The difference between the two is the working capital effect. When these charts diverge — profit up, cash down — you've found the profit-cash gap. That divergence is not a bug in the accounting. It's the whole point.

**Price increases have a delayed cash effect.** If DSO is 60 days, a price increase improves profit immediately but only 83% of the cash arrives within the current period (1 − 60/365). The remaining 17% sits in receivables. The higher your DSO, the more cash gets "stuck" in the timing gap.

**COGS reduction is the most cash-efficient P&L lever.** Reducing COGS not only improves profit but also releases the inventory investment associated with those costs. The cash benefit exceeds the profit benefit by a factor of (1 + DIO/365). If DIO is 90 days, a £100k COGS reduction releases ~£125k of cash.

**OPEX reduction is the only lever where profit and cash impact are identical.** Operating expenses have no working capital timing effect — they're paid and expensed in the same period. This makes OPEX cuts the most predictable lever, but not necessarily the most impactful.

---

## Connecting the Tools

These tools are not meant to be used in isolation. They form an analytical chain:

1. **Business Modelling** defines *what* the business does — its revenue mechanisms and cost structure
2. **Market Projection** sizes the *opportunity* — how large the addressable market is
3. **Risk Visualizer** maps the *milestones* that must be achieved and the probability of success
4. **VC Valuation** translates risk and projections into a *valuation* for fundraising
5. **Cap Table** models the *ownership* implications of each funding round
6. **J-Curve Explorer** shows the *shape* of the startup's cash journey
7. **J-Curve Fund** shows the same journey from the *investor's* perspective
8. **Financial Model** builds the full *financial projection* — P&L, cash flow, and balance sheet
9. **LTV Analyzer** quantifies the *value* of each customer over time
10. **CAC Analyzer** quantifies the *cost* of acquiring each customer
11. **Cash Management** reveals the operational *gap* between profit and cash

The outputs of one tool often inform the inputs of another. For example:
- The Revenue Streams from Business Modelling become the revenue model type in LTV Analyzer
- The Required Multiple from Risk Visualizer connects directly to the terminal multiple in VC Valuation
- The LTV and CAC from Tools 9 and 10 feed into the unit economics validation milestone in Risk Visualizer
- The CCC from Financial Model explains the cash dynamics you see in Cash Management
- The cap table's ownership percentages determine who benefits from the exit modelled in J-Curve Explorer

Start with the tool that matches your current question. Use the connections to deepen your analysis.

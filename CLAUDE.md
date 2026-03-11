# Financial Tools Monorepo

Interactive web-based tools for entrepreneurial finance analysis. Deployed on Vercel.

## Project Structure

- `packages/*/` — Vite + React source code (9 tools)
- `static/*/` — Static HTML tools (3 tools: business-modelling, cash-management, glossary)
- `{tool-name}/` (root level) — **Built output** served by Vercel (do NOT edit directly)
- `shared.css` — Shared CSS variables and navigation styles
- `index.html` — Home page / navigation hub
- `build.js` — Build orchestration script

## Build & Deploy Workflow

**Critical**: Vercel serves built output from root-level directories, not from `packages/`.

After changing any Vite tool source in `packages/*/`:
1. Commit the source changes
2. Run `npm run build`
3. Commit the rebuilt output (root-level `{tool-name}/` directory)
4. Push both commits

Preview locally: `npm run dev:{tool-name}` (e.g., `npm run dev:risk-visualizer`)

## Vite Tools

| Tool | Package | Dev Command |
|------|---------|-------------|
| Cap Table | `@financial-tools/cap-table` | `npm run dev:cap-table` |
| LTV Analyzer | `@financial-tools/ltv-analyzer` | `npm run dev:ltv-analyzer` |
| CAC Analyzer | `@financial-tools/cac-analyzer` | `npm run dev:cac-analyzer` |
| Financial Model | `@financial-tools/financial-model` | `npm run dev:financial-model` |
| J-Curve Explorer | `@financial-tools/j-curve-explorer` | `npm run dev:j-curve-explorer` |
| Market Projection | `@financial-tools/market-projection` | `npm run dev:market-projection` |
| Risk Visualizer | `@financial-tools/risk-visualizer` | `npm run dev:risk-visualizer` |
| Venture Loan | `@financial-tools/venture-loan` | `npm run dev:venture-loan` |
| VC Valuation | `@financial-tools/vc-valuation` | `npm run dev:vc-valuation` |
| Slingshot Companion | `@financial-tools/slingshot-companion` | `npm run dev:slingshot-companion` |

## Slingshot Companion

A standalone finance companion for **The Slingshot** AI startup simulation game (hosted externally at a separate site). This tool is **intentionally hidden** from the main financial-tools home page and navigation — it is only reachable via direct URL (`/slingshot-companion/`).

### Context
- The Slingshot is a 73k-line single-HTML educational game simulating running a UK AI startup over 16 quarters
- The game has an intermediate funding model (equity rounds, cap table, dilution protection, UK grants) but deliberately simplified for playability
- The companion adds deeper financial analysis without modifying the game itself
- Game source is at `~/Dropbox/Apps/slingshot/index.html`; a detailed README.md describing the game's mechanics exists there

### Architecture
- Game state is extracted via a browser console snippet (see `stateParser.js` for the snippet text)
- State arrives either as a URL `?state=<base64>` parameter or pasted JSON
- `stateParser.js` — parses, validates, and derives financial analysis from game state
- `SlingshotCompanion.jsx` — main UI with collapsible analysis panels

### Key game data structures (from the `game` global object)
- `game.investorStakes[]` — cap table: `{ name, equity, round, turn, dilutionProtection }`
- `game.equityGrants[]` — employee equity: `{ equity, cliff, vestingYears, grantedQuarter }`
- `game.metrics` — `{ cash, val, equity, staff, burn, sci, dev, mkt, hr }`
- `game.quarterSummaries[]` — historical snapshots per quarter (metrics, decisions, milestone progress)
- `game.investors[]` — investor details with relationship data
- `game.funder` — lead investor terms
- `game.ukGrantHistory[]` — grant application outcomes

### Current status (work in progress)
The v1 scaffold is complete and builds. Panels implemented:
- Ownership breakdown (pie chart + table with protection status)
- Dilution scenarios (what-if table for next equity round)
- Financial timeline (equity/cash/valuation chart over quarters)
- Runway analysis (with low-runway warnings)
- SEIS/EIS tax scheme eligibility
- UK grant funding summary
- Employee vesting progress
- Investor relationship gauge

### Planned enhancements (not yet built)
- **SAFE/convertible note modelling**: What if the next round uses a SAFE instead of equity? Show conversion scenarios at different cap/discount combinations (reuse logic from `packages/venture-loan/`)
- **Liquidation preference waterfall**: Model exit scenarios showing who gets paid what, with participating/non-participating preferred (reuse from `packages/cap-table/`)
- **R&D tax credit estimation**: UK R&D tax relief (SME scheme) based on sci/dev spending patterns
- **Scenario comparison**: Side-by-side comparison of two different game states (e.g., before/after a funding decision)
- **Richer burn/revenue charts**: Per-quarter revenue overlay on burn trend if quarterSummaries starts capturing revenue data
- **Integration with game team**: Propose adding an "Export to Finance Companion" button to the game that generates the URL-parameter link automatically

### Do NOT
- Add this tool to the home page (`index.html`), guide, or navigation in any other tool
- Modify any file in `~/Dropbox/Apps/slingshot/` without explicit instruction

## Styling Conventions

- **Fonts**: Crimson Pro (headers/branding), Source Sans 3 (body/UI)
- **Theme**: Light — `#f8fafc` background, `#ffffff` cards, `#e2e8f0` borders
- **Text**: `#1e293b` primary, `#64748b` secondary
- **Accents**: Teal `#0d9488`, Blue `#2563eb`, Red `#dc2626`, Amber `#d97706`, Purple `#7c3aed`
- **Google Fonts link**: `Crimson+Pro:wght@400;600;700&family=Source+Sans+3:wght@300;400;600`
- CSS variables defined in `shared.css` — use these in static tools; Vite tools currently use inline styles

## Navigation

Every tool page has a `<nav class="site-nav">` linking to all tools. When adding or removing a tool, update navigation in **all 14 files**:
- `index.html` (home page — add a tool card)
- `guide/index.html`
- 9 Vite tools: `packages/*/index.html`
- 3 static tools: `static/*/index.html`

## Gotchas

- `shared.css` warnings during build ("doesn't exist at build time") are harmless — resolved at runtime
- Some tools still have dark-theme remnants in inline styles (e.g., white text, transparent-white backgrounds) — fix these when encountered
- The cap-table and risk-visualizer bundles trigger chunk size warnings — not a problem currently

# Financial Tools Monorepo

Interactive web-based tools for entrepreneurial finance analysis. Deployed on Vercel.

## Project Structure

- `packages/*/` — Vite + React source code (8 tools)
- `static/*/` — Static HTML tools (4 tools: business-modelling, cash-management, financial-engine, glossary)
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
| J-Curve Explorer | `@financial-tools/j-curve-explorer` | `npm run dev:j-curve-explorer` |
| J-Curve Fund | `@financial-tools/j-curve-fund` | `npm run dev:j-curve-fund` |
| Market Projection | `@financial-tools/market-projection` | `npm run dev:market-projection` |
| Risk Visualizer | `@financial-tools/risk-visualizer` | `npm run dev:risk-visualizer` |
| VC Valuation | `@financial-tools/vc-valuation` | `npm run dev:vc-valuation` |

## Styling Conventions

- **Fonts**: Crimson Pro (headers/branding), Source Sans 3 (body/UI)
- **Theme**: Light — `#f8fafc` background, `#ffffff` cards, `#e2e8f0` borders
- **Text**: `#1e293b` primary, `#64748b` secondary
- **Accents**: Teal `#0d9488`, Blue `#2563eb`, Red `#dc2626`, Amber `#d97706`, Purple `#7c3aed`
- **Google Fonts link**: `Crimson+Pro:wght@400;600;700&family=Source+Sans+3:wght@300;400;600`
- CSS variables defined in `shared.css` — use these in static tools; Vite tools currently use inline styles

## Navigation

Every tool page has a `<nav class="site-nav">` linking to all tools. When adding or removing a tool, update navigation in **all 13 files**:
- `index.html` (home page — add a tool card)
- 8 Vite tools: `packages/*/index.html`
- 4 static tools: `static/*/index.html`

## Gotchas

- `shared.css` warnings during build ("doesn't exist at build time") are harmless — resolved at runtime
- Some tools still have dark-theme remnants in inline styles (e.g., white text, transparent-white backgrounds) — fix these when encountered
- The cap-table and risk-visualizer bundles trigger chunk size warnings — not a problem currently

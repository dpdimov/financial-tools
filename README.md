# Financial Tools Monorepo

Interactive web-based tools for entrepreneurial finance analysis and modeling.

## Project Structure

```
financial-tools/
├── packages/                    # Vite-based React applications (9 tools)
│   ├── cac-analyzer/
│   ├── cap-table/
│   ├── financial-model/
│   ├── j-curve-explorer/
│   ├── j-curve-fund/
│   ├── ltv-analyzer/
│   ├── market-projection/
│   ├── risk-visualizer/
│   └── vc-valuation/
├── static/                      # Static HTML tools (3 tools)
│   ├── business-modelling/
│   ├── cash-management/
│   └── glossary/
├── index.html                   # Home page / navigation hub
├── shared.css                   # Shared styles and navigation
├── build.js                     # Build orchestration script
├── package.json                 # Monorepo configuration
└── vercel.json                  # Deployment configuration
```

## Tools Overview

### Vite Tools (React)

| Tool | Directory | Description |
|------|-----------|-------------|
| Cap Table | `packages/cap-table/` | Model funding rounds with cap table visualization |
| LTV Analyzer | `packages/ltv-analyzer/` | Customer lifetime value and unit economics |
| CAC Analyzer | `packages/cac-analyzer/` | Customer acquisition cost and funnel analysis |
| Financial Model | `packages/financial-model/` | Interactive 5-year financial simulator with scenarios and Monte Carlo |
| J-Curve Explorer | `packages/j-curve-explorer/` | Funding requirements by business model |
| J-Curve Fund | `packages/j-curve-fund/` | VC fund cash flows to LPs |
| Market Projection | `packages/market-projection/` | TAM/SAM/SOM market sizing |
| Risk Visualizer | `packages/risk-visualizer/` | Startup risk assessment visualization |
| VC Valuation | `packages/vc-valuation/` | Risk-adjusted DCF valuation |

### Static Tools (HTML)

| Tool | Directory | Description |
|------|-----------|-------------|
| Business Model | `static/business-modelling/` | Business Model Canvas visualization |
| Cash Flow | `static/cash-management/` | Profit vs cash flow simulation |
| Glossary | `static/glossary/` | Entrepreneurial finance terminology |

## Development

### Run a Vite tool locally

```bash
npm run dev:cap-table
npm run dev:ltv-analyzer
npm run dev:cac-analyzer
npm run dev:financial-model
npm run dev:j-curve-explorer
npm run dev:j-curve-fund
npm run dev:market-projection
npm run dev:risk-visualizer
npm run dev:vc-valuation
```

### Preview full site locally

```bash
npm run build
npx serve .
```

## Build Process

Run `npm run build` to:

1. Build all Vite apps (output to root directories)
2. Copy static tools from `static/` to root directories

Each Vite tool's `vite.config.js` specifies its output directory:
```javascript
build: {
  outDir: '../../{tool-name}',
  emptyOutDir: true
}
```

## Adding a New Vite Tool

### 1. Create the package

```bash
mkdir -p packages/new-tool/src/components
```

### 2. Create package.json

```json
{
  "name": "@financial-tools/new-tool",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8"
  }
}
```

### 3. Create vite.config.js

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: '../../new-tool',
    emptyOutDir: true
  }
})
```

### 4. Create index.html

Include shared navigation and styles:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Tool | Financial Tools</title>
  <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=Source+Sans+3:wght@300;400;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../shared.css">
</head>
<body>
  <nav class="site-nav">
    <div class="nav-container">
      <a href="../" class="nav-brand">Financial Tools</a>
      <ul class="nav-links">
        <li><a href="../">Home</a></li>
        <li><a href="../business-modelling/">Business Model</a></li>
        <li><a href="../cash-management/">Cash Flow</a></li>
        <li><a href="../financial-model/">Financial Model</a></li>
        <li><a href="../risk-visualizer/">Risk Visualizer</a></li>
        <li><a href="../cap-table/">Cap Table</a></li>
        <li><a href="../j-curve-explorer/">J-Curve</a></li>
        <li><a href="../j-curve-fund/">Fund J-Curve</a></li>
        <li><a href="../market-projection/">Market Sizing</a></li>
        <li><a href="../vc-valuation/">VC Valuation</a></li>
        <li><a href="../ltv-analyzer/">LTV Analyzer</a></li>
        <li><a href="../cac-analyzer/">CAC Analyzer</a></li>
        <li><a href="../new-tool/" class="active">New Tool</a></li>
        <li><a href="../glossary/">Glossary</a></li>
      </ul>
    </div>
  </nav>

  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>

  <footer style="text-align: center; padding: 2rem; color: var(--text-secondary); font-size: 0.875rem;">
    <p>Dimo Dimov | Entrepreneurial Finance Tools</p>
  </footer>
</body>
</html>
```

### 5. Create React entry files

**src/main.jsx:**
```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

**src/App.jsx:**
```jsx
import NewTool from './components/NewTool'

export default function App() {
  return <NewTool />
}
```

### 6. Add dev script to root package.json

```json
"dev:new-tool": "npm run dev -w @financial-tools/new-tool"
```

### 7. Install dependencies

```bash
npm install
```

### 8. Update navigation everywhere

See "Updating Navigation" section below.

## Adding a New Static Tool

### 1. Create directory

```bash
mkdir static/new-tool
```

### 2. Create index.html

Include the same navigation structure as Vite tools (see above).

### 3. Update build.js

Add the new tool to the `staticDirs` array:

```javascript
const staticDirs = ['business-modelling', 'cash-management', 'glossary', 'new-tool'];
```

### 4. Update navigation everywhere

See "Updating Navigation" section below.

## Updating Navigation

When adding a new tool, update navigation in these locations:

### 1. Home page (index.html)

Add a tool card to the grid:

```html
<a href="./new-tool/" class="tool-card" style="--accent: #color;">
  <div class="tool-icon">ICON</div>
  <div class="tool-content">
    <h2>New Tool</h2>
    <p>Tool description here.</p>
    <span class="tool-category">Category</span>
  </div>
</a>
```

### 2. All Vite tools

Update the `<nav>` section in each `packages/*/index.html` file (9 files).

### 3. All static tools

Update the `<nav>` section in each `static/*/index.html` file (3 files).

**Files to update:**
- `index.html` (home)
- `packages/cac-analyzer/index.html`
- `packages/cap-table/index.html`
- `packages/financial-model/index.html`
- `packages/j-curve-explorer/index.html`
- `packages/j-curve-fund/index.html`
- `packages/ltv-analyzer/index.html`
- `packages/market-projection/index.html`
- `packages/risk-visualizer/index.html`
- `packages/vc-valuation/index.html`
- `static/business-modelling/index.html`
- `static/cash-management/index.html`
- `static/glossary/index.html`

**Navigation link format:**
```html
<li><a href="../new-tool/">New Tool</a></li>
```

## Deployment

### Build

```bash
npm run build
```

### Deploy to Vercel

The site is configured for Vercel static hosting. Push to the repository and Vercel will deploy automatically.

### Vercel Configuration

`vercel.json` configures static site serving from the root directory.

## Shared Resources

### shared.css

Contains CSS variables for theming and navigation styles:

```css
:root {
  --bg-primary: #f8fafc;
  --bg-secondary: #ffffff;
  --accent-1: #0d9488;      /* Teal */
  --accent-2: #2563eb;      /* Blue */
  --accent-3: #dc2626;      /* Red */
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --border-color: #e2e8f0;
}
```

### Fonts (Google Fonts)

- **Crimson Pro** - Headers and branding
- **Source Sans 3** - Body text and UI

## Checklist: Adding a New Tool

- [ ] Create package directory and files (Vite) or static directory (HTML)
- [ ] Configure vite.config.js with correct `outDir` (Vite only)
- [ ] Add dev script to root package.json (Vite only)
- [ ] Update build.js staticDirs array (static only)
- [ ] Add tool card to home page (index.html)
- [ ] Add navigation link to all 9 Vite tool index.html files
- [ ] Add navigation link to all 3 static tool index.html files
- [ ] Run `npm install` (Vite only)
- [ ] Run `npm run build` to verify build works
- [ ] Test locally with `npx serve .`
- [ ] Commit and deploy

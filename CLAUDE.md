# Guidelines

## 🏗️ Architecture Overview
- **Frontend**: Next.js 14+ with TypeScript
- **UI Library**: HeroUI + Tailwind CSS
- **Styling**: Custom theme with defined color palette
- **State**: React Context for filters
- **Data**: Huwise API integration
- **Maps**: MapLibre GL with interactive features

## 🎨 Theming & Styling - CRITICAL RULES

### ❌ NEVER DO:
- **NO hardcoded colors** (`#002B59`, `#CA1C60`, etc.)
- **NO inline styles** with color values
- **NO custom CSS** without using theme tokens
- **NO Additional helper function** if they are not used

### ✅ ALWAYS DO:
- Use **theme classes**: `bg-secondary`, `text-primary`, `border-foreground-100`
- Use color palette reference from `tailwind.config.js` and from shared colors in `src/config/colors.js`
- Reference **theme functions**: `theme('colors.secondary.DEFAULT')`
- Check `/src/config/colors.js` for available colors
- Use **existing Tailwind classes** from the configured theme
- Reuse utils function in `src/utils` files
- Group all types and interfaces in `src/types`
- Type Naming Conventions:
  - **Interfaces**: Prefixed with `I` (e.g., `IActiveFilters`, `IVolcanicEruption`)
  - **Types**: Prefixed with `T` (e.g., `TVisualizationType`)

## Core Contexts:
- `*Context`: Manages filters for the API fetches

### Data Flow:
1. User selects filters
2. Contexts update state
3. Custom hooks fetch data from Huwise API
4. Components render updated visualizations

## Adding New Features:
1. **🔍 FIRST**: Search existing codebase for similar functionality
2. **📁 Check**: All `/src/utils/`, `/src/hooks/`, `/src/services/` directories
3. **🔄 Reuse**: Extend existing functions rather than recreating

## 🤖 Figma → code workflow
See `docs/METHODE.md`. In short:
1. Figma inventory first (`/figma-page-inventory`), reviewed by a human before any code.
2. Data matrix (`docs/matrice-modele.xlsx` copied per project): one row per screen in "Mapping viz".
3. One screen at a time with `docs/PROMPT_DEV_ECRAN.md`, validated by its Definition of Done.
   New chart components are built in Storybook first (`npm run storybook`), next to their Figma capture via `FigmaReference`.
4. Project-specific pitfalls go in `docs/PIEGES.md` — read it before coding a screen.

## ⚠️ Lessons learned on previous projects
- **Never assume field names or values are shared between datasets**: check each dataset with `curl` on the live API.
- **Never copy a sibling module's behavior blindly**: re-read its actual code line by line and check Figma + data for the new screen.
- **Figma shows the look, the data matrix decides the behavior** (filter modes, defaults, exceptions).
- **Never kill dev servers with a broad `pkill`** (e.g. `pkill -f "next dev"`): target the exact PID.
- **Dataset ids can be renamed on the Huwise side**: if a working query starts failing, re-check the dataset id first.
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
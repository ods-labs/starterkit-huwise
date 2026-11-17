# 🔧 StarterKit Générique de Visualisation de Données Huwise

## 📋 Vue d'Ensemble

Ce boilerplate est une architecture **complètement générique et data-agnostique** pour créer des applications de visualisation de données interactives. Il utilise un système de **filtres field-value** et des **composants réutilisables** qui s'adaptent automatiquement à n'importe quel dataset.

**🌋 Exemple de démonstration** : Éruptions volcaniques mondiales via l'API Huwise du userclub

## 🏗️ Architecture Générique

### Structure des Fichiers

```
src/
├── types/
│   ├── generic.ts           # Types génériques pour tout dataset
│   └── index.ts             # Point d'entrée des types
├── services/
│   └── genericDataApi.ts    # Service API générique avec SDK Huwise
├── contexts/
│   └── GenericDataContext.tsx # Contexte générique field-value
├── hooks/
│   ├── useGenericData.ts    # Hooks génériques React Query
│   └── useBreakpoint.ts     # Breakpoint responsive courant
├── config/
│   └── colors.js            # Palette du thème (utilisée par tailwind.config.js)
├── components/
│   ├── maps/
│   │   └── GenericMap.tsx   # Carte générique MapLibre
│   ├── charts/
│   │   ├── GenericTimeSeries.tsx # Graphiques Recharts (+ sa story Storybook)
│   │   └── __fixtures__/FigmaReference.tsx # Story : composant à côté de sa capture Figma
│   ├── stats/
│   │   └── GenericStats.tsx # Statistiques génériques
│   ├── filters/
│   │   └── GenericFilter.tsx # Filtres génériques
│   └── ui/
│       └── HTMLContent.tsx  # Rendu de contenu HTML
├── layouts/
│   └── ExternalLayout.tsx   # Header/footer du domaine Huwise
├── external/                # Header/footer générés par npm run build:external (non versionnés)
├── styles/                  # CSS du header/footer (auto-generated.css est généré)
├── utils/                   # Formatage des nombres, chemins, cookies, analytics…
├── analytics/
│   └── PianoAnalytics.js    # Intégration Piano Analytics
└── app/
    ├── layout.js            # Layout racine
    ├── providers.tsx        # Providers (React Query, HeroUI…)
    └── page.tsx             # Page principale (exemple volcanique) + sa configuration
```

## ✨ Fonctionnalités Génériques

### 🔄 **Core Architecture**

1. **Service API Générique avec SDK Huwise**
   - `fetchMap()` : Données géospatiales avec coordonnées
   - `fetchTimeSeries()` : Séries temporelles avec `date_format`
   - `fetchAggregation()` : Agrégations par champ
   - `fetchFieldValues()` : Valeurs uniques pour alimenter les filtres
   - `fetchStats()` : Statistiques globales du dataset

2. **Système de Filtres Field-Value**
   - **Filtres génériques** : `{field: string, value: any}[]`
   - **Contexte générique** : `GenericDataContext`
   - **Méthodes** : `addFilter()`, `removeFilter()`, `updateFilter()`
   - **Aucun filtre hardcodé** - complètement dynamique

3. **Composants Data-Agnostiques**
   - `GenericMap` : Carte interactive MapLibre (gère `{lat, lon}`)
   - `GenericTimeSeries` : Graphique temporel Recharts (BarChart)
   - `GenericStats` : Affichage dynamique de statistiques
   - `GenericFilter` : Filtres auto-générés via `fetchFieldValues`

4. **Hooks Génériques React Query**
   - `useMapData()` : Points géographiques
   - `useTimeSeriesData()` : Données temporelles
   - `useFieldValues()` : Options de filtres
   - `useOverallStats()` : Statistiques dataset
   - Cache optimisé et gestion d'erreurs

### ⚙️ **Configuration Only**

**Seule la configuration change selon le dataset** (dans l'exemple, en tête de `src/app/page.tsx`) :

```typescript
const DATA_SOURCE_CONFIG: IDataSourceConfig = {
  baseUrl: 'https://userclub.opendatasoft.com',
  datasetId: 'les-eruptions-volcaniques-dans-le-monde',
  fields: {
    coordinates: 'coordinates',  // Champ coordonnées
    timestamp: 'year',           // Champ temporel
    label: 'volcano_name'        // Champ d'affichage
  }
};

const FILTER_CONFIG = [
  { field: 'country', label: '🌍 Country', type: 'select' },
  { field: 'status', label: '💥 Status', type: 'select' },
  { field: 'flag_tsunami', label: '🌊 Tsunami', type: 'checkbox' }
];
```

## 🌋 Exemple : Éruptions Volcaniques Mondiales

### Dataset de Démonstration
- **API** : Huwise UserClub
- **Dataset** : `les-eruptions-volcaniques-dans-le-monde`
- **Format Coordonnées** : `{lat: 37.12, lon: 139.97}`
- **Champ Temporel** : `year` (groupé avec `date_format(year, "YYYY")`)

### Visualisations Implémentées

1. **🗺️ Carte Interactive (MapLibre)**
   - Points géographiques simples et performants
   - Gestion automatique des coordonnées `{lat, lon}`
   - Popups informatifs au clic
   - Auto-zoom sur les données

2. **📊 Statistiques Dynamiques**
   - Affichage automatique de `totalRecords`
   - Statistiques additionnelles du dataset
   - Layout responsive et coloré

3. **📈 Série Temporelle (Recharts)**
   - BarChart des éruptions par année
   - Utilise `date_format(year, "YYYY")` pour grouper
   - Tri automatique par date
   - Tooltip interactif

4. **🔍 Filtres Dynamiques Auto-Générés**
   - **Pays** : `fetchFieldValues('country')`
   - **Type de volcan** : `fetchFieldValues('volcano_type')`  
   - **Statut** : `fetchFieldValues('status')`
   - **Tsunami** : Checkbox boolean
   - Options "Toutes les valeurs" automatiques

## 🚀 Utilisation

### Démarrage Rapide

1. **Installation des dépendances**
   ```bash
   npm install
   ```

2. **Configuration**
   ```bash
   cp .env.dist .env   # puis renseigner NEXT_PUBLIC_HUWISE_API_URL et NEXT_PUBLIC_HUWISE_API_KEY
   npx playwright install chromium   # une fois par machine, pour npm run screenshot
   ```

3. **Lancement en développement**
   ```bash
   npm run dev
   ```

4. **Accès à l'exemple**
   - Ouvrez `http://localhost:3000/`

### Scripts

| Commande | Rôle |
|---|---|
| `npm run dev` | app en développement (génère d'abord le header/footer du domaine Huwise) |
| `npm run dev:fast` | idem sans régénérer le header/footer (nécessite un `build:external` antérieur) |
| `npm run build` | build de production |
| `npm run storybook` | Storybook sur `http://localhost:6006`, pour développer les composants isolément |
| `npm run build-storybook` | build statique de Storybook |
| `npm run screenshot -- <chemin> <fichier.png> [--selector <css>]` | capture d'une page de l'app (Playwright) + relevé des erreurs console |

## 🤖 Développer un projet avec Claude (Figma → code)

Le starter embarque une méthode de développement assistée par Claude Code, rodée sur les
projets précédents : **inventaire Figma relu, puis matrice de données vérifiée sur l'API, puis
un écran à la fois**. Le détail est dans [`docs/METHODE.md`](docs/METHODE.md).

1. **Inventaire Figma** — dans Claude Code : `/figma-page-inventory <URL du fichier Figma>`
   (MCP Figma connecté). Produit `docs/figma-inventory/`, à relire avant tout code.
2. **Matrice de données** — copier [`docs/matrice-modele.xlsx`](docs/matrice-modele.xlsx) en
   `docs/<projet>-matrice.xlsx` et la remplir à partir de l'API (une ligne par écran dans
   « Mapping viz »). Envoyer les questions client au fil de l'eau.
3. **Composants** — un composant par type de visualisation, développé dans Storybook à côté de
   sa capture Figma (`FigmaReference`).
4. **Écrans** — remplir et coller [`docs/PROMPT_DEV_ECRAN.md`](docs/PROMPT_DEV_ECRAN.md) dans
   Claude Code, un écran à la fois, jusqu'à ce que sa Definition of Done passe.

Les pièges propres au projet vont dans [`docs/PIEGES.md`](docs/PIEGES.md) ; les améliorations de
la méthode elle-même se remontent dans le starter kit.


## 📦 Dépendances Principales

### Core Framework
- **React 18** : Framework UI principal
- **Next.js 15** : Framework React full-stack avec App Router
- **TypeScript** : Typage statique pour la robustesse

### Data & API
- **@opendatasoft/api-client** : SDK officiel Huwise pour les requêtes
- **@tanstack/react-query** : Gestion d'état serveur, cache et synchronisation

### Visualisation & UI
- **@vis.gl/react-maplibre** : Cartes interactives modernes et performantes
- **maplibre-gl** : Moteur de rendu cartographique
- **recharts** : Bibliothèque de graphiques déclarative pour React
- **@heroui/react** : Composants UI modernes et accessibles
- **Tailwind CSS** : Framework CSS utilitaire

### Outillage de développement
- **Storybook 10** (`@storybook/nextjs-vite`) : développement et revue des composants isolés
- **Playwright** : captures d'écran et relevé des erreurs console (`npm run screenshot`)

## 🚀 Fonctionnalités Avancées

### Système de Cache Intelligent
- **React Query** : Cache automatique avec invalidation intelligente
- **Stale Times** : 10min (map), 15min (timeseries), 1h (field values)
- **Background Refresh** : Données actualisées en arrière-plan
- **Optimistic Updates** : Interface réactive même avec filtres lents

### Performance & Optimisation
- **Lazy Loading** : Composants chargés à la demande
- **Debounced Filters** : Évite les requêtes excessives lors du typage
- **Memoization** : Calculs optimisés avec `useMemo` et `useCallback`
- **Bundle Splitting** : Code splitting automatique par route

### Gestion d'Erreurs Robuste
- **Retry Logic** : Nouvelle tentative automatique en cas d'échec
- **Fallbacks** : Interfaces de secours pour données indisponibles
- **Error Boundaries** : Isolation des erreurs par composant
- **Loading States** : États de chargement cohérents dans toute l'app

---

## ⚠️ Limites
- 
- **APU Huwise uniquement** : Ne supporte que les APIs Huwise
- **Pas de CRUD** : Lecture seule, pas de modification de données
- **Pas d'authentification** : Conçu pour données publiques uniquement

---

**✨ Ce boilerplate offre une base solide et extensible pour créer rapidement des applications de visualisation de données avec React, TypeScript et Next.js !**

**🔗 Pour commencer : `npm install && npm run dev`**

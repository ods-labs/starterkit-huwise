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
│   └── useGenericData.ts    # Hooks génériques React Query
├── config/
│   └── genericConfig.ts     # Configuration générique
├── components/
│   ├── maps/
│   │   └── GenericMap.tsx   # Carte générique MapLibre
│   ├── charts/
│   │   └── GenericTimeSeries.tsx # Graphiques Recharts
│   ├── stats/
│   │   └── GenericStats.tsx # Statistiques génériques
│   └── filters/
│       └── GenericFilter.tsx # Filtres génériques
└── app/
    ├── page.tsx             # Page principale (exemple volcanique)
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

**Seule la configuration change selon le dataset :**

```typescript
const DATA_SOURCE_CONFIG: IDataSourceConfig = {
  baseUrl: 'https://userclub.opendatasoft.com',
  datasetId: 'les-eruptions-volcaniques-dans-le-monde',
  fields: {
    coordinates: 'coordinates',  // Champ coordonnées
    timestamp: 'date',           // Champ temporel  
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
- **Champ Temporel** : `date` (formaté avec `date_format(date, "YYYY")`)

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
   - Utilise `date_format(date, "YYYY")` pour grouper
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

2. **Lancement en développement**
   ```bash
   npm run dev
   ```

3. **Accès à l'exemple**
   - Ouvrez `http://localhost:3000/`


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

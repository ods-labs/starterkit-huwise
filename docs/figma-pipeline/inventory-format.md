# Format de l'inventaire Figma (étape 1)

Le livrable de cette étape EST l'artefact de revue humaine — pas un contrat machine
intermédiaire — donc le format est du Markdown scannable en quelques secondes, pas du
JSON à parser.

Produit par le skill [`figma-page-inventory`](../../.claude/skills/figma-page-inventory/SKILL.md)
dans `docs/figma-inventory/`.

## Arborescence

```
docs/figma-inventory/
├── INDEX.md
├── visualizations.md
├── visualizations/
│   ├── carte-choroplèthe.png
│   ├── courbe-multi-series.png
│   └── ...
└── exemple-page/
    ├── exemple-page.md
    └── screens/
        ├── exemple-ecran-chiffres.png
        └── ...
```

## `INDEX.md`

Un tableau par fichier Figma crawlé, plus une checklist de revue à remplir par un
humain avant toute étape suivante du pipeline.

```markdown
# Inventaire Figma — <nom du projet>

Fichier : `<fileKey>` — crawlé le <date>

| Page              | Fichier                                   | Sections | Écrans |
|--------------------|-------------------------------------------|----------|--------|
| Exemple page A     | [exemple-page-a/](./exemple-page-a/exemple-page-a.md) | 3 | 11 |
| Exemple page B     | [exemple-page-b/](./exemple-page-b/exemple-page-b.md) | 2 | 6      |

## Checklist de revue humaine (bloquant)

- [ ] Toutes les pages du fichier Figma sont listées ci-dessus
- [ ] Pour chaque page, les sections et écrans correspondent à ce qui est visible dans Figma
- [ ] Le catalogue `visualizations.md` couvre tous les types de graphique/carte rencontrés
- [ ] Les captures d'écran sont présentes et lisibles pour chaque écran/type de viz
- [ ] Relecteur : ______________________ Date : __________
```

## `<page-slug>/<page-slug>.md`

Un en-tête de page, puis un tableau par section Figma.

```markdown
# Exemple page A

Node Figma `<nodeId>` — https://www.figma.com/design/<fileKey>/... — crawlé le <date>

## Section : Exemple section

| Écran | Onglet/sous-nav | Filtres & toggles actifs | Type de viz | Capture | Notes |
|-------|------------------|---------------------------|-------------|---------|-------|
| exemple-ecran-chiffres | Chiffres clés | Période | kpi-chiffre-cle | [screens/exemple-ecran-chiffres.png](./screens/exemple-ecran-chiffres.png) | — |
| exemple-ecran-evolution | Évolution | Période, toggle comparaison | courbe-multi-series | [screens/exemple-ecran-evolution.png](./screens/exemple-ecran-evolution.png) | — |

**Fusions** (combinaisons collapsées, avec justification) :
- Toggle "comparée/historique" non énuméré séparément pour l'écran évolution : même mise en page, seules les valeurs affichées changent.

**Questions ouvertes :**
- Le toggle sur l'écran X a un nom de composant Figma générique déjà vu ailleurs avec un sens différent — à confirmer.

## Section : Exemple autre section
...
```

## `visualizations.md`

Catalogue plat, un type de visualisation par ligne, référencé par ID depuis les
tableaux de section ci-dessus.

```markdown
# Catalogue des visualisations

| ID viz | Description / critères distinctifs | Vu dans (page > section > écran) | Capture |
|--------|--------------------------------------|-----------------------------------|---------|
| kpi-chiffre-cle | Nombre clé unique avec variation vs période précédente | Exemple page A > Exemple section > exemple-ecran-chiffres | [visualizations/kpi-chiffre-cle.png](./visualizations/kpi-chiffre-cle.png) |
| courbe-multi-series | Courbe temporelle, plusieurs séries superposées, légende couleur | Exemple page A > Exemple section > exemple-ecran-evolution | [visualizations/courbe-multi-series.png](./visualizations/courbe-multi-series.png) |
| carte-choroplèthe | Carte géographique, palette séquentielle par zone | Exemple page A > Exemple autre section > ... | [visualizations/carte-choroplèthe.png](./visualizations/carte-choroplèthe.png) |
```

## Conventions

- `page-slug` : kebab-case ASCII dérivé du nom de la page Figma.
- `Écran` : identifiant kebab-case stable, unique dans le fichier de page.
- `Filtres & toggles actifs` : texte libre, pas une liste fermée — décrire ce qui est
  réellement sélectionné sur CET écran.
- `Type de viz` : renvoie à un `ID viz` de `visualizations.md` ; inventer un nouvel ID
  si aucun type existant ne correspond, ne pas forcer une correspondance approximative.

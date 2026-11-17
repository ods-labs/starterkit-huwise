# Méthode Figma → code avec Claude

Rien n'est codé tant que l'inventaire Figma et la matrice de données ne sont pas relus par un
humain. Ensuite, chaque écran se développe avec le même prompt et se valide sur la même
Definition of Done.

| Étape | Outil | Produit |
|---|---|---|
| 1. Préparer le repo | `npm install`, `npx playwright install chromium`, `.env` depuis `.env.dist`, MCP Figma connecté (`/mcp`) | app qui lit l'API du client, `npm run screenshot` opérationnel |
| 2. Inventorier le Figma | skill `/figma-page-inventory <URL du fichier Figma>` | `docs/figma-inventory/` (relu, checklist de `INDEX.md` cochée) |
| 3. Construire la matrice | copie de `docs/matrice-modele.xlsx` | `docs/<projet>-matrice.xlsx`, questions client envoyées |
| 4. Poser les fondations | thème, layout, contexte de filtres, couche data ; un composant par type de `visualizations.md`, validé dans Storybook (`npm run storybook`) à côté de sa capture Figma | composants réutilisés par tous les écrans |
| 5. Développer un écran | `docs/PROMPT_DEV_ECRAN.md`, collé dans Claude Code | écran validé par la Definition of Done |

## Où va quoi

| Fichier | Contenu | Spécifique au projet ? |
|---|---|---|
| `.claude/skills/figma-page-inventory/` | skill d'inventaire Figma | non |
| `docs/figma-pipeline/inventory-format.md` | format de l'inventaire | non |
| `docs/PROMPT_DEV_ECRAN.md` | méthode de dev d'un écran + pièges génériques | non, sauf la section ⚙️ PROJET |
| `docs/matrice-modele.xlsx` | modèle vide de matrice | non |
| `.storybook/`, `src/components/charts/__fixtures__/FigmaReference.tsx` | Storybook et comparaison côte à côte avec la capture Figma | non |
| `docs/PIEGES.md` | pièges découverts sur ce projet | **oui** |
| `docs/figma-inventory/`, `docs/<projet>-matrice.xlsx` | inventaire et matrice remplis | **oui** |

Une amélioration de la méthode (skill, prompt, modèle de matrice, piège générique) se fait
dans le starter kit pour profiter aux projets suivants. Ce qui ne concerne qu'un client reste
dans `docs/PIEGES.md`, la matrice et l'inventaire du projet.

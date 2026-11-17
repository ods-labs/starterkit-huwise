# Prompt — développer un écran (pixel-perfect + vraies données)

Copie ce prompt dans Claude Code, remplis le bloc **🎯 ÉCRAN À DÉVELOPPER**, et lance.

Ce fichier est **générique** : il décrit la méthode, valable sur tout projet issu du starter
kit. **Ne pas y écrire les pièges propres au projet** : ils vont dans `docs/PIEGES.md`, que ce
prompt fait lire avant de coder. Une amélioration de la méthode elle-même (valable pour tous
les projets) peut, elle, être remontée dans le starter kit.

Avant la première utilisation sur un projet, remplir les 3 valeurs de la section
**⚙️ PROJET** ci-dessous.

---

## 🎯 ÉCRAN À DÉVELOPPER (à remplir)

- **Écran (id de l'inventaire)** : _(ex. `exemple-ecran-evolution`)_
- **Page / rubrique** : _(ex. nom du regroupement produit)_
- **Bloc** : _(section de la page)_
- **Variante** : _(ex. filtre/thème principal, s'il y en a un)_
- **Onglet(s)** : _(ex. Chiffres clés / Évolution / Cartographie — adapter au découpage réel)_

## ⚙️ PROJET (à remplir une fois par projet)

- **Figma** : `fileKey` = _(ex. `9hYzfKYfV0aUHt8wjDe6V7`)_
- **Matrice de données** : _(chemin, ex. `docs/<projet>-matrice.xlsx`, copiée depuis `docs/matrice-modele.xlsx`)_
- **Domaine Huwise** : _(ex. `https://<client>.huwise.com`, à reporter dans `.env`)_

---

## Rôle & objectif

Tu es développeur React/Next expert sur ce dashboard. Développe l'écran ci-dessus **fidèle au
pixel** à la maquette Figma **et** branché sur les **vraies données**. Aucune valeur mockée.

Lis d'abord `CLAUDE.md` (conventions du repo) puis `docs/PIEGES.md` (pièges déjà découverts sur
ce projet) avant de coder.

## Sources de vérité (à consulter AVANT de coder)

1. **Matrice de données** (voir ⚙️ PROJET) :
   - feuille **Mapping viz** : la ligne de cet écran donne le dataset id, les champs affichés,
     le WHERE/GROUP BY ODSQL et l'unité ;
   - feuille **Champs** : rôle et valeurs brutes de chaque champ du dataset, avec ses pièges ;
   - feuille **Filtres** : valeurs, valeur par défaut, mode mono/multi-select et exceptions.
     **C'est la matrice qui décide du comportement d'un filtre, pas Figma** (voir pièges
     génériques) ;
   - feuille **Questions client** : vérifier qu'aucune question ouverte ne bloque cet écran.

   Si l'écran n'a pas de ligne dans la matrice : s'arrêter et le signaler, ne pas deviner le
   dataset. Toujours revérifier les champs en live sur l'API (§A) — la matrice peut être en
   retard sur un changement de schéma.
2. **Design Figma** — dans cet ordre :
   - **D'abord** : la capture de l'inventaire (skill `figma-page-inventory`) dans
     `docs/figma-inventory/<page-slug>/screens/<écran>.png`. Faire un `ls` du dossier si le nom
     exact est incertain. C'est la référence visuelle principale — ne pas sauter cette étape.
   - **Lire aussi `docs/figma-inventory/<page-slug>/<page-slug>.md`**, pas seulement les
     captures : il contient le type de viz par écran, les node ids exacts, les fusions de
     combinaisons et surtout les **Questions ouvertes** (ambiguïtés déjà repérées, ex. un type
     de graphique pas encore confirmé par le designer). Une question ouverte encore sans
     réponse sur cet écran = le signaler avant de coder, pas l'interpréter.
   - **Puis** MCP Figma sur le node exact de l'écran (`fileKey` : voir ⚙️ PROJET) :
     - `get_metadata`/`get_screenshot` pour repérer le node de l'écran.
     - `get_design_context(nodeId, fileKey)` → CSS/typo/structure.
     - `get_variable_defs(nodeId, fileKey)` → tokens couleur.
     - `download_assets(nodeId, defaultFormat:svg)` → icônes exactes. NE PAS approximer.
   - ⚠️ Toujours fetch le node Figma EXACT de l'écran (jamais approximer depuis un node
     voisin/similaire) — un même composant peut avoir des variantes visuellement proches mais
     pixel-différentes (bordure, padding, couleur) selon l'écran.
3. **Clé API** dans `.env` (`NEXT_PUBLIC_HUWISE_API_KEY` / `NEXT_PUBLIC_HUWISE_API_URL`, à créer
   depuis `.env.dist`, jamais versionné). Datasets privés → auth par en-tête
   `Authorization: Apikey $KEY`. **Un 401/404 sans clé ne prouve rien.**

## Architecture (couches — ne pas court-circuiter)

```
Service    src/services/genericDataApi.ts   construit la requête + appelle l'API, 100 % CSR
  GenericDataApiService (1 instance/dataset) — fetchMap · fetchTimeSeries ·
  fetchAggregation · fetchFieldValues · fetchStats
        ▼
Hooks      src/hooks/useGenericData.ts   React Query (cache, enabled, loading/error)
  useMapData · useTimeSeriesData · useAggregationData · useFieldValues · useOverallStats
        ▼
Contexte   src/contexts/GenericDataContext.tsx   filtres actifs (PAS de state local par panel)
        ▼
Composants src/components/{charts,maps,stats,filters}/   présentation (Generic* = squelette de départ)
```

⚠️ **`GenericDataApiService`/`useGenericData.ts`/les composants `Generic*` sont le squelette du
starter kit (champs de démo), pas un contrat figé.** Réutilise le *pattern* (factory de service,
hooks React Query lisant le contexte, `queryKey` complet), adapte les *détails* (dataset_id,
champs select/group_by réels, forme du composant) au domaine de données du projet. Si la forme
d'une requête ne colle pas au générique, étends le service / ajoute un hook dédié plutôt que de
forcer un mapping artificiel.

## Méthode

### A. Couche data — d'abord se demander : config ou nouvelle méthode/hook ?

**Une nouvelle méthode de service / un nouveau hook seulement si la _forme de requête_ est
nouvelle — pas parce que l'écran/dataset est nouveau.** Même forme (valeur agrégée à une
période = KPI, série temporelle, liste de valeurs distinctes) → réutiliser
`GenericDataApiService`/`useGenericData.ts` tel quel avec une config différente. Forme nouvelle
(carte à seuils, histogramme empilé par sous-catégorie…) → étendre le service + créer le hook
correspondant.

**Toujours vérifier les champs réels en live AVANT de coder** (ne jamais supposer un nom de
champ depuis une maquette ou un exemple) :
```bash
KEY=$(grep NEXT_PUBLIC_HUWISE_API_KEY .env | cut -d= -f2); AUTH=(-H "Authorization: Apikey $KEY")
R="$(grep NEXT_PUBLIC_HUWISE_API_URL .env | cut -d= -f2)/api/explore/v2.1/catalog/datasets/<dataset>/records"
curl -s "${AUTH[@]}" --data-urlencode "group_by=<champ>" --data-urlencode "where=<...>" -G "$R"
```
**Compte les lignes par clé d'affichage** pour détecter un fan-out (une dimension cachée —
catégorie, genre, zone… — non filtrée qui multiplie les lignes et fait retenir une valeur
arbitraire dans une logique "dernier gagné").

### B. UI pixel-perfect — réutiliser l'existant
- **Avant de créer un graphique, chercher dans `src/components/charts/`** et ses
  `*.stories.tsx` (usage exact de chaque prop) : un composant existant à brancher sur les vraies
  données vaut mieux qu'un nouveau. Le type de viz de l'écran (inventaire) renvoie au catalogue
  `docs/figma-inventory/visualizations.md`.
- **Nouveau composant de présentation → d'abord en Storybook, puis branché sur les données** :
  1. Créer le composant (props = données déjà mises en forme, aucune requête dedans) et sa
     story `<Composant>.stories.tsx` à côté.
  2. Envelopper le rendu de la story dans `<FigmaReference id="<viz-id>">`
     (`src/components/charts/__fixtures__/FigmaReference`) : la capture
     `docs/figma-inventory/visualizations/<viz-id>.png` s'affiche à côté du composant.
  3. Caler les données de la story sur les valeurs visibles de la maquette, pour comparer au
     pixel. Ajouter une story avec des ordres de grandeur réels (tirés d'un `curl`) pour
     vérifier que le composant tient avec les vraies données.
  4. Valider dans `npm run storybook` (port 6006), puis seulement brancher sur la couche data.
- Un composant existant presque adapté → ajouter un prop **avec une valeur par défaut qui garde
  le comportement actuel** (ex. `showLegend`, `valueDecimals`), plutôt que de le dupliquer.
- Autres composants : `src/components/maps/`, `src/components/stats/`, `src/components/filters/`
  (renommer/spécialiser les `Generic*` au fil des écrans réels, plutôt que d'empiler des
  composants ad hoc à côté).
- **Couleurs** : tokens `src/config/colors.js` uniquement (jamais de hex en dur).
- Types dans `src/types/` (`I…`/`T…`, voir `src/types/generic.ts` comme point de départ).

## Pièges génériques (valables sur tout projet Huwise — tirés des projets précédents)

Les pièges **propres au projet** sont dans `docs/PIEGES.md` : les lire, et y ajouter tout
nouveau piège découvert pendant cet écran avant de terminer.

**Données**
- [ ] Dataset privé → auth par en-tête ; jamais conclure "bloqué data" sur un 401/404 **sans**
      clé API.
- [ ] **Noms ET valeurs de champs diffèrent d'un dataset à l'autre**, même dans une même
      famille : `"Hommes"/"Femmes"/"Tous"` sur l'un, `"Homme"/"Femme"` sans `"Tous"` sur
      l'autre. Ne jamais réutiliser une constante de filtre (genre, âge, territoire) sans
      revérifier sur le dataset cible.
- [ ] **Pas de valeur `"Tous"` en base** → "Tous" côté UI = agrégation (`group_by` + `sum()`,
      champ omis du `where`), pas un `where champ="Tous"` qui ne matche rien.
- [ ] **Valeur brute ≠ libellé** : vérifier la valeur exacte d'un champ texte via `curl` avant
      une comparaison stricte (ex. `"Ile-de-France"` sans accent en base). Une comparaison qui
      échoue ne lève pas d'erreur, la donnée disparaît silencieusement. Corriger l'orthographe
      à l'affichage seulement.
- [ ] **Forme réelle de la réponse API** : un alias peut ne pas être appliqué (ex.
      `select=year(date) as year` renvoie la clé `"year(date)"`). Vérifier la réponse via
      `curl` avant de typer l'interface TS.
- [ ] **Granularités qui dépendent d'une autre dimension** (ex. tranches d'âge différentes selon
      le niveau géo) : le filtre doit se repeupler au changement, et une comparaison sans
      équivalent doit se masquer, pas se recomposer.
- [ ] **Nom de champ trompeur** : un champ peut porter un nom contraire à l'indicateur qu'il
      contient. Toujours passer par la table de correspondance de la matrice, jamais déduire le
      champ du libellé.
- [ ] **Total ≠ somme des parts** quand les sous-catégories se chevauchent : ne pas en faire un
      test de cohérence sans le vérifier.
- [ ] **Unité affichée vs unité brute** : ne jamais appliquer de facteur d'échelle (×100 pour
      des %, "pour 100 000"…) sans confirmation ; l'ordre de grandeur ne suffit pas. Unité non
      confirmée → la laisser vide plutôt que la deviner. Un libellé d'unité seulement pour un
      vrai taux, pas pour un simple comptage.
- [ ] **Sélecteur qui change de champ, pas de valeur** : certaines options de filtre
      correspondent à des champs différents (à sommer dans le `select`), pas à un `where`.
- [ ] Un champ présent sur un dataset de la famille peut manquer sur un autre — ne jamais
      généraliser depuis un seul dataset testé.

**Maquette**
- [ ] **Figma montre le rendu, la matrice décide du comportement.** L'absence d'une variante
      Figma (ex. pas de maquette multi-select pour un chapitre) n'est pas une règle produit :
      vérifier dans la feuille Filtres.
- [ ] Un écran qui semble utiliser un nouveau type de graphique peut être un composant existant
      à une autre échelle ou densité. Vérifier avant d'inventer un composant.
- [ ] Deux indicateurs sous un même sélecteur n'ont pas forcément le même gabarit de viz (ni
      les mêmes toggles) : vérifier chaque indicateur dans l'inventaire.
- [ ] Un comportement non déductible de la maquette statique (drill-down vs filtre, onglet
      grisé…) se confirme auprès de l'équipe maquette, et s'ajoute aux Questions client.

**Technique (stack du starter)**
- [ ] `npm run dev:fast` échoue (`Module not found: '@/external'`) et Storybook échoue
      (`Can't resolve '../styles/auto-generated.css'`) tant que `npm run build:external` n'a pas
      tourné une fois (`npm run dev` et `npm run storybook` le lancent eux-mêmes).
- [ ] Recharts `<YAxis domain={[0, max]} tickCount={5}>` désynchronise silencieusement les
      barres et les graduations. Avec un `domain` explicite, passer un tableau `ticks` explicite
      au lieu de `tickCount`.
- [ ] Recharts anime les barres au montage : attendre ~1-2 s avant une capture ou une lecture
      DOM, sinon on compare des barres à moitié dessinées.
- [ ] `toLocaleString('fr-FR')` sépare les milliers par une espace fine (U+202F), quasi invisible
      en très petite taille : prévoir une variante avec espace insécable normale (U+00A0) pour
      ces contextes, sans changer le formatage global.
- [ ] Vérification DOM : scoper la requête au module visé. Un sélecteur générique renvoie le
      premier match de la page, souvent celui d'un autre module, avec une valeur plausible mais
      fausse.

## Definition of Done (vérification obligatoire)
1. `npx tsc --noEmit` : pas de **nouvelle** erreur sur les fichiers touchés.
2. App lancée (`npm run dev`/`dev:fast`), **capture de l'écran** avec
   `npm run screenshot -- <chemin> <fichier.png> [--selector <css>]` (Playwright, attend 1,5 s
   la fin des animations), puis comparaison à la capture de l'inventaire et à l'export du node
   Figma (typo, couleurs, espacements, icônes). Préférer `--selector` sur le module de l'écran à
   une capture de page entière.
3. **Aucune valeur mockée** : recouper les nombres affichés avec un `curl` (en tenant compte de
   tout facteur d'échelle affiché vs brut).
4. Zéro erreur console : `npm run screenshot` les liste et sort en code 1 s'il y en a.
5. Nouveaux pièges ajoutés à `docs/PIEGES.md` ; nouvelles questions ajoutées à la feuille
   Questions client de la matrice.

## À NE PAS faire
- Deviner la mise en page depuis le composant générique sans regarder le node Figma.
- Deviner un dataset ou un champ absent de la matrice.
- Créer un hook/une méthode de service quand une simple config suffit (cf. règle §A).
- Inventer un toggle/filtre/texte/libellé : reprendre les libellés exacts du node.
- Mettre une couleur/valeur en dur, ou une donnée mockée.
- Conclure « bloqué data » sur un 401/404 **sans** clé API.
- Écrire un piège propre au projet dans ce fichier (→ `docs/PIEGES.md`).

---
name: figma-page-inventory
description: Parcourt un fichier Figma entier et produit un catalogue Markdown court (pages → sections → écrans, plus un catalogue plat des types de visualisation), avec captures d'écran à l'appui — l'étape 1 (inventaire) du pipeline Figma→code. Utiliser quand l'utilisateur veut inventorier, auditer ou cataloguer un fichier Figma avant développement, ou invoque explicitement /figma-page-inventory.
---

# Inventaire Figma (étape 1 du pipeline Figma→code)

Produit `docs/figma-inventory/` : un index, un fichier Markdown par page Figma, et un
catalogue plat des types de visualisation — voir
[`docs/figma-pipeline/inventory-format.md`](../../../docs/figma-pipeline/inventory-format.md)
pour le détail des colonnes et un exemple rempli.

**Scope : ce skill ne produit que l'inventaire.** Il n'écrit jamais de code applicatif,
ne touche jamais à `src/`, et ne devine jamais un vrai champ/dataset ou un hook de
données réel — ça, c'est le travail d'étapes séparées (matrice de données puis
`docs/PROMPT_DEV_ECRAN.md`, voir `docs/METHODE.md`).

**Ne présumer aucune contrainte d'architecture du projet cible** (notion de région,
de filtre, de routing…) : décrire fidèlement ce qui est visible dans le Figma, sans
plaquer les conventions d'un autre projet. Si le projet a des contraintes d'architecture
connues (ex. un scope géographique fixe, un existant à ne pas casser), elles vivent dans
le `CLAUDE.md` du projet cible, pas dans ce skill générique.

## Prérequis

- Charger le skill `figma-design-to-code` en premier si besoin de `get_design_context`
  pour désambiguïser un nœud précis — ce skill utilise surtout `get_metadata`/
  `get_screenshot`.
- Confirmer que le serveur MCP Figma est connecté (un `get_metadata` ou `get_screenshot`
  qui réussit sur le fichier cible suffit à le confirmer).

## Entrée

Une URL ou une clé de fichier Figma (`figmaFileKey`) — **le fichier entier**, pas une
seule page. Exemple : `https://www.figma.com/design/<fileKey>/<nom-du-fichier>`.

## Procédure

### 1. Lister les pages du fichier

Appeler `get_metadata` à la racine du fichier pour lister les pages Figma de premier
niveau (les "pages" au sens Figma — pas les écrans de l'application). Comme toujours
avec cet outil, **ne jamais lire le résultat brut au-delà de ~20k caractères** : le
sauvegarder dans un fichier et le parser par script :

```python
import xml.etree.ElementTree as ET
tree = ET.parse('metadata.xml')
root = tree.getroot()
for child in root:
    print(child.tag, child.attrib.get('id'), child.attrib.get('name'))
```

### 2. Fan-out d'un agent par page Figma (parallèle)

Pour chaque page Figma réelle (exclure les pages d'annotation/brouillon type "🗑
Archive" ou "Cover"), lancer un `Agent` en parallèle (un seul message, plusieurs
appels d'outil), chacun chargé de :

1. `get_metadata` sur sa page, parsé de la même façon (fichier + script), pour
   énumérer ses sections (cadres de premier niveau contenant du contenu réel).
2. Pour chaque section : `get_screenshot` sur la section entière d'abord (vue
   composite), pour une vue d'ensemble rapide de ce qui est visuellement présent.
3. `get_screenshot` sur des écrans/instances individuels seulement quand la vue
   composite ne suffit pas à lire un texte ou un état de toggle — **la capture
   d'écran est la seule vérité, jamais le texte de métadonnées** (les nœuds de texte
   d'instance Figma contiennent fréquemment des placeholders littéraux comme
   `"[titre]"`).
4. **Règle de collapse cartésien** (le cœur de cette étape) : pour chaque combinaison
   onglet × filtre × toggle rencontrée, ne l'enregistrer comme ligne distincte du
   tableau que si elle change la mise en page, le type de graphique, ou les widgets
   visibles. Si un toggle ne change que les valeurs affichées sans rien changer
   d'autre visuellement, fusionner en une seule ligne et noter ce qui a été fusionné
   et pourquoi (dans la liste "Fusions" du fichier de section, jamais silencieusement).
   Objectif : éviter l'explosion combinatoire tout en restant honnête sur ce qui a
   été regroupé, pour que la revue humaine puisse contester un regroupement trop
   agressif.
5. **Une capture dédiée par ligne `Écran` gardée distincte** — règle dure, pas une
   suggestion : toute ligne qui survit à la règle de collapse cartésien (étape 4)
   ci-dessus, c'est-à-dire toute ligne qui N'A PAS été fusionnée dans "Fusions", doit
   avoir dans sa colonne `Capture` un lien vers une image qui isole CET écran précis
   (obtenue via `get_screenshot` sur le node de ce frame individuel, pas sur la
   section entière). La capture composite de l'étape 2 n'est qu'une aide de repérage
   interne à l'agent — **elle ne doit jamais atterrir dans la colonne `Capture` de
   plus d'une ligne du tableau final.** Deux lignes distinctes ne peuvent partager un
   même lien `Capture` que dans un seul cas : une identité visuelle confirmée avec un
   écran d'une autre section déjà capturé individuellement (jamais avec un composite),
   et alors la note doit le dire explicitement (ex. "Capture partagée avec
   `<autre-écran>`, identité visuelle confirmée") — jamais silencieusement. En fin de
   section, avant d'écrire le fichier, relire son propre tableau et vérifier qu'aucun
   chemin de capture n'apparaît sur plus d'une ligne sans une telle note.
6. Écrire son propre fichier `docs/figma-inventory/<page-slug>/<page-slug>.md`
   (un tableau par section, voir format ci-dessous) et son propre dossier
   `docs/figma-inventory/<page-slug>/screens/*.png` — fragment autonome, aucun
   conflit d'écriture entre agents parallèles.

Si le fichier ne contient qu'une seule page réelle, sauter le fan-out et faire ce
travail en ligne.

### 3. Catalogue des visualisations (passe finale, globale)

Une fois tous les agents de page revenus, l'agent principal :

- Relit les captures déjà prises (pas de nouveau crawl Figma) et regroupe les types
  de visualisation distincts observés sur l'ensemble du fichier (ex. carte nationale,
  carte régionale, histogramme simple, histogramme multi-séries, courbe simple,
  courbe multi-séries, bulles, radar, polaire, infographie, etc.) — vocabulaire libre,
  ne pas présumer une liste fermée.
- Écrit `docs/figma-inventory/visualizations.md` : catalogue plat (pas de nesting —
  le nesting par page/section vit déjà dans les fichiers de page), avec pour chaque
  type une capture représentative copiée depuis une capture de page déjà prise
  (`docs/figma-inventory/visualizations/<viz-id>.png`), en ne prenant une capture
  fraîche que si aucune capture existante n'isole proprement le widget.
- Chaque ligne des tableaux de section (étape 2) référence l'ID du type de
  visualisation correspondant dans ce catalogue.

### 4. Écrire l'index et résumer

- Écrire `docs/figma-inventory/INDEX.md` : fichier Figma crawlé, date, une ligne par
  page (nom, lien vers son fichier, compteurs sections/écrans), et une **checklist de
  revue humaine** vide à remplir (voir format ci-dessous).
- Résumer à l'utilisateur : nombre de pages, sections, écrans, types de visualisation,
  et toute question ouverte notée pendant le crawl (lister, pas seulement compter).
- **Rappel explicite : ceci est une porte de validation humaine bloquante.** Ne
  jamais enchaîner automatiquement sur une autre étape du pipeline (coquille vide,
  développement de visualisation, etc.), même si la demande initiale de l'utilisateur
  semblait l'impliquer. Attendre que l'INDEX.md soit revu et coché par un humain.

## Format de sortie

Voir [`docs/figma-pipeline/inventory-format.md`](../../../docs/figma-pipeline/inventory-format.md)
pour les conventions de colonnes exactes et un exemple rempli. En résumé :

```
docs/figma-inventory/
├── INDEX.md                  # crawl + compteurs + checklist de revue humaine
├── visualizations.md         # catalogue plat des types de visualisation
├── visualizations/*.png
└── <page-slug>/
    ├── <page-slug>.md        # un tableau par section + fusions + questions ouvertes
    └── screens/*.png
```

## Garde-fous (appris à la dure — ne pas ignorer)

- **Toujours parser `get_metadata` via fichier + script.** Ne jamais `Read` un
  résultat brut au-delà de ~20k caractères directement dans le contexte.
- **Toujours confirmer via `get_screenshot`, ne jamais faire confiance au seul texte
  des métadonnées.** Les placeholders comme `"[titre]"` sont courants.
- **Ne jamais deviner un vrai champ, hook ou dataset.** Si vous êtes sur le point
  d'écrire quelque chose qui ressemble à une colonne ou une valeur de dataset réelle,
  arrêtez-vous — ce n'est pas le rôle de cette étape.
- **Ne présumez jamais d'un vocabulaire de toggle fixe.** Toujours noter ce qu'un
  toggle signifie sur cet écran précis, pas ce qu'un toggle au même nom de composant
  Figma signifiait sur un écran précédent.
- **Porte de validation humaine bloquante.** Ne jamais enchaîner automatiquement sur
  la suite du pipeline.
- **Jamais de composite en guise de capture individuelle.** Une capture de section
  (vue d'ensemble) ne va jamais dans la colonne `Capture` de plus d'une ligne du
  tableau final — chaque ligne non fusionnée dans "Fusions" a droit à sa propre
  capture isolée. Défaut vécu : plusieurs écrans distincts (Chiffres clés/Évolution/
  Cartographie) pointant tous vers la même image "vue d'ensemble" par paresse — invisible
  à la relecture du Markdown seul, seulement visible en ouvrant les images.

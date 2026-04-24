# Bee Colony Battle Game — Contexte projet

## Index technique — Où est codé quoi

| Fonctionnalité | Fichier | Lignes approx. |
|---|---|---|
| Boucle de jeu 60fps | `src/hooks/useGameLoop.ts` | 63–617 |
| Production abeilles (spawn) | `src/hooks/useGameLoop.ts` | 878–1062 |
| Machine à états abeilles (idle/moving/bezier/building/dying) | `src/hooks/useGameLoop.ts` | 89–615 |
| Combat abeilles (bee vs bee) | `src/hooks/useGameLoop.ts` | 619–860 |
| IA ennemie | `src/utils/enemyAI.ts` | 1–416 (+ appel L1092 useGameLoop) |
| Cercle de sélection — calcul état + refresh | `src/App.tsx` | 185–186, 579–584 |
| Cercle de sélection — rendu SVG + compteur | `src/components/GameBoard.tsx` | 582–639 |
| Orbite abeilles (centre + rayon) | `src/hooks/useGameLoop.ts` | 100–112, 182–196 |
| Vitesse abeilles (transit 0.8× vs dérive 0.25×) | `src/hooks/useGameLoop.ts` | 316–377 |
| Retour premier plan / visibilitychange | `src/App.tsx` | 265–293 |
| Rendu SVG principal (GameBoard) | `src/components/GameBoard.tsx` | 1–846 |
| Arbres + ruches (rendu) | `src/components/Tree.tsx` | 1–fin |
| Abeilles (rendu) | `src/components/Bee.tsx` | 1–112 |
| Système solaire (rayon, sparkles) | `src/hooks/useSolarSystem.ts` | 49–fin |
| Paramètres grille (calculateGridParams) | `src/App.tsx` | 49–80 |
| Constantes gameplay | `src/constants/gameRules.ts` | 1–fin |
| Persistance localStorage | `src/utils/storage.ts` | 1–fin |

---

## Nom du jeu
**Bee Colony Battle Game** (alias *Rush*) — jeu de stratégie en temps réel où le joueur conquiert une forêt avec des colonies d'abeilles.

## Stack technique (après nettoyage du 7 avril 2026)

| Outil | Rôle |
|---|---|
| React 18 + TypeScript 5 | Framework UI + typage |
| Vite 6 | Build tool |
| Tailwind CSS 4.0 | Styles utilitaires |
| Motion (Framer Motion) | Animations |
| Lucide React | Icônes |
| SVG natif | Rendu du jeu (grille, entités, effets) |
| localStorage | Sauvegarde de progression |

Le jeu est rendu entièrement en SVG. App.tsx est passé de ~3 400 à ~1 850 lignes grâce au découpage en hooks et composants.

---

## Ce qui a été fait — 7 avril 2026

### 1. Suppression des overlays de debug visuels (`src/App.tsx`)
- 4 rectangles SVG avec bordures rouges en pointillés (zones décoratives)
- Contour vert de la zone de jeu
- Légende blanche en haut à gauche

### 2. Refonte visuelle du damier (`src/utils/mapGenerator.ts`, `src/App.tsx`)
- Remplacement des 13 couleurs RGB par **2 tons** : `#cdd94a` (clair) et `#c2d040` (foncé)
- Suppression des bordures `strokeWidth` entre cellules
- Suppression du filtre `grain-texture` (feTurbulence) et de son rect
- Taille des cellules fixée à **80px** (`MIN_CELL_SIZE = MAX_CELL_SIZE = 80`) dans `calculateGridParams()`

### 3. Système de lumière solaire animée (`src/App.tsx`, `src/index.css`)
**Dégradé radial mobile :**
- `radialGradient id="top-left-light"` avec `cx="50%" cy="50%"` centré sur la position du soleil
- Grand rect 3× la carte pour permettre le débordement sans couper le dégradé
- State `sunPosition { x, y }` en % — se déplace aléatoirement toutes les **5–8 secondes** vers une nouvelle position (10–90% en x et y)
- Transition CSS `transform 3.5s ease-in-out` sur le `<g>` SVG pour un glissement fluide

**Intensité solaire (`sunIntensity`) :**
- Mis à jour toutes les 100ms — réplique le cycle CSS `solar-cloud` (5s ease-in-out alternate, période 10s)
- Formule : onde triangulaire 0→1→0 lissée par ease-in-out cubique → valeur 0–1

**Animations CSS (`src/index.css`) :**
- `solar-cloud-layer` : opacité `0.3→1.0`, 5s ease-in-out alternate infinite (nuage devant le soleil)
- `solar-sparkle-layer` : opacité `0.93→1.0`, 0.75s ease-in-out alternate infinite (scintillement rapide)

### 4. Étoiles scintillantes à 4 branches (`src/App.tsx`)
- State `sparkles` : 7 étoiles avec position absolue `(x, y)`, `size` (12–24px), `opacity` individuelle
- **Cycle de vie** à 800ms : `dormant` → `rising` (+0.5 opacité/tick) → `visible` → `disappearing` (-0.5/tick) → `dormant`
- **Relocalisation** à la mort : nouvelle position dans un rayon de 35% de `min(gameWidth, gameHeight)` autour de `sunPosRef.current`
- **Rendu** : path SVG croix 4 branches effilées (rayon long `size/2`, court `size/10`), filtre `sparkle-glow` (feGaussianBlur 2.5 + feMerge)
- **Opacité finale** : `s.opacity × f(sunIntensity)` avec montée progressive entre 0.3 et 0.7 de sunIntensity :
  - `sunIntensity < 0.3` → 0
  - `sunIntensity 0.3–0.7` → `s.opacity × ((sunIntensity - 0.3) / 0.4)`
  - `sunIntensity ≥ 0.7` → `s.opacity × 1.0`

---

## Refactoring effectué — 7 avril 2026

### Commits dans l'ordre
| Hash | Description |
|---|---|
| `c99dcb3` | feat: damier visuel — soleil animé, étoiles scintillantes synchronisées |
| `0c5d687` | refactor: suppression 47 composants UI inutilisés + déplacement 58 docs |
| `1c63a6c` | refactor: suppression des 36 dépendances npm inutilisées |
| `054633a` | refactor: centralisation des constantes dans `constants/gameRules.ts` |
| `54c473b` | refactor: extraction de `generateGrassGrid()` — −180 lignes dupliquées |
| `c812db0` | refactor: extraction des useEffects localStorage → hook `useStorage` |
| `2e8fcbf` | refactor: extraction du système solaire → hook `useSolarSystem` |
| `9a734b9` | refactor: extraction de la game loop → hook `useGameLoop` |
| `2876642` | refactor: extraction du rendu SVG → composant `GameBoard` |

### Fichiers créés
- `src/constants/gameRules.ts` — constantes partagées joueur/IA (`BUILD_HIVE_COST`, `UPGRADE_HIVE_COST`, `HIVE_L1_HP`, `HIVE_L2_HP`, `MAX_BEES`)
- `src/utils/grassGenerator.ts` — fonction `generateGrassGrid(rows, cols, cellSize)` extraite des 3 générateurs
- `src/hooks/useStorage.ts` — hook `useStorage(levelProgress, soundEnabled, globalTimeOfDay)` pour la persistance automatique
- `src/hooks/useSolarSystem.ts` — hook `useSolarSystem(gridParams)` → `{ sunIntensity, sunPosition, sparkles }`
- `src/hooks/useGameLoop.ts` — hook `useGameLoop({ gameState, setGameState, gridParams, mapData, ... })` — 7 effets (60 FPS, production, lucioles, IA, timer, etc.)
- `src/components/GameBoard.tsx` — composant `<GameBoard>` — rendu SVG complet (damier, arbres, abeilles, étangs, effets)
- `CONTEXT.md` (ce fichier)
- `docs/` — dossier contenant les 58 fichiers `.md` déplacés hors de `src/`

### Fichiers modifiés
- `src/App.tsx` — réduit de ~3 400 à ~1 850 lignes : overlays debug supprimés, damier refait, hooks extraits, GameBoard utilisé
- `src/utils/mapGenerator.ts` — palette 2 couleurs, utilise `generateGrassGrid()`
- `src/utils/levelGenerator.ts` — suppression palette obsolète, utilise `generateGrassGrid()`
- `src/utils/storyLevelGenerator.ts` — idem
- `src/utils/enemyAI.ts` — constantes remplacées par import depuis `gameRules.ts`
- `src/index.css` — keyframes `solar-cloud` et `solar-sparkle` ajoutées
- `package.json` — 36 dépendances inutilisées supprimées (Radix UI, recharts, react-hook-form, etc.)

### Fichiers/dossiers supprimés
- `src/components/ui/` — 47 fichiers (héritage template Shadcn/UI jamais utilisé)
- `src/` — 58 fichiers `.md` déplacés vers `docs/`

---

## Structure actuelle de `src/`

```
src/
├── App.tsx                    (~1 850 lignes — orchestration, state, navigation)
├── main.tsx
├── index.css
├── constants/
│   └── gameRules.ts           ← extrait session 1
├── hooks/
│   ├── useStorage.ts          ← extrait session 1
│   ├── useSolarSystem.ts      ← extrait session 2 (étape 2)
│   └── useGameLoop.ts         ← extrait session 2 (étape 3)
├── utils/
│   ├── grassGenerator.ts      ← extrait session 1
│   ├── mapGenerator.ts
│   ├── levelGenerator.ts
│   ├── storyLevelGenerator.ts
│   ├── enemyAI.ts
│   └── storage.ts
├── components/
│   ├── GameBoard.tsx          ← extrait session 2 (étape 4) — rendu SVG complet
│   ├── Tree.tsx
│   ├── Bee.tsx
│   ├── GameUI.tsx
│   ├── MainMenu.tsx
│   ├── OptionsMenu.tsx
│   ├── LevelMap.tsx
│   ├── LevelCompleteModal.tsx
│   ├── TutorialBanner.tsx
│   ├── AmbientSound.tsx
│   └── Lumberjack.tsx
└── types/
    ├── game.ts
    └── levels.ts
```

---

## Découpage App.tsx — Bilan

### ✅ Étape 2 — Hook `useSolarSystem` (commit `2e8fcbf`)
Extrait vers `src/hooks/useSolarSystem.ts` :
- State `sunIntensity` + useEffect 100ms (cycle solaire)
- State `sunPosition` + useEffect déplacement 5–8s
- State `sparkles` + useEffect 800ms (cycle étoiles)
- Ref `sunPosRef`
- Interface `Sparkle`
- Fonction `makeSparkle`
- Retourne : `{ sunIntensity, sunPosition, sparkles }`

### ✅ Étape 3 — Hook `useGameLoop` (commit `9a734b9`)
Extrait vers `src/hooks/useGameLoop.ts` :
- useEffect 60 FPS : déplacements abeilles, combat, construction/réparation/amélioration ruches
- useEffect production 1 FPS : spawn abeilles depuis les ruches
- useEffect lucioles 30 FPS (mode nuit)
- useEffect lumberjacks (réservé futur, no-op)
- useEffect timer : incrémente `gameTime` chaque seconde
- useEffect IA ennemie : toutes les 3s (6s pour premier combat)
- Reçoit : `{ gameState, setGameState, gridParams, mapData, globalTimeOfDay, currentScreen, levelProgress, beeConsumedByPondRef, setWaterSplashes, setFlashEffect }`

### ✅ Étape 4 — Composant `<GameBoard>` (commit `2876642`)
Extrait vers `src/components/GameBoard.tsx` :
- SVG de fond : damier herbe, lumière solaire animée, étoiles scintillantes, overlay nuit, étangs
- SVG interactif : arbres (2 couches), sélection cercle, flash, halos, splashes eau, abeilles
- Reçoit via props : `gameState`, `gridParams`, `mapData`, `sunIntensity`, `sunPosition`, `sparkles`, `globalTimeOfDay`, états de sélection, `flashEffect`, `waterSplashes`, `svgRef`, tous les handlers souris/touch/arbre

---

## Ce qui a été fait — 8 avril 2026 (session 2)

### Étape 5 — Refonte visuelle `Tree.tsx` (commit `8825791`)
**Problème :** l'ancien Tree.tsx (~790 lignes) avait des formes génériques, symétriques, sans caractère.

**Nouveau rendu (~305 lignes après toutes les passes) :**
- **Feuillage asymétrique** : deux ellipses légèrement décalées (une grande + une petite) pour casser la symétrie
- **Couleur selon colonisation** : arbre colonisé → vert vif (`#6dc23c`), neutre → vert olive (`#a8bc40`)
- **Ombre diffuse** sous le tronc (ellipse noire semi-transparente)
- **Tronc court** calculé proportionnellement à `cellSize` (facteur `s = cellSize / 80`)
- **Ruches sur les flancs** du feuillage (et non plus centrées en dessous)
- Suppression de toute la logique d'affichage du badge abeilles et de clic sur les abeilles

**Corrections du système d'upgrade (commits `2fde311`, `e9b1e5f`) :**
- Nouveau champ `upgradeLocked` dans `game.ts` : empêche le joueur d'upgrader un arbre solo (1 ruche max)
- `mapGenerator.ts` : introduction de `QUICK_PLAY_RULES` (`src/constants/quickPlayRules.ts`) — ratio de groupes d'arbres (`GROUP_TREE_RATIO: 0.25`, min 1, max 3)
- Arbres *groupe* = `maxHives: 2`, arbres *solo* = `maxHives: 1`, solo bloqué à l'upgrade
- `useGameLoop.ts` : respect du `maxHives` dans la logique de construction
- Compteurs de ruches et états de construction affichés correctement
- Zone de clic étendue à la cellule entière (fix `f519b2a`) — les abeilles SVG ne sont plus cliquables (pointer-events none)

### Étape 5b — Ruche trapézoïdale + liquide montant (commit `95d1f65`)
**Nouveau rendu de ruche (`renderHive`) :**
- Forme **trapèze arrondi** dessiné en path bezier (8 courbes Q) — plus organique qu'un cercle
- **Liquide qui monte** (`<rect>` clippé sur la forme) pour visualiser la vie/progression de construction
- **Stries horizontales** pour la texture alvéolaire
- **Tige** en haut (rect arrondi) + **trou d'entrée** (double cercle) en bas
- **Highlight** elliptique pour le reflet
- Couleurs : joueur = orange-ambre (`#e8a020`), ennemi = rouge (`#cc2222`), en construction = gris
- Positionnement revu : ruche unique sur le flanc gauche du feuillage, groupe = flanc gauche + flanc droit

### Étape 6 — Herbe 9 couleurs + soleil en ellipse (commit `c341fbb`)
- `grassGenerator.ts` : palette élargie de 2 à **9 tons jaune-vert** pour plus de variété naturelle
- `GameBoard.tsx` : remplacement du grand `<rect>` de lumière solaire par une **ellipse rotée 45°**, positionnée dynamiquement selon `sunPosition`
- Overlap de `+0.5px` sur les cases herbe pour éliminer les joints/artefacts de rendu entre cellules

### Étape 6b — Étangs organiques (commit `dc73569`)
**Remplacement du `<rect rx={8}>` par une forme blob SVG :**
- **Forme bezier seeded** : 4 courbes cubiques calculées à partir de l'`id` de l'étang pour un aspect aléatoire mais déterministe
- **3 ripples concentriques** animées avec Framer Motion, clippées à l'intérieur du blob (`<clipPath>`)
- Contour sombre organique pour la profondeur
- Reflet lumineux elliptique repositionné dans la forme

### Étape 7 — Nuages décoratifs (commit `7012d6c`)
- **3 nuages** composés d'ellipses superposées (composition classique), opacité 0.55 en mode jour, 0.18 en mode nuit
- **Animation CSS `cloud-drift`** : translation droite→gauche, durées 65 / 85 / 110s (lent/moyen/rapide)
- `animationDelay` décalé pour que chaque nuage couvre une zone différente dès le lancement
- Assombris passivement par le voile nocturne déjà en place dans `GameBoard`
- Keyframe ajoutée dans `src/index.css`

---

## Structure actuelle de `src/` (après session 8 avril)

```
src/
├── App.tsx                    (~1 868 lignes — orchestration, state, navigation)
├── main.tsx
├── index.css                  (keyframes: solar-cloud, solar-sparkle, cloud-drift)
├── constants/
│   ├── gameRules.ts           ← constantes partagées joueur/IA
│   └── quickPlayRules.ts      ← règles de génération mode Partie Rapide (ratio groupes)
├── hooks/
│   ├── useStorage.ts
│   ├── useSolarSystem.ts
│   └── useGameLoop.ts
├── utils/
│   ├── grassGenerator.ts      ← palette 9 couleurs
│   ├── mapGenerator.ts        ← groupes d'arbres (maxHives: 2)
│   ├── levelGenerator.ts
│   ├── storyLevelGenerator.ts
│   ├── enemyAI.ts
│   └── storage.ts
├── components/
│   ├── GameBoard.tsx          (~570 lignes — damier, soleil ellipse, étangs blob, nuages, abeilles)
│   ├── Tree.tsx               (~305 lignes — feuillage asymétrique, ruche trapézoïdale, liquide)
│   ├── Bee.tsx
│   ├── GameUI.tsx
│   ├── MainMenu.tsx
│   ├── OptionsMenu.tsx
│   ├── LevelMap.tsx
│   ├── LevelCompleteModal.tsx
│   ├── TutorialBanner.tsx
│   ├── AmbientSound.tsx
│   └── Lumberjack.tsx
└── types/
    ├── game.ts                ← champ upgradeLocked ajouté
    └── levels.ts
```

---

## Ce qui a été fait — 9 avril 2026 (session 3)

### Tree.tsx — corrections layout (raffinements post-session 2)
- **Ancrage feuillage sur `trunkTopY`** (`= trunkBottomY - 20*s`) : corrige le gap visible entre tronc et feuillage (l'ancre était sur `tree.y` avant)
- Groupe asymétrique : lobe du petit arbre ancré sur `trunkTopY_petit = trunkBottomY - 4*s - 14*s`
- **Zone de clic** : `<rect>` invisible `cellSize×cellSize` placé en *dernier* dans `renderLayer base` — intercepte tous les événements y compris les zones hors-feuillage
- **Ombre décalée à droite** : ellipse avec `radialGradient` 3 stops (`0.18 → 0.07 → 0`) centrée à `cx + 55*s` pour un effet directionnel

### Tree.tsx — ruche trapézoïdale (raffinements)
- `upgradingProgress` remis à `0` après construction pour éviter l'affichage parasite du cercle compteur
- Mode construction : contour `rgba(255,255,255,0.75)` continu (plus de pointillés)

### Système d'upgrade — corrections logique (détails)
- `upgradeLocked = true` après construction (hiveCount 0→1), remis à `false` uniquement quand le joueur re-cible l'arbre explicitement — empêche l'upgrade automatique par abeilles excédentaires
- Upgrade bloqué sur arbre solo (`maxHives === 1`) : `App.tsx` ~ligne 914, `useGameLoop.ts` ~ligne 284
- Pour `maxHives === 2` : upgrade = construction d'une 2ème ruche (`hiveCount 1→2`, `hiveHealth [7,7]`, `hiveLevel [1,1]`) et non montée de niveau de la ruche existante

### Damier — palette exacte + anti-joints
- Palette grassGenerator complète (9 tons pipetés de la maquette) : `#DADC57` `#CAD551` `#D9D255` `#CDC950` `#CFCF51` `#D1DA56` `#E1E159` `#DBDE67` `#C8C250`
- `shapeRendering="crispEdges"` ajouté sur les rects herbe pour un rendu net pixel-perfect

### Rayon solaire directionnel (`useSolarSystem.ts`, `GameBoard.tsx`)
- Remplacement de la lumière radiale par un **faisceau 45°** haut-gauche → bas-droite
- `linearGradient id="beam-grad"` perpendiculaire au faisceau (`x1/y1/x2/y2` vertical), 11 stops, fondu sur les bords latéraux sur ~35% de largeur de chaque côté
- Rect `2000×480px` (`x=-1000, y=-240`) centré sur `sunPosition`, `rotate(45)`, `opacity = sunIntensity * 0.9`
- **Cycle 3 phases** (`useSolarSystem.ts`, refs `beamPhaseRef` / `beamPhaseStartRef`) :
  - `visible` 5s : montée `sunIntensity` 0→1 en 1s puis plateau
  - `fadeout` 1.5s : descente 1→0
  - `hidden` 10s : intensité 0, nouvelle position du soleil tirée au passage hidden→visible
- **Sparkles alignés sur l'axe 45°** : angle `π/4 ± 0.25 rad`, dispersion latérale ±80px (perpendiculaire au faisceau)

### Nuages — refonte complète (`GameBoard.tsx`, `index.css`)
- **2 nuages** (au lieu de 3), forme **fluffy vue de dessus** : 7 cercles en cluster symétrique chevauchants
- **Écrasement vertical** `scaleY(0.6)` pour simuler la perspective aérienne
- **Deux types** : fair = `rgba(220,240,230,0.82)`, stormy = `rgba(180,170,210,0.82)` — couleur fixe par index
- **Bandes Y séparées** : nuage 0 à `0.15 * gameHeight`, nuage 1 à `0.72 * gameHeight` — superposition impossible
- Rayons : `r = cellSize * 2` (160px) pour nuage 0, `r = cellSize * 1.5` (120px) pour nuage 1
- Vitesses CSS : 65s (nuage 0) et 95s (nuage 1) via `animationDuration` inline
- Opacité : **0.80** jour / **0.28** nuit
- Rendus en **dernier dans le game SVG** (zIndex 10) — passent devant tout

### Étangs — ripples supprimées
- Les 3 `motion.circle` en boucle infinie sur chaque étang ont été supprimées
- Seuls restent : blob bezier, reflet lumineux clippé, contour sombre

### Ruches — repositionnement dans le feuillage (`Tree.tsx`)
- **Solo** : `cx = tree.x`, `cy = trunkTopY - 14*s` (centré horizontalement, dans le feuillage)
- **Groupe flanc gauche** (ruche 1, petite) : `cx = tree.x - 16*s`, `cy = trunkTopY - 10*s`, `r = 10*s`
- **Groupe flanc droit** (ruche 2, grande) : `cx = tree.x + 14*s`, `cy = trunkTopY - 16*s`, `r = 14*s`
- Distance entre centres : `30*s`, somme des rayons : `24*s` — pas de superposition possible
- Compteur upgrade suit les mêmes cx/cy que la ruche cible

### Réparation `hiveHealth[1]` — corrigée (`useGameLoop.ts`)
- La branche réparation utilisait un accès fixe à `hiveHealth[0]`
- Remplacé par `hiveHealth.findIndex((health, idx) => health < maxHp)` — répare le premier slot endommagé trouvé parmi tous les slots

### `.gitignore` mis à jour
- Ajout : `.DS_Store`, `src/.DS_Store`, `build/`, `.claude/`
- Ces fichiers retirés du tracking git (sans suppression disque)

### Bugs connus — à corriger
- 20 abeilles de test dans `App.tsx` à supprimer avant release

---

## Ce qui a été fait — 9 avril 2026 (suite session 3)

### Abeilles — redesign et comportement
- Nouveau design : forme goutte d'eau, corps brun (`#7a3a08` joueur / `#5a1a08` ennemi), bande colorée clippée jaune (`#f0c020` joueur) ou rouge (`#cc2020` ennemi), taille `sc=0.21`
- Orientation tête en avant : `bee.displayAngle` calculé comme angle tangentiel (rayon + 90°) en orbite, et via `Math.atan2` en déplacement
- Abeilles de départ espacées aléatoirement sur l'orbite (angle et rayon aléatoires, rayon 30–46px)
- Orbite corrigée : abeilles TEST TEMPORAIRE passées en `state: 'idle'` pour orbiter dès le départ

### Visuels divers
- Cercle de sélection : fond `rgba(255,255,255,0.10)`, contour blanc, suppression pointillé jaune et `<line>` centrale
- Highlight damier : `<rect>` 2px `rgba(255,220,220,0.10)` sur arête haute de chaque case
- Cailloux décoratifs : 2 formes alternées, couleur `#c8cc3e`, placement sur cases libres
- Nuages tous fair pour l'instant, orageux désactivés
- Ripples étangs supprimées

### Cercle de sélection (`GameBoard.tsx`)
- Fond : `fill="rgba(255,255,255,0.10)"`, contour `stroke="white"` `strokeWidth={3}` `opacity={0.9}`
- Suppression de la `<line>` pointillée jaune centrale (diamètre du drag)
- Suppression du `strokeDasharray` et du `drop-shadow` dynamiques

### Cailloux décoratifs (`GameBoard.tsx`)
- 5 cailloux maximum par carte, positionnés de façon déterministe (`seed = i * 7919`, retry `+1337` si case occupée)
- Filtrage : ne se placent pas sur les cases d'étang ni d'arbre (max 20 tentatives par caillou)
- **2 formes alternées** selon l'index :
  - Pair : groupe de 2 (grand `rx=13 ry=10` + petit décalé `rx=8 ry=6, cx-10 cy+4`)
  - Impair : caillou seul arrondi (`rx=9 ry=8`)
- Couleurs : `['#c8cc3e', '#bec432', '#d2d644']`, ombre `opacity=0.22`
- Prévu : interaction gameplay bûcheron (trébuche sur les cailloux)

### Highlight damier (`GameBoard.tsx`)
- `<rect>` de 2px de hauteur `fill="rgba(255,220,220,0.10)"` sur l'arête haute de chaque case herbe
- Donne un léger effet de lumière rasante sur la grille

### Nuages
- Les deux nuages sont actuellement en mode **fair** (`rgba(220,240,230,0.82)`) — le type stormy est désactivé
- Gameplay orage prévu : les nuages orageux décimeront les abeilles et casseront des ruches

### Ruches — mécanique et visuels
- Santé ruche visuelle : liquide qui monte/descend selon healthPercent (même système que construction)
- Compteurs de progression : barre ⬆ X/5 (construction) et ⬆ X/20 (upgrade 2ème ruche), positionnés au dessus de chaque ruche
- Ruche fantôme grise pendant l'upgrade vers la 2ème ruche, liquide qui monte selon upgradingProgress/20
- Construction animée : délai 200ms entre chaque abeille → ruche se construit en ~1 seconde
- Upgrade 2ème ruche : délai 80ms entre chaque abeille
- `lastBuildTick?: number` ajouté dans le type Tree

---

## Ce qui a été fait — 9-10 avril 2026 (sessions 3-4)

### Abeilles — redesign complet
- Nouveau design : forme goutte d'eau, corps brun (#7a3a08 joueur / #5a1a08 ennemi), bande colorée clippée jaune (#f0c020) ou rouge (#cc2020), taille sc=0.21
- Orientation tête en avant : bee.displayAngle = angle tangentiel (rayon + 90°) en orbite, Math.atan2 en déplacement
- Abeilles initiales espacées aléatoirement sur l'orbite (angle et rayon aléatoires)
- Halo de naissance : animation unique 800ms, joueur (doré) et ennemi (rouge), pas de repeat infini
- Raccourci T : spawne 20 abeilles sur l'arbre joueur (dev only)
- Suppression des 20 abeilles de test hardcodées au démarrage

### Ruches — mécanique et visuels
- Santé ruche : gradient "liquide montant/descendant" appliqué directement sur le path (fix débordement visuel du clipPath)
- linearGradient 4 stops corrigé : 0% opaque → buildPct opaque → buildPct transparent → 100% transparent
- isUnderConstruction ne se déclenche plus sur health === 0
- Compteurs barres ⬆ X/5 (construction) et ⬆ X/20 (upgrade) positionnés sur la ruche concernée
- Ruche fantôme grise pendant upgrade vers 2ème slot, liquide monte selon upgradingProgress/20
- lastBuildTick : délai 200ms entre chaque abeille pour construction et upgrade (animation progressive)
- Texte health/maxHealth supprimé — santé visible uniquement via le liquide

### Gameplay
- Combat repensé : attaque graduelle ruche par ruche avec throttle 300ms (plus instantanée)
- HIVE_L2_HP abaissé de 35 → 30
- Mode gaucher : toggle dans OptionsMenu, inverse le côté du cercle de sélection, sauvegardé en localStorage
- Conditions de victoire tutoriel corrigées

### Visuels et UI
- Marqueur de clic animé (ripple blanc, onde Material Design)
- Effets étang : abeilles qui meurent dans l'eau avec fade 300ms + onde de choc blanche clippée
- Bouton Tutoriel ajouté dans MainMenu
- Flow tutoriel : popup supprimée pour sous-niveaux 0–3, bouton Suivant dans TutorialBanner
- LevelCompleteModal, GameUI, OptionsMenu, TutorialBanner retravaillés (lucide icons)
- Nuages : 2 types fair/stormy visuels, forme fluffy écrasée scaleY 0.6
- Rayon solaire : faisceau 45° concentré, cycle 5s visible / 1.5s fadeout / 10s hidden

### Responsive
- Grille fixe 13×8, cellSize calculé pour maximiser l'espace dans la fenêtre
- Fond #c2d040 autour de la carte
- Resize recalcule gridParams même pendant une partie
- Meta viewport iOS : user-scalable=no, viewport-fit=cover
- position: fixed sur html/body pour bloquer le scroll, sauf LevelMap (pan-x)

### Architecture et constantes
- gridUtils.ts : treeX() et treeY() centralisent le positionnement des arbres
- gameRules.ts : BEE_ORBIT_RADIUS=38, GRID_COLS=13, GRID_ROWS=8
- BUILD_HIVE_COST et UPGRADE_HIVE_COST remplacent tous les /5 et /20 hardcodés dans Tree.tsx
- Suppression des dossiers backup-v1 et backup-v2 (1757 lignes)
- README ajouté

### Bugs corrigés (architecture)
- Types Bee complets : buildingTreeId, targetLumberjackId, hoverCenterX/Y ajoutés à l'interface
- 5 casts (bee as any) → accès typés directs
- Fireflies corrigées (prev.timeOfDay inexistant supprimé)
- Deps IA ennemie stabilisées (levelProgress objet → primitives)

### Bugs connus — à corriger
- Audit complet architecture à faire (conditions victoire dans App.tsx, génération abeilles dupliquée ×2, dead code bûcheron, upgradeLocked risque de rester bloqué)
- 20 abeilles de test accessibles via touche T (à supprimer avant release publique)

### Dette technique (à planifier)
- Conditions de victoire dans App.tsx → à migrer dans useGameLoop (logique de jeu hors UI)
- Génération abeilles initiales dupliquée ×2 dans App.tsx → à factoriser en fonction utilitaire
- State 'fighting' déclaré dans le type Bee mais jamais assigné → à supprimer ou implémenter
- Dead code bûcheron : 2 useEffect vides dans useGameLoop → à supprimer ou activer

### Prochaines étapes
- Audit architecture complet (migration victoire → useGameLoop, nettoyage dead code)
- Orage gameplay : nuages orageux déciment abeilles et cassent ruches
- Bûcheron trébuche sur cailloux
- Difficulté configurable en mode Partie Rapide
- Animations de combat (impact abeilles sur ruches)
- Effets de particules prise d'arbre
- Responsive mobile fine-tuning (test iPhone)

---

## Prochaines étapes

### Priorité haute
- Supprimer les 20 abeilles de test dans `App.tsx`
- Mouvement essaim abeilles à améliorer (actuellement banc de poisson)
- Bûcheron trébuche sur cailloux (gameplay)
- Orage : nuages orageux déciment abeilles et cassent ruches

### Suite
- Cohérence lumineuse globale (highlight/ombre sur tous les objets)
- Responsive mobile/tablette
- Animations de combat (impact abeilles sur ruches)
- Effets de particules lors de la prise d'un arbre
- Difficulté configurable en mode Partie Rapide

---

## Ce qui a été fait — 15 avril 2026

### Rayon de soleil — refonte complète (`useSolarSystem.ts`, `GameBoard.tsx`, `App.tsx`)
- Le rayon traverse désormais **toute la carte** (coin à coin, 45°), longueur = diagonale × 1.2
- **Position latérale aléatoire** à chaque apparition : offset perpendiculaire à la diagonale, centré sur `(W/2 - offset/√2, H/2 + offset/√2)`
- `sunPosition {x,y}` remplacé par `lateralOffset: number` dans le hook et les props
- Durée allongée : phase **visible 7 s** (au lieu de 5 s)
- Largeur du faisceau doublée : `y=-480, height=960` (au lieu de 480)
- `sparkleIntensity` distinct de `sunIntensity` :
  - Montée à t=700 ms (au lieu de 1500 ms), pleine intensité à t=1500 ms
  - Disparaît synchronisé avec le rayon (fin du fadeout)
- Animation scintillements fluide : tick **120 ms**, pas ±0.08/0.06 (au lieu de 800 ms / ±0.5)
- Scintillements strictement sur l'axe du rayon (dispersion perpendiculaire ±80 px)

### Combat abeilles en vol (`useGameLoop.ts`)
- Suppression du filtre `atLeastOneIdle`
- Toute abeille (`moving` ou `idle`) combat une ennemie à portée (rayon 15 px)
- Les abeilles envoyées vers des ennemis en route se battent dès qu'elles les croisent

### Mode veille + pause arrière-plan (`App.tsx`, `OptionsMenu.tsx`, `useStorage.ts`, `storage.ts`)
- Option "Mode veille" ajoutée dans le menu Options (icône BedDouble)
- `document.visibilitychange` : musique coupée quand l'app passe en arrière-plan
- Si mode veille activé : musique maintenue même écran verrouillé
- Préférence sauvegardée en `localStorage` (`rush_sleep_mode`)

### Génération de carte (`mapGenerator.ts`)
- Arbres uniquement en zone jouable (`gameStartRow..gameEndRow`, `gameStartCol..gameEndCol`)
- Distance Chebyshev ≥ 2 entre arbres respectée dans **tous** les fallbacks (plus de bypass)
- Cailloux décoratifs générés en dernier, placés partout sur la carte (zone décorative incluse)
- Abeilles ennemies meurent aussi en traversant les étangs

### UI — couches SVG (`GameBoard.tsx`)
- Trees TOP layer (ruches + compteur abeilles) rendu **après** les abeilles → compteur toujours lisible au premier plan

### Popup fin de partie (`App.tsx`)
- Délai 1 s avant affichage popup game over / victoire en partie rapide

### Commit
- `f203667` — 14 fichiers, +599/-367 lignes

---

## Ce qui a été fait — 15 avril 2026 (suite session)

### Mode nuit — refonte visuelle complète (`GameBoard.tsx`, `Tree.tsx`, `Bee.tsx`)

**Damier nuit — coloration greedy row-major (`GameBoard.tsx`, `grassGenerator.ts`) :**
- Ancien système `tileIdx 2×3` visible comme un pattern périodique → remplacé par un algorithme **greedy row-major** avec seed déterministe
- Fonction `greedyColor(row, col, colorMap, palette)` : pour chaque case, exclut les 4 voisins déjà colorés (haut-gauche, haut, haut-droit, gauche) — garantit qu'aucune case adjacente ni diagonale ne partage la même couleur (contrainte king graph)
- Seed : `Math.abs((row * 31337 + col * 7919)) % pool.length` — résultat aléatoire mais déterministe (pas d'effet de bord entre frames)
- Palettes nuit restaurées (6 tons bleu-nuit subtils) : `['#122030','#142234','#16263a','#1a2c40','#1c2e42','#1e3044']`
- Même algorithme appliqué au contour des cases pour les deux modes
- `grassGenerator.ts` : même contrainte king graph (8 voisins) pour le mode jour aussi

**Cailloux nuit (`GameBoard.tsx`) :**
- Couleurs conditionnelles : nuit → `['#203448','#22364a','#1e3246']` (plus clair que le damier le plus clair), jour → `['#c8cc3e','#bec432','#d2d644']`
- Jitter positionnel déterministe : `jitter(n) = sin(i * 7919 + n * 1337) * 0.5 * cellSize * 0.28` — déplace chaque rocher dans son propre carré sans sortir de la cellule

**Lucioles — redesign (`Bee.tsx`) :**
- Corps réduit : `r=2.2` (au lieu de 3), centre lumineux blanc `r=0.9`
- Halo SVG localisé (`feGaussianBlur stdDeviation=3`) : petite sphère `r=5` appliquant le flou — pas de glow sur toute la carte
- Pré-sélection : halo blanc `fill="#ffffff" opacity=0.5` + centre blanc élargi `r=1.8` (au lieu de la couleur de la luciole)
- Sélection active : anneau pulsant couleur `fireflyColor` (vert joueur `#7FFF00`, bleu ennemi `#00BFFF`)
- Mode jour : anneau de sélection revenu orange `#FF6600`

**Glow au sol accumulatif des lucioles (`GameBoard.tsx`) :**
- `<g filter="url(#bee-ground-glow)">` avec un `feGaussianBlur stdDeviation=14` appliqué au groupe entier
- Un cercle `r=16 opacity=0.10` par luciole, couleur `fireflyColor` — les cercles s'accumulent avant le blur → zones denses naturellement plus lumineuses

**Rayon solaire mis en pause la nuit (`GameBoard.tsx`) :**
- Rayon + sparkles conditionnels : `{globalTimeOfDay !== 'night' && <> {beam} {sparkles} </>}`
- Gradient de clair de lune (`moonlight-gradient`) supprimé — le voile nocturne `rgba(0,0,30,0.55)` suffit

**Compteur abeilles — couleur thémée nuit (`Tree.tsx`) :**
- Cercle de fond du compteur : `fill={isNightMode ? '#1a6aaa' : '#4DA8E8'}` — plus foncé en mode nuit
- Nuages : opacité `0.42` nuit / `0.80` jour (au lieu de `0.28` — meilleure visibilité nocturne)

### Interaction — drag vide désélectionne (`App.tsx`)
- Comportement corrigé : un drag terminé sur une zone vide (0 abeilles sélectionnées) **désélectionne toutes les abeilles** au lieu de conserver la sélection précédente
- Avant : `if (selectedBees.length > 0) setGameState(...)` — Après : `setGameState(...)` sans condition

### MainMenu — titre Rush mobile (`MainMenu.tsx`)
- Mode jour : SVG `<text>` avec `paintOrder="stroke"` — le stroke est rendu **sous** le fill, donnant un vrai contour extérieur sans l'artefact de `WebkitTextStroke` (centré) ni les 14 drop-shadow qui faisaient crasher Chrome
  - `stroke="rgba(255,255,255,0.92)" strokeWidth="6" strokeLinejoin="round"`, gradient `url(#title-grad)`
  - `viewBox="0 0 400 110"`, `width: clamp(160px, 38vw, 320px)`
- Mode nuit : `h1` CSS conservé (gradient chartreuse + `WebkitTextStroke: '1px rgba(255,255,255,0.6)'`)
- Abeille emoji supprimée du titre
- Sous-titre : `transform: 'translateY(-16px)'` pour remonter vers le titre sans décaler les boutons
- Espacement boutons : `space-y-2` → `space-y-3`, zone boutons `py-2` + `pb-4`

### OptionsMenu — header fixe + scroll interne (`OptionsMenu.tsx`)
- Conteneur root : `fixed inset-0 overflow-hidden flex flex-col`
- Header : `flex-shrink-0` — reste toujours visible en haut, ne participe pas au scroll
- Zone contenu : `flex-1 overflow-y-auto` + `WebkitOverflowScrolling: 'touch'` pour le scroll natif iOS

### Commits de session
| Hash | Description |
|---|---|
| `6c2b298` | fix: mode nuit — lucioles redesign + glow sol + rayon en pause |
| `174f625` | fix: cailloux nuit + jitter positionnel + greedy coloring damier |
| `e7fba7f` | fix: drag vide désélectionne + cercles sélection thémés jour/nuit |
| `bc74d06` | fix: MainMenu SVG title + OptionsMenu scroll + boutons espacés |

---

## Ce qui a été fait — 15 avril 2026 (session 4 — audit & nettoyage)

### Audit complet — 8 fichiers analysés
Audit ligne par ligne de `App.tsx`, `useGameLoop.ts`, `useSolarSystem.ts`, `useStorage.ts`, `enemyAI.ts`, `game.ts`, `gameRules.ts`, `quickPlayRules.ts`. Bugs réels, dette technique et dead code identifiés.

### Icône app
- `assets/icon-rush-1024.svg` créé — 1024×1024, style chartreuse avec arbre, ruche et abeilles
- Favicon déplacé de `src/public/favicon.svg` vers `/public/favicon.svg` (emplacement correct pour Vite)

### Nettoyage dossiers et fichiers orphelins
- Dossiers vides supprimés : `src/styles/`, `src/guidelines/`, `src/components/figma/`, `src/LICENSE/`
- `src/public/` supprimé (favicon au mauvais endroit)
- `src/utils/useFullscreen.ts` confirmé absent (déjà supprimé lors du nettoyage précédent)

### Fix `enemyAI.ts` — CELL_SIZE hardcodé (bug réel)
- `const CELL_SIZE = 100` et `const GRID_COLS = 16` locaux supprimés (`GRID_COLS` incohérent avec `gameRules.ts` qui vaut 13)
- `enemyAITick` et `pathCrossesPond` reçoivent maintenant `cellSize: number` en paramètre
- Toutes les occurrences `CELL_SIZE` remplacées par `cellSize` (zone de réaction IA + détection étangs)
- `useGameLoop.ts` mis à jour : `enemyAITick(prev, mapData, gridParams.cellSize)`

### Fix `game.ts` — doublon interface Bee (bug réel)
- `buildingTreeId?: string | null` déclaré deux fois dans l'interface `Bee` — doublon ligne 51 supprimé

### Dead code supprimé dans `useGameLoop.ts` (−167 lignes, −2 kB gzip)
- Bloc lumberjack movement/chopping (~160 lignes) conditionné par `lumberjackGameplayEnabled` jamais actif
- `useEffect` vide réservé aux bûcherons supprimé
- `const beeSpeedMultiplier = 1.0` supprimé (multipliait par 1, aucun effet)

### Refactor — déduplication `getWording` + `toast`
- `src/utils/wording.ts` créé — `getWording(timeOfDay)` exporté (source unique de vérité)
- `src/utils/toast.ts` créé — stub `toast` exporté (toasts désactivés, source unique)
- Définitions locales supprimées de `App.tsx` et `useGameLoop.ts`
- Double import `gameRules.ts` dans `App.tsx` fusionné en une seule ligne

### Commits de session
| Hash | Description |
|---|---|
| `78791f8` | chore: nettoyage dossiers vides, favicon déplacé vers /public/, icône app dans assets/ |
| `3655128` | fix: enemyAI — CELL_SIZE/GRID_COLS hardcodés remplacés par cellSize dynamique |
| `4fc435b` | fix: suppression doublon buildingTreeId dans interface Bee (game.ts) |
| `5b208ac` | chore: suppression dead code lumberjack + beeSpeedMultiplier dans useGameLoop (-167 lignes) |
| `322f9d5` | refactor: extraction getWording + toast dans utils partagés, fusion imports gameRules |
| `ea3d4cd` | fix: game.ts — suppression 'fighting' du type Bee, correction commentaires stars et HIVE_L2_HP |

---

## Prochaines étapes — Session 5 (todo consolidé)

### Priorité ABSOLUE
**Design Système dynamique**
- Créer `src/design/tokens.ts` — couleurs, tailles, typo (source de vérité absolue)
- Créer `src/design/atoms/` : ColorSwatch, BeeShape, HiveShape, TreeShape, PondShape, RockShape, CloudShape, ButtonShape
- Créer `src/design/molecules/` : CounterBubble, HealthBar, SelectionCircle, HiveOnTree
- Créer `scripts/generate-design-system.ts` — rend chaque composant via react-dom/server, génère `design-system.svg`
- Commande : `npx tsx scripts/generate-design-system.ts`

### Priorité haute
- **Icône App Store** : convertir `assets/icon-rush-1024.svg` en PNG 1024×1024 sans transparence → `resources/icon.png` → `npx @capacitor/assets generate`
- **Orientation paysage Capacitor** : `capacitor.config.ts` (`orientation: 'landscape'`) + `Info.plist` iOS
- **Bug ruche L2 sous attaque (2a)** : clipPath gradient "liquide" déborde hors contour → `Tree.tsx renderHive()`
- **Arrêt game loop au retour menu (3c)** : vérifier que useEffect/intervals/animations CSS s'arrêtent proprement → `useGameLoop.ts`, `useSolarSystem.ts`, `GameBoard.tsx`, `App.tsx`

### Priorité moyenne
- **Abeilles hors cadre (3b)** : clamper positions dans les limites de la grille jouable → `useGameLoop.ts`
- **Point de gravitation au clic (1b)** : case vide cliquée = centre de gravitation, rayon max ~1.5 cellSize → `useGameLoop.ts`, `App.tsx`
- **Damier étendu hors zone jouable (1a)** : prolonger le damier dans les marges décoratives, masquer le fond #c2d040 uni → `GameBoard.tsx`, `App.tsx`

### Dette technique restante
- State `'fighting'` déclaré dans `Bee` (game.ts) mais jamais assigné → supprimer ou implémenter
- Conditions de victoire dans `App.tsx` → migrer dans `useGameLoop`
- Génération abeilles initiales dupliquée ×2 dans `App.tsx` → factoriser en fonction utilitaire
- `stars: number` dans `GameState` commenté "non utilisé" → supprimer si confirmé inutile
- Commentaire `game.ts` dit HIVE_L2_HP = 35, valeur réelle = 30 → corriger le commentaire
- Bug IA attaque abeilles sur case vide (3d) → réévaluer après observation en jeu
- Compteur abeilles affiché baisse brièvement quand les abeilles partent en `building` vers un arbre impossible (construction déjà présente) — acceptable pour l'instant. Amélioration possible : vérifier la faisabilité AVANT d'envoyer les abeilles dans `createOrRepairHive`, et si impossible, ne pas les envoyer (juste toast d'erreur) pour que le compteur reste stable.

### Roadmap modes de jeu
- **3a** Améliorer l'IA ennemie : meilleure sélection de cibles, timing variable, gestion défensive → `enemyAI.ts`
- **5a** Mode Partie Rapide — sélection difficulté (Facile/Médium/Dur/Hardcore) : `DifficultySelect.tsx`, `enemyAI.ts`, `gameRules.ts`
- **5b** Mode Partie Rapide — tableau des scores localStorage par difficulté : `useStorage.ts`, `GameOverScreen.tsx`
- **5c** Mode Histoire — niveaux manuels, difficulté croissante, mécaniques progressives : `storyLevelGenerator.ts`, `levels.ts`, `LevelMap.tsx`

### Gameplay futur
- Orage : nuages orageux déciment abeilles et cassent ruches
- Bûcheron : trébuche sur cailloux (gameplay)
- Animations de combat (impact abeilles sur ruches)
- Effets de particules lors de la prise d'un arbre
- Difficulté configurable en mode Partie Rapide

---

## Ce qui a été fait — 16 avril 2026 (session 5)

### Reset — commit f0981cc annulé
- Commit `f0981cc` (mode histoire niv.1 — animations curseur main + bouton histoire activé) **annulé** via `git reset --hard d7f6846`
- Raison : comportement du tutoriel cassé par les modifications
- `f0981cc` est conservé dans le reflog Git — récupérable via `git cherry-pick f0981cc` si besoin

### Commits actifs depuis la session 4
| Hash | Description |
|---|---|
| `eaed63f` | style: arbres fanés éclairés + orbite abeilles centrée sur le feuillage |
| `d7f6846` | feat: arbres fanés/pollinisés, groupe d'arbres revu, touche T=10 abeilles |
| `33e92c9` | fix: mort des abeilles dans l'eau — onde bleue, skin correct, mortalité |
| `894faa8` | fix: correction textes tuto, autoplay son, sélection par le centre |
| `4c5ccd8` | style: suppression des étoiles dans les modals de tutoriel |
| `3cec974` | style: damier nuit légèrement plus clair (+20 RGB par canal) |
| `a02cdcd` | fix: abeilles initiales absentes dans handleNextLevel / handleRestartLevel |
| `e5f212b` | config: ajustement abeilles initiales tuto 3 (20) et tuto 4 (15) |
| `1f4eb09` | fix: son d'ambiance actif sur tout l'app (menu inclus) |
| `f46fd76` | fix: musique continue + ghost-click touch sur sélection |

### État actuel du projet
- Bouton "Mode Histoire" : **désactivé** (disabled, opacité 0.4) — intentionnel
- Mode tutoriel : fonctionnel jusqu'au niveau 4
- Arbres fanés : éclairés correctement, orbite abeilles centrée sur le feuillage
- Mort abeilles dans l'eau : onde bleue + mortalité active

git add CONTEXT.md
git commit -m "docs: CONTEXT.md — session 5, reset f0981cc, commits 16 avril"
git push origin main

---

## Déploiement

- Le jeu est déployé sur Netlify pour les tests (amis/beta testeurs)
- Méthode actuelle : drag & drop du dossier `build/` sur netlify.com
- À migrer plus tard : connexion GitHub automatique (chaque push = déploiement auto)
- Build command : `npm run build` — output : dossier `build/` à la racine

---

## Priorité 1 — Session 6 (ajouts 16 avril)

- **Orbite fluide** : quand une abeille atteint le feuillage d'un arbre, elle doit changer de direction fluidement pour prendre la direction de l'orbite. Elle ne doit pas aller jusqu'au centre de l'arbre comme actuellement.

- **Ease in / Ease out abeilles** : quand des abeilles sont envoyées sur la carte, elles ne doivent pas s'arrêter d'un coup (ease out) ni démarrer brutalement (ease in).

- **Bug double clic ruche** : le double clic sur un arbre pour créer une ruche fait disparaître les abeilles mais n'incrémente pas la ruche. À corriger.

- **Transition régénération partie rapide** : au lieu d'une translation visuelle de la carte lors d'une nouvelle partie sur mobile, faire un effet de fondu (fade in/out).

- **Sélection abeille à la sortie de ruche** : dès qu'une abeille sort de la ruche elle doit être sélectionnable même si elle n'est pas encore en orbite.

- **Parité graphique lucioles** : vérifier que les lucioles ennemies et joueur ont la même priorité graphique (taille du centre vif notamment) — seule la couleur doit différer.

- **Zone morte drag** : le clic est trop souvent interprété comme un drag. Ajouter une zone morte au début du drag (1/5 de la largeur d'un arbre) en dessous de laquelle le geste est considéré comme un clic et non un drag.

---

## Ce qui a été fait — 17 avril 2026 (session 6)

### Orbite abeilles — recentrage complet
- Investigation `Tree.tsx` pour extraire les `cy` exacts des feuillages
- `BEE_ORBIT_RADIUS_SOLO = 50`, `BEE_ORBIT_RADIUS_GROUP = 56`
- Centre orbite solo : `tree.y + cellSize * 0.215`, groupe : `tree.y + cellSize * 0.13`
- Constante `BEE_ORBIT_RADIUS` supprimée, remplacée par `SOLO`/`GROUP` dans `gameRules.ts`

### Double-clic construction — corrigé
- Bug root cause : `setLastClickedTreeId(null)` dans `handleMouseUp` cassait la détection
- Bug secondaire : `justBuiltHiveRef` bloquait `createOrRepairHive`
- Bug principal : `allBeesOnClickedTree` dans `handleMouseUp` interceptait le premier clic, passait les abeilles en `moving` avant le double-clic
- Fix : `isPotentialDoubleClick` bloque le chemin `allBeesOnClickedTree` si même arbre cliqué récemment
- `createOrRepairHive` accepte maintenant les abeilles `idle` ET `moving` vers l'arbre

### Compteur abeilles — simplifié
- Revenu à un compteur simple : abeilles `idle` avec `treeId === tree.id`
- `tree.beeCount` n'est plus utilisé pour l'affichage

### Dette technique ajoutée
- Compteur baisse brièvement si construction impossible — amélioration possible : vérifier la faisabilité AVANT d'envoyer les abeilles dans `createOrRepairHive`, si impossible ne pas les envoyer (juste toast d'erreur)

---

## Ce qui a été fait — 17 avril 2026 (session 7)

### Zone morte drag (commit `0ade122`)
- Constante `DRAG_DEAD_ZONE = 28px` ajoutée dans `App.tsx`
- En dessous de 28px de mouvement depuis le mousedown/touchstart, le geste est traité comme un clic et non un drag

### Double-clic ruche
- Plusieurs tentatives de fix du mouvement désordonné au double-clic
- Reset sur le commit de la zone morte drag (`0ade122`) — état propre conservé
- Désordre visuel au double-clic accepté pour l'instant — à améliorer plus tard
- Orbite abeilles : diamètre conservé tel quel (`BEE_ORBIT_RADIUS_SOLO = 50`)

### Parité lucioles
- Vérification dans `Bee.tsx` — déjà paritaire, rien à corriger

### Ease in/out abeilles
- Plusieurs tentatives infructueuses — reporté à une prochaine session
- La logique souhaitée : uniquement ease in sur changement de direction (~40px depuis le départ)

### Non traité (reporté)
- Transition fade partie rapide
- Sélection abeille à la sortie de ruche

---

## ⚠️ RÈGLE ABSOLUE — NE JAMAIS PASSER UNE ABEILLE EN `idle` SANS `treeId`

Une abeille en state='idle' sans treeId est complètement figée — elle n'est prise en charge ni par le bloc idle orbital (qui vérifie bee.treeId) ni par aucun autre bloc. Elle devient invisible au clic sur l'arbre, ne bouge plus, et ne peut être récupérée que par drag.

CAUSE IDENTIFIÉE (17 avril 2026) : le bloc moving vers targetX/Y passait l'abeille en state='idle' quand dist < 5, sans lui redonner de treeId.

FIX APPLIQUÉ : quand dist < 5 sur targetX/Y, NE PAS passer en idle — relancer un nouveau targetX/Y avec dérive aléatoire (8-16px) autour du point cible via bee.swarmX/bee.swarmY (centre fixe). L'abeille reste en 'moving' indéfiniment jusqu'à ce qu'elle reçoive un vrai treeId.

⚠️ ATTENTION : la dérive doit toujours être ancrée sur le centre fixe (swarmX/swarmY), jamais sur la position courante de l'abeille — sinon les abeilles dérivent à l'infini sur toute la carte.

---

## Ce qui a été fait — 17 avril 2026 (session 8)

### Corrections orbite abeilles
- Centre orbital migré vers formule trunkTopY dans tous les blocs (idle, bezierT>=1, spawn production loop, abeilles T, triple tap)
- Rayon minimum absolu via Math.max pour cohérence Chrome/Safari/iPhone
- BEE_ORBIT_RADIUS_SOLO = 38, BEE_ORBIT_RADIUS_GROUP = 43
- Fonction utilitaire createBee() créée dans App.tsx — source unique pour tous les spawns
- orbitalCenterY unifié : trunkTopY - cellSize * (0.28 solo / 0.26 groupe)
- Alias inutile orbitRadius = beeOrbitRadius supprimé

### Trajectoire Bézier naissance abeilles
- Abeilles naissent sur le trou de la ruche (position exacte avec treeOffsetY)
- Halo de naissance visible par-dessus la ruche (rendu après layer top)
- Trajectoire courbe aléatoire (déviation ±45°) depuis la ruche vers l'orbite
- Durée Bézier : bezierT += 0.008 (~2 secondes)
- Entrée en orbite fluide : orbitDir ajusté selon tangente d'arrivée
- Reset des champs Bézier si abeille redirigée en vol
- Sélection par clic sur arbre source possible pendant la Bézier

### Bug abeille figée — règle absolue
- Voir section ⚠️ RÈGLE ABSOLUE plus bas

### Cohérence orbite multi-device
- Chrome Mac cellSize=61, Safari Mac cellSize=67, iPhone 17 cellSize=57
- Math.max(RADIUS, RADIUS * cellSize/80) = plancher absolu pour petits écrans
- Vérification complète de tous les sites de spawn — tous alignés

### Autres fixes session 8
- Zone morte drag 28px
- Transition fade partie rapide 100ms
- Virage abeilles smooth (interpolation angulaire 0.12, snap >135°)
- Wake lock écran pendant la partie
- Triple tap = 10 abeilles (debug iPhone)
- Sélection abeilles Bézier par clic sur arbre source

### Audit qualité effectué — à traiter session 9
**Urgents :**
- console.log('GRID') ligne 66 App.tsx en production — à supprimer
- Ancienne formule orbite (0.13/0.215) subsiste lignes 237/245 useGameLoop.ts bloc moving→arbre
- Bee.tsx : 50 filtres SVG identiques par abeille (firefly-glow, clipPath) — perf

**Importants :**
- borderCells/nightColorMap recalculés à chaque render GameBoard.tsx — useMemo
- Bloc attaque ruche joueur/ennemi : ~150 lignes dupliquées useGameLoop.ts
- createOrRepairHive : 220 lignes à découper en 3 fonctions

**Mineurs :**
- handleMouseLeave/handleTouchCancel/handleMouseUp : logique cercle dupliquée 3 fois
- startLevel dupliqué 3 fois dans App.tsx
- greedyColor à déplacer hors du composant GameBoard

## Ce qui a été fait — 18 avril 2026 (session 9)

### Commits de session
| Hash | Description |
|---|---|
| `a5641b8` | refactor: extraction createBee() — déduplication spawn abeilles (App.tsx -90 lignes) |
| `953c1ca` | perf: filtres SVG Bee centralisés dans BeeFilters.tsx — suppression N duplications DOM |
| `8f76292` | perf: useMemo sur borderCells et nightColorMap dans GameBoard.tsx |
| `3602b09` | fix: formule orbite unifiée dans useGameLoop — suppression anciennes constantes 0.13/0.215 |
| `c0285ab` | fix: types TS — toast.success signature + hiveLevel cast |
| `9e49fa9` | refactor: factorisation startLevel — suppression duplication x3 dans App.tsx + fix cellSize stale au restart |
| `de6e802` | fix: abeilles perdues post-combat — décrément beeCount moving + redirect après victoire |
| `52af135` | fix: compteur abeilles — inclut abeilles Bézier (moving vers arbre) dès la naissance |
| `4fa4b12` | fix: compteur abeilles — inclut uniquement abeilles Bézier naissance (bezierT défini) |
| `5d75b43` | fix: délai 2s avant premier spawn abeille — suppression spawn instantané au lancement |
| `c5d8228` | fix: arrivée en orbite fluide — snap + orbitDir cohérent pour abeilles envoyées manuellement |
| `f571353` | fix: retour onglet Safari iOS — délai 100ms avant relance game loop |
| `1af01a0` | perf: throttle touchMove 30ms + pré-calcul offsets abeilles dans handleMouseUp |
| `e80b35f` | perf: handleMouseUp — travail lourd différé via setTimeout(0) pour libérer thread tactile iOS |
| `fafaf6a` | perf: GameBoard wrappé dans React.memo — suppression re-renders inutiles au clic |
| `4d0b7dd` | fix: erreurs TS — dyingBees angle manquant + svgRef nullable + arguments fonction |

### Gains perf session 9
- BeeFilters centralisé : N nœuds DOM → 3 (GPU)
- useMemo borderCells/nightColorMap : 0 recalcul O(n²) par frame
- useSolarSystem pausé la nuit : 2 intervals économisés
- Fireflies loop supprimée : 30 appels setGameState/s économisés
- handleTouchMove throttlé à 30ms : ~33 appels/s au lieu de 60
- handleMouseUp setTimeout(0) : thread tactile iOS libéré immédiatement
- React.memo GameBoard : re-renders supprimés lors des clics sans changement de props

### Dette technique résolue
- 4 warnings TS éliminés (toast.success, hiveLevel cast, dyingBees angle, svgRef nullable)
- startLevel factorisé (×3 → 1 fonction) + fix cellSize stale au restart
- Conditions de victoire App.tsx : analysées, migration useGameLoop NON faite (états UI, bonne place)
- console.log de debug supprimés

### Décision architecture
- Mode nuit = skin uniquement — tout comportement gameplay s'applique identiquement jour/nuit

---

## Ce qui a été fait — 19 avril 2026 (session 10)

### Commits de session
| Hash | Description |
|---|---|
| TBD | feat: essaim abeilles — rayon serré 10-30px + vitesse dérive isDrifting 0.25 |
| TBD | feat: clamping abeilles dans la grille + isDrifting vitesse dérive + essaim serré |
| TBD | fix: touch boutons mobile + fond safe area + revert webkit-fill-available |
| `04388cd` | fix: délai premier spawn 2s → 1s |

### Essaim abeilles — comportement en attente sur la carte
- Rayon de dérive swarm : 15–30px → **10–30px** (essaim serré)
- Seuil déclenchement nouvelle cible : `dist < 5` → `dist < 3`
- Vitesse dérive : introduit flag `isDrifting?: boolean` dans `src/types/game.ts`
  - `isDrifting = true` dans le bloc `dist < 3` (useGameLoop.ts)
  - `isDrifting = false` dans handleMouseUp quand l'utilisateur donne une destination (App.tsx)
  - Vitesse dérive : `0.25 * cellSizeScale` (au lieu de `0.8`)
  - Vitesse transit A→B : `0.8 * cellSizeScale` inchangée
  - Bug corrigé : `isDrifting ? 0.25 : 0.8 * cellSizeScale` → parenthèses manquantes corrigées en `isDrifting ? 0.25 * cellSizeScale : 0.8 * cellSizeScale`
  - Bug corrigé : `isDrifting` jamais remis à `false` sur assignation `targetTreeId` → ajout `bee.isDrifting = false` sur tous les sites d'assignation `targetTreeId` non-null dans useGameLoop.ts

### Vitesse dérive swarm — historique des tentatives échouées
- `!bee.targetTreeId && bee.swarmX !== null` → affectait le transit
- `bee.swarmX !== null ? 0.25 : 0.8` → swarmX jamais remis à undefined quand l'abeille repart
- Remettre swarmX à undefined sur chaque assignation targetTreeId → trop de sites, risque régression
- **Solution retenue** : flag `isDrifting` dans le type Bee — propre et sans ambiguïté

### Clamping abeilles dans la grille (App.tsx)
- `clickX/clickY` sont en coordonnées plateau (marginLeft/marginTop déjà soustraits)
- Clamping ajouté dans handleMouseUp branche "clic sur point vide" :
  - `clampedClickX = Math.max(0, Math.min(gridParams.cols * gridParams.cellSize, clickX))`
  - `clampedClickY = Math.max(0, Math.min(gridParams.rows * gridParams.cellSize, clickY))`
- Limites dynamiques selon taille fenêtre : bug résiduel si fenêtre redimensionnée en cours de partie (DevTools) — non prioritaire pour iPhone

### Bug limites grille — fenêtre redimensionnable (à traiter plus tard)
- `screenW/screenH` dans useGameLoop.ts capturés une seule fois au démarrage
- Symptôme : abeilles dépassent les bords si fenêtre change de taille (DevTools, bureau)
- Non prioritaire pour iPhone (fenêtre fixe)
- Fix futur : écouter `window.resize` et recalculer les limites, ou passer gridParams dynamiquement à chaque frame

### Touch boutons mobile (GameUI.tsx)
- `handleTouchEnd` dans StyledButton : suppression de la vérification de position (`elementFromPoint`)
- La vérification était correcte sur la zone de jeu (App.tsx) mais pas sur les boutons UI
- Nouveau comportement : `e.preventDefault()` + `onClick()` directement — tap toujours reconnu

### PWA iOS — barre verte en bas
- Symptôme : bande verte `#c2d040` visible en bas du menu quand la PWA s'ouvre directement en paysage
- Tentatives échouées : `100dvh`, `100%`, `padding-bottom: env(safe-area-inset-bottom)`, `margin-bottom: calc(-1 * env(safe-area-inset-bottom))`
- Cause probable : bug Safari — calcul hauteur viewport en paysage direct incorrect en PWA
- Revenu à `-webkit-fill-available` (état d'origine)
- **Non résolu** — disparaîtra en app Capacitor native

### PWA iOS — home bar (barre switch app)
- La home bar iOS intercepte les drags depuis le bas → peut réduire l'app accidentellement
- Impossible à désactiver en PWA Safari
- **Non traité** — disparaît en app Capacitor native (configurable via `Info.plist UIHomeIndicatorAutoHidden`)
- Phase de test PWA uniquement, pas un bug de production

### Décisions architecture
- PWA Safari = phase de test uniquement — les bugs spécifiques PWA (home bar, hauteur viewport) ne seront pas traités, ils disparaissent en app Capacitor native

### Audit iso jour/nuit perf
- useGameLoop.ts : aucune logique conditionnelle nuit/jour — conforme à la règle "skin uniquement"
- globalTimeOfDay utilisé uniquement via getWording() dans les hooks
- GameBoard.tsx : conditions nuit purement visuelles (couleurs, opacités)
- useSolarSystem.ts : intervalles pausés la nuit — voulu, économise 2 intervals
- ✅ Audit propre — si mode nuit rame sur iPhone 13, c'est le coût SVG des lucioles/couleurs

### Tâche iPhone 13 mode nuit — à explorer
- Si mode nuit rame sur iPhone 13 : investiguer le coût de rendu SVG lucioles dans GameBoard
- Piste : réduire le nombre de lucioles, simplifier les filtres SVG la nuit

### UX boutons
- Bouton Recommencer supprimé du HUD (haut gauche)
- Bouton Recommencer ajouté dans la modal pause (paysage : colonne droite / portrait : entre Accueil et Continuer)
- Touche Y = recommencer (mode test clavier)
- Bouton pause masqué quand la modale est ouverte (évite la confusion play/pause)

### Dette technique résolue
- GameState.stars supprimé — champ mort (les étoiles sont dans Level/SubLevel)
- state 'fighting' : déjà supprimé en session précédente, confirmé absent

## Ce qui a été fait — 20 avril 2026 (session 11)

### Machine à états abeilles — stabilisation complète

**Règles absolues documentées :**
- `state='idle'` sans `treeId` non-null = interdit en toute circonstance
- `isDrifting=true` → vitesse 0.25 × cellSizeScale (dérive)
- `isDrifting=false` → vitesse 0.8 × cellSizeScale (transit)
- `isAttacking=true` → abeille en orbite sur arbre ennemi intentionnellement, jamais redirigée

**Bugs corrigés :**
- `idle` sans `treeId` (L207/L214 useGameLoop.ts) → redirect vers arbre joueur le plus proche, ou `dying` si aucun
- `isDrifting` non remis à `false` sur clic arbre (App.tsx L881/L1239 handleMouseUp + handleTreeClick)
- `sourcetreeId` null en fin de building (L394) → fallback arbre joueur le plus proche
- `isDrifting: false` manquant dans `createBee()` → ajouté
- Flag `isAttacking` ajouté dans `game.ts` + `useGameLoop.ts` : abeilles joueur ne sont plus redirigées pendant l'attaque d'un arbre ennemi
- `isAttacking` remis à `false` sur arrivée arbre joueur/neutre et redirect post-victoire

**Spawn arbre double — corrigé :**
- Positions de naissance alignées sur Tree.tsx : `i=0` petite droite (`tree.x + 14*s`), `i=1` grosse gauche (`tree.x - 22*s`)
- Rythme : petite ruche 1 abeille/3s, grosse ruche 1 abeille/3s + 1 abeille extra à mi-cycle (1.5s)
- `shouldProduce` distingue arbre simple (level 1/2) et arbre double (toujours `now % 3000 < 1000`)
- `shouldProduceExtra` indépendant pour grosse ruche (`i=1`, `now % 3000 >= 1500 && < 2500`)

**Production arbre double — bilan :**
- Arbre simple : 1 abeille/3s
- Arbre double 1 ruche : 1 abeille/3s
- Arbre double 2 ruches : ~5 abeilles/3s (petite 1/3s + grosse 2/3s + production niveau 2)

**Post-conquête :**
- Angle orbital aléatoire à l'arrivée sur arbre ennemi (`bee.angle = Math.random() * Math.PI * 2`)
- Trajectoire d'entrée en orbite post-conquête encore abrupte — à améliorer avec Bézier (backlog)

### Commits de session
| Hash | Description |
|---|---|
| `650f0e5` | chore: PROJECT_TREE.txt — ajout BeeFilters.tsx, date 19 avril |
| `98faa19` | fix: idle sans treeId — redirect arbre le plus proche (L207/L214) |
| `3e3f788` | fix: isDrifting false sur clic arbre — handleMouseUp + handleTreeClick |
| `02582e4` | fix: sourcetreeId null en fin de building — fallback arbre joueur |
| `1377e52` | fix: isDrifting false dans createBee() |
| `1db81a4` | fix: naissance abeilles arbre double — positions + rythme petite/grosse ruche |
| `2c07bc3` | fix: isAttacking — abeilles restent sur arbre ennemi pendant combat + angle orbital aléatoire |

---

## Ce qui a été fait — 24 avril 2026 (session 12)

### Commits de session
- fix: barre verte portrait — fond body orange en portrait
- fix: fond vert résiduel portrait — index.css #root + index.html fallback
- fix: inversion logique fond — orange par défaut, vert uniquement en paysage
- fix: manifest background_color + theme_color orange pour PWA
- fix: compteur cercle sélection — refresh 100ms pendant drag sur iOS
- fix: isDrifting reset au retour premier plan — vitesse transit restaurée
- fix: gridParams via ref dans useGameLoop — cellSizeScale toujours à jour après resize/switch app
- fix: gridParams gelé pendant la partie — rotation/resize sans effet sur le jeu
- fix: reset swarmX/swarmY au resize — revert, remplacé par gel gridParams

### Branche capacitor-native créée
- capacitor.config.ts : appId com.rush.beecolony, appName Rush, orientation landscape, backgroundColor #F09A18
- Info.plist : lock orientation paysage + UIHomeIndicatorAutoHidden true
- cap doctor : iOS et Android ✅
- Xcode en cours d'installation — build natif iPhone à faire dès qu'il est prêt

---

## Backlog session 13

### Priorité haute
- **Tester build natif Xcode** — iPhone 17 et iPhone 13
- **Vérifier disparition bugs PWA** — barre verte, home bar, hauteur viewport
- **Vérifier orientation forcée paysage** — en natif iOS
- **Merger capacitor-native dans main** — si build OK

### Priorité moyenne
- **Z-index abeilles sous ruches** — abeilles doivent passer AU-DESSUS des ruches
- **Double clic construction** — abeilles en chemin pas comptées
- **Trajectoire Bézier post-conquête** — même courbe d'entrée en orbite qu'à la naissance
- **Nuit — lisibilité** — mieux différencier lac du damier nocturne
- **IA ennemie** — meilleure sélection de cibles, timing variable, gestion défensive

### Roadmap modes de jeu
- Mode Partie Rapide — sélection difficulté (Facile/Médium/Dur/Hardcore)
- Mode Partie Rapide — tableau des scores localStorage par difficulté
- Mode Histoire — niveaux manuels, difficulté croissante
- Orage : nuages orageux déciment abeilles et cassent ruches
- Bûcheron : trébuche sur cailloux

### Dette technique
- Limites grille dynamiques : screenW/screenH capturés au démarrage → recalculer au resize
- Transition angulaire fluide post-conquête (angle abrupt, noté "plus tard")

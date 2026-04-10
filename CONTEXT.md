# Bee Colony Battle Game — Contexte projet

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

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

Le jeu est rendu entièrement en SVG dans `src/App.tsx` (~3 400 lignes, fichier encore monolithique en cours de découpage).

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

### Fichiers créés
- `src/constants/gameRules.ts` — constantes partagées joueur/IA (`BUILD_HIVE_COST`, `UPGRADE_HIVE_COST`, `HIVE_L1_HP`, `HIVE_L2_HP`, `MAX_BEES`)
- `src/utils/grassGenerator.ts` — fonction `generateGrassGrid(rows, cols, cellSize)` extraite des 3 générateurs
- `src/hooks/useStorage.ts` — hook `useStorage(levelProgress, soundEnabled, globalTimeOfDay)` pour la persistance automatique
- `CONTEXT.md` (ce fichier)
- `docs/` — dossier contenant les 58 fichiers `.md` déplacés hors de `src/`

### Fichiers modifiés
- `src/App.tsx` — suppression overlays debug, refonte damier, système solaire, imports nettoyés
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
├── App.tsx                    (~3 400 lignes — à découper)
├── main.tsx
├── index.css
├── constants/
│   └── gameRules.ts           ← NOUVEAU
├── hooks/
│   └── useStorage.ts          ← NOUVEAU
├── utils/
│   ├── grassGenerator.ts      ← NOUVEAU
│   ├── mapGenerator.ts
│   ├── levelGenerator.ts
│   ├── storyLevelGenerator.ts
│   ├── enemyAI.ts
│   └── storage.ts
├── components/
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

## Prochaines étapes — Découpage App.tsx (étapes 2 à 4)

App.tsx contient encore ~3 400 lignes. Le plan de découpage convenu :

### Étape 2 — Hook `useSolarSystem`
Extraire vers `src/hooks/useSolarSystem.ts` :
- State `sunIntensity` + useEffect 100ms (cycle solaire)
- State `sunPosition` + useEffect déplacement 5–8s
- State `sparkles` + useEffect 800ms (cycle étoiles)
- Ref `sunPosRef`
- Interface `Sparkle`
- Fonction `makeSparkle`
- Retourne : `{ sunIntensity, sunPosition, sparkles }`

### Étape 3 — Hook `useGameLoop`
Extraire vers `src/hooks/useGameLoop.ts` :
- useEffect principal de la boucle de jeu (~80 lignes) : déplacements abeilles, production, combat, IA
- useEffect lucioles (nuit, 30 FPS)
- Dépend de : `gameState`, `gridParams`, `mapData`
- Retourne : setter `setGameState`

### Étape 4 — Composant `<GameBoard>`
Extraire vers `src/components/GameBoard.tsx` :
- Le rendu SVG complet (~1 000 lignes) : damier, arbres, abeilles, étangs, overlays nuit, étoiles, sélection, etc.
- Reçoit via props : `gameState`, `gridParams`, `mapData`, `sunIntensity`, `sunPosition`, `sparkles`, handlers de clic/touch

**Objectif final** : App.tsx réduit à ~800 lignes (state, navigation, orchestration).

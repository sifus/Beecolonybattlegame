# Bee Colony Battle Game — Rush

Un jeu de stratégie en temps réel dans lequel tu diriges une colonie d'abeilles pour conquérir des arbres, construire des ruches et éliminer la colonie ennemie. Entièrement rendu en SVG, pensé pour mobile et desktop.

---

## Gameplay

- **Sélectionne tes abeilles** en dessinant un cercle sur l'écran (clic-glisser ou toucher-glisser)
- **Envoie-les sur un arbre** pour le capturer, construire une ruche ou attaquer l'ennemi
- **Construis des ruches** (5 abeilles) pour générer passivement de nouvelles abeilles
- **Améliore en ruche niveau 2** (20 abeilles supplémentaires) pour une production plus rapide
- **Défends tes ruches** — elles ont des points de vie (L1 : 7 HP, L2 : 30 HP)
- L'ennemi fait de même de son côté

### Contrôles

| Action | Description |
|---|---|
| Glisser | Dessiner un cercle de sélection autour des abeilles |
| Clic sur un arbre | Envoyer les abeilles sélectionnées |
| Double-clic sur un arbre allié | Construire / Réparer / Améliorer une ruche |

---

## Fonctionnalités

- **Mode Histoire** — niveaux progressifs avec tutoriel intégré
- **Partie Rapide** — carte générée aléatoirement, une seule partie
- **Mode Droitier / Gaucher** — le cercle de sélection s'adapte : centre au point de départ (gaucher) ou au milieu du geste (droitier)
- **Mode Jour / Nuit** — ambiance visuelle et sonore distincte (lucioles la nuit)
- **Son d'ambiance** — musique de fond activable / désactivable
- **Mode veille** — la musique peut rester active quand l'écran est verrouillé
- **Pause automatique** — musique et jeu suspendus quand l'app passe en arrière-plan
- **Menu Pause** en jeu avec accès aux paramètres
- **Sauvegarde automatique** de la progression via `localStorage`
- **Combat en vol** — les abeilles se battent dès qu'elles se croisent, même en déplacement
- **Étangs mortels** — les abeilles qui survolent un étang risquent de tomber (joueur et IA)
- Décor SVG animé : nuages flottants, étangs organiques, rayon de soleil directionnel 45° avec scintillements

---

## Stack technique

| Technologie | Rôle |
|---|---|
| React 18 + TypeScript | UI et logique |
| Vite | Build et dev server |
| SVG | Rendu graphique entier (pas de canvas, pas de WebGL) |
| Framer Motion | Animations UI |
| Lucide React | Icônes |
| localStorage | Persistance des préférences et progression |

---

## Installation

```bash
npm install
npm run dev
```

Build de production :

```bash
npm run build
```

Les fichiers compilés sont dans `build/`.

---

## Structure du projet

```
src/
├── App.tsx                  # Point d'entrée, gestion des écrans et événements
├── components/
│   ├── GameBoard.tsx        # Rendu SVG principal
│   ├── GameUI.tsx           # HUD + menu pause
│   ├── Tree.tsx             # Rendu des arbres et ruches
│   ├── Bee.tsx              # Rendu des abeilles
│   ├── OptionsMenu.tsx      # Écran des options
│   └── ...
├── hooks/
│   ├── useGameLoop.ts       # Boucle de jeu (IA, attaques, construction)
│   └── useStorage.ts        # Persistance localStorage
├── constants/
│   └── gameRules.ts         # HP, coûts de construction, constantes de jeu
├── types/
│   └── game.ts              # Types TypeScript
└── utils/
    ├── storage.ts           # Fonctions de sauvegarde
    └── storyLevelGenerator.ts # Génération des niveaux histoire
```

---

## Paramètres de jeu

| Constante | Valeur |
|---|---|
| HP Ruche L1 | 7 |
| HP Ruche L2 | 30 |
| Coût construction L1 | 5 abeilles |
| Coût upgrade L2 | 20 abeilles |
| Cadence attaque | 1 abeille / 300 ms |
| Rayon de collision bee vs bee | 15 px |
| Arbres | Zone jouable uniquement, Chebyshev ≥ 2 |
| Étangs / Cailloux | Toute la carte |

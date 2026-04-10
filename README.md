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
| `T` (clavier) | Spawner 20 abeilles de test |

---

## Fonctionnalités

- **Mode Histoire** — niveaux progressifs avec tutoriel intégré
- **Mode Droitier / Gaucher** — le cercle de sélection s'adapte : centre au point de départ (gaucher) ou au milieu du geste (droitier)
- **Mode Jour / Nuit** — ambiance visuelle et sonore distincte
- **Son d'ambiance** — musique de fond activable / désactivable
- **Menu Pause** en jeu avec accès aux paramètres
- **Sauvegarde automatique** de la progression via `localStorage`
- **Abeilles bornées** — les abeilles ne sortent jamais de la zone de jeu
- Décor SVG animé : nuages, étangs avec ripples, herbe avec effet soleil

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
| Cadence attaque | 1 abeille / 300ms |

# Bee Colony Battle Game — Contexte projet

## Nom du jeu
**Bee Colony Battle Game** (alias *Rush*) — jeu de stratégie en temps réel où le joueur conquiert une forêt avec des colonies d'abeilles.

## Stack technique

| Outil | Rôle |
|---|---|
| React 18 + TypeScript 5 | Framework UI + typage |
| Vite | Build tool |
| Tailwind CSS 4.0 | Styles utilitaires |
| Motion (Framer Motion) | Animations |
| Radix UI | Composants accessibles |
| Recharts | (présent dans les dépendances) |
| SVG natif | Rendu du jeu (grille, entités, effets) |
| localStorage | Sauvegarde de progression |

Le jeu est rendu entièrement en SVG dans `src/App.tsx` (fichier monolithique, ~40k tokens).

## Ce qui a été fait — 7 avril 2026

- Suppression des overlays de debug visuels dans `src/App.tsx` :
  - 4 rectangles SVG avec bordures rouges en pointillés (zones décoratives gauche/droite/haut/bas)
  - Contour vert de la zone de jeu
  - Légende blanche en haut à gauche (fond blanc semi-transparent + textes)

## Prochaines priorités (à définir)

- [ ] À définir avec le propriétaire du projet
- Pistes possibles issues du README :
  - Compléter les niveaux 2–10 du mode histoire
  - Ajouter des sons d'effets (construction, combat)
  - Système de succès / achievements
  - Mode difficile (bûcherons, tempêtes)
  - Multijoueur local
  - Traductions FR/EN

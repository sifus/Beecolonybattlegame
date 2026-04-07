# Optimisation V2.2 - Plan d'action

## Date
26 octobre 2024

## Objectif
Nettoyer et optimiser le code en supprimant toutes les fonctionnalités liées aux bûcherons qui sont désactivées.

## Éléments à supprimer

### Dans App.tsx
1. ❌ Import `Lumberjack` component (ligne 4)
2. ❌ Import `Lumberjack as LumberjackType` from types (ligne 9)
3. ❌ State `lumberjackEnabled` (ligne 58)
4. ❌ Field `lumberjacks: []` in gameState (ligne 84)
5. ❌ Field `lumberjackGameplayEnabled` in gameState (ligne 86)
6. ❌ Toute la logique de mouvement des abeilles vers bûcherons (lignes 256-353)
7. ❌ useEffect spawn lumberjack (lignes 1029-1081, déjà commenté)
8. ❌ Fonction `handleLumberjackClick` (lignes 1814-1860)
9. ❌ Fonction `handleToggleLumberjack` (lignes 1866-1897)
10. ❌ Props `lumberjackGameplayEnabled` et `onToggleLumberjack` passés à GameUI/OptionsMenu
11. ❌ Render des composants `<Lumberjack>` (déjà commenté ligne 2236-2243)

### Dans GameUI.tsx
1. ✅ Déjà fait - Sliders bûcherons commentés

### Dans OptionsMenu.tsx
1. ✅ Déjà fait - Switch remplacé par badge "Arrive bientôt"

### Dans types/game.ts
1. ❌ Type `Lumberjack` 
2. ❌ Fields `lumberjacks`, `lumberjackGameplayEnabled` dans GameState
3. ❌ Field `targetLumberjackId` dans Bee type

## Bénéfices attendus
- Code plus propre et maintenable
- Fichier App.tsx réduit de ~300 lignes
- Moins de logique conditionnelle
- Performance légèrement améliorée (pas de checks inutiles)
- Code prêt pour réintroduire les bûcherons plus tard

## Étapes
1. ✅ Sauvegarder l'état actuel
2. ⏳ Nettoyer App.tsx
3. ⏳ Nettoyer types/game.ts
4. ⏳ Tester que tout fonctionne
5. ⏳ Documenter les changements

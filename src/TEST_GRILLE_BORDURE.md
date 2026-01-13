# TEST SYSTÈME DE GRILLE AVEC BORDURE DÉCORATIVE

## Date : 13 janvier 2025

## Contexte
Nous avons refait complètement le système de grille avec :
1. **Algorithme d'optimisation** : Teste toutes les tailles de cellules de 40px à 80px pour maximiser l'utilisation de l'espace écran
2. **Bordure décorative** : Ajoute 1 cellule de damier vierge tout autour de la zone de jeu
3. **Centrage parfait** : Centre la grille complète (zone de jeu + bordure) à l'écran
4. **Générateurs mis à jour** : `mapGenerator.ts` et `storyLevelGenerator.ts` placent les objets uniquement dans la zone de jeu

## Marqueurs visuels de debug

Des marqueurs visuels ont été ajoutés temporairement pour tester le système :

### 🔴 Bordure décorative (rouge)
- 1 cellule de damier sur chaque bord (gauche, droite, haut, bas)
- Affichée avec un fond rouge semi-transparent (10% opacité)
- Contour rouge en pointillés
- **AUCUN objet de jeu ne doit apparaître dans cette zone**

### 🟢 Zone de jeu (vert)
- Zone centrale où les arbres, étangs et autres objets peuvent être placés
- Contour vert épais (3px)
- **TOUS les objets de jeu doivent être dans cette zone**

### 📊 Légende
- Affiche la taille de la grille : `cols × rows (cellSize px)`
- Située en haut à gauche du SVG
- Fond blanc semi-transparent

## Tests à effectuer

### ✅ Test 1 : Desktop - Écran large
**Procédure :**
1. Ouvrir le jeu sur un écran desktop (≥1920px)
2. Menu principal → Quick Play
3. **Vérifier :**
   - [ ] La bordure rouge est visible sur les 4 côtés
   - [ ] Tous les arbres sont dans la zone verte (pas dans la bordure rouge)
   - [ ] Les étangs sont dans la zone verte
   - [ ] La grille est centrée à l'écran
   - [ ] Noter la taille affichée : `___ × ___ (___ px)`

### ✅ Test 2 : Mobile - Portrait
**Procédure :**
1. Ouvrir sur mobile en mode portrait (390×844px ou équivalent)
2. Menu principal → Quick Play
3. **Vérifier :**
   - [ ] La bordure rouge est visible sur les 4 côtés
   - [ ] Tous les arbres sont dans la zone verte
   - [ ] Les étangs sont dans la zone verte
   - [ ] La grille est centrée
   - [ ] Noter la taille : `___ × ___ (___ px)`

### ✅ Test 3 : Mobile - Paysage
**Procédure :**
1. Tourner le mobile en mode paysage (844×390px)
2. Menu principal → Quick Play
3. **Vérifier :**
   - [ ] La bordure rouge est visible
   - [ ] Objets dans la zone verte
   - [ ] Centrage correct
   - [ ] Noter la taille : `___ × ___ (___ px)`

### ✅ Test 4 : Tablette
**Procédure :**
1. Tester sur tablette (768×1024px ou équivalent)
2. Tester portrait ET paysage
3. **Vérifier :**
   - [ ] Bordure visible et complète
   - [ ] Objets bien placés
   - [ ] Centrage correct

### ✅ Test 5 : Mode histoire - Niveau 1-1
**Procédure :**
1. Menu → Play Story Mode → Niveau 1
2. Jouer le sous-niveau 1-1 (Movement)
3. **Vérifier :**
   - [ ] L'arbre de départ (gauche) est dans la zone verte
   - [ ] L'arbre cible (droite) est dans la zone verte
   - [ ] Pas d'arbres dans la bordure rouge

### ✅ Test 6 : Mode histoire - Niveau 1-4 (Étangs)
**Procédure :**
1. Menu → Play Story Mode → Niveau 1 → Sous-niveau 4
2. **Vérifier :**
   - [ ] L'étang est dans la zone verte
   - [ ] Les arbres sont dans la zone verte
   - [ ] Étang bien centré entre les arbres

### ✅ Test 7 : Changement d'orientation
**Procédure :**
1. Lancer une partie Quick Play en portrait
2. Tourner l'écran en paysage
3. **Vérifier :**
   - [ ] La grille ne se réinitialise PAS pendant la partie
   - [ ] Les objets restent visibles et jouables

### ✅ Test 8 : Redimensionnement navigateur
**Procédure :**
1. Desktop : Lancer Quick Play
2. Redimensionner la fenêtre du navigateur
3. **Vérifier :**
   - [ ] La grille ne se recalcule PAS pendant la partie
   - [ ] Retourner au menu, puis relancer : la grille s'adapte à la nouvelle taille

## Logs console

Le système affiche des logs détaillés dans la console :

```
🎮 GRILLE MAXIMISÉE + BORDURE DÉCORATIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 Écran: 1920×1080
📦 Dispo: 1920×1020 (après UI)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 Zone de jeu: 22×14 = 308 cellules
🖼️  Grille totale: 24×16 (avec bordure)
📏 Cellule optimale: 60px
📐 Grille: 1440×960px
⬜ Centrage: L=240 T=30
🎨 Espaces: L=240 R=240 T=30 B=30
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Interprétation :**
- **Zone de jeu** : `22×14` = zone où les objets peuvent être placés
- **Grille totale** : `24×16` = zone de jeu + 2 bordures (1 de chaque côté)
- **Cellule optimale** : Taille en pixels choisie par l'algorithme
- **Centrage** : Marges left/top pour centrer la grille

## Après les tests

Une fois tous les tests validés :

### ✅ Retirer les marqueurs visuels
Dans `/App.tsx`, supprimer le bloc de code entre :
```jsx
{/* DEBUG : Visualisation de la bordure décorative */}
```
et
```jsx
{/* Night overlay - voile sombre avec lumière de lune bleutée */}
```

Cela inclut :
- Les 4 rectangles rouges de bordure
- Le rectangle vert de zone de jeu
- La légende en haut à gauche

### ✅ Vérifier les comportements sans debug
Relancer les tests principaux pour confirmer que tout fonctionne sans les marqueurs.

## Résultats attendus

✅ **Succès si :**
- La bordure décorative est visible et complète sur tous les appareils
- Tous les objets de jeu sont dans la zone verte (jamais dans la bordure rouge)
- La grille est toujours centrée
- Le centrage s'adapte à la taille de l'écran
- Les générateurs respectent bien les limites de la zone de jeu

❌ **Échec si :**
- Un arbre apparaît dans la bordure rouge
- Un étang déborde dans la bordure rouge
- La grille n'est pas centrée
- Des objets disparaissent ou sont coupés à l'écran
- La bordure n'est pas uniforme (1 cellule partout)

## Problèmes connus à vérifier

1. **Très petits écrans** : Sur mobile très petit (<350px), vérifier que la grille minimale (6×6 + bordure = 8×8) s'affiche correctement
2. **Très grands écrans** : Sur écran 4K, vérifier que cellSize ne dépasse pas 80px
3. **Mode paysage tablette** : Vérifier que l'UI en bas ne cache pas la bordure inférieure

## Notes de développement

### Architecture du système
```
calculateGridParams()
  ↓
  Teste cellSize de 40-80px
  ↓
  Choisit la meilleure configuration
  ↓
  Ajoute bordure (cols+2, rows+2)
  ↓
  Calcule marges de centrage
  ↓
  Retourne :
    - cols, rows (total)
    - gameStartCol, gameEndCol, gameStartRow, gameEndRow
    - cellSize, gridWidth, gridHeight
    - marginLeft, marginTop
```

### Générateurs
```
generateRandomMap() / generateStoryLevel()
  ↓
  Reçoit gameStart/gameEnd
  ↓
  Génère herbe pour TOUTE la grille
  ↓
  Place objets UNIQUEMENT dans zone de jeu
    (gameStartCol → gameEndCol)
    (gameStartRow → gameEndRow)
```

### Rendu SVG
```
<svg 
  left={marginLeft}
  top={marginTop}
  width={gridWidth}
  height={gridHeight}
>
  {herbe sur toute la grille}
  {objets dans zone de jeu}
</svg>
```

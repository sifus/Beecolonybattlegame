# 🔍 GUIDE VISUEL - Identifier les problèmes de grille

## Légende des marqueurs de debug

Quand vous lancez le jeu, vous verrez :

```
┌─────────────────────────────────────┐
│ 🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴  │ ← Bordure rouge (décorative)
│ 🔴┌───────────────────────────┐🔴  │
│ 🔴│ 🟢                        🟢│🔴  │
│ 🔴│ 🟢   🌳      🌊    🌳   🟢│🔴  │ ← Zone verte (jeu)
│ 🔴│ 🟢                        🟢│🔴  │
│ 🔴│ 🟢      🌳         🌳    🟢│🔴  │
│ 🔴│ 🟢                        🟢│🔴  │
│ 🔴└───────────────────────────┘🔴  │
│ 🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴  │
└─────────────────────────────────────┘
```

## ✅ Configuration CORRECTE

### Exemple 1 : Desktop (1920×1080)
```
Grille : 24×16 (60px par cellule)
Zone de jeu : 22×14

┌─────────────────────────────────────┐
│ 🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴  │ ← 1 ligne de bordure
│ 🔴  🟢─────────────────────🟢  🔴  │
│ 🔴  🟢  🌳    🌊    🌳   🟢  🔴  │ ← Tous les objets dans le vert
│ 🔴  🟢        🌳         🟢  🔴  │
│ 🔴  🟢─────────────────────🟢  🔴  │
│ 🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴  │ ← 1 ligne de bordure
└─────────────────────────────────────┘
   ↑                              ↑
   1 colonne bordure        1 colonne bordure
```

**Validations :**
- ✅ Bordure rouge visible sur les 4 côtés
- ✅ Bordure de 1 cellule de large partout
- ✅ Tous les arbres (🌳) dans la zone verte
- ✅ Tous les étangs (🌊) dans la zone verte
- ✅ Grille centrée (marges équilibrées)

### Exemple 2 : Mobile portrait (390×844)
```
Grille : 8×15 (48px par cellule)
Zone de jeu : 6×13

┌───────────┐
│ 🔴🔴🔴🔴🔴 │ ← Bordure haut
│ 🔴🟢───🟢🔴 │
│ 🔴🟢 🌳🟢🔴 │
│ 🔴🟢   🟢🔴 │
│ 🔴🟢🌊 🟢🔴 │ ← Plus vertical
│ 🔴🟢   🟢🔴 │
│ 🔴🟢 🌳🟢🔴 │
│ 🔴🟢───🟢🔴 │
│ 🔴🔴🔴🔴🔴 │ ← Bordure bas
└───────────┘
```

**Validations :**
- ✅ Grille plus haute que large (format portrait)
- ✅ Bordure uniforme de 1 cellule
- ✅ Objets bien espacés dans la zone verte

## ❌ Configurations INCORRECTES

### Problème 1 : Arbre dans la bordure
```
❌ MAUVAIS :
┌─────────────────────┐
│ 🔴🌳🔴🔴🔴🔴🔴🔴🔴  │ ← Arbre dans la bordure !
│ 🔴  🟢─────────🟢🔴  │
│ 🔴  🟢  🌳   🟢🔴  │
│ 🔴  🟢─────────🟢🔴  │
│ 🔴🔴🔴🔴🔴🔴🔴🔴🔴  │
└─────────────────────┘
```

**Diagnostic :**
- ❌ Un arbre touche/déborde dans la bordure rouge
- **Cause probable** : Bug dans `mapGenerator.ts` ou `storyLevelGenerator.ts`
- **Action** : Vérifier les limites `gameStartCol/Row` et `gameEndCol/Row`

### Problème 2 : Étang dans la bordure
```
❌ MAUVAIS :
┌─────────────────────┐
│ 🔴🔴🔴🔴🔴🔴🔴🔴🔴  │
│ 🔴  🟢─────────🟢🔴  │
│ 🌊🌊🟢  🌳   🟢🔴  │ ← Étang déborde à gauche !
│ 🔴  🟢─────────🟢🔴  │
│ 🔴🔴🔴🔴🔴🔴🔴🔴🔴  │
└─────────────────────┘
```

**Diagnostic :**
- ❌ Un étang déborde dans la bordure rouge
- **Cause probable** : Position d'étang mal calculée
- **Action** : Vérifier `mapGenerator.ts` ligne ~142 (position étangs)

### Problème 3 : Bordure inégale
```
❌ MAUVAIS :
┌─────────────────────┐
│ 🔴🔴🔴🔴🔴🔴🔴🔴🔴  │ ← Bordure haut : 1 cellule ✅
│ 🔴🔴🟢─────────🟢🔴  │ ← Bordure gauche : 2 cellules ❌
│ 🔴🔴🟢  🌳   🟢🔴  │
│ 🔴🔴🟢─────────🟢🔴  │
│ 🔴🔴🔴🔴🔴🔴🔴🔴🔴  │
└─────────────────────┘
```

**Diagnostic :**
- ❌ Bordure n'a pas la même épaisseur partout
- **Cause probable** : Erreur dans `calculateGridParams()`
- **Action** : Vérifier les calculs de `gameStartCol/Row`

### Problème 4 : Zone verte mal positionnée
```
❌ MAUVAIS :
┌─────────────────────┐
│ 🔴🔴🔴🔴🔴🔴🔴🔴🔴  │
│ 🔴🔴🟢─────────🟢🔴  │ ← Zone verte décalée !
│ 🔴🟢🟢  🌳   🟢🔴  │
│ 🔴  🟢─────────🟢🔴  │
│ 🔴🔴🔴🔴🔴🔴🔴🔴🔴  │
└─────────────────────┘
```

**Diagnostic :**
- ❌ Le contour vert ne correspond pas à la zone réelle
- **Cause probable** : Bug dans le rendu des marqueurs
- **Action** : Vérifier `/App.tsx` ligne ~2910 (rectangle vert)

### Problème 5 : Grille non centrée
```
❌ MAUVAIS :
┌────────────────────────────┐
│                             │
│  🔴🔴🔴🔴🔴🔴              │ ← Trop d'espace à droite
│  🔴🟢────🟢🔴              │
│  🔴🟢 🌳🟢🔴              │
│  🔴🟢────🟢🔴              │
│  🔴🔴🔴🔴🔴🔴              │
│                             │
└────────────────────────────┘
```

**Diagnostic :**
- ❌ Grille pas centrée (marges déséquilibrées)
- **Cause probable** : Erreur de calcul des marges
- **Action** : Vérifier `calculateGridParams()` lignes 120-121

## 🔍 Checklist visuelle rapide

Quand vous testez, vérifiez en 10 secondes :

1. **Bordure rouge complète ?**
   - [ ] Haut : 1 cellule ✅
   - [ ] Bas : 1 cellule ✅
   - [ ] Gauche : 1 cellule ✅
   - [ ] Droite : 1 cellule ✅

2. **Zone verte complète ?**
   - [ ] Contour vert visible ✅
   - [ ] Forme rectangulaire ✅

3. **Objets bien placés ?**
   - [ ] Tous les arbres dans le vert ✅
   - [ ] Tous les étangs dans le vert ✅
   - [ ] Rien ne touche le rouge ✅

4. **Centrage correct ?**
   - [ ] Marges gauche/droite équilibrées ✅
   - [ ] Marges haut/bas équilibrées ✅

## 📊 Interprétation des logs

### Log normal (✅)
```
🎮 GRILLE MAXIMISÉE + BORDURE DÉCORATIVE
📱 Écran: 1920×1080
🎯 Zone de jeu: 22×14 = 308 cellules
🖼️  Grille totale: 24×16 (avec bordure)
📏 Cellule optimale: 60px
⬜ Centrage: L=240 T=30
🎨 Espaces: L=240 R=240 T=30 B=30
```

**Vérifications :**
- ✅ Grille totale = Zone de jeu + 2 (bordure de chaque côté)
  - Exemple : 24 = 22 + 2 ✅
  - Exemple : 16 = 14 + 2 ✅
- ✅ Espaces symétriques : L ≈ R, T ≈ B ✅
- ✅ Cellule entre 40px et 80px ✅

### Log problématique (❌)
```
🎮 GRILLE MAXIMISÉE + BORDURE DÉCORATIVE
📱 Écran: 1920×1080
🎯 Zone de jeu: 22×14 = 308 cellules
🖼️  Grille totale: 23×16 (avec bordure) ← ❌ Devrait être 24×16
📏 Cellule optimale: 60px
⬜ Centrage: L=500 T=30                 ← ❌ Marges déséquilibrées
🎨 Espaces: L=500 R=100 T=30 B=30       ← ❌ L ≠ R
```

**Problèmes détectés :**
- ❌ Grille totale incorrecte (23 au lieu de 24)
- ❌ Marges déséquilibrées (L=500 vs R=100)

## 🛠️ Actions de dépannage

### Si arbre dans la bordure
1. Ouvrir `/utils/mapGenerator.ts` ou `/utils/storyLevelGenerator.ts`
2. Chercher les lignes qui placent les arbres
3. Vérifier que les positions utilisent bien `gameStartCol` à `gameEndCol`

### Si étang déborde
1. Ouvrir `/utils/mapGenerator.ts`
2. Ligne ~142 : Vérifier le calcul de position des étangs
3. Confirmer que `gridX` et `gridY` sont dans les limites

### Si bordure inégale
1. Ouvrir `/App.tsx`
2. Fonction `calculateGridParams()` (ligne ~63)
3. Vérifier les calculs :
   - `gameStartCol = 1` ✅
   - `gameEndCol = totalCols - 2` ✅
   - `gameStartRow = 1` ✅
   - `gameEndRow = totalRows - 2` ✅

### Si grille non centrée
1. Ouvrir `/App.tsx`
2. Ligne ~120-121 : Vérifier calculs de marges
3. Formule attendue :
   ```typescript
   marginLeft = Math.round((availW - gridW) / 2);
   marginTop = Math.round((availH - gridH) / 2) + UI_TOP;
   ```

## 📸 Prendre un screenshot utile

Si vous trouvez un bug, prenez un screenshot qui montre :

1. **Écran complet** (pas juste le jeu)
2. **Marqueurs visibles** (rouge + vert)
3. **Objet problématique** visible
4. **Console ouverte** (F12) avec les logs

Exemple de bon screenshot :
```
┌─────────────────────────────────────┐
│ [Console F12]                       │
│ 🎮 GRILLE: 24×16, cellule: 60px    │
│ ⬜ Centrage: L=240 T=30             │
├─────────────────────────────────────┤
│ [Jeu avec marqueurs]                │
│ 🔴🔴🔴🔴🔴🔴🔴🔴🔴                  │
│ 🔴🌳🟢────🟢🔴 ← PROBLÈME ICI !   │
│ 🔴  🟢────🟢🔴                     │
└─────────────────────────────────────┘
```

## 🎯 Résumé en 3 étapes

1. **Regarder** : Bordure rouge + Zone verte
2. **Vérifier** : Objets dans le vert, pas dans le rouge
3. **Confirmer** : Grille centrée, bordure uniforme

Si tout ça est bon → ✅ **Système validé !**

Si problème → 📸 Screenshot + 📝 Noter les détails + 🔍 Consulter ce guide

---

**Temps de vérification visuelle : 10 secondes par test**  
**Temps de diagnostic si problème : 2-5 minutes**

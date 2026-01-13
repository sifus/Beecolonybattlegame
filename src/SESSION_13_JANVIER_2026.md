# SESSION 13 JANVIER 2026 - Test Système de Grille

## 📅 Date : 13 janvier 2026

## 🎯 Objectif
Vérifier que le nouveau système de grille avec bordure décorative fonctionne correctement sur desktop et mobile, et préparer le projet pour publication sur GitHub.

## ✅ Réalisations

### 1. Analyse du système de grille
- ✅ Examen complet de `/App.tsx` (fonction `calculateGridParams()`)
- ✅ Vérification de `/utils/mapGenerator.ts`
- ✅ Vérification de `/utils/storyLevelGenerator.ts`
- ✅ Confirmation que l'architecture est bien conçue

### 2. Ajout de marqueurs visuels de debug
Dans `/App.tsx`, ajout de marqueurs temporaires pour visualiser :
- 🔴 **Bordure décorative** (rouge semi-transparent)
  - 4 rectangles sur les bords (gauche, droite, haut, bas)
  - 1 cellule de large chacun
  - Contour rouge en pointillés
- 🟢 **Zone de jeu** (contour vert épais)
  - Rectangle englobant la zone centrale où les objets sont placés
- 📊 **Légende informative**
  - Affiche la taille de la grille : `cols × rows (cellSize px)`
  - Fond blanc semi-transparent en haut à gauche

**Objectif :** Permettre de vérifier visuellement que :
- Tous les arbres sont dans la zone verte (jamais dans la bordure rouge)
- Tous les étangs sont dans la zone verte
- La bordure décorative fait exactement 1 cellule de large partout

### 3. Documentation créée

#### 📋 TEST_GRILLE_BORDURE.md
Guide technique complet avec :
- Architecture du système (calculateGridParams → générateurs → rendu)
- 8 tests détaillés à effectuer (desktop, mobile portrait/paysage, tablette, mode histoire)
- Interprétation des logs console
- Procédure pour retirer les marqueurs après validation

#### 🚀 GUIDE_TEST_GRILLE.md
Guide rapide pour les testeurs :
- Tests essentiels en 10-15 minutes
- Instructions claires pour chaque plateforme
- Rapport de test à remplir
- Procédure de retrait des marqueurs

#### 🐙 GUIDE_GITHUB.md
Guide complet pour publier sur GitHub :
- Étapes de création d'un repository
- Commandes Git à exécuter
- Fichiers à inclure/exclure
- Template de README.md professionnel
- Options de déploiement (GitHub Pages, Vercel, Netlify)

#### 📝 README.md
README professionnel pour GitHub avec :
- Badges de version et technologies
- Description complète des fonctionnalités
- Guide d'installation et d'utilisation
- Structure du projet
- Roadmap
- Sections contribution et licence

#### 🚫 .gitignore
Fichier de configuration Git pour exclure :
- `node_modules/`
- `dist/`, `build/`
- Fichiers environnement (`.env*`)
- Fichiers IDE (`.vscode/`, `.idea/`)
- Logs et fichiers temporaires

## 🧪 Tests à effectuer

### Tests obligatoires
1. ✅ Desktop (≥1920px) → Quick Play
2. ✅ Mobile portrait (390×844) → Quick Play
3. ✅ Mobile paysage (844×390) → Quick Play
4. ✅ Tablette (768×1024) → Portrait + Paysage
5. ✅ Mode histoire → Niveau 1-1 (Movement)
6. ✅ Mode histoire → Niveau 1-4 (Étangs)
7. ✅ Changement d'orientation pendant une partie
8. ✅ Redimensionnement fenêtre navigateur

### Résultats attendus
✅ **Succès si :**
- Bordure rouge visible et uniforme (1 cellule) sur les 4 côtés
- Tous les objets (arbres, étangs) sont dans la zone verte
- Aucun objet dans la bordure rouge
- Grille parfaitement centrée

❌ **Échec si :**
- Un arbre ou étang touche/déborde dans la bordure rouge
- La grille n'est pas centrée
- La bordure n'est pas uniforme

## 🔄 Prochaines étapes

### Immédiat
1. **Effectuer les tests** listés ci-dessus
2. **Vérifier la console** pour les logs de grille
3. **Prendre des screenshots** si problèmes détectés

### Après validation
1. **Retirer les marqueurs visuels** dans `/App.tsx`
   - Supprimer le bloc entre `{/* DEBUG : Visualisation... */}` et `{/* Night overlay... */}`
2. **Tester à nouveau** sans marqueurs
3. **Valider** le comportement final

### Publication GitHub
1. **Initialiser Git** : `git init`
2. **Ajouter fichiers** : `git add .`
3. **Premier commit** : `git commit -m "Initial commit - Rush game with grid border system"`
4. **Créer repository** sur GitHub
5. **Pousser le code** : `git push -u origin main`
6. **Déployer** (optionnel) : Vercel, Netlify ou GitHub Pages

## 📝 Notes techniques

### Architecture du système de grille

```
calculateGridParams()
  │
  ├─ Teste cellSize: 40px → 80px
  ├─ Choisit la taille optimale (plus de cellules, pas trop petites)
  ├─ Calcule zone de jeu: gameCols × gameRows
  ├─ Ajoute bordure: totalCols = gameCols + 2, totalRows = gameRows + 2
  ├─ Calcule dimensions: gridWidth, gridHeight
  └─ Calcule centrage: marginLeft, marginTop
  
Retourne:
  - cols, rows (grille totale)
  - gameStartCol, gameEndCol, gameStartRow, gameEndRow (zone de jeu)
  - cellSize, gridWidth, gridHeight
  - marginLeft, marginTop
```

### Générateurs de cartes

```
generateRandomMap() / generateStoryLevel()
  │
  ├─ Reçoit: gameStartRow, gameEndRow, gameStartCol, gameEndCol
  ├─ Génère herbe: TOUTE la grille (y compris bordure)
  └─ Place objets: UNIQUEMENT dans zone de jeu
                    (entre gameStart et gameEnd)
```

### Rendu SVG

```jsx
<svg 
  left={marginLeft}
  top={marginTop}
  width={gridWidth}
  height={gridHeight}
  viewBox={`0 0 ${gridWidth} ${gridHeight}`}
>
  {/* Herbe sur TOUTE la grille */}
  {mapData.grassGrid.map(...)}
  
  {/* Objets dans zone de jeu */}
  {gameState.trees.map(...)}
  {mapData.ponds.map(...)}
</svg>
```

## 🐛 Problèmes potentiels à surveiller

1. **Très petits écrans** (<350px)
   - Vérifier que la grille minimale (8×8 avec bordure) s'affiche

2. **Très grands écrans** (4K, ≥2560px)
   - Vérifier que cellSize ne dépasse pas 80px (limite max)

3. **Mode paysage tablette**
   - Vérifier que l'UI en bas ne cache pas la bordure inférieure

4. **Objets mal placés**
   - Si un arbre apparaît dans la bordure → Bug dans le générateur
   - Vérifier les logs console pour les positions

## 📊 Logs console à surveiller

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

**Vérifications :**
- Zone de jeu : 6×6 minimum (plus sur grands écrans)
- Grille totale : Zone de jeu + 2 (bordure de 1 cellule de chaque côté)
- Cellule : Entre 40px et 80px
- Centrage : Marges symétriques (L ≈ R, T ≈ B)

## ✅ Checklist finale

Avant de considérer la session complète :

- [ ] Tests desktop effectués et validés
- [ ] Tests mobile (portrait + paysage) effectués
- [ ] Tests tablette effectués
- [ ] Tests mode histoire (niveaux 1-1 et 1-4) effectués
- [ ] Marqueurs visuels retirés après validation
- [ ] Tests finaux sans marqueurs effectués
- [ ] `.gitignore` créé
- [ ] `README.md` principal créé
- [ ] Guides de test créés
- [ ] Guide GitHub créé
- [ ] Prêt pour publication sur GitHub

## 📞 Support

Si problèmes détectés pendant les tests :
1. **Noter** : Appareil, taille d'écran, mode de jeu
2. **Screenshot** : Capturer la bordure et les objets
3. **Console** : Copier les logs de grille
4. **Décrire** : Quel objet est mal placé, où exactement

---

**Temps total estimé de la session :** 45 minutes (analyse + documentation + marqueurs)  
**Temps estimé pour les tests :** 10-15 minutes  
**Temps estimé pour publication GitHub :** 10 minutes

---

## 🎉 Conclusion

Le système de grille avec bordure décorative est maintenant **visuellement testable** grâce aux marqueurs de debug. Tous les fichiers de documentation sont prêts pour les tests et la publication sur GitHub.

**Prochaine action :** Effectuer les tests listés dans `GUIDE_TEST_GRILLE.md` pour valider le système !

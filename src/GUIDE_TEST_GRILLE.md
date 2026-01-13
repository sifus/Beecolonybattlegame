# 🎮 GUIDE RAPIDE - Test Système de Grille

## 🚀 Démarrage rapide

Le jeu affiche maintenant des **marqueurs de debug visuels** :
- 🔴 **Bordure rouge** = Zone décorative vide (pas d'objets)
- 🟢 **Contour vert** = Zone de jeu (arbres, étangs)

## ✅ Tests essentiels

### 1️⃣ Desktop
```
Menu → Quick Play
→ Vérifier : Tous les arbres/étangs dans la zone verte ✅
```

### 2️⃣ Mobile Portrait
```
Menu → Quick Play (en vertical)
→ Vérifier : Bordure rouge visible + objets en vert ✅
```

### 3️⃣ Mobile Paysage
```
Tourner le téléphone
→ Vérifier : Même chose en horizontal ✅
```

### 4️⃣ Mode Histoire
```
Menu → Play Story Mode → Niveau 1
→ Tester les 5 sous-niveaux
→ Vérifier : Aucun objet dans la bordure rouge ✅
```

## 📊 Console

Ouvrir la console du navigateur (F12) pour voir :
```
🎮 GRILLE MAXIMISÉE + BORDURE DÉCORATIVE
🎯 Zone de jeu: 22×14 = 308 cellules
🖼️  Grille totale: 24×16 (avec bordure)
📏 Cellule optimale: 60px
```

## 🎯 Résultat attendu

✅ **Parfait si :**
- Bordure rouge uniforme (1 cellule) sur les 4 côtés
- TOUS les arbres dans la zone verte
- TOUS les étangs dans la zone verte
- Grille bien centrée à l'écran

❌ **Problème si :**
- Un arbre touche la bordure rouge
- Un étang déborde dans le rouge
- La grille n'est pas centrée

## 🔧 Après validation

Une fois les tests OK, **retirer les marqueurs** dans `/App.tsx` :
```jsx
// Chercher et supprimer le bloc :
{/* DEBUG : Visualisation de la bordure décorative */}
... (tout le code jusqu'à)
{/* Night overlay - voile sombre avec lumière de lune bleutée */}
```

## 📝 Rapport de test

Remplir après les tests :

```
✅ Desktop (1920×1080) : ___
✅ Mobile portrait (390×844) : ___
✅ Mobile paysage (844×390) : ___
✅ Tablette (768×1024) : ___
✅ Mode histoire niveau 1-1 : ___
✅ Mode histoire niveau 1-4 (étangs) : ___
```

## 🐛 Problèmes détectés

Si vous trouvez un problème, noter :
1. Appareil / Taille d'écran
2. Mode (Quick Play / Story)
3. Screenshot si possible
4. Description du problème

---

**Temps estimé de test : 10-15 minutes**

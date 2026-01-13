# Changelog V2 - Lucioles Luminosité Améliorée

**Date:** 26 octobre 2025  
**Version:** 2.0 - Mode Nuit Optimisé

---

## 🎨 Amélioration de la Cohérence Visuelle en Mode Nuit

### Objectif
Adapter tous les éléments d'interface (badge, cercles, halos) pour qu'ils s'accordent avec les lucioles vertes et le mode nuit plus sombre, tout en rendant les lucioles ennemies bleues plus visibles.

---

## 📋 Modifications Détaillées

### 1. Lucioles Ennemies - Luminosité Augmentée
**Fichier:** `/components/Bee.tsx`

#### Avant (V1)
```tsx
const fireflyColor = bee.owner === 'player' 
  ? '#7FFF00' // Vert chartreuse pour joueur
  : '#4169E1'; // Bleu feu follet pour ennemi (trop sombre)

const glowColor = bee.owner === 'player'
  ? '#9FFF00' // Vert plus clair
  : '#87CEEB'; // Bleu ciel pour ennemi
```

#### Après (V2)
```tsx
const fireflyColor = bee.owner === 'player' 
  ? '#7FFF00' // Vert chartreuse pour joueur
  : '#00BFFF'; // Bleu cyan vif pour ennemi (plus lumineux)

const glowColor = bee.owner === 'player'
  ? '#9FFF00' // Vert plus clair
  : '#87CEFA'; // Bleu ciel lumineux pour ennemi (plus lumineux)
```

**Impact:**
- Lucioles ennemies bleues beaucoup plus visibles
- Luminosité comparable aux abeilles rouges du mode jour
- Meilleur contraste sur le fond bleu foncé de nuit

---

### 2. Badge du Nombre d'Abeilles
**Fichier:** `/components/Tree.tsx` (lignes 736-761)

#### Avant (V1)
```tsx
<circle
  fill="#FDD835"  // Toujours jaune
  stroke="#F9A825"  // Toujours orange
/>
<text fill="#F57C00">  // Toujours orange foncé
  {playerBeesCount}
</text>
```

#### Après (V2)
```tsx
<circle
  fill={isNightMode ? '#7FFF00' : '#FDD835'}
  stroke={isNightMode ? '#9FFF00' : '#F9A825'}
  style={isNightMode ? { filter: 'drop-shadow(0 0 4px rgba(127, 255, 0, 0.8))' } : {}}
/>
<text fill={isNightMode ? '#2D5016' : '#F57C00'}>
  {playerBeesCount}
</text>
```

**Impact:**
- Badge vert lumineux en mode nuit, s'accorde avec les lucioles
- Lueur verte (drop-shadow) pour meilleure visibilité
- Texte vert foncé pour bon contraste

---

### 3. Cercle de Sélection (Animation)
**Fichier:** `/App.tsx` (lignes ~2246-2258)

#### Avant (V1)
```tsx
<motion.circle
  stroke="#FDD835"  // Toujours jaune
/>
```

#### Après (V2)
```tsx
<motion.circle
  stroke={globalTimeOfDay === 'night' ? '#7FFF00' : '#FDD835'}
/>
```

**Impact:**
- Cercle vert en mode nuit, jaune en mode jour
- Cohérence avec les lucioles du joueur

---

### 4. Flash Effect (Clic sur Arbre)
**Fichier:** `/App.tsx` (lignes ~2260-2271)

#### Avant (V1)
```tsx
<motion.circle
  fill="#FFEB3B"  // Toujours jaune
/>
```

#### Après (V2)
```tsx
<motion.circle
  fill={globalTimeOfDay === 'night' ? '#7FFF00' : '#FFEB3B'}
/>
```

**Impact:**
- Flash vert en mode nuit au lieu de jaune
- Plus cohérent avec le thème nocturne

---

### 5. Halo de Création de Ruche
**Fichier:** `/App.tsx` (lignes ~2274-2316)

#### Avant (V1)
```tsx
<motion.circle stroke="#FDD835" />  // Jaune
<motion.circle stroke="#FFEB3B" />  // Jaune clair
<motion.circle stroke="#FFF9C4" />  // Jaune très clair
```

#### Après (V2)
```tsx
const isNight = globalTimeOfDay === 'night';

<motion.circle stroke={isNight ? '#7FFF00' : '#FDD835'} />  // Vert / Jaune
<motion.circle stroke={isNight ? '#9FFF00' : '#FFEB3B'} />  // Vert clair / Jaune clair
<motion.circle stroke={isNight ? '#CCFF99' : '#FFF9C4'} />  // Vert pastel / Jaune très clair
```

**Impact:**
- Trois cercles verts concentriques en mode nuit
- Animation cohérente avec les lucioles
- Célébration visuellement appropriée au thème

---

### 6. Cercle de Sélection Interactif
**Fichier:** `/App.tsx` (lignes ~2328-2355)

#### Avant (V1)
```tsx
<circle
  fill="rgba(255, 235, 59, 0.08)"  // Toujours jaune
  stroke="#FFEB3B"
  style={{ filter: 'drop-shadow(0 0 8px rgba(255, 235, 59, 0.8))' }}
/>
<line stroke="#FFEB3B" />
```

#### Après (V2)
```tsx
const isNight = globalTimeOfDay === 'night';

<circle
  fill={isNight ? 'rgba(127, 255, 0, 0.08)' : 'rgba(255, 235, 59, 0.08)'}
  stroke={isNight ? '#7FFF00' : '#FFEB3B'}
  style={{ filter: isNight ? 'drop-shadow(0 0 8px rgba(127, 255, 0, 0.8))' : 'drop-shadow(0 0 8px rgba(255, 235, 59, 0.8))' }}
/>
<line stroke={isNight ? '#7FFF00' : '#FFEB3B'} />
```

**Impact:**
- Cercle de sélection vert avec lueur verte en mode nuit
- Diamètre vert également
- Meilleure visibilité et cohérence

---

## 🎨 Palette de Couleurs V2

### Mode Nuit - Lucioles et UI
| Élément | Couleur | Hex | Usage |
|---------|---------|-----|-------|
| Luciole joueur | Vert chartreuse | `#7FFF00` | Corps principal |
| Luciole joueur (lueur) | Vert clair | `#9FFF00` | Halo externe |
| Luciole ennemie | Bleu cyan vif | `#00BFFF` | Corps principal (V2) |
| Luciole ennemie (lueur) | Bleu ciel lumineux | `#87CEFA` | Halo externe (V2) |
| Badge fond | Vert chartreuse | `#7FFF00` | Cercle badge |
| Badge bordure | Vert clair | `#9FFF00` | Contour badge |
| Badge texte | Vert foncé | `#2D5016` | Nombre |
| Halo niveau 1 | Vert chartreuse | `#7FFF00` | Cercle intérieur |
| Halo niveau 2 | Vert clair | `#9FFF00` | Cercle moyen |
| Halo niveau 3 | Vert pastel | `#CCFF99` | Cercle extérieur |

### Mode Jour - Abeilles et UI
| Élément | Couleur | Hex | Usage |
|---------|---------|-----|-------|
| Abeille joueur | Jaune | `#FDD835` | Corps |
| Abeille ennemie | Rouge | `#D32F2F` | Corps |
| Badge fond | Jaune | `#FDD835` | Cercle badge |
| Badge bordure | Orange | `#F9A825` | Contour badge |
| Badge texte | Orange foncé | `#F57C00` | Nombre |
| Halo/Flash | Jaune clair | `#FFEB3B` | Effets |

---

## 🔍 Tests Recommandés

- [x] Vérifier la visibilité des lucioles ennemies bleues sur fond nuit
- [x] Tester le badge vert sur différents types d'arbres
- [x] Vérifier les halos lors de la création de ruches
- [x] Tester le cercle de sélection en mode nuit
- [x] Valider la cohérence visuelle générale
- [x] Confirmer que les couleurs sont bien adaptées au mode jour

---

## 📊 Comparaison V1 vs V2

| Élément | V1 (avant) | V2 (après) |
|---------|-----------|-----------|
| Lucioles ennemies | Bleu royal foncé (#4169E1) | Bleu cyan vif (#00BFFF) ✅ |
| Badge nuit | Jaune (non cohérent) | Vert avec lueur ✅ |
| Cercle sélection | Toujours jaune | Adaptatif jour/nuit ✅ |
| Halo création | Toujours jaune | Adaptatif jour/nuit ✅ |
| Flash effect | Toujours jaune | Adaptatif jour/nuit ✅ |
| Cohérence visuelle | Moyenne | Excellente ✅ |

---

## 🚀 Prochaines Étapes Possibles

1. ✅ **V2 Complétée** - Tous les éléments visuels adaptés
2. Ajouter des particules lumineuses autour des lucioles ?
3. Animation de scintillement pour les lucioles ?
4. Effets de trail lumineux lors du déplacement ?
5. Lueur dynamique selon le nombre de lucioles regroupées ?

---

## 📝 Notes de Développement

- Toutes les couleurs sont gérées via des conditions `isNightMode` ou `globalTimeOfDay`
- Les drop-shadows ajoutent de la profondeur en mode nuit
- La transition entre jour/nuit est instantanée (pas d'animation de transition)
- Les couleurs sont optimisées pour la visibilité sur fond bleu foncé (#1A2332)

---

**Backup créé:** 26 octobre 2025  
**Status:** ✅ Terminé et testé

# Fix - Réinitialisation au Resize et Sélection d'Abeilles

## Problèmes corrigés

### 1. ❌ Le jeu se réinitialisait dès que la fenêtre changeait de taille

**Cause :** Un `useEffect` (lignes 286-338) rechargeait complètement le niveau story à chaque fois que `gridParams` changeait. Cela incluait :
- Régénération de la carte
- Reset de toutes les abeilles (`bees: []`)
- Reset de la sélection
- Reset des bûcherons

**Solution :** Suppression complète de cet effet problématique. Le niveau est maintenant uniquement chargé via `handleStartLevel()` et jamais lors des changements de gridParams.

```typescript
// ❌ AVANT (lignes 286-338)
useEffect(() => {
  if (currentScreen === 'story' && gameState.isPlaying) {
    // Recharge tout le niveau et réinitialise le jeu !
    const levelConfig = generateStoryLevel(...);
    setMapData(...);
    setGameState({ ...prev, bees: [], ... }); // ❌ Perte de toutes les abeilles
  }
}, [gridParams, currentScreen]); // ⚠️ Se déclenche au moindre resize

// ✅ APRÈS (lignes 286-288)
// NE PAS recharger le niveau pendant une partie - cela causerait une réinitialisation
// Le niveau est uniquement chargé via handleStartLevel() et non lors des changements de gridParams
// Cela permet de préserver l'état du jeu lors des changements de taille de fenêtre ou d'orientation
```

### 2. ❌ Cliquer sur un arbre pour envoyer des abeilles sélectionnait aussi les abeilles de l'arbre de destination

**Cause :** Il y avait **deux gestionnaires** pour les clics d'arbre :
1. `handleTreeClick` - Gestionnaire direct du composant Tree
2. `handleMouseUp` - Gestionnaire du SVG parent qui détectait aussi les arbres

Quand on cliquait sur un Tree, les deux se déclenchaient en cascade, causant une double sélection.

**Solution :** Empêcher la propagation complète des événements depuis le Tree et annuler la sélection en cours dans `handleTreeClick`.

**Fichier : `/components/Tree.tsx`**

```typescript
// ✅ Ajout de preventDefault et gestion du mouseUp
const handleClick = (e: React.MouseEvent) => {
  e.stopPropagation();
  e.preventDefault(); // ✅ Empêche le comportement par défaut
  onClick(e);
};

const handlePointerDown = (e: React.PointerEvent) => {
  e.stopPropagation();
  e.preventDefault();
  onClick(e as any);
};

// ✅ Nouveau : empêcher le mouseUp de remonter
const handlePointerUp = (e: React.PointerEvent) => {
  e.stopPropagation();
  e.preventDefault();
};

// Dans le JSX du cercle cliquable :
<circle
  cx={tree.x}
  cy={tree.y - foliageRadius * 0.2}
  r={clickRadius}
  fill="transparent"
  onClick={handleClick}
  onPointerDown={handlePointerDown}
  onPointerUp={handlePointerUp}        // ✅ Nouveau
  onMouseUp={handlePointerUp as any}   // ✅ Nouveau
  ...
/>
```

**Fichier : `/App.tsx`**

```typescript
const handleTreeClick = useCallback(
  (treeId: string, e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    // ✅ Annuler toute sélection en cours pour éviter les conflits avec handleMouseUp
    setSelectionStart(null);
    setSelectionCurrent(null);
    
    const tree = gameState.trees.find(t => t.id === treeId);
    if (!tree) return;
    
    // ... reste du code
  },
  [gameState, lastClickedTreeId, lastClickTime]
);
```

## Fichiers modifiés

1. **`/App.tsx`**
   - Suppression de l'useEffect qui rechargeait le niveau (lignes 286-338 → 3 lignes de commentaire)
   - Ajout de `preventDefault()` et annulation de sélection dans `handleTreeClick`

2. **`/components/Tree.tsx`**
   - Ajout de `preventDefault()` dans `handleClick` et `handlePointerDown`
   - Nouveau handler `handlePointerUp` pour bloquer la propagation
   - Ajout de `onPointerUp` et `onMouseUp` sur le cercle cliquable

## Comment tester

### Test 1 : Réinitialisation au resize

1. **Lancer une partie** (mode histoire ou partie rapide)
2. **Jouer un peu** (construire des ruches, envoyer des abeilles)
3. **Redimensionner la fenêtre** Figma (ou du navigateur)
4. ✅ **Vérifier que :** La partie continue sans interruption, toutes les abeilles sont toujours là

### Test 2 : Sélection d'abeilles sur arbre de destination

1. **Sélectionner des abeilles** sur un arbre A (clic simple)
2. **Cliquer sur un arbre B** pour les envoyer
3. ✅ **Vérifier que :** Les abeilles partent vers B SANS sélectionner les abeilles déjà présentes sur B

**Avant :** Les abeilles de l'arbre B étaient aussi sélectionnées (comportement erroné)  
**Après :** Seules les abeilles envoyées sont concernées, celles de B restent non sélectionnées

### Test 3 : Sélection par cercle

1. **Drag sur le terrain** pour créer un cercle de sélection
2. **Sélectionner plusieurs abeilles**
3. **Cliquer sur un arbre** pour les envoyer
4. ✅ **Vérifier que :** Les abeilles partent bien, aucune autre n'est sélectionnée

## Notes techniques

### Pourquoi c'était cassé ?

**Problème 1 (Resize) :**
- Le calcul de `gridParams` se faisait dans un `useEffect` avec `[gridParams, currentScreen, levelProgress]` en dépendances
- Au moindre resize, `gridParams` changeait
- Un autre `useEffect` écoutait `gridParams` et rechargeait le niveau
- → Perte totale de l'état du jeu

**Problème 2 (Sélection) :**
- Les événements se propagent : Tree → SVG parent
- `handleTreeClick` gérait le clic sur le Tree
- `handleMouseUp` gérait aussi les clics et détectait les arbres proches
- → Double traitement du même clic

### Pourquoi ça marche maintenant ?

**Solution 1 :**
- Suppression de l'effet de rechargement
- Les `gridParams` peuvent changer sans affecter le jeu en cours
- L'état est préservé jusqu'à un vrai restart/changement de niveau

**Solution 2 :**
- `stopPropagation()` + `preventDefault()` empêchent la remontée complète
- Annulation de `selectionStart/Current` dans `handleTreeClick`
- `handleMouseUp` ne voit plus le clic comme une "sélection de cercle"

## Impact

✅ **Stabilité mobile** : Plus de réinitialisation sur rotation d'écran (iPhone, Android)  
✅ **Stabilité desktop** : Plus de réinitialisation au resize de fenêtre Figma  
✅ **Gameplay fluide** : Envoi d'abeilles sans sélection parasite  
✅ **Préservation de l'état** : Le jeu continue même lors de changements de taille

## Version

Correction appliquée le : 26 octobre 2024  
Version du jeu : 6.2 (Resize stable + Sélection précise)

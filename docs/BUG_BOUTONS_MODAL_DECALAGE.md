# 🐛 Bug : Décalage des boutons au hover dans LevelCompleteModal

## Date
26 octobre 2025

## Problème
Les boutons "Recommencer" et "Suivant" dans le modal de fin de niveau se décalent de plusieurs pixels **vers le bas** dès qu'on les survole avec la souris.

## Symptômes
- ✅ Le bouton test identique en `position: fixed` en bas de l'écran **NE BOUGE PAS**
- ❌ Les boutons dans le modal (même code, mêmes styles) **BOUGENT**
- ❌ Le décalage se produit au moment où le curseur entre dans la zone du bouton
- ❌ Persiste même avec :
  - Tous les styles inline (pas de Tailwind)
  - `position: absolute` sur les boutons
  - `contain: strict` sur le conteneur
  - `pointerEvents: none` sur les enfants
  - Hauteur fixe (height, minHeight, maxHeight)
  - `transition: none` et `transform: none`
  - Suppression de toutes les classes Tailwind

## Fichier concerné
`/components/LevelCompleteModal.tsx`

## Tentatives effectuées (toutes échouées)
1. ❌ Désactivation des animations infinies des étoiles
2. ❌ Conteneur isolé avec `contain: 'layout style paint'`
3. ❌ Suppression de toutes les classes Tailwind
4. ❌ Conversion totale en styles inline
5. ❌ Position absolute sur les boutons
6. ❌ Hauteur fixe et rigide
7. ❌ Désactivation des pointer-events sur les enfants
8. ❌ `contain: 'strict'` et `isolation: 'isolate'`

## Observation clé
Le **MÊME bouton avec les MÊMES styles** fonctionne parfaitement quand il est en `position: fixed` hors du modal.

Cela indique que le problème vient de **l'interaction avec le contexte du modal**, probablement :
- Le `motion.div` parent
- Un effet de repaint/reflow déclenché par le hover
- Une interaction CSS bizarre entre le backdrop et le contenu

## Pistes à explorer demain

### 1. Tester sans motion.div
Remplacer le `motion.div` par une `div` normale pour voir si Motion cause le problème.

### 2. Tester avec un portal React
Utiliser `ReactDOM.createPortal` pour rendre les boutons complètement hors du DOM du modal.

### 3. Désactiver le backdrop blur
Le `background: 'rgba(0, 0, 0, 0.7)'` du fond pourrait causer des problèmes de rendu.

### 4. Tester dans un autre navigateur
Vérifier si c'est spécifique à Chrome/Safari/Firefox.

### 5. Ajouter will-change sur les boutons eux-mêmes
```javascript
willChange: 'transform',
backfaceVisibility: 'hidden',
perspective: 1000,
```

### 6. Utiliser un timeout pour afficher les boutons
Afficher les boutons 1 seconde après l'ouverture du modal pour voir si c'est lié aux animations.

### 7. Inspecter avec les DevTools
- Ouvrir l'inspecteur
- Onglet "Performance" ou "Rendering"
- Activer "Paint flashing" pour voir ce qui repaint
- Regarder exactement quel élément bouge

### 8. Créer un modal simple de test
Créer un modal ultra-simple avec juste un bouton pour isoler le problème.

## Code de test pour demain

```tsx
// Test 1 : Modal sans Motion
<div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
  <button>Test Simple</button>
</div>

// Test 2 : Bouton avec will-change
style={{
  willChange: 'transform',
  backfaceVisibility: 'hidden',
  perspective: 1000,
  transformStyle: 'preserve-3d',
}}
```

## Workaround temporaire possible
Si rien ne fonctionne, on peut :
1. Accepter le petit décalage (c'est mineur)
2. Désactiver complètement le hover des boutons dans ce modal
3. Utiliser une modal simple sans Motion pour ce cas spécifique

## Notes
- Le bug est très probablement lié à un problème de **rendering/compositing** du navigateur
- Ce n'est PAS un problème de CSS classique (sinon le bouton test bougerait aussi)
- C'est probablement un bug d'interaction entre Motion + backdrop + hover

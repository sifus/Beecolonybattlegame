# Changelog - Groupe d'arbres et améliorations UI (v3.5)

## Date: 25 octobre 2024

## Modifications appliquées

### 1. ✅ Typographie "Rush" 
- **Fichier**: `/components/MainMenu.tsx`
- **Modification**: Utilisation de l'image importée `rushTypo` (Brandone font)
- **Hauteur**: 120px avec auto width
- **Effet**: Drop-shadow doré pour s'intégrer au design

### 2. ✅ Fond d'écran
- **Fichier**: `/components/MainMenu.tsx`, `/components/OptionsMenu.tsx`
- **Modification**: Background changé de `#FAF8F0` à `rgba(0, 0, 0, 0.05)` (noir 5% opacité)
- **Texture**: Opacité hexagones augmentée de 0.03 à 0.04, strokeWidth de 2 à 3

### 3. ✅ Boutons avec contours épaissis
- **Fichiers**: `/components/MainMenu.tsx`, `/components/OptionsMenu.tsx`, `/components/GameUI.tsx`
- **Modifications**:
  - Border: `4px solid rgba(120, 53, 15, 0.4)` (contour ambré)
  - BoxShadow: Augmenté de `0 8px 16px` à `0 10px 20px`
  - Inset shadows: De `-3px 8px` à `-4px 10px`

### 4. ✅ Icônes solid (remplies)
- **Fichiers**: `/components/MainMenu.tsx`, `/components/OptionsMenu.tsx`
- **Modification**: Toutes les icônes Lucide utilisent maintenant:
  - `fill="currentColor"`
  - `strokeWidth={0}`
- **Icônes concernées**: Play, Settings, Info, ArrowLeft

### 5. ✅ Groupe d'arbres pour maxHives === 2
- **Fichier**: `/components/Tree.tsx` (ligne 96-165)
- **Modification**: Les arbres pouvant accueillir 2 ruches affichent maintenant un groupe de 3 arbres
- **Design**:
  - 1 arbre principal au centre (normal)
  - 1 petit arbre à gauche (65% de taille, opacity 0.6)
  - 1 petit arbre à droite (55% de taille, opacity 0.6)
- **Rendu**: Les petits arbres sont dessinés EN ARRIÈRE-PLAN pour créer un effet de profondeur

### 6. ✅ Indicateurs de niveau retirés
- **Fichier**: `/components/Tree.tsx`
- **Modification**: Suppression complète des icônes:
  - 🔒 Cadenas (arbre de départ, pas upgradable)
  - ⬆️ Flèche up (arbre upgradable vers niveau 2)

### 7. ✅ Sélection intelligente du cercle
- **Fichier**: `/App.tsx`
- **Modification**: 
  - `handleMouseLeave()`: Sélectionne les abeilles dans le cercle si la souris sort de l'écran
  - `handleTouchCancel()`: Sélectionne les abeilles dans le cercle si le touch est interrompu
- **Avantage**: Ne perd plus la sélection quand on sort accidentellement de l'écran

### 8. ✅ Fond sonore de prairie
- **Fichier**: `/components/MainMenu.tsx`
- **Modification**: Ajout d'un audio en boucle au menu principal
- **Volume**: 30%
- **Autoplay**: Avec gestion d'erreur pour navigateurs qui bloquent l'autoplay

## Comment vérifier les changements

### Groupe d'arbres:
1. Lancez une nouvelle partie
2. Regardez la carte - certains arbres (ceux avec maxHives === 2) montrent maintenant un groupe de 3 arbres
3. Ces arbres groupés sont généralement plus espacés sur la carte

### Boutons:
1. Menu principal - les boutons "Jouer" et "Options" ont un contour ambré visible
2. Les icônes sont maintenant remplies (solid) au lieu d'être en outline

### Fond:
1. Le fond est maintenant gris très clair (noir 5%) au lieu de beige
2. La texture hexagonale est légèrement plus visible

### Sélection:
1. En jeu, commencez à dessiner un cercle autour d'abeilles
2. Sortez volontairement votre souris de l'écran pendant la sélection
3. Les abeilles dans le cercle au moment de sortir devraient être sélectionnées

## Versions
- **Version UI**: 3.5
- **Fichiers modifiés**: 4 (App.tsx, MainMenu.tsx, OptionsMenu.tsx, Tree.tsx, GameUI.tsx)
- **Lignes ajoutées**: ~150
- **Impact visuel**: MAJEUR (groupe d'arbres très visible)

## Note importante
Si les changements ne sont pas visibles:
1. Faire un hard refresh: `Ctrl + Shift + R` (Windows) ou `Cmd + Shift + R` (Mac)
2. Vider le cache du navigateur
3. Vérifier dans les DevTools que les fichiers sont bien reloadés

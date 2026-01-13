# Changelog - Menu Simplifié avec Carte en Fond v5.0

## Date: 25 octobre 2024

## ✅ Modifications Complétées

### 1. Fond de carte floutée
**Fichiers**: `/components/MainMenu.tsx`, `/components/OptionsMenu.tsx`

**Avant** :
- Fond beige/gris avec texture hexagonale SVG
- Design abstrait nid d'abeille

**Après** :
- ✅ Carte du jeu complète en arrière-plan
- ✅ Effet de flou (`filter: blur(8px)`) pour ne pas distraire
- ✅ Overlay noir semi-transparent (40%) pour contraste
- ✅ Damier marron : `#8B7355` et `#A78B6F`
- ✅ Étangs bleus visibles
- ✅ Arbres avec leur rendu complet

**Implémentation** :
```tsx
const [mapData] = useState(() => generateRandomMap(CELL_SIZE));

<div className="absolute inset-0" style={{ filter: 'blur(8px)' }}>
  <svg>
    {/* Damier, étangs, arbres */}
  </svg>
</div>
<div className="absolute inset-0 bg-black/40" />
```

### 2. Titre "Rush" en texte stylisé
**Fichier**: `/components/MainMenu.tsx`

**Avant** :
- Image importée Brandone font (fichier externe)
- `rushTypo from 'figma:asset/...'`

**Après** :
- ✅ Texte pur avec `fontFamily: 'cursive'`
- ✅ Effet miel qui coule avec dégradé vertical
- ✅ Gradient : `#FDB022 → #F59E0B → #D97706 → #B45309`
- ✅ `WebkitBackgroundClip: 'text'` pour clip le gradient
- ✅ Drop-shadow doré pour effet brillant
- ✅ Font-size: 120px, font-weight: 900
- ✅ Letterspacing pour aération

**Code** :
```tsx
<h1 
  style={{
    fontFamily: 'cursive',
    fontSize: '120px',
    fontWeight: '900',
    background: 'linear-gradient(180deg, #FDB022 0%, #F59E0B 40%, #D97706 70%, #B45309 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    filter: 'drop-shadow(...)',
    letterSpacing: '0.05em',
  }}
>
  Rush
</h1>
```

### 3. Boutons rectangulaires arrondis
**Fichiers**: `/components/MainMenu.tsx`, `/components/OptionsMenu.tsx`

**Avant** :
- Boutons organiques avec `borderRadius` complexe (forme cire)
- `borderRadius: '45% 55% 52% 48% / 48% 45% 55% 52%'`

**Après** :
- ✅ Boutons rectangulaires avec `rounded-2xl` (Tailwind)
- ✅ Style cohérent avec les boutons de la carte de jeu
- ✅ Même gradient doré
- ✅ Même bordure ambrée épaisse (4px)
- ✅ Même effet relief avec inset shadows
- ✅ Hover scale-105

**Composant MenuButton** :
```tsx
function MenuButton({ onClick, icon, title, subtitle }) {
  return (
    <button
      className="w-80 py-5 px-6 hover:scale-105 rounded-2xl"
      style={{
        background: 'linear-gradient(135deg, #FDB022 0%, #F59E0B 50%, #D97706 100%)',
        boxShadow: '0 10px 20px rgba(217, 119, 6, 0.5), inset 0 -4px 10px rgba(0,0,0,0.2), inset 0 4px 10px rgba(255,255,255,0.35)',
        border: '4px solid rgba(120, 53, 15, 0.4)',
      }}
    >
      {/* Icon + Title */}
    </button>
  );
}
```

### 4. Textes blancs avec ombre
**Fichiers**: `/components/MainMenu.tsx`

**Avant** :
- Textes ambrés/marrons sur fond beige

**Après** :
- ✅ Textes blancs pour contraste sur fond sombre
- ✅ `textShadow: '0 2px 4px rgba(0,0,0,0.8)'` pour lisibilité
- ✅ Sous-titre et footer en blanc

### 5. Suppression de l'image importée
**Fichier**: `/components/MainMenu.tsx`

**Supprimé** :
```tsx
import rushTypo from 'figma:asset/c6cf3b3de7fedfd0c5faed69d81bd57b249a048f.png';
<img src={rushTypo} ... />
```

**Avantage** :
- Plus besoin d'asset externe
- Rendu plus rapide
- Texte adaptable et responsive
- Pas de dépendance fichier

### 6. Menu Options cohérent
**Fichier**: `/components/OptionsMenu.tsx`

**Changements** :
- ✅ Même fond de carte floutée
- ✅ Même overlay noir 40%
- ✅ Titre "Options" avec même style que "Rush"
- ✅ Panel rectangulaire `rounded-3xl`
- ✅ Bouton Retour rectangulaire `rounded-2xl`
- ✅ Toggles modernes (vert/gris, rounded-full)

## 🎨 Style visuel unifié

### Palette de couleurs :
- **Fond carte** : `#8B7355` / `#A78B6F`
- **Overlay** : `rgba(0, 0, 0, 0.4)`
- **Gradient miel** : `#FDB022 → #F59E0B → #D97706 → #B45309`
- **Bordures** : `rgba(120, 53, 15, 0.4)`
- **Textes** : Blanc avec shadow noir

### Effets :
- **Blur** : 8px sur la carte de fond
- **Drop-shadow** : Multiple sur le titre
- **Text-shadow** : Noir sur textes blancs
- **Box-shadow** : Relief avec inset sur boutons

## 📊 Comparaison Avant/Après

| Élément | Avant | Après |
|---------|-------|-------|
| Fond | Texture hexagonale beige | Carte du jeu floutée |
| Titre | Image PNG importée | Texte cursive avec gradient |
| Boutons | Forme organique cire | Rectangulaire arrondi |
| Textes | Ambrés | Blancs avec ombre |
| Cohérence | Menu ≠ Jeu | Menu = Aperçu du jeu |

## 🚀 Avantages

1. **Immersion** : Le joueur voit directement le jeu avant de commencer
2. **Simplicité** : Plus de formes organiques complexes
3. **Performance** : Plus d'image externe à charger
4. **Cohérence** : Boutons identiques au style de jeu
5. **Responsive** : Texte adaptatif au lieu d'image fixe

## 🎯 Impact utilisateur

**Avant** : Menu abstrait avec thème abeille, pas de lien direct avec le gameplay
**Après** : Menu immersif qui montre le jeu, transition fluide vers la partie

Le joueur comprend immédiatement :
- Le style graphique du jeu (damier, arbres, étangs)
- Le thème de la forêt
- L'ambiance générale

## 📝 Notes techniques

- La carte est générée à chaque ouverture du menu (aléatoire)
- Le blur 8px permet de voir les éléments sans distraire
- L'overlay 40% assure la lisibilité des textes et boutons
- Les boutons sont maintenant cohérents avec GameUI
- Le composant Tree est réutilisé tel quel

## Version
**UI Version**: 5.0 - Simplified Menu with Blurred Map Background
**Breaking Changes**: Suppression de l'import rushTypo (image)

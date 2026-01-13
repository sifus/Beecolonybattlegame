# Fix - Orientation iOS et Mode Standalone

## Problème résolu

Sur iPhone en mode standalone (app ajoutée à l'**écran d'accueil**, aussi appelé "springboard"), plusieurs problèmes se produisaient lors du changement d'orientation :

1. ❌ La partie se réinitialisait quand on tournait l'appareil portrait → paysage
2. ❌ Le cadrage de la carte était incorrect après rotation (cropé, décalé, marges)
3. ❌ Il fallait tourner l'iPhone plusieurs fois pour retrouver le bon cadrage

## Solutions appliquées

### 1. Empêcher la réinitialisation du jeu

**Fichier : `/App.tsx`** (lignes 189-228)

```typescript
// NE PAS recalculer pendant une partie active pour éviter la réinitialisation
useEffect(() => {
  const handleResize = () => {
    // Ne recalculer que si on est au menu ou en sélection de niveau
    if (currentScreen !== 'menu' && currentScreen !== 'story-levels') {
      return; // ✅ Empêche la régénération pendant une partie
    }
    // ... reste du code
  };
```

**Avant :** Les paramètres de grille (`gridParams`) étaient recalculés à chaque changement d'orientation, ce qui déclenchait la régénération de la carte.

**Après :** La recalculation est bloquée pendant une partie active (`currentScreen === 'game'` ou `'story'`), préservant ainsi l'état du jeu.

### 2. Masquer le contenu en mode portrait sans le détruire

**Fichier : `/styles/globals.css`** (lignes 229-262)

```css
@media screen and (max-width: 1024px) and (orientation: portrait) {
  #root {
    visibility: hidden; /* ✅ Cache mais ne détruit pas le DOM */
  }
  
  body::after {
    content: '📱 Veuillez tourner votre appareil en mode paysage';
    /* Message stylisé avec les couleurs du jeu */
  }
}
```

**Avant :** Utilisation de pseudo-éléments sans masquer le root, causant potentiellement des problèmes de rendu.

**Après :** Le contenu est caché avec `visibility: hidden` au lieu d'être détruit, préservant tout l'état React.

### 3. Fix viewport iOS en mode standalone

**Fichier : `/App.tsx`** (nouvelles lignes après ligne 187)

```typescript
// Fix viewport pour iOS en mode standalone (PWA)
useEffect(() => {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  
  if (isIOS && isStandalone) {
    const fixViewport = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    fixViewport();
    window.addEventListener('orientationchange', () => {
      setTimeout(fixViewport, 100);
    });
  }
}, []);
```

**Fichier : `/styles/globals.css`**

```css
/* Fix pour iOS en mode standalone */
@supports (-webkit-touch-callout: none) {
  html, body {
    height: -webkit-fill-available; /* ✅ Vraie hauteur du viewport */
  }
}
```

**Avant :** Utilisation de `100vh` qui ne correspond pas toujours à la vraie hauteur sur iOS.

**Après :** Utilisation de `-webkit-fill-available` et calcul dynamique de `--vh` pour un cadrage parfait.

### 4. Amélioration du viewport HTML

**Fichier : `/index.html`**

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover, minimal-ui">
```

Ajouts :
- `minimal-ui` : Réduit l'interface du navigateur en mode standalone
- Amélioration de `viewport-fit=cover` pour gérer les encoches iPhone

### 5. Prévention du "bounce" iOS

**Fichier : `/styles/globals.css`**

```css
html, body {
  overscroll-behavior: none;
  -webkit-overscroll-behavior: none; /* ✅ Empêche l'effet de rebond */
}
```

## Comment tester

### Sur iPhone (Safari)

1. **Ouvrir Safari** et aller sur l'URL du jeu
2. **Appuyer sur le bouton "Partager"** (icône avec flèche vers le haut)
3. **Sélectionner "Sur l'écran d'accueil"** (ou "Add to Home Screen")
4. **Donner un nom** (par exemple "Rush") et appuyer sur "Ajouter"
5. **Fermer Safari** et ouvrir l'app depuis l'écran d'accueil

### Test de rotation

1. **Lancer une partie** en mode paysage
2. **Tourner l'iPhone en portrait** → Un message doit s'afficher
3. **Remettre en paysage** → La partie doit reprendre **exactement où elle était**
4. **Vérifier le cadrage** → La carte doit être parfaitement centrée sans marges
5. **Répéter plusieurs fois** → Le comportement doit être identique à chaque fois

### Points de vérification

- ✅ La partie n'est **jamais réinitialisée** lors de la rotation
- ✅ Le **cadrage est toujours correct** après rotation
- ✅ **Aucune marge** bizarre en haut, bas, gauche ou droite
- ✅ Les **abeilles et arbres** restent à leur position exacte
- ✅ Le **score et les ressources** sont préservés
- ✅ Le message en mode portrait est **bien stylisé** (fond doré Rush)

## Note technique : "Écran d'accueil" vs "Bureau"

En français, l'équivalent du "home screen" de l'iPhone s'appelle :
- **Écran d'accueil** (terme officiel Apple France)
- **Springboard** (nom technique iOS)
- ~~Bureau~~ (ce terme est plutôt utilisé pour macOS)

## Fichiers modifiés

1. `/App.tsx` - Logique de gestion de l'orientation
2. `/styles/globals.css` - Styles pour iOS et orientation
3. `/index.html` - Meta tags viewport améliorés

## Version

Correction appliquée le : 26 octobre 2024
Version du jeu : 6.1 (Post-tutoriel fixes)

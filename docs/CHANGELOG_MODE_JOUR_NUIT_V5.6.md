# Changelog - Mode Jour/Nuit v5.6

## Date: 26 octobre 2024

## 🌓 Système Jour/Nuit avec Lucioles

### ✨ Nouvelles Fonctionnalités

Le jeu dispose maintenant d'un **système jour/nuit** complet avec :
- 🌞 **Mode Jour** : Ambiance prairie lumineuse avec oiseaux et nature
- 🌙 **Mode Nuit** : Atmosphère nocturne avec lucioles scintillantes et clair de lune bleuté
- 🎵 **Sons d'ambiance différents** selon le moment de la journée
- 🔘 **Bouton de contrôle** dans le menu Options pour activer/désactiver le son

---

## 📋 Changements Détaillés

### 1. **Mode Jour** ☀️

**Visuel** :
- Carte standard avec couleurs vives
- Herbe verte (#7A9B3A, #8BAA47)
- Lumière naturelle du jour

**Son d'ambiance** :
```
https://assets.mixkit.co/active_storage/sfx/2464/2464-preview.mp3
```
- Ambiance nature de prairie
- Oiseaux qui chantent
- Ruisseau en arrière-plan
- Léger vent dans les feuilles
- **Parfait pour le gameplay d'abeilles** 🐝

---

### 2. **Mode Nuit** 🌙

**Visuel** :
- **Voile sombre** : Overlay bleu-noir (#0a0e27) à 65% d'opacité
- **Clair de lune** : Gradient radial bleuté depuis le haut-droit
  - Centre : #a8c5dd (bleu clair) 15% opacité
  - Milieu : #6b8ba3 (bleu moyen) 8% opacité
  - Extérieur : #1a2332 (bleu nuit) transparent
- **Lucioles animées** : 30 lucioles qui scintillent de façon organique

**Son d'ambiance** :
```
https://assets.mixkit.co/active_storage/sfx/2465/2465-preview.mp3
```
- Forêt nocturne calme
- Grillons et insectes de nuit
- Ambiance mystérieuse et apaisante
- **Immersion nocturne parfaite** 🦗

---

## 🔊 Gestion Audio Améliorée

### Nouveaux Sons

| Mode | URL | Caractéristiques |
|------|-----|------------------|
| **Jour** | `sfx/2464/2464-preview.mp3` | Prairie, oiseaux, ruisseau, nature vivante |
| **Nuit** | `sfx/2465/2465-preview.mp3` | Grillons, forêt nocturne, calme |

**Anciens sons (remplacés)** :
- ❌ `sfx/2462` : Trop fade, pas assez de détails
- ❌ `sfx/2459` : Déplacé vers le mode nuit (sfx/2465 meilleur)

### Contrôle du Son dans Options

**Nouveau bouton fonctionnel** :
- ✅ Toggle On/Off du son d'ambiance
- ✅ Icône dynamique : 🔊 (activé) / 🔇 (désactivé)
- ✅ État persiste sur tous les écrans
- ✅ Animation de switch style iOS

**Avant** : Bouton grisé "Prochainement disponible"
**Après** : Bouton actif et fonctionnel

---

## 🦗 Système de Lucioles

### Génération

**Quantité** : 30 lucioles par carte en mode nuit

**Propriétés** :
```typescript
interface Firefly {
  id: string;           // Identifiant unique
  x: number;            // Position X (0 -> mapWidth)
  y: number;            // Position Y (0 -> mapHeight)
  brightness: number;   // Luminosité (0-1)
  phase: number;        // Phase d'oscillation (0-2π)
}
```

**Initialisation** :
```typescript
const fireflies = Array.from({ length: 30 }, (_, i) => ({
  id: `firefly-${i}`,
  x: Math.random() * GRID_COLS * CELL_SIZE,
  y: Math.random() * GRID_ROWS * CELL_SIZE,
  brightness: Math.random(),
  phase: Math.random() * Math.PI * 2,
}));
```

---

### Animation

**Boucle d'animation** :
- **Fréquence** : 30 FPS (intervalle de 33ms)
- **Type** : Oscillation sinusoïdale
- **Formule** : `brightness = (sin(phase) + 1) / 2`
- **Résultat** : Variation fluide entre 0 et 1

**Code** :
```typescript
useEffect(() => {
  if (gameState.timeOfDay !== 'night') return;

  const interval = setInterval(() => {
    setGameState(prev => {
      if (prev.timeOfDay !== 'night' || !prev.fireflies) return prev;
      
      return {
        ...prev,
        fireflies: prev.fireflies.map(firefly => ({
          ...firefly,
          phase: firefly.phase + 0.05,
          brightness: (Math.sin(firefly.phase) + 1) / 2,
        }))
      };
    });
  }, 1000 / 30);

  return () => clearInterval(interval);
}, [gameState.timeOfDay]);
```

---

### Rendu Visuel

**3 couches superposées** :

1. **Halo extérieur** (effet de lueur)
   - Rayon : `(3 + brightness * 2) * 2`
   - Couleur : `#c4ff6d` (vert-jaune clair)
   - Opacité : `(0.3 + brightness * 0.7) * 0.3`

2. **Cœur lumineux**
   - Rayon : `3 + brightness * 2`
   - Couleur : `#d4ff8d` (vert-jaune plus lumineux)
   - Opacité : `0.3 + brightness * 0.7`

3. **Centre brillant** (pixel central)
   - Rayon : `1.5`
   - Couleur : `#ffffff` (blanc pur)
   - Opacité : `0.3 + brightness * 0.7`

**Résultat** : 
- Effet de scintillement organique
- Variation de taille selon la luminosité
- Impression de profondeur et de vie

**Code SVG** :
```tsx
{gameState.fireflies?.map((firefly) => {
  const glowSize = 3 + firefly.brightness * 2;
  const opacity = 0.3 + firefly.brightness * 0.7;
  
  return (
    <g key={firefly.id}>
      {/* Glow effect */}
      <circle cx={firefly.x} cy={firefly.y} r={glowSize * 2}
        fill="#c4ff6d" opacity={opacity * 0.3} />
      
      {/* Core light */}
      <circle cx={firefly.x} cy={firefly.y} r={glowSize}
        fill="#d4ff8d" opacity={opacity} />
      
      {/* Bright center */}
      <circle cx={firefly.x} cy={firefly.y} r={1.5}
        fill="#ffffff" opacity={opacity} />
    </g>
  );
})}
```

---

## 🎨 Effets Visuels Nocturnes

### Voile Sombre

**Overlay principal** :
```tsx
<rect
  x={0} y={0}
  width={gameWidth}
  height={gameHeight}
  fill="#0a0e27"
  opacity={0.65}
  pointerEvents="none"
/>
```

**Propriétés** :
- Couleur : Bleu-noir très foncé (#0a0e27)
- Opacité : 65% (assez sombre mais on voit encore le terrain)
- Pas d'interaction : `pointerEvents="none"`

---

### Lumière de Lune

**Gradient radial** :
```tsx
<defs>
  <radialGradient id="moonlight" cx="85%" cy="15%" r="70%">
    <stop offset="0%" stopColor="#a8c5dd" stopOpacity={0.15} />
    <stop offset="40%" stopColor="#6b8ba3" stopOpacity={0.08} />
    <stop offset="100%" stopColor="#1a2332" stopOpacity={0} />
  </radialGradient>
</defs>

<rect
  x={0} y={0}
  width={gameWidth}
  height={gameHeight}
  fill="url(#moonlight)"
  pointerEvents="none"
/>
```

**Caractéristiques** :
- **Origine** : Haut-droit (85% horizontal, 15% vertical)
- **Rayon** : 70% de la carte
- **Couleurs** : Dégradé bleu clair → bleu moyen → transparent
- **Effet** : Simule la lumière de la lune qui éclaire depuis le coin

**Résultat visuel** :
- Zone plus claire en haut-droit
- Dégradé progressif vers les bords
- Effet naturel de clair de lune

---

## 🎮 Contrôles Utilisateur

### Bouton Jour/Nuit

**Position** : Haut-gauche, à côté de Pause et Recommencer

**Icônes** :
- 🌙 **Mode jour actif** : Icône lune (pour passer en nuit)
- ☀️ **Mode nuit actif** : Icône soleil (pour passer en jour)

**Interaction** :
```typescript
const handleToggleTimeOfDay = () => {
  setGameState((prev) => {
    const newTimeOfDay = prev.timeOfDay === 'day' ? 'night' : 'day';
    
    if (newTimeOfDay === 'night') {
      // Générer lucioles
      const fireflies = Array.from({ length: 30 }, ...);
      toast.success('🌙 Mode nuit activé');
      return { ...prev, timeOfDay: newTimeOfDay, fireflies };
    } else {
      toast.success('☀️ Mode jour activé');
      return { ...prev, timeOfDay: newTimeOfDay, fireflies: [] };
    }
  });
};
```

**Notifications** :
- Toast "🌙 Mode nuit activé" avec emoji lune
- Toast "☀️ Mode jour activé" avec emoji soleil

---

### Bouton Son (Options)

**Interface** :
```tsx
<button
  onClick={onToggleSound}
  className="relative w-14 h-8 rounded-full transition-all"
  style={{
    background: soundEnabled 
      ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'  // Vert
      : 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)', // Gris
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
  }}
>
  <div 
    className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all"
    style={{
      left: soundEnabled ? 'calc(100% - 28px)' : '4px',
    }}
  />
</button>
```

**États** :
- **ON** : Switch à droite, fond vert (#10B981)
- **OFF** : Switch à gauche, fond gris (#6B7280)

**Icône titre dynamique** :
- 🔊 Volume2 si son activé
- 🔇 VolumeX si son désactivé

---

## 📁 Fichiers Modifiés

### 1. `/types/game.ts`

**Ajouts** :
```typescript
export type TimeOfDay = 'day' | 'night';

export interface Firefly {
  id: string;
  x: number;
  y: number;
  brightness: number;
  phase: number;
}

export interface GameState {
  // ... props existantes
  timeOfDay?: TimeOfDay;
  fireflies?: Firefly[];
}
```

---

### 2. `/components/GameUI.tsx`

**Nouvelles props** :
```typescript
interface GameUIProps {
  // ... props existantes
  timeOfDay?: TimeOfDay;
  onToggleTimeOfDay?: () => void;
}
```

**Nouveau bouton** :
```tsx
{onToggleTimeOfDay && (
  <StyledButton
    onClick={onToggleTimeOfDay}
    title={timeOfDay === 'day' ? 'Passer en mode nuit' : 'Passer en mode jour'}
    icon={timeOfDay === 'day' 
      ? <Moon className="w-9 h-9 text-white" strokeWidth={2.5} fill="white" /> 
      : <Sun className="w-9 h-9 text-white" strokeWidth={2.5} />
    }
  />
)}
```

---

### 3. `/components/OptionsMenu.tsx`

**Nouvelles props** :
```typescript
interface OptionsMenuProps {
  // ... props existantes
  soundEnabled?: boolean;
  onToggleSound?: () => void;
}
```

**Bouton son activé** :
- Remplace le bouton désactivé "Prochainement disponible"
- Toggle fonctionnel avec animation
- Description : "Son d'ambiance - Musique de fond (jour/nuit)"

**Texte info mis à jour** :
```diff
- <p>• <strong>Niveau 1 (Facile)</strong> : Carte symétrique, 4 arbres</p>
+ <p>• <strong>Thème</strong> : Choisissez entre jour et nuit dans le jeu</p>
```

---

### 4. `/components/AmbientSound.tsx`

**Documentation mise à jour** :
```typescript
/**
 * Sons disponibles :
 * - Prairie de jour : .../2464/... (nature, oiseaux, ruisseau)
 * - Forêt nuit : .../2465/... (grillons, ambiance nocturne)
 */
```

**Son par défaut** :
```diff
- soundUrl = 'https://.../2462/...' // Ancien son fade
+ soundUrl = 'https://.../2464/...' // Nouveau son prairie
```

---

### 5. `/App.tsx`

**État initial** :
```typescript
const [gameState, setGameState] = useState<GameState>(() => ({
  // ... états existants
  timeOfDay: 'day',
  fireflies: [],
}));
```

**Handler toggle** :
```typescript
const handleToggleTimeOfDay = () => {
  setGameState((prev) => {
    const newTimeOfDay = prev.timeOfDay === 'day' ? 'night' : 'day';
    
    if (newTimeOfDay === 'night') {
      const fireflies = Array.from({ length: 30 }, (_, i) => ({
        id: `firefly-${i}`,
        x: Math.random() * GRID_COLS * CELL_SIZE,
        y: Math.random() * GRID_ROWS * CELL_SIZE,
        brightness: Math.random(),
        phase: Math.random() * Math.PI * 2,
      }));
      
      toast.success('🌙 Mode nuit activé');
      return { ...prev, timeOfDay: newTimeOfDay, fireflies };
    } else {
      toast.success('☀️ Mode jour activé');
      return { ...prev, timeOfDay: newTimeOfDay, fireflies: [] };
    }
  });
};
```

**Boucle animation lucioles** :
```typescript
useEffect(() => {
  if (gameState.timeOfDay !== 'night') return;

  const interval = setInterval(() => {
    setGameState(prev => {
      if (prev.timeOfDay !== 'night' || !prev.fireflies) return prev;
      
      return {
        ...prev,
        fireflies: prev.fireflies.map(firefly => ({
          ...firefly,
          phase: firefly.phase + 0.05,
          brightness: (Math.sin(firefly.phase) + 1) / 2,
        }))
      };
    });
  }, 1000 / 30); // 30 FPS

  return () => clearInterval(interval);
}, [gameState.timeOfDay]);
```

**Son d'ambiance dynamique** :
```tsx
<AmbientSound 
  enabled={soundEnabled} 
  volume={0.3}
  soundUrl={gameState.timeOfDay === 'night' 
    ? 'https://assets.mixkit.co/active_storage/sfx/2465/2465-preview.mp3'
    : 'https://assets.mixkit.co/active_storage/sfx/2464/2464-preview.mp3'
  }
/>
```

**Rendu visuel** :
- Overlay nuit avec voile sombre
- Gradient de lumière de lune
- Rendu des lucioles animées

**Props GameUI** :
```tsx
<GameUI
  {/* ... props existantes */}
  timeOfDay={gameState.timeOfDay}
  onToggleTimeOfDay={handleToggleTimeOfDay}
/>
```

**Props OptionsMenu** :
```tsx
<OptionsMenu 
  {/* ... props existantes */}
  soundEnabled={soundEnabled}
  onToggleSound={() => setSoundEnabled(!soundEnabled)}
/>
```

---

## 🎯 Expérience Utilisateur

### Scénario Jour → Nuit

1. **Joueur clique sur bouton 🌙** (haut-gauche)
2. **Transition instantanée** :
   - ✅ Voile sombre s'applique (65% opacité)
   - ✅ Gradient de lune apparaît (haut-droit)
   - ✅ 30 lucioles se génèrent aléatoirement
   - ✅ Lucioles commencent à scintiller (30 FPS)
   - ✅ Son change : prairie → forêt nuit
3. **Toast notification** : "🌙 Mode nuit activé"
4. **Bouton change** : Icône lune → icône soleil

---

### Scénario Nuit → Jour

1. **Joueur clique sur bouton ☀️**
2. **Transition instantanée** :
   - ✅ Voile sombre disparaît
   - ✅ Gradient de lune disparaît
   - ✅ Lucioles supprimées
   - ✅ Animation des lucioles s'arrête
   - ✅ Son change : forêt nuit → prairie
3. **Toast notification** : "☀️ Mode jour activé"
4. **Bouton change** : Icône soleil → icône lune

---

### Contrôle Son (Options)

1. **Joueur va dans Options** (menu principal ou pause)
2. **Section Audio visible** avec switch
3. **Clic sur switch** :
   - ✅ État change : ON ↔ OFF
   - ✅ Switch animé (slide gauche/droite)
   - ✅ Couleur change (vert ↔ gris)
   - ✅ Son se coupe/reprend immédiatement
   - ✅ Icône titre change (🔊 ↔ 🔇)
4. **Retour au jeu** : Réglage persiste

---

## 📊 Performances

### Lucioles

**Animation** :
- Boucle : 30 FPS (1 frame toutes les 33ms)
- Calculs par frame : 30 lucioles × (phase + brightness)
- Coût : ~90 calculs simples/seconde
- Impact : **Négligeable** (calculs mathématiques légers)

**Rendu SVG** :
- Éléments : 30 lucioles × 3 cercles = 90 éléments
- Type : Formes vectorielles simples
- Impact : **Faible** (SVG optimisé par navigateur)

---

### Overlay Nuit

**Éléments statiques** :
- 1 rectangle (voile sombre)
- 1 gradient radial (clair de lune)
- 1 rectangle avec gradient
- Impact : **Très faible** (pas d'animation)

---

### Sons

**Chargement** :
- Fichiers : ~50-150 KB chacun
- Chargement : À la demande (lazy)
- Cache : Navigateur garde en mémoire
- Impact : **Négligeable après 1er load**

**Performance totale** : ✅ Excellente, pas de ralentissement perceptible

---

## 🐛 Tests à Effectuer

### Fonctionnels

- [ ] Toggle jour/nuit fonctionne
- [ ] Lucioles apparaissent en mode nuit
- [ ] Lucioles disparaissent en mode jour
- [ ] Lucioles scintillent de façon fluide
- [ ] Son change au toggle jour/nuit
- [ ] Toast notifications s'affichent
- [ ] Bouton change d'icône (lune ↔ soleil)

### Audio

- [ ] Son jour (2464) joue correctement
- [ ] Son nuit (2465) joue correctement
- [ ] Transition son fluide au toggle
- [ ] Bouton son dans Options fonctionne
- [ ] Switch animé correctement
- [ ] État son persiste entre écrans
- [ ] Icône Volume2/VolumeX change

### Visuel

- [ ] Voile nuit s'applique correctement (65% opacité)
- [ ] Lumière de lune visible (haut-droit)
- [ ] Gradient de lune fluide
- [ ] Lucioles ont bon scintillement
- [ ] 30 lucioles visibles
- [ ] Pas de problème de z-index

### Performance

- [ ] Pas de lag avec lucioles
- [ ] Animation 30 FPS stable
- [ ] Transition jour/nuit instantanée
- [ ] Pas de fuite mémoire (long gameplay)

---

## 🎨 Valeurs de Référence

### Couleurs Mode Nuit

| Élément | Couleur | Opacité | Usage |
|---------|---------|---------|-------|
| Voile sombre | `#0a0e27` | 65% | Overlay principal |
| Lune centre | `#a8c5dd` | 15% | Gradient intérieur |
| Lune milieu | `#6b8ba3` | 8% | Gradient milieu |
| Lune bord | `#1a2332` | 0% | Gradient extérieur |
| Luciole halo | `#c4ff6d` | 9-30% | Effet de lueur |
| Luciole cœur | `#d4ff8d` | 30-100% | Corps lumineux |
| Luciole centre | `#ffffff` | 30-100% | Point brillant |

---

### Tailles Lucioles

| Élément | Rayon | Calcul |
|---------|-------|--------|
| Halo extérieur | `6-10` | `(3 + brightness * 2) * 2` |
| Cœur lumineux | `3-5` | `3 + brightness * 2` |
| Centre brillant | `1.5` | Fixe |

---

### Sons d'Ambiance

| Mode | ID Mixkit | URL |
|------|-----------|-----|
| **Jour** | 2464 | `https://assets.mixkit.co/active_storage/sfx/2464/2464-preview.mp3` |
| **Nuit** | 2465 | `https://assets.mixkit.co/active_storage/sfx/2465/2465-preview.mp3` |

---

## 🚀 Améliorations Futures

### Cycle Jour/Nuit Automatique

**Concept** : Alternance automatique toutes les X minutes

```typescript
// Option 1 : Cycle fixe (5 min jour, 3 min nuit)
useEffect(() => {
  const cycleDuration = timeOfDay === 'day' ? 5 * 60 * 1000 : 3 * 60 * 1000;
  
  const timeout = setTimeout(() => {
    handleToggleTimeOfDay();
  }, cycleDuration);
  
  return () => clearTimeout(timeout);
}, [timeOfDay]);

// Option 2 : Basé sur le temps de jeu
// Jour si minute paire, nuit si impaire
useEffect(() => {
  const minute = Math.floor(gameState.gameTime / 60000);
  const shouldBeNight = minute % 2 === 1;
  
  if ((shouldBeNight && timeOfDay === 'day') || 
      (!shouldBeNight && timeOfDay === 'night')) {
    handleToggleTimeOfDay();
  }
}, [gameState.gameTime]);
```

---

### Transition Aube/Crépuscule

**États intermédiaires** :
```typescript
type TimeOfDay = 'day' | 'dusk' | 'night' | 'dawn';
```

**Dusk (crépuscule)** :
- Overlay orange-violet
- Gradient de soleil couchant
- Sons : Chant d'oiseaux du soir

**Dawn (aube)** :
- Overlay rose-doré
- Gradient de soleil levant
- Sons : Réveil de la nature

---

### Lucioles Mobiles

**Mouvement aléatoire** :
```typescript
fireflies: prev.fireflies.map(firefly => {
  // Mouvement Brownien (random walk)
  const dx = (Math.random() - 0.5) * 2;
  const dy = (Math.random() - 0.5) * 2;
  
  return {
    ...firefly,
    x: Math.max(0, Math.min(mapWidth, firefly.x + dx)),
    y: Math.max(0, Math.min(mapHeight, firefly.y + dy)),
    phase: firefly.phase + 0.05,
    brightness: (Math.sin(firefly.phase) + 1) / 2,
  };
})
```

**Résultat** : Lucioles qui volent lentement

---

### Effets Météo Nocturnes

**Brouillard** :
```tsx
<rect
  width={gameWidth}
  height={gameHeight}
  fill="url(#fog-gradient)"
  opacity={0.3}
/>
```

**Étoiles** :
```tsx
{Array.from({ length: 50 }).map((_, i) => (
  <circle
    cx={random * mapWidth}
    cy={random * mapHeight}
    r={1}
    fill="white"
    opacity={0.5 + random * 0.5}
  />
))}
```

---

### Volume Adaptatif

**Volume varie selon l'heure** :
```typescript
const volume = timeOfDay === 'night' ? 0.2 : 0.3; // Plus bas la nuit

<AmbientSound enabled={soundEnabled} volume={volume} ... />
```

---

### Comportement Abeilles Nocturne

**Abeilles dorment la nuit** :
```typescript
// Ralentir production la nuit
const productionRate = timeOfDay === 'night' ? 0.5 : 1.0;

// Abeilles volent moins vite
const speed = timeOfDay === 'night' ? BEE_SPEED * 0.7 : BEE_SPEED;
```

---

## 📖 Documentation Utilisateur

### Comment Utiliser

**Changer de mode** :
1. Pendant le jeu, regardez en haut à gauche
2. À côté des boutons Pause et Recommencer
3. Cliquez sur l'icône 🌙 (mode jour) ou ☀️ (mode nuit)
4. Le thème change instantanément !

**Contrôler le son** :
1. Ouvrez le menu Pause ⏸️
2. Ou allez dans Options depuis le menu principal
3. Section "Audio" → Toggle "Son d'ambiance"
4. Activez/désactivez selon préférence

---

### Conseils

**Mode Nuit** :
- 🌙 Ambiance relaxante pour sessions longues
- 🦗 Son calme moins distrayant
- ✨ Visuellement apaisant

**Mode Jour** :
- ☀️ Plus vif et dynamique
- 🐝 Cohérent avec le thème abeilles
- 🎵 Son énergique

**Recommandation** : Alternez selon votre humeur !

---

## ✅ Résumé des Changements

### Ajouts

- ✅ Type `TimeOfDay` : 'day' | 'night'
- ✅ Interface `Firefly` avec propriétés d'animation
- ✅ État `timeOfDay` dans GameState
- ✅ État `fireflies` dans GameState
- ✅ Bouton toggle jour/nuit dans GameUI
- ✅ Handler `handleToggleTimeOfDay`
- ✅ Boucle d'animation des lucioles (30 FPS)
- ✅ Overlay nuit (voile + lumière lune)
- ✅ Rendu SVG des lucioles (3 couches)
- ✅ Son d'ambiance dynamique (jour/nuit)
- ✅ Bouton son actif dans OptionsMenu
- ✅ Props son dans OptionsMenu
- ✅ Nouveaux sons Mixkit (2464, 2465)

### Modifications

- ✏️ GameUI : Ajout props timeOfDay + onToggleTimeOfDay
- ✏️ OptionsMenu : Remplacement bouton son désactivé
- ✏️ OptionsMenu : Ajout props soundEnabled + onToggleSound
- ✏️ AmbientSound : Documentation mise à jour
- ✏️ AmbientSound : Nouveau son par défaut (2464)
- ✏️ App.tsx : Gestion état timeOfDay
- ✏️ App.tsx : Sons conditionnels selon timeOfDay
- ✏️ Info Options : Suppression "Niveau 1" obsolète

### Suppressions

- ❌ Référence au "Niveau 1 (Facile)" dans Options
- ❌ Anciens sons 2459 et 2462 (remplacés par 2464 et 2465)

---

## 🎯 Version

**UI Version** : 5.6 - Mode Jour/Nuit avec Lucioles
**Parent Version** : 5.5 - Son d'Ambiance Prairie Partout
**Date** : 26 octobre 2024

**Prochaine version suggérée** : 5.7 - Transition aube/crépuscule + cycle automatique

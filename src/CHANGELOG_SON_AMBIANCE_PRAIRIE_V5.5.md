# Changelog - Son d'Ambiance Prairie v5.5

## Date: 26 octobre 2024

## 🔊 Son d'Ambiance Global

### 🎵 Modifications Appliquées

Le son d'ambiance joue maintenant **partout dans l'application** (menu, options, jeu) et a été changé pour une ambiance **prairie de jour** plus lumineuse.

---

## 📋 Changements Détaillés

### 1. **Nouveau Son : Prairie de Jour** ☀️

**Ancien son (nuit calme)** :
```
https://assets.mixkit.co/active_storage/sfx/2459/2459-preview.mp3
```
- Ambiance nocturne, calme
- Grillons, sons de nuit
- **Conservé pour future carte de nuit** 🌙

**Nouveau son (prairie jour)** :
```
https://assets.mixkit.co/active_storage/sfx/2462/2462-preview.mp3
```
- Ambiance diurne, lumineuse ✨
- Oiseaux, nature active
- Parfait pour le thème abeilles en journée 🐝

---

### 2. **Fichiers Modifiés**

#### A. `components/AmbientSound.tsx`

**Changements** :
- Suppression de la prop `isPlaying` (le son joue en continu quand activé)
- Ajout de la prop `soundUrl` pour pouvoir changer facilement de son
- Documentation des deux sons disponibles
- Meilleure gestion du cleanup

**Avant** :
```tsx
interface AmbientSoundProps {
  enabled: boolean;
  isPlaying: boolean;
  volume?: number;
}

export function AmbientSound({ enabled, isPlaying, volume = 0.3 }: AmbientSoundProps) {
  // Son en pause si jeu en pause
  if (enabled && isPlaying) {
    audio.play()
  } else {
    audio.pause()
  }
}
```

**Après** :
```tsx
interface AmbientSoundProps {
  enabled: boolean;
  volume?: number;
  soundUrl?: string;
}

/**
 * Sons disponibles :
 * - Prairie de jour (actuel) : https://assets.mixkit.co/active_storage/sfx/2462/2462-preview.mp3
 * - Nuit calme (futur) : https://assets.mixkit.co/active_storage/sfx/2459/2459-preview.mp3
 */
export function AmbientSound({ 
  enabled, 
  volume = 0.3,
  soundUrl = 'https://assets.mixkit.co/active_storage/sfx/2462/2462-preview.mp3'
}: AmbientSoundProps) {
  // Son joue en continu si activé
  if (enabled) {
    audio.play()
  } else {
    audio.pause()
  }
}
```

**Avantages** :
- ✅ Le son d'ambiance continue même si jeu en pause
- ✅ Plus cohérent : l'ambiance est "du monde", pas du gameplay
- ✅ Facilement extensible pour différents types de cartes

---

#### B. `components/MainMenu.tsx`

**Changements** :
- **Supprimé** : Gestion locale du son d'ambiance
- **Supprimé** : `useRef` et `useEffect` pour le son
- Le son est maintenant géré centralement par App.tsx

**Code retiré** (~15 lignes) :
```tsx
const audioRef = useRef<HTMLAudioElement | null>(null);

useEffect(() => {
  audioRef.current = new Audio('https://...');
  audioRef.current.loop = true;
  audioRef.current.volume = 0.3;
  audioRef.current.play().catch(e => console.log('Audio autoplay prevented:', e));

  return () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };
}, []);
```

**Résultat** : Composant plus simple, responsabilité unique.

---

#### C. `App.tsx`

**Ajouts** :
```tsx
// Dans l'écran Menu
if (currentScreen === 'menu') {
  return (
    <>
      <MainMenu ... />
      <AmbientSound enabled={soundEnabled} volume={0.3} />
      <Toaster ... />
    </>
  );
}

// Dans l'écran Options
if (currentScreen === 'options') {
  return (
    <>
      <OptionsMenu ... />
      <AmbientSound enabled={soundEnabled} volume={0.3} />
      <Toaster ... />
    </>
  );
}

// Dans l'écran Jeu
return (
  <div>
    {/* Game SVG */}
    <GameUI ... />
    <AmbientSound enabled={soundEnabled} volume={0.3} />
    {/* Game Over */}
  </div>
);
```

**État du son** :
```tsx
const [soundEnabled, setSoundEnabled] = useState(true); // Son activé par défaut
```

**Contrôle** :
- Via le bouton dans le menu Pause
- Persiste sur tous les écrans

---

## 🎮 Comportement du Son

### Activation/Désactivation

| Écran | Son Joue | Contrôle |
|-------|----------|----------|
| **Menu Principal** | ✅ Oui | Via menu Pause (global) |
| **Options** | ✅ Oui | Via menu Pause (global) |
| **Jeu (en cours)** | ✅ Oui | Via menu Pause |
| **Jeu (en pause)** | ✅ Oui | Via menu Pause |
| **Game Over** | ✅ Oui | Via menu Pause |

**Note importante** : Le son d'ambiance continue même si le jeu est en pause, car il représente l'ambiance du monde, pas du gameplay.

### Volume

- Volume par défaut : **0.3** (30%)
- Volume configurable via la prop `volume`
- Peut être ajusté facilement dans le futur

---

## 🔊 Sons Disponibles

### 1. Prairie de Jour (Actuel) ☀️

**URL** : `https://assets.mixkit.co/active_storage/sfx/2462/2462-preview.mp3`

**Caractéristiques** :
- Oiseaux qui chantent
- Ambiance nature diurne
- Léger vent dans les feuilles
- Sensation lumineuse et positive
- **Parfait pour le jeu d'abeilles en journée** 🐝✨

**Durée** : ~30 secondes en boucle

---

### 2. Nuit Calme (Future Carte Nuit) 🌙

**URL** : `https://assets.mixkit.co/active_storage/sfx/2459/2459-preview.mp3`

**Caractéristiques** :
- Grillons, insectes nocturnes
- Ambiance mystérieuse
- Calme et apaisant
- **Conservé pour future version carte de nuit**

**Utilisation future** :
```tsx
// Dans mapGenerator.ts ou levelGenerator.ts
const isNightMap = mapData.theme === 'night';

// Dans App.tsx
<AmbientSound 
  enabled={soundEnabled} 
  volume={0.3}
  soundUrl={isNightMap 
    ? 'https://assets.mixkit.co/active_storage/sfx/2459/2459-preview.mp3' 
    : 'https://assets.mixkit.co/active_storage/sfx/2462/2462-preview.mp3'
  }
/>
```

---

## 📊 Comparaison Avant/Après

### Avant v5.5

| Écran | Son d'Ambiance | Type de Son |
|-------|----------------|-------------|
| Menu Principal | ✅ Oui | Nuit calme 🌙 |
| Options | ❌ Non | - |
| Jeu (en cours) | ❌ Non | - |
| Jeu (en pause) | ❌ Non | - |

**Problèmes** :
- Son seulement sur menu principal
- Son "nuit" incompatible avec le thème lumineux
- Gestion locale dans MainMenu (duplication)

---

### Après v5.5

| Écran | Son d'Ambiance | Type de Son |
|-------|----------------|-------------|
| Menu Principal | ✅ Oui | Prairie jour ☀️ |
| Options | ✅ Oui | Prairie jour ☀️ |
| Jeu (en cours) | ✅ Oui | Prairie jour ☀️ |
| Jeu (en pause) | ✅ Oui | Prairie jour ☀️ |

**Avantages** :
- ✅ Son partout dans l'app
- ✅ Son cohérent avec le thème
- ✅ Gestion centralisée dans App.tsx
- ✅ Facilement extensible (props soundUrl)
- ✅ Ancien son conservé pour le futur

---

## 🎨 Cohérence Thématique

### Thème du Jeu : Abeilles dans la Forêt 🐝🌳

**Éléments visuels** :
- ☀️ Palette chaude (dorée, marron bois)
- 🌻 Texture hexagonale (ruche)
- 🌳 Arbres verts, étangs bleus
- 🐝 Abeilles jaunes actives

**Son d'ambiance** :
- ✅ **Prairie de jour** : Oiseaux, nature vivante
- ❌ ~~Nuit calme~~ : Grillons, ambiance sombre

**Résultat** : Cohérence audiovisuelle parfaite ! 🎵✨

---

## 🚀 Fonctionnalités Futures

### 1. Cartes Thématiques

Différents sons selon le thème de la carte :

```tsx
// types/game.ts
interface MapTheme {
  id: string;
  name: string;
  ambientSound: string;
  palette: ColorPalette;
}

const THEMES = {
  DAY: {
    id: 'day',
    name: 'Prairie Jour',
    ambientSound: 'https://assets.mixkit.co/.../2462/...',
    palette: { /* couleurs actuelles */ }
  },
  NIGHT: {
    id: 'night',
    name: 'Forêt Nuit',
    ambientSound: 'https://assets.mixkit.co/.../2459/...',
    palette: { /* couleurs sombres */ }
  },
  RAIN: {
    id: 'rain',
    name: 'Pluie',
    ambientSound: 'https://...',
    palette: { /* couleurs grises */ }
  }
};
```

### 2. Transition Jour/Nuit

```tsx
// Cycle jour/nuit progressif
const [timeOfDay, setTimeOfDay] = useState<'day' | 'dusk' | 'night' | 'dawn'>('day');

<AmbientSound 
  enabled={soundEnabled} 
  volume={timeOfDay === 'night' ? 0.2 : 0.3}
  soundUrl={getSoundForTime(timeOfDay)}
/>
```

### 3. Événements Sonores

```tsx
// Son spécial pour événements
const [eventSound, setEventSound] = useState<string | null>(null);

// Tempête, attaque massive, etc.
<AmbientSound 
  enabled={soundEnabled} 
  soundUrl={eventSound || defaultSound}
/>
```

### 4. Slider de Volume

```tsx
// Dans OptionsMenu
const [ambientVolume, setAmbientVolume] = useState(0.3);

<input 
  type="range" 
  min="0" 
  max="1" 
  step="0.1"
  value={ambientVolume}
  onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
/>

<AmbientSound 
  enabled={soundEnabled} 
  volume={ambientVolume}
/>
```

---

## 🔧 Guide d'Utilisation

### Activer/Désactiver le Son

1. **Pendant le jeu** :
   - Cliquer sur le bouton Pause (⏸️)
   - Cliquer sur l'icône de son 🔊/🔇
   - Le son s'active/désactive immédiatement

2. **Persiste sur tous les écrans** :
   - Le réglage reste actif quand vous changez d'écran
   - État `soundEnabled` géré au niveau App.tsx

### Changer de Son (développeur)

**Dans `components/AmbientSound.tsx`** :

Modifier le son par défaut :
```tsx
soundUrl = 'https://votre-nouveau-son.mp3'
```

**Dans `App.tsx`** :

Passer un son différent :
```tsx
<AmbientSound 
  enabled={soundEnabled} 
  volume={0.3}
  soundUrl="https://assets.mixkit.co/active_storage/sfx/XXXX/XXXX-preview.mp3"
/>
```

### Ajouter des Sons Personnalisés

**Option 1 : URL externe**
```tsx
soundUrl="https://votre-site.com/sounds/ambient.mp3"
```

**Option 2 : Fichier local** (avec structure /public)
```tsx
soundUrl="/sounds/custom-ambient.mp3"
```
Placer le fichier dans `/public/sounds/custom-ambient.mp3`

---

## 📁 Structure des Fichiers Son

### Actuelle
```
App (en ligne via CDN Mixkit)
└── AmbientSound component
    └── Son prairie jour (URL directe)
```

### Future (avec fichiers locaux)
```
/public
  /sounds
    ├── ambient-day.mp3       # Prairie jour
    ├── ambient-night.mp3     # Nuit calme
    ├── ambient-rain.mp3      # Pluie
    └── ambient-storm.mp3     # Tempête
```

---

## 🎵 Ressources Sonores

### Mixkit (utilisé actuellement)

**Site** : https://mixkit.co/free-sound-effects/

**Sons d'ambiance nature** :
- Prairie jour : ID 2462
- Nuit calme : ID 2459
- Forêt : ID 2463
- Vent : ID 2470

**Licence** : Gratuit pour usage commercial et personnel

### Alternatives

**Freesound.org**
- Immense bibliothèque
- Licence Creative Commons
- Qualité variable

**OpenGameArt.org**
- Sons pour jeux vidéo
- Licence libre
- Bien catégorisé

---

## 🐛 Dépannage

### Le son ne joue pas

**Cause probable** : Autoplay bloqué par le navigateur

**Solution** :
```tsx
// Le code gère déjà cette erreur
audio.play().catch(err => {
  console.log('Audio playback prevented:', err);
});
```

**Action utilisateur** :
- Cliquer n'importe où dans l'app
- Le navigateur autorisera alors la lecture

### Le son se coupe

**Vérifier** :
1. État `soundEnabled` dans App.tsx
2. Console pour les erreurs
3. URL du fichier son (accessible ?)

### Volume trop fort/faible

**Changer le volume** :
```tsx
<AmbientSound enabled={soundEnabled} volume={0.5} /> // 50%
```

---

## ✅ Checklist Complète

### Modifications Appliquées

- [x] Son d'ambiance dans Menu Principal
- [x] Son d'ambiance dans Options
- [x] Son d'ambiance dans Jeu
- [x] Changement du son pour "prairie jour"
- [x] Conservation référence son "nuit calme"
- [x] Suppression code son dans MainMenu
- [x] Ajout prop `soundUrl` dans AmbientSound
- [x] Documentation des deux sons
- [x] Cleanup mémoire amélioré
- [x] Version mise à jour (5.5)

### Tests à Effectuer

- [ ] Son joue au démarrage du menu
- [ ] Son continue dans Options
- [ ] Son continue dans le jeu
- [ ] Son continue quand jeu en pause
- [ ] Bouton mute/unmute fonctionne
- [ ] Réglage persiste entre écrans
- [ ] Pas de double lecture de son
- [ ] Cleanup correct (pas de fuite mémoire)

---

## 📊 Statistiques

### Code

**Lignes ajoutées** : ~30
- AmbientSound.tsx : +15 (documentation + props)
- App.tsx : +6 (3 instances du composant)

**Lignes supprimées** : ~15
- MainMenu.tsx : -15 (gestion locale du son)

**Gain net** : +15 lignes (pour son global + doc)

### Fichiers Modifiés

1. ✏️ `components/AmbientSound.tsx`
2. ✏️ `components/MainMenu.tsx`
3. ✏️ `App.tsx`

**Total** : 3 fichiers

---

## 🎯 Résumé Exécutif

**Objectif** : Son d'ambiance partout + ambiance "prairie jour"

**Résultat** :
- ✅ Son joue sur **tous les écrans** (menu, options, jeu)
- ✅ Nouveau son **prairie jour** cohérent avec le thème
- ✅ Ancien son **conservé** pour future carte de nuit
- ✅ Gestion **centralisée** dans App.tsx
- ✅ Architecture **extensible** (prop soundUrl)

**Impact UX** :
- 🎵 Immersion sonore continue
- ☀️ Ambiance lumineuse et positive
- 🎮 Cohérence audiovisuelle parfaite
- 🔊 Contrôle simple du son

---

## Version

**UI Version** : 5.5 - Son d'Ambiance Prairie Partout
**Parent Version** : 5.4 - Texture Hexagonale Ruche Menu
**Date** : 26 octobre 2024

**Prochaine version suggérée** : 5.6 - Effets sonores gameplay (construction, attaque, victoire)

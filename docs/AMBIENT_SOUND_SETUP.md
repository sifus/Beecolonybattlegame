# 🎵 Configuration du Son d'Ambiance - Version 5.3

## Date: 25 octobre 2024

## ✅ Système Audio Implémenté

### 1. Composant AmbientSound créé
**Fichier**: `/components/AmbientSound.tsx`

**Fonctionnalités** :
- ✅ Lecture en boucle automatique
- ✅ Contrôle par le bouton Son (🔊/🔇) de l'interface
- ✅ Pause automatique quand le jeu est en pause
- ✅ Volume ajustable (défaut: 30%)
- ✅ Gestion propre du cycle de vie audio

**Props** :
```tsx
interface AmbientSoundProps {
  enabled: boolean;    // Contrôlé par le bouton Son
  isPlaying: boolean;  // Lié à l'état du jeu (pause/play)
  volume?: number;     // Volume (0.0 à 1.0, défaut: 0.3)
}
```

### 2. Intégration dans App.tsx
**Fichier**: `/App.tsx`

**Ajouts** :
```tsx
// Import du composant
import { AmbientSound } from './components/AmbientSound';

// Dans le rendu (ligne ~2306)
<AmbientSound 
  enabled={soundEnabled} 
  isPlaying={gameState.isPlaying}
  volume={0.3}
/>
```

**Comportement** :
- 🎵 Le son joue automatiquement quand le jeu est lancé
- ⏸️ Se met en pause quand le jeu est en pause
- 🔇 S'arrête quand le joueur désactive le son
- 🔊 Reprend quand le joueur réactive le son
- 🔄 Boucle infinie (loop=true)

## 📁 Structure des Dossiers Audio

### Où placer votre fichier MP3

Vous devez créer un dossier `/public/sounds/` et y placer votre fichier audio :

```
/
├── public/
│   └── sounds/
│       └── ambient.mp3    ← VOTRE FICHIER ICI
├── components/
│   ├── AmbientSound.tsx   ← Composant audio
│   └── ...
└── App.tsx
```

### Instructions pour ajouter votre fichier :

1. **Créez le dossier** `/public/sounds/` si nécessaire
2. **Placez votre fichier MP3** nommé `ambient.mp3` dans ce dossier
3. **OU** Renommez votre fichier en `ambient.mp3`

**Alternative** : Si vous voulez garder un nom différent, modifiez cette ligne dans `/components/AmbientSound.tsx` :
```tsx
// Ligne 12
audioRef.current = new Audio('/sounds/ambient.mp3');

// Changez en (exemple) :
audioRef.current = new Audio('/sounds/prairie-vent.mp3');
```

## 🎛️ Paramètres Audio

### Volume
Le volume est actuellement réglé à **0.3** (30%) pour ne pas couvrir les autres sons.

**Pour ajuster le volume**, modifiez dans `/App.tsx` :
```tsx
<AmbientSound 
  enabled={soundEnabled} 
  isPlaying={gameState.isPlaying}
  volume={0.3}  // ← Changez cette valeur (0.0 = muet, 1.0 = 100%)
/>
```

**Recommandations** :
- **0.2** : Très discret, fond sonore subtil
- **0.3** : Valeur par défaut, ambiance présente mais douce
- **0.4-0.5** : Plus présent, pour ambiance immersive
- **0.6+** : Fort, peut couvrir les autres sons

### Format Audio Supporté

**Formats recommandés** :
- ✅ **MP3** (le plus compatible)
- ✅ **OGG** (bonne qualité, bonne compression)
- ✅ **WAV** (haute qualité mais plus lourd)
- ✅ **M4A/AAC** (bonne compression)

**Note** : Le navigateur choisit automatiquement le format qu'il peut lire.

## 🎮 Comportement du Son

### Cycle de vie complet

```
Début de partie
  ↓
Son activé (soundEnabled = true)
  ↓
Jeu en cours (isPlaying = true)
  ↓
🎵 SON JOUE EN BOUCLE
  
[Joueur clique Pause ⏸️]
  ↓
isPlaying = false
  ↓
🔇 SON EN PAUSE

[Joueur clique Play ▶️]
  ↓
isPlaying = true
  ↓
🎵 SON REPREND

[Joueur clique 🔇 (désactiver son)]
  ↓
soundEnabled = false
  ↓
🔇 SON ARRÊTÉ (même si jeu en cours)

[Joueur clique 🔊 (activer son)]
  ↓
soundEnabled = true
  ↓
🎵 SON REPREND (si jeu en cours)
```

### Table de vérité

| soundEnabled | isPlaying | Résultat |
|--------------|-----------|----------|
| ✅ true      | ✅ true   | 🎵 SON JOUE |
| ✅ true      | ❌ false  | 🔇 Pause |
| ❌ false     | ✅ true   | 🔇 Muet |
| ❌ false     | ❌ false  | 🔇 Muet |

**Logique** : Le son joue **UNIQUEMENT** si les deux conditions sont vraies.

## 🔧 Détails Techniques

### Composant AmbientSound.tsx

```tsx
export function AmbientSound({ enabled, isPlaying, volume = 0.3 }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Créer l'élément audio une seule fois
    if (!audioRef.current) {
      audioRef.current = new Audio('/sounds/ambient.mp3');
      audioRef.current.loop = true;      // Boucle infinie
      audioRef.current.volume = volume;  // Volume initial
    }

    const audio = audioRef.current;

    // Gérer play/pause selon l'état
    if (enabled && isPlaying) {
      audio.play().catch(err => {
        // Gestion d'erreur (autoplay bloqué par navigateur)
        console.log('Audio playback prevented:', err);
      });
    } else {
      audio.pause();
    }

    // Cleanup à la destruction
    return () => {
      if (audio) {
        audio.pause();
      }
    };
  }, [enabled, isPlaying, volume]);

  return null; // Composant invisible
}
```

### Gestion des erreurs Autoplay

**Problème** : Les navigateurs modernes bloquent l'autoplay audio jusqu'à ce que l'utilisateur interagisse.

**Solution implémentée** :
- `.catch()` pour gérer l'erreur silencieusement
- Le son démarrera dès que le joueur clique dans le jeu

**Alternative** (si besoin) :
Vous pouvez ajouter un bouton "Démarrer avec le son" au menu principal.

## 📊 Recommandations Audio

### Pour un son de prairie luxuriante avec vent

**Caractéristiques audio recommandées** :
- 🌿 **Durée** : 30-60 secondes minimum (pour éviter une boucle trop courte)
- 🎵 **Débit** : 128-192 kbps MP3 (bon compromis qualité/taille)
- 🔊 **Mixage** : Fade in/out aux extrémités pour boucle sans coupure
- 🌾 **Éléments** : Oiseaux doux, vent léger, bruissement de feuilles
- 📦 **Taille** : < 1-2 MB idéalement

### Optimisation de la boucle

Pour une boucle parfaite sans coupure :
1. **Fade in** au début (0.5s)
2. **Fade out** à la fin (0.5s)
3. **Durée identique** des mesures audio
4. **Point de coupure** au même niveau sonore

**Outils gratuits** :
- Audacity (gratuit, open-source)
- Online Audio Cutter
- MP3Cut

## 🎨 Intégration UI

### Bouton Son existant (GameUI.tsx)

Le son d'ambiance est contrôlé par le même bouton que les autres sons :

```
Menu Pause → Options → 🔊 Son
```

**Affichage** :
- 🔊 Volume2 icon : Son activé
- 🔇 VolumeX icon : Son désactivé

**Toggle** : Switchbulle vert/gris selon l'état

### Pas de contrôle séparé

Pour l'instant, il n'y a **pas** de contrôle de volume séparé pour l'ambiance.

**Améliorations futures possibles** :
- Slider de volume pour musique d'ambiance
- Slider de volume pour effets sonores (séparés)
- Préréglages (Discret / Normal / Immersif)

## 🐛 Troubleshooting

### Le son ne joue pas

**Vérifications** :
1. ✅ Fichier `/public/sounds/ambient.mp3` existe ?
2. ✅ Nom du fichier exact (sensible à la casse) ?
3. ✅ Format MP3 valide ?
4. ✅ Bouton son activé dans le jeu ? (🔊)
5. ✅ Jeu en cours (pas en pause) ? (▶️)

### Le son coupe/reprend bizarrement

**Possible causes** :
- Fichier audio corrompu
- Boucle mal découpée (coupure audible)
- Problème de performance du navigateur

**Solutions** :
- Tester avec un autre fichier MP3
- Vérifier que la boucle est propre (fade in/out)
- Réduire le volume si CPU surchargé

### Le son démarre avec un délai

**Normal** : Les navigateurs peuvent bloquer l'autoplay.

**Solution** : Le son démarrera après la première interaction du joueur (clic).

## 🚀 Améliorations Futures

### Idées d'extension du système audio

1. **Musique dynamique**
   - Ambiance calme en temps normal
   - Musique intense pendant les combats
   - Transition douce entre les états

2. **Effets sonores**
   - Construction de ruche : *bzzzz* + son de construction
   - Abeilles attaquent : *buzzing angry*
   - Victoire : Fanfare joyeuse
   - Défaite : Son triste

3. **Contrôles avancés**
   - Volume séparé musique/SFX
   - Choix de thèmes musicaux
   - Visualisateur audio

4. **Audio spatial**
   - Son panoramique selon position des abeilles
   - Echo pour grandes distances
   - Effet de proximité

## 📝 Checklist de Configuration

### Pour l'utilisateur

- [ ] Créer le dossier `/public/sounds/`
- [ ] Placer le fichier MP3 dans le dossier
- [ ] Renommer en `ambient.mp3` (ou modifier le code)
- [ ] Tester dans le navigateur
- [ ] Ajuster le volume si nécessaire (ligne 2309 de App.tsx)
- [ ] Vérifier que la boucle est propre

### Fichier à fournir

**Vous avez mentionné avoir un MP3 à transférer.**

**Options** :
1. Le placer dans `/public/sounds/ambient.mp3`
2. Me le transférer pour que je l'intègre
3. Utiliser un lien externe temporairement

**Note** : Si vous utilisez un lien externe (ex: hébergement cloud), modifiez :
```tsx
// Dans AmbientSound.tsx ligne 12
audioRef.current = new Audio('https://votre-lien.com/audio.mp3');
```

## 🎵 Exemple de Structure Complète

```
/
├── public/
│   └── sounds/
│       ├── ambient.mp3           ← Son d'ambiance (prairie + vent)
│       ├── bee-attack.mp3        ← (futur) Son d'attaque
│       ├── hive-build.mp3        ← (futur) Son construction
│       └── victory.mp3           ← (futur) Son victoire
│
├── components/
│   ├── AmbientSound.tsx          ← Composant audio d'ambiance
│   └── SoundEffect.tsx           ← (futur) Composant SFX
│
└── App.tsx                       ← Intégration
```

## Version
**UI Version**: 5.3 - Ambient Sound System
**Parent Version**: 5.2 - Help Panel Overlay + Bottom Toasts

## 🐝 Prêt à l'emploi !

Le système est maintenant prêt. **Il ne manque que votre fichier MP3** !

Placez-le dans `/public/sounds/ambient.mp3` et le son jouera automatiquement pendant le jeu. 🎵🌿✨

# 🎵 Guide : Ajouter le Fichier MP3 sur Mac (Figma Make)

## Date: 25 octobre 2024

## 📁 Structure des Dossiers Requise

Dans Figma Make, vous devez créer la structure suivante :

```
/
├── public/              ← Créer ce dossier
│   └── sounds/          ← Créer ce sous-dossier
│       └── ambient.mp3  ← Placer votre fichier MP3 ici
├── components/
├── styles/
└── ...
```

## 🔧 Instructions Étape par Étape

### Option 1 : Via l'Interface Figma Make (Recommandé)

1. **Dans Figma Make**, cherchez l'arborescence de fichiers (panneau de gauche)

2. **Créez le dossier `public`** :
   - Clic droit dans la racine du projet
   - "New Folder" ou "Nouveau dossier"
   - Nommez-le : `public`

3. **Créez le sous-dossier `sounds`** :
   - Entrez dans le dossier `public`
   - Clic droit → "New Folder"
   - Nommez-le : `sounds`

4. **Ajoutez votre fichier MP3** :
   - Entrez dans le dossier `sounds`
   - Clic droit → "Upload File" ou glissez-déposez
   - Sélectionnez votre fichier MP3
   - **Important** : Renommez-le en `ambient.mp3`

### Option 2 : Si Figma Make n'a pas d'upload de fichiers

Si l'interface ne permet pas d'uploader des fichiers :

**Vous devrez** :
1. **Héberger le fichier MP3 en ligne** (Dropbox, Google Drive, etc.)
2. **Obtenir un lien direct** vers le fichier
3. **Modifier le code** pour utiliser ce lien

**Modification du code** (si nécessaire) :

Dans `/components/AmbientSound.tsx` ligne 12, changez :
```tsx
// Code actuel
audioRef.current = new Audio('/sounds/ambient.mp3');

// Changez en (avec votre lien)
audioRef.current = new Audio('https://votre-lien-direct.com/ambient.mp3');
```

⚠️ **Important** : Le lien doit être un lien **DIRECT** vers le fichier MP3, pas une page de partage.

**Exemples de liens directs** :
- ✅ `https://dl.dropboxusercontent.com/s/abc123/ambient.mp3`
- ✅ `https://drive.google.com/uc?export=download&id=ABC123`
- ❌ `https://www.dropbox.com/s/abc123/ambient.mp3` (page de partage)

## 🎵 Vérification du Nom du Fichier

**Le fichier DOIT s'appeler exactement** :
```
ambient.mp3
```

**Pas** :
- ❌ `Ambient.mp3` (majuscule)
- ❌ `ambient.MP3` (extension en majuscules)
- ❌ `ambient (1).mp3` (avec parenthèses)
- ❌ `prairie-vent.mp3` (autre nom)

**Si vous voulez garder un autre nom**, modifiez le code :
```tsx
// Dans /components/AmbientSound.tsx ligne 12
audioRef.current = new Audio('/sounds/votre-nom.mp3');
```

## 🖥️ Spécificités Mac

### Finder (si vous avez accès aux fichiers localement)

1. Ouvrez **Finder**
2. Naviguez vers le dossier du projet Figma Make
3. Créez `public/sounds/` si nécessaire
4. Glissez-déposez votre MP3 dedans
5. Renommez-le en `ambient.mp3`

### Extensions de Fichiers sur Mac

Par défaut, macOS **cache les extensions** de fichiers.

**Pour afficher les extensions** :
1. Ouvrez **Finder**
2. Menu **Finder** → **Préférences** (ou **Réglages**)
3. Onglet **Avancé**
4. Cochez ✅ **"Afficher toutes les extensions de nom de fichier"**

Cela vous permettra de vérifier que le fichier est bien `.mp3` et pas `.mp3.m4a` ou autre.

## 🔍 Vérification que ça Fonctionne

### Test 1 : Vérifier le chemin

Le fichier doit être accessible à l'URL :
```
http://localhost:XXXX/sounds/ambient.mp3
```

Remplacez `XXXX` par le port de votre serveur de développement.

### Test 2 : Console du navigateur

1. Ouvrez le jeu dans le navigateur
2. Appuyez sur **F12** (ou **Cmd + Option + I** sur Mac)
3. Allez dans l'onglet **Console**
4. Cherchez des erreurs comme :
   - ❌ `404 Not Found: /sounds/ambient.mp3`
   - ❌ `Failed to load resource`

**Si vous voyez ces erreurs** : Le fichier n'est pas au bon endroit.

### Test 3 : Audio fonctionne

1. Lancez une partie
2. Le bouton son doit être activé (🔊)
3. Le jeu doit être en cours (▶️)
4. Vous devriez entendre le son d'ambiance

**Si pas de son** :
- Vérifiez le volume de votre Mac
- Vérifiez que le bouton son est bien activé dans le jeu
- Vérifiez la console pour les erreurs

## 📦 Format du Fichier MP3

### Format Recommandé

**Pour une meilleure compatibilité** :
- Format : **MP3**
- Débit : **128-192 kbps** (bon compromis)
- Fréquence : **44.1 kHz** (standard)
- Canaux : **Stéréo** ou **Mono** (peu importe)
- Durée : **30-60 secondes minimum** (pour éviter boucle trop courte)

### Convertir sur Mac (si nécessaire)

Si votre fichier est dans un autre format (M4A, WAV, etc.) :

**Avec iTunes/Musique** :
1. Ouvrez l'app **Musique** (anciennement iTunes)
2. Importez votre fichier audio
3. Sélectionnez le fichier
4. Menu **Fichier** → **Convertir** → **Créer une version MP3**
5. Le MP3 apparaît dans votre bibliothèque

**Avec QuickTime Player** :
1. Ouvrez le fichier dans **QuickTime Player**
2. Menu **Fichier** → **Exporter en tant que** → **Audio seulement**
3. (Puis convertir avec Musique si nécessaire)

**Avec des outils en ligne** :
- https://cloudconvert.com/
- https://convertio.co/
- https://online-audio-converter.com/

## 🎛️ Ajuster le Volume (si nécessaire)

Le volume est actuellement à **30%** (0.3).

**Pour changer le volume** :

Dans `/App.tsx` ligne ~2309 :
```tsx
<AmbientSound 
  enabled={soundEnabled} 
  isPlaying={gameState.isPlaying}
  volume={0.3}  ← Changez cette valeur
/>
```

**Valeurs recommandées** :
- `0.2` : Très discret (20%)
- `0.3` : Valeur actuelle (30%)
- `0.4` : Plus présent (40%)
- `0.5` : Moitié du volume (50%)

## 🐛 Problèmes Courants

### Problème 1 : "Failed to load resource: the server responded with a status of 404"

**Cause** : Le fichier n'est pas trouvé.

**Solutions** :
1. Vérifiez que le dossier `public/sounds/` existe
2. Vérifiez que le fichier s'appelle exactement `ambient.mp3`
3. Vérifiez que le fichier est bien dans `public/sounds/` et pas ailleurs

### Problème 2 : "Audio playback prevented"

**Cause** : Le navigateur bloque l'autoplay audio.

**Solution** : C'est normal ! Le son démarrera dès que vous cliquez dans le jeu.

### Problème 3 : Le son ne boucle pas correctement (coupure audible)

**Cause** : Le fichier MP3 n'a pas de fade in/out.

**Solution** : Éditez le fichier avec **Audacity** (gratuit) :
1. Téléchargez Audacity : https://www.audacityteam.org/
2. Ouvrez votre MP3
3. Sélectionnez le début (0.5s)
4. Menu **Effet** → **Fondu en ouverture**
5. Sélectionnez la fin (0.5s)
6. Menu **Effet** → **Fondu en fermeture**
7. Exportez en MP3

### Problème 4 : Le fichier est trop gros

**Cause** : MP3 à trop haute qualité ou trop long.

**Solution** : Réduire la qualité avec Audacity :
1. Ouvrez le MP3 dans Audacity
2. Menu **Fichier** → **Exporter** → **Exporter en MP3**
3. Choisissez **Débit constant** : **128 kbps**
4. Sauvegardez

**Taille recommandée** : < 1-2 MB

## 📊 Récapitulatif

| Étape | Action | Résultat |
|-------|--------|----------|
| 1 | Créer `/public/sounds/` | Dossiers créés |
| 2 | Placer `ambient.mp3` dedans | Fichier uploadé |
| 3 | Lancer le jeu | Son joue automatiquement |
| 4 | Ajuster volume si besoin | Volume optimisé |

## 🚀 Alternatives Si Ça Ne Marche Pas

### Solution Temporaire : Lien Externe

Si vous ne parvenez pas à uploader le fichier dans Figma Make :

1. **Hébergez le MP3 en ligne** (Dropbox, Google Drive, etc.)
2. **Modifiez AmbientSound.tsx** :

```tsx
// Ligne 12 de /components/AmbientSound.tsx
audioRef.current = new Audio('VOTRE_LIEN_DIRECT_ICI');
```

### Services d'Hébergement MP3 Gratuits

- **Dropbox** : Créez un lien partagé, remplacez `www.dropbox.com` par `dl.dropboxusercontent.com`
- **Google Drive** : Utilisez un outil comme https://sites.google.com/site/gdocs2direct/
- **GitHub** : Uploadez dans un repo public (raw.githubusercontent.com)

## ✅ Checklist Finale

Avant de tester :

- [ ] Dossier `public/` créé à la racine
- [ ] Dossier `sounds/` créé dans `public/`
- [ ] Fichier MP3 placé dans `public/sounds/`
- [ ] Fichier renommé exactement `ambient.mp3`
- [ ] Format : MP3 valide (128-192 kbps)
- [ ] Taille : < 2 MB
- [ ] Boucle : Fade in/out si possible

**Puis** :
- [ ] Lancez le jeu
- [ ] Vérifiez le bouton son (🔊)
- [ ] Vérifiez le jeu en cours (▶️)
- [ ] Écoutez ! 🎵

## 📧 Besoin d'Aide ?

Si ça ne fonctionne toujours pas :

1. **Vérifiez la console** (F12 sur navigateur)
2. **Notez les messages d'erreur** exacts
3. **Vérifiez que le fichier existe** à l'emplacement exact
4. **Testez avec un autre fichier MP3** simple (pour exclure un problème de fichier corrompu)

## 🎵 Prêt !

Une fois le fichier en place, le son d'ambiance jouera automatiquement pendant vos parties. Bon jeu ! 🐝✨

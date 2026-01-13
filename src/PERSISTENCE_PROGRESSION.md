# 💾 Système de Persistance de la Progression

## Vue d'ensemble

Le jeu Rush utilise le **localStorage** du navigateur pour sauvegarder automatiquement la progression du joueur entre les sessions. Toutes les données sont stockées localement sur l'appareil de l'utilisateur.

## 🎯 Données Sauvegardées

### 1. Progression des Niveaux
- **Clé:** `rush_level_progress`
- **Contenu:**
  - Niveau actuel et sous-niveau
  - État de déverrouillage de chaque niveau
  - Nombre d'étoiles gagnées par sous-niveau
  - Statut de complétion de chaque niveau

### 2. Préférences Audio
- **Clé:** `rush_sound_enabled`
- **Contenu:** `true` ou `false`
- **Défaut:** `true`

### 3. Mode Jour/Nuit
- **Clé:** `rush_time_of_day`
- **Contenu:** `'day'` ou `'night'`
- **Défaut:** `'day'`

### 4. Version du Jeu
- **Clé:** `rush_game_version`
- **Contenu:** Numéro de version actuel (`1.0.0`)
- **Utilité:** Permet de gérer les migrations futures

## 🔄 Fonctionnement Automatique

### Sauvegarde
La sauvegarde se fait **automatiquement** grâce à des `useEffect` React :
- ✅ Dès qu'un niveau est complété
- ✅ Dès qu'une étoile est gagnée
- ✅ Dès qu'un sous-niveau est déverrouillé
- ✅ Dès que l'utilisateur change une préférence

```typescript
// Exemple de sauvegarde automatique
useEffect(() => {
  if (isStorageAvailable()) {
    saveLevelProgress(levelProgress);
  }
}, [levelProgress]); // Se déclenche à chaque changement
```

### Chargement
Le chargement se fait **au démarrage** de l'application :
- 📖 Les préférences sont chargées lors de l'initialisation des états
- 📖 La progression est restaurée depuis le localStorage
- 📖 Si aucune sauvegarde n'existe, les valeurs par défaut sont utilisées

```typescript
// Exemple de chargement au démarrage
const [levelProgress, setLevelProgress] = useState<LevelProgress>(() => 
  loadLevelProgress()
);
```

## 📁 Structure des Données Sauvegardées

### Exemple de Progression
```json
{
  "version": "1.0.0",
  "timestamp": 1698345600000,
  "progress": {
    "currentLevel": 1,
    "currentSubLevel": 3,
    "levels": [
      {
        "id": 1,
        "title": "Tutoriel",
        "unlocked": true,
        "completed": false,
        "stars": 9,
        "subLevels": [
          {
            "id": "1-1",
            "type": "movement",
            "completed": true,
            "stars": 3
          },
          {
            "id": "1-2",
            "type": "build_hive",
            "completed": true,
            "stars": 3
          },
          {
            "id": "1-3",
            "type": "double_hive",
            "completed": true,
            "stars": 3
          },
          // ...
        ]
      }
      // ... autres niveaux
    ]
  }
}
```

## 🛠️ API Disponible

### Fichier: `/utils/storage.ts`

#### Fonctions de Progression
```typescript
// Sauvegarder la progression
saveLevelProgress(progress: LevelProgress): void

// Charger la progression
loadLevelProgress(): LevelProgress

// Réinitialiser la progression
resetLevelProgress(): void
```

#### Fonctions de Préférences
```typescript
// Son
saveSoundPreference(enabled: boolean): void
loadSoundPreference(): boolean

// Jour/Nuit
saveTimeOfDayPreference(timeOfDay: 'day' | 'night'): void
loadTimeOfDayPreference(): 'day' | 'night'
```

#### Fonctions Utilitaires
```typescript
// Vérifier la disponibilité du localStorage
isStorageAvailable(): boolean

// Exporter toutes les données (backup)
exportGameData(): string

// Importer des données (restore)
importGameData(jsonData: string): boolean
```

## 🔒 Sécurité et Fiabilité

### Gestion des Erreurs
Toutes les opérations de stockage sont enveloppées dans des `try/catch` :
- ❌ Si le localStorage est désactivé → valeurs par défaut
- ❌ Si les données sont corrompues → progression réinitialisée
- ❌ Si l'espace est insuffisant → erreur loggée dans la console

### Logs de Debug
Chaque opération importante est loggée :
```
[Storage] Progression sauvegardée : {...}
[Storage] Progression chargée depuis 26/10/2025 15:30:45
[Storage] Progression réinitialisée
```

## 📱 Compatibilité

### Navigateurs Supportés
- ✅ Chrome / Edge (Desktop & Mobile)
- ✅ Safari (Desktop & iOS)
- ✅ Firefox (Desktop & Mobile)
- ✅ Tous les navigateurs modernes supportant localStorage

### Limites Techniques
- **Taille maximale:** ~5-10 MB selon le navigateur
- **Portée:** Données accessibles uniquement sur le même domaine
- **Durée:** Permanente (sauf si l'utilisateur vide le cache)

### Mode Privé / Incognito
⚠️ En mode navigation privée :
- Les données sont sauvegardées temporairement
- Elles sont **effacées** quand la fenêtre est fermée

## 🎮 Expérience Utilisateur

### Avantages
1. **Progression Automatique** : Aucune action requise de l'utilisateur
2. **Cross-Session** : Reprendre exactement où on s'est arrêté
3. **Hors Ligne** : Fonctionne même sans connexion internet
4. **Instantané** : Pas de délai de chargement

### Réinitialisation
L'utilisateur peut réinitialiser sa progression depuis le menu Options :
1. Aller dans **Options** ⚙️
2. Section **Progression**
3. Cliquer sur **Réinitialiser**
4. ✅ Confirmation instantanée

## 🔮 Évolutions Futures

### Migrations de Version
Le système est préparé pour gérer les mises à jour futures :
```typescript
if (data.version !== CURRENT_VERSION) {
  console.warn('Version différente, migration nécessaire');
  // Logique de migration à ajouter ici
}
```

### Fonctionnalités Possibles
- 🔄 Synchronisation Cloud (Firebase, Supabase)
- 💾 Export/Import manuel de sauvegarde
- 👥 Profils multiples
- 📊 Statistiques détaillées
- 🏆 Achievements/Trophées

## 📝 Notes de Développement

### Tester le Système
```javascript
// Dans la console du navigateur

// Voir toutes les données sauvegardées
localStorage.getItem('rush_level_progress')
localStorage.getItem('rush_sound_enabled')
localStorage.getItem('rush_time_of_day')

// Effacer manuellement
localStorage.clear()

// Tester la disponibilité
isStorageAvailable()
```

### Best Practices
1. ✅ Toujours vérifier `isStorageAvailable()` avant d'utiliser localStorage
2. ✅ Envelopper toutes les opérations dans des `try/catch`
3. ✅ Logger les erreurs pour faciliter le debug
4. ✅ Fournir des valeurs par défaut en cas d'échec
5. ✅ Sauvegarder uniquement quand nécessaire (éviter les sauvegardes à chaque frame)

---

**Dernière mise à jour:** 26 octobre 2025  
**Version:** 1.0.0  
**Auteur:** Système de stockage Rush

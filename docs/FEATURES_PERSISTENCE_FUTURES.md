# 🚀 Fonctionnalités Futures - Système de Persistance

## Fonctionnalités Déjà Implémentées ✅

- ✅ Sauvegarde automatique de la progression
- ✅ Sauvegarde des préférences (son, jour/nuit)
- ✅ Chargement au démarrage
- ✅ Réinitialisation manuelle
- ✅ Gestion des erreurs
- ✅ Système de versioning
- ✅ Logs de debug

## Fonctionnalités à Ajouter 🔮

### 1. Export/Import Manuel de Sauvegarde

#### Objectif
Permettre aux joueurs de sauvegarder et restaurer leur progression manuellement, utile pour :
- Changer d'appareil
- Créer des backups
- Partager une progression

#### Implémentation

**Bouton Export (dans Options)**
```typescript
const handleExportData = () => {
  const data = exportGameData();
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rush_save_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success('💾 Sauvegarde exportée !');
};
```

**Bouton Import (dans Options)**
```typescript
const handleImportData = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    
    const text = await file.text();
    const success = importGameData(text);
    
    if (success) {
      toast.success('✅ Sauvegarde importée !');
      window.location.reload(); // Recharger pour appliquer
    } else {
      toast.error('❌ Fichier invalide');
    }
  };
  input.click();
};
```

**UI à ajouter dans OptionsMenu.tsx**
```tsx
{/* Section Export/Import */}
<div className="border-b pb-4">
  <h3 className="mb-3 flex items-center gap-2 text-amber-950">
    💾 Sauvegarde
  </h3>
  <div className="space-y-2">
    <button onClick={handleExportData}>
      Exporter la progression
    </button>
    <button onClick={handleImportData}>
      Importer une sauvegarde
    </button>
  </div>
</div>
```

---

### 2. Synchronisation Cloud (Firebase/Supabase)

#### Objectif
Sauvegarder la progression dans le cloud pour :
- Synchronisation multi-appareils
- Sauvegarde permanente
- Classements en ligne

#### Architecture
```
localStorage (local) ←→ Cloud Database
     ↓                        ↓
  Backup rapide          Backup permanent
  Hors ligne             Multi-appareils
```

#### Implémentation avec Supabase

**1. Schéma de base de données**
```sql
CREATE TABLE player_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  level_progress JSONB NOT NULL,
  sound_enabled BOOLEAN DEFAULT true,
  time_of_day TEXT DEFAULT 'day',
  updated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index pour requêtes rapides
CREATE INDEX idx_player_progress_user ON player_progress(user_id);
```

**2. Service de synchronisation**
```typescript
// /utils/cloudSync.ts
import { supabase } from './supabase';

export async function syncToCloud(progress: LevelProgress) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from('player_progress')
    .upsert({
      user_id: user.id,
      level_progress: progress,
      sound_enabled: loadSoundPreference(),
      time_of_day: loadTimeOfDayPreference(),
      updated_at: new Date().toISOString()
    });
}

export async function syncFromCloud(): Promise<LevelProgress | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('player_progress')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return data?.level_progress || null;
}
```

**3. Stratégie de synchronisation**
```typescript
// Au démarrage
useEffect(() => {
  const initializeProgress = async () => {
    // 1. Charger depuis localStorage (rapide)
    const localProgress = loadLevelProgress();
    setLevelProgress(localProgress);

    // 2. Vérifier le cloud (si connecté)
    const cloudProgress = await syncFromCloud();
    
    if (cloudProgress) {
      // Comparer les timestamps et prendre le plus récent
      const cloudTime = new Date(cloudProgress.timestamp);
      const localTime = new Date(localProgress.timestamp);
      
      if (cloudTime > localTime) {
        setLevelProgress(cloudProgress);
        saveLevelProgress(cloudProgress); // Mettre à jour local
        toast.info('☁️ Progression synchronisée depuis le cloud');
      }
    }
  };

  initializeProgress();
}, []);

// À chaque changement
useEffect(() => {
  if (isStorageAvailable()) {
    saveLevelProgress(levelProgress); // Local (instantané)
    
    // Cloud (debounced pour éviter trop de requêtes)
    const timeoutId = setTimeout(() => {
      syncToCloud(levelProgress);
    }, 2000);
    
    return () => clearTimeout(timeoutId);
  }
}, [levelProgress]);
```

---

### 3. Profils Multiples

#### Objectif
Permettre plusieurs sauvegardes sur le même appareil :
- Joueur 1, Joueur 2, etc.
- Différents modes de jeu
- Progression séparée

#### Structure localStorage
```typescript
// Au lieu de 'rush_level_progress'
// Utiliser 'rush_profile_1_progress', 'rush_profile_2_progress'

const PROFILES = ['Joueur 1', 'Joueur 2', 'Joueur 3'];

function saveProfile(profileId: number, progress: LevelProgress) {
  localStorage.setItem(
    `rush_profile_${profileId}_progress`,
    JSON.stringify(progress)
  );
}

function loadProfile(profileId: number): LevelProgress {
  const saved = localStorage.getItem(`rush_profile_${profileId}_progress`);
  return saved ? JSON.parse(saved) : getInitialProgress();
}
```

#### UI de sélection de profil
```tsx
// Nouvel écran 'profile-select' avant le menu
function ProfileSelect({ onSelectProfile }) {
  return (
    <div className="profile-grid">
      {PROFILES.map((name, index) => {
        const progress = loadProfile(index);
        const totalStars = calculateTotalStars(progress);
        
        return (
          <button 
            key={index}
            onClick={() => onSelectProfile(index)}
            className="profile-card"
          >
            <h3>{name}</h3>
            <p>⭐ {totalStars} étoiles</p>
            <p>Niveau {progress.currentLevel}</p>
          </button>
        );
      })}
    </div>
  );
}
```

---

### 4. Statistiques Détaillées

#### Objectif
Tracker des métriques de gameplay :
- Temps de jeu total
- Niveaux rejoués
- Abeilles perdues
- Victoires parfaites (3 étoiles)

#### Nouvelle structure de données
```typescript
interface PlayerStats {
  totalPlayTime: number; // en secondes
  levelsCompleted: number;
  perfectVictories: number; // 3 étoiles
  beesLost: number;
  hivesBuilt: number;
  enemiesDefeated: number;
  lastPlayed: string; // ISO date
  playStreak: number; // jours consécutifs
}

// Sauvegarder dans localStorage
localStorage.setItem('rush_player_stats', JSON.stringify(stats));
```

#### Tracking automatique
```typescript
// Dans App.tsx
const [playerStats, setPlayerStats] = useState<PlayerStats>(() => 
  loadPlayerStats()
);

// Au niveau complété
const handleLevelComplete = (stars: number) => {
  setPlayerStats(prev => ({
    ...prev,
    levelsCompleted: prev.levelsCompleted + 1,
    perfectVictories: stars === 3 
      ? prev.perfectVictories + 1 
      : prev.perfectVictories,
    lastPlayed: new Date().toISOString()
  }));
};

// Suivre les abeilles perdues
useEffect(() => {
  beesToRemove.forEach(() => {
    setPlayerStats(prev => ({
      ...prev,
      beesLost: prev.beesLost + 1
    }));
  });
}, [beesToRemove]);
```

#### Écran de statistiques
```tsx
function StatsScreen({ stats }: { stats: PlayerStats }) {
  const hours = Math.floor(stats.totalPlayTime / 3600);
  const minutes = Math.floor((stats.totalPlayTime % 3600) / 60);
  
  return (
    <div className="stats-grid">
      <StatCard 
        icon="⏱️" 
        label="Temps de jeu"
        value={`${hours}h ${minutes}m`}
      />
      <StatCard 
        icon="✅" 
        label="Niveaux complétés"
        value={stats.levelsCompleted}
      />
      <StatCard 
        icon="⭐" 
        label="Victoires parfaites"
        value={stats.perfectVictories}
      />
      <StatCard 
        icon="🐝" 
        label="Abeilles perdues"
        value={stats.beesLost}
      />
      <StatCard 
        icon="🏠" 
        label="Ruches construites"
        value={stats.hivesBuilt}
      />
      <StatCard 
        icon="🔥" 
        label="Série de jours"
        value={`${stats.playStreak} jours`}
      />
    </div>
  );
}
```

---

### 5. Achievements / Trophées

#### Objectif
Récompenser les joueurs pour des accomplissements spéciaux

#### Structure
```typescript
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number; // Pour achievements progressifs
  maxProgress?: number;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_victory',
    title: 'Première Victoire',
    description: 'Gagner votre premier combat',
    icon: '🏆',
    unlocked: false
  },
  {
    id: 'perfectionist',
    title: 'Perfectionniste',
    description: 'Obtenir 3 étoiles sur tous les niveaux du tutoriel',
    icon: '⭐',
    unlocked: false
  },
  {
    id: 'bee_master',
    title: 'Maître des Abeilles',
    description: 'Construire 100 ruches',
    icon: '🐝',
    unlocked: false,
    progress: 0,
    maxProgress: 100
  },
  // ... autres achievements
];
```

#### Système de déblocage
```typescript
function checkAchievements(gameState: GameState, stats: PlayerStats) {
  const newAchievements = [...achievements];
  
  // Achievement: Première victoire
  if (stats.levelsCompleted >= 1 && !achievements[0].unlocked) {
    newAchievements[0].unlocked = true;
    newAchievements[0].unlockedAt = new Date().toISOString();
    showAchievementNotification('Première Victoire');
  }
  
  // Achievement: Maître des abeilles
  const beeAchievement = newAchievements.find(a => a.id === 'bee_master');
  if (beeAchievement) {
    beeAchievement.progress = stats.hivesBuilt;
    if (stats.hivesBuilt >= 100 && !beeAchievement.unlocked) {
      beeAchievement.unlocked = true;
      beeAchievement.unlockedAt = new Date().toISOString();
      showAchievementNotification('Maître des Abeilles');
    }
  }
  
  setAchievements(newAchievements);
  saveAchievements(newAchievements);
}
```

#### Notification de déblocage
```tsx
function AchievementToast({ achievement }: { achievement: Achievement }) {
  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="achievement-toast"
    >
      <div className="achievement-icon">{achievement.icon}</div>
      <div>
        <h4>Achievement Débloqué !</h4>
        <p>{achievement.title}</p>
      </div>
    </motion.div>
  );
}
```

---

### 6. Leaderboard Global

#### Objectif
Classement des meilleurs joueurs

#### Backend (Supabase)
```sql
CREATE TABLE leaderboard (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  username TEXT NOT NULL,
  total_stars INTEGER NOT NULL,
  levels_completed INTEGER NOT NULL,
  total_time INTEGER NOT NULL,
  last_updated TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_leaderboard_stars ON leaderboard(total_stars DESC);
```

#### Frontend
```typescript
async function fetchLeaderboard(limit = 100) {
  const { data } = await supabase
    .from('leaderboard')
    .select('*')
    .order('total_stars', { ascending: false })
    .limit(limit);
    
  return data;
}

async function updateLeaderboard(stats: PlayerStats) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  
  await supabase
    .from('leaderboard')
    .upsert({
      user_id: user.id,
      username: user.email?.split('@')[0],
      total_stars: calculateTotalStars(levelProgress),
      levels_completed: stats.levelsCompleted,
      total_time: stats.totalPlayTime
    });
}
```

---

### 7. Migration de Version Automatique

#### Objectif
Gérer les changements de structure de données entre versions

#### Système de migration
```typescript
// /utils/migrations.ts
type Migration = (oldData: any) => any;

const MIGRATIONS: Record<string, Migration> = {
  '1.0.0_to_1.1.0': (data) => {
    // Exemple: Ajout du champ 'achievements'
    return {
      ...data,
      achievements: []
    };
  },
  '1.1.0_to_1.2.0': (data) => {
    // Exemple: Renommage de champ
    return {
      ...data,
      playerStats: data.stats, // Renommer 'stats' en 'playerStats'
    };
  }
};

function migrateData(data: any, fromVersion: string, toVersion: string) {
  const migrationKey = `${fromVersion}_to_${toVersion}`;
  const migration = MIGRATIONS[migrationKey];
  
  if (migration) {
    console.log(`[Migration] ${fromVersion} → ${toVersion}`);
    return migration(data);
  }
  
  return data;
}
```

---

## Priorités Recommandées

1. **High Priority** 🔴
   - Export/Import manuel (facile à implémenter, grande valeur)
   - Statistiques de base (engagement joueur)

2. **Medium Priority** 🟡
   - Synchronisation cloud (dépend de Supabase)
   - Achievements (fun mais optionnel)

3. **Low Priority** 🟢
   - Profils multiples (niche use case)
   - Leaderboard (nécessite backend et modération)

---

**Date :** 26 octobre 2025  
**Auteur :** Système de persistance Rush

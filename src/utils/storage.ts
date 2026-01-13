/**
 * Système de sauvegarde et chargement de la progression du joueur
 * Utilise le localStorage pour persister les données entre les sessions
 */

import { LevelProgress, INITIAL_LEVELS } from '../types/levels';

const STORAGE_KEYS = {
  LEVEL_PROGRESS: 'rush_level_progress',
  SOUND_ENABLED: 'rush_sound_enabled',
  TIME_OF_DAY: 'rush_time_of_day',
  GAME_VERSION: 'rush_game_version',
} as const;

const CURRENT_VERSION = '1.0.0';

/**
 * Sauvegarde la progression du joueur
 */
export function saveLevelProgress(progress: LevelProgress): void {
  try {
    const data = {
      version: CURRENT_VERSION,
      timestamp: Date.now(),
      progress,
    };
    localStorage.setItem(STORAGE_KEYS.LEVEL_PROGRESS, JSON.stringify(data));
    console.log('[Storage] Progression sauvegardée :', progress);
  } catch (error) {
    console.error('[Storage] Erreur lors de la sauvegarde :', error);
  }
}

/**
 * Charge la progression du joueur
 * @returns La progression sauvegardée ou la progression initiale si aucune sauvegarde
 */
export function loadLevelProgress(): LevelProgress {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.LEVEL_PROGRESS);
    
    if (!saved) {
      console.log('[Storage] Aucune sauvegarde trouvée, utilisation de la progression initiale');
      return {
        currentLevel: 1,
        currentSubLevel: 0,
        levels: INITIAL_LEVELS,
      };
    }
    
    const data = JSON.parse(saved);
    
    // Vérifier la version (pour gérer les migrations futures)
    if (data.version !== CURRENT_VERSION) {
      console.warn('[Storage] Version différente détectée, migration nécessaire');
    }
    
    // Fusionner les données sauvegardées avec INITIAL_LEVELS pour s'assurer que tous les sous-niveaux sont présents
    const mergedLevels = INITIAL_LEVELS.map((initialLevel) => {
      const savedLevel = data.progress.levels.find((l: any) => l.id === initialLevel.id);
      
      if (!savedLevel) {
        return initialLevel;
      }
      
      // Fusionner les sous-niveaux
      const mergedSubLevels = initialLevel.subLevels.map((initialSub) => {
        const savedSub = savedLevel.subLevels?.find((s: any) => s.id === initialSub.id);
        return savedSub ? { ...initialSub, ...savedSub } : initialSub;
      });
      
      return {
        ...initialLevel,
        ...savedLevel,
        subLevels: mergedSubLevels,
      };
    });
    
    console.log('[Storage] Progression chargée et fusionnée depuis', new Date(data.timestamp).toLocaleString());
    return {
      currentLevel: data.progress.currentLevel || 1,
      currentSubLevel: data.progress.currentSubLevel || 0,
      levels: mergedLevels,
    };
  } catch (error) {
    console.error('[Storage] Erreur lors du chargement :', error);
    return {
      currentLevel: 1,
      currentSubLevel: 0,
      levels: INITIAL_LEVELS,
    };
  }
}

/**
 * Réinitialise la progression du joueur
 */
export function resetLevelProgress(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.LEVEL_PROGRESS);
    console.log('[Storage] Progression réinitialisée');
  } catch (error) {
    console.error('[Storage] Erreur lors de la réinitialisation :', error);
  }
}

/**
 * Sauvegarde les préférences audio
 */
export function saveSoundPreference(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, JSON.stringify(enabled));
  } catch (error) {
    console.error('[Storage] Erreur lors de la sauvegarde du son :', error);
  }
}

/**
 * Charge les préférences audio
 * @returns true par défaut
 */
export function loadSoundPreference(): boolean {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED);
    return saved ? JSON.parse(saved) : true;
  } catch (error) {
    console.error('[Storage] Erreur lors du chargement du son :', error);
    return true;
  }
}

/**
 * Sauvegarde la préférence jour/nuit
 */
export function saveTimeOfDayPreference(timeOfDay: 'day' | 'night'): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TIME_OF_DAY, timeOfDay);
  } catch (error) {
    console.error('[Storage] Erreur lors de la sauvegarde du mode jour/nuit :', error);
  }
}

/**
 * Charge la préférence jour/nuit
 * @returns 'day' par défaut
 */
export function loadTimeOfDayPreference(): 'day' | 'night' {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.TIME_OF_DAY);
    return (saved === 'night' ? 'night' : 'day');
  } catch (error) {
    console.error('[Storage] Erreur lors du chargement du mode jour/nuit :', error);
    return 'day';
  }
}

/**
 * Exporte toutes les données de jeu (pour backup)
 */
export function exportGameData(): string {
  try {
    const allData = {
      version: CURRENT_VERSION,
      exportDate: new Date().toISOString(),
      levelProgress: loadLevelProgress(),
      soundEnabled: loadSoundPreference(),
      timeOfDay: loadTimeOfDayPreference(),
    };
    return JSON.stringify(allData, null, 2);
  } catch (error) {
    console.error('[Storage] Erreur lors de l\'export :', error);
    return '';
  }
}

/**
 * Importe des données de jeu (depuis backup)
 */
export function importGameData(jsonData: string): boolean {
  try {
    const data = JSON.parse(jsonData);
    
    if (data.levelProgress) {
      saveLevelProgress(data.levelProgress);
    }
    if (data.soundEnabled !== undefined) {
      saveSoundPreference(data.soundEnabled);
    }
    if (data.timeOfDay) {
      saveTimeOfDayPreference(data.timeOfDay);
    }
    
    console.log('[Storage] Données importées avec succès');
    return true;
  } catch (error) {
    console.error('[Storage] Erreur lors de l\'import :', error);
    return false;
  }
}

/**
 * Vérifie si le localStorage est disponible
 */
export function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

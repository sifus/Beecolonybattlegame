import { useEffect } from 'react';
import { LevelProgress } from '../types/levels';
import {
  saveLevelProgress,
  saveSoundPreference,
  saveTimeOfDayPreference,
  isStorageAvailable,
} from '../utils/storage';

/**
 * Sauvegarde automatique des préférences et de la progression dans localStorage.
 * Chaque valeur est persistée dès qu'elle change.
 */
export function useStorage(
  levelProgress: LevelProgress,
  soundEnabled: boolean,
  globalTimeOfDay: 'day' | 'night'
) {
  useEffect(() => {
    if (isStorageAvailable()) saveLevelProgress(levelProgress);
  }, [levelProgress]);

  useEffect(() => {
    if (isStorageAvailable()) saveSoundPreference(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    if (isStorageAvailable()) saveTimeOfDayPreference(globalTimeOfDay);
  }, [globalTimeOfDay]);
}

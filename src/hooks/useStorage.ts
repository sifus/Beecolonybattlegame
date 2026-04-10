import { useEffect } from 'react';
import { LevelProgress } from '../types/levels';
import {
  saveLevelProgress,
  saveSoundPreference,
  saveTimeOfDayPreference,
  saveLeftHandedPreference,
  isStorageAvailable,
} from '../utils/storage';

export function useStorage(
  levelProgress: LevelProgress,
  soundEnabled: boolean,
  globalTimeOfDay: 'day' | 'night',
  leftHanded: boolean,
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

  useEffect(() => {
    if (isStorageAvailable()) saveLeftHandedPreference(leftHanded);
  }, [leftHanded]);
}

import { useEffect, useRef } from 'react';

interface AmbientSoundProps {
  enabled: boolean;
  volume?: number;
  soundUrl?: string;
}

/**
 * Composant son d'ambiance global
 * 
 * Sons disponibles :
 * - Prairie de jour : https://assets.mixkit.co/active_storage/sfx/2464/2464-preview.mp3 (nature, oiseaux, ruisseau)
 * - Forêt nuit : https://assets.mixkit.co/active_storage/sfx/2465/2465-preview.mp3 (grillons, ambiance nocturne)
 */
export function AmbientSound({ 
  enabled, 
  volume = 0.3,
  soundUrl = 'https://assets.mixkit.co/active_storage/sfx/2464/2464-preview.mp3' // Son prairie jour par défaut
}: AmbientSoundProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentSoundUrlRef = useRef<string>(soundUrl);

  useEffect(() => {
    // Si le soundUrl change, il faut recréer l'audio
    if (currentSoundUrlRef.current !== soundUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
      currentSoundUrlRef.current = soundUrl;
    }

    // Créer l'élément audio si nécessaire
    if (!audioRef.current) {
      audioRef.current = new Audio(soundUrl);
      audioRef.current.loop = true;
      audioRef.current.volume = volume;
    }

    const audio = audioRef.current;

    // Gérer la lecture/pause selon si le son est activé
    if (enabled) {
      audio.play().catch(err => {
        console.log('Audio playback prevented:', err);
      });
    } else {
      audio.pause();
    }

    // Cleanup
    return () => {
      if (audio) {
        audio.pause();
      }
    };
  }, [enabled, soundUrl, volume]);

  // Mettre à jour le volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Cleanup final au démontage du composant
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  return null; // Ce composant ne rend rien visuellement
}

import { useEffect, useRef } from 'react';

interface AmbientSoundProps {
  enabled: boolean;
  volume?: number;
  soundUrl?: string;
}

export function AmbientSound({
  enabled,
  volume = 0.3,
  soundUrl = 'https://assets.mixkit.co/active_storage/sfx/2464/2464-preview.mp3'
}: AmbientSoundProps) {
  const audioRef    = useRef<HTMLAudioElement | null>(null);
  const urlRef      = useRef<string>(soundUrl);
  const enabledRef  = useRef<boolean>(enabled);

  // Maintenir enabledRef à jour à chaque render
  enabledRef.current = enabled;

  // Au premier montage : écouter la 1ère interaction pour débloquer l'autoplay
  useEffect(() => {
    const unlock = () => {
      if (enabledRef.current && audioRef.current) {
        audioRef.current.play().catch(() => {});
      }
    };
    document.addEventListener('click',      unlock, { once: true });
    document.addEventListener('touchstart', unlock, { once: true });
    document.addEventListener('keydown',    unlock, { once: true });
    return () => {
      document.removeEventListener('click',      unlock);
      document.removeEventListener('touchstart', unlock);
      document.removeEventListener('keydown',    unlock);
    };
  }, []);

  // Gérer lecture / pause selon enabled, soundUrl, volume
  useEffect(() => {
    if (urlRef.current !== soundUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
      urlRef.current = soundUrl;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio(soundUrl);
      audioRef.current.loop   = true;
      audioRef.current.volume = volume;
    }

    const audio = audioRef.current;

    if (enabled) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }

    return () => { audio.pause(); };
  }, [enabled, soundUrl, volume]);

  // Volume seul, sans relancer l'audio
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // Cleanup final
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  return null;
}

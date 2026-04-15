import { useState, useEffect, useRef } from 'react';

export interface Sparkle {
  id: number; x: number; y: number; size: number;
  opacity: number; rising: boolean; dormant: boolean; dormantTicks: number;
}

interface GridParams {
  cols: number;
  rows: number;
  cellSize: number;
  gameStartCol: number;
  gameEndCol: number;
  gameStartRow: number;
  gameEndRow: number;
}

const SQRT1_2 = Math.SQRT1_2; // 1/√2 ≈ 0.7071

// Crée une étincelle positionnée le long du rayon (direction 45°) à l'offset latéral donné
function makeSparkleAlongBeam(id: number, gp: GridParams, lateralOffset: number): Sparkle {
  const gw = gp.cols * gp.cellSize;
  const gh = gp.rows * gp.cellSize;
  const diagLen = Math.sqrt(gw * gw + gh * gh);

  // Centre du rayon (perpendiculaire à 45° depuis le centre de la carte)
  const centerX = gw / 2 - SQRT1_2 * lateralOffset;
  const centerY = gh / 2 + SQRT1_2 * lateralOffset;

  // Position aléatoire le long de l'axe du rayon + léger écart perpendiculaire
  const t = (Math.random() - 0.5) * diagLen * 0.9;
  const perp = (Math.random() - 0.5) * 80;

  const px = centerX + SQRT1_2 * t - SQRT1_2 * perp;
  const py = centerY + SQRT1_2 * t + SQRT1_2 * perp;

  return {
    id,
    x: Math.max(0, Math.min(gw, px)),
    y: Math.max(0, Math.min(gh, py)),
    size: 12 + Math.random() * 12,
    opacity: 0,
    rising: false,
    dormant: true,
    dormantTicks: Math.floor(Math.random() * 4),
  };
}

export function useSolarSystem(gridParams: GridParams) {
  const [sunIntensity, setSunIntensity] = useState(0);
  const [sparkleIntensity, setSparkleIntensity] = useState(0);
  const [lateralOffset, setLateralOffset] = useState(0);

  const lateralOffsetRef = useRef(0);
  const sparkleIntensityRef = useRef(0);

  const [sparkles, setSparkles] = useState<Sparkle[]>(() =>
    Array.from({ length: 7 }, (_, i) => makeSparkleAlongBeam(i, gridParams, 0))
  );

  const beamPhaseRef = useRef<'visible' | 'fadeout' | 'hidden'>('hidden');
  const beamPhaseStartRef = useRef(Date.now());

  // Cycle : visible (7 s) → fadeout (1,5 s) → hidden (10 s)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - beamPhaseStartRef.current;
      const phase = beamPhaseRef.current;

      if (phase === 'visible' && elapsed >= 7000) {
        beamPhaseRef.current = 'fadeout';
        beamPhaseStartRef.current = now;
      } else if (phase === 'fadeout' && elapsed >= 1500) {
        beamPhaseRef.current = 'hidden';
        beamPhaseStartRef.current = now;
        // Les étincelles s'éteignent progressivement via sparkleIntensity (voir ci-dessous)
      } else if (phase === 'hidden' && elapsed >= 10000) {
        // Nouveau décalage latéral aléatoire
        const gw = gridParams.cols * gridParams.cellSize;
        const gh = gridParams.rows * gridParams.cellSize;
        const diagLen = Math.sqrt(gw * gw + gh * gh);
        const newOffset = (Math.random() - 0.5) * diagLen * 0.6;
        setLateralOffset(newOffset);
        lateralOffsetRef.current = newOffset;
        // Préparer les étincelles à la nouvelle position (dormantes)
        setSparkles(Array.from({ length: 7 }, (_, i) => makeSparkleAlongBeam(i, gridParams, newOffset)));
        beamPhaseRef.current = 'visible';
        beamPhaseStartRef.current = now;
      }

      const currentPhase = beamPhaseRef.current;
      const currentElapsed = now - beamPhaseStartRef.current;

      // sunIntensity : fade-in 1 s, maintien, fade-out 1,5 s
      let newSunIntensity: number;
      if (currentPhase === 'visible')      newSunIntensity = Math.min(1, currentElapsed / 1000);
      else if (currentPhase === 'fadeout') newSunIntensity = Math.max(0, 1 - currentElapsed / 1500);
      else                                 newSunIntensity = 0;
      setSunIntensity(newSunIntensity);

      // sparkleIntensity : apparaissent après le rayon, persistent après sa disparition
      //   visible (7 s) : montée t=1500→2500, plateau jusqu'à la fin
      //   fadeout (1,5 s) : maintien à 1 (scintillements encore actifs)
      //   hidden : descente 1→0 sur 900 ms (légèrement plus long que la fin du rayon)
      let newSparkleIntensity: number;
      if (currentPhase === 'visible') {
        if (currentElapsed < 700)       newSparkleIntensity = 0;
        else if (currentElapsed < 1500) newSparkleIntensity = (currentElapsed - 700) / 800;
        else                            newSparkleIntensity = 1;
      } else if (currentPhase === 'fadeout') {
        // disparaît en même temps que le rayon (fin du fadeout = 0)
        newSparkleIntensity = Math.max(0, 1 - currentElapsed / 1500);
      } else {
        newSparkleIntensity = 0;
      }
      setSparkleIntensity(newSparkleIntensity);
      sparkleIntensityRef.current = newSparkleIntensity;

    }, 100);
    return () => clearInterval(interval);
  }, [gridParams]);

  // Animation des étincelles (tick 120 ms — fluide)
  useEffect(() => {
    const interval = setInterval(() => {
      const si = sparkleIntensityRef.current;
      const lo = lateralOffsetRef.current;

      setSparkles(prev => prev.map(s => {
        // Éteindre si intensité nulle
        if (si <= 0) {
          if (s.opacity > 0 || !s.dormant) return { ...s, opacity: 0, dormant: true, dormantTicks: 0 };
          return s;
        }

        if (s.dormant) {
          if (s.dormantTicks + 1 >= 6) {
            const gw = gridParams.cols * gridParams.cellSize;
            const gh = gridParams.rows * gridParams.cellSize;
            const diagLen = Math.sqrt(gw * gw + gh * gh);
            const centerX = gw / 2 - SQRT1_2 * lo;
            const centerY = gh / 2 + SQRT1_2 * lo;
            const t = (Math.random() - 0.5) * diagLen * 0.9;
            const perp = (Math.random() - 0.5) * 80;
            return {
              ...s,
              x: Math.max(0, Math.min(gw, centerX + SQRT1_2 * t - SQRT1_2 * perp)),
              y: Math.max(0, Math.min(gh, centerY + SQRT1_2 * t + SQRT1_2 * perp)),
              size: 12 + Math.random() * 12,
              opacity: 0,
              rising: true,
              dormant: false,
              dormantTicks: 0,
            };
          }
          return { ...s, dormantTicks: s.dormantTicks + 1 };
        }
        if (s.rising) {
          const newOpacity = Math.min(s.opacity + 0.08, 1);
          if (newOpacity >= 1 && Math.random() < 0.08) return { ...s, opacity: 1, rising: false };
          return { ...s, opacity: newOpacity };
        }
        const newOpacity = Math.max(s.opacity - 0.06, 0);
        if (newOpacity <= 0) return { ...s, opacity: 0, dormant: true, dormantTicks: Math.floor(Math.random() * 8) };
        return { ...s, opacity: newOpacity };
      }));
    }, 120);
    return () => clearInterval(interval);
  }, [gridParams]);

  return { sunIntensity, sparkleIntensity, lateralOffset, sparkles };
}

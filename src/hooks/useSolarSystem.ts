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

const makeSparkle = (id: number, gp: GridParams, sunPct = { x: 15, y: 15 }): Sparkle => {
  const gw = gp.cols * gp.cellSize;
  const gh = gp.rows * gp.cellSize;
  const t = (Math.random() - 0.5) * 0.8;
  const lateral = (Math.random() - 0.5) * 80;
  const sunXpx = sunPct.x / 100 * gw;
  const sunYpx = sunPct.y / 100 * gh;
  const diagLen = Math.max(gw, gh);
  const axisX = Math.cos(Math.PI * 0.25);
  const axisY = Math.sin(Math.PI * 0.25);
  const perpX = -axisY;
  const perpY = axisX;
  const px = sunXpx + axisX * t * diagLen + perpX * lateral;
  const py = sunYpx + axisY * t * diagLen + perpY * lateral;
  const newXPct = Math.max(2, Math.min(98, px / gw * 100));
  const newYPct = Math.max(2, Math.min(98, py / gh * 100));
  return {
    id,
    x: newXPct / 100 * gw,
    y: newYPct / 100 * gh,
    size: 12 + Math.random() * 12,
    opacity: 0,
    rising: false,
    dormant: true,
    dormantTicks: Math.floor(Math.random() * 6),
  };
};

export function useSolarSystem(gridParams: GridParams) {
  const [sunIntensity, setSunIntensity] = useState(0);
  const [sunPosition, setSunPosition] = useState({ x: 15, y: 15 });
  const sunPosRef = useRef({ x: 15, y: 15 });
  const [sparkles, setSparkles] = useState<Sparkle[]>(() =>
    Array.from({ length: 7 }, (_, i) => makeSparkle(i, gridParams))
  );
  const beamPhaseRef = useRef<'visible' | 'fadeout' | 'hidden'>('hidden');
  const beamPhaseStartRef = useRef(Date.now());

  // Cycle en 3 phases : visible (5s) → fadeout (1.5s) → hidden (10s)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - beamPhaseStartRef.current;
      const phase = beamPhaseRef.current;

      if (phase === 'visible' && elapsed >= 5000) {
        beamPhaseRef.current = 'fadeout';
        beamPhaseStartRef.current = now;
      } else if (phase === 'fadeout' && elapsed >= 1500) {
        beamPhaseRef.current = 'hidden';
        beamPhaseStartRef.current = now;
      } else if (phase === 'hidden' && elapsed >= 10000) {
        const newPos = { x: 10 + Math.random() * 80, y: 10 + Math.random() * 80 };
        setSunPosition(newPos);
        sunPosRef.current = newPos;
        beamPhaseRef.current = 'visible';
        beamPhaseStartRef.current = now;
      }

      const currentPhase = beamPhaseRef.current;
      const currentElapsed = now - beamPhaseStartRef.current;
      if (currentPhase === 'visible')      setSunIntensity(Math.min(1, currentElapsed / 1000));
      else if (currentPhase === 'fadeout') setSunIntensity(Math.max(0, 1 - currentElapsed / 1500));
      else                                 setSunIntensity(0);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Animation des étoiles scintillantes (800ms)
  useEffect(() => {
    const interval = setInterval(() => {
      setSparkles(prev => prev.map(s => {
        if (s.dormant) {
          if (s.dormantTicks + 1 >= 2) {
            const gw = gridParams.cols * gridParams.cellSize;
            const gh = gridParams.rows * gridParams.cellSize;
            const sp = sunPosRef.current;
            const angle = (Math.PI * 0.25) + (Math.random() - 0.5) * 0.5;
            const dist = (Math.random() - 0.5) * 0.4 * Math.min(gw, gh);
            const newXPct = Math.max(5, Math.min(95, sp.x + (Math.cos(angle) * dist / gw * 100)));
            const newYPct = Math.max(5, Math.min(95, sp.y + (Math.sin(angle) * dist / gh * 100)));
            return {
              ...s,
              x: newXPct / 100 * gw,
              y: newYPct / 100 * gh,
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
          const newOpacity = Math.min(s.opacity + 0.5, 1);
          if (newOpacity >= 1 && Math.random() < 0.35) return { ...s, opacity: 1, rising: false };
          return { ...s, opacity: newOpacity };
        }
        const newOpacity = Math.max(s.opacity - 0.5, 0);
        if (newOpacity <= 0) return { ...s, opacity: 0, dormant: true, dormantTicks: 0 };
        return { ...s, opacity: newOpacity };
      }));
    }, 800);
    return () => clearInterval(interval);
  }, [gridParams]);

  return { sunIntensity, sunPosition, sparkles };
}

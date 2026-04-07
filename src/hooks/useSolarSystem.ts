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
  const cx = (sunPct.x / 100) * gw;
  const cy = (sunPct.y / 100) * gh;
  const spread = 0.35 * Math.min(gw, gh);
  return {
    id,
    x: Math.max(gp.gameStartCol * gp.cellSize, Math.min((gp.gameEndCol + 1) * gp.cellSize, cx + (Math.random() - 0.5) * 2 * spread)),
    y: Math.max(gp.gameStartRow * gp.cellSize, Math.min((gp.gameEndRow + 1) * gp.cellSize, cy + (Math.random() - 0.5) * 2 * spread)),
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

  // Suivi de l'intensité solaire (réplique solar-cloud: 5s ease-in-out alternate)
  useEffect(() => {
    const interval = setInterval(() => {
      const t = (Date.now() % 10000) / 10000;
      const progress = t < 0.5 ? t * 2 : 2 - t * 2;
      const eased = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      setSunIntensity(eased);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Déplacement aléatoire du soleil toutes les 5-8 secondes
  useEffect(() => {
    const delay = 5000 + Math.random() * 3000;
    const t = setTimeout(() => {
      const newPos = { x: 10 + Math.random() * 80, y: 10 + Math.random() * 80 };
      setSunPosition(newPos);
      sunPosRef.current = newPos;
    }, delay);
    return () => clearTimeout(t);
  }, [sunPosition]);

  // Animation des étoiles scintillantes (800ms)
  useEffect(() => {
    const interval = setInterval(() => {
      setSparkles(prev => prev.map(s => {
        if (s.dormant) {
          if (s.dormantTicks + 1 >= 2) {
            const gw = gridParams.cols * gridParams.cellSize;
            const gh = gridParams.rows * gridParams.cellSize;
            const sp = sunPosRef.current;
            const cx = (sp.x / 100) * gw;
            const cy = (sp.y / 100) * gh;
            const spread = 0.35 * Math.min(gw, gh);
            return {
              ...s,
              x: Math.max(gridParams.gameStartCol * gridParams.cellSize, Math.min((gridParams.gameEndCol + 1) * gridParams.cellSize, cx + (Math.random() - 0.5) * 2 * spread)),
              y: Math.max(gridParams.gameStartRow * gridParams.cellSize, Math.min((gridParams.gameEndRow + 1) * gridParams.cellSize, cy + (Math.random() - 0.5) * 2 * spread)),
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

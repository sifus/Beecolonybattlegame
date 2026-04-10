import { Bee as BeeType } from '../types/game';
import { motion } from 'motion/react';

interface BeeProps {
  bee: BeeType;
  isSelected: boolean;
  isNightMode?: boolean;
  cellSize: number;
}

export function Bee({ bee, isSelected, isNightMode = false, cellSize }: BeeProps) {
  const isNewBee = bee.createdAt && Date.now() - bee.createdAt < 800;

  // ─── NIGHT MODE : lucioles ────────────────────────────────────────────────
  if (isNightMode) {
    const fireflyColor = bee.owner === 'player' ? '#7FFF00' : '#00BFFF';
    const glowColor    = bee.owner === 'player' ? '#9FFF00' : '#87CEFA';

    return (
      <g style={{ pointerEvents: 'none' }}>
        {isSelected && (
          <motion.circle
            cx={bee.x} cy={bee.y} r={13}
            fill="none" stroke="#FF6600" strokeWidth={2.5}
            initial={{ scale: 0.8, opacity: 0.8 }}
            animate={{ scale: 1.3, opacity: 0.3 }}
            transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
          />
        )}
        {isNewBee && (
          <motion.circle
            cx={bee.x} cy={bee.y} r={12}
            fill={bee.owner === 'player' ? '#7FFF00' : '#00BFFF'}
            initial={{ scale: 0.5, opacity: 0.6 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.8, repeat: 0 }}
          />
        )}
        <motion.circle cx={bee.x} cy={bee.y} r={9} fill={glowColor} opacity={0.3}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4 }}
        />
        <motion.circle cx={bee.x} cy={bee.y} r={6} fill={fireflyColor} opacity={0.6}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4 }}
        />
        <motion.circle cx={bee.x} cy={bee.y} r={3.5} fill={fireflyColor} stroke={fireflyColor} strokeWidth={0.8}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4 }}
        />
        {!isSelected && (
          <motion.circle cx={bee.x} cy={bee.y} r={1.5} fill="#ffffff" opacity={0.9}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4 }}
          />
        )}
      </g>
    );
  }

  // ─── DAY MODE : goutte d'eau ──────────────────────────────────────────────
  const clipId      = `bee-clip-${bee.id}`;
  const bodyColor   = bee.owner === 'player' ? '#7a3a08' : '#5a1a08';
  const stripeColor = bee.owner === 'player' ? '#f0c020' : '#cc2020';

  // Goutte centrée à l'origine — span ±18 en x, -22 (haut) à +22 (bas)
  const dropPath = 'M 0,-22 C 0,-22 -18,-9 -18,3 C -18,14 -10,22 0,22 C 10,22 18,14 18,3 C 18,-9 0,-22 0,-22 Z';
  const sc = (cellSize / 80) * 0.21;

  return (
    <g style={{ pointerEvents: 'none' }}>
      {/* Indicateur de sélection */}
      {isSelected && (
        <motion.circle
          cx={bee.x} cy={bee.y} r={14}
          fill="none" stroke="#FF6600" strokeWidth={3}
          initial={{ scale: 0.8, opacity: 0.8 }}
          animate={{ scale: 1.2, opacity: 0.4 }}
          transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
        />
      )}

      {/* Halo naissance — joueur uniquement, pas de boucle */}
      {isNewBee && (
        <motion.circle
          cx={bee.x} cy={bee.y} r={16}
          fill={bee.owner === 'player' ? '#FFD700' : '#cc2020'}
          initial={{ scale: 0.5, opacity: 0.6 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.8, repeat: 0 }}
        />
      )}

      {/* Corps goutte + bande colorée */}
      <g transform={`translate(${bee.x}, ${bee.y}) rotate(${((bee.displayAngle ?? bee.angle) * (180 / Math.PI) + 270) || 0}) scale(${sc})`}>
        <defs>
          <clipPath id={clipId}>
            <path d={dropPath} />
          </clipPath>
        </defs>
        <path d={dropPath} fill={bodyColor} />
        <rect x={-22} y={-3} width={44} height={16} fill={stripeColor} clipPath={`url(#${clipId})`} />
        <ellipse cx={-6} cy={-14} rx={5} ry={4} fill="#fff" opacity={0.18} />
      </g>
    </g>
  );
}

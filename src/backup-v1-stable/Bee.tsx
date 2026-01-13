import { Bee as BeeType } from '../types/game';
import { motion } from 'motion/react';

interface BeeProps {
  bee: BeeType;
  isSelected: boolean;
}

export function Bee({ bee, isSelected }: BeeProps) {
  const beeColor = bee.owner === 'player' ? '#FDD835' : '#D32F2F';
  const isNewBee = bee.createdAt && Date.now() - bee.createdAt < 500;

  return (
    <g>
      {/* Selection indicator - orange vif pulsant */}
      {isSelected && (
        <motion.circle
          cx={bee.x}
          cy={bee.y}
          r={10}
          fill="none"
          stroke="#FF6600"
          strokeWidth={3}
          initial={{ scale: 0.8, opacity: 0.8 }}
          animate={{ scale: 1.2, opacity: 0.4 }}
          transition={{ 
            duration: 0.6,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      )}
      
      {isNewBee && (
        <motion.circle
          cx={bee.x}
          cy={bee.y}
          r={8}
          fill={beeColor}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      )}
      
      <circle
        cx={bee.x}
        cy={bee.y}
        r={4}
        fill={beeColor}
        stroke={isSelected ? "#FF6600" : "#000"}
        strokeWidth={isSelected ? 2 : 1}
      />
      
      {/* Wings */}
      <ellipse
        cx={bee.x - 2}
        cy={bee.y - 3}
        rx={2}
        ry={3}
        fill="rgba(255, 255, 255, 0.6)"
        transform={`rotate(-30 ${bee.x - 2} ${bee.y - 3})`}
      />
      <ellipse
        cx={bee.x + 2}
        cy={bee.y - 3}
        rx={2}
        ry={3}
        fill="rgba(255, 255, 255, 0.6)"
        transform={`rotate(30 ${bee.x + 2} ${bee.y - 3})`}
      />
    </g>
  );
}

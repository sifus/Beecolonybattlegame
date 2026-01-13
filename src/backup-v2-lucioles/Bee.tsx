import { Bee as BeeType } from '../types/game';
import { motion } from 'motion/react';

interface BeeProps {
  bee: BeeType;
  isSelected: boolean;
  isNightMode?: boolean;
}

export function Bee({ bee, isSelected, isNightMode = false }: BeeProps) {
  // Couleurs différentes selon le mode
  const beeColor = bee.owner === 'player' ? '#FDD835' : '#D32F2F';
  
  // Couleurs lucioles (mode nuit)
  const fireflyColor = bee.owner === 'player' 
    ? '#7FFF00' // Vert chartreuse pour joueur
    : '#00BFFF'; // Bleu cyan vif pour ennemi
  
  const glowColor = bee.owner === 'player'
    ? '#9FFF00' // Vert plus clair
    : '#87CEFA'; // Bleu ciel lumineux pour ennemi
    
  const isNewBee = bee.createdAt && Date.now() - bee.createdAt < 500;

  // Rendu luciole pour le mode nuit
  if (isNightMode) {
    return (
      <g>
        {/* Selection indicator */}
        {isSelected && (
          <motion.circle
            cx={bee.x}
            cy={bee.y}
            r={12}
            fill="none"
            stroke="#FF6600"
            strokeWidth={2}
            initial={{ scale: 0.8, opacity: 0.8 }}
            animate={{ scale: 1.3, opacity: 0.3 }}
            transition={{ 
              duration: 0.6,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        )}
        
        {/* Effet de naissance */}
        {isNewBee && (
          <motion.circle
            cx={bee.x}
            cy={bee.y}
            r={10}
            fill={fireflyColor}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        )}
        
        {/* Grande lueur externe */}
        <circle
          cx={bee.x}
          cy={bee.y}
          r={8}
          fill={glowColor}
          opacity={0.3}
        />
        
        {/* Lueur moyenne */}
        <circle
          cx={bee.x}
          cy={bee.y}
          r={5}
          fill={fireflyColor}
          opacity={0.6}
        />
        
        {/* Corps de la luciole */}
        <circle
          cx={bee.x}
          cy={bee.y}
          r={3}
          fill={fireflyColor}
          stroke={isSelected ? "#FF6600" : fireflyColor}
          strokeWidth={isSelected ? 2 : 0.5}
        />
        
        {/* Point lumineux central */}
        <circle
          cx={bee.x}
          cy={bee.y}
          r={1.5}
          fill="#ffffff"
          opacity={0.9}
        />
      </g>
    );
  }

  // Rendu abeille normal pour le mode jour
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
      
      {/* Ombre de l'abeille (lumière du haut-gauche, ombre vers bas-droite) */}
      <ellipse
        cx={bee.x + 2}
        cy={bee.y + 3}
        rx={3}
        ry={1.5}
        fill="#000"
        opacity={0.15}
      />
      
      <circle
        cx={bee.x}
        cy={bee.y}
        r={4}
        fill={beeColor}
        stroke={isSelected ? "#FF6600" : "#000"}
        strokeWidth={isSelected ? 2 : 1}
      />
      
      {/* Reflet lumineux sur l'abeille (haut-gauche) */}
      <circle
        cx={bee.x - 1.5}
        cy={bee.y - 1.5}
        r={1.2}
        fill="#fff"
        opacity={0.4}
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

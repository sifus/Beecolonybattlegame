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
    
  const isNewBee = bee.createdAt && Date.now() - bee.createdAt < 800;

  // Rendu luciole pour le mode nuit - AGRANDIES
  if (isNightMode) {
    return (
      <g style={{ pointerEvents: 'none' }}>
        {/* Selection indicator */}
        {isSelected && (
          <motion.circle
            cx={bee.x}
            cy={bee.y}
            r={13}
            fill="none"
            stroke="#FF6600"
            strokeWidth={2.5}
            initial={{ scale: 0.8, opacity: 0.8 }}
            animate={{ scale: 1.3, opacity: 0.3 }}
            transition={{ 
              duration: 0.6,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        )}
        
        {/* Halo lumineux pour nouvelle abeille */}
        {isNewBee && (
          <>
            {/* Halo doux qui pulse */}
            <motion.circle
              cx={bee.x}
              cy={bee.y}
              r={12}
              fill={fireflyColor}
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 0.2 }}
              transition={{ duration: 0.8 }}
            />
            {/* Onde qui s'agrandit */}
            <motion.circle
              cx={bee.x}
              cy={bee.y}
              r={10}
              fill={fireflyColor}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ duration: 0.8 }}
            />
          </>
        )}
        
        {/* Grande lueur externe */}
        <motion.circle
          cx={bee.x}
          cy={bee.y}
          r={9}
          fill={glowColor}
          opacity={0.3}
          initial={isNewBee ? { scale: 0.3 } : { scale: 1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4 }}
        />
        
        {/* Lueur moyenne */}
        <motion.circle
          cx={bee.x}
          cy={bee.y}
          r={6}
          fill={fireflyColor}
          opacity={0.6}
          initial={isNewBee ? { scale: 0.3 } : { scale: 1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4 }}
        />
        
        {/* Corps de la luciole */}
        <motion.circle
          cx={bee.x}
          cy={bee.y}
          r={3.5}
          fill={fireflyColor}
          stroke={fireflyColor}
          strokeWidth={0.8}
          initial={isNewBee ? { scale: 0.3 } : { scale: 1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4 }}
        />
        
        {/* Point lumineux central - seulement si pas sélectionné */}
        {!isSelected && (
          <motion.circle
            cx={bee.x}
            cy={bee.y}
            r={1.5}
            fill="#ffffff"
            opacity={0.9}
            initial={isNewBee ? { scale: 0.3 } : { scale: 1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4 }}
          />
        )}
      </g>
    );
  }

  // Rendu abeille normal pour le mode jour - AGRANDIES
  return (
    <g style={{ pointerEvents: 'none' }}>
      {/* Selection indicator - orange vif pulsant */}
      {isSelected && (
        <motion.circle
          cx={bee.x}
          cy={bee.y}
          r={12}
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
      
      {/* Halo lumineux pour nouvelle abeille */}
      {isNewBee && (
        <>
          {/* Halo doux qui pulse - couleur dorée lumineuse */}
          <motion.circle
            cx={bee.x}
            cy={bee.y}
            r={14}
            fill="#FFD700"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          />
          {/* Onde qui s'agrandit */}
          <motion.circle
            cx={bee.x}
            cy={bee.y}
            r={9}
            fill={beeColor}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 0.8 }}
          />
        </>
      )}
      
      {/* Ombre de l'abeille (lumière du haut-gauche, ombre vers bas-droite) */}
      <motion.ellipse
        cx={bee.x + 2.5}
        cy={bee.y + 3.5}
        rx={3.5}
        ry={1.8}
        fill="#000"
        opacity={0.15}
        initial={isNewBee ? { scale: 0.3 } : { scale: 1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4 }}
      />
      
      <motion.circle
        cx={bee.x}
        cy={bee.y}
        r={5}
        fill={beeColor}
        stroke={isSelected ? "#FF6600" : "#000"}
        strokeWidth={isSelected ? 2 : 1.2}
        initial={isNewBee ? { scale: 0.3 } : { scale: 1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4 }}
      />
      
      {/* Reflet lumineux sur l'abeille (haut-gauche) */}
      <motion.circle
        cx={bee.x - 1.8}
        cy={bee.y - 1.8}
        r={1.3}
        fill="#fff"
        opacity={0.4}
        initial={isNewBee ? { scale: 0.3 } : { scale: 1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4 }}
      />
      
      {/* Wings - Positionner directement avec les coordonnées absolues */}
      <motion.ellipse
        cx={bee.x - 2.5}
        cy={bee.y - 3.5}
        rx={2.5}
        ry={3.5}
        fill="rgba(255, 255, 255, 0.6)"
        style={{ transformOrigin: `${bee.x - 2.5}px ${bee.y - 3.5}px` }}
        initial={isNewBee ? { scale: 0.3, rotate: -30 } : { scale: 1, rotate: -30 }}
        animate={{ scale: 1, rotate: -30 }}
        transition={{ duration: 0.4 }}
      />
      <motion.ellipse
        cx={bee.x + 2.5}
        cy={bee.y - 3.5}
        rx={2.5}
        ry={3.5}
        fill="rgba(255, 255, 255, 0.6)"
        style={{ transformOrigin: `${bee.x + 2.5}px ${bee.y + 3.5}px` }}
        initial={isNewBee ? { scale: 0.3, rotate: 30 } : { scale: 1, rotate: 30 }}
        animate={{ scale: 1, rotate: 30 }}
        transition={{ duration: 0.4 }}
      />
    </g>
  );
}

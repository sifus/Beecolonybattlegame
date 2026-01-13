import React from 'react';
import { Lumberjack as LumberjackType } from '../types/game';
import { motion } from 'motion/react';

interface LumberjackProps {
  lumberjack: LumberjackType;
  cellSize: number;
  onClick?: (e: React.MouseEvent) => void;
}

export function Lumberjack({ lumberjack, cellSize, onClick }: LumberjackProps) {
  const scale = cellSize / 100;
  const [isHovered, setIsHovered] = React.useState(false);
  
  // Animation variants
  const armSwingVariants = {
    chopping: {
      rotate: [0, -45, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    fighting: {
      rotate: [0, 30, -30, 0],
      transition: {
        duration: 0.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    walking: {
      rotate: [0, 15, 0, -15, 0],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const bodyBounce = {
    chopping: {
      y: [0, -3 * scale, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    fighting: {
      x: [-2 * scale, 2 * scale, -2 * scale],
      transition: {
        duration: 0.3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    walking: {
      y: [0, -2 * scale, 0],
      transition: {
        duration: 0.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  if (lumberjack.state === 'dead') {
    return null;
  }

  return (
    <g>
      {/* Hover indicator */}
      {onClick && isHovered && (
        <motion.circle
          cx={lumberjack.x}
          cy={lumberjack.y}
          r={30 * scale}
          fill="none"
          stroke="#FDD835"
          strokeWidth={3 * scale}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
      
      {/* Clickable area */}
      {onClick && (
        <circle
          cx={lumberjack.x}
          cy={lumberjack.y}
          r={25 * scale}
          fill="transparent"
          onClick={onClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{ cursor: 'pointer' }}
          pointerEvents="all"
        />
      )}
      
      {/* Shadow - lumière du haut-gauche, ombre vers bas-droite */}
      <ellipse
        cx={lumberjack.x + 8 * scale}
        cy={lumberjack.y + 28 * scale}
        rx={14 * scale}
        ry={6 * scale}
        fill="#000"
        opacity={0.25}
        style={{ pointerEvents: 'none' }}
      />

      <motion.g
        animate={lumberjack.state}
        variants={bodyBounce}
        style={{ pointerEvents: 'none' }}
      >
        {/* Legs - rendered before body to be behind it */}
        <rect
          x={lumberjack.x - 8 * scale}
          y={lumberjack.y + 5 * scale}
          width={6 * scale}
          height={15 * scale}
          fill="#654321"
          rx={2 * scale}
        />
        <rect
          x={lumberjack.x + 2 * scale}
          y={lumberjack.y + 5 * scale}
          width={6 * scale}
          height={15 * scale}
          fill="#654321"
          rx={2 * scale}
        />

        {/* Body */}
        <rect
          x={lumberjack.x - 10 * scale}
          y={lumberjack.y - 15 * scale}
          width={20 * scale}
          height={20 * scale}
          fill="#C62828"
          rx={3 * scale}
        />

        {/* Head */}
        <circle
          cx={lumberjack.x}
          cy={lumberjack.y - 22 * scale}
          r={8 * scale}
          fill="#FFD1A4"
        />
        
        {/* Reflet lumineux sur la tête (haut-gauche) */}
        <circle
          cx={lumberjack.x - 3 * scale}
          cy={lumberjack.y - 25 * scale}
          r={2.5 * scale}
          fill="#fff"
          opacity={0.3}
        />

        {/* Beard */}
        <path
          d={`M ${lumberjack.x - 5 * scale} ${lumberjack.y - 20 * scale}
              Q ${lumberjack.x} ${lumberjack.y - 15 * scale} ${lumberjack.x + 5 * scale} ${lumberjack.y - 20 * scale}
              L ${lumberjack.x + 3 * scale} ${lumberjack.y - 18 * scale}
              Q ${lumberjack.x} ${lumberjack.y - 16 * scale} ${lumberjack.x - 3 * scale} ${lumberjack.y - 18 * scale}
              Z`}
          fill="#8B4513"
        />

        {/* Hat */}
        <rect
          x={lumberjack.x - 7 * scale}
          y={lumberjack.y - 28 * scale}
          width={14 * scale}
          height={6 * scale}
          fill="#D84315"
          rx={1 * scale}
        />
        <rect
          x={lumberjack.x - 9 * scale}
          y={lumberjack.y - 23 * scale}
          width={18 * scale}
          height={2 * scale}
          fill="#D84315"
        />

        {/* Arms - animated based on state */}
        <motion.g
          animate={lumberjack.state}
          variants={armSwingVariants}
          style={{ transformOrigin: `${lumberjack.x - 8 * scale}px ${lumberjack.y - 12 * scale}px` }}
        >
          {/* Left arm */}
          <rect
            x={lumberjack.x - 14 * scale}
            y={lumberjack.y - 12 * scale}
            width={5 * scale}
            height={15 * scale}
            fill="#FFD1A4"
            rx={2 * scale}
          />
          
          {/* Axe (when chopping or walking) */}
          {(lumberjack.state === 'chopping' || lumberjack.state === 'walking') && (
            <g>
              {/* Handle */}
              <rect
                x={lumberjack.x - 12 * scale}
                y={lumberjack.y + 3 * scale}
                width={3 * scale}
                height={20 * scale}
                fill="#8D6E63"
                rx={1 * scale}
              />
              {/* Blade */}
              <path
                d={`M ${lumberjack.x - 18 * scale} ${lumberjack.y + 3 * scale}
                    L ${lumberjack.x - 6 * scale} ${lumberjack.y + 3 * scale}
                    L ${lumberjack.x - 8 * scale} ${lumberjack.y - 2 * scale}
                    L ${lumberjack.x - 16 * scale} ${lumberjack.y - 2 * scale}
                    Z`}
                fill="#B0BEC5"
                stroke="#78909C"
                strokeWidth={1 * scale}
              />
            </g>
          )}
        </motion.g>

        {/* Right arm */}
        <motion.rect
          x={lumberjack.x + 9 * scale}
          y={lumberjack.y - 12 * scale}
          width={5 * scale}
          height={15 * scale}
          fill="#FFD1A4"
          rx={2 * scale}
          animate={lumberjack.state === 'fighting' ? {
            rotate: [0, -30, 30, 0],
            transformOrigin: `${lumberjack.x + 11 * scale}px ${lumberjack.y - 12 * scale}px`
          } : {}}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Health bar */}
        <g>
          <rect
            x={lumberjack.x - 15 * scale}
            y={lumberjack.y - 35 * scale}
            width={30 * scale}
            height={4 * scale}
            fill="#000"
            opacity={0.3}
            rx={2 * scale}
          />
          <rect
            x={lumberjack.x - 15 * scale}
            y={lumberjack.y - 35 * scale}
            width={(lumberjack.health / 5) * 30 * scale}
            height={4 * scale}
            fill={lumberjack.health > 2 ? "#4CAF50" : "#F44336"}
            rx={2 * scale}
          />
        </g>
        
        {/* Converted indicator */}
        {lumberjack.isConverted && (
          <g>
            <circle
              cx={lumberjack.x}
              cy={lumberjack.y - 42 * scale}
              r={8 * scale}
              fill="#FDD835"
              opacity={0.9}
            />
            <text
              x={lumberjack.x}
              y={lumberjack.y - 42 * scale}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={10 * scale}
            >
              ⚡
            </text>
          </g>
        )}
      </motion.g>
    </g>
  );
}

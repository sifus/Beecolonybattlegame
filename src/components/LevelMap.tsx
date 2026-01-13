import { motion } from 'motion/react';
import { ArrowLeft, Lock, Crown } from 'lucide-react';
import { Level } from '../types/levels';

interface LevelMapProps {
  levels: Level[];
  onLevelClick: (levelId: number) => void;
  onBack: () => void;
  timeOfDay?: 'day' | 'night';
  onUnlockAll?: () => void;
}

export function LevelMap({ levels, onLevelClick, onBack, timeOfDay = 'day', onUnlockAll }: LevelMapProps) {
  const bgColor = timeOfDay === 'night' ? '#0f1419' : '#8B7355';
  
  // Calculer la largeur totale du chemin
  // Chaque niveau = 1 ruche + 5 gouttes + espaces
  // Distance entre éléments : 100px
  const elementSpacing = 100;
  const startPadding = 100;
  const endPadding = 100;
  
  // Calculer les positions de tous les éléments
  let currentX = startPadding;
  const elements: Array<{
    type: 'hive' | 'drop';
    x: number;
    y: number;
    levelId: number;
    subLevelIndex?: number;
    level: Level;
    isBoss?: boolean;
  }> = [];
  
  levels.forEach((level, levelIndex) => {
    const isBoss = level.id === 10;
    
    // Ajouter la ruche principale
    const hiveY = 150; // Position plus haute pour mobile
    elements.push({
      type: 'hive',
      x: currentX,
      y: hiveY,
      levelId: level.id,
      level,
      isBoss,
    });
    
    currentX += elementSpacing;
    
    // Ajouter les 5 sous-niveaux (gouttes)
    level.subLevels.forEach((subLevel, subIndex) => {
      // Varier la hauteur pour créer un chemin ondulant (réduit pour mobile)
      const yVariation = Math.sin((levelIndex * 5 + subIndex) * 0.5) * 30;
      const dropY = hiveY + yVariation;
      
      elements.push({
        type: 'drop',
        x: currentX,
        y: dropY,
        levelId: level.id,
        subLevelIndex: subIndex,
        level,
      });
      
      currentX += elementSpacing;
    });
  });
  
  const totalWidth = currentX + endPadding;
  
  // Créer le chemin SVG en pointillé qui passe par tous les éléments
  const pathD = elements.map((el, i) => {
    if (i === 0) return `M ${el.x} ${el.y}`;
    
    // Ligne courbe vers l'élément suivant
    const prev = elements[i - 1];
    const midX = (prev.x + el.x) / 2;
    const controlY = (prev.y + el.y) / 2 + (prev.y < el.y ? 20 : -20);
    
    return `Q ${midX} ${controlY} ${el.x} ${el.y}`;
  }).join(' ');
  
  return (
    <div className="fixed inset-0 overflow-hidden" style={{ backgroundColor: bgColor }}>
      {/* Texture hexagonale de ruche */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.20]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="honeycomb-levelmap" x="0" y="0" width="100" height="86.6" patternUnits="userSpaceOnUse">
            <polygon 
              points="50,0 93.3,25 93.3,75 50,100 6.7,75 6.7,25" 
              fill="none" 
              stroke={timeOfDay === 'night' ? '#4A90E2' : '#FDB022'}
              strokeWidth="3"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#honeycomb-levelmap)" />
      </svg>

      {/* Header avec bouton retour */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-center">
        <button
          onClick={onBack}
          className="absolute left-0 p-2.5 hover:scale-105 transition-transform rounded-xl"
          style={{
            background: 'linear-gradient(135deg, #FDB022 0%, #F59E0B 50%, #D97706 100%)',
            boxShadow: '0 4px 8px rgba(217, 119, 6, 0.5), inset 0 -2px 4px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.35)',
            border: '3px solid rgba(120, 53, 15, 0.4)',
          }}
        >
          <ArrowLeft className="w-5 h-5 text-amber-950" strokeWidth={2.5} />
        </button>
        
        <h1 
          className="select-none"
          style={{ 
            fontFamily: 'cursive',
            fontSize: 'clamp(1.5rem, 6vw, 2.5rem)',
            color: timeOfDay === 'night' ? '#7FFF00' : '#FDB022',
            textShadow: timeOfDay === 'night'
              ? '0 4px 8px rgba(127, 255, 0, 0.4), 0 0 40px rgba(127, 255, 0, 0.3), 0 2px 4px rgba(0,0,0,0.5)'
              : '0 4px 8px rgba(217, 119, 6, 0.4), 0 0 40px rgba(253, 176, 34, 0.3), 0 2px 4px rgba(0,0,0,0.5)',
            fontWeight: '900'
          }}
        >
          🗺️ Mode Histoire
        </h1>
      </div>

      {/* Scroll horizontal container - cadré pour mobile */}
      <div 
        className="absolute inset-x-0 overflow-x-auto overflow-y-hidden z-10"
        style={{
          top: '80px',
          height: 'min(400px, calc(100vh - 100px))',
        }}
      >
        <div 
          className="relative" 
          style={{ 
            width: `${totalWidth}px`,
            minWidth: '100%',
            height: '100%',
          }}
        >
          {/* SVG pour le chemin en pointillé */}
          <svg 
            className="absolute inset-0 pointer-events-none"
            width={totalWidth}
            height="100%"
            style={{ zIndex: -1 }}
          >
            {/* Chemin en pointillé */}
            <path
              d={pathD}
              fill="none"
              stroke={timeOfDay === 'night' ? '#7FFF00' : '#FDB022'}
              strokeWidth="4"
              strokeDasharray="15,15"
              opacity={timeOfDay === 'night' ? '0.7' : '0.5'}
              strokeLinecap="round"
            />
          </svg>

          {/* Éléments (ruches et gouttes) */}
          <div className="relative h-full">
            {elements.map((element, index) => {
              const key = element.type === 'hive' 
                ? `hive-${element.levelId}` 
                : `drop-${element.levelId}-${element.subLevelIndex}`;
              
              if (element.type === 'hive') {
                const level = element.level;
                const isBoss = element.isBoss;
                
                return (
                  <motion.button
                    key={key}
                    whileHover={level.unlocked && level.subLevels.length > 0 ? { 
                      scale: 1.1,
                      rotate: [0, -3, 3, 0],
                      transition: { duration: 0.4 }
                    } : {}}
                    whileTap={level.unlocked && level.subLevels.length > 0 ? { scale: 0.95 } : {}}
                    onClick={() => level.unlocked && level.subLevels.length > 0 && onLevelClick(level.id)}
                    disabled={!level.unlocked || level.subLevels.length === 0}
                    className="absolute"
                    style={{
                      left: `${element.x - 60}px`,
                      top: `${element.y - 60}px`,
                      width: '120px',
                      height: '120px',
                    }}
                  >
                    {/* Ruche hexagonale */}
                    <div
                      className="absolute inset-0 rounded-3xl transition-all"
                      style={{
                        background: level.unlocked
                          ? level.completed
                            ? timeOfDay === 'night'
                              ? 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)'
                              : 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                            : isBoss
                              ? timeOfDay === 'night'
                                ? 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)'
                                : 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)'
                              : timeOfDay === 'night'
                                ? 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 50%, #D97706 100%)'
                                : 'linear-gradient(135deg, #FDB022 0%, #F59E0B 50%, #D97706 100%)'
                          : timeOfDay === 'night'
                            ? 'linear-gradient(135deg, #4B5563 0%, #374151 100%)'
                            : 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
                        boxShadow: level.unlocked
                          ? isBoss
                            ? timeOfDay === 'night'
                              ? '0 12px 24px rgba(239, 68, 68, 0.8), inset 0 -4px 12px rgba(0,0,0,0.4), inset 0 4px 12px rgba(255,255,255,0.25), 0 0 50px rgba(239, 68, 68, 0.6)'
                              : '0 12px 24px rgba(220, 38, 38, 0.6), inset 0 -4px 12px rgba(0,0,0,0.3), inset 0 4px 12px rgba(255,255,255,0.2), 0 0 40px rgba(220, 38, 38, 0.4)'
                            : timeOfDay === 'night'
                              ? '0 12px 24px rgba(251, 191, 36, 0.7), inset 0 -4px 12px rgba(0,0,0,0.3), inset 0 4px 12px rgba(255,255,255,0.4), 0 0 30px rgba(251, 191, 36, 0.5)'
                              : '0 12px 24px rgba(217, 119, 6, 0.5), inset 0 -4px 12px rgba(0,0,0,0.2), inset 0 4px 12px rgba(255,255,255,0.35)'
                          : timeOfDay === 'night'
                            ? '0 8px 16px rgba(0, 0, 0, 0.5), inset 0 -2px 8px rgba(0,0,0,0.3)'
                            : '0 8px 16px rgba(0, 0, 0, 0.3)',
                        border: isBoss 
                          ? timeOfDay === 'night'
                            ? '4px solid rgba(185, 28, 28, 0.8)' 
                            : '4px solid rgba(153, 27, 27, 0.6)' 
                          : timeOfDay === 'night'
                            ? '4px solid rgba(217, 119, 6, 0.6)'
                            : '4px solid rgba(120, 53, 15, 0.4)',
                        opacity: level.unlocked ? 1 : 0.5,
                      }}
                    >
                      {/* Texture cire */}
                      <div 
                        className="absolute inset-0 opacity-15 pointer-events-none rounded-3xl"
                        style={{
                          backgroundImage: `
                            radial-gradient(circle at 25% 25%, rgba(255,255,255,0.5) 0%, transparent 50%),
                            radial-gradient(circle at 75% 75%, rgba(0,0,0,0.2) 0%, transparent 50%)
                          `
                        }}
                      />
                    </div>

                    {/* Contenu */}
                    <div className="relative h-full flex flex-col items-center justify-center p-3">
                      {!level.unlocked && (
                        <Lock className="w-8 h-8 text-gray-300 mb-2" />
                      )}
                      
                      {isBoss && level.unlocked && (
                        <Crown 
                          className="w-8 h-8 mb-1" 
                          strokeWidth={2.5}
                          style={{
                            color: timeOfDay === 'night' ? '#FCD34D' : '#FBBF24',
                            filter: timeOfDay === 'night' ? 'drop-shadow(0 0 8px rgba(252, 211, 77, 0.8))' : 'none'
                          }}
                        />
                      )}
                      
                      <span 
                        style={{ 
                          fontSize: isBoss ? '16px' : '18px', 
                          fontWeight: '900',
                          color: isBoss 
                            ? '#FFFFFF'
                            : '#1e3a8a',
                          textShadow: isBoss 
                            ? timeOfDay === 'night'
                              ? '0 2px 6px rgba(0,0,0,0.8), 0 0 10px rgba(239, 68, 68, 0.5)'
                              : '0 2px 4px rgba(0,0,0,0.5)'
                            : 'none'
                        }}
                      >
                        {level.title}
                      </span>
                      
                      {/* Badge "Bientôt disponible" pour niveau 2+ */}
                      {level.unlocked && !level.completed && level.id >= 2 && !isBoss && (
                        <div 
                          className="mt-2 px-2 py-0.5 rounded-lg"
                          style={{
                            fontSize: '10px',
                            fontWeight: '700',
                            background: 'rgba(59, 130, 246, 0.9)',
                            color: 'white',
                            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                          }}
                        >
                          Bientôt dispo
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              } else {
                // Goutte de miel (sous-niveau)
                const level = element.level;
                const subIndex = element.subLevelIndex!;
                const subLevel = level.subLevels[subIndex];
                
                return (
                  <motion.div
                    key={key}
                    whileHover={{ 
                      scale: 1.2,
                      y: -5,
                      transition: { type: 'spring', damping: 10, stiffness: 400 }
                    }}
                    animate={subLevel.completed ? {
                      y: [0, -3, 0],
                      transition: {
                        repeat: Infinity,
                        duration: 2.5,
                        ease: 'easeInOut',
                        delay: subIndex * 0.15
                      }
                    } : {}}
                    className="absolute"
                    style={{
                      left: `${element.x - 20}px`,
                      top: `${element.y - 25}px`,
                      width: '40px',
                      height: '50px',
                    }}
                  >
                    {/* Goutte de miel */}
                    <div
                      className="absolute inset-0 transition-all"
                      style={{
                        background: subLevel.completed
                          ? timeOfDay === 'night'
                            ? 'linear-gradient(135deg, rgba(251, 191, 36, 1) 0%, rgba(245, 158, 11, 1) 100%)'
                            : 'linear-gradient(135deg, rgba(251, 191, 36, 0.95) 0%, rgba(245, 158, 11, 0.95) 100%)'
                          : timeOfDay === 'night'
                            ? 'linear-gradient(135deg, rgba(251, 191, 36, 1) 0%, rgba(245, 158, 11, 1) 100%)'
                            : 'linear-gradient(135deg, rgba(251, 191, 36, 0.9) 0%, rgba(245, 158, 11, 0.9) 100%)',
                        borderRadius: '50% 50% 50% 0',
                        transform: 'rotate(-45deg)',
                        boxShadow: subLevel.completed
                          ? timeOfDay === 'night'
                            ? '0 4px 12px rgba(251, 191, 36, 1), inset 0 2px 6px rgba(255,255,255,0.6), 0 0 25px rgba(251, 191, 36, 0.7)'
                            : '0 4px 12px rgba(251, 191, 36, 0.8), inset 0 2px 6px rgba(255,255,255,0.5), 0 0 20px rgba(251, 191, 36, 0.4)'
                          : timeOfDay === 'night'
                            ? '0 2px 6px rgba(0, 0, 0, 0.4), inset 0 1px 3px rgba(255,255,255,0.25)'
                            : '0 2px 6px rgba(0, 0, 0, 0.2), inset 0 1px 3px rgba(255,255,255,0.2)',
                        border: timeOfDay === 'night'
                          ? '2px solid rgba(245, 158, 11, 0.7)'
                          : '2px solid rgba(245, 158, 11, 0.5)',
                      }}
                    >
                      {/* Brillance pour les gouttes complétées */}
                      {subLevel.completed && (
                        <div
                          className="absolute top-1 left-1 w-2 h-2 rounded-full"
                          style={{
                            background: 'rgba(255, 255, 255, 0.8)',
                            filter: 'blur(1px)',
                          }}
                        />
                      )}
                    </div>

                    {/* Numéro du sous-niveau */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span 
                        style={{ 
                          fontSize: '14px', 
                          fontWeight: '900',
                          transform: 'rotate(0deg)',
                          color: '#78350F',
                          textShadow: 'none',
                        }}
                      >
                        {subIndex + 1}
                      </span>
                    </div>
                  </motion.div>
                );
              }
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

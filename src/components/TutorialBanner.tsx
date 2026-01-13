import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

interface TutorialBannerProps {
  title: string;
  instructions: string;
  timeOfDay?: 'day' | 'night';
  isCompleted?: boolean;
  onNext?: () => void;
}

export function TutorialBanner({ title, instructions, timeOfDay = 'day', isCompleted = false, onNext }: TutorialBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0, scale: 0.9 }}
          animate={{ 
            y: 0, 
            opacity: 1, 
            scale: 1,
          }}
          exit={{ 
            y: -100, 
            opacity: 0, 
            scale: 0.9,
          }}
          transition={{ 
            type: 'spring', 
            damping: 15, 
            stiffness: 300,
            mass: 0.8
          }}
          className="absolute left-1/2 -translate-x-1/2 z-30 max-w-2xl w-full"
          style={{
            top: 'clamp(8px, 1.5vh, 16px)',
            paddingLeft: 'clamp(8px, 2vw, 16px)',
            paddingRight: 'clamp(8px, 2vw, 16px)',
            pointerEvents: 'none',
          }}
        >
        <div
          className="relative rounded-2xl shadow-lg flex items-center"
          style={{
            background: 'linear-gradient(135deg, #FDB022 0%, #F59E0B 50%, #D97706 100%)',
            boxShadow: '0 8px 16px rgba(217, 119, 6, 0.5), inset 0 -3px 8px rgba(0,0,0,0.2), inset 0 3px 8px rgba(255,255,255,0.35)',
            border: '3px solid rgba(120, 53, 15, 0.4)',
            padding: 'clamp(10px, 2vh, 16px)',
            minHeight: 'clamp(50px, 8vh, 70px)',
            pointerEvents: 'none',
          }}
        >
          {/* Texture cire */}
          <div 
            className="absolute inset-0 opacity-15 pointer-events-none rounded-2xl"
            style={{
              backgroundImage: `
                radial-gradient(circle at 25% 25%, rgba(255,255,255,0.5) 0%, transparent 50%),
                radial-gradient(circle at 75% 75%, rgba(0,0,0,0.2) 0%, transparent 50%)
              `
            }}
          />

          {/* Contenu */}
          <div className="relative flex-1" style={{ paddingRight: isCompleted && onNext ? 'clamp(120px, 18vw, 160px)' : '0', pointerEvents: 'none' }}>
            {isCompleted ? (
              <>
                <h3 
                  className="text-amber-950"
                  style={{ 
                    fontSize: 'clamp(14px, 3.5vw, 18px)', 
                    fontWeight: '900',
                    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                    marginBottom: 'clamp(4px, 1vh, 8px)',
                    pointerEvents: 'none',
                  }}
                >
                  🎉 Bravo !
                </h3>
                <p 
                  className="text-amber-900"
                  style={{ 
                    fontSize: 'clamp(12px, 3vw, 15px)', 
                    lineHeight: '1.4',
                    fontWeight: '600',
                    pointerEvents: 'none',
                  }}
                >
                  Mission accomplie !
                </p>
              </>
            ) : (
              <>
                <h3 
                  className="text-amber-950"
                  style={{ 
                    fontSize: 'clamp(14px, 3.5vw, 18px)', 
                    fontWeight: '900',
                    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                    marginBottom: 'clamp(4px, 1vh, 8px)',
                    pointerEvents: 'none',
                  }}
                >
                  📚 {title}
                </h3>
                <p 
                  className="text-amber-900"
                  style={{ 
                    fontSize: 'clamp(12px, 3vw, 15px)', 
                    lineHeight: '1.4',
                    fontWeight: '600',
                    pointerEvents: 'none',
                  }}
                >
                  {instructions}
                </p>
              </>
            )}
          </div>
          
          {/* Bouton "Suivant" - FLEXBOX au lieu de position absolute */}
          {isCompleted && onNext && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
                marginLeft: 'clamp(8px, 2vw, 12px)',
                pointerEvents: 'none',
              }}
            >
              <button
                onClick={onNext}
                style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  boxShadow: '0 4px 8px rgba(5, 150, 105, 0.4), inset 0 -2px 4px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.35)',
                  border: '3px solid rgba(4, 120, 87, 0.3)',
                  padding: 'clamp(12px, 3vh, 16px) clamp(20px, 4vw, 28px)',
                  borderRadius: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  minWidth: 'clamp(100px, 20vw, 140px)',
                  minHeight: 'clamp(44px, 6vh, 56px)',
                  pointerEvents: 'auto',
                  touchAction: 'manipulation',
                  userSelect: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <span className="text-white" style={{ fontSize: 'clamp(13px, 3vw, 16px)', fontWeight: '700', pointerEvents: 'none' }}>
                  Suivant
                </span>
                <span className="text-white" style={{ fontSize: 'clamp(14px, 3.5vw, 18px)', pointerEvents: 'none' }}>→</span>
              </button>
            </div>
          )}
        </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

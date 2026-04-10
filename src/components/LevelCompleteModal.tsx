import { motion } from 'motion/react';
import { Star, RotateCcw, ArrowRight, Play } from 'lucide-react';

interface LevelCompleteModalProps {
  stars: number; // 0-3
  onRestart: () => void;
  onNext: () => void;
  onStartQuickGame?: () => void;
  timeOfDay?: 'day' | 'night';
  isFinalTutorial?: boolean;
}

export function LevelCompleteModal({ stars, onRestart, onNext, onStartQuickGame, timeOfDay = 'day', isFinalTutorial = false }: LevelCompleteModalProps) {
  const bgColor = timeOfDay === 'night' ? '#1a2332' : '#8B7355';
  
  return (
    <div 
      style={{
        position: 'fixed',
        inset: '0',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* Modal content */}
      <motion.div
        initial={{ scale: 0.75, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 10, stiffness: 380, mass: 0.5 }}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '28rem',
          borderRadius: '24px',
          overflow: 'visible',
          background: 'linear-gradient(135deg, #FDB022 0%, #F59E0B 50%, #D97706 100%)',
          boxShadow: '0 20px 40px rgba(217, 119, 6, 0.6), inset 0 -4px 12px rgba(0,0,0,0.2), inset 0 4px 12px rgba(255,255,255,0.35)',
          border: '4px solid rgba(120, 53, 15, 0.4)',
        }}
      >
        {/* Texture cire */}
        <div 
          style={{
            position: 'absolute',
            inset: '0',
            opacity: 0.15,
            pointerEvents: 'none',
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(255,255,255,0.5) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(0,0,0,0.2) 0%, transparent 50%)
            `,
            borderRadius: '24px',
          }}
        />

        {/* Contenu + boutons en flux normal */}
        <div
          style={{
            position: 'relative',
            padding: '2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {/* Titre */}
          <h2
            style={{
              fontFamily: 'cursive',
              fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
              fontWeight: '900',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)',
              color: '#78350f',
              margin: 0,
            }}
          >
            {isFinalTutorial ? 'Tutoriel Terminé !' : 'Niveau Réussi !'}
          </h2>

          {/* Message spécial pour fin du tutoriel */}
          {isFinalTutorial && (
            <p style={{ fontSize: '1.1rem', color: '#78350f', margin: 0, fontWeight: '600' }}>
              Bravo ! Tu maîtrises les bases. Prêt pour de nouveaux défis ?
            </p>
          )}

          {/* Étoiles — toujours 3 pour le tuto */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            {[1, 2, 3].map((starNum) => {
              const lit = isFinalTutorial ? true : starNum <= stars;
              return (
                <Star
                  key={starNum}
                  style={{
                    width: '64px',
                    height: '64px',
                    color: lit ? '#FBBF24' : '#9CA3AF',
                    fill: lit ? '#FBBF24' : 'none',
                    strokeWidth: 2,
                    filter: lit ? 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))' : 'none',
                  }}
                />
              );
            })}
          </div>

          {isFinalTutorial ? (
            <>
              {/* Recommencer seul, pleine largeur */}
              <button
                onClick={onRestart}
                style={{
                  width: '100%', padding: '14px 24px', borderRadius: '16px',
                  background: 'linear-gradient(135deg, #FDB022 0%, #F59E0B 50%, #D97706 100%)',
                  boxShadow: '0 8px 16px rgba(217,119,6,0.4), inset 0 -3px 8px rgba(0,0,0,0.2), inset 0 3px 8px rgba(255,255,255,0.3)',
                  border: '3px solid rgba(120,53,15,0.4)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  fontSize: '16px', fontWeight: '700', color: '#78350f', cursor: 'pointer',
                  outline: 'none', minHeight: '52px', touchAction: 'manipulation',
                  userSelect: 'none', WebkitTapHighlightColor: 'transparent',
                }}
              >
                <RotateCcw style={{ width: '20px', height: '20px', flexShrink: 0, pointerEvents: 'none' }} />
                <span style={{ pointerEvents: 'none' }}>Recommencer</span>
              </button>

              {/* Partie rapide + Carte des niveaux (désactivé) côte à côte */}
              <div style={{ display: 'flex', gap: '12px' }}>
                {onStartQuickGame && (
                  <button
                    onClick={onStartQuickGame}
                    style={{
                      flex: '1', padding: '14px 24px', borderRadius: '16px',
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      boxShadow: '0 8px 16px rgba(16,185,129,0.4), inset 0 -3px 8px rgba(0,0,0,0.2), inset 0 3px 8px rgba(255,255,255,0.2)',
                      border: '3px solid rgba(5,150,105,0.4)',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      fontSize: '16px', fontWeight: '700', color: 'white', cursor: 'pointer',
                      outline: 'none', minHeight: '52px', touchAction: 'manipulation',
                      userSelect: 'none', WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    <Play style={{ width: '20px', height: '20px', flexShrink: 0, pointerEvents: 'none' }} fill="white" strokeWidth={0} />
                    <span style={{ pointerEvents: 'none' }}>Partie rapide</span>
                  </button>
                )}

                <button
                  disabled
                  style={{
                    flex: '1', padding: '14px 24px', borderRadius: '16px',
                    background: 'linear-gradient(135deg, #FDB022 0%, #F59E0B 50%, #D97706 100%)',
                    boxShadow: '0 8px 16px rgba(217,119,6,0.4), inset 0 -3px 8px rgba(0,0,0,0.2), inset 0 3px 8px rgba(255,255,255,0.3)',
                    border: '3px solid rgba(120,53,15,0.4)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    fontSize: '16px', fontWeight: '700', color: '#78350f', cursor: 'not-allowed',
                    outline: 'none', minHeight: '52px', touchAction: 'manipulation',
                    userSelect: 'none', WebkitTapHighlightColor: 'transparent',
                    opacity: 0.4,
                  }}
                >
                  <span style={{ pointerEvents: 'none' }}>Carte des niveaux</span>
                  <ArrowRight style={{ width: '20px', height: '20px', flexShrink: 0, pointerEvents: 'none' }} />
                </button>
              </div>
            </>
          ) : (
            /* Recommencer + Suivant côte à côte (hors tutoriel) */
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={onRestart}
                style={{
                  flex: '1', padding: '14px 24px', borderRadius: '16px',
                  background: 'linear-gradient(135deg, #FDB022 0%, #F59E0B 50%, #D97706 100%)',
                  boxShadow: '0 8px 16px rgba(217,119,6,0.4), inset 0 -3px 8px rgba(0,0,0,0.2), inset 0 3px 8px rgba(255,255,255,0.3)',
                  border: '3px solid rgba(120,53,15,0.4)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  fontSize: '16px', fontWeight: '700', color: '#78350f', cursor: 'pointer',
                  outline: 'none', minHeight: '52px', touchAction: 'manipulation',
                  userSelect: 'none', WebkitTapHighlightColor: 'transparent',
                }}
              >
                <RotateCcw style={{ width: '20px', height: '20px', flexShrink: 0, pointerEvents: 'none' }} />
                <span style={{ pointerEvents: 'none' }}>Recommencer</span>
              </button>

              <button
                onClick={onNext}
                style={{
                  flex: '1', padding: '14px 24px', borderRadius: '16px',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  boxShadow: '0 8px 16px rgba(16,185,129,0.4), inset 0 -3px 8px rgba(0,0,0,0.2), inset 0 3px 8px rgba(255,255,255,0.2)',
                  border: '3px solid rgba(5,150,105,0.4)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  fontSize: '16px', fontWeight: '700', color: 'white', cursor: 'pointer',
                  outline: 'none', minHeight: '52px', touchAction: 'manipulation',
                  userSelect: 'none', WebkitTapHighlightColor: 'transparent',
                }}
              >
                <span style={{ pointerEvents: 'none' }}>Suivant</span>
                <ArrowRight style={{ width: '20px', height: '20px', flexShrink: 0, pointerEvents: 'none' }} />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

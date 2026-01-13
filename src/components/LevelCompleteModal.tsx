import { motion } from 'motion/react';
import { Star, RotateCcw, ArrowRight } from 'lucide-react';

interface LevelCompleteModalProps {
  stars: number; // 0-3
  onRestart: () => void;
  onNext: () => void;
  timeOfDay?: 'day' | 'night';
  isFinalTutorial?: boolean; // Si c'est la fin du tutoriel (Level 1-5)
}

export function LevelCompleteModal({ stars, onRestart, onNext, timeOfDay = 'day', isFinalTutorial = false }: LevelCompleteModalProps) {
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
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* Modal content */}
      <div
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

        {/* Contenu */}
        <div 
          style={{
            position: 'relative',
            padding: '2rem 2rem 7rem 2rem',
            textAlign: 'center',
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
              marginBottom: '1.5rem',
            }}
          >
            {isFinalTutorial ? '🎓 Tutoriel Terminé !' : '🎉 Niveau Réussi !'}
          </h2>
          
          {/* Message spécial pour fin du tutoriel */}
          {isFinalTutorial && (
            <p
              style={{
                fontSize: '1.1rem',
                color: '#78350f',
                marginBottom: '1rem',
                fontWeight: '600',
              }}
            >
              Bravo ! Tu maîtrises les bases. Prêt pour de nouveaux défis ?
            </p>
          )}

          {/* Étoiles */}
          <div 
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '12px',
              marginBottom: '2rem',
            }}
          >
            {[1, 2, 3].map((starNum) => (
              <div key={starNum}>
                <Star
                  style={{
                    width: '64px',
                    height: '64px',
                    color: starNum <= stars ? '#FBBF24' : '#9CA3AF',
                    fill: starNum <= stars ? '#FBBF24' : 'none',
                    strokeWidth: 2,
                    filter: starNum <= stars 
                      ? 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))' 
                      : 'none'
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* BOUTONS - SIMPLIFIÉ SANS TRANSFORM */}
        <div
          style={{
            position: 'absolute',
            bottom: '2rem',
            left: '2rem',
            right: '2rem',
            display: 'flex',
            gap: '12px',
            zIndex: 100,
          }}
        >
          {/* Recommencer */}
          <button
            onClick={onRestart}
            style={{
              flex: '1',
              padding: '14px 24px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3), inset 0 -3px 8px rgba(0,0,0,0.2), inset 0 3px 8px rgba(255,255,255,0.2)',
              border: '3px solid rgba(0, 0, 0, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '16px',
              fontWeight: '700',
              color: 'white',
              cursor: 'pointer',
              outline: 'none',
              minHeight: '52px',
              touchAction: 'manipulation',
              userSelect: 'none',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <RotateCcw style={{ width: '20px', height: '20px', flexShrink: 0, pointerEvents: 'none' }} />
            <span style={{ pointerEvents: 'none' }}>Recommencer</span>
          </button>

          {/* Suivant */}
          <button
            onClick={onNext}
            style={{
              flex: '1',
              padding: '14px 24px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              boxShadow: '0 8px 16px rgba(16, 185, 129, 0.4), inset 0 -3px 8px rgba(0,0,0,0.2), inset 0 3px 8px rgba(255,255,255,0.2)',
              border: '3px solid rgba(5, 150, 105, 0.4)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '16px',
              fontWeight: '700',
              color: 'white',
              cursor: 'pointer',
              outline: 'none',
              minHeight: '52px',
              touchAction: 'manipulation',
              userSelect: 'none',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <span style={{ pointerEvents: 'none' }}>
              {isFinalTutorial ? 'Carte des niveaux' : 'Suivant'}
            </span>
            <ArrowRight style={{ width: '20px', height: '20px', flexShrink: 0, pointerEvents: 'none' }} />
          </button>
        </div>
      </div>
    </div>
  );
}

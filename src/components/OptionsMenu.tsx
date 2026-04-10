import { ArrowLeft, Volume2, VolumeX, Sun, Moon, RotateCcw, Hand, Axe } from 'lucide-react';

interface OptionsMenuProps {
  onBack: () => void;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  timeOfDay?: 'day' | 'night';
  onToggleTimeOfDay?: () => void;
  leftHanded?: boolean;
  onToggleLeftHanded?: () => void;
  onResetProgress?: () => void;
  onGoToFirstBattle?: () => void;
}

export function OptionsMenu({ onBack, soundEnabled = true, onToggleSound, timeOfDay = 'day', onToggleTimeOfDay, leftHanded = false, onToggleLeftHanded, onResetProgress, onGoToFirstBattle }: OptionsMenuProps) {
  // Couleur de fond adaptée au mode jour/nuit
  const bgColor = timeOfDay === 'night' ? '#1a2332' : '#8B7355'; // Bleu foncé nuit, marron taupe jour

  return (
    <div className="fixed inset-0 overflow-y-auto overscroll-contain" style={{ backgroundColor: bgColor }}>
      {/* Texture hexagonale de ruche */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.20]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="honeycomb-options" x="0" y="0" width="100" height="86.6" patternUnits="userSpaceOnUse">
            <polygon 
              points="50,0 93.3,25 93.3,75 50,100 6.7,75 6.7,25" 
              fill="none" 
              stroke={timeOfDay === 'night' ? '#4A90E2' : '#FDB022'}
              strokeWidth="3"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#honeycomb-options)" />
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
          Options
        </h1>
      </div>

      {/* Options container */}
      <div className="relative z-10 flex items-center justify-center min-h-full px-4 pt-20 pb-16">
        <div className="w-full max-w-4xl">

          {/* Options container */}
          <div 
            className="relative p-5 space-y-4 rounded-3xl max-w-2xl mx-auto"
            style={{
              background: 'linear-gradient(135deg, #FDB022 0%, #F59E0B 50%, #D97706 100%)',
              boxShadow: '0 12px 24px rgba(217, 119, 6, 0.5), inset 0 -4px 12px rgba(0,0,0,0.2), inset 0 4px 12px rgba(255,255,255,0.35)',
              border: '4px solid rgba(120, 53, 15, 0.4)',
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
              
              <div className="relative space-y-4">
                {/* Audio */}
                <div className="border-b pb-4" style={{ borderColor: 'rgba(120, 53, 15, 0.3)' }}>
                  <h3 className="mb-3 flex items-center gap-2 text-amber-950" style={{ fontSize: '18px', fontWeight: '700' }}>
                    {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    Audio
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="mb-1 text-amber-950" style={{ fontSize: '15px', fontWeight: '700' }}>
                        Son d'ambiance
                      </p>
                      <p className="text-amber-900" style={{ fontSize: '13px', lineHeight: '1.4' }}>
                        Musique de fond
                      </p>
                    </div>
                    <button
                      onClick={() => onToggleSound?.()}
                      className="relative w-14 h-8 rounded-full transition-all"
                      style={{
                        background: soundEnabled 
                          ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                          : 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
                      }}
                    >
                      <div 
                        className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all"
                        style={{
                          left: soundEnabled ? 'calc(100% - 28px)' : '4px',
                        }}
                      />
                    </button>
                  </div>
                </div>

                {/* Ambiance */}
                <div className="border-b pb-4" style={{ borderColor: 'rgba(120, 53, 15, 0.3)' }}>
                  <h3 className="mb-3 flex items-center gap-2 text-amber-950" style={{ fontSize: '18px', fontWeight: '700' }}>
                    {timeOfDay === 'day' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    Ambiance
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="mb-1 text-amber-950" style={{ fontSize: '15px', fontWeight: '700' }}>
                        Mode {timeOfDay === 'day' ? 'Jour' : 'Nuit'}
                      </p>
                      <p className="text-amber-900" style={{ fontSize: '13px', lineHeight: '1.4' }}>
                        Visuel et son
                      </p>
                    </div>
                    <button
                      onClick={() => onToggleTimeOfDay?.()}
                      className="relative w-14 h-8 rounded-full transition-all"
                      style={{
                        background: timeOfDay === 'night'
                          ? 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)'
                          : 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
                      }}
                    >
                      <div 
                        className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all"
                        style={{
                          left: timeOfDay === 'night' ? 'calc(100% - 28px)' : '4px',
                        }}
                      />
                    </button>
                  </div>
                </div>

                {/* Accessibilité */}
                <div className="border-b pb-4" style={{ borderColor: 'rgba(120, 53, 15, 0.3)' }}>
                  <h3 className="mb-3 flex items-center gap-2 text-amber-950" style={{ fontSize: '18px', fontWeight: '700' }}>
                    <Hand className="w-5 h-5" />
                    Accessibilité
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="mb-1 text-amber-950" style={{ fontSize: '15px', fontWeight: '700' }}>
                        Sélection inversée
                      </p>
                      <p className="text-amber-900" style={{ fontSize: '13px', lineHeight: '1.4' }}>
                        {leftHanded ? 'Cercle : centre = départ, rayon = distance' : 'Cercle : centre = milieu, rayon = moitié'}
                      </p>
                    </div>
                    <button
                      onClick={() => onToggleLeftHanded?.()}
                      className="relative w-14 h-8 rounded-full transition-all"
                      style={{
                        background: leftHanded
                          ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                          : 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
                      }}
                    >
                      <div
                        className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all"
                        style={{
                          left: leftHanded ? 'calc(100% - 28px)' : '4px',
                        }}
                      />
                    </button>
                  </div>
                </div>

                {/* Gameplay */}
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-amber-950" style={{ fontSize: '18px', fontWeight: '700' }}>
                    <Axe className="w-5 h-5" />
                    Gameplay
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="mb-1 text-amber-950" style={{ fontSize: '15px', fontWeight: '700' }}>
                        Bûcherons (Difficile)
                      </p>
                      <p className="text-amber-900" style={{ fontSize: '13px', lineHeight: '1.4' }}>
                        Ils coupent les arbres
                      </p>
                    </div>
                    <div
                      className="px-3 py-1.5 rounded-full text-center"
                      style={{
                        background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
                      }}
                    >
                      <span className="text-amber-950" style={{ fontSize: '12px', fontWeight: '700' }}>
                        Arrive bientôt
                      </span>
                    </div>
                  </div>
                </div>

                {/* Réinitialisation progression — masqué temporairement */}
                {/* <div>
                  <h3 className="mb-3 flex items-center gap-2 text-amber-950" style={{ fontSize: '18px', fontWeight: '700' }}>
                    <RotateCcw className="w-5 h-5" />
                    Progression
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="mb-1 text-amber-950" style={{ fontSize: '15px', fontWeight: '700' }}>
                        Réinitialiser la progression
                      </p>
                      <p className="text-amber-900" style={{ fontSize: '13px', lineHeight: '1.4' }}>
                        Tout recommencer à zéro
                      </p>
                    </div>
                    <button
                      onClick={onResetProgress}
                      className="px-3 py-1.5 rounded-full hover:scale-105 transition-transform"
                      style={{
                        background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                        boxShadow: '0 2px 4px rgba(220, 38, 38, 0.3), inset 0 -1px 2px rgba(0,0,0,0.2)',
                      }}
                    >
                      <span className="text-white" style={{ fontSize: '13px', fontWeight: '700' }}>
                        Réinitialiser
                      </span>
                    </button>
                  </div>
                </div> */}
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}

import { Play, Settings, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';

interface MainMenuProps {
  onStartGame: () => void;
  onStartStoryMode: () => void;
  onStartTutorial: () => void;
  onShowOptions: () => void;
  timeOfDay?: 'day' | 'night';
  onToggleTimeOfDay?: () => void;
}

// Bouton principal
function MenuButton({ onClick, icon, title, subtitle, secondary = false, fullWidth = false }: { 
  onClick: () => void; 
  icon: React.ReactNode; 
  title: string; 
  subtitle?: string;
  secondary?: boolean;
  fullWidth?: boolean;
}) {
  const isMobile = window.innerWidth <= 768;
  
  // Bouton secondaire : plus petit et style différent
  if (secondary) {
    return (
      <button
        onClick={onClick}
        className="relative px-4 py-2 hover:scale-105 transition-all transform group rounded-xl"
        style={{
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(4px)',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2), inset 0 -2px 4px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.2)',
          border: '2px solid rgba(255, 255, 255, 0.3)',
        }}
      >
        <div className="relative flex items-center justify-center gap-2 text-white">
          <div className="w-4 h-4 group-hover:scale-110 transition-transform">
            {icon}
          </div>
          <span style={{ fontSize: '14px', textShadow: '0 1px 2px rgba(0,0,0,0.5)', fontWeight: '600' }}>{title}</span>
        </div>
      </button>
    );
  }
  
  // Bouton principal
  const buttonWidth = fullWidth ? 'w-full' : (isMobile ? 'flex-1' : 'flex-1');
  const py = 'py-2.5';
  const px = 'px-4';
  const iconSize = 'w-6 h-6';
  const titleFontSize = isMobile ? '17px' : '18px';
  const subtitleFontSize = isMobile ? '13px' : '14px';
  
  return (
    <button
      onClick={onClick}
      className={`relative ${buttonWidth} ${py} ${px} hover:scale-105 transition-all transform group rounded-2xl`}
      style={{
        background: 'linear-gradient(135deg, #FDB022 0%, #F59E0B 50%, #D97706 100%)',
        boxShadow: '0 10px 20px rgba(217, 119, 6, 0.5), inset 0 -4px 10px rgba(0,0,0,0.2), inset 0 4px 10px rgba(255,255,255,0.35)',
        border: '4px solid rgba(120, 53, 15, 0.4)',
      }}
    >
      {/* Contenu */}
      <div className="relative flex items-center justify-center gap-2.5 text-amber-950">
        <div className={`group-hover:scale-110 transition-transform ${iconSize}`}>
          {icon}
        </div>
        {subtitle ? (
          <div className="text-left">
            <div style={{ fontSize: titleFontSize, textShadow: '0 1px 2px rgba(0,0,0,0.1)', fontWeight: '700' }}>{title}</div>
            <div style={{ fontSize: subtitleFontSize }} className="opacity-80">{subtitle}</div>
          </div>
        ) : (
          <span style={{ fontSize: titleFontSize, textShadow: '0 1px 2px rgba(0,0,0,0.1)', fontWeight: '700' }}>{title}</span>
        )}
      </div>
    </button>
  );
}

export function MainMenu({ onStartGame, onStartStoryMode, onStartTutorial, onShowOptions, timeOfDay = 'day', onToggleTimeOfDay }: MainMenuProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isLandscape, setIsLandscape] = useState(true);

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isSmallScreen = window.innerWidth <= 1024;
      setIsMobile(isMobileDevice || isSmallScreen);
      setIsLandscape(window.innerWidth > window.innerHeight);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);

    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, []);

  // Couleur de fond adaptée au mode jour/nuit
  const bgColor = timeOfDay === 'night' ? '#1a2332' : '#8B7355'; // Bleu foncé nuit, marron taupe jour

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ backgroundColor: bgColor }}>
      {/* Texture hexagonale de ruche */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.20]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="honeycomb-menu" x="0" y="0" width="100" height="86.6" patternUnits="userSpaceOnUse">
            <polygon 
              points="50,0 93.3,25 93.3,75 50,100 6.7,75 6.7,25" 
              fill="none" 
              stroke={timeOfDay === 'night' ? '#4A90E2' : '#FDB022'}
              strokeWidth="3"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#honeycomb-menu)" />
      </svg>

      {/* Contenu du menu */}
      <div className="relative z-10 flex items-center justify-center h-full px-4 overflow-y-auto">
        <div className="text-center w-full max-w-md py-2 relative">
          {/* Titre "Rush" */}
          <div className="mb-0">
            <div className="flex flex-col items-center justify-center mb-0">

              {/* Titre Rush */}
              {timeOfDay === 'night' ? (
                <h1
                  className="select-none w-full text-center"
                  style={{
                    fontFamily: 'cursive',
                    fontSize: 'clamp(40px, 14vw, 80px)',
                    fontWeight: '900',
                    backgroundImage: 'linear-gradient(180deg, #7FFF00 0%, #6FEE00 40%, #5FDD00 70%, #4FCC00 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textShadow: '0 8px 16px rgba(127, 255, 0, 0.6)',
                    filter: 'drop-shadow(0 4px 8px rgba(127, 255, 0, 0.4)) drop-shadow(0 0 40px rgba(127, 255, 0, 0.3))',
                    letterSpacing: '0.05em',
                    WebkitTextStroke: '1px rgba(255,255,255,0.6)',
                  }}
                >
                  Rushzzz..
                </h1>
              ) : (
                <svg
                  viewBox="0 0 400 110"
                  style={{ width: 'clamp(160px, 38vw, 320px)', height: 'auto', overflow: 'visible' }}
                  aria-label="Rush"
                >
                  <defs>
                    <linearGradient id="title-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%"   stopColor="#FDB022" />
                      <stop offset="40%"  stopColor="#F59E0B" />
                      <stop offset="70%"  stopColor="#D97706" />
                      <stop offset="100%" stopColor="#B45309" />
                    </linearGradient>
                  </defs>
                  <text
                    x="200" y="88"
                    textAnchor="middle"
                    fontFamily="cursive"
                    fontSize="96"
                    fontWeight="900"
                    stroke="rgba(255,255,255,0.92)"
                    strokeWidth="6"
                    strokeLinejoin="round"
                    fill="url(#title-grad)"
                    paintOrder="stroke"
                    letterSpacing="3"
                  >
                    Rush
                  </text>
                </svg>
              )}
            </div>
            
            <p
              className="italic text-white px-4"
              style={{
                fontSize: 'clamp(16px, 4vw, 19px)',
                textShadow: '0 2px 6px rgba(0,0,0,0.9)',
                fontWeight: '700',
                transform: 'translateY(-16px)',
              }}
            >
              Conquérez la forêt avec vos {timeOfDay === 'night' ? 'lucioles' : 'abeilles'} !
            </p>
          </div>

          {/* Menu buttons */}
          <div className="space-y-3 pb-4">
            {/* Tutoriel */}
            <MenuButton
              onClick={onStartTutorial}
              icon={<BookOpen className="w-6 h-6" />}
              title="Tutoriel"
              subtitle="Apprendre les bases"
              fullWidth
            />

            {/* Partie Rapide + Mode Histoire désactivé côte à côte */}
            <div className="flex gap-2.5">
              <MenuButton
                onClick={onStartGame}
                icon={<Play className="w-6 h-6" fill="currentColor" strokeWidth={0} />}
                title="Jouer"
                subtitle="Partie rapide"
              />

              {/* Mode Histoire — désactivé temporairement */}
              <button
                disabled
                className="relative flex-1 py-2.5 px-4 rounded-2xl cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #FDB022 0%, #F59E0B 50%, #D97706 100%)',
                  boxShadow: '0 10px 20px rgba(217, 119, 6, 0.5), inset 0 -4px 10px rgba(0,0,0,0.2), inset 0 4px 10px rgba(255,255,255,0.35)',
                  border: '4px solid rgba(120, 53, 15, 0.4)',
                  opacity: 0.4,
                }}
              >
                <div className="flex items-center justify-center gap-2.5 text-amber-950">
                  <Play className="w-6 h-6" fill="currentColor" strokeWidth={0} />
                  <div className="text-left">
                    <div style={{ fontSize: '18px', fontWeight: '700' }}>Jouer</div>
                    <div style={{ fontSize: '14px', opacity: 0.8 }}>Mode histoire</div>
                  </div>
                </div>
              </button>
            </div>

            {/* Options seul en dessous */}
            <MenuButton
              onClick={onShowOptions}
              icon={<Settings className="w-6 h-6" fill="currentColor" strokeWidth={0} />}
              title="Options"
              fullWidth
            />
          </div>


        </div>
      </div>
    </div>
  );
}

import { Play, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';

interface MainMenuProps {
  onStartGame: () => void;
  onStartStoryMode: () => void;
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

export function MainMenu({ onStartGame, onStartStoryMode, onShowOptions, timeOfDay = 'day', onToggleTimeOfDay }: MainMenuProps) {
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
        <div className="text-center w-full max-w-md py-4 relative">
          {/* Titre "Rush" avec abeille à gauche */}
          <div className="mb-6">
            <div className="flex items-center justify-center gap-3 mb-2">
              {/* Abeille/Luciole à gauche */}
              {timeOfDay === 'night' ? (
                <div className="relative">
                  <div className="absolute inset-0 blur-xl bg-green-400 opacity-50 rounded-full" />
                  <span className="relative text-4xl">✨</span>
                </div>
              ) : (
                <span className="text-4xl">🐝</span>
              )}
              
              {/* Titre Rush */}
              <h1 
                className="select-none"
                style={{
                  fontFamily: 'cursive',
                  fontSize: 'clamp(48px, 12vw, 80px)',
                  fontWeight: '900',
                  backgroundImage: timeOfDay === 'night' 
                    ? 'linear-gradient(180deg, #7FFF00 0%, #6FEE00 40%, #5FDD00 70%, #4FCC00 100%)'
                    : 'linear-gradient(180deg, #FDB022 0%, #F59E0B 40%, #D97706 70%, #B45309 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: timeOfDay === 'night' 
                    ? '0 8px 16px rgba(127, 255, 0, 0.6)'
                    : '0 8px 16px rgba(217, 119, 6, 0.6)',
                  filter: timeOfDay === 'night'
                    ? 'drop-shadow(0 4px 8px rgba(127, 255, 0, 0.4)) drop-shadow(0 0 40px rgba(127, 255, 0, 0.3))'
                    : 'drop-shadow(0 4px 8px rgba(217, 119, 6, 0.4)) drop-shadow(0 0 40px rgba(253, 176, 34, 0.3))',
                  letterSpacing: '0.05em',
                }}
              >
                {timeOfDay === 'night' ? 'Rushzzz..' : 'Rush'}
              </h1>
            </div>
            
            <p 
              className="italic text-white px-4"
              style={{ 
                fontSize: 'clamp(16px, 4vw, 19px)',
                textShadow: '0 2px 6px rgba(0,0,0,0.9)',
                fontWeight: '700'
              }}
            >
              Conquérez la forêt avec vos {timeOfDay === 'night' ? 'lucioles' : 'abeilles'} !
            </p>
          </div>

          {/* Menu buttons */}
          <div className="space-y-4 pb-20">
            {/* Mode Histoire */}
            <MenuButton
              onClick={onStartStoryMode}
              icon={<Play className="w-6 h-6" fill="currentColor" strokeWidth={0} />}
              title="Jouer"
              subtitle="Mode histoire"
              fullWidth
            />

            {/* Partie Rapide et Options côte à côte */}
            <div className="flex gap-2.5">
              <MenuButton
                onClick={onStartGame}
                icon={<Play className="w-6 h-6" fill="currentColor" strokeWidth={0} />}
                title="Jouer"
                subtitle="Partie rapide"
              />

              <MenuButton
                onClick={onShowOptions}
                icon={<Settings className="w-6 h-6" fill="currentColor" strokeWidth={0} />}
                title="Options"
              />
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}

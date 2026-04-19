import { Pause, Play, RotateCcw, Info, X, Volume2, VolumeX, Sun, Moon, Hand, Home } from 'lucide-react';
import { useState, useCallback } from 'react';

interface GameUIProps {
  isPlaying: boolean;
  onPause: () => void;
  onRestart: () => void;
  onHome?: () => void;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  timeOfDay?: 'day' | 'night';
  onToggleTimeOfDay?: () => void;
  leftHanded?: boolean;
  onToggleLeftHanded?: () => void;
  onDragStart?: (e: React.PointerEvent) => void;
  isDragging?: boolean;
  hasSelection?: boolean;
  isTutorial?: boolean;
}

// Composant SettingToggle extrait pour éviter les problèmes de re-render
function SettingToggle({ 
  icon, 
  label, 
  enabled, 
  onToggle, 
  enabledColors = { bg: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' },
  disabledColors = { bg: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)' }
}: {
  icon: React.ReactNode;
  label: string;
  enabled: boolean;
  onToggle: () => void;
  enabledColors?: { bg: string };
  disabledColors?: { bg: string };
}) {
  return (
    <div 
      className="flex items-center justify-between px-3 py-2 rounded-2xl"
      style={{
        background: 'rgba(255, 255, 255, 0.25)',
        backdropFilter: 'blur(4px)',
        border: '2px solid rgba(120, 53, 15, 0.2)',
      }}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-amber-950" style={{ fontSize: '16px', fontWeight: '700' }}>
          {label}
        </span>
      </div>
      <button
        onClick={onToggle}
        className="relative w-11 h-6 rounded-full transition-all flex-shrink-0"
        style={{
          background: enabled ? enabledColors.bg : disabledColors.bg,
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
        }}
      >
        <div 
          className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all"
          style={{
            left: enabled ? 'calc(100% - 22px)' : '2px',
          }}
        />
      </button>
    </div>
  );
}

// Composant pour un bouton stylisé avec reflet - adaptatif mobile
function StyledButton({ onClick, title, icon, className = '', onDragStart, isDragging, hasSelection }: { 
  onClick: () => void; 
  title: string; 
  icon: React.ReactNode; 
  className?: string;
  onDragStart?: (e: React.PointerEvent) => void;
  isDragging?: boolean;
  hasSelection?: boolean;
}) {
  // Taille très réduite pour laisser plus d'espace à la carte de jeu
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const size = isMobile ? 'w-10 h-10' : 'w-14 h-14'; // 40px mobile, 56px desktop
  
  const handleClick = (e: React.MouseEvent) => {
    if (isDragging || hasSelection) return;
    onClick();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    onClick();
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    // Empêcher le cercle de sélection de commencer sur les boutons
    e.stopPropagation();
  };

  return (
    <div
      className={`relative ${size} rounded-full hover:scale-110 transition-transform ${className}`}
      title={title}
      style={{
        pointerEvents: 'none',
      }}
    >
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        style={{
          pointerEvents: 'auto',
          cursor: 'pointer',
        }}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onTouchEnd={handleTouchEnd}
      >
        {/* Fond blanc 5% opacité */}
        <circle cx="50" cy="50" r="48" fill="#fff" opacity="0.05" />
        
        {/* Bordure blanche */}
        <circle cx="50" cy="50" r="48" fill="none" stroke="#fff" strokeWidth="4" />
        
        {/* Reflet lumineux haut-gauche (comme sur les arbres) */}
        <ellipse cx="35" cy="30" rx="18" ry="15" fill="#fff" opacity="0.3" />
      </svg>
      
      {/* Icône par-dessus */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {icon}
      </div>
    </div>
  );
}

export function GameUI({ isPlaying, onPause, onRestart, onHome, soundEnabled = true, onToggleSound, timeOfDay = 'day', onToggleTimeOfDay, leftHanded = false, onToggleLeftHanded, onDragStart, isDragging = false, hasSelection = false, isTutorial = false }: GameUIProps) {
  const [showTutorial, setShowTutorial] = useState(false);
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  
  // Wording adapté selon le mode jour/nuit
  const isNightMode = timeOfDay === 'night';
  
  // Handlers pour les toggles avec vérification - mémorisés avec useCallback
  // Pas besoin de useCallback ici, les fonctions reçues sont déjà stables
  const beeWord = isNightMode ? 'luciole' : 'abeille';
  const beesWord = isNightMode ? 'lucioles' : 'abeilles';
  const hiveWord = isNightMode ? 'cocon' : 'ruche';
  const hivesWord = isNightMode ? 'cocons' : 'ruches';

  const handlePauseClick = () => {
    if (isPlaying) {
      // Mettre en pause et ouvrir le menu
      onPause();
      setShowPauseMenu(true);
    } else {
      // Reprendre directement
      onPause();
      setShowPauseMenu(false);
    }
  };

  const handleContinue = () => {
    setShowPauseMenu(false);
    onPause(); // Reprendre le jeu
  };

  const handleBackToMenu = () => {
    setShowPauseMenu(false);
    if (onHome) {
      onHome();
    }
  };

  const handleToggleTutorial = () => {
    const newShowTutorial = !showTutorial;
    setShowTutorial(newShowTutorial);
    
    // Mettre en pause quand on ouvre le tutoriel, reprendre quand on le ferme
    if (newShowTutorial && isPlaying) {
      onPause(); // Mettre en pause
    } else if (!newShowTutorial && !isPlaying) {
      onPause(); // Reprendre
    }
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const isLandscape = typeof window !== 'undefined' && window.innerWidth > window.innerHeight;
  const buttonSpacing = isMobile ? 'gap-3' : 'gap-3'; // Plus d'espacement entre les boutons
  const iconSize = isMobile ? 'w-5 h-5' : 'w-7 h-7'; // Icônes très réduites
  const positioning = isMobile ? 'top-2 left-2' : 'top-4 left-4';
  const positioningRight = isMobile ? 'top-2 right-2' : 'top-4 right-4';

  return (
    <>

      {/* Pause - Haut Droite */}
      <div className={`absolute ${positioningRight} z-20`} style={{ pointerEvents: 'none' }}>
        <StyledButton
          onClick={handlePauseClick}
          onDragStart={onDragStart}
          isDragging={isDragging}
          hasSelection={hasSelection}
          title={isPlaying ? 'Pause' : 'Reprendre'}
          icon={isPlaying ? <Pause className={`${iconSize} text-white`} strokeWidth={2.5} /> : <Play className={`${iconSize} text-white`} strokeWidth={2.5} />}
        />
      </div>

      {/* Menu Pause */}
      {showPauseMenu && (
        <div className="absolute inset-0 z-40 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
          {/* Fond hexagonal */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hexagons-pause" x="0" y="0" width="100" height="86.6" patternUnits="userSpaceOnUse">
                <polygon points="50,0 93.3,25 93.3,75 50,100 6.7,75 6.7,25" fill="none" stroke="#D97706" strokeWidth="3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hexagons-pause)" />
          </svg>
          
          <div 
            className={`relative rounded-3xl mx-4 overflow-y-auto ${
              isMobile && isLandscape
                ? 'p-3 max-w-[96vw] max-h-[94vh]' 
                : 'p-4 sm:p-6 md:p-8 max-w-[90vw] max-h-[90vh]'
            }`}
            style={{
              background: 'linear-gradient(135deg, #FDB022 0%, #F59E0B 50%, #D97706 100%)',
              boxShadow: '0 12px 32px rgba(217, 119, 6, 0.5), inset 0 -4px 12px rgba(0,0,0,0.2), inset 0 4px 12px rgba(255,255,255,0.35)',
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
            
            <div className="relative">
              {isMobile && isLandscape ? (
                // Mode Paysage : disposition horizontale compacte
                <div className="flex items-center gap-4">
                  {/* Colonne gauche : Titre + Paramètres */}
                  <div className="flex-1 min-w-[250px]">
                    <h2 
                      className="mb-2 text-center select-none"
                      style={{ 
                        fontFamily: 'cursive',
                        fontSize: '1.4rem',
                        color: '#78350F',
                        textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        fontWeight: '900'
                      }}
                    >
                      Pause
                    </h2>
                    
                    {/* Paramètres */}
                    <div className="space-y-1.5">
                      {/* Son */}
                      <SettingToggle
                        icon={soundEnabled ? <Volume2 className="w-4 h-4 text-amber-950" strokeWidth={2.5} /> : <VolumeX className="w-4 h-4 text-amber-950" strokeWidth={2.5} />}
                        label="Son"
                        enabled={soundEnabled}
                        onToggle={onToggleSound || (() => {})}
                      />

                      {/* Jour/Nuit */}
                      <SettingToggle
                        icon={timeOfDay === 'day' ? <Sun className="w-4 h-4 text-amber-950" strokeWidth={2.5} /> : <Moon className="w-4 h-4 text-amber-950" strokeWidth={2.5} />}
                        label={timeOfDay === 'day' ? 'Jour' : 'Nuit'}
                        enabled={timeOfDay === 'night'}
                        onToggle={onToggleTimeOfDay || (() => {})}
                        enabledColors={{ bg: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)' }}
                        disabledColors={{ bg: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)' }}
                      />

                      {/* Gaucher/Droitier */}
                      <SettingToggle
                        icon={<Hand className="w-4 h-4 text-amber-950" strokeWidth={2.5} />}
                        label="Sélection inversée"
                        enabled={leftHanded}
                        onToggle={onToggleLeftHanded || (() => {})}
                      />
                    </div>
                  </div>

                  {/* Colonne droite : Boutons d'action */}
                  <div className="flex flex-col gap-2 min-w-[150px]">
                    {onHome && (
                      <button
                        onClick={handleBackToMenu}
                        style={{
                          padding: '14px 24px', borderRadius: '16px',
                          background: 'linear-gradient(135deg, #FDB022 0%, #F59E0B 50%, #D97706 100%)',
                          boxShadow: '0 8px 16px rgba(217,119,6,0.4), inset 0 -3px 8px rgba(0,0,0,0.2), inset 0 3px 8px rgba(255,255,255,0.3)',
                          border: '3px solid rgba(120,53,15,0.4)',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                          fontSize: '16px', fontWeight: '700', color: '#78350f', cursor: 'pointer',
                          outline: 'none', minHeight: '52px', touchAction: 'manipulation',
                          userSelect: 'none', WebkitTapHighlightColor: 'transparent',
                        }}
                      >
                        <Home style={{ width: '20px', height: '20px', flexShrink: 0 }} strokeWidth={2.5} />
                        <span>Accueil</span>
                      </button>
                    )}

                    <button
                      onClick={() => { setShowPauseMenu(false); onRestart(); }}
                      style={{
                        padding: '14px 24px', borderRadius: '16px',
                        background: 'linear-gradient(135deg, #FDB022 0%, #F59E0B 50%, #D97706 100%)',
                        boxShadow: '0 8px 16px rgba(217,119,6,0.4), inset 0 -3px 8px rgba(0,0,0,0.2), inset 0 3px 8px rgba(255,255,255,0.3)',
                        border: '3px solid rgba(120,53,15,0.4)',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        fontSize: '16px', fontWeight: '700', color: '#78350f', cursor: 'pointer',
                        outline: 'none', minHeight: '52px', touchAction: 'manipulation',
                        userSelect: 'none', WebkitTapHighlightColor: 'transparent',
                      }}
                    >
                      <RotateCcw style={{ width: '20px', height: '20px', flexShrink: 0 }} strokeWidth={2.5} />
                      <span>Recommencer</span>
                    </button>

                    <button
                      onClick={handleContinue}
                      style={{
                        padding: '14px 24px', borderRadius: '16px',
                        background: 'linear-gradient(135deg, #FDB022 0%, #F59E0B 50%, #D97706 100%)',
                        boxShadow: '0 8px 16px rgba(217,119,6,0.4), inset 0 -3px 8px rgba(0,0,0,0.2), inset 0 3px 8px rgba(255,255,255,0.3)',
                        border: '3px solid rgba(120,53,15,0.4)',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        fontSize: '16px', fontWeight: '700', color: '#78350f', cursor: 'pointer',
                        outline: 'none', minHeight: '52px', touchAction: 'manipulation',
                        userSelect: 'none', WebkitTapHighlightColor: 'transparent',
                      }}
                    >
                      <Play style={{ width: '20px', height: '20px', flexShrink: 0 }} fill="#78350f" strokeWidth={0} />
                      <span>Continuer</span>
                    </button>
                  </div>
                </div>
              ) : (
                // Mode Portrait : disposition verticale
                <>
                  <h2 
                    className="mb-3 text-center select-none"
                    style={{ 
                      fontFamily: 'cursive',
                      fontSize: 'clamp(1.5rem, 5vw, 2rem)',
                      color: '#78350F',
                      textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      fontWeight: '900'
                    }}
                  >
                    Pause
                  </h2>
                  
                  {/* Paramètres */}
                  <div className="mb-4 space-y-2.5 w-full sm:min-w-[340px]">
                    {/* Son */}
                    <SettingToggle
                      icon={soundEnabled ? <Volume2 className="w-5 h-5 text-amber-950" strokeWidth={2.5} /> : <VolumeX className="w-5 h-5 text-amber-950" strokeWidth={2.5} />}
                      label="Son"
                      enabled={soundEnabled}
                      onToggle={onToggleSound || (() => {})}
                    />

                    {/* Jour/Nuit */}
                    <SettingToggle
                      icon={timeOfDay === 'day' ? <Sun className="w-5 h-5 text-amber-950" strokeWidth={2.5} /> : <Moon className="w-5 h-5 text-amber-950" strokeWidth={2.5} />}
                      label={timeOfDay === 'day' ? 'Jour' : 'Nuit'}
                      enabled={timeOfDay === 'night'}
                      onToggle={onToggleTimeOfDay || (() => {})}
                      enabledColors={{ bg: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)' }}
                      disabledColors={{ bg: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)' }}
                    />

                    {/* Gaucher/Droitier */}
                    <SettingToggle
                      icon={<Hand className="w-5 h-5 text-amber-950" strokeWidth={2.5} />}
                      label="Sélection inversée"
                      enabled={leftHanded}
                      onToggle={onToggleLeftHanded || (() => {})}
                    />
                  </div>
                  
                  {/* Boutons côte à côte */}
                  <div className="flex gap-2.5" style={{ marginTop: '6px' }}>
                    {onHome && (
                      <button
                        onClick={handleBackToMenu}
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
                        <Home style={{ width: '20px', height: '20px', flexShrink: 0 }} strokeWidth={2.5} />
                        <span>Accueil</span>
                      </button>
                    )}

                    <button
                      onClick={() => { setShowPauseMenu(false); onRestart(); }}
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
                      <RotateCcw style={{ width: '20px', height: '20px', flexShrink: 0 }} strokeWidth={2.5} />
                      <span>Recommencer</span>
                    </button>

                    <button
                      onClick={handleContinue}
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
                      <Play style={{ width: '20px', height: '20px', flexShrink: 0 }} fill="#78350f" strokeWidth={0} />
                      <span>Continuer</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tutorial Panel */}
      {showTutorial && (
        <div className={`absolute z-30 max-w-md ${isMobile ? 'top-1 right-1 left-1' : 'top-4 right-4'}`}>
          <div 
            className={`relative rounded-3xl ${isMobile ? 'p-4' : 'p-6'}`}
            style={{
              background: 'linear-gradient(135deg, #FDB022 0%, #F59E0B 50%, #D97706 100%)',
              boxShadow: '0 10px 24px rgba(217, 119, 6, 0.5), inset 0 -4px 10px rgba(0,0,0,0.2), inset 0 4px 10px rgba(255,255,255,0.35)',
              border: '4px solid rgba(120, 53, 15, 0.4)',
            }}
          >
            {/* Texture cire */}
            <div 
              className="absolute inset-0 opacity-15 pointer-events-none rounded-3xl"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 20% 20%, rgba(255,255,255,0.5) 0%, transparent 50%),
                  radial-gradient(circle at 80% 80%, rgba(0,0,0,0.2) 0%, transparent 50%)
                `
              }}
            />
            
            <div className="relative">
              <div className="flex items-start justify-between mb-5">
                <h2 
                  className="text-2xl select-none flex items-center gap-2 text-amber-950"
                  style={{ 
                    fontFamily: 'cursive',
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    fontWeight: '800'
                  }}
                >
                  Comment Jouer
                </h2>
                <button
                  onClick={handleToggleTutorial}
                  className="hover:scale-110 transition-transform text-amber-950"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {/* Sélection */}
                <div className="p-3 rounded-xl" style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.25)', 
                  backdropFilter: 'blur(2px)'
                }}>
                  <h3 className="mb-2 text-amber-950" style={{ fontSize: '16px', fontWeight: '700' }}>Sélectionner des {beesWord.charAt(0).toUpperCase() + beesWord.slice(1)}</h3>
                  <ul className="space-y-1.5 text-amber-950" style={{ fontSize: '15px', lineHeight: '1.5' }}>
                    <li>• <strong>Clic sur arbre allié</strong> : Sélectionne toutes les {beesWord}</li>
                    <li>• <strong>Clic-glisser (cercle)</strong> : Sélection multiple libre</li>
                  </ul>
                </div>

                {/* Mouvement */}
                <div className="p-3 rounded-xl" style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.25)', 
                  backdropFilter: 'blur(2px)'
                }}>
                  <h3 className="mb-2 text-amber-950" style={{ fontSize: '16px', fontWeight: '700' }}>Envoyer des {beesWord.charAt(0).toUpperCase() + beesWord.slice(1)}</h3>
                  <ul className="space-y-1.5 text-amber-950" style={{ fontSize: '15px', lineHeight: '1.5' }}>
                    <li>• <strong>Simple clic sur arbre</strong> : Envoie la sélection</li>
                    <li>• Arbre <strong>neutre/allié</strong> : Gravitation autour</li>
                    <li>• Arbre <strong>ennemi</strong> : Combat automatique ⚔️</li>
                  </ul>
                </div>

                {/* Construction */}
                <div className="p-3 rounded-xl" style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.25)', 
                  backdropFilter: 'blur(2px)'
                }}>
                  <h3 className="mb-2 text-amber-950" style={{ fontSize: '16px', fontWeight: '700' }}>Construire/Réparer</h3>
                  <ul className="space-y-1.5 text-amber-950" style={{ fontSize: '15px', lineHeight: '1.5' }}>
                    <li>• <strong>Double-clic sur arbre allié/neutre</strong></li>
                    <li>• Avec {beesWord} autour → Construction/Réparation</li>
                    <li>• {hiveWord.charAt(0).toUpperCase() + hiveWord.slice(1)} niveau 1 : <strong>5 {beesWord}</strong></li>
                    <li>• Amélioration L2 : <strong>20 {beesWord}</strong></li>
                  </ul>
                </div>

                {/* Étangs */}
                <div className="p-3 rounded-xl" style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.25)', 
                  backdropFilter: 'blur(2px)'
                }}>
                  <h3 className="mb-2 text-amber-950" style={{ fontSize: '16px', fontWeight: '700' }}>Attention aux Étangs !</h3>
                  <ul className="space-y-1.5 text-amber-950" style={{ fontSize: '15px', lineHeight: '1.5' }}>
                    <li>• <strong>1 {beeWord} sur 3</strong> tombe dans l'eau (33%)</li>
                    <li>• Zones bleues = danger mortel 🌊</li>
                    <li>• <strong>Conseil</strong> : Contournez-les !</li>
                  </ul>
                </div>

                {/* Objectif */}
                <div className="p-3 rounded-xl" style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.25)', 
                  backdropFilter: 'blur(2px)'
                }}>
                  <h3 className="mb-2 text-amber-950" style={{ fontSize: '16px', fontWeight: '700' }}>Objectif</h3>
                  <p className="text-amber-950" style={{ fontSize: '15px', lineHeight: '1.5' }}>
                    Détruire <strong>tous les {hivesWord} {isNightMode ? 'ennemis' : 'ennemies'}</strong> ({isNightMode ? 'bleus' : 'rouges'}) !
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

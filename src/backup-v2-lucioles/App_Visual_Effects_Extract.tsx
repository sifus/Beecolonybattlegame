// Extraits du composant App.tsx - Effets visuels adaptés au mode nuit

// 1. CERCLE DE SÉLECTION ANIMATION (lignes ~2246-2258)
        {/* Selection circle animation */}
        {selectionCircle && (
          <motion.circle
            cx={selectionCircle.x}
            cy={selectionCircle.y}
            r={selectionCircle.radius}
            fill="none"
            stroke={globalTimeOfDay === 'night' ? '#7FFF00' : '#FDD835'}
            strokeWidth={4}
            initial={{ opacity: 0.8, scale: 0.8 }}
            animate={{ opacity: 0, scale: 1.3 }}
            transition={{ duration: 0.5 }}
          />
        )}

// 2. FLASH EFFECT (lignes ~2260-2271)
        {/* Flash effect on tree click */}
        {flashEffect && (
          <motion.circle
            cx={flashEffect.x}
            cy={flashEffect.y}
            r={flashEffect.type === 'large' ? 80 : 50}
            fill={globalTimeOfDay === 'night' ? '#7FFF00' : '#FFEB3B'}
            initial={{ opacity: 0.9, scale: 0.5 }}
            animate={{ opacity: 0, scale: 2 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        )}

// 3. HALO EFFECTS (lignes ~2274-2316)
        {/* Halo effects when hive is completed */}
        {gameState.haloEffects?.map((halo, idx) => {
          const tree = gameState.trees.find(t => t.id === halo.treeId);
          if (!tree) return null;
          
          const isNight = globalTimeOfDay === 'night';
          
          return (
            <g key={`halo-${halo.treeId}-${halo.timestamp}`}>
              {/* Multiple expanding halos */}
              <motion.circle
                cx={tree.x}
                cy={tree.y}
                r={60}
                fill="none"
                stroke={isNight ? '#7FFF00' : '#FDD835'}
                strokeWidth={3}
                initial={{ opacity: 0.8, scale: 0.5 }}
                animate={{ opacity: 0, scale: 2.5 }}
                transition={{ duration: 2, ease: 'easeOut' }}
              />
              <motion.circle
                cx={tree.x}
                cy={tree.y}
                r={60}
                fill="none"
                stroke={isNight ? '#9FFF00' : '#FFEB3B'}
                strokeWidth={2}
                initial={{ opacity: 0.6, scale: 0.6 }}
                animate={{ opacity: 0, scale: 2.8 }}
                transition={{ duration: 2, ease: 'easeOut', delay: 0.2 }}
              />
              <motion.circle
                cx={tree.x}
                cy={tree.y}
                r={60}
                fill="none"
                stroke={isNight ? '#CCFF99' : '#FFF9C4'}
                strokeWidth={1}
                initial={{ opacity: 0.4, scale: 0.7 }}
                animate={{ opacity: 0, scale: 3 }}
                transition={{ duration: 2, ease: 'easeOut', delay: 0.4 }}
              />
            </g>
          );
        })}

// 4. CERCLE DE SÉLECTION INTERACTIF (lignes ~2328-2355)
        {selectionStart && selectionCurrent && (() => {
          const diameter = Math.sqrt(
            Math.pow(selectionCurrent.x - selectionStart.x, 2) +
              Math.pow(selectionCurrent.y - selectionStart.y, 2)
          );
          const centerX = (selectionStart.x + selectionCurrent.x) / 2;
          const centerY = (selectionStart.y + selectionCurrent.y) / 2;
          const radius = diameter / 2;
          
          const isNight = globalTimeOfDay === 'night';
          
          return (
            <>
              {/* Glow effect for selection circle */}
              <circle
                cx={centerX}
                cy={centerY}
                r={radius}
                fill={isNight ? 'rgba(127, 255, 0, 0.08)' : 'rgba(255, 235, 59, 0.08)'}
                stroke={isNight ? '#7FFF00' : '#FFEB3B'}
                strokeWidth={4}
                opacity={0.95}
                strokeDasharray="10 5"
                style={{ filter: isNight ? 'drop-shadow(0 0 8px rgba(127, 255, 0, 0.8))' : 'drop-shadow(0 0 8px rgba(255, 235, 59, 0.8))' }}
              />
              {/* Diameter line */}
              <line
                x1={selectionStart.x}
                y1={selectionStart.y}
                x2={selectionCurrent.x}
                y2={selectionCurrent.y}
                stroke={isNight ? '#7FFF00' : '#FFEB3B'}
                strokeWidth={2}
                opacity={0.7}
                strokeDasharray="5 5"
              />
            </>
          );
        })()}

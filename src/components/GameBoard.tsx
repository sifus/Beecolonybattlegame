import React from 'react';
import { motion } from 'motion/react';
import { Tree } from './Tree';
import { Bee } from './Bee';
import { GameState } from '../types/game';
import { Sparkle } from '../hooks/useSolarSystem';
import { PondShape } from '../utils/mapGenerator';

interface GridParams {
  cols: number;
  rows: number;
  cellSize: number;
  gridWidth?: number;
  gridHeight?: number;
  marginLeft?: number;
  marginTop?: number;
}

interface MapData {
  ponds: PondShape[];
  grassGrid: Array<{ x: number; y: number; color: string; borderOpacity: number; borderOffset: number }>;
}

interface GameBoardProps {
  gameState: GameState;
  gridParams: GridParams;
  mapData: MapData;
  sunIntensity: number;
  sunPosition: { x: number; y: number };
  sparkles: Sparkle[];
  globalTimeOfDay: 'day' | 'night';
  selectionCircle: { x: number; y: number; radius: number } | null;
  selectionStart: { x: number; y: number } | null;
  selectionCurrent: { x: number; y: number } | null;
  flashEffect: { x: number; y: number; type: 'small' | 'large' } | null;
  waterSplashes: Array<{ x: number; y: number; id: string; timestamp: number }>;
  svgRef: React.RefObject<SVGSVGElement>;
  onMouseDown: (e: React.MouseEvent<SVGSVGElement>) => void;
  onMouseMove: (e: React.MouseEvent<SVGSVGElement>) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
  onTouchStart: (e: React.TouchEvent<SVGSVGElement>) => void;
  onTouchMove: (e: React.TouchEvent<SVGSVGElement>) => void;
  onTouchEnd: () => void;
  onTouchCancel: () => void;
  onTreeClick: (treeId: string, e: React.MouseEvent | React.PointerEvent) => void;
  onTreeDragStart: (e: React.PointerEvent) => void;
}

function organicPondPath(x: number, y: number, w: number, h: number, seed: number): string {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const rx = (w / 2) * 0.90;
  const ry = (h / 2) * 0.80;
  const kx = 0.5523 * rx;
  const ky = 0.5523 * ry;

  // Légère déformation organique seeded
  const d = (n: number) => Math.sin(seed * n * 1.618) * 0.09;

  const top    = { x: cx + d(1) * rx,       y: cy - ry + d(2) * ry };
  const right  = { x: cx + rx + d(3) * rx,  y: cy + d(4) * ry };
  const bottom = { x: cx + d(5) * rx,       y: cy + ry + d(6) * ry };
  const left   = { x: cx - rx + d(7) * rx,  y: cy + d(8) * ry };

  return [
    `M ${top.x} ${top.y}`,
    `C ${top.x + kx} ${top.y} ${right.x} ${right.y - ky} ${right.x} ${right.y}`,
    `C ${right.x} ${right.y + ky} ${bottom.x + kx} ${bottom.y} ${bottom.x} ${bottom.y}`,
    `C ${bottom.x - kx} ${bottom.y} ${left.x} ${left.y + ky} ${left.x} ${left.y}`,
    `C ${left.x} ${left.y - ky} ${top.x - kx} ${top.y} ${top.x} ${top.y}`,
    `Z`,
  ].join(' ');
}

export function GameBoard({
  gameState,
  gridParams,
  mapData,
  sunIntensity,
  sunPosition,
  sparkles,
  globalTimeOfDay,
  selectionCircle,
  selectionStart,
  selectionCurrent,
  flashEffect,
  waterSplashes,
  svgRef,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onTouchCancel,
  onTreeClick,
  onTreeDragStart,
}: GameBoardProps) {
  const gameWidth = gridParams.gridWidth || gridParams.cols * gridParams.cellSize;
  const gameHeight = gridParams.gridHeight || gridParams.rows * gridParams.cellSize;
  const marginLeft = gridParams.marginLeft || 0;
  const marginTop = gridParams.marginTop || 0;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        overflow: 'hidden',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        outline: 'none',
        border: 'none',
      }}
    >
      {/* Background SVG - Grass patchwork and ponds */}
      <svg
        className="absolute"
        style={{
          zIndex: 0,
          left: `${marginLeft}px`,
          top: `${marginTop}px`,
          width: `${gameWidth}px`,
          height: `${gameHeight}px`,
        }}
        viewBox={`0 0 ${gameWidth} ${gameHeight}`}
        preserveAspectRatio="none"
      >
        {/* Dégradé solaire + filtre glow étoiles */}
        <defs>
          <radialGradient id="sun-beam" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="rgba(255,255,180)" stopOpacity={0.55} />
            <stop offset="50%"  stopColor="rgba(255,255,180)" stopOpacity={0.2} />
            <stop offset="100%" stopColor="rgba(255,255,180)" stopOpacity={0} />
          </radialGradient>
          <filter id="sparkle-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grass patchwork pattern */}
        {mapData.grassGrid.map((grass, idx) => (
          <rect
            key={`grass-${idx}`}
            x={grass.x - 0.5}
            y={grass.y - 0.5}
            width={gridParams.cellSize + 1}
            height={gridParams.cellSize + 1}
            fill={grass.color}
            shapeRendering="crispEdges"
          />
        ))}

        {/* Lumière solaire mobile au-dessus du damier */}
        <g
          className="solar-cloud-layer"
          style={{
            transform: `translate(${(sunPosition.x / 100) * gameWidth}px, ${(sunPosition.y / 100) * gameHeight}px)`,
            transition: 'transform 3.5s ease-in-out',
          }}
        >
          <ellipse
            cx={0} cy={0}
            rx={160} ry={60}
            fill="url(#sun-beam)"
            transform="rotate(45, 0, 0)"
            opacity={sunIntensity}
            pointerEvents="none"
          />
        </g>

        {/* Étoiles scintillantes à 4 branches */}
        {sparkles.map(s => {
          if (s.opacity <= 0) return null;
          const h = s.size / 2;
          const t = s.size / 10;
          const d = `M 0,${-h} L ${t},${-t} L ${h},0 L ${t},${t} L 0,${h} L ${-t},${t} L ${-h},0 L ${-t},${-t} Z`;
          return (
            <g
              key={s.id}
              transform={`translate(${s.x}, ${s.y})`}
              opacity={sunIntensity < 0.3 ? 0 : s.opacity * Math.min((sunIntensity - 0.3) / 0.4, 1)}
              filter="url(#sparkle-glow)"
              pointerEvents="none"
            >
              <path d={d} fill="rgba(255,255,230,0.9)" />
            </g>
          );
        })}

        {/* Night overlay - voile sombre avec lumière de lune bleutée */}
        {globalTimeOfDay === 'night' && (
          <>
            {/* Voile sombre */}
            <rect
              x={0}
              y={0}
              width={gameWidth}
              height={gameHeight}
              fill="#0a0e27"
              opacity={0.65}
              pointerEvents="none"
            />

            {/* Gradient de lumière de lune depuis le haut-droit */}
            <defs>
              <radialGradient id="moonlight" cx="85%" cy="15%" r="70%">
                <stop offset="0%" stopColor="#a8c5dd" stopOpacity={0.15} />
                <stop offset="40%" stopColor="#6b8ba3" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#1a2332" stopOpacity={0} />
              </radialGradient>
            </defs>
            <rect
              x={0}
              y={0}
              width={gameWidth}
              height={gameHeight}
              fill="url(#moonlight)"
              pointerEvents="none"
            />
          </>
        )}

        {/* Ponds — forme organique + ripples */}
        {mapData.ponds.map((pond, idx) => {
          const pondW = pond.width * gridParams.cellSize;
          const pondH = pond.height * gridParams.cellSize;
          const cx = pond.x + pondW / 2;
          const cy = pond.y + pondH / 2;
          const seed = pond.x * 3 + pond.y * 7;
          const path = organicPondPath(pond.x, pond.y, pondW, pondH, seed);
          const isNight = globalTimeOfDay === 'night';
          const waterColor = isNight ? 'rgb(20, 60, 100)' : 'rgb(55, 173, 238)';
          const clipId = `pond-clip-${idx}`;
          const rippleColor = isNight ? 'rgba(100, 180, 230, 0.35)' : 'rgba(255, 255, 255, 0.3)';
          const rippleRBase = Math.min(pondW, pondH) * 0.18;

          return (
            <g key={`pond-${idx}`}>
              <defs>
                <clipPath id={clipId}>
                  <path d={path} />
                </clipPath>
              </defs>

              {/* Forme organique de base */}
              <path d={path} fill={waterColor} />

              {/* Effets clippés à l'intérieur du blob */}
              <g clipPath={`url(#${clipId})`} pointerEvents="none">
                {/* Ripples concentriques animées */}
                {[0, 1, 2].map((i) => (
                  <motion.circle
                    key={i}
                    cx={cx + (i - 1) * pondW * 0.22}
                    cy={cy + pondH * 0.05}
                    r={rippleRBase}
                    stroke={rippleColor}
                    fill="none"
                    strokeWidth={1.2}
                    initial={{ scale: 0.6, opacity: 0.6 }}
                    animate={{ scale: 2.8, opacity: 0 }}
                    transition={{
                      duration: 3.2,
                      repeat: Infinity,
                      delay: idx * 0.7 + i * 1.1,
                      ease: 'easeOut',
                    }}
                  />
                ))}

                {/* Reflet lumineux */}
                <ellipse
                  cx={isNight ? cx + pondW * 0.28 : cx - pondW * 0.18}
                  cy={pond.y + pondH * 0.28}
                  rx={pondW * 0.18}
                  ry={pondH * 0.13}
                  fill={isNight ? '#a8c5dd' : '#fff'}
                  opacity={isNight ? 0.2 : 0.38}
                />
              </g>

              {/* Contour organique — rebord sombre */}
              <path
                d={path}
                fill="none"
                stroke="#000"
                strokeWidth={2.5}
                opacity={isNight ? 0.35 : 0.15}
                pointerEvents="none"
              />
            </g>
          );
        })}
      </svg>

      {/* Game SVG - Interactive layer */}
      <svg
        ref={svgRef}
        className="absolute"
        style={{
          zIndex: 10,
          left: `${marginLeft}px`,
          top: `${marginTop}px`,
          width: `${gameWidth}px`,
          height: `${gameHeight}px`,
        }}
        viewBox={`0 0 ${gameWidth} ${gameHeight}`}
        preserveAspectRatio="none"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchCancel}
      >
        {/* Trees - BASE LAYER (trunks and foliage) */}
        {gameState.trees.map((tree) => {
          const playerBeesAtTree = gameState.bees.filter(
            b => b.treeId === tree.id && b.owner === 'player' && b.state === 'idle'
          ).length;

          return (
            <Tree
              key={`${tree.id}-base`}
              tree={tree}
              onClick={(e) => onTreeClick(tree.id, e)}
              onDragStart={onTreeDragStart}
              playerBeesCount={playerBeesAtTree}
              cellSize={gridParams.cellSize}
              renderLayer="base"
              isNightMode={globalTimeOfDay === 'night'}
            />
          );
        })}

        {/* Lumberjacks - DÉSACTIVÉ TEMPORAIREMENT */}
        {/* {gameState.lumberjackGameplayEnabled && gameState.lumberjacks?.map((lumberjack) => (
          <Lumberjack
            key={lumberjack.id}
            lumberjack={lumberjack}
            cellSize={gridParams.cellSize}
            onClick={(e) => handleLumberjackClick(lumberjack.id, e)}
          />
        ))} */}

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

        {/* Halo effects when hive is completed */}
        {gameState.haloEffects?.map((halo) => {
          const tree = gameState.trees.find(t => t.id === halo.treeId);
          if (!tree) return null;

          const isNight = globalTimeOfDay === 'night';

          return (
            <g key={`halo-${halo.treeId}-${halo.timestamp}`}>
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

        {/* Selection circle (drawing) */}
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

        {/* Trees - TOP LAYER (hives, indicators, counters) */}
        {gameState.trees.map((tree) => {
          const playerBeesAtTree = gameState.bees.filter(
            b => b.treeId === tree.id && b.owner === 'player' && b.state === 'idle'
          ).length;

          return (
            <Tree
              key={`${tree.id}-top`}
              tree={tree}
              onClick={(e) => onTreeClick(tree.id, e)}
              onDragStart={onTreeDragStart}
              playerBeesCount={playerBeesAtTree}
              cellSize={gridParams.cellSize}
              renderLayer="top"
              isNightMode={globalTimeOfDay === 'night'}
            />
          );
        })}

        {/* Water splashes - when bees fall in ponds */}
        {waterSplashes.map((splash) => {
          const age = Date.now() - splash.timestamp;
          const opacity = Math.max(0, 1 - age / 800);
          const scale = 1 + (age / 800) * 0.5;

          return (
            <g key={splash.id} opacity={opacity}>
              <circle
                cx={splash.x}
                cy={splash.y}
                r={6 * scale}
                fill="none"
                stroke="#4A90E2"
                strokeWidth={2}
                opacity={0.8}
              />
              <circle
                cx={splash.x}
                cy={splash.y}
                r={10 * scale}
                fill="none"
                stroke="#6CB4EE"
                strokeWidth={1.5}
                opacity={0.5}
              />
              <circle
                cx={splash.x}
                cy={splash.y}
                r={3}
                fill="#4A90E2"
                opacity={1}
              />
            </g>
          );
        })}

        {/* Bees - rendered last to be on top of everything */}
        {gameState.bees.map((bee) => (
          <Bee
            key={bee.id}
            bee={bee}
            isSelected={gameState.selectedBeeIds.has(bee.id)}
            isNightMode={globalTimeOfDay === 'night'}
          />
        ))}
      </svg>
    </div>
  );
}

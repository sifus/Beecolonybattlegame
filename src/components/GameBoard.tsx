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
  gameStartCol?: number;
  gameEndCol?: number;
  gameStartRow?: number;
  gameEndRow?: number;
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
  sparkleIntensity: number;
  lateralOffset: number;
  sparkles: Sparkle[];
  globalTimeOfDay: 'day' | 'night';
  selectionCircle: { x: number; y: number; radius: number } | null;
  selectionStart: { x: number; y: number } | null;
  selectionCurrent: { x: number; y: number } | null;
  leftHanded?: boolean;
  flashEffect: { x: number; y: number; type: 'small' | 'large' } | null;
  waterSplashes: Array<{ x: number; y: number; id: string; timestamp: number; pondIdx: number }>;
  dyingBees: Array<{ id: string; x: number; y: number; timestamp: number; owner: string }>;
  ripples: { id: number; x: number; y: number }[];
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

function organicPondPath(x: number, y: number, w: number, h: number, seed: number, rxOverride?: number, ryOverride?: number): string {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const rx = rxOverride ?? (w / 2) * 0.90;
  const ry = ryOverride ?? (h / 2) * 0.80;
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
  sparkleIntensity,
  lateralOffset,
  sparkles,
  globalTimeOfDay,
  selectionCircle,
  selectionStart,
  selectionCurrent,
  leftHanded = false,
  flashEffect,
  waterSplashes,
  dyingBees,
  ripples,
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

  const cellSize = gridParams.cellSize;
  const screenW = window.innerWidth;
  const screenH = window.innerHeight;

  // Cases de bordure : remplir les marges avec le même damier
  const extraLeft  = Math.ceil(marginLeft / cellSize) + 1;
  const extraTop   = Math.ceil(marginTop / cellSize) + 1;
  const extraRight = Math.ceil((screenW - marginLeft - gameWidth) / cellSize) + 1;
  const extraBottom = Math.ceil((screenH - marginTop - gameHeight) / cellSize) + 1;

  const BORDER_COLORS_DAY   = ['#DADC57','#CAD551','#D9D255','#CDC950','#CFCF51','#D1DA56'];
  const BORDER_COLORS_NIGHT = ['#122030','#142234','#16263a','#1a2c40','#1c2e42','#1e3044'];
  const BORDER_COLORS = globalTimeOfDay === 'night' ? BORDER_COLORS_NIGHT : BORDER_COLORS_DAY;
  const GRASS_NIGHT   = ['#122030','#142234','#16263a','#1a2c40','#1c2e42','#1e3044'];

  // Coloration greedy row-major : aucune couleur identique côte à côte ou coin à coin,
  // sans pattern visible (seed déterministe par position)
  const greedyColor = (row: number, col: number, colorMap: Map<string, string>, palette: string[]): string => {
    const used = new Set<string>();
    for (const [dr, dc] of [[-1,-1],[-1,0],[-1,1],[0,-1]] as const) {
      const c = colorMap.get(`${row+dr},${col+dc}`);
      if (c) used.add(c);
    }
    const available = palette.filter(c => !used.has(c));
    const pool = available.length > 0 ? available : palette;
    const seed = Math.abs((row * 31337 + col * 7919)) % pool.length;
    return pool[seed];
  };

  // Bordures
  const borderColorMap = new Map<string, string>();
  const borderCells: { x: number; y: number; color: string }[] = [];
  for (let row = -extraTop; row < gridParams.rows + extraBottom; row++) {
    for (let col = -extraLeft; col < gridParams.cols + extraRight; col++) {
      if (row >= 0 && row < gridParams.rows && col >= 0 && col < gridParams.cols) continue;
      const color = greedyColor(row, col, borderColorMap, BORDER_COLORS);
      borderColorMap.set(`${row},${col}`, color);
      borderCells.push({ x: col * cellSize, y: row * cellSize, color });
    }
  }

  // Herbe nuit — même algorithme greedy sur la grille principale (grassGrid est en ordre row-major)
  const nightColorMap = new Map<string, string>();
  if (globalTimeOfDay === 'night') {
    for (const grass of mapData.grassGrid) {
      const c = Math.round(grass.x / cellSize);
      const r = Math.round(grass.y / cellSize);
      const color = greedyColor(r, c, nightColorMap, GRASS_NIGHT);
      nightColorMap.set(`${r},${c}`, color);
    }
  }

  // Calcul des abeilles en cours d'encerclement pendant le drag
  const beingSelectedIds = new Set<string>();
  if (selectionStart && selectionCurrent) {
    const dist = Math.sqrt(
      Math.pow(selectionCurrent.x - selectionStart.x, 2) +
      Math.pow(selectionCurrent.y - selectionStart.y, 2)
    );
    const centerX = leftHanded ? selectionStart.x : (selectionStart.x + selectionCurrent.x) / 2;
    const centerY = leftHanded ? selectionStart.y : (selectionStart.y + selectionCurrent.y) / 2;
    const radius = leftHanded ? dist : dist / 2;
    gameState.bees.forEach(b => {
      if (b.owner !== 'player') return;
      const dx = b.x - centerX;
      const dy = b.y - centerY;
      if (Math.sqrt(dx * dx + dy * dy) <= radius) beingSelectedIds.add(b.id);
    });
  }

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
          left: 0,
          top: 0,
          width: '100vw',
          height: '100vh',
        }}
      >
        <g transform={`translate(${marginLeft}, ${marginTop})`}>

        {/* Cases de bordure — damier étendu jusqu'aux bords de l'écran */}
        {borderCells.map((cell, idx) => (
          <rect
            key={`border-${idx}`}
            x={cell.x}
            y={cell.y}
            width={cellSize}
            height={cellSize}
            fill={cell.color}
            shapeRendering="crispEdges"
          />
        ))}

        {/* Grass patchwork pattern */}
        {mapData.grassGrid.map((grass, idx) => {
          const col = Math.round(grass.x / cellSize);
          const row = Math.round(grass.y / cellSize);
          const grassColor = globalTimeOfDay === 'night'
            ? (nightColorMap.get(`${row},${col}`) ?? GRASS_NIGHT[0])
            : grass.color;
          return (
          <g key={`grass-${idx}`}>
            <rect
              x={grass.x}
              y={grass.y}
              width={gridParams.cellSize}
              height={gridParams.cellSize}
              fill={grassColor}
              shapeRendering="crispEdges"
            />
          </g>
          );
        })}

        {/* Faisceau solaire directionnel + filtre glow étoiles */}
        <defs>
          <linearGradient id="beam-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#ffffaa" stopOpacity={0}/>
            <stop offset="20%"  stopColor="#ffffaa" stopOpacity={0}/>
            <stop offset="35%"  stopColor="#ffffcc" stopOpacity={0.10}/>
            <stop offset="44%"  stopColor="#ffffdd" stopOpacity={0.38}/>
            <stop offset="50%"  stopColor="#ffffee" stopOpacity={0.50}/>
            <stop offset="56%"  stopColor="#ffffdd" stopOpacity={0.38}/>
            <stop offset="65%"  stopColor="#ffffcc" stopOpacity={0.10}/>
            <stop offset="80%"  stopColor="#ffffaa" stopOpacity={0}/>
            <stop offset="100%" stopColor="#ffffaa" stopOpacity={0}/>
          </linearGradient>
          <filter id="sparkle-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {globalTimeOfDay !== 'night' && <>
          {(() => {
            const SQRT1_2 = Math.SQRT1_2;
            const diagLen = Math.sqrt(gameWidth * gameWidth + gameHeight * gameHeight);
            const beamX = gameWidth  / 2 - SQRT1_2 * lateralOffset;
            const beamY = gameHeight / 2 + SQRT1_2 * lateralOffset;
            const halfLen = diagLen * 0.6;
            return (
              <g transform={`translate(${beamX}, ${beamY}) rotate(45)`} opacity={sunIntensity * 0.9} pointerEvents="none">
                <rect x={-halfLen} y={-480} width={halfLen * 2} height={960} fill="url(#beam-grad)" />
              </g>
            );
          })()}
          {sparkles.map(s => {
            if (s.opacity <= 0) return null;
            const h = s.size / 2;
            const t = s.size / 10;
            const d = `M 0,${-h} L ${t},${-t} L ${h},0 L ${t},${t} L 0,${h} L ${-t},${t} L ${-h},0 L ${-t},${-t} Z`;
            return (
              <g
                key={s.id}
                transform={`translate(${s.x}, ${s.y})`}
                opacity={sparkleIntensity <= 0 ? 0 : s.opacity * sparkleIntensity}
                filter="url(#sparkle-glow)"
                pointerEvents="none"
              >
                <path d={d} fill="rgba(255,255,230,0.9)" />
              </g>
            );
          })}
        </>}

        {/* Night overlay - voile sombre */}
        {globalTimeOfDay === 'night' && (
          <>
            {/* Voile sombre — couvre tout l'écran */}
            <rect
              x={-marginLeft}
              y={-marginTop}
              width={screenW}
              height={screenH}
              fill="#0a0e27"
              opacity={0.65}
              pointerEvents="none"
            />

            {/* Lumière portée au sol par les lucioles — s'accumule où elles se regroupent */}
            <defs>
              <filter id="bee-ground-glow" x="-150%" y="-150%" width="400%" height="400%">
                <feGaussianBlur stdDeviation="20" />
              </filter>
            </defs>
            <g filter="url(#bee-ground-glow)" pointerEvents="none">
              {gameState.bees.map(bee => (
                <circle
                  key={`gnd-${bee.id}`}
                  cx={bee.x}
                  cy={bee.y + 6}
                  r={16}
                  fill={bee.owner === 'player' ? '#7FFF00' : '#00BFFF'}
                  opacity={0.10}
                />
              ))}
            </g>
          </>
        )}

        {/* Ponds — forme organique + ripples */}
        {mapData.ponds.map((pond, idx) => {
          const pondW = pond.width * gridParams.cellSize;
          const pondH = pond.height * gridParams.cellSize;
          const cx = pond.x + pondW / 2;
          const cy = pond.y + pondH / 2;
          const seed = pond.x * 3 + pond.y * 7;
          const path = pondW > gridParams.cellSize
            ? organicPondPath(
                pond.x + pondW * 0.075, pond.y + pondH * 0.075,
                pondW * 0.85, pondH * 0.85,
                seed, pondW * 0.42, pondH * 0.42
              )
            : organicPondPath(pond.x, pond.y, pondW, pondH, seed);
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

              {/* Reflet lumineux clippé à l'intérieur du blob */}
              <g clipPath={`url(#${clipId})`} pointerEvents="none">
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

        {/* Cailloux décoratifs — déterministes */}
        {(() => {
          const stoneColors = globalTimeOfDay === 'night'
            ? ['#203448', '#22364a', '#1e3246']
            : ['#c8cc3e', '#bec432', '#d2d644'];
          const cellSize = gridParams.cellSize;
          const trees = gameState.trees;
          const ponds = mapData.ponds;
          return Array.from({ length: 5 }, (_, i) => {
            let col = 0, row = 0;
            let attempt = 0;
            let valid = false;
            do {
              const s = i * 7919 + attempt * 1337;
              col = Math.floor((Math.sin(s) * 0.5 + 0.5) * gridParams.cols);
              row = Math.floor((Math.cos(s * 1.618) * 0.5 + 0.5) * gridParams.rows);
              attempt++;
              const onTree = !trees.every(t => Math.floor(t.x / cellSize) !== col || Math.floor(t.y / cellSize) !== row);
              const onPond = !ponds.every(p => {
                const pondCol = Math.floor(p.x / cellSize);
                const pondRow = Math.floor(p.y / cellSize);
                // marge d'1 case autour de l'étang
                return col < pondCol - 1 || col >= pondCol + p.width + 1 || row < pondRow - 1 || row >= pondRow + p.height + 1;
              });
              if (!onTree && !onPond) { valid = true; break; }
            } while (attempt < 40);
            if (!valid) return null;
            const jitter = (n: number) => (Math.sin(i * 7919 + n * 1337) * 0.5) * cellSize * 0.28;
            const cx = col * cellSize + cellSize * 0.5 + jitter(1);
            const cy = row * cellSize + cellSize * 0.7 + jitter(2);
            const color = stoneColors[i % stoneColors.length];
            return (
              <g key={`stone-${i}`} pointerEvents="none">
                {/* Ombre */}
                <ellipse cx={cx + 4} cy={cy + 3} rx={14} ry={6} fill="#000" opacity={0.22} />
                {i % 2 === 0 ? (
                  <>
                    {/* Groupe : grand + petit */}
                    <ellipse cx={cx} cy={cy} rx={13} ry={10} fill={color} />
                    <ellipse cx={cx - 10} cy={cy + 4} rx={8} ry={6} fill={color} opacity={0.85} />
                  </>
                ) : (
                  /* Caillou seul arrondi */
                  <ellipse cx={cx} cy={cy} rx={9} ry={8} fill={color} />
                )}
              </g>
            );
          });
        })()}
        </g>
      </svg>

      {/* Game SVG - Interactive layer */}
      <svg
        ref={svgRef}
        className="absolute"
        style={{
          zIndex: 10,
          left: 0,
          top: 0,
          width: '100vw',
          height: '100vh',
        }}
        viewBox={`0 0 ${screenW} ${screenH}`}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchCancel}
      >
        <g transform={`translate(${marginLeft}, ${marginTop})`}>
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
          const dist = Math.sqrt(
            Math.pow(selectionCurrent.x - selectionStart.x, 2) +
              Math.pow(selectionCurrent.y - selectionStart.y, 2)
          );
          const centerX = leftHanded ? selectionStart.x : (selectionStart.x + selectionCurrent.x) / 2;
          const centerY = leftHanded ? selectionStart.y : (selectionStart.y + selectionCurrent.y) / 2;
          const radius = leftHanded ? dist : dist / 2;

          const isNight = globalTimeOfDay === 'night';

          const selectedCount = gameState.bees.filter(b => {
            if (b.owner !== 'player') return false;
            const dx = b.x - centerX;
            const dy = b.y - centerY;
            return Math.sqrt(dx * dx + dy * dy) <= radius;
          }).length;

          const fontSize = Math.round(gridParams.cellSize * 0.28);
          const badgeR = fontSize * 0.78;
          const badgeX = centerX;
          const badgeY = Math.max(badgeR + 4, centerY - radius);

          return (
            <>
              <defs>
                {/* Trou dans le cercle à l'emplacement de la pastille */}
                <mask id="sel-circle-mask">
                  <rect x={-99999} y={-99999} width={199999} height={199999} fill="white" />
                  {selectedCount > 0 && <circle cx={badgeX} cy={badgeY} r={badgeR + 1} fill="black" />}
                </mask>
                {/* Emporte-pièce sur la pastille */}
                {selectedCount > 0 && (
                  <mask id="sel-badge-mask">
                    <circle cx={badgeX} cy={badgeY} r={badgeR} fill="white" />
                    <text
                      x={badgeX} y={badgeY}
                      textAnchor="middle" dominantBaseline="central"
                      fill="black" fontSize={fontSize} fontWeight="700"
                    >
                      {selectedCount}
                    </text>
                  </mask>
                )}
              </defs>

              <circle
                cx={centerX} cy={centerY} r={radius}
                fill="rgba(255,255,255,0.10)"
                stroke="white" strokeWidth={3} opacity={0.9}
                mask="url(#sel-circle-mask)"
              />
              {selectedCount > 0 && (
                <circle cx={badgeX} cy={badgeY} r={badgeR} fill="white" mask="url(#sel-badge-mask)" style={{ pointerEvents: 'none' }} />
              )}
            </>
          );
        })()}

        {/* Dying bees — fade out + onde de choc blanche */}
        {dyingBees.map((bee) => {
          const age = Date.now() - bee.timestamp;
          const t = age / 300; // 0→1 sur 300ms
          const opacity = Math.max(0, 1 - t);
          const shockR = 4 + t * 14; // onde blanche 4→18px
          return (
            <g key={bee.id} pointerEvents="none">
              {/* Onde de choc blanche */}
              <circle
                cx={bee.x}
                cy={bee.y}
                r={shockR}
                fill="none"
                stroke="white"
                strokeWidth={2}
                opacity={opacity * 0.9}
              />
              {/* Corps abeille qui s'efface */}
              <circle
                cx={bee.x}
                cy={bee.y}
                r={4}
                fill={bee.owner === 'player' ? '#FDB022' : bee.owner === 'enemy' ? '#ef4444' : '#9ca3af'}
                opacity={opacity}
              />
            </g>
          );
        })}

        {/* Water splashes - when bees fall in ponds */}
        {waterSplashes.map((splash) => {
          const age = Date.now() - splash.timestamp;
          const opacity = Math.max(0, 1 - age / 800);
          const scale = 1 + (age / 800) * 0.5;
          const clipPathId = `pond-clip-${splash.pondIdx}`;

          return (
            <g key={splash.id} opacity={opacity} clipPath={`url(#${clipPathId})`}>
              <circle
                cx={splash.x}
                cy={splash.y}
                r={7 * scale}
                fill="none"
                stroke="#ffffff"
                strokeWidth={2.5}
                opacity={0.9}
              />
              <circle
                cx={splash.x}
                cy={splash.y}
                r={12 * scale}
                fill="none"
                stroke="#a8d8f0"
                strokeWidth={2}
                opacity={0.7}
              />
              <circle
                cx={splash.x}
                cy={splash.y}
                r={3.5}
                fill="#ffffff"
                opacity={1}
              />
            </g>
          );
        })}

        {/* Bees */}
        {gameState.bees.map((bee) => {
          if (bee.x < -50 || bee.x > gameWidth + 50 || bee.y < -50 || bee.y > gameHeight + 50) return null;
          return (
            <Bee
              key={bee.id}
              bee={bee}
              isSelected={gameState.selectedBeeIds.has(bee.id) && !(selectionStart && selectionCurrent)}
              isBeingSelected={beingSelectedIds.has(bee.id)}
              isNightMode={globalTimeOfDay === 'night'}
              cellSize={gridParams.cellSize}
            />
          );
        })}

        {/* Trees - TOP LAYER (hives, indicators, compteurs) — au-dessus des abeilles */}
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

        {/* Ripples au clic/touch */}
        {ripples.map(r => (
          <motion.circle
            key={r.id}
            cx={r.x}
            cy={r.y}
            r={0}
            fill="none"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth={2}
            initial={{ r: 0, opacity: 0.8 }}
            animate={{ r: 40, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        ))}

        {/* Nuages décoratifs — défilent de droite à gauche, au premier plan */}
        {(() => {
          const cloudFills = ['rgba(220, 240, 230, 0.82)', 'rgba(220, 240, 230, 0.82)'];
          return [
            { cls: 'cloud-a', cy: gameHeight * 0.15, r: gridParams.cellSize * 2,   duration: '65s' },
            { cls: 'cloud-b', cy: gameHeight * 0.72, r: gridParams.cellSize * 1.5, duration: '95s' },
          ].map((cloud, cloudIndex) => {
            const r = cloud.r;
            const isNight = globalTimeOfDay === 'night';
            const fill = isNight ? '#3a5a80' : cloudFills[cloudIndex % 2];

            return (
              <g
                key={`cloud-${cloudIndex}`}
                transform={`translate(0, ${cloud.cy})`}
                opacity={isNight ? 0.42 : 0.80}
                pointerEvents="none"
              >
                <g className={cloud.cls} style={{ animationDuration: cloud.duration }}>
                  <g transform="scale(1, 0.6)">
                    <circle cx={0}         cy={0}         r={r}        fill={fill} />
                    <circle cx={-r * 0.6}  cy={-r * 0.3}  r={r * 0.75} fill={fill} />
                    <circle cx={r * 0.6}   cy={-r * 0.3}  r={r * 0.72} fill={fill} />
                    <circle cx={-r * 0.55} cy={r * 0.35}  r={r * 0.70} fill={fill} />
                    <circle cx={r * 0.55}  cy={r * 0.35}  r={r * 0.68} fill={fill} />
                    <circle cx={0}         cy={-r * 0.65} r={r * 0.65} fill={fill} />
                    <circle cx={0}         cy={r * 0.65}  r={r * 0.63} fill={fill} />
                  </g>
                </g>
              </g>
            );
          });
        })()}
        {/* Trees - CLICK LAYER — au-dessus de tout, zones de clic transparentes */}
        {gameState.trees.map((tree) => (
          <Tree
            key={`${tree.id}-click`}
            tree={tree}
            onClick={(e) => onTreeClick(tree.id, e)}
            onDragStart={onTreeDragStart}
            playerBeesCount={0}
            cellSize={gridParams.cellSize}
            renderLayer="click"
            isNightMode={globalTimeOfDay === 'night'}
          />
        ))}
        </g>
      </svg>
    </div>
  );
}

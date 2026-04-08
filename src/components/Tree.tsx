import { Tree as TreeType } from '../types/game';
import { motion } from 'motion/react';

interface TreeProps {
  tree: TreeType;
  onClick: (e: React.MouseEvent) => void;
  onDragStart?: (e: React.PointerEvent) => void;
  playerBeesCount?: number;
  cellSize: number;
  renderLayer?: 'base' | 'top';
  isNightMode?: boolean;
}

export function Tree({
  tree,
  onClick,
  onDragStart,
  playerBeesCount = 0,
  cellSize,
  renderLayer = 'base',
  isNightMode = false,
}: TreeProps) {
  const s = cellSize / 80;
  const treeIsColonized = tree.hiveCount > 0;
  const trunkBottomY = tree.y + cellSize * 0.5;
  const trunkTopY      = trunkBottomY - 20 * s;
  const trunkTopYSmall = trunkBottomY - 18 * s; // petit arbre arrière-droite (bas à -4*s, hauteur 14*s)
  const trunkTopYLarge = trunkBottomY - 22 * s; // grand arbre avant-gauche (hauteur 22*s)

  const foliageDark = treeIsColonized ? '#5ba832' : '#9aad3a';
  const foliageLight = treeIsColonized ? '#6dc23c' : '#a8bc40';

  const hiveColors =
    tree.owner === 'enemy'
      ? { fill: '#e03030', border: '#c01010' }
      : { fill: '#e8a020', border: '#c4780a' };

  const handleClick = (e: React.MouseEvent) => onClick(e);
  const handlePointerDown = (e: React.PointerEvent) => {
    if (onDragStart) onDragStart(e);
  };

  const renderHive = (index: number, cx: number, cy: number, r: number) => {
    if (index >= tree.hiveHealth.length) return null;
    const health = tree.hiveHealth[index];
    const level = tree.hiveLevel[index] || 1;
    const maxHealth = level === 2 ? 35 : 7;
    const healthPercent = health / maxHealth;
    const hiveIsHealthy = health === maxHealth;
    const clipId = `hive-clip-${tree.id}-${index}`;

    return (
      <g key={`hive-${index}`}>
        {/* Empty background */}
        <circle cx={cx} cy={cy} r={r} fill="#D7CCC8" opacity={0.3} />

        {/* Health fill */}
        <defs>
          <clipPath id={clipId}>
            <rect
              x={cx - r}
              y={cy - r + 2 * r * (1 - healthPercent)}
              width={2 * r}
              height={2 * r * healthPercent}
            />
          </clipPath>
        </defs>
        <circle cx={cx} cy={cy} r={r} fill={hiveColors.fill} clipPath={`url(#${clipId})`} />

        {/* Border */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={hiveColors.border} strokeWidth={1.5 * s} />

        {/* Texture lines */}
        <path
          d={`M ${cx - r * 0.7} ${cy - r * 0.4} Q ${cx} ${cy - r * 0.5} ${cx + r * 0.7} ${cy - r * 0.4}`}
          fill="none" stroke={hiveColors.border} strokeWidth={0.8 * s} opacity={0.5}
        />
        <path
          d={`M ${cx - r * 0.8} ${cy} Q ${cx} ${cy + r * 0.1} ${cx + r * 0.8} ${cy}`}
          fill="none" stroke={hiveColors.border} strokeWidth={0.8 * s} opacity={0.5}
        />
        <path
          d={`M ${cx - r * 0.7} ${cy + r * 0.4} Q ${cx} ${cy + r * 0.5} ${cx + r * 0.7} ${cy + r * 0.4}`}
          fill="none" stroke={hiveColors.border} strokeWidth={0.8 * s} opacity={0.5}
        />

        {/* Brown hole */}
        <circle cx={cx} cy={cy} r={2.5 * s} fill="#5a3010" />

        {/* Highlight */}
        <ellipse
          cx={cx - r * 0.35} cy={cy - r * 0.35}
          rx={r * 0.3} ry={r * 0.25}
          fill="white" opacity={0.35}
        />

        {/* Health counter — only when damaged */}
        {!hiveIsHealthy && (
          <text
            x={cx}
            y={cy + r + 10 * s}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#fff"
            stroke="#000"
            strokeWidth={3 * s}
            paintOrder="stroke"
            fontSize={14 * s}
            fontWeight="bold"
          >
            {health}/{maxHealth}
          </text>
        )}
      </g>
    );
  };

  // ─── BASE LAYER: shadow + trunks + foliage ───────────────────────────────
  if (renderLayer === 'base') {
    return (
      <g>
        {/* Click area */}
        <circle
          cx={tree.x}
          cy={tree.y}
          r={cellSize * 1.1}
          fill="transparent"
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          style={{ cursor: tree.isCut ? 'default' : 'pointer', touchAction: 'none' }}
          pointerEvents="all"
        />

        <motion.g whileHover={{ scale: 1.05 }} style={{ pointerEvents: 'none' }}>
          {tree.isCut ? (
            <>
              {/* Stump */}
              <rect
                x={tree.x - 10 * s}
                y={trunkBottomY - 15 * s}
                width={20 * s}
                height={15 * s}
                fill="#6D4C41"
                rx={3 * s}
              />
              <ellipse cx={tree.x} cy={trunkBottomY - 15 * s} rx={10 * s} ry={6 * s} fill="#8D6E63" />
              <ellipse cx={tree.x} cy={trunkBottomY - 15 * s} rx={6.5 * s} ry={4 * s} fill="none" stroke="#5D4037" strokeWidth={s} />
              <ellipse cx={tree.x} cy={trunkBottomY - 15 * s} rx={3.5 * s} ry={2 * s} fill="none" stroke="#5D4037" strokeWidth={s} />
            </>
          ) : (
            <>
              {/* Shadow — diffuse, offset right (light from top-left) */}
              <defs>
                <radialGradient id={`shadow-grad-${tree.id}`} cx="20%" cy="30%" r="80%">
                  <stop offset="0%"   stopColor="#000" stopOpacity={0.18} />
                  <stop offset="60%"  stopColor="#000" stopOpacity={0.07} />
                  <stop offset="100%" stopColor="#000" stopOpacity={0} />
                </radialGradient>
              </defs>
              <ellipse
                cx={tree.x + 55 * s}
                cy={tree.y + cellSize * 0.5 - 4 * s}
                rx={55 * s}
                ry={16 * s}
                fill={`url(#shadow-grad-${tree.id})`}
              />

              {tree.maxHives === 2 ? (
                <>
                  {/* Small back-right tree (rendered first) */}
                  <g opacity={0.82}>
                    <rect
                      x={tree.x + 18 * s}
                      y={trunkBottomY - 4 * s - 14 * s}
                      width={8 * s}
                      height={14 * s}
                      fill="#7a5c3a"
                      rx={2 * s}
                    />
                    <circle cx={tree.x + 14 * s} cy={trunkTopYSmall - 12 * s} r={14 * s} fill={foliageDark} />
                    <circle cx={tree.x + 32 * s} cy={trunkTopYSmall - 9 * s}  r={13 * s} fill={foliageDark} />
                    <circle cx={tree.x + 22 * s} cy={trunkTopYSmall - 22 * s} r={16 * s} fill={foliageLight} />
                  </g>

                  {/* Large front-left tree (rendered second, on top) */}
                  <rect
                    x={tree.x - 14.5 * s}
                    y={trunkBottomY - 22 * s}
                    width={13 * s}
                    height={22 * s}
                    fill="#7a5c3a"
                    rx={3 * s}
                  />
                  <circle cx={tree.x - 20 * s} cy={trunkTopYLarge - 14 * s} r={22 * s} fill={foliageDark} />
                  <circle cx={tree.x + 4 * s}  cy={trunkTopYLarge - 10 * s} r={19 * s} fill={foliageDark} />
                  <circle cx={tree.x - 8 * s}  cy={trunkTopYLarge - 26 * s} r={28 * s} fill={foliageLight} />
                  <ellipse
                    cx={tree.x - 18 * s} cy={trunkTopYLarge - 20 * s}
                    rx={12 * s} ry={10 * s}
                    fill="white" opacity={0.18}
                  />
                </>
              ) : (
                <>
                  {/* Solo tree */}
                  <rect
                    x={tree.x - 5 * s}
                    y={trunkBottomY - 20 * s}
                    width={10 * s}
                    height={20 * s}
                    fill="#7a5c3a"
                    rx={2.5 * s}
                  />
                  <circle cx={tree.x - 9 * s} cy={trunkTopY - 18 * s} r={26 * s} fill={foliageDark} />
                  <circle cx={tree.x + 11 * s} cy={trunkTopY - 14 * s} r={22 * s} fill={foliageDark} />
                  <circle cx={tree.x}          cy={trunkTopY - 28 * s} r={22 * s} fill={foliageLight} />
                  <ellipse
                    cx={tree.x - 14 * s} cy={trunkTopY - 30 * s}
                    rx={9 * s} ry={7 * s}
                    fill="white" opacity={0.18}
                  />
                </>
              )}
            </>
          )}
        </motion.g>
      </g>
    );
  }

  // ─── TOP LAYER: hives + bee badge + indicators ───────────────────────────
  const hiveCx = tree.maxHives === 1 ? tree.x + 32 * s : tree.x + 38 * s;
  const badgeCy = tree.y - cellSize * 0.5 + 14 * s;

  return (
    <g>
      <g style={{ pointerEvents: 'none' }}>
        {/* Hives */}
        {!tree.isCut && (
          tree.maxHives === 1 ? (
            renderHive(0, tree.x + 32 * s, tree.y - 18 * s, 10 * s)
          ) : (
            <>
              {renderHive(0, tree.x - 38 * s, tree.y - 20 * s, 11 * s)}
              {renderHive(1, tree.x + 44 * s, tree.y - 14 * s, 10 * s)}
            </>
          )
        )}

        {/* Bee badge */}
        {playerBeesCount > 0 && (
          <g>
            <circle cx={hiveCx} cy={badgeCy} r={13 * s} fill="#2196F3" stroke="white" strokeWidth={2 * s} />
            <text
              x={hiveCx} y={badgeCy}
              textAnchor="middle" dominantBaseline="middle"
              fill="white" fontSize={13 * s} fontWeight="bold"
            >
              {playerBeesCount}
            </text>
          </g>
        )}

        {/* Building progress — ghost hive */}
        {tree.buildingProgress && tree.buildingProgress[0] > 0 && tree.hiveCount === 0 && (
          <g>
            <circle
              cx={tree.maxHives === 1 ? tree.x + 32 * s : tree.x - 38 * s}
              cy={tree.y - 18 * s}
              r={10 * s}
              fill={hiveColors.fill}
              stroke="#F57C00"
              strokeWidth={2 * s}
              strokeDasharray={`${3 * s},${3 * s}`}
              opacity={0.4}
            />
            <text
              x={tree.maxHives === 1 ? tree.x + 32 * s : tree.x - 38 * s}
              y={tree.y - 18 * s}
              textAnchor="middle" dominantBaseline="middle"
              fill="#fff" stroke="#000" strokeWidth={3 * s} paintOrder="stroke"
              fontSize={14 * s} fontWeight="bold"
            >
              {tree.buildingProgress[0]}/5
            </text>
          </g>
        )}

        {/* Upgrade progress bar */}
        {tree.upgradingProgress && tree.upgradingProgress > 0 && tree.hiveCount === 1 && tree.hiveLevel[0] === 1 && (
          <g>
            <rect x={tree.x - 20 * s} y={trunkTopY - 15 * s} width={40 * s} height={6 * s} fill="#333" stroke="#000" strokeWidth={s} rx={2 * s} />
            <rect
              x={tree.x - 20 * s} y={trunkTopY - 15 * s}
              width={(40 * s * tree.upgradingProgress) / 20}
              height={6 * s}
              fill="#FDD835" stroke="#F57C00" strokeWidth={s} rx={2 * s}
            />
            <text
              x={tree.x} y={trunkTopY - 22 * s}
              textAnchor="middle" dominantBaseline="middle"
              fill="#fff" stroke="#000" strokeWidth={3 * s} paintOrder="stroke"
              fontSize={12 * s} fontWeight="bold"
            >
              ⬆ {tree.upgradingProgress}/20
            </text>
          </g>
        )}

        {/* Cut progress bar */}
        {!tree.isCut && tree.cutProgress && tree.cutProgress > 0 && (() => {
          const healthRemaining = 10 - tree.cutProgress;
          const healthPercent = healthRemaining / 10;
          let barColor = '#4CAF50';
          if (healthRemaining <= 6 && healthRemaining >= 4) barColor = '#FF9800';
          else if (healthRemaining < 4) barColor = '#F44336';
          return (
            <g>
              <rect x={tree.x - 20 * s} y={trunkBottomY + 5 * s} width={40 * s} height={6 * s} fill="#000" opacity={0.3} rx={3 * s} />
              <rect x={tree.x - 20 * s} y={trunkBottomY + 5 * s} width={healthPercent * 40 * s} height={6 * s} fill={barColor} rx={3 * s} />
              <text
                x={tree.x} y={trunkBottomY + 17 * s}
                textAnchor="middle"
                fill="#fff" stroke="#000" strokeWidth={2 * s} paintOrder="stroke"
                fontSize={8 * s} fontWeight="bold"
              >
                {healthRemaining}/10
              </text>
            </g>
          );
        })()}
      </g>
    </g>
  );
}

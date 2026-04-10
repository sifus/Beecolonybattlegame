import { Tree as TreeType } from '../types/game';
import { HIVE_L1_HP, HIVE_L2_HP, BUILD_HIVE_COST, UPGRADE_HIVE_COST } from '../constants/gameRules';

interface TreeProps {
  tree: TreeType;
  onClick: (e: React.MouseEvent) => void;
  onDragStart?: (e: React.PointerEvent) => void;
  cellSize: number;
  renderLayer?: 'base' | 'top' | 'click';
  isNightMode?: boolean;
  playerBeesCount?: number;
}

export function Tree({
  tree,
  onClick,
  onDragStart,
  cellSize,
  renderLayer = 'base',
  isNightMode = false,
  playerBeesCount = 0,
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
    if (index >= tree.hiveHealth.length && !tree.buildingProgress?.[index] && !(index === 1 && tree.upgradingProgress)) return null;

    const sc = r / 30;
    const health = tree.hiveHealth[index] ?? 0;
    const level = tree.hiveLevel[index] ?? 1;
    const maxHealth = level === 2 ? HIVE_L2_HP : HIVE_L1_HP;
    const healthPercent = Math.min(health / maxHealth, 1);
    const isUnderConstruction = index >= tree.hiveHealth.length;

    const buildPct = isUnderConstruction
      ? index === 1 && tree.upgradingProgress
        ? tree.upgradingProgress / UPGRADE_HIVE_COST
        : ((tree.buildingProgress?.[index] ?? 0) / BUILD_HIVE_COST)
      : healthPercent;

    const clipId = `hive-clip-${tree.id}-${index}`;
    const gradId = `hive-grad-${tree.id}-${index}`;

    const body = `M ${-10*sc} ${-46*sc} Q ${-6*sc} ${-52*sc} ${6*sc} ${-52*sc} Q ${16*sc} ${-52*sc} ${24*sc} ${-38*sc} Q ${30*sc} ${-20*sc} ${28*sc} ${4*sc} Q ${24*sc} ${22*sc} 0 ${28*sc} Q ${-24*sc} ${22*sc} ${-28*sc} ${4*sc} Q ${-30*sc} ${-20*sc} ${-24*sc} ${-38*sc} Q ${-18*sc} ${-52*sc} ${-10*sc} ${-46*sc} Z`;

    const fillColor   = isUnderConstruction ? '#888888' : tree.owner === 'enemy' ? '#cc2222' : '#e8a020';
    const strokeColor = isUnderConstruction ? 'rgba(255,255,255,0.75)' : tree.owner === 'enemy' ? '#991111' : '#c4780a';
    const liquidColor = tree.owner === 'enemy' ? '#cc2222' : '#e8a020';
    const stripeColor = isUnderConstruction ? 'rgba(187,187,187,0.4)' : tree.owner === 'enemy' ? '#991111' : '#c4780a';

    return (
      <g key={`hive-${index}`} transform={`translate(${cx}, ${cy})`}>
        <defs>
          <clipPath id={clipId}>
            <path d={body} />
          </clipPath>
          {(buildPct < 1 || isUnderConstruction) && (
            <linearGradient id={gradId} x1="0" y1="1" x2="0" y2="0" gradientUnits="objectBoundingBox">
              <stop offset="0%" stopColor={liquidColor} stopOpacity="1" />
              <stop offset={`${buildPct * 100}%`} stopColor={liquidColor} stopOpacity="1" />
              <stop offset={`${buildPct * 100}%`} stopColor={liquidColor} stopOpacity="0" />
              <stop offset="100%" stopColor={liquidColor} stopOpacity="0" />
            </linearGradient>
          )}
        </defs>

        {/* Corps fond */}
        <path d={body} fill={fillColor} opacity={isUnderConstruction ? 0.55 : 1} />

        {/* Liquide — gradient appliqué sur le path de la ruche, aucun clipPath nécessaire */}
        {(buildPct < 1 || isUnderConstruction) && (
          <path d={body} fill={`url(#${gradId})`} />
        )}

        {/* Stries horizontales */}
        {([-34, -16, 2, 16] as number[]).map((yOff, i) => (
          <line
            key={i}
            x1={-30 * sc} y1={yOff * sc}
            x2={30 * sc}  y2={yOff * sc}
            stroke={stripeColor}
            strokeWidth={1.5 * sc}
            clipPath={`url(#${clipId})`}
          />
        ))}

        {/* Contour */}
        <path d={body} fill="none" stroke={strokeColor} strokeWidth={2 * sc} />

        {/* Tige */}
        <rect
          x={-3 * sc} y={-62 * sc}
          width={6 * sc} height={12 * sc}
          rx={2 * sc}
          fill={isUnderConstruction ? '#aaa' : tree.owner === 'enemy' ? '#6a1010' : '#7a4010'}
        />

        {/* Trou */}
        <circle cx={0} cy={8 * sc} r={12 * sc} fill={isUnderConstruction ? '#555' : tree.owner === 'enemy' ? '#6a1010' : '#7a4010'} />
        <circle cx={0} cy={8 * sc} r={9 * sc}  fill={isUnderConstruction ? '#333' : tree.owner === 'enemy' ? '#3a0808' : '#5a2e08'} />

        {/* Highlight */}
        <ellipse cx={-9 * sc} cy={-38 * sc} rx={5 * sc} ry={4 * sc} fill="#fff" opacity={isUnderConstruction ? 0.15 : 0.35} />
      </g>
    );
  };

  // ─── BASE LAYER: shadow + trunks + foliage ───────────────────────────────
  if (renderLayer === 'base') {
    return (
      <g>
        <g style={{ pointerEvents: 'none' }}>
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
        </g>
      </g>
    );
  }

  // ─── CLICK LAYER: transparent hit zone — doit être rendu en DERNIER dans le SVG ──
  if (renderLayer === 'click') {
    return (
      <rect
        x={tree.x - cellSize * 0.5}
        y={tree.y - cellSize * 0.5}
        width={cellSize}
        height={cellSize}
        fill="transparent"
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        style={{ cursor: tree.isCut ? 'default' : 'pointer', touchAction: 'none' }}
        pointerEvents="all"
      />
    );
  }

  // ─── TOP LAYER: hives + indicators ───────────────────────────────────────

  return (
    <g>
      <g style={{ pointerEvents: 'none' }}>
        {/* Hives — renderHive gère aussi l'état en construction */}
        {!tree.isCut && (
          tree.maxHives === 1 ? (
            renderHive(0, tree.x, trunkTopY - 14 * s, 11 * s)
          ) : (
            <>
              {renderHive(0, tree.x - 16 * s, trunkTopY - 10 * s, 10 * s)}
              {renderHive(1, tree.x + 14 * s, trunkTopY - 16 * s, 14 * s)}
            </>
          )
        )}

        {/* Ruche fantôme upgrade vers 2ème slot */}
        {tree.owner !== 'enemy' && tree.upgradingProgress && tree.upgradingProgress > 0 && tree.hiveCount === 1 && tree.hiveLevel[0] === 1 && tree.maxHives === 2 && (
          renderHive(1, tree.x + 14 * s, trunkTopY - 16 * s, 14 * s)
        )}

        {/* Upgrade progress bar */}
        {tree.owner !== 'enemy' && tree.upgradingProgress && tree.upgradingProgress > 0 && tree.hiveCount === 1 && tree.hiveLevel[0] === 1 && (() => {
          const upgCx = tree.maxHives === 1 ? tree.x - 8 * s : tree.x + 14 * s;
          const upgCy = tree.maxHives === 1 ? trunkTopY - 14 * s : trunkTopY - 16 * s;
          const barW = 40 * s;
          const barH = 6 * s;
          const barX = upgCx - barW / 2;
          const barY = upgCy - 20 * s;
          return (
            <g key="upgrade-bar">
              <rect x={barX} y={barY} width={barW} height={barH} fill="#333" stroke="#000" strokeWidth={s} rx={2 * s} />
              <rect x={barX} y={barY} width={(barW * tree.upgradingProgress) / UPGRADE_HIVE_COST} height={barH} fill="#FDD835" stroke="#F57C00" strokeWidth={s} rx={2 * s} />
              <text x={upgCx} y={barY - 6 * s} textAnchor="middle" dominantBaseline="middle" fill="#fff" stroke="#000" strokeWidth={3 * s} paintOrder="stroke" fontSize={12 * s} fontWeight="bold">
                ⬆ {tree.upgradingProgress}/{UPGRADE_HIVE_COST}
              </text>
            </g>
          );
        })()}

        {/* Construction progress bar */}
        {tree.owner !== 'enemy' && !tree.isCut && tree.buildingProgress?.[0] && tree.buildingProgress[0] > 0 && (() => {
          const bpCx = tree.maxHives === 1 ? tree.x - 8 * s : tree.x - 22 * s;
          const bpCy = tree.maxHives === 1 ? trunkTopY - 14 * s : trunkTopY - 10 * s;
          const barW = 40 * s;
          const barH = 6 * s;
          const barX = bpCx - barW / 2;
          const barY = bpCy - 20 * s;
          const prog = tree.buildingProgress[0];
          return (
            <g key="build-bar">
              <rect x={barX} y={barY} width={barW} height={barH} fill="#333" stroke="#000" strokeWidth={s} rx={2 * s} />
              <rect x={barX} y={barY} width={(barW * prog) / BUILD_HIVE_COST} height={barH} fill="#FDD835" stroke="#F57C00" strokeWidth={s} rx={2 * s} />
              <text x={bpCx} y={barY - 6 * s} textAnchor="middle" dominantBaseline="middle" fill="#fff" stroke="#000" strokeWidth={3 * s} paintOrder="stroke" fontSize={12 * s} fontWeight="bold">
                ⬆ {prog}/{BUILD_HIVE_COST}
              </text>
            </g>
          );
        })()}

        {/* Damage indicators */}
        {!tree.isCut && tree.hiveHealth.map((health, index) => {
          const level = tree.hiveLevel[index] ?? 1;
          const maxHealth = level === 2 ? HIVE_L2_HP : HIVE_L1_HP;
          if (health >= maxHealth) return null;
          const hivePos = tree.maxHives === 1
            ? { cx: tree.x, cy: trunkTopY - 14 * s }
            : index === 0
              ? { cx: tree.x - 16 * s, cy: trunkTopY - 10 * s }
              : { cx: tree.x + 14 * s, cy: trunkTopY - 16 * s };
          return (
            <text key={`dmg-${index}`} x={hivePos.cx} y={hivePos.cy - 18 * s} textAnchor="middle" dominantBaseline="middle" fill="#fff" stroke="#000" strokeWidth={3 * s} paintOrder="stroke" fontSize={11 * s} fontWeight="bold">
              {health}/{maxHealth}
            </text>
          );
        })}

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

        {/* Bulle compteur abeilles — arbres joueur uniquement */}
        {tree.owner === 'player' && !tree.isCut && (() => {
          const r = cellSize * 0.22;
          const isGroup = tree.maxHives === 2;
          const bx = tree.x + cellSize * (isGroup ? 0.52 : 0.38);
          const by = tree.y - cellSize * (isGroup ? 0.42 : 0.38);
          const gradId = `bee-count-grad-${tree.id}`;
          return (
            <g filter="drop-shadow(0px 2px 3px rgba(0,0,0,0.30))">
              <defs>
                <radialGradient id={gradId} cx="35%" cy="30%" r="65%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
                </radialGradient>
              </defs>
              <circle cx={bx} cy={by} r={r} fill="#4DA8E8" />
              <circle cx={bx} cy={by} r={r} fill={`url(#${gradId})`} />
              <text
                x={bx} y={by}
                textAnchor="middle"
                dominantBaseline="central"
                fill="white"
                fontWeight="bold"
                fontSize={r * 1.1}
              >
                {playerBeesCount}
              </text>
            </g>
          );
        })()}
      </g>
    </g>
  );
}

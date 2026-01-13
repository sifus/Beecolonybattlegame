import { Tree as TreeType } from '../types/game';
import { motion } from 'motion/react';

// Version 3.6: Permet de commencer un cercle de sélection sur un arbre
interface TreeProps {
  tree: TreeType;
  onClick: (e: React.MouseEvent) => void;
  onDragStart?: (e: React.PointerEvent) => void; // Nouveau: pour détecter le début du drag
  playerBeesCount?: number;
  cellSize: number;
  renderLayer?: 'base' | 'top'; // Nouvelle prop pour séparer les couches de rendu
  isNightMode?: boolean; // Mode nuit pour changer les couleurs
}

export function Tree({ tree, onClick, onDragStart, playerBeesCount = 0, cellSize, renderLayer = 'base', isNightMode = false }: TreeProps) {
  // Tree dimensions based on cell size - proportionnel à la cellSize agrandie
  const treeScale = cellSize / 60; // Proportionnel à la nouvelle cellSize
  const trunkWidth = 30 * treeScale;
  const trunkHeight = 25 * treeScale;
  const foliageRadius = 30 * treeScale;
  const topFoliageRadius = 25 * treeScale;
  const clickRadius = cellSize * 1.1; // Zone de touch agrandie pour mobile (couvre tout l'arbre + marge)

  const getTreeColor = () => {
    // Tous les arbres sont verts (vivants)
    // Plus sombres en mode nuit
    return isNightMode ? '#6B9440' : '#8BC34A';
  };

  const getHiveColor = () => {
    // En mode nuit, les cocons ont des couleurs sombres différentes selon le joueur
    if (isNightMode) {
      if (tree.owner === 'player') return '#6B4423'; // Marron chocolat foncé pour le joueur
      if (tree.owner === 'enemy') return '#4A3728'; // Marron très foncé pour l'ennemi
      return '#6B4423'; // Neutre = marron chocolat
    }
    // En mode jour, couleurs normales
    if (tree.owner === 'player') return '#FDD835';
    if (tree.owner === 'enemy') return '#D32F2F';
    return '#FDD835';
  };

  const handleClick = (e: React.MouseEvent) => {
    // Ne pas bloquer la propagation ici - c'est géré dans App.tsx
    onClick(e);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    // Laisser passer l'événement pour permettre le cercle de sélection
    // App.tsx va gérer la logique clic vs drag
    if (onDragStart) {
      onDragStart(e);
    }
  };

  // Rendu en deux passes pour garantir que les ruches sont toujours au-dessus
  if (renderLayer === 'base') {
    return (
      <g>
        {/* Clickable area - invisible but covers the whole tree */}
        <circle
          cx={tree.x}
          cy={tree.y - foliageRadius * 0.2}
          r={clickRadius}
          fill="transparent"
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          style={{ 
            cursor: tree.isCut ? 'default' : 'pointer',
            touchAction: 'none',
          }}
          pointerEvents="all"
        />
        
        <motion.g whileHover={{ scale: 1.05 }} style={{ pointerEvents: 'none' }}>
          {tree.isCut ? (
            <>
              {/* Cut tree stump */}
              <rect
                x={tree.x - trunkWidth / 2}
                y={tree.y + 20 * treeScale}
                width={trunkWidth}
                height={15 * treeScale}
                fill="#6D4C41"
                rx={3 * treeScale}
              />
              {/* Stump top */}
              <ellipse
                cx={tree.x}
                cy={tree.y + 20 * treeScale}
                rx={trunkWidth / 2}
                ry={8 * treeScale}
                fill="#8D6E63"
              />
              {/* Tree rings */}
              <ellipse
                cx={tree.x}
                cy={tree.y + 20 * treeScale}
                rx={trunkWidth / 3}
                ry={5 * treeScale}
                fill="none"
                stroke="#5D4037"
                strokeWidth={1 * treeScale}
              />
              <ellipse
                cx={tree.x}
                cy={tree.y + 20 * treeScale}
                rx={trunkWidth / 6}
                ry={3 * treeScale}
                fill="none"
                stroke="#5D4037"
                strokeWidth={1 * treeScale}
              />
            </>
          ) : (
            <>
              {/* Groupe d'arbres EN ARRIERE PLAN pour les arbres maxHives === 2 */}
              {tree.maxHives === 2 && (
                <>
                  {/* Arbre arrière gauche (plus petit, plus transparent) */}
                  <g opacity={0.6}>
                    {/* Ombre */}
                    <ellipse
                      cx={tree.x - foliageRadius * 1.1 + 6 * treeScale}
                      cy={tree.y + foliageRadius * 1.1}
                      rx={foliageRadius * 0.5}
                      ry={foliageRadius * 0.2}
                      fill="#000"
                      opacity={0.2}
                    />
                    {/* Tronc */}
                    <rect
                      x={tree.x - foliageRadius * 1.1 - trunkWidth / 3}
                      y={tree.y + foliageRadius * 0.3}
                      width={trunkWidth * 0.65}
                      height={trunkHeight * 0.7}
                      fill="#8D6E63"
                      rx={2 * treeScale}
                    />
                    {/* Feuillage */}
                    <circle
                      cx={tree.x - foliageRadius * 1.1}
                      cy={tree.y - foliageRadius * 0.3}
                      r={foliageRadius * 0.65}
                      fill={getTreeColor()}
                    />
                    <circle
                      cx={tree.x - foliageRadius * 1.35}
                      cy={tree.y - foliageRadius * 0.2}
                      r={foliageRadius * 0.55}
                      fill={getTreeColor()}
                    />
                  </g>
                  
                  {/* Arbre arrière droite (plus petit, plus transparent) */}
                  <g opacity={0.6}>
                    {/* Ombre */}
                    <ellipse
                      cx={tree.x + foliageRadius * 1.1 + 6 * treeScale}
                      cy={tree.y + foliageRadius * 1.2}
                      rx={foliageRadius * 0.45}
                      ry={foliageRadius * 0.18}
                      fill="#000"
                      opacity={0.2}
                    />
                    {/* Tronc */}
                    <rect
                      x={tree.x + foliageRadius * 1.1 - trunkWidth / 3.5}
                      y={tree.y + foliageRadius * 0.4}
                      width={trunkWidth * 0.55}
                      height={trunkHeight * 0.6}
                      fill="#8D6E63"
                      rx={2 * treeScale}
                    />
                    {/* Feuillage */}
                    <circle
                      cx={tree.x + foliageRadius * 1.1}
                      cy={tree.y - foliageRadius * 0.15}
                      r={foliageRadius * 0.55}
                      fill={getTreeColor()}
                    />
                    <circle
                      cx={tree.x + foliageRadius * 1.3}
                      cy={tree.y - foliageRadius * 0.05}
                      r={foliageRadius * 0.45}
                      fill={getTreeColor()}
                    />
                  </g>
                </>
              )}
              
              {/* Ombre de l'arbre principal (lumière vient du haut-gauche, donc ombre vers bas-droite) */}
              <ellipse
                cx={tree.x + 8 * treeScale}
                cy={tree.y + foliageRadius * 1.3}
                rx={foliageRadius * 0.9}
                ry={foliageRadius * 0.35}
                fill="#000"
                opacity={0.25}
              />
              
              {/* Tree trunk - Tous les arbres sont identiques (pas d'étoile sur arbres de départ) */}
              <rect
                x={tree.x - trunkWidth / 2}
                y={tree.y + foliageRadius * 0.67}
                width={trunkWidth}
                height={trunkHeight}
                fill="#8D6E63"
                rx={3 * treeScale}
              />
              
              {/* Reflet lumineux sur le tronc (haut-gauche) */}
              <rect
                x={tree.x - trunkWidth / 2 + 3 * treeScale}
                y={tree.y + foliageRadius * 0.67 + 2 * treeScale}
                width={6 * treeScale}
                height={8 * treeScale}
                fill="#fff"
                opacity={0.15}
                rx={2 * treeScale}
              />
              
              {/* Tree foliage */}
              <circle
                cx={tree.x - foliageRadius / 3}
                cy={tree.y}
                r={foliageRadius}
                fill={getTreeColor()}
                opacity={0.9}
              />
              <circle
                cx={tree.x + foliageRadius / 3}
                cy={tree.y}
                r={foliageRadius}
                fill={getTreeColor()}
                opacity={0.9}
              />
              <circle
                cx={tree.x}
                cy={tree.y - foliageRadius / 2}
                r={topFoliageRadius}
                fill={getTreeColor()}
                opacity={0.9}
              />
              
              {/* Reflet lumineux sur feuillage (haut-gauche jour, haut-droite nuit) */}
              <ellipse
                cx={isNightMode ? tree.x + foliageRadius / 2 : tree.x - foliageRadius / 2}
                cy={tree.y - foliageRadius / 2.5}
                rx={foliageRadius * 0.3}
                ry={foliageRadius * 0.25}
                fill={isNightMode ? "#a8c5dd" : "#fff"}
                opacity={isNightMode ? 0.2 : 0.25}
              />
            </>
          )}
        </motion.g>
      </g>
    );
  }
  
  // renderLayer === 'top'
  return (
    <g>
      {/* Hives, hourglass, and bee count - ALWAYS ON TOP */}
      <g style={{ pointerEvents: 'none' }}>
        {/* Hives */}
        {tree.hiveHealth.map((health, i) => {
          const hiveY = tree.y - 10 * treeScale;
          // Ruche niveau 1 = 7 HP max, Ruche niveau 2 = 35 HP max
          const level = tree.hiveLevel[i] || 1;
          const maxHealth = level === 2 ? 35 : 7;
          const isHealthy = health === maxHealth;
          const healthPercent = health / maxHealth;
          
          // Niveau 1 : petite ruche (augmenté de 20%)
          const hive1Rx = 14 * treeScale;
          const hive1Ry = 18 * treeScale;
          const hole1Radius = 5 * treeScale; // Trou agrandi
          
          // Niveau 2 : deux ruches côte à côte (nouvelle version)
          const hive2Rx = 15 * treeScale; // Un peu plus ronde que niveau 1
          const hive2Ry = 19 * treeScale;
          const hole2Radius = 5 * treeScale;
          const hive2Spacing = 18 * treeScale; // Espacement entre les deux ruches
          
          return (
            <g key={`hive-top-${i}`}>
              {level === 1 ? (
                // ===== RUCHE NIVEAU 1 =====
                <>
                  {/* Ellipse de remplissage (fond) */}
                  <ellipse
                    cx={tree.x}
                    cy={hiveY}
                    rx={hive1Rx}
                    ry={hive1Ry}
                    fill="#D7CCC8"
                    opacity={0.3}
                  />
                  
                  {/* Ellipse remplie selon HP (clipPath) */}
                  <defs>
                    <clipPath id={`hive-clip-${tree.id}-${i}`}>
                      <rect
                        x={tree.x - hive1Rx}
                        y={hiveY - hive1Ry + (hive1Ry * 2 * (1 - healthPercent))}
                        width={hive1Rx * 2}
                        height={hive1Ry * 2 * healthPercent}
                      />
                    </clipPath>
                  </defs>
                  
                  <ellipse
                    cx={tree.x}
                    cy={hiveY}
                    rx={hive1Rx}
                    ry={hive1Ry}
                    fill={getHiveColor()}
                    clipPath={`url(#hive-clip-${tree.id}-${i})`}
                  />
                  
                  {/* Bordure de la ruche */}
                  <ellipse
                    cx={tree.x}
                    cy={hiveY}
                    rx={hive1Rx}
                    ry={hive1Ry}
                    fill="none"
                    stroke={isNightMode ? "#654321" : "#8D6E63"}
                    strokeWidth={2 * treeScale}
                  />
                  
                  {/* Reflet lumineux (haut-gauche) */}
                  <ellipse
                    cx={tree.x - hive1Rx * 0.4}
                    cy={hiveY - hive1Ry * 0.4}
                    rx={hive1Rx * 0.35}
                    ry={hive1Ry * 0.3}
                    fill="#fff"
                    opacity={isNightMode ? 0.1 : 0.3}
                  />
                  
                  {/* Lignes de texture - bandes pour cocon en mode nuit */}
                  {isHealthy && (
                    <>
                      {isNightMode ? (
                        // Bandes horizontales pour effet cocon
                        <>
                          <path
                            d={`M ${tree.x - 10 * treeScale} ${hiveY - 8 * treeScale} Q ${tree.x} ${hiveY - 8 * treeScale} ${tree.x + 10 * treeScale} ${hiveY - 8 * treeScale}`}
                            fill="none"
                            stroke="#654321"
                            strokeWidth={1.5 * treeScale}
                            opacity={0.4}
                          />
                          <path
                            d={`M ${tree.x - 11 * treeScale} ${hiveY - 3 * treeScale} Q ${tree.x} ${hiveY - 3 * treeScale} ${tree.x + 11 * treeScale} ${hiveY - 3 * treeScale}`}
                            fill="none"
                            stroke="#654321"
                            strokeWidth={1.5 * treeScale}
                            opacity={0.4}
                          />
                          <path
                            d={`M ${tree.x - 11 * treeScale} ${hiveY + 2 * treeScale} Q ${tree.x} ${hiveY + 2 * treeScale} ${tree.x + 11 * treeScale} ${hiveY + 2 * treeScale}`}
                            fill="none"
                            stroke="#654321"
                            strokeWidth={1.5 * treeScale}
                            opacity={0.4}
                          />
                          <path
                            d={`M ${tree.x - 10 * treeScale} ${hiveY + 7 * treeScale} Q ${tree.x} ${hiveY + 7 * treeScale} ${tree.x + 10 * treeScale} ${hiveY + 7 * treeScale}`}
                            fill="none"
                            stroke="#654321"
                            strokeWidth={1.5 * treeScale}
                            opacity={0.4}
                          />
                        </>
                      ) : (
                        // Texture normale ruche jour
                        <>
                          <path
                            d={`M ${tree.x - 8 * treeScale} ${hiveY - 5 * treeScale} Q ${tree.x} ${hiveY - 3 * treeScale} ${tree.x + 8 * treeScale} ${hiveY - 5 * treeScale}`}
                            fill="none"
                            stroke="#A1887F"
                            strokeWidth={1 * treeScale}
                            opacity={0.5}
                          />
                          <path
                            d={`M ${tree.x - 8 * treeScale} ${hiveY + 5 * treeScale} Q ${tree.x} ${hiveY + 7 * treeScale} ${tree.x + 8 * treeScale} ${hiveY + 5 * treeScale}`}
                            fill="none"
                            stroke="#A1887F"
                            strokeWidth={1 * treeScale}
                            opacity={0.5}
                          />
                        </>
                      )}
                    </>
                  )}
                </>
              ) : (
                // ===== RUCHE NIVEAU 2 =====
                <>
                  {/* Ruche gauche */}
                  <ellipse
                    cx={tree.x - hive2Spacing / 2}
                    cy={hiveY}
                    rx={hive2Rx}
                    ry={hive2Ry}
                    fill="#D7CCC8"
                    opacity={0.3}
                  />
                  
                  <defs>
                    <clipPath id={`hive-clip-left-${tree.id}-${i}`}>
                      <rect
                        x={tree.x - hive2Spacing / 2 - hive2Rx}
                        y={hiveY - hive2Ry + (hive2Ry * 2 * (1 - healthPercent))}
                        width={hive2Rx * 2}
                        height={hive2Ry * 2 * healthPercent}
                      />
                    </clipPath>
                  </defs>
                  
                  <ellipse
                    cx={tree.x - hive2Spacing / 2}
                    cy={hiveY}
                    rx={hive2Rx}
                    ry={hive2Ry}
                    fill={getHiveColor()}
                    clipPath={`url(#hive-clip-left-${tree.id}-${i})`}
                  />
                  
                  <ellipse
                    cx={tree.x - hive2Spacing / 2}
                    cy={hiveY}
                    rx={hive2Rx}
                    ry={hive2Ry}
                    fill="none"
                    stroke={isNightMode ? "#654321" : "#8D6E63"}
                    strokeWidth={2 * treeScale}
                  />
                  
                  {/* Reflet lumineux ruche gauche */}
                  <ellipse
                    cx={tree.x - hive2Spacing / 2 - hive2Rx * 0.4}
                    cy={hiveY - hive2Ry * 0.4}
                    rx={hive2Rx * 0.3}
                    ry={hive2Ry * 0.25}
                    fill="#fff"
                    opacity={isNightMode ? 0.1 : 0.3}
                  />
                  
                  {/* Ruche droite */}
                  <ellipse
                    cx={tree.x + hive2Spacing / 2}
                    cy={hiveY}
                    rx={hive2Rx}
                    ry={hive2Ry}
                    fill="#D7CCC8"
                    opacity={0.3}
                  />
                  
                  <defs>
                    <clipPath id={`hive-clip-right-${tree.id}-${i}`}>
                      <rect
                        x={tree.x + hive2Spacing / 2 - hive2Rx}
                        y={hiveY - hive2Ry + (hive2Ry * 2 * (1 - healthPercent))}
                        width={hive2Rx * 2}
                        height={hive2Ry * 2 * healthPercent}
                      />
                    </clipPath>
                  </defs>
                  
                  <ellipse
                    cx={tree.x + hive2Spacing / 2}
                    cy={hiveY}
                    rx={hive2Rx}
                    ry={hive2Ry}
                    fill={getHiveColor()}
                    clipPath={`url(#hive-clip-right-${tree.id}-${i})`}
                  />
                  
                  <ellipse
                    cx={tree.x + hive2Spacing / 2}
                    cy={hiveY}
                    rx={hive2Rx}
                    ry={hive2Ry}
                    fill="none"
                    stroke={isNightMode ? "#654321" : "#8D6E63"}
                    strokeWidth={2 * treeScale}
                  />
                  
                  {/* Reflet lumineux ruche droite */}
                  <ellipse
                    cx={tree.x + hive2Spacing / 2 - hive2Rx * 0.4}
                    cy={hiveY - hive2Ry * 0.4}
                    rx={hive2Rx * 0.3}
                    ry={hive2Ry * 0.25}
                    fill="#fff"
                    opacity={isNightMode ? 0.1 : 0.3}
                  />
                  
                  {/* Textures si saines - mode nuit uniquement */}
                  {isHealthy && isNightMode && (
                    <>
                      {/* Ruche gauche */}
                      <path
                        d={`M ${tree.x - hive2Spacing / 2 - 11 * treeScale} ${hiveY - 8 * treeScale} Q ${tree.x - hive2Spacing / 2} ${hiveY - 8 * treeScale} ${tree.x - hive2Spacing / 2 + 11 * treeScale} ${hiveY - 8 * treeScale}`}
                        fill="none"
                        stroke="#654321"
                        strokeWidth={1.5 * treeScale}
                        opacity={0.4}
                      />
                      <path
                        d={`M ${tree.x - hive2Spacing / 2 - 12 * treeScale} ${hiveY} Q ${tree.x - hive2Spacing / 2} ${hiveY} ${tree.x - hive2Spacing / 2 + 12 * treeScale} ${hiveY}`}
                        fill="none"
                        stroke="#654321"
                        strokeWidth={1.5 * treeScale}
                        opacity={0.4}
                      />
                      <path
                        d={`M ${tree.x - hive2Spacing / 2 - 11 * treeScale} ${hiveY + 8 * treeScale} Q ${tree.x - hive2Spacing / 2} ${hiveY + 8 * treeScale} ${tree.x - hive2Spacing / 2 + 11 * treeScale} ${hiveY + 8 * treeScale}`}
                        fill="none"
                        stroke="#654321"
                        strokeWidth={1.5 * treeScale}
                        opacity={0.4}
                      />
                      {/* Ruche droite */}
                      <path
                        d={`M ${tree.x + hive2Spacing / 2 - 11 * treeScale} ${hiveY - 8 * treeScale} Q ${tree.x + hive2Spacing / 2} ${hiveY - 8 * treeScale} ${tree.x + hive2Spacing / 2 + 11 * treeScale} ${hiveY - 8 * treeScale}`}
                        fill="none"
                        stroke="#654321"
                        strokeWidth={1.5 * treeScale}
                        opacity={0.4}
                      />
                      <path
                        d={`M ${tree.x + hive2Spacing / 2 - 12 * treeScale} ${hiveY} Q ${tree.x + hive2Spacing / 2} ${hiveY} ${tree.x + hive2Spacing / 2 + 12 * treeScale} ${hiveY}`}
                        fill="none"
                        stroke="#654321"
                        strokeWidth={1.5 * treeScale}
                        opacity={0.4}
                      />
                      <path
                        d={`M ${tree.x + hive2Spacing / 2 - 11 * treeScale} ${hiveY + 8 * treeScale} Q ${tree.x + hive2Spacing / 2} ${hiveY + 8 * treeScale} ${tree.x + hive2Spacing / 2 + 11 * treeScale} ${hiveY + 8 * treeScale}`}
                        fill="none"
                        stroke="#654321"
                        strokeWidth={1.5 * treeScale}
                        opacity={0.4}
                      />
                    </>
                  )}
                </>
              )}
              
              {/* Hive details - more complex for level 2 */}
              {isHealthy && level === 1 && (
                <>
                  <path
                    d={`M ${tree.x - 8 * treeScale} ${hiveY - 5 * treeScale} Q ${tree.x} ${hiveY - 3 * treeScale} ${tree.x + 8 * treeScale} ${hiveY - 5 * treeScale}`}
                    fill="none"
                    stroke="#F57C00"
                    strokeWidth={1 * treeScale}
                  />
                  <path
                    d={`M ${tree.x - 8 * treeScale} ${hiveY} Q ${tree.x} ${hiveY + 2 * treeScale} ${tree.x + 8 * treeScale} ${hiveY}`}
                    fill="none"
                    stroke="#F57C00"
                    strokeWidth={1 * treeScale}
                  />
                  <path
                    d={`M ${tree.x - 8 * treeScale} ${hiveY + 5 * treeScale} Q ${tree.x} ${hiveY + 7 * treeScale} ${tree.x + 8 * treeScale} ${hiveY + 5 * treeScale}`}
                    fill="none"
                    stroke="#F57C00"
                    strokeWidth={1 * treeScale}
                  />
                </>
              )}
              
              {isHealthy && level === 2 && (
                <>
                  {/* More detailed patterns for level 2 */}
                  <path
                    d={`M ${tree.x - 12 * treeScale} ${hiveY - 8 * treeScale} Q ${tree.x} ${hiveY - 6 * treeScale} ${tree.x + 12 * treeScale} ${hiveY - 8 * treeScale}`}
                    fill="none"
                    stroke="#F57C00"
                    strokeWidth={1.5 * treeScale}
                  />
                  <path
                    d={`M ${tree.x - 12 * treeScale} ${hiveY - 3 * treeScale} Q ${tree.x} ${hiveY - 1 * treeScale} ${tree.x + 12 * treeScale} ${hiveY - 3 * treeScale}`}
                    fill="none"
                    stroke="#F57C00"
                    strokeWidth={1.5 * treeScale}
                  />
                  <path
                    d={`M ${tree.x - 12 * treeScale} ${hiveY + 2 * treeScale} Q ${tree.x} ${hiveY + 4 * treeScale} ${tree.x + 12 * treeScale} ${hiveY + 2 * treeScale}`}
                    fill="none"
                    stroke="#F57C00"
                    strokeWidth={1.5 * treeScale}
                  />
                  <path
                    d={`M ${tree.x - 12 * treeScale} ${hiveY + 7 * treeScale} Q ${tree.x} ${hiveY + 9 * treeScale} ${tree.x + 12 * treeScale} ${hiveY + 7 * treeScale}`}
                    fill="none"
                    stroke="#F57C00"
                    strokeWidth={1.5 * treeScale}
                  />
                  {/* Hexagon pattern in center */}
                  <polygon
                    points={`${tree.x},${hiveY - 4 * treeScale} ${tree.x + 3 * treeScale},${hiveY - 2 * treeScale} ${tree.x + 3 * treeScale},${hiveY + 2 * treeScale} ${tree.x},${hiveY + 4 * treeScale} ${tree.x - 3 * treeScale},${hiveY + 2 * treeScale} ${tree.x - 3 * treeScale},${hiveY - 2 * treeScale}`}
                    fill="none"
                    stroke="#F57C00"
                    strokeWidth={1 * treeScale}
                  />
                </>
              )}
              
              {/* Health counter - ONLY if damaged or under construction */}
              {!isHealthy && (
                <text
                  x={tree.x}
                  y={hiveY + 23 * treeScale}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#fff"
                  stroke="#000"
                  strokeWidth={3 * treeScale}
                  paintOrder="stroke"
                  fontSize={14 * treeScale}
                  fontWeight="bold"
                >
                  {health}/{maxHealth}
                </text>
              )}
            </g>
          );
        })}
        
        {/* Building progress indicator for hives under construction */}
        {tree.buildingProgress && tree.buildingProgress[0] > 0 && tree.hiveCount === 0 && (
          <g key="building-new-hive">
            {/* Ghost hive being built */}
            <ellipse
              cx={tree.x}
              cy={tree.y - 10 * treeScale}
              rx={14 * treeScale}
              ry={18 * treeScale}
              fill={getHiveColor()}
              stroke="#F57C00"
              strokeWidth={2 * treeScale}
              strokeDasharray={`${3 * treeScale},${3 * treeScale}`}
              opacity={0.4}
            />
            
            {/* Progress counter */}
            <text
              x={tree.x}
              y={tree.y - 10 * treeScale}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#fff"
              stroke="#000"
              strokeWidth={3 * treeScale}
              paintOrder="stroke"
              fontSize={14 * treeScale}
              fontWeight="bold"
            >
              {tree.buildingProgress[0]}/5
            </text>
          </g>
        )}
        
        {/* Upgrading progress indicator for LEVEL 1 -> LEVEL 2 */}
        {tree.upgradingProgress && tree.upgradingProgress > 0 && tree.hiveCount === 1 && tree.hiveLevel[0] === 1 && (
          <g key="upgrading-hive">
            {/* Upgrade progress bar above hive */}
            <rect
              x={tree.x - 20 * treeScale}
              y={tree.y - 35 * treeScale}
              width={40 * treeScale}
              height={6 * treeScale}
              fill="#333"
              stroke="#000"
              strokeWidth={1 * treeScale}
              rx={2 * treeScale}
            />
            <rect
              x={tree.x - 20 * treeScale}
              y={tree.y - 35 * treeScale}
              width={(40 * treeScale * tree.upgradingProgress) / 20}
              height={6 * treeScale}
              fill="#FDD835"
              stroke="#F57C00"
              strokeWidth={1 * treeScale}
              rx={2 * treeScale}
            />
            
            {/* Progress counter */}
            <text
              x={tree.x}
              y={tree.y - 43 * treeScale}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#fff"
              stroke="#000"
              strokeWidth={3 * treeScale}
              paintOrder="stroke"
              fontSize={12 * treeScale}
              fontWeight="bold"
            >
              ⬆ {tree.upgradingProgress}/20
            </text>
          </g>
        )}
        
        {/* Bee count indicator for trees with player bees - Haut droite de l'arbre */}
        {playerBeesCount > 0 && (
          <g>
            <circle
              cx={tree.x + 35 * treeScale}
              cy={tree.y - 35 * treeScale}
              r={15 * treeScale}
              fill={isNightMode ? '#7FFF00' : '#FDD835'}
              opacity={0.95}
              stroke={isNightMode ? '#9FFF00' : '#F9A825'}
              strokeWidth={2.5 * treeScale}
              style={isNightMode ? { filter: 'drop-shadow(0 0 4px rgba(127, 255, 0, 0.8))' } : {}}
            />
            <text
              x={tree.x + 35 * treeScale}
              y={tree.y - 35 * treeScale}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={isNightMode ? '#2D5016' : '#F57C00'}
              stroke={isNightMode ? '#000' : '#fff'}
              strokeWidth={1.5 * treeScale}
              paintOrder="stroke"
              fontSize={15 * treeScale}
              fontWeight={isNightMode ? 'normal' : 'bold'}
            >
              {playerBeesCount}
            </text>
          </g>
        )}
        
        {/* Cut progress indicator - health bar that decreases */}
        {!tree.isCut && tree.cutProgress && tree.cutProgress > 0 && (() => {
          const healthRemaining = 10 - tree.cutProgress;
          const healthPercent = healthRemaining / 10;
          // Color: green (10-7), orange (6-4), red (3-0)
          let barColor = '#4CAF50'; // Green
          if (healthRemaining <= 6 && healthRemaining >= 4) {
            barColor = '#FF9800'; // Orange
          } else if (healthRemaining < 4) {
            barColor = '#F44336'; // Red
          }
          
          return (
            <g>
              {/* Background bar (dark) */}
              <rect
                x={tree.x - 20 * treeScale}
                y={tree.y + 40 * treeScale}
                width={40 * treeScale}
                height={6 * treeScale}
                fill="#000"
                opacity={0.3}
                rx={3 * treeScale}
              />
              {/* Health bar (colored based on remaining health) */}
              <rect
                x={tree.x - 20 * treeScale}
                y={tree.y + 40 * treeScale}
                width={healthPercent * 40 * treeScale}
                height={6 * treeScale}
                fill={barColor}
                rx={3 * treeScale}
              />
              {/* Health counter */}
              <text
                x={tree.x}
                y={tree.y + 52 * treeScale}
                textAnchor="middle"
                fill="#fff"
                stroke="#000"
                strokeWidth={2 * treeScale}
                paintOrder="stroke"
                fontSize={8 * treeScale}
                fontWeight="bold"
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

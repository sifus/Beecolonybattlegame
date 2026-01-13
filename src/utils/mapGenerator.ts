import { Tree } from '../types/game';

export interface PondShape {
  x: number;
  y: number;
  width: number;  // En nombre de cases
  height: number; // En nombre de cases
}

export function generateRandomMap(
  cellSize: number, 
  gridRows: number = 7, 
  gridCols: number = 13,
  options?: {
    gameStartRow?: number;
    gameEndRow?: number;
    gameStartCol?: number;
    gameEndCol?: number;
  }
): {
  trees: Tree[];
  ponds: PondShape[];
  grassGrid: Array<{ x: number; y: number; color: string; borderOpacity: number; borderOffset: number }>;
} {
  console.log(`🗺️ Génération de carte: ${gridCols}x${gridRows}, cellSize: ${cellSize}px`, options);
  
  // Par défaut, toute la grille est utilisable
  const gameStartRow = options?.gameStartRow ?? 0;
  const gameEndRow = options?.gameEndRow ?? gridRows - 1;
  const gameStartCol = options?.gameStartCol ?? 0;
  const gameEndCol = options?.gameEndCol ?? gridCols - 1;
  
  const grassColors = [
    'rgb(225, 228, 70)',   // Plus vif et saturé
    'rgb(205, 202, 65)',
    'rgb(222, 218, 72)',
    'rgb(200, 207, 68)',
    'rgb(204, 200, 64)',
    'rgb(202, 209, 68)',
    'rgb(225, 232, 75)',
    'rgb(216, 221, 72)',
    'rgb(203, 221, 68)',
    'rgb(223, 234, 78)',
    'rgb(206, 218, 64)',
    'rgb(202, 198, 68)',
    'rgb(195, 196, 67)'
  ];
  const cols = gridCols;  // Nombre de colonnes dynamique
  const rows = gridRows;  // Nombre de lignes dynamique
  const mapWidth = cols * cellSize;
  const mapHeight = rows * cellSize;
  
  // Generate grass grid with random colors, ensuring no same color adjacency
  const grassGrid: Array<{ x: number; y: number; color: string; borderOpacity: number; borderOffset: number }> = [];
  const colorGrid: string[][] = Array(rows).fill(null).map(() => Array(cols).fill(''));
  
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const x = j * cellSize;
      const y = i * cellSize;
      
      // Get adjacent colors (edge-to-edge) - MUST be different
      // Only check already-defined cells (top and left)
      const adjacentColors = new Set<string>();
      if (i > 0 && colorGrid[i - 1][j]) adjacentColors.add(colorGrid[i - 1][j]); // top
      if (j > 0 && colorGrid[i][j - 1]) adjacentColors.add(colorGrid[i][j - 1]); // left
      
      // Count diagonal occurrences (corner-to-corner) - max 2 of the same color
      // Only check already-defined diagonals
      const diagonalColorCount: { [color: string]: number } = {};
      const diagonals = [
        [i - 1, j - 1], // top-left
        [i - 1, j + 1], // top-right
      ];
      
      for (const [di, dj] of diagonals) {
        if (di >= 0 && di < rows && dj >= 0 && dj < cols && colorGrid[di][dj]) {
          const dColor = colorGrid[di][dj];
          diagonalColorCount[dColor] = (diagonalColorCount[dColor] || 0) + 1;
        }
      }
      
      // Filter out colors that appear 2+ times diagonally
      const tooManyDiagonals = new Set<string>(
        Object.entries(diagonalColorCount)
          .filter(([_, count]) => count >= 2)
          .map(([color]) => color)
      );
      
      // Pick a color that's not adjacent AND doesn't appear 2+ times diagonally
      let availableColors = grassColors.filter(
        c => !adjacentColors.has(c) && !tooManyDiagonals.has(c)
      );
      if (availableColors.length === 0) {
        // Fallback: at least avoid edge adjacency
        availableColors = grassColors.filter(c => !adjacentColors.has(c));
      }
      if (availableColors.length === 0) {
        // Last resort: use all colors
        availableColors = grassColors;
      }
      
      const color = availableColors[Math.floor(Math.random() * availableColors.length)];
      colorGrid[i][j] = color;
      
      // Random border opacity (30-70%) and offset (-0.5 to 0.5 pixels)
      const borderOpacity = 0.3 + Math.random() * 0.4;
      const borderOffset = (Math.random() - 0.5);
      
      grassGrid.push({ x, y, color, borderOpacity, borderOffset });
    }
  }
  
  // Generate ponds adaptativement selon la taille de la ZONE DE JEU
  // Calculer la taille de la zone de jeu
  const gameRows = gameEndRow - gameStartRow + 1;
  const gameCols = gameEndCol - gameStartCol + 1;
  
  // Petite grille (<= 8 cols ou <= 5 rows) : 0-1 étang
  // Grande grille : 1-2 étangs
  const isSmallGrid = gameCols <= 8 || gameRows <= 5;
  const numPonds = isSmallGrid ? Math.floor(Math.random() * 2) : Math.floor(Math.random() * 2) + 1;
  const ponds: PondShape[] = [];
  const occupiedCells = new Set<string>(); // Track cells occupied by ponds AND their safety margin
  
  for (let p = 0; p < numPonds; p++) {
    let attempts = 0;
    let placed = false;
    
    while (attempts < 50 && !placed) {
      // Random pond width: adaptatif selon la taille de la grille
      const maxPondWidth = isSmallGrid ? 2 : 3; // Plus petits étangs sur petites grilles
      const pondWidth = Math.floor(Math.random() * maxPondWidth) + 1;
      const pondHeight = 1; // Always 1 cell high
      
      // Skip si la zone de jeu est trop petite pour cet étang
      if (gameCols - pondWidth - 2 <= 0 || gameRows - pondHeight - 2 <= 0) {
        break;
      }
      
      // Random position DANS LA ZONE DE JEU (leaving 1 cell margin on edges of game area)
      const gridX = gameStartCol + Math.floor(Math.random() * (gameCols - pondWidth - 2)) + 1;
      const gridY = gameStartRow + Math.floor(Math.random() * (gameRows - pondHeight - 2)) + 1;
      
      // Check if cells are available (including safety margin)
      // Sur petites grilles : pas de marge de sécurité (juste les cellules de l'étang)
      // Sur grandes grilles : marge de 1 cellule autour
      const margin = isSmallGrid ? 0 : 1;
      let canPlace = true;
      for (let dy = -margin; dy <= pondHeight - 1 + margin; dy++) {
        for (let dx = -margin; dx <= pondWidth - 1 + margin; dx++) {
          const cellKey = `${gridX + dx},${gridY + dy}`;
          if (occupiedCells.has(cellKey)) {
            canPlace = false;
            break;
          }
        }
        if (!canPlace) break;
      }
      
      if (canPlace) {
        // Mark cells as occupied (pond cells + safety margin if large grid)
        for (let dy = -margin; dy <= pondHeight - 1 + margin; dy++) {
          for (let dx = -margin; dx <= pondWidth - 1 + margin; dx++) {
            occupiedCells.add(`${gridX + dx},${gridY + dy}`);
          }
        }
        
        ponds.push({
          x: gridX * cellSize,
          y: gridY * cellSize,
          width: pondWidth,
          height: pondHeight,
        });
        placed = true;
      }
      
      attempts++;
    }
  }
  
  console.log(`🌊 Étangs générés: ${ponds.length}, Cellules occupées par étangs+marges: ${occupiedCells.size}/${cols * rows}`);
  
  // Generate trees on grid cells
  const trees: Tree[] = [];
  // Distance minimale entre arbres : toujours au moins 2 cellules pour éviter qu'ils soient côte à côte
  const minDistanceCells = 2;
  const treesOccupiedCells = new Set<string>(); // Track cells with trees
  
  const numPlayerTrees = 1;
  const numEnemyTrees = 1;
  // Adaptatif : moins d'arbres neutres sur les petites grilles
  // Utiliser la taille de la ZONE DE JEU, pas la grille totale
  const totalCells = gameCols * gameRows;
  const isVerySmallGrid = totalCells <= 40; // 8x5=40 ou moins
  let numNeutralTrees: number;
  if (totalCells <= 20) {
    // Très très petite grille (ex: 5x4=20 ou moins) : 0-1 arbre neutre seulement
    numNeutralTrees = Math.floor(Math.random() * 2);
  } else if (isVerySmallGrid) {
    // Très petite grille (21-40 cellules, ex: 8x5=40) : 1-2 arbres neutres
    numNeutralTrees = Math.floor(Math.random() * 2) + 1;
  } else if (totalCells < 60) {
    // Moyenne grille : 2-3 arbres neutres
    numNeutralTrees = Math.floor(Math.random() * 2) + 2;
  } else {
    // Grande grille : 2-5 arbres neutres
    numNeutralTrees = Math.floor(Math.random() * 4) + 2;
  }
  
  console.log(`🌳 Placement arbres: 1 joueur + 1 ennemi + ${numNeutralTrees} neutres (zone jeu ${gameCols}x${gameRows}=${totalCells} cellules, verySmall=${isVerySmallGrid})`);
  
  function isValidTreeCell(gridX: number, gridY: number): boolean {
    // ZONE DE JEU : L'arbre DOIT être dans la zone de jeu (pas dans la bordure)
    if (gridX < gameStartCol || gridX > gameEndCol || gridY < gameStartRow || gridY > gameEndRow) return false;
    
    // SAFE ZONES : Laisser une marge de 1 cellule à l'intérieur de la zone de jeu
    if (gridX <= gameStartCol || gridX >= gameEndCol || gridY <= gameStartRow || gridY >= gameEndRow) return false;
    
    // ZONE D'EXCLUSION : Éviter les arbres près des boutons UI (coins haut de la zone de jeu)
    // Sur très petites grilles (8x5 ou moins), réduire au minimum
    const uiMarginCols = isVerySmallGrid ? 1 : (isSmallGrid ? 1 : 2);
    const uiMarginRows = isVerySmallGrid ? 0 : (isSmallGrid ? 1 : 2);
    
    // Relatif à la zone de jeu
    const relX = gridX - gameStartCol;
    const relY = gridY - gameStartRow;
    
    // Haut-gauche de la zone de jeu
    if (relX <= uiMarginCols && relY <= uiMarginRows) return false;
    // Haut-droite de la zone de jeu
    if (relX >= gameCols - uiMarginCols - 1 && relY <= uiMarginRows) return false;
    
    // RÈGLE STRICTE : Un arbre ne peut JAMAIS être sur un carré étang OU adjacent à un étang
    // occupiedCells contient les cases d'étang + une marge de sécurité d'1 case autour
    const cellKey = `${gridX},${gridY}`;
    if (occupiedCells.has(cellKey)) {
      return false; // Carré occupé par un étang ou dans sa zone de sécurité
    }
    
    // Check if there's already a tree on this exact cell
    if (treesOccupiedCells.has(cellKey)) return false;
    
    // NOUVELLE RÈGLE : Pas d'arbre si la cellule au-dessus a déjà un arbre
    // Mais seulement sur les grilles moyennes/grandes pour éviter trop de contraintes
    if (!isVerySmallGrid) {
      const cellAboveKey = `${gridX},${gridY - 1}`;
      if (treesOccupiedCells.has(cellAboveKey)) return false;
    }
    
    // Check minimum distance from other trees (Chebyshev distance - distance en cases)
    for (const tree of trees) {
      // Calculate grid position from tree position (tree.x/y = grid * cellSize + offset)
      const treeGridX = Math.floor(tree.x / cellSize);
      const treeGridY = Math.floor(tree.y / cellSize);
      const distX = Math.abs(treeGridX - gridX);
      const distY = Math.abs(treeGridY - gridY);
      // Les deux distances doivent être >= minDistanceCells (distance de Chebyshev)
      const maxDist = Math.max(distX, distY);
      if (maxDist < minDistanceCells) return false;
    }
    
    return true;
  }
  
  function generateTreePosition(preferLeft?: boolean, preferRight?: boolean): { x: number; y: number } {
    let attempts = 0;
    while (attempts < 200) { // 200 tentatives suffisent avec distance minimale réduite
      let gridX: number;
      let gridY: number;
      
      // Toujours garder les marges de safe zone (1 cellule minimum)
      gridY = Math.floor(Math.random() * (rows - 2)) + 1;
      if (preferLeft) {
        gridX = Math.floor(Math.random() * Math.floor(cols / 2 - 1)) + 1;
      } else if (preferRight) {
        gridX = Math.floor(Math.random() * Math.floor(cols / 2 - 1)) + Math.ceil(cols / 2);
      } else {
        gridX = Math.floor(Math.random() * (cols - 2)) + 1;
      }
      
      if (isValidTreeCell(gridX, gridY)) {
        // Mark cell as occupied by tree
        treesOccupiedCells.add(`${gridX},${gridY}`);
        // Tree centered in its grid cell (same as grass grid rendering)
        return { 
          x: gridX * cellSize + cellSize / 2, 
          y: gridY * cellSize + cellSize * 0.2
        };
      }
      attempts++;
    }
    
    // Fallback: cherche une cellule libre en balayant toute la grille
    // Toujours avec safe zones (1 cellule minimum de marge)
    const startY = 1;
    const endY = rows - 1;
    const startX = 1;
    const endX = cols - 1;
    
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const cellKey = `${x},${y}`;
        const cellAboveKey = `${x},${y - 1}`; // Cellule au-dessus
        
        // PRIORITÉ 1: Chercher d'abord une cellule sans arbre au-dessus (idéal)
        if (!occupiedCells.has(cellKey) && 
            !treesOccupiedCells.has(cellKey) && 
            !treesOccupiedCells.has(cellAboveKey)) {
          treesOccupiedCells.add(cellKey);
          
          return { 
            x: x * cellSize + cellSize / 2, 
            y: y * cellSize + cellSize * 0.2
          };
        }
      }
    }
    
    // PRIORITÉ 2: Si aucune cellule "idéale" trouvée, accepter une cellule même avec arbre au-dessus (fallback)
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const cellKey = `${x},${y}`;
        
        // Vérifie si la cellule n'est PAS occupée par un étang ou un arbre
        if (!occupiedCells.has(cellKey) && !treesOccupiedCells.has(cellKey)) {
          treesOccupiedCells.add(cellKey);
          
          return { 
            x: x * cellSize + cellSize / 2, 
            y: y * cellSize + cellSize * 0.2
          };
        }
      }
    }
    
    // Si vraiment aucune cellule n'est disponible (très improbable)
    console.error(`❌ ERREUR CRITIQUE: Aucune cellule libre trouvée sur toute la grille!
      Grille: ${cols}x${rows} (${totalCells} cellules)
      Étangs: ${ponds.length}, Arbres déjà placés: ${trees.length}
      Cellules occupées (étangs): ${occupiedCells.size}
      Cellules occupées (arbres): ${treesOccupiedCells.size}`);
    
    const centerGridX = Math.floor(cols / 2);
    const centerGridY = Math.floor(rows / 2);
    
    return { 
      x: centerGridX * cellSize + cellSize / 2, 
      y: centerGridY * cellSize + cellSize * 0.2
    };
  }
  
  // Generate player tree (left side) - always 1 with 1 hive (level 1 = 7 HP) - Starting tree cannot be upgraded
  // Commence sans abeilles pour un démarrage équitable
  const playerPos = generateTreePosition(true, false);
  trees.push({
    id: `t-player-0`,
    x: playerPos.x,
    y: playerPos.y,
    owner: 'player',
    hiveCount: 1,
    maxHives: 1,
    beeCount: 0, // Commence sans abeilles
    hiveHealth: [7],
    hiveLevel: [1],
    isStartingTree: true,
  });
  
  // Generate enemy tree (right side) - always 1 with 1 hive (level 1 = 7 HP) - Starting tree cannot be upgraded
  // Commence sans abeilles pour un démarrage équitable
  const enemyPos = generateTreePosition(false, true);
  trees.push({
    id: `t-enemy-0`,
    x: enemyPos.x,
    y: enemyPos.y,
    owner: 'enemy',
    hiveCount: 1,
    maxHives: 1,
    beeCount: 0, // Commence sans abeilles
    hiveHealth: [7],
    hiveLevel: [1],
    isStartingTree: true,
  });
  
  // Generate neutral trees - can have 1 hive that can be upgraded to level 2
  for (let i = 0; i < numNeutralTrees; i++) {
    const pos = generateTreePosition();
    trees.push({
      id: `t-neutral-${i}`,
      x: pos.x,
      y: pos.y,
      owner: 'neutral',
      hiveCount: 0,
      maxHives: 1,
      beeCount: 0, // Les arbres neutres n'ont pas d'abeilles au départ
      hiveHealth: [],
      hiveLevel: [],
      isStartingTree: false,
    });
  }
  
  console.log(`✅ Carte générée: ${trees.length} arbres, ${ponds.length} étangs sur grille ${cols}x${rows}`);
  return { trees, ponds, grassGrid };
}

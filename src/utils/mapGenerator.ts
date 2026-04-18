import { Tree } from '../types/game';
import { generateGrassGrid } from './grassGenerator';
import { QUICK_PLAY_RULES } from '../constants/quickPlayRules';
import { treeX, treeY } from './gridUtils';
import { GRID_COLS, GRID_ROWS } from '../constants/gameRules';

export interface PondShape {
  x: number;
  y: number;
  width: number;  // En nombre de cases
  height: number; // En nombre de cases
}

export function generateRandomMap(
  cellSize: number, 
  gridRows: number = GRID_ROWS,
  gridCols: number = GRID_COLS,
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
  // Par défaut, toute la grille est utilisable
  const gameStartRow = options?.gameStartRow ?? 0;
  const gameEndRow = options?.gameEndRow ?? gridRows - 1;
  const gameStartCol = options?.gameStartCol ?? 0;
  const gameEndCol = options?.gameEndCol ?? gridCols - 1;
  
  const cols = gridCols;
  const rows = gridRows;
  const mapWidth = cols * cellSize;
  const mapHeight = rows * cellSize;

  const grassGrid = generateGrassGrid(rows, cols, cellSize);
  
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
      
      // Marge de sécurité de 2 cellules autour de chaque étang :
      // garantit que les arbres (et leurs abeilles en orbite ~46px max) ne touchent jamais l'eau
      const margin = 2;
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
        // Marquer les cellules étang + marge de 2
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
  
  // Generate trees on grid cells
  const trees: Tree[] = [];
  // Distance minimale entre arbres : 2 cellules en Chebyshev → pas d'adjacence orthogonale ni diagonale
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
  
  function isValidTreeCell(gridX: number, gridY: number): boolean {
    // ZONE DE JEU : l'arbre doit être dans la zone jouable (pas dans la bordure écran)
    if (gridX < gameStartCol || gridX > gameEndCol || gridY < gameStartRow || gridY > gameEndRow) return false;

    // ZONE ÉTANG : occupiedCells contient toutes les cellules étang + marge 2
    const cellKey = `${gridX},${gridY}`;
    if (occupiedCells.has(cellKey)) return false;

    // Cellule déjà prise par un autre arbre
    if (treesOccupiedCells.has(cellKey)) return false;

    // Chebyshev ≥ 2 : garantit exactement 1 carré libre autour de chaque arbre
    // (les cellules bord comptent comme libres — règle explicite)
    for (const tree of trees) {
      const tgx = Math.floor(tree.x / cellSize);
      const tgy = Math.floor(tree.y / cellSize);
      if (Math.max(Math.abs(tgx - gridX), Math.abs(tgy - gridY)) < minDistanceCells) return false;
    }

    return true;
  }
  
  function generateTreePosition(preferLeft?: boolean, preferRight?: boolean): { x: number; y: number } {
    let attempts = 0;
    while (attempts < 200) { // 200 tentatives suffisent avec distance minimale réduite
      let gridX: number;
      let gridY: number;
      
      // Zone jouable complète (gameStartCol..gameEndCol, gameStartRow..gameEndRow)
      gridY = Math.floor(Math.random() * (gameEndRow - gameStartRow + 1)) + gameStartRow;
      const halfCols = Math.floor(gameCols / 2);
      if (preferLeft) {
        gridX = Math.floor(Math.random() * halfCols) + gameStartCol;
      } else if (preferRight) {
        gridX = Math.floor(Math.random() * (gameCols - halfCols)) + gameStartCol + halfCols;
      } else {
        gridX = Math.floor(Math.random() * gameCols) + gameStartCol;
      }
      
      if (isValidTreeCell(gridX, gridY)) {
        // Mark cell as occupied by tree
        treesOccupiedCells.add(`${gridX},${gridY}`);
        // Tree centered in its grid cell (same as grass grid rendering)
        return {
          x: treeX(gridX, cellSize),
          y: treeY(gridY, cellSize)
        };
      }
      attempts++;
    }
    
    // Fallback: scanner toute la zone jouable en respectant isValidTreeCell (distance min incluse)
    for (let y = gameStartRow; y <= gameEndRow; y++) {
      for (let x = gameStartCol; x <= gameEndCol; x++) {
        if (isValidTreeCell(x, y)) {
          treesOccupiedCells.add(`${x},${y}`);
          return { x: treeX(x, cellSize), y: treeY(y, cellSize) };
        }
      }
    }

    // Dernier recours : scan zone jouable en relâchant les contraintes DOUCES (UI coins, preferLeft/Right)
    // mais en gardant TOUJOURS : zone jouable + zones étang + distance Chebyshev entre arbres
    for (let y = gameStartRow; y <= gameEndRow; y++) {
      for (let x = gameStartCol; x <= gameEndCol; x++) {
        const cellKey = `${x},${y}`;
        if (occupiedCells.has(cellKey)) continue;
        if (treesOccupiedCells.has(cellKey)) continue;
        // Chebyshev distance : contrainte DURE, jamais relâchée
        let tooClose = false;
        for (const tree of trees) {
          const tgx = Math.floor(tree.x / cellSize);
          const tgy = Math.floor(tree.y / cellSize);
          if (Math.max(Math.abs(tgx - x), Math.abs(tgy - y)) < minDistanceCells) { tooClose = true; break; }
        }
        if (tooClose) continue;
        treesOccupiedCells.add(cellKey);
        return { x: treeX(x, cellSize), y: treeY(y, cellSize) };
      }
    }

    // Ultime recours absolu : zone jouable, hors étang, même si adjacent à un autre arbre
    for (let y = gameStartRow; y <= gameEndRow; y++) {
      for (let x = gameStartCol; x <= gameEndCol; x++) {
        const ck = `${x},${y}`;
        if (!occupiedCells.has(ck) && !treesOccupiedCells.has(ck)) {
          treesOccupiedCells.add(ck);
          return { x: treeX(x, cellSize), y: treeY(y, cellSize) };
        }
      }
    }
    // Vraiment aucune cellule libre du tout (situation impossible en pratique)
    const cx = gameStartCol + Math.floor(gameCols / 2);
    const cy = gameStartRow + Math.floor(gameRows / 2);
    return { x: treeX(cx, cellSize), y: treeY(cy, cellSize) };
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
  
  // Assigner maxHives: 2 à certains arbres neutres (groupes d'arbres)
  const neutralTrees = trees.filter(t => t.owner === 'neutral');
  const targetGroups = Math.min(
    QUICK_PLAY_RULES.MAX_GROUP_TREES,
    Math.max(
      QUICK_PLAY_RULES.MIN_GROUP_TREES,
      Math.round(neutralTrees.length * QUICK_PLAY_RULES.GROUP_TREE_RATIO)
    )
  );
  const shuffledNeutral = [...neutralTrees].sort(() => Math.random() - 0.5);
  for (let i = 0; i < Math.min(targetGroups, shuffledNeutral.length); i++) {
    shuffledNeutral[i].maxHives = 2;
  }

  return { trees, ponds, grassGrid };
}

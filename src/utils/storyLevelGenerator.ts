import { Tree } from '../types/game';
import { SubLevelType } from '../types/levels';
import { generateGrassGrid } from './grassGenerator';
import { treeX, treeY } from './gridUtils';

interface LevelConfig {
  trees: Omit<Tree, 'id'>[];
  ponds: Array<{ x: number; y: number; width: number; height: number }>;
  grassGrid: Array<{ x: number; y: number; color: string; borderOpacity: number; borderOffset: number }>;
  gridSize: { cols: number; rows: number; cellSize: number };
}

/**
 * Génère la configuration d'un sous-niveau du tutoriel
 *
 * Position d'un arbre dans son carré (constante partagée avec mapGenerator.ts) :
 *   x = col * cellSize + cellSize / 2
 *   y = row * cellSize + cellSize * 0.2
 */
export function generateStoryLevel(
  levelId: number,
  subLevelIndex: number,
  subLevelType: SubLevelType,
  cellSize: number,
  rows: number,
  cols: number,
  options?: {
    gameStartRow?: number;
    gameEndRow?: number;
    gameStartCol?: number;
    gameEndCol?: number;
  }
): LevelConfig {
  // Par défaut, toute la grille est utilisable
  const gameStartRow = options?.gameStartRow ?? 0;
  const gameEndRow = options?.gameEndRow ?? rows - 1;
  const gameStartCol = options?.gameStartCol ?? 0;
  const gameEndCol = options?.gameEndCol ?? cols - 1;
  const gameRows = gameEndRow - gameStartRow + 1;
  const gameCols = gameEndCol - gameStartCol + 1;
  const grassGrid = generateGrassGrid(rows, cols, cellSize);


  const config: LevelConfig = {
    trees: [],
    ponds: [],
    grassGrid,
    gridSize: { cols, rows, cellSize },
  };

  // Level 1-1: Movement tutorial (déplacement)
  if (levelId === 1 && subLevelIndex === 0) {
    const centerY = gameStartRow + Math.floor(gameRows / 2);
    const safeRow = Math.max(centerY, gameStartRow + 3);
    const centerCol = gameStartCol + Math.floor(gameCols / 2);
    config.trees.push({
      x: treeX(centerCol - 2, cellSize),
      y: treeY(safeRow, cellSize),
      owner: 'player',
      hiveCount: 1,
      maxHives: 1,
      beeCount: 0,
      hiveHealth: [7],
      hiveLevel: [1],
      buildingProgress: [],
      upgradingProgress: 0,
      isStartingTree: true,
    });

    config.trees.push({
      x: treeX(centerCol + 2, cellSize),
      y: treeY(safeRow, cellSize),
      owner: 'neutral',
      hiveCount: 0,
      maxHives: 1,
      beeCount: 0,
      hiveHealth: [],
      hiveLevel: [],
      buildingProgress: [],
      upgradingProgress: 0,
    });
  }

  // Level 1-2: Build hive tutorial (construction)
  else if (levelId === 1 && subLevelIndex === 1) {
    const centerY = gameStartRow + Math.floor(gameRows / 2);
    const safeRow = Math.max(centerY, gameStartRow + 3);
    config.trees.push({
      x: treeX(gameStartCol + 2, cellSize),
      y: treeY(safeRow, cellSize),
      owner: 'player',
      hiveCount: 1,
      maxHives: 1,
      beeCount: 10,
      hiveHealth: [7],
      hiveLevel: [1],
      buildingProgress: [],
      upgradingProgress: 0,
      isStartingTree: true,
    });

    // Arbres neutres pour construire (répartis dans la zone de jeu)
    const spacing = Math.floor(gameCols / 4);
    for (let i = 0; i < 3; i++) {
      const offsetY = i % 2 === 0 ? -1 : 1;
      const treeRow = Math.max(Math.min(safeRow + offsetY, gameEndRow - 1), gameStartRow + 3);
      config.trees.push({
        x: treeX(gameStartCol + 4 + i * spacing, cellSize),
        y: treeY(treeRow, cellSize),
        owner: 'neutral',
        hiveCount: 0,
        maxHives: 1,
        beeCount: 0,
        hiveHealth: [],
        hiveLevel: [],
        buildingProgress: [],
        upgradingProgress: 0,
      });
    }
  }

  // Level 1-3: Upgrade hive tutorial (amélioration)
  else if (levelId === 1 && subLevelIndex === 2) {
    const centerY = gameStartRow + Math.floor(gameRows / 2);
    const safeRow = Math.max(centerY, gameStartRow + 3);
    config.trees.push({
      x: treeX(gameStartCol + 2, cellSize),
      y: treeY(safeRow, cellSize),
      owner: 'player',
      hiveCount: 1,
      maxHives: 1,
      beeCount: 20,
      hiveHealth: [7],
      hiveLevel: [1],
      buildingProgress: [],
      upgradingProgress: 0,
      isStartingTree: true,
    });

    // Groupe d'arbres neutre proche (maxHives: 2 pour permettre la 2ème ruche)
    config.trees.push({
      x: treeX(gameStartCol + 6, cellSize),
      y: treeY(safeRow, cellSize),
      owner: 'neutral',
      hiveCount: 0,
      maxHives: 2,
      beeCount: 0,
      hiveHealth: [],
      hiveLevel: [],
      buildingProgress: [],
      upgradingProgress: 0,
    });
  }

  // Level 1-4: Dangers tutorial (étangs)
  else if (levelId === 1 && subLevelIndex === 3) {
    const centerY = gameStartRow + Math.floor(gameRows / 2);
    const safeRow = Math.max(centerY, gameStartRow + 3);
    config.trees.push({
      x: treeX(gameStartCol + 2, cellSize),
      y: treeY(safeRow, cellSize),
      owner: 'player',
      hiveCount: 1,
      maxHives: 1,
      beeCount: 15,
      hiveHealth: [7],
      hiveLevel: [1],
      buildingProgress: [],
      upgradingProgress: 0,
      isStartingTree: true,
    });

    // Arbre cible de l'autre côté de l'étang
    config.trees.push({
      x: treeX(gameEndCol - 3, cellSize),
      y: treeY(safeRow, cellSize),
      owner: 'neutral',
      hiveCount: 0,
      maxHives: 1,
      beeCount: 0,
      hiveHealth: [],
      hiveLevel: [],
      buildingProgress: [],
      upgradingProgress: 0,
    });

    // Étang au milieu (centré dans la zone de jeu)
    const centerCol = gameStartCol + Math.floor(gameCols / 2);
    config.ponds.push({
      x: cellSize * (centerCol - 1.5),
      y: cellSize * (safeRow - 0.5),
      width: 3,
      height: 2,
    });
  }

  // Level 1-5: First battle tutorial (premier combat)
  else if (levelId === 1 && subLevelIndex === 4) {
    const centerY = gameStartRow + Math.floor(gameRows / 2);
    const safeRow = Math.max(centerY, gameStartRow + 3);
    config.trees.push({
      x: treeX(gameStartCol + 2, cellSize),
      y: treeY(safeRow, cellSize),
      owner: 'player',
      hiveCount: 1,
      maxHives: 1,
      beeCount: 0,
      hiveHealth: [7],
      hiveLevel: [1],
      buildingProgress: [],
      upgradingProgress: 0,
      isStartingTree: true,
    });

    // Un seul arbre neutre au milieu (tutoriel simplifié)
    const centerCol = gameStartCol + Math.floor(gameCols / 2);
    config.trees.push({
      x: treeX(centerCol, cellSize),
      y: treeY(safeRow, cellSize),
      owner: 'neutral',
      hiveCount: 0,
      maxHives: 1,
      beeCount: 0,
      hiveHealth: [],
      hiveLevel: [],
      buildingProgress: [],
      upgradingProgress: 0,
    });

    // Arbre ennemi (faible mais un peu actif)
    config.trees.push({
      x: treeX(gameEndCol - 3, cellSize),
      y: treeY(safeRow, cellSize),
      owner: 'enemy',
      hiveCount: 1,
      maxHives: 1,
      beeCount: 0,
      hiveHealth: [7],
      hiveLevel: [1],
      buildingProgress: [],
      upgradingProgress: 0,
      isStartingTree: true,
    });
  }

  return config;
}

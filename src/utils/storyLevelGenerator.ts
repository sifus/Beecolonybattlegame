import { Tree } from '../types/game';
import { SubLevelType } from '../types/levels';

interface LevelConfig {
  trees: Omit<Tree, 'id'>[];
  ponds: Array<{ x: number; y: number; width: number; height: number }>;
  grassGrid: Array<{ x: number; y: number; color: string; borderOpacity: number; borderOffset: number }>;
  gridSize: { cols: number; rows: number; cellSize: number };
}

/**
 * Génère la configuration d'un sous-niveau du tutoriel
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
  // Générer la grille d'herbe (identique au générateur de carte aléatoire)
  const grassColors = [
    'rgb(225, 228, 70)',
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

  const grassGrid: Array<{ x: number; y: number; color: string; borderOpacity: number; borderOffset: number }> = [];
  const colorGrid: string[][] = Array(rows).fill(null).map(() => Array(cols).fill(''));
  
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const x = j * cellSize;
      const y = i * cellSize;
      
      const adjacentColors = new Set<string>();
      if (i > 0 && colorGrid[i - 1][j]) adjacentColors.add(colorGrid[i - 1][j]);
      if (j > 0 && colorGrid[i][j - 1]) adjacentColors.add(colorGrid[i][j - 1]);
      
      const diagonalColorCount: { [color: string]: number } = {};
      const diagonals = [[i - 1, j - 1], [i - 1, j + 1]];
      
      for (const [di, dj] of diagonals) {
        if (di >= 0 && di < rows && dj >= 0 && dj < cols && colorGrid[di][dj]) {
          const color = colorGrid[di][dj];
          diagonalColorCount[color] = (diagonalColorCount[color] || 0) + 1;
        }
      }
      
      let availableColors = grassColors.filter(c => !adjacentColors.has(c));
      availableColors = availableColors.filter(c => (diagonalColorCount[c] || 0) < 2);
      
      if (availableColors.length === 0) {
        availableColors = grassColors.filter(c => !adjacentColors.has(c));
      }
      if (availableColors.length === 0) {
        availableColors = grassColors;
      }
      
      const color = availableColors[Math.floor(Math.random() * availableColors.length)];
      colorGrid[i][j] = color;
      
      const borderOpacity = Math.random() < 0.3 ? 0.2 : 0;
      const borderOffset = Math.random() < 0.5 ? 0 : cellSize * 0.5;
      
      grassGrid.push({ x, y, color, borderOpacity, borderOffset });
    }
  }

  const config: LevelConfig = {
    trees: [],
    ponds: [],
    grassGrid,
    gridSize: { cols, rows, cellSize },
  };

  // Level 1-1: Movement tutorial (déplacement)
  if (levelId === 1 && subLevelIndex === 0) {
    // Arbre de départ du joueur (gauche de la zone de jeu, centré verticalement)
    const centerY = gameStartRow + Math.floor(gameRows / 2);
    const safeY = Math.max(centerY, gameStartRow + 3); // Au moins 3 cellules depuis le début
    config.trees.push({
      x: cellSize * (gameStartCol + 1.5),
      y: cellSize * safeY,
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

    // Un seul arbre neutre cible (à droite de la zone de jeu, centré verticalement)
    config.trees.push({
      x: cellSize * (gameEndCol - 0.5),
      y: cellSize * safeY,
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
    // Arbre de départ avec plus d'abeilles
    const centerY = gameStartRow + Math.floor(gameRows / 2);
    const safeY = Math.max(centerY, gameStartRow + 3);
    config.trees.push({
      x: cellSize * (gameStartCol + 2.5),
      y: cellSize * safeY,
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

    // Arbres neutres pour construire (répartis dans la zone de jeu)
    const spacing = Math.floor(gameCols / 4);
    for (let i = 0; i < 3; i++) {
      const offsetY = i % 2 === 0 ? -1 : 1;
      const treeY = Math.max(Math.min(safeY + offsetY, gameEndRow - 1), gameStartRow + 3);
      config.trees.push({
        x: cellSize * (gameStartCol + 4 + i * spacing),
        y: cellSize * treeY,
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
    // Arbre de départ
    const centerY = gameStartRow + Math.floor(gameRows / 2);
    const safeY = Math.max(centerY, gameStartRow + 3);
    config.trees.push({
      x: cellSize * (gameStartCol + 2.5),
      y: cellSize * safeY,
      owner: 'player',
      hiveCount: 1,
      maxHives: 1,
      beeCount: 30,
      hiveHealth: [7],
      hiveLevel: [1],
      buildingProgress: [],
      upgradingProgress: 0,
      isStartingTree: true,
    });

    // Arbre neutre proche
    config.trees.push({
      x: cellSize * (gameStartCol + 6),
      y: cellSize * safeY,
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

  // Level 1-4: Dangers tutorial (étangs)
  else if (levelId === 1 && subLevelIndex === 3) {
    // Arbre de départ
    const centerY = gameStartRow + Math.floor(gameRows / 2);
    const safeY = Math.max(centerY, gameStartRow + 3);
    config.trees.push({
      x: cellSize * (gameStartCol + 2.5),
      y: cellSize * safeY,
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

    // Arbre cible de l'autre côté de l'étang
    config.trees.push({
      x: cellSize * (gameEndCol - 3),
      y: cellSize * safeY,
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
      y: cellSize * (safeY - 0.5),
      width: 3,
      height: 2,
    });
  }

  // Level 1-5: First battle tutorial (premier combat)
  else if (levelId === 1 && subLevelIndex === 4) {
    // Arbre de départ du joueur
    const centerY = gameStartRow + Math.floor(gameRows / 2);
    const safeY = Math.max(centerY, gameStartRow + 3);
    config.trees.push({
      x: cellSize * (gameStartCol + 2.5),
      y: cellSize * safeY,
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

    // Un seul arbre neutre au milieu (tutoriel simplifié)
    const centerCol = gameStartCol + Math.floor(gameCols / 2);
    config.trees.push({
      x: cellSize * centerCol,
      y: cellSize * safeY,
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
      x: cellSize * (gameEndCol - 3),
      y: cellSize * safeY,
      owner: 'enemy',
      hiveCount: 1,
      maxHives: 1,
      beeCount: 8, // Augmenté pour être un peu actif
      hiveHealth: [7], // Santé normale
      hiveLevel: [1],
      buildingProgress: [],
      upgradingProgress: 0,
      isStartingTree: true,
    });
  }

  return config;
}

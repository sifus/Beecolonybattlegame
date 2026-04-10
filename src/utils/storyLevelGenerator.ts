import { Tree } from '../types/game';
import { SubLevelType } from '../types/levels';
import { generateGrassGrid } from './grassGenerator';

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
  const grassGrid = generateGrassGrid(rows, cols, cellSize);

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

    // Groupe d'arbres neutre proche (maxHives: 2 pour permettre la 2ème ruche)
    config.trees.push({
      x: cellSize * (gameStartCol + 6),
      y: cellSize * safeY,
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

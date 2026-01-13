import { Tree } from '../types/game';
import { PondShape } from './mapGenerator';

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

export interface LevelData {
  trees: Tree[];
  ponds: PondShape[];
  grassGrid: Array<{ x: number; y: number; color: string; borderOpacity: number; borderOffset: number }>;
  description: string;
}

// ========== NIVEAU 1 : FACILE - Carte Symétrique ==========
export function generateLevel1(cellSize: number): LevelData {
  const cols = 13;
  const rows = 8;
  const mapWidth = cols * cellSize;
  const mapHeight = rows * cellSize;

  // Generate grass grid
  const grassGrid: Array<{ x: number; y: number; color: string }> = [];
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

  // NIVEAU 1 : Carte symétrique, pas d'étangs pour simplifier
  const ponds: PondShape[] = [];

  // NIVEAU 1 : 4 arbres en configuration symétrique
  // - 1 arbre gauche (joueur) 
  // - 1 arbre droite (ennemi)
  // - 2 arbres au milieu (neutres)
  
  const trees: Tree[] = [];
  
  // Arbre de départ du joueur (gauche, milieu vertical)
  const playerTreeX = 2 * cellSize + cellSize / 2; // Colonne 2
  const playerTreeY = 4 * cellSize + cellSize / 2; // Ligne 4 (milieu)
  
  trees.push({
    id: 'player-start',
    x: playerTreeX,
    y: playerTreeY,
    owner: 'player',
    hiveHealth: [7], // Commence avec une ruche niveau 1 (7 HP)
    hiveLevel: [1],
    hiveCount: 1,
    beeCount: 0, // Commence avec 0 abeilles pour un départ équitable
    buildingProgress: [],
    upgradingProgress: 0,
    isStartingTree: true, // Arbre de départ = ne peut pas être amélioré
    isCut: false,
    cutProgress: 0,
  });

  // Arbre de départ de l'ennemi (droite, milieu vertical - SYMÉTRIQUE)
  const enemyTreeX = 10 * cellSize + cellSize / 2; // Colonne 10 (symétrique à 2)
  const enemyTreeY = 4 * cellSize + cellSize / 2; // Ligne 4 (même hauteur)
  
  trees.push({
    id: 'enemy-start',
    x: enemyTreeX,
    y: enemyTreeY,
    owner: 'enemy',
    hiveHealth: [7], // Commence avec une ruche niveau 1 (7 HP)
    hiveLevel: [1],
    hiveCount: 1,
    beeCount: 0, // Commence avec 0 abeilles pour un départ équitable
    buildingProgress: [],
    upgradingProgress: 0,
    isStartingTree: true, // Arbre de départ = ne peut pas être amélioré
    isCut: false,
    cutProgress: 0,
  });

  // Arbre neutre du haut (milieu-gauche)
  const neutralTree1X = 5 * cellSize + cellSize / 2; // Colonne 5
  const neutralTree1Y = 2 * cellSize + cellSize / 2; // Ligne 2 (haut)
  
  trees.push({
    id: 'neutral-1',
    x: neutralTree1X,
    y: neutralTree1Y,
    owner: 'neutral',
    hiveHealth: [],
    hiveLevel: [],
    hiveCount: 0,
    beeCount: 0,
    buildingProgress: [],
    upgradingProgress: 0,
    isStartingTree: false,
    isCut: false,
    cutProgress: 0,
  });

  // Arbre neutre du bas (milieu-droite - SYMÉTRIQUE au premier)
  const neutralTree2X = 7 * cellSize + cellSize / 2; // Colonne 7 (symétrique à 5)
  const neutralTree2Y = 6 * cellSize + cellSize / 2; // Ligne 6 (bas, symétrique à 2)
  
  trees.push({
    id: 'neutral-2',
    x: neutralTree2X,
    y: neutralTree2Y,
    owner: 'neutral',
    hiveHealth: [],
    hiveLevel: [],
    hiveCount: 0,
    beeCount: 0,
    buildingProgress: [],
    upgradingProgress: 0,
    isStartingTree: false,
    isCut: false,
    cutProgress: 0,
  });

  return {
    trees,
    ponds,
    grassGrid,
    description: '🎮 Niveau 1 - Facile : Carte symétrique, 4 arbres, pas d\'étangs',
  };
}

// Fonction pour générer un niveau selon son numéro
export function generateLevel(levelNumber: number, cellSize: number): LevelData {
  switch (levelNumber) {
    case 1:
      return generateLevel1(cellSize);
    // Prochains niveaux ici
    default:
      return generateLevel1(cellSize);
  }
}

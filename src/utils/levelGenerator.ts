import { Tree } from '../types/game';
import { PondShape } from './mapGenerator';
import { generateGrassGrid } from './grassGenerator';


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

  const grassGrid = generateGrassGrid(rows, cols, cellSize);

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

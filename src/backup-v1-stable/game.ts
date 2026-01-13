export type Owner = 'player' | 'enemy' | 'neutral';

export interface Tree {
  id: string;
  x: number;
  y: number;
  owner: Owner;
  hiveCount: number;
  maxHives: number;
  beeCount: number;
  hiveHealth: number[]; // Health of each hive (0-20), one entry per hive
  hiveLevel: number[]; // Level of each hive (1 or 2)
  buildingProgress?: number[]; // Nombre d'abeilles déjà investies pour chaque ruche en construction
}

export interface Bee {
  id: string;
  x: number;
  y: number;
  owner: Owner;
  treeId: string | null;
  targetTreeId: string | null;
  targetX?: number; // Pour mouvement libre
  targetY?: number; // Pour mouvement libre
  offsetX?: number; // Offset pour effet de nuage
  offsetY?: number; // Offset pour effet de nuage
  hoverCenterX?: number; // Centre fixe pour le hover
  hoverCenterY?: number; // Centre fixe pour le hover
  state: 'idle' | 'moving' | 'fighting';
  angle: number;
  createdAt?: number;
}

export interface GameState {
  trees: Tree[];
  bees: Bee[];
  selectedBeeIds: Set<string>;
  gameTime: number;
  isPlaying: boolean;
  stars: number;
}

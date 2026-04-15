/**
 * Types de propriétaire pour les arbres et les abeilles
 */
export type Owner = 'player' | 'enemy' | 'neutral';

/**
 * Arbre du jeu - peut contenir des ruches
 */
export interface Tree {
  id: string;
  x: number;
  y: number;
  owner: Owner;
  hiveCount: number; // Nombre de ruches sur cet arbre
  maxHives: number; // Maximum de ruches possibles (toujours 1)
  beeCount: number; // Nombre d'abeilles orbitant autour
  hiveHealth: number[]; // Santé de chaque ruche (7 pour niveau 1, 35 pour niveau 2)
  hiveLevel: number[]; // Niveau de chaque ruche (1 ou 2)
  buildingProgress?: number[]; // Abeilles investies pour construction
  lastBuildTick?: number;      // Timestamp du dernier tick de construction (throttle 200ms)
  lastAttackTick?: number;     // Timestamp du dernier tick d'attaque de ruche (throttle 300ms)
  upgradingProgress?: number; // Abeilles investies pour amélioration niveau 1 → 2
  upgradeLocked?: boolean;   // Bloque l'upgrade automatique — true après construction, false quand le joueur re-cible l'arbre
  isStartingTree?: boolean; // Arbre de départ - ne peut pas être amélioré
  isCut?: boolean; // RÉSERVÉ POUR FUTURE FONCTIONNALITÉ (bûcherons)
  cutProgress?: number; // RÉSERVÉ POUR FUTURE FONCTIONNALITÉ (bûcherons)
}

/**
 * Abeille/Luciole du jeu
 */
export interface Bee {
  id: string;
  x: number;
  y: number;
  owner: Owner;
  treeId: string | null; // Arbre autour duquel elle orbite
  targetTreeId: string | null; // Arbre cible si en déplacement
  targetX?: number; // Position X cible pour mouvement libre
  targetY?: number; // Position Y cible pour mouvement libre
  offsetX?: number; // Offset pour effet de nuage
  offsetY?: number; // Offset pour effet de nuage
  hoverCenterX?: number; // Centre fixe pour le hover (wiggle sans arbre)
  hoverCenterY?: number; // Centre fixe pour le hover (wiggle sans arbre)
  buildingTreeId?: string | null; // Arbre ciblé pour construction/réparation/amélioration
  targetLumberjackId?: string | null; // Bûcheron ciblé (future fonctionnalité)
  state: 'idle' | 'moving' | 'fighting' | 'building';
  angle: number; // Angle de rotation autour de l'arbre
  displayAngle?: number; // Direction tangentielle pour l'orientation visuelle
  createdAt?: number; // Timestamp de création
}

/**
 * Effet de halo lumineux lors de construction/amélioration de ruche
 */
export interface HaloEffect {
  treeId: string;
  timestamp: number;
}

/**
 * Mode jour/nuit
 */
export type TimeOfDay = 'day' | 'night';

/**
 * Luciole pour l'ambiance nocturne
 */
export interface Firefly {
  id: string;
  x: number;
  y: number;
  brightness: number; // Luminosité (0-1)
  phase: number; // Phase d'oscillation pour animation
}

/**
 * État global du jeu
 */
export interface GameState {
  trees: Tree[]; // Tous les arbres de la carte
  bees: Bee[]; // Toutes les abeilles/lucioles
  selectedBeeIds: Set<string>; // IDs des abeilles sélectionnées
  gameTime: number; // Temps de jeu écoulé
  isPlaying: boolean; // Jeu en pause ou en cours
  stars: number; // Étoiles gagnées (non utilisé actuellement)
  haloEffects?: HaloEffect[]; // Effets de halo lumineux actifs
  fireflies?: Firefly[]; // Lucioles d'ambiance (mode nuit uniquement)
}

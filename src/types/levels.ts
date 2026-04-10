/**
 * Types pour le mode histoire et la progression des niveaux
 */

export type SubLevelType = 
  | 'movement'      // Déplacement des abeilles
  | 'build_hive'    // Créer une ruche
  | 'double_hive'   // Créer une double ruche
  | 'dangers'       // Découvrir les dangers
  | 'first_battle'; // Première bataille

export interface SubLevel {
  id: string;
  type: SubLevelType;
  title: string;
  instructions: string;
  completed: boolean;
  stars: number; // 0-3 étoiles
}

export interface Level {
  id: number;
  title: string;
  description: string;
  subLevels: SubLevel[];
  unlocked: boolean;
  completed: boolean;
  stars: number; // Total des étoiles du niveau
}

export interface LevelProgress {
  currentLevel: number;
  currentSubLevel: number;
  levels: Level[];
}

/**
 * Configuration initiale des 10 niveaux
 * Chaque niveau a maintenant 5 sous-niveaux
 */
export const INITIAL_LEVELS: Level[] = [
  {
    id: 1,
    title: "Niveau 1",
    description: "Apprends les bases du jeu",
    unlocked: true,
    completed: false,
    stars: 0,
    subLevels: [
      {
        id: '1-1',
        type: 'movement',
        title: 'Déplacement',
        instructions: 'Clique sur ton arbre (ou trace un cercle) pour sélectionner tes abeilles, puis clique sur un arbre neutre pour les déplacer.',
        completed: false,
        stars: 0,
      },
      {
        id: '1-2',
        type: 'build_hive',
        title: 'Construction',
        instructions: 'Envoie 5 abeilles sur un arbre neutre pour créer une ruche.',
        completed: false,
        stars: 0,
      },
      {
        id: '1-3',
        type: 'double_hive',
        title: 'Amélioration',
        instructions: 'Envoie 20 abeilles sur un groupe d\'arbres pour créer une 2ème ruche.',
        completed: false,
        stars: 0,
      },
      {
        id: '1-4',
        type: 'dangers',
        title: 'Dangers',
        instructions: 'Attention aux étangs ! Traverse-les pour découvrir les risques.',
        completed: false,
        stars: 0,
      },
      {
        id: '1-5',
        type: 'first_battle',
        title: 'Premier combat',
        instructions: 'Affronte ton premier ennemi et détruit sa ruche !',
        completed: false,
        stars: 0,
      },
    ],
  },
  // Niveaux 2 à 9 (5 sous-niveaux chacun)
  ...Array.from({ length: 8 }, (_, i) => ({
    id: i + 2,
    title: `Niveau ${i + 2}`,
    description: 'À venir bientôt...',
    unlocked: false,
    completed: false,
    stars: 0,
    subLevels: Array.from({ length: 5 }, (_, j) => ({
      id: `${i + 2}-${j + 1}`,
      type: 'movement' as SubLevelType,
      title: `Partie ${j + 1}`,
      instructions: 'À venir bientôt...',
      completed: false,
      stars: 0,
    })),
  })),
  // Niveau 10 : Boss final (5 sous-niveaux aussi)
  {
    id: 10,
    title: "Boss Final",
    description: "Le défi ultime !",
    unlocked: false,
    completed: false,
    stars: 0,
    subLevels: Array.from({ length: 5 }, (_, j) => ({
      id: `10-${j + 1}`,
      type: 'first_battle' as SubLevelType,
      title: `Phase ${j + 1}`,
      instructions: 'Affronte le boss final !',
      completed: false,
      stars: 0,
    })),
  },
];

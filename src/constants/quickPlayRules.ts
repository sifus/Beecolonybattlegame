// Règles de génération pour le mode Partie Rapide
// C'est ici qu'on configurera la difficulté à terme

export const QUICK_PLAY_RULES = {
  // Proportion de groupes d'arbres (maxHives: 2) parmi les arbres neutres
  // ex: 0.25 = environ 1 arbre sur 4 est un groupe
  GROUP_TREE_RATIO: 0.25,

  // Nombre minimum et maximum de groupes d'arbres sur une carte
  MIN_GROUP_TREES: 1,
  MAX_GROUP_TREES: 3,
} as const;

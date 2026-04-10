/**
 * Position d'un arbre dans sa cellule (constante partagée entre tous les générateurs).
 *
 * x = col * cellSize + cellSize / 2   (centre horizontal de la cellule)
 * y = row * cellSize + cellSize * 0.2 (base du tronc à 20% depuis le haut de la cellule)
 */
export const treeX = (col: number, cellSize: number): number =>
  col * cellSize + cellSize / 2;

export const treeY = (row: number, cellSize: number): number =>
  row * cellSize + cellSize * 0.2;

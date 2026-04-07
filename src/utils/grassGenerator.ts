export type GrassCell = {
  x: number;
  y: number;
  color: string;
  borderOpacity: number;
  borderOffset: number;
};

const DEFAULT_GRASS_COLORS = ['#cdd94a', '#c2d040'];

/**
 * Génère une grille de cases d'herbe avec alternance de couleurs contrainte :
 * - Pas deux cellules adjacentes (haut/bas/gauche/droite) de même couleur
 * - Maximum 2 cellules diagonalement adjacentes de même couleur
 */
export function generateGrassGrid(
  rows: number,
  cols: number,
  cellSize: number,
  grassColors: string[] = DEFAULT_GRASS_COLORS
): GrassCell[] {
  const grassGrid: GrassCell[] = [];
  const colorGrid: string[][] = Array(rows).fill(null).map(() => Array(cols).fill(''));

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const x = j * cellSize;
      const y = i * cellSize;

      const adjacentColors = new Set<string>();
      if (i > 0 && colorGrid[i - 1][j]) adjacentColors.add(colorGrid[i - 1][j]); // top
      if (j > 0 && colorGrid[i][j - 1]) adjacentColors.add(colorGrid[i][j - 1]); // left

      const diagonalColorCount: { [color: string]: number } = {};
      const diagonals = [[i - 1, j - 1], [i - 1, j + 1]];

      for (const [di, dj] of diagonals) {
        if (di >= 0 && di < rows && dj >= 0 && dj < cols && colorGrid[di][dj]) {
          const dColor = colorGrid[di][dj];
          diagonalColorCount[dColor] = (diagonalColorCount[dColor] || 0) + 1;
        }
      }

      const tooManyDiagonals = new Set<string>(
        Object.entries(diagonalColorCount)
          .filter(([_, count]) => count >= 2)
          .map(([color]) => color)
      );

      let availableColors = grassColors.filter(
        c => !adjacentColors.has(c) && !tooManyDiagonals.has(c)
      );
      if (availableColors.length === 0) {
        availableColors = grassColors.filter(c => !adjacentColors.has(c));
      }
      if (availableColors.length === 0) {
        availableColors = grassColors;
      }

      const color = availableColors[Math.floor(Math.random() * availableColors.length)];
      colorGrid[i][j] = color;

      grassGrid.push({
        x, y, color,
        borderOpacity: 0.3 + Math.random() * 0.4,
        borderOffset: Math.random() - 0.5,
      });
    }
  }

  return grassGrid;
}

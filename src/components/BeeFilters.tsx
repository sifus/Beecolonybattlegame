/** Filtres et clipPaths SVG partagés pour Bee.tsx — à rendre une seule fois dans GameBoard. */
export function BeeFilters() {
  const dropPath = 'M 0,-22 C 0,-22 -18,-9 -18,3 C -18,14 -10,22 0,22 C 10,22 18,14 18,3 C 18,-9 0,-22 0,-22 Z';

  return (
    <defs>
      {/* Glow luciole mode nuit */}
      <filter id="firefly-glow" x="-150%" y="-150%" width="400%" height="400%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* ClipPath goutte — partagé entre toutes les bees (mode jour) */}
      <clipPath id="bee-drop-clip">
        <path d={dropPath} />
      </clipPath>

      {/* ClipPath goutte — partagé pour les dying bees */}
      <clipPath id="bee-dying-drop-clip">
        <path d={dropPath} />
      </clipPath>
    </defs>
  );
}

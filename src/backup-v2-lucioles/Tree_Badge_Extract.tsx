// Extrait du composant Tree.tsx - Badge du nombre d'abeilles adapté au mode nuit
// Lignes 736-761

        {/* Bee count indicator for trees with player bees - Haut droite de l'arbre */}
        {playerBeesCount > 0 && (
          <g>
            <circle
              cx={tree.x + 35 * treeScale}
              cy={tree.y - 35 * treeScale}
              r={12 * treeScale}
              fill={isNightMode ? '#7FFF00' : '#FDD835'}
              opacity={0.95}
              stroke={isNightMode ? '#9FFF00' : '#F9A825'}
              strokeWidth={2 * treeScale}
              style={isNightMode ? { filter: 'drop-shadow(0 0 4px rgba(127, 255, 0, 0.8))' } : {}}
            />
            <text
              x={tree.x + 35 * treeScale}
              y={tree.y - 35 * treeScale}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={isNightMode ? '#2D5016' : '#F57C00'}
              fontSize={11 * treeScale}
              fontWeight="bold"
            >
              {playerBeesCount}
            </text>
          </g>
        )}

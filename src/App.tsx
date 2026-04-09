import { useState, useEffect, useRef, useCallback } from 'react';
import { Tree } from './components/Tree';
import { Bee } from './components/Bee';
import { GameUI } from './components/GameUI';
import { MainMenu } from './components/MainMenu';
import { OptionsMenu } from './components/OptionsMenu';
import { LevelMap } from './components/LevelMap';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { TutorialBanner } from './components/TutorialBanner';
import { AmbientSound } from './components/AmbientSound';
import { Tree as TreeType, Bee as BeeType, GameState } from './types/game';
import { Level, LevelProgress, INITIAL_LEVELS } from './types/levels';
import { generateRandomMap } from './utils/mapGenerator';
import { generateLevel } from './utils/levelGenerator';
import { generateStoryLevel } from './utils/storyLevelGenerator';
import { enemyAITick } from './utils/enemyAI';
import {
  loadLevelProgress,
  resetLevelProgress,
  loadSoundPreference,
  loadTimeOfDayPreference,
} from './utils/storage';
import { useStorage } from './hooks/useStorage';
import { useSolarSystem } from './hooks/useSolarSystem';
import { useGameLoop } from './hooks/useGameLoop';
import { GameBoard } from './components/GameBoard';
import { motion } from 'motion/react';

// Désactiver les toasts
const toast = {
  info: () => {},
  success: () => {},
  error: () => {},
  warning: () => {},
};

/**
 * RÈGLES DU JEU "RUSH"
 * Version: 5.7 - Mode jour/nuit avec lucioles et ambiance sonore
 */

import { BUILD_HIVE_COST, UPGRADE_HIVE_COST, HIVE_L1_HP, HIVE_L2_HP, MAX_BEES } from './constants/gameRules';

type Screen = 'menu' | 'options' | 'game' | 'levelmap' | 'story';

/**
 * NOUVELLE APPROCHE : Maximiser le nombre de cellules qui rentrent
 * 1. Calculer l'espace disponible
 * 2. Tester différentes tailles de cellules (40-80px)
 * 3. Choisir celle qui maximise les cellules TOUT EN gardant une taille confortable
 * 4. Ajouter bordure décorative
 * 5. Centrer parfaitement
 */
function calculateGridParams(levelId?: number, subLevelIndex?: number) {
  const availW = window.innerWidth || 390;
  const availH = window.innerHeight || 844;

  // Grille fixe 13×8 cases visibles, bordure incluse (1 case de chaque côté)
  const totalCols = 13;
  const totalRows = 8;

  const cellSizeByWidth  = Math.floor(availW / totalCols);
  const cellSizeByHeight = Math.floor(availH / totalRows);
  const cellSize = Math.min(cellSizeByWidth, cellSizeByHeight);

  const gridW = totalCols * cellSize;
  const gridH = totalRows * cellSize;

  const marginLeft = Math.round((availW - gridW) / 2);
  const marginTop = Math.round((availH - gridH) / 2);

  return {
    cols: totalCols,
    rows: totalRows,
    cellSize,
    gridWidth: gridW,
    gridHeight: gridH,
    marginLeft,
    marginTop,
    gameStartCol: 1,
    gameEndCol: totalCols - 2,
    gameStartRow: 1,
    gameEndRow: totalRows - 2
  };
}

export default function App() {
  // États de navigation et paramètres globaux
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');
  const [soundEnabled, setSoundEnabled] = useState(() => loadSoundPreference());
  const [globalTimeOfDay, setGlobalTimeOfDay] = useState<'day' | 'night'>(() => loadTimeOfDayPreference());
  const [gridParams, setGridParams] = useState(() => calculateGridParams());
  const [mapData, setMapData] = useState(() => {
    const params = calculateGridParams();
    return generateRandomMap(params.cellSize, params.rows, params.cols, {
      gameStartRow: params.gameStartRow,
      gameEndRow: params.gameEndRow,
      gameStartCol: params.gameStartCol,
      gameEndCol: params.gameEndCol
    });
  });
  const [scale, setScale] = useState(1);

  const { sunIntensity, sunPosition, sparkles } = useSolarSystem(gridParams);

  // État du mode histoire - Charger depuis localStorage
  const [levelProgress, setLevelProgress] = useState<LevelProgress>(() => loadLevelProgress());
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [currentStars, setCurrentStars] = useState(0);
  
  // État du jeu
  const [gameState, setGameState] = useState<GameState>(() => ({
    trees: mapData.trees.map(tree => ({
      ...tree,
      hiveHealth: tree.hiveHealth || [],
      hiveLevel: tree.hiveLevel || [],
      buildingProgress: [],
      upgradingProgress: 0,
      isStartingTree: tree.isStartingTree || false,
      isCut: false,
      cutProgress: 0
    })),
    bees: [],
    selectedBeeIds: new Set(),
    gameTime: 0,
    isPlaying: true,
    stars: 3,
    haloEffects: [],
    fireflies: [],
  }));

  const [gameOver, setGameOver] = useState<'won' | 'lost' | null>(null);
  const [tutorialCompleted, setTutorialCompleted] = useState(false);

  const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);
  const [selectionCurrent, setSelectionCurrent] = useState<{ x: number; y: number } | null>(null);
  const [selectionCircle, setSelectionCircle] = useState<{ x: number; y: number; radius: number } | null>(null);
  const [flashEffect, setFlashEffect] = useState<{ x: number; y: number; type: 'small' | 'large' } | null>(null);
  const [waterSplashes, setWaterSplashes] = useState<Array<{ x: number; y: number; id: string; timestamp: number }>>([]);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [lastClickedTreeId, setLastClickedTreeId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false); // Pour détecter si on drag ou clic simple
  const dragThreshold = 5; // Distance en pixels pour considérer un drag
  const svgRef = useRef<SVGSVGElement>(null);
  const victoryHandledRef = useRef(false); // Pour éviter les boucles infinies de victoire
  const beeConsumedByPondRef = useRef(false); // Pour détecter quand une abeille tombe dans l'étang (niveau dangers)
  const justSentBeesRef = useRef(false); // Pour éviter de sélectionner les abeilles après avoir envoyé des abeilles
  const gridParamsRef = useRef(gridParams); // Toujours à jour pour le handler resize

  // Helper pour adapter le wording selon le mode jour/nuit
  const getWording = (timeOfDay: 'day' | 'night') => {
    const isNight = timeOfDay === 'night';
    return {
      bee: isNight ? 'luciole' : 'abeille',
      bees: isNight ? 'lucioles' : 'abeilles',
      beesCapital: isNight ? 'Lucioles' : 'Abeilles',
      hive: isNight ? 'cocon' : 'ruche',
      hives: isNight ? 'cocons' : 'ruches',
      hiveCapital: isNight ? 'Cocon' : 'Ruche',
    };
  };

  // Generate initial bees around trees (only on first mount)
  useEffect(() => {
    // Ne créer les abeilles que si aucune abeille n'existe déjà
    if (gameState.bees.length > 0) return;
    
    const initialBees: BeeType[] = [];
    gameState.trees.forEach((tree) => {
      if (tree.beeCount > 0 && tree.hiveHealth.length > 0) {
        // Position bees from the first hive
        for (let i = 0; i < tree.beeCount; i++) {
          const angle = (i / tree.beeCount) * Math.PI * 2;
          const radius = 38;
          initialBees.push({
            id: `bee-${tree.id}-${i}-${Date.now()}`,
            x: tree.x + Math.cos(angle) * radius,
            y: tree.y + Math.sin(angle) * radius,
            owner: tree.owner,
            treeId: tree.id,
            targetTreeId: null,
            state: 'idle',
            angle,
            createdAt: undefined,
          });
        }
      }
    });
    
    if (initialBees.length > 0) {
      setGameState((prev) => ({ ...prev, bees: initialBees }));
      
      // Show welcome toast (only when initializing bees for the first time)
      setTimeout(() => {
        const w = getWording(globalTimeOfDay);
        toast.info(`Cliquez sur un arbre avec vos ${w.bees} pour construire ${w.hive === 'cocon' ? 'un' : 'une'} ${w.hive} progressivement !`, {
          duration: 6000
        });
      }, 1000);
    }
  }, []);
  
  // Fix viewport pour iOS en mode standalone (PWA)
  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone === true;
    
    if (isIOS && isStandalone) {
      // Forcer le recalcul du viewport après un délai
      const fixViewport = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      };
      
      fixViewport();
      window.addEventListener('resize', fixViewport);
      window.addEventListener('orientationchange', () => {
        setTimeout(fixViewport, 100);
      });
      
      return () => {
        window.removeEventListener('resize', fixViewport);
        window.removeEventListener('orientationchange', fixViewport);
      };
    }
  }, []);
  
  // 🔄 Sauvegarde automatique (progression + préférences)
  useStorage(levelProgress, soundEnabled, globalTimeOfDay);
  
  // Maintenir gridParamsRef à jour à chaque render
  gridParamsRef.current = gridParams;

  // Détecter les changements de taille d'écran — recalcule toujours, y compris pendant une partie
  useEffect(() => {
    const handleResize = () => {
      const newParams = calculateGridParams(
        currentScreen === 'story' ? levelProgress.currentLevel : undefined,
        currentScreen === 'story' ? levelProgress.currentSubLevel : undefined
      );
      const oldCellSize = gridParamsRef.current.cellSize;
      if (newParams.cellSize === oldCellSize) return;

      const scale = newParams.cellSize / oldCellSize;
      // Rescaler positions des arbres et abeilles proportionnellement
      setGameState(prev => ({
        ...prev,
        trees: prev.trees.map(t => ({ ...t, x: t.x * scale, y: t.y * scale })),
        bees: prev.bees.map(b => ({ ...b, x: b.x * scale, y: b.y * scale })),
      }));
      setGridParams(newParams);
    };

    const handleOrientationChange = () => {
      setTimeout(() => handleResize(), 300);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [currentScreen, levelProgress]);

  // Régénérer la carte quand les paramètres de grille changent
  // Seulement si on est au menu, pas pendant une partie active
  useEffect(() => {
    if (currentScreen === 'menu') {
      const randomMap = generateRandomMap(gridParams.cellSize, gridParams.rows, gridParams.cols, {
        gameStartRow: gridParams.gameStartRow,
        gameEndRow: gridParams.gameEndRow,
        gameStartCol: gridParams.gameStartCol,
        gameEndCol: gridParams.gameEndCol
      });
      setMapData(randomMap);
      
      setGameState(prev => ({
        ...prev,
        trees: randomMap.trees.map(tree => ({
          ...tree,
          hiveHealth: tree.hiveHealth || [],
          hiveLevel: tree.hiveLevel || [],
          buildingProgress: [],
          upgradingProgress: 0,
          isStartingTree: tree.isStartingTree || false,
          isCut: false,
          cutProgress: 0
        })),
      }));
    }
  }, [gridParams, currentScreen]);

  // Pas de scale, on utilise juste une cellSize plus petite pour dézoomer
  useEffect(() => {
    setScale(1);
  }, [gridParams]);

  // NE PAS recharger le niveau pendant une partie - cela causerait une réinitialisation
  // Le niveau est uniquement chargé via handleStartLevel() et non lors des changements de gridParams
  // Cela permet de préserver l'état du jeu lors des changements de taille de fenêtre ou d'orientation

  // Boucles de jeu (60 FPS, production, lucioles, IA ennemie)
  useGameLoop({
    gameState,
    setGameState,
    gridParams,
    mapData,
    globalTimeOfDay,
    currentScreen,
    levelProgress,
    beeConsumedByPondRef,
    setWaterSplashes,
    setFlashEffect,
  });

  // Check win/lose condition
  useEffect(() => {
    if (!gameState.isPlaying || gameOver) return;

    // Compter les ruches vivantes (santé > 0), pas les ruches en parfaite santé, et ignorer les arbres coupés
    const countAliveHives = (trees: typeof gameState.trees, owner: 'player' | 'enemy') => {
      return trees
        .filter((t) => t.owner === owner && !t.isCut)
        .reduce((sum, t) => {
          return sum + t.hiveHealth.filter(h => h > 0).length;
        }, 0);
    };

    const playerAliveHives = countAliveHives(gameState.trees, 'player');
    const enemyAliveHives = countAliveHives(gameState.trees, 'enemy');

    // Vérifier s'il y avait des arbres ennemis sur la carte initialement (pour éviter fausse victoire sur carte sans ennemis)
    // On regarde tous les arbres, même neutres maintenant, pour voir s'il y en avait
    const hasEnemyTrees = mapData.trees.some(t => t.owner === 'enemy');

    // En mode histoire, vérifier les conditions de victoire spécifiques au type de niveau
    if (currentScreen === 'story') {
      const { currentLevel, currentSubLevel } = levelProgress;
      const level = levelProgress.levels.find(l => l.id === currentLevel);
      const subLevel = level?.subLevels[currentSubLevel];

      if (subLevel && gameState.gameTime > 2) {
        let hasWon = false;

        switch (subLevel.type) {
          case 'movement':
            // Victoire : une abeille du joueur a atteint un autre arbre (pas l'arbre de départ)
            hasWon = gameState.bees.some(bee => 
              bee.owner === 'player' && 
              bee.treeId !== null && 
              !gameState.trees.find(t => t.id === bee.treeId)?.isStartingTree
            );
            break;

          case 'build_hive':
            // Victoire : le joueur a construit au moins une ruche sur un arbre qui n'était pas son arbre de départ
            hasWon = gameState.trees.some(t => 
              t.owner === 'player' && 
              !t.isStartingTree && 
              t.hiveHealth.length > 0
            );
            break;

          case 'double_hive':
            // Victoire : le joueur a au moins une ruche niveau 2
            hasWon = gameState.trees.some(t => 
              t.owner === 'player' && 
              t.hiveLevel.some(level => level >= 2)
            );
            break;

          case 'dangers':
            // Victoire : une abeille a été consommée par l'étang (le joueur a appris le danger)
            hasWon = beeConsumedByPondRef.current;
            break;

          case 'first_battle':
            // Victoire classique : détruire toutes les ruches ennemies
            hasWon = hasEnemyTrees && enemyAliveHives === 0;
            break;
        }

        if (hasWon && !victoryHandledRef.current) {
          // Marquer immédiatement pour éviter les appels multiples
          victoryHandledRef.current = true;
          
          // Pour le niveau 1 (tutoriel)
          const isTutorialLevel = levelProgress.currentLevel === 1;
          const isFirstBattle = currentSubLevel === 4; // Premier combat (Level 1-5)
          
          if (isTutorialLevel && !isFirstBattle) {
            // Tutoriels 1-4 : on ne s'arrête pas - le joueur peut continuer à s'entraîner
            const stars = 3; // Pas de système d'étoiles pour le tutoriel
            handleLevelComplete(stars, true); // true = ne pas afficher le modal
            setTutorialCompleted(true); // Mettre à jour la cartouche tutoriel
          } else {
            // Premier combat (Level 1-5) OU niveaux normaux : arrêter le jeu et afficher le modal
            const stars = playerAliveHives >= 2 ? 3 : playerAliveHives >= 1 ? 2 : 1;
            handleLevelComplete(stars);
            setGameState((prev) => ({ ...prev, isPlaying: false }));
          }
        } else if (playerAliveHives === 0 && !victoryHandledRef.current) {
          // Marquer immédiatement pour éviter les appels multiples
          victoryHandledRef.current = true;
          
          // Défaite : le joueur n'a plus de ruches
          handleLevelComplete(0);
          setGameState((prev) => ({ ...prev, isPlaying: false }));
        }
      }
    } else {
      // Mode quick play : condition de victoire classique
      if (hasEnemyTrees && enemyAliveHives === 0 && gameState.gameTime > 2 && gameOver === null) {
        setGameOver('won');
        setGameState((prev) => ({ ...prev, isPlaying: false }));
      } else if (playerAliveHives === 0 && gameState.gameTime > 2 && gameOver === null) {
        setGameOver('lost');
        setGameState((prev) => ({ ...prev, isPlaying: false }));
      }
    }
  }, [gameState.trees, gameState.isPlaying, gameState.gameTime, gameOver, currentScreen, levelProgress]);

  // Global mouseup handler pour gérer le cas où on relâche en dehors de la fenêtre
  useEffect(() => {
    const handleGlobalMouseUp = (e: MouseEvent) => {
      // Si on a une sélection en cours et qu'on relâche en dehors du SVG, annuler
      if (selectionStart && svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        const isOutside = 
          e.clientX < rect.left || 
          e.clientX > rect.right || 
          e.clientY < rect.top || 
          e.clientY > rect.bottom;
        
        if (isOutside) {
          setSelectionStart(null);
          setSelectionCurrent(null);
        }
      }
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [selectionStart]);

  // Raccourci clavier T — spawn 20 abeilles de test sur l'arbre joueur
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 't' || e.key === 'T') {
        const playerTree = gameState.trees.find(t => t.owner === 'player' && t.isStartingTree);
        if (!playerTree) return;
        const testBees = Array.from({ length: 20 }, (_, i) => ({
          id: `bee-test-${i}-${Date.now()}`,
          x: playerTree.x + Math.cos(Math.random() * Math.PI * 2) * (30 + Math.random() * 16),
          y: playerTree.y + Math.sin(Math.random() * Math.PI * 2) * (30 + Math.random() * 16),
          owner: 'player' as const,
          treeId: playerTree.id,
          targetTreeId: null,
          state: 'idle' as const,
          angle: Math.random() * Math.PI * 2,
          createdAt: undefined,
          displayAngle: undefined,
        }));
        setGameState(prev => ({ ...prev, bees: [...prev.bees, ...testBees] }));
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameState.trees]);

  // Fonction utilitaire pour convertir les coordonnées écran en coordonnées jeu
  // NOUVELLE VERSION : Plus simple car preserveAspectRatio="none" et dimensions fixes
  const getGameCoordinates = (clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    
    const rect = svgRef.current.getBoundingClientRect();
    const viewBox = svgRef.current.viewBox.baseVal;
    
    // Position relative dans le conteneur SVG (en pixels)
    const relativeX = clientX - rect.left;
    const relativeY = clientY - rect.top;
    
    // Avec preserveAspectRatio="none", le mapping est direct
    const scaleX = rect.width / viewBox.width;
    const scaleY = rect.height / viewBox.height;
    
    // Convertir les coordonnées écran en coordonnées viewBox
    const x = relativeX / scaleX;
    const y = relativeY / scaleY;
    
    return { x, y };
  };

  // Mouse handlers for selection
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const { x, y } = getGameCoordinates(e.clientX, e.clientY);
    setSelectionStart({ x, y });
    setSelectionCurrent({ x, y });
    setIsDragging(false);
    const id = Date.now();
    setRipples(prev => [...prev, { id, x, y }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!selectionStart || !svgRef.current) return;
    const { x, y } = getGameCoordinates(e.clientX, e.clientY);
    
    // Détecter si on a bougé assez pour considérer un drag
    const distance = Math.sqrt(
      Math.pow(x - selectionStart.x, 2) + Math.pow(y - selectionStart.y, 2)
    );
    
    if (distance > dragThreshold) {
      setIsDragging(true);
    }
    
    setSelectionCurrent({ x, y });
  };

  const handleMouseLeave = () => {
    // Si on était en train de sélectionner, sélectionner les abeilles dans le cercle actuel
    if (selectionStart && selectionCurrent) {
      const diameter = Math.sqrt(
        Math.pow(selectionCurrent.x - selectionStart.x, 2) +
          Math.pow(selectionCurrent.y - selectionStart.y, 2)
      );
      const centerX = (selectionStart.x + selectionCurrent.x) / 2;
      const centerY = (selectionStart.y + selectionCurrent.y) / 2;
      const radius = diameter / 2;

      if (radius > 5) {
        // Sélectionner toutes les abeilles du joueur dans le cercle
        const selectedBees = gameState.bees.filter((bee) => {
          if (bee.owner !== 'player') return false;
          const distToBee = Math.sqrt(
            Math.pow(bee.x - centerX, 2) + Math.pow(bee.y - centerY, 2)
          );
          return distToBee <= radius;
        });

        setGameState((prev) => ({
          ...prev,
          selectedBeeIds: new Set(selectedBees.map((b) => b.id)),
        }));
        setLastClickedTreeId(null);
      }
    }
    
    // Réinitialiser la sélection
    setSelectionStart(null);
    setSelectionCurrent(null);
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent<SVGSVGElement>) => {
    if (!svgRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const { x, y } = getGameCoordinates(touch.clientX, touch.clientY);
    setSelectionStart({ x, y });
    setSelectionCurrent({ x, y });
    setIsDragging(false);
    const id = Date.now();
    setRipples(prev => [...prev, { id, x, y }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600);
  };

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    if (!selectionStart || !svgRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const { x, y } = getGameCoordinates(touch.clientX, touch.clientY);
    
    // Détecter si on a bougé assez pour considérer un drag
    const distance = Math.sqrt(
      Math.pow(x - selectionStart.x, 2) + Math.pow(y - selectionStart.y, 2)
    );
    
    if (distance > dragThreshold) {
      setIsDragging(true);
    }
    
    setSelectionCurrent({ x, y });
  };

  const handleTouchEnd = () => {
    handleMouseUp();
  };

  const handleTouchCancel = () => {
    // Si on était en train de sélectionner, sélectionner les abeilles dans le cercle actuel
    if (selectionStart && selectionCurrent) {
      const diameter = Math.sqrt(
        Math.pow(selectionCurrent.x - selectionStart.x, 2) +
          Math.pow(selectionCurrent.y - selectionStart.y, 2)
      );
      const centerX = (selectionStart.x + selectionCurrent.x) / 2;
      const centerY = (selectionStart.y + selectionCurrent.y) / 2;
      const radius = diameter / 2;

      if (radius > 5) {
        // Sélectionner toutes les abeilles du joueur dans le cercle
        const selectedBees = gameState.bees.filter((bee) => {
          if (bee.owner !== 'player') return false;
          const distToBee = Math.sqrt(
            Math.pow(bee.x - centerX, 2) + Math.pow(bee.y - centerY, 2)
          );
          return distToBee <= radius;
        });

        setGameState((prev) => ({
          ...prev,
          selectedBeeIds: new Set(selectedBees.map((b) => b.id)),
        }));
        setLastClickedTreeId(null);
      }
    }
    
    // Réinitialiser la sélection
    setSelectionStart(null);
    setSelectionCurrent(null);
  };

  const handleMouseUp = () => {
    if (!selectionStart || !selectionCurrent) {
      // Réinitialiser même si pas de sélection en cours
      setSelectionStart(null);
      setSelectionCurrent(null);
      setIsDragging(false);
      return;
    }
    
    // Calculate circle selection
    const diameter = Math.sqrt(
      Math.pow(selectionCurrent.x - selectionStart.x, 2) +
        Math.pow(selectionCurrent.y - selectionStart.y, 2)
    );
    const centerX = (selectionStart.x + selectionCurrent.x) / 2;
    const centerY = (selectionStart.y + selectionCurrent.y) / 2;
    const radius = diameter / 2;

    // Si on a dragger, toujours faire la sélection par cercle
    if (isDragging && radius > 5) {
      // C'est une sélection par cercle
      const selectedBees = gameState.bees.filter((bee) => {
        if (bee.owner !== 'player') return false; // Permet de sélectionner les abeilles en mouvement aussi
        const distToBee = Math.sqrt(
          Math.pow(bee.x - centerX, 2) + Math.pow(bee.y - centerY, 2)
        );
        return distToBee <= radius;
      });

      setGameState((prev) => ({
        ...prev,
        selectedBeeIds: new Set(selectedBees.map((b) => b.id)),
      }));
      setLastClickedTreeId(null);
    } else if (gameState.selectedBeeIds.size > 0) {
      // C'est un simple clic avec des abeilles sélectionnées
      // Détecter si on a cliqué sur un arbre ou sur un endroit vide
      const clickX = selectionCurrent.x;
      const clickY = selectionCurrent.y;
      
      // Chercher si on a cliqué sur un arbre (rayon de détection = 70px)
      const clickedTree = gameState.trees.find(tree => {
        const dist = Math.sqrt(
          Math.pow(tree.x - clickX, 2) + Math.pow(tree.y - clickY, 2)
        );
        return dist <= 70;
      });
      
      // Vérifier si toutes les abeilles sélectionnées gravitent autour du même arbre cliqué
      if (clickedTree) {
        const selectedBeesArray = Array.from(gameState.selectedBeeIds);
        const allBeesOnClickedTree = selectedBeesArray.every(beeId => {
          const bee = gameState.bees.find(b => b.id === beeId);
          return bee && bee.treeId === clickedTree.id && bee.state === 'idle' && bee.owner === 'player';
        });
        
        // Si toutes les abeilles sélectionnées gravitent déjà autour de cet arbre, créer une ruche
        if (allBeesOnClickedTree && selectedBeesArray.length > 0) {
          createOrRepairHive(clickedTree.id);
          setSelectionStart(null);
          setSelectionCurrent(null);
          return;
        }
      }
      
      setGameState(prev => {
        // Générer des offsets pour créer un effet de nuage
        const selectedBees = Array.from(prev.selectedBeeIds);
        const numBees = selectedBees.length;
        
        const updatedBees = prev.bees.map(bee => {
          if (prev.selectedBeeIds.has(bee.id)) {
            // Créer un offset aléatoire pour chaque abeille (nuage)
            const radius = Math.sqrt(numBees) * 8; // Le nuage grandit avec le nombre d'abeilles
            const angle = Math.random() * Math.PI * 2;
            const offsetX = Math.cos(angle) * Math.random() * radius;
            const offsetY = Math.sin(angle) * Math.random() * radius;
            
            if (clickedTree) {
              // Clic sur un arbre - envoyer vers cet arbre
              return { 
                ...bee, 
                state: 'moving' as const, 
                targetTreeId: clickedTree.id, 
                targetX: undefined,
                targetY: undefined,
                offsetX,
                offsetY,
                hoverCenterX: undefined,
                hoverCenterY: undefined,
                treeId: null 
              };
            } else {
              // Clic sur un endroit vide - envoyer vers ce point avec offset
              return { 
                ...bee, 
                state: 'moving' as const, 
                targetTreeId: null, 
                targetX: clickX + offsetX, 
                targetY: clickY + offsetY,
                offsetX,
                offsetY,
                hoverCenterX: undefined,
                hoverCenterY: undefined,
                treeId: null 
              };
            }
          }
          return bee;
        });
        
        const updatedTrees = prev.trees.map(tree => {
          const beesLeavingThisTree = prev.bees.filter(
            b => prev.selectedBeeIds.has(b.id) && b.treeId === tree.id
          ).length;
          
          if (beesLeavingThisTree > 0) {
            return { ...tree, beeCount: Math.max(0, tree.beeCount - beesLeavingThisTree) };
          }
          return tree;
        });
        
        return { ...prev, bees: updatedBees, trees: updatedTrees, selectedBeeIds: new Set() };
      });
      
      // Marquer qu'on vient d'envoyer des abeilles pour éviter de sélectionner dans handleTreeClick
      justSentBeesRef.current = true;
      // Réinitialiser après un court délai (plus long que le délai entre mouseUp et onClick)
      setTimeout(() => {
        justSentBeesRef.current = false;
      }, 100);
    }
    setSelectionStart(null);
    setSelectionCurrent(null);
    setIsDragging(false);
  };

  const createOrRepairHive = useCallback((treeId: string) => {
    // Vérifier les restrictions du tutoriel
    if (currentScreen === 'story') {
      const { currentLevel, currentSubLevel } = levelProgress;
      const level = levelProgress.levels.find(l => l.id === currentLevel);
      const subLevel = level?.subLevels[currentSubLevel];
      
      if (subLevel) {
        // Sous-niveau 1 (movement) : aucune construction/amélioration autorisée
        if (subLevel.type === 'movement') {
          toast.error("Pour l'instant, concentre-toi sur le déplacement de tes abeilles !");
          return;
        }
        
        // Sous-niveau 2 (build_hive) : construction autorisée, mais pas amélioration
        if (subLevel.type === 'build_hive') {
          const tree = gameState.trees.find(t => t.id === treeId);
          if (tree && tree.hiveCount > 0) {
            toast.error("Pour l'instant, apprends à construire une première ruche !");
            return;
          }
        }
      }
    }
    
    // Calculer la santé maximale selon le niveau de la ruche
    const getMaxHealth = (level: number) => level === 2 ? HIVE_L2_HP : HIVE_L1_HP;
    
    setGameState(prev => {
      const tree = prev.trees.find(t => t.id === treeId);
      if (!tree) return prev;
      
      // Vérifier les abeilles disponibles avec l'état actuel (prev)
      const idleBeesAtTree = prev.bees.filter(
        b => b.treeId === treeId && b.owner === 'player' && b.state === 'idle'
      );
      
      if (idleBeesAtTree.length === 0) {
        toast.error("Aucune abeille disponible ne gravite autour de cet arbre");
        return prev;
      }
      
      // Vérifier si l'arbre est ennemi
      if (tree.owner === 'enemy') {
        toast.warning('Détruisez d\'abord les ruches ennemies et éliminez toutes les abeilles !');
        return prev;
      }
      
      // Vérifier s'il y a des abeilles ennemies autour de cet arbre (même si neutre)
      const hasEnemyBees = prev.bees.some(bee => 
        bee.treeId === treeId && bee.owner !== 'player'
      );
      
      if (hasEnemyBees) {
        toast.warning('Éliminez d\'abord toutes les abeilles ennemies !');
        return prev;
      }
      
      // Utiliser les abeilles déjà filtrées
      const currentBeesAtTree = idleBeesAtTree;
      const numBees = currentBeesAtTree.length;
      
      // Vérifier si l'arbre appartient au joueur et a des ruches endommagées
      let damagedHiveIndex = -1;
      if (tree.owner === 'player') {
        if (tree.hiveHealth.length > 1) {
          const health1 = tree.hiveHealth[1];
          const level1 = tree.hiveLevel[1] || 2;
          if (health1 < getMaxHealth(level1)) {
            damagedHiveIndex = 1;
          }
        }
        if (damagedHiveIndex === -1 && tree.hiveHealth.length > 0) {
          const health0 = tree.hiveHealth[0];
          const level0 = tree.hiveLevel[0] || 1;
          if (health0 < getMaxHealth(level0)) {
            damagedHiveIndex = 0;
          }
        }
      }
      
      if (damagedHiveIndex !== -1) {
        // Repair damaged hive - ANIMATION: abeilles volent vers le centre
        // Vérifier les restrictions du tutoriel (vérification supplémentaire dans la logique de jeu)
        if (currentScreen === 'story') {
          const { currentLevel, currentSubLevel } = levelProgress;
          const level = levelProgress.levels.find(l => l.id === currentLevel);
          const subLevel = level?.subLevels[currentSubLevel];
          
          if (subLevel && (subLevel.type === 'movement' || subLevel.type === 'build_hive')) {
            toast.error("Tu apprendras à réparer les ruches plus tard !");
            return prev;
          }
        }
        
        const level = tree.hiveLevel[damagedHiveIndex] || 1;
        const maxHealth = getMaxHealth(level);
        const currentHealth = tree.hiveHealth[damagedHiveIndex];
        const healthNeeded = maxHealth - currentHealth;
        const beesToUse = Math.min(numBees, healthNeeded);
        
        toast.success(`Réparation en cours... ${beesToUse} abeilles`);
        
        // Mettre les abeilles en mode building
        const beesForBuilding = currentBeesAtTree.slice(0, beesToUse);
        
        return {
          ...prev,
          bees: prev.bees.map(bee => {
            if (beesForBuilding.some(b => b.id === bee.id)) {
              return { ...bee, state: 'building' as const, buildingTreeId: treeId, treeId: null };
            }
            return bee;
          }),
          selectedBeeIds: new Set()
        };
      } else if (tree.hiveCount === 1 && tree.hiveLevel[0] === 1 && !tree.isStartingTree && tree.maxHives === 2) {
        // UPGRADE NIVEAU 1 -> NIVEAU 2 (seulement si pas arbre de départ)
        // Vérifier les restrictions du tutoriel (vérification supplémentaire dans la logique de jeu)
        if (currentScreen === 'story') {
          const { currentLevel, currentSubLevel } = levelProgress;
          const level = levelProgress.levels.find(l => l.id === currentLevel);
          const subLevel = level?.subLevels[currentSubLevel];
          
          if (subLevel && (subLevel.type === 'movement' || subLevel.type === 'build_hive')) {
            toast.error("Tu apprendras à améliorer les ruches plus tard !");
            return prev;
          }
        }
        
        // RÈGLE : La ruche doit être intacte (7/7 HP) pour être améliorée
        const currentHealth = tree.hiveHealth[0] || 0;
        if (currentHealth < HIVE_L1_HP) {
          toast.error(`La ruche doit être intacte (${HIVE_L1_HP}/${HIVE_L1_HP} HP) pour être améliorée !`);
          return prev;
        }
        
        const currentProgress = tree.upgradingProgress || 0;
        const beesStillNeeded = UPGRADE_HIVE_COST - currentProgress;
        const beesToUse = Math.min(numBees, beesStillNeeded);

        toast.info(`Amélioration en cours... ${beesToUse}/${UPGRADE_HIVE_COST} abeilles`);

        // Mettre les abeilles en mode building + déverrouiller l'upgrade
        const beesForBuilding = currentBeesAtTree.slice(0, beesToUse);

        return {
          ...prev,
          trees: prev.trees.map(t => t.id === treeId ? { ...t, upgradeLocked: false } : t),
          bees: prev.bees.map(bee => {
            if (beesForBuilding.some(b => b.id === bee.id)) {
              return { ...bee, state: 'building' as const, buildingTreeId: treeId, treeId: null };
            }
            return bee;
          }),
          selectedBeeIds: new Set()
        };
      } else if (tree.hiveCount === 0) {
        // CONSTRUCTION NOUVELLE RUCHE NIVEAU 1
        // Vérifier les restrictions du tutoriel (vérification supplémentaire dans la logique de jeu)
        if (currentScreen === 'story') {
          const { currentLevel, currentSubLevel } = levelProgress;
          const level = levelProgress.levels.find(l => l.id === currentLevel);
          const subLevel = level?.subLevels[currentSubLevel];
          
          if (subLevel && subLevel.type === 'movement') {
            toast.error("Pour l'instant, concentre-toi sur le déplacement de tes abeilles !");
            return prev;
          }
        }
        
        const buildingProgress = tree.buildingProgress || [];
        const currentProgress = buildingProgress[0] || 0;
        const beesStillNeeded = BUILD_HIVE_COST - currentProgress;
        const beesToUse = Math.min(numBees, beesStillNeeded);
        
        toast.info(`Construction démarrée... ${beesToUse}/${BUILD_HIVE_COST} abeilles`);
        
        // Mettre les abeilles en mode building
        const beesForBuilding = currentBeesAtTree.slice(0, beesToUse);
        
        return {
          ...prev,
          bees: prev.bees.map(bee => {
            if (beesForBuilding.some(b => b.id === bee.id)) {
              return { ...bee, state: 'building' as const, buildingTreeId: treeId, treeId: null };
            }
            return bee;
          }),
          trees: prev.trees.map(t => {
            if (t.id === treeId && t.owner === 'neutral') {
              return { ...t, owner: 'player' }; // Prendre possession immédiatement
            }
            return t;
          }),
          selectedBeeIds: new Set()
        };
      } else if (tree.isStartingTree && tree.hiveLevel[0] === 1) {
        toast.error("L'arbre de départ ne peut pas être amélioré");
      } else if (tree.hiveLevel[0] === 2) {
        toast.info("La ruche est déjà au niveau maximum");
      } else {
        toast.error("Impossible de construire ici");
      }
      
      return prev;
    });
  }, [currentScreen, levelProgress, gameState.trees]);

  const handleTreeDragStart = useCallback((e: React.PointerEvent) => {
    // Laisser passer le début du drag pour permettre le cercle de sélection
    if (!svgRef.current) return;
    const { x, y } = getGameCoordinates(e.clientX, e.clientY);
    setSelectionStart({ x, y });
    setSelectionCurrent({ x, y });
    setIsDragging(false);
  }, []);

  const handleTreeClick = useCallback(
    (treeId: string, e: React.MouseEvent | React.PointerEvent) => {
      // Si on est en train de dragger, ne pas traiter le clic
      // Le cercle de sélection sera géré par handleMouseUp
      if (isDragging) {
        return;
      }
      
      // Si on vient d'envoyer des abeilles dans handleMouseUp, ne pas traiter le clic
      // pour éviter de sélectionner les abeilles de l'arbre de destination
      if (justSentBeesRef.current) {
        return;
      }
      
      e.stopPropagation();
      e.preventDefault();
      
      const tree = gameState.trees.find(t => t.id === treeId);
      if (!tree) return;
      
      const now = Date.now();
      const isDoubleClick = 
        lastClickedTreeId === treeId && 
        now - lastClickTime < 400; // 400ms pour détecter le double-clic
      
      if (isDoubleClick && !tree.isCut) {
        // DOUBLE-CLIC : Créer/réparer une ruche avec toutes les abeilles de l'arbre
        // (Seulement sur arbres non coupés)
        createOrRepairHive(treeId);
        setLastClickedTreeId(null);
        setLastClickTime(0);
        return;
      }
      
      // SIMPLE CLIC
      setLastClickedTreeId(treeId);
      setLastClickTime(now);
      
      // Si des abeilles sont déjà sélectionnées : SEULEMENT envoyer la direction, NE PAS sélectionner les abeilles de l'arbre
      if (gameState.selectedBeeIds.size > 0) {
        setGameState(prev => {
          const updatedBees = prev.bees.map(bee => {
            if (prev.selectedBeeIds.has(bee.id)) {
              return { ...bee, state: 'moving' as const, targetTreeId: treeId, targetX: undefined, targetY: undefined, treeId: null };
            }
            return bee;
          });
          
          const updatedTrees = prev.trees.map(tree => {
            const beesLeavingThisTree = prev.bees.filter(
              b => prev.selectedBeeIds.has(b.id) && b.treeId === tree.id
            ).length;
            
            if (beesLeavingThisTree > 0) {
              return { ...tree, beeCount: Math.max(0, tree.beeCount - beesLeavingThisTree) };
            }
            return tree;
          });
          
          return { ...prev, bees: updatedBees, trees: updatedTrees, selectedBeeIds: new Set() };
        });
        // NE PAS sélectionner les abeilles de l'arbre cliqué
        // Réinitialiser aussi lastClickedTreeId pour éviter les double-clics accidentels
        setLastClickedTreeId(null);
        setLastClickTime(0);
      } else {
        // Pas de sélection : sélectionner toutes les abeilles du joueur qui tournent autour de cet arbre
        setGameState(prev => {
          const beesAtThisTree = prev.bees
            .filter(bee => bee.treeId === treeId && bee.owner === 'player')
            .map(bee => bee.id);
          
          if (beesAtThisTree.length > 0) {
            return { ...prev, selectedBeeIds: new Set(beesAtThisTree) };
          }
          return prev;
        });
      }
    },
    [gameState, lastClickedTreeId, lastClickTime, isDragging, selectionStart]
  );

  const handlePause = () => {
    setGameState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const handleToggleTimeOfDay = useCallback(() => {
    setGlobalTimeOfDay(prev => prev === 'day' ? 'night' : 'day');
  }, []);

  const handleToggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
  }, []);

  const handleStartGame = () => {
    setCurrentScreen('game');
    victoryHandledRef.current = false; // Réinitialiser le flag de victoire
    
    // Generate random map avec les bons paramètres de grille
    const randomMap = generateRandomMap(gridParams.cellSize, gridParams.rows, gridParams.cols, {
      gameStartRow: gridParams.gameStartRow,
      gameEndRow: gridParams.gameEndRow,
      gameStartCol: gridParams.gameStartCol,
      gameEndCol: gridParams.gameEndCol
    });
    setMapData(randomMap);
    
    setGameOver(null);
    setGameState({
      trees: randomMap.trees.map(tree => ({
        ...tree,
        hiveHealth: tree.hiveHealth || [],
        hiveLevel: tree.hiveLevel || [],
        buildingProgress: [],
        upgradingProgress: 0,
        isStartingTree: tree.isStartingTree || false,
        isCut: false,
        cutProgress: 0
      })),
      bees: [],
      selectedBeeIds: new Set(),
      gameTime: 0,
      isPlaying: true,
      stars: 3,
      haloEffects: [],
      fireflies: [],
    });
    
    setLastClickedTreeId(null);
    setLastClickTime(0);

    const w = getWording(globalTimeOfDay);
    toast.success('🎮 Nouvelle partie - Carte aléatoire générée !');
  };

  const handleRestart = () => {
    // Contextuel : si on est en mode histoire, recommencer le niveau en cours
    if (currentScreen === 'story') {
      handleRestartLevel();
    } else {
      // Sinon, recommencer une partie aléatoire
      handleStartGame();
    }
  };

  const handleShowOptions = () => {
    setCurrentScreen('options');
  };

  const handleBackToMenu = () => {
    setCurrentScreen('menu');
    setTutorialCompleted(false); // Réinitialiser le statut du tutoriel
    // Rétablir les gridParams normaux quand on quitte le mode histoire
    const normalGridParams = calculateGridParams();
    setGridParams(normalGridParams);
  };

  const handleStartStoryMode = () => {
    setCurrentScreen('levelmap');
  };

  const handleResetProgress = () => {
    // Réinitialiser la progression des niveaux
    const initialProgress = {
      currentLevel: 1,
      currentSubLevel: 0,
      levels: INITIAL_LEVELS,
    };
    setLevelProgress(initialProgress);
    
    // Supprimer du localStorage
    resetLevelProgress();
    
    toast.success('✅ Progression réinitialisée !');
  };

  const handleUnlockAllLevels = () => {
    // Réinitialiser complètement avec INITIAL_LEVELS puis débloquer tout
    // Cela garantit que tous les sous-niveaux sont présents
    resetLevelProgress();
    
    const unlockedLevels = INITIAL_LEVELS.map(level => ({
      ...level,
      unlocked: true,
      completed: false,
      stars: 0,
      subLevels: level.subLevels.map(subLevel => ({
        ...subLevel,
        completed: false,
        stars: 0,
      })),
    }));
    
    setLevelProgress({
      currentLevel: 1,
      currentSubLevel: 0,
      levels: unlockedLevels,
    });
    
    toast.success('🔓 Tous les niveaux débloqués ! (rechargé depuis la structure initiale)');
  };

  const handleGoToFirstBattle = () => {
    // Sauter directement au sous-niveau "Premier combat" (1-5)
    victoryHandledRef.current = false;
    setTutorialCompleted(false);
    
    // Débloquer et compléter les sous-niveaux précédents
    setLevelProgress(prev => ({
      ...prev,
      currentLevel: 1,
      currentSubLevel: 4, // Index du sous-niveau 1-5 (premier combat)
      levels: prev.levels.map(level => {
        if (level.id === 1) {
          return {
            ...level,
            unlocked: true,
            subLevels: level.subLevels.map((subLevel, index) => ({
              ...subLevel,
              // Compléter les 4 premiers sous-niveaux
              completed: index < 4,
              stars: index < 4 ? 3 : 0,
            })),
          };
        }
        return level;
      }),
    }));
    
    // Calculer les gridParams pour le sous-niveau 1-5
    const newGridParams = calculateGridParams(1, 4);
    setGridParams(newGridParams);
    
    // Charger la configuration du niveau "Premier combat"
    const levelConfig = generateStoryLevel(
      1,
      4,
      'first_battle',
      newGridParams.cellSize,
      newGridParams.rows,
      newGridParams.cols,
      {
        gameStartRow: newGridParams.gameStartRow,
        gameEndRow: newGridParams.gameEndRow,
        gameStartCol: newGridParams.gameStartCol,
        gameEndCol: newGridParams.gameEndCol
      }
    );
    
    setMapData({
      trees: levelConfig.trees.map((tree, index) => ({
        ...tree,
        id: `tree-${index}`,
      })),
      ponds: levelConfig.ponds,
      grassGrid: levelConfig.grassGrid,
    });
    
    setGameOver(null);
    setGameState({
      trees: levelConfig.trees.map((tree, index) => ({
        ...tree,
        id: `tree-${index}`,
      })),
      bees: [],
      selectedBeeIds: new Set(),
      gameTime: 0,
      isPlaying: true,
      stars: 3,
      haloEffects: [],
      fireflies: [],
    });
    
    setLastClickedTreeId(null);
    setLastClickTime(0);
    setCurrentScreen('story');
    
    toast.success('⚔️ Niveau "Premier combat" chargé !');
  };

  const handleLevelClick = (levelId: number) => {
    const level = levelProgress.levels.find(l => l.id === levelId);
    if (!level || !level.unlocked) return;
    
    victoryHandledRef.current = false; // Réinitialiser le flag de victoire
    setTutorialCompleted(false); // Réinitialiser le statut du tutoriel
    
    // Start the first sub-level of this level
    setLevelProgress(prev => ({
      ...prev,
      currentLevel: levelId,
      currentSubLevel: 0,
    }));
    
    // Calculer les gridParams adaptés pour ce niveau
    const newGridParams = calculateGridParams(levelId, 0);
    setGridParams(newGridParams);
    
    // Load the level configuration
    const subLevel = level.subLevels[0];
    if (subLevel) {
      const levelConfig = generateStoryLevel(
        levelId,
        0,
        subLevel.type,
        newGridParams.cellSize,
        newGridParams.rows,
        newGridParams.cols,
        {
          gameStartRow: newGridParams.gameStartRow,
          gameEndRow: newGridParams.gameEndRow,
          gameStartCol: newGridParams.gameStartCol,
          gameEndCol: newGridParams.gameEndCol
        }
      );
      
      setMapData({
        trees: levelConfig.trees.map((tree, index) => ({
          ...tree,
          id: `tree-${index}`,
        })),
        ponds: levelConfig.ponds,
        grassGrid: levelConfig.grassGrid,
      });
      
      setGameOver(null);
      setGameState({
        trees: levelConfig.trees.map((tree, index) => ({
          ...tree,
          id: `tree-${index}`,
        })),
        bees: [],
        selectedBeeIds: new Set(),
        gameTime: 0,
        isPlaying: true,
        stars: 3,
        haloEffects: [],
        fireflies: [],
      });
      
      setLastClickedTreeId(null);
      setLastClickTime(0);
    }
    
    setCurrentScreen('story');
  };

  const handleLevelComplete = (stars: number, skipModal: boolean = false) => {
    setCurrentStars(stars);
    
    // Pour le tutoriel, ne pas afficher le modal
    if (!skipModal) {
      setShowLevelComplete(true);
    }
    
    // Update progress
    const { currentLevel, currentSubLevel } = levelProgress;
    setLevelProgress(prev => {
      const newLevels = [...prev.levels];
      const levelIndex = newLevels.findIndex(l => l.id === currentLevel);
      
      if (levelIndex !== -1) {
        const level = newLevels[levelIndex];
        if (level.subLevels[currentSubLevel]) {
          level.subLevels[currentSubLevel].completed = true;
          level.subLevels[currentSubLevel].stars = stars;
        }
      }
      
      return { ...prev, levels: newLevels };
    });
    
    // Note: La sauvegarde se fait automatiquement via useEffect
    console.log('💾 Progression sauvegardée automatiquement');
  };

  const handleRestartLevel = () => {
    setShowLevelComplete(false);
    setTutorialCompleted(false); // Réinitialiser le statut du tutoriel
    victoryHandledRef.current = false; // Réinitialiser le flag de victoire
    beeConsumedByPondRef.current = false; // Réinitialiser le flag de l'étang
    
    // Reload current sub-level
    const { currentLevel, currentSubLevel } = levelProgress;
    const level = levelProgress.levels.find(l => l.id === currentLevel);
    
    if (level && level.subLevels[currentSubLevel]) {
      // Recalculer les gridParams pour ce niveau
      const newGridParams = calculateGridParams(currentLevel, currentSubLevel);
      setGridParams(newGridParams);
      
      const subLevel = level.subLevels[currentSubLevel];
      const levelConfig = generateStoryLevel(
        currentLevel,
        currentSubLevel,
        subLevel.type,
        newGridParams.cellSize,
        newGridParams.rows,
        newGridParams.cols,
        {
          gameStartRow: newGridParams.gameStartRow,
          gameEndRow: newGridParams.gameEndRow,
          gameStartCol: newGridParams.gameStartCol,
          gameEndCol: newGridParams.gameEndCol
        }
      );
      
      setMapData({
        trees: levelConfig.trees.map((tree, index) => ({
          ...tree,
          id: `tree-${index}`,
        })),
        ponds: levelConfig.ponds,
        grassGrid: levelConfig.grassGrid,
      });
      
      setGameOver(null);
      setGameState({
        trees: levelConfig.trees.map((tree, index) => ({
          ...tree,
          id: `tree-${index}`,
        })),
        bees: [],
        selectedBeeIds: new Set(),
        gameTime: 0,
        isPlaying: true,
        stars: 3,
        haloEffects: [],
        fireflies: [],
      });
      
      setLastClickedTreeId(null);
      setLastClickTime(0);
    }
  };

  const handleNextLevel = () => {
    setShowLevelComplete(false);
    setTutorialCompleted(false); // Réinitialiser le statut du tutoriel
    victoryHandledRef.current = false; // Réinitialiser le flag de victoire
    beeConsumedByPondRef.current = false; // Réinitialiser le flag de l'étang
    
    const { currentLevel, currentSubLevel } = levelProgress;
    const level = levelProgress.levels.find(l => l.id === currentLevel);
    
    if (!level) return;
    
    // Si c'est le Level 1-5 (fin du tutoriel), retourner à la level map et déverrouiller niveau 2
    if (currentLevel === 1 && currentSubLevel === 4) {
      setLevelProgress(prev => {
        const newLevels = [...prev.levels];
        const levelIndex = newLevels.findIndex(l => l.id === currentLevel);
        
        if (levelIndex !== -1) {
          newLevels[levelIndex].completed = true;
          newLevels[levelIndex].stars = newLevels[levelIndex].subLevels.reduce((sum, sl) => sum + sl.stars, 0);
          
          // Unlock next level (niveau 2)
          if (levelIndex + 1 < newLevels.length) {
            newLevels[levelIndex + 1].unlocked = true;
          }
        }
        
        return { ...prev, levels: newLevels };
      });
      
      // Return to level map
      setCurrentScreen('levelmap');
      return;
    }
    
    // Check if there's a next sub-level
    if (currentSubLevel + 1 < level.subLevels.length) {
      const nextSubLevelIndex = currentSubLevel + 1;
      const nextSubLevel = level.subLevels[nextSubLevelIndex];
      
      // Update progress
      setLevelProgress(prev => ({
        ...prev,
        currentSubLevel: nextSubLevelIndex,
      }));
      
      // Recalculer les gridParams pour le prochain sous-niveau
      const newGridParams = calculateGridParams(currentLevel, nextSubLevelIndex);
      setGridParams(newGridParams);
      
      // Load next sub-level configuration
      const levelConfig = generateStoryLevel(
        currentLevel,
        nextSubLevelIndex,
        nextSubLevel.type,
        newGridParams.cellSize,
        newGridParams.rows,
        newGridParams.cols,
        {
          gameStartRow: newGridParams.gameStartRow,
          gameEndRow: newGridParams.gameEndRow,
          gameStartCol: newGridParams.gameStartCol,
          gameEndCol: newGridParams.gameEndCol
        }
      );
      
      setMapData({
        trees: levelConfig.trees.map((tree, index) => ({
          ...tree,
          id: `tree-${index}`,
        })),
        ponds: levelConfig.ponds,
        grassGrid: levelConfig.grassGrid,
      });
      
      setGameOver(null);
      setGameState({
        trees: levelConfig.trees.map((tree, index) => ({
          ...tree,
          id: `tree-${index}`,
        })),
        bees: [],
        selectedBeeIds: new Set(),
        gameTime: 0,
        isPlaying: true,
        stars: 3,
        haloEffects: [],
        fireflies: [],
      });
      
      setLastClickedTreeId(null);
      setLastClickTime(0);
    } else {
      // Level complete, unlock next level
      setLevelProgress(prev => {
        const newLevels = [...prev.levels];
        const levelIndex = newLevels.findIndex(l => l.id === currentLevel);
        
        if (levelIndex !== -1) {
          newLevels[levelIndex].completed = true;
          newLevels[levelIndex].stars = newLevels[levelIndex].subLevels.reduce((sum, sl) => sum + sl.stars, 0);
          
          // Unlock next level
          if (levelIndex + 1 < newLevels.length) {
            newLevels[levelIndex + 1].unlocked = true;
          }
        }
        
        return { ...prev, levels: newLevels };
      });
      
      // Return to level map
      setCurrentScreen('levelmap');
    }
  };

  // Utiliser les dimensions et marges calculées par gridParams
  const gameWidth = gridParams.gridWidth || gridParams.cols * gridParams.cellSize;
  const gameHeight = gridParams.gridHeight || gridParams.rows * gridParams.cellSize;
  const marginLeft = gridParams.marginLeft || 0;
  const marginTop = gridParams.marginTop || 0;
  
  // Pas de scale, le damier s'adapte toujours à l'écran
  // L'agrandissement se fait visuellement sur les arbres/abeilles
  const gameScale = 1;

  // Show menu or options screens
  if (currentScreen === 'menu') {
    return (
      <>
        <MainMenu 
          onStartGame={handleStartGame}
          onStartStoryMode={handleStartStoryMode}
          onShowOptions={handleShowOptions}
          timeOfDay={globalTimeOfDay}
          onToggleTimeOfDay={handleToggleTimeOfDay}
        />
        <AmbientSound 
          enabled={soundEnabled} 
          volume={0.3}
          soundUrl={globalTimeOfDay === 'night' 
            ? 'https://assets.mixkit.co/active_storage/sfx/2464/2464-preview.mp3'  // Prairie jour (inversé pour nuit)
            : 'https://assets.mixkit.co/active_storage/sfx/2466/2466-preview.mp3'  // Grillons + ruisseau (inversé pour jour)
          }
        />
      </>
    );
  }

  if (currentScreen === 'options') {
    return (
      <>
        <OptionsMenu 
          onBack={handleBackToMenu} 
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          timeOfDay={globalTimeOfDay}
          onToggleTimeOfDay={handleToggleTimeOfDay}
          onResetProgress={handleResetProgress}
          onGoToFirstBattle={handleGoToFirstBattle}
        />
        <AmbientSound 
          enabled={soundEnabled} 
          volume={0.3}
          soundUrl={globalTimeOfDay === 'night' 
            ? 'https://assets.mixkit.co/active_storage/sfx/2464/2464-preview.mp3'  // Prairie jour (inversé pour nuit)
            : 'https://assets.mixkit.co/active_storage/sfx/2466/2466-preview.mp3'  // Grillons + ruisseau (inversé pour jour)
          }
        />
      </>
    );
  }

  if (currentScreen === 'levelmap') {
    return (
      <>
        <LevelMap
          levels={levelProgress.levels}
          onLevelClick={handleLevelClick}
          onBack={handleBackToMenu}
          timeOfDay={globalTimeOfDay}
          onUnlockAll={handleUnlockAllLevels}
        />
        <AmbientSound 
          enabled={soundEnabled} 
          volume={0.3}
          soundUrl={globalTimeOfDay === 'night' 
            ? 'https://assets.mixkit.co/active_storage/sfx/2464/2464-preview.mp3'
            : 'https://assets.mixkit.co/active_storage/sfx/2466/2466-preview.mp3'
          }
        />
      </>
    );
  }

  // Game screen (both story and quick play modes)
  
  return (
    <div 
      className="relative overflow-hidden"
      style={{
        width: '100vw',
        height: '100vh',
        minHeight: '100vh',
        maxHeight: '100vh',
        backgroundColor: globalTimeOfDay === 'night' ? '#2a3d1a' : '#c2d040', // Couleur du damier
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'none',
        outline: 'none',
        border: 'none',
      }}
    >
      {/* Game container - remplit tout l'écran */}
      <div 
        className="absolute inset-0 overflow-hidden"
        style={{
          padding: 0,
          margin: 0,
          outline: 'none',
          border: 'none',
        }}
      >
        {/* Rendu SVG du jeu */}
        <GameBoard
          gameState={gameState}
          gridParams={gridParams}
          mapData={mapData}
          sunIntensity={sunIntensity}
          sunPosition={sunPosition}
          sparkles={sparkles}
          globalTimeOfDay={globalTimeOfDay}
          selectionCircle={selectionCircle}
          selectionStart={selectionStart}
          selectionCurrent={selectionCurrent}
          flashEffect={flashEffect}
          waterSplashes={waterSplashes}
          ripples={ripples}
          svgRef={svgRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
          onTreeClick={handleTreeClick}
          onTreeDragStart={handleTreeDragStart}
        />

        {/* Tutorial Banner (Story Mode only) - NON SCALÉ */}
        {currentScreen === 'story' && (() => {
          const { currentLevel, currentSubLevel } = levelProgress;
          const level = levelProgress.levels.find(l => l.id === currentLevel);
          const subLevel = level?.subLevels[currentSubLevel];
          
          return subLevel ? (
            <TutorialBanner
              title={subLevel.title}
              instructions={subLevel.instructions}
              timeOfDay={globalTimeOfDay}
              isCompleted={tutorialCompleted}
              onNext={handleNextLevel}
            />
          ) : null;
        })()}

        {/* UI */}
        <GameUI
          isPlaying={gameState.isPlaying}
          onPause={handlePause}
          onRestart={handleRestart}
          onHome={handleBackToMenu}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          timeOfDay={globalTimeOfDay}
          onToggleTimeOfDay={handleToggleTimeOfDay}
          onDragStart={handleTreeDragStart}
          isDragging={isDragging}
          hasSelection={!!selectionStart}
        />

        {/* Ambient Sound */}
        <AmbientSound 
          enabled={soundEnabled} 
          volume={0.3}
          soundUrl={globalTimeOfDay === 'night' 
            ? 'https://assets.mixkit.co/active_storage/sfx/2464/2464-preview.mp3'  // Prairie jour (inversé pour nuit)
            : 'https://assets.mixkit.co/active_storage/sfx/2466/2466-preview.mp3'  // Grillons + ruisseau (inversé pour jour)
          }
        />

        {/* Level Complete Modal (Story Mode) */}
        {currentScreen === 'story' && showLevelComplete && (
          <LevelCompleteModal
            stars={currentStars}
            onRestart={handleRestartLevel}
            onNext={handleNextLevel}
            timeOfDay={globalTimeOfDay}
            isFinalTutorial={levelProgress.currentLevel === 1 && levelProgress.currentSubLevel === 4}
          />
        )}

        {/* Game Over */}
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
            {/* Fond hexagonal */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="hexagons-gameover" x="0" y="0" width="100" height="86.6" patternUnits="userSpaceOnUse">
                  <polygon points="50,0 93.3,25 93.3,75 50,100 6.7,75 6.7,25" fill="none" stroke="#D97706" strokeWidth="3"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#hexagons-gameover)" />
            </svg>
            
            <div 
              className="relative p-12 rounded-3xl text-center"
              style={{
                background: 'linear-gradient(135deg, #FDB022 0%, #F59E0B 50%, #D97706 100%)',
                boxShadow: '0 12px 32px rgba(217, 119, 6, 0.5), inset 0 -4px 12px rgba(0,0,0,0.2), inset 0 4px 12px rgba(255,255,255,0.35)',
                border: '4px solid rgba(120, 53, 15, 0.4)',
              }}
            >
              {/* Texture cire */}
              <div 
                className="absolute inset-0 opacity-15 pointer-events-none rounded-3xl"
                style={{
                  backgroundImage: `
                    radial-gradient(circle at 25% 25%, rgba(255,255,255,0.5) 0%, transparent 50%),
                    radial-gradient(circle at 75% 75%, rgba(0,0,0,0.2) 0%, transparent 50%)
                  `
                }}
              />
              
              <div className="relative">
                <h2 
                  className="mb-6 select-none"
                  style={{ 
                    fontFamily: 'cursive',
                    fontSize: 'clamp(2.5rem, 8vw, 3.5rem)',
                    color: '#78350F',
                    textShadow: '0 2px 6px rgba(0,0,0,0.2)',
                    fontWeight: '900'
                  }}
                >
                  {gameOver === 'won' ? '🎉 Victoire!' : '💀 Défaite'}
                </h2>
                <p 
                  className="mb-8 text-amber-950"
                  style={{ 
                    fontSize: 'clamp(1.125rem, 4vw, 1.5rem)',
                    fontWeight: '700',
                    textShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                >
                  {gameOver === 'won'
                    ? 'Vous avez conquis la forêt!'
                    : 'Toutes vos ruches ont été détruites...'}
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={handleRestart}
                    className="px-8 py-4 hover:scale-105 transition-transform rounded-2xl"
                    style={{
                      background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
                      boxShadow: '0 10px 20px rgba(217, 119, 6, 0.5), inset 0 -4px 10px rgba(0,0,0,0.2), inset 0 4px 10px rgba(255,255,255,0.35)',
                      border: '4px solid rgba(120, 53, 15, 0.4)',
                    }}
                  >
                    <span className="text-amber-950" style={{ fontSize: 'clamp(1.125rem, 4vw, 1.25rem)', textShadow: '0 2px 4px rgba(0,0,0,0.2)', fontWeight: '700' }}>
                      🔄 Rejouer
                    </span>
                  </button>
                  <button
                    onClick={handleBackToMenu}
                    className="px-8 py-4 hover:scale-105 transition-transform rounded-2xl"
                    style={{
                      background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
                      boxShadow: '0 10px 20px rgba(217, 119, 6, 0.5), inset 0 -4px 10px rgba(0,0,0,0.2), inset 0 4px 10px rgba(255,255,255,0.35)',
                      border: '4px solid rgba(120, 53, 15, 0.4)',
                    }}
                  >
                    <span className="text-amber-950" style={{ fontSize: 'clamp(1.125rem, 4vw, 1.25rem)', textShadow: '0 2px 4px rgba(0,0,0,0.2)', fontWeight: '700' }}>
                      🏠 Menu
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

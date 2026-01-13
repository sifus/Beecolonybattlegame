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
  saveLevelProgress, 
  resetLevelProgress,
  loadSoundPreference,
  saveSoundPreference,
  loadTimeOfDayPreference,
  saveTimeOfDayPreference,
  isStorageAvailable 
} from './utils/storage';
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

// Coûts de construction et amélioration
const BUILD_HIVE_COST = 5;      // Abeilles nécessaires pour construire une ruche niveau 1
const UPGRADE_HIVE_COST = 20;   // Abeilles nécessaires pour améliorer niveau 1 → niveau 2

// Points de vie des ruches
const HIVE_L1_HP = 7;           // HP ruche niveau 1
const HIVE_L2_HP = 35;          // HP ruche niveau 2

// Limite de performance - arrête la production à ce nombre pour éviter saturation mémoire
const MAX_BEES = 250;           // Nombre maximum d'abeilles sur la carte

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
  const screenWidth = window.innerWidth || 390;
  const screenHeight = window.innerHeight || 844;
  
  // Espace UI
  const UI_TOP = 60;
  const UI_BOTTOM = levelId !== undefined ? 90 : 0;
  
  const availW = screenWidth;
  const availH = screenHeight - UI_TOP - UI_BOTTOM;
  
  // Tester différentes tailles de cellules (40px à 80px)
  // On veut MAXIMISER le nombre de cellules
  const MIN_CELL_SIZE = 40;
  const MAX_CELL_SIZE = 80;
  const MIN_GAME_CELLS = 6; // Minimum 6x6 pour la zone de jeu
  
  let bestConfig = { cellSize: 60, gameCols: 6, gameRows: 6, totalCells: 36 };
  
  for (let size = MIN_CELL_SIZE; size <= MAX_CELL_SIZE; size += 2) {
    // Calculer combien de cellules rentrent (avec 2 bordures)
    const totalCols = Math.floor(availW / size);
    const totalRows = Math.floor(availH / size);
    
    // Zone de jeu = total - 2 bordures
    const gameCols = totalCols - 2;
    const gameRows = totalRows - 2;
    
    // Vérifier minimums
    if (gameCols < MIN_GAME_CELLS || gameRows < MIN_GAME_CELLS) continue;
    
    const totalCells = gameCols * gameRows;
    
    // On préfère plus de cellules, mais pas trop petites
    // Score = totalCells - pénalité si trop petit
    const penalty = size < 50 ? (50 - size) * 2 : 0; // Pénaliser les cellules < 50px
    const score = totalCells - penalty;
    const bestScore = bestConfig.totalCells - (bestConfig.cellSize < 50 ? (50 - bestConfig.cellSize) * 2 : 0);
    
    if (score > bestScore) {
      bestConfig = { cellSize: size, gameCols, gameRows, totalCells };
    }
  }
  
  const cellSize = bestConfig.cellSize;
  const gameCols = bestConfig.gameCols;
  const gameRows = bestConfig.gameRows;
  
  // Grille TOTALE = zone de jeu + bordures (1 de chaque côté)
  const totalCols = gameCols + 2;
  const totalRows = gameRows + 2;
  
  // Dimensions EXACTES de la grille
  const gridW = totalCols * cellSize;
  const gridH = totalRows * cellSize;
  
  // CENTRAGE PARFAIT par rapport à l'espace disponible
  const marginLeft = Math.round((availW - gridW) / 2);
  const marginTop = Math.round((availH - gridH) / 2) + UI_TOP;
  
  console.log(`
🎮 GRILLE MAXIMISÉE + BORDURE DÉCORATIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 Écran: ${screenWidth}×${screenHeight}
📦 Dispo: ${availW}×${availH} (après UI)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 Zone de jeu: ${gameCols}×${gameRows} = ${bestConfig.totalCells} cellules
🖼️  Grille totale: ${totalCols}×${totalRows} (avec bordure)
📏 Cellule optimale: ${cellSize}px
📐 Grille: ${gridW}×${gridH}px
⬜ Centrage: L=${marginLeft} T=${marginTop - UI_TOP}
🎨 Espaces: L=${marginLeft} R=${availW - gridW - marginLeft} T=${marginTop - UI_TOP} B=${availH - gridH - (marginTop - UI_TOP)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `.trim());
  
  return { 
    cols: totalCols,
    rows: totalRows,
    cellSize,
    gridWidth: gridW,
    gridHeight: gridH,
    marginLeft,
    marginTop,
    // Indices de la zone de jeu (bordure = 0 et last)
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
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [lastClickedTreeId, setLastClickedTreeId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false); // Pour détecter si on drag ou clic simple
  const dragThreshold = 5; // Distance en pixels pour considérer un drag
  const svgRef = useRef<SVGSVGElement>(null);
  const victoryHandledRef = useRef(false); // Pour éviter les boucles infinies de victoire
  const beeConsumedByPondRef = useRef(false); // Pour détecter quand une abeille tombe dans l'étang (niveau dangers)
  const justSentBeesRef = useRef(false); // Pour éviter de sélectionner les abeilles après avoir envoyé des abeilles

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
            state: 'flying', // Les abeilles commencent en mouvement !
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
  
  // 🔄 Sauvegarde automatique de la progression
  useEffect(() => {
    if (isStorageAvailable()) {
      saveLevelProgress(levelProgress);
    }
  }, [levelProgress]);
  
  // 🔄 Sauvegarde automatique des préférences audio
  useEffect(() => {
    if (isStorageAvailable()) {
      saveSoundPreference(soundEnabled);
    }
  }, [soundEnabled]);
  
  // 🔄 Sauvegarde automatique de la préférence jour/nuit
  useEffect(() => {
    if (isStorageAvailable()) {
      saveTimeOfDayPreference(globalTimeOfDay);
    }
  }, [globalTimeOfDay]);
  
  // Détecter les changements de taille d'écran pour recalculer la grille
  // NE PAS recalculer pendant une partie active pour éviter la réinitialisation
  useEffect(() => {
    const handleResize = () => {
      // Ne recalculer que si on est au menu ou en sélection de niveau
      if (currentScreen !== 'menu' && currentScreen !== 'story-levels') {
        return;
      }
      
      const newParams = calculateGridParams(
        currentScreen === 'story' ? levelProgress.currentLevel : undefined,
        currentScreen === 'story' ? levelProgress.currentSubLevel : undefined
      );
      const changed = 
        newParams.cols !== gridParams.cols || 
        newParams.rows !== gridParams.rows || 
        newParams.cellSize !== gridParams.cellSize;
      
      if (changed) {
        setGridParams(newParams);
      }
    };
    
    const handleOrientationChange = () => {
      // Ne rien faire pendant une partie active
      if (currentScreen !== 'menu' && currentScreen !== 'story-levels') {
        return;
      }
      
      // Délai pour laisser le temps à l'orientation de se finaliser
      setTimeout(() => {
        handleResize();
      }, 300);
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [gridParams, currentScreen, levelProgress]);

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

  // Game loop
  useEffect(() => {
    if (!gameState.isPlaying) return;

    const interval = setInterval(() => {
      setGameState((prev) => {
        const newState = { ...prev };
        
        // Update bees
        const updatedBees = [...newState.bees];
        const beesToRemove = new Set<string>();
        
        // FIX PERFORMANCE : Adapter la vitesse selon le nombre d'abeilles
        // Quand il y a beaucoup d'abeilles, la boucle ralentit, donc on augmente la vitesse
        const beeSpeedMultiplier = newState.bees.length > 100 
          ? 1.5  // 50% plus rapide si >100 abeilles
          : newState.bees.length > 50 
            ? 1.25 // 25% plus rapide si >50 abeilles
            : 1.0; // Vitesse normale si <50 abeilles

        updatedBees.forEach((bee) => {
          if (bee.state === 'idle' && bee.treeId) {
            // Circular orbit around tree with varying radius for cloud effect
            const tree = newState.trees.find((t) => t.id === bee.treeId);
            
            if (tree && !tree.isCut) {
              // Orbit with varying radius based on bee's unique offset
              bee.angle += 0.01;
              // Use a consistent radius variation based on bee id
              const baseRadius = 38;
              const radiusVariation = ((parseInt(bee.id.slice(-5), 36) % 16) - 8); // -8 to +8
              const radius = baseRadius + radiusVariation;
              bee.x = tree.x + Math.cos(bee.angle) * radius;
              bee.y = tree.y + Math.sin(bee.angle) * radius;
            } else if (tree && tree.isCut) {
              // L'arbre a été coupé, l'abeille se détache
              bee.treeId = null;
              
              // If enemy bee, send back to nearest enemy tree
              if (bee.owner === 'enemy') {
                const enemyTrees = newState.trees.filter(t => t.owner === 'enemy' && !t.isCut);
                if (enemyTrees.length > 0) {
                  let closestTree = enemyTrees[0];
                  let minDist = Math.sqrt(Math.pow(bee.x - closestTree.x, 2) + Math.pow(bee.y - closestTree.y, 2));
                  
                  enemyTrees.forEach(tree => {
                    const dist = Math.sqrt(Math.pow(bee.x - tree.x, 2) + Math.pow(bee.y - tree.y, 2));
                    if (dist < minDist) {
                      minDist = dist;
                      closestTree = tree;
                    }
                  });
                  
                  bee.state = 'moving';
                  bee.targetTreeId = closestTree.id;
                }
              }
            }
          } else if (bee.state === 'moving' && bee.targetTreeId) {
            // Move towards target tree (with offset for cloud effect)
            const target = newState.trees.find((t) => t.id === bee.targetTreeId);
            if (target && target.isCut) {
              // La cible a été coupée, annuler le mouvement
              bee.state = 'idle';
              bee.targetTreeId = null;
            } else if (target) {
              const offsetX = bee.offsetX || 0;
              const offsetY = bee.offsetY || 0;
              const targetX = target.x + offsetX;
              const targetY = target.y + offsetY;
              
              const dx = targetX - bee.x;
              const dy = targetY - bee.y;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist < 5) {
                // Arrived at target
                const treeIndex = newState.trees.findIndex((t) => t.id === target.id);
                
                if (treeIndex !== -1) {
                  const tree = newState.trees[treeIndex];
                  
                  // Check if tree is cut - bees pass through without interaction
                  if (tree.isCut) {
                    // La souche est inactive, l'abeille continue son chemin
                    bee.targetTreeId = null;
                    bee.state = 'idle';
                    bee.offsetX = undefined;
                    bee.offsetY = undefined;
                  } else if (tree.owner === 'neutral' || tree.owner === bee.owner) {
                    // Arrivée à un arbre neutre ou allié - se mettre à tourner autour
                    // Garder l'angle actuel pour éviter un saut visuel
                    // Si pas d'angle défini, calculer l'angle basé sur la position actuelle
                    if (bee.angle === undefined || bee.angle === null) {
                      bee.angle = Math.atan2(bee.y - tree.y, bee.x - tree.x);
                    }
                    bee.state = 'idle';
                    bee.treeId = target.id;
                    bee.targetTreeId = null;
                    bee.offsetX = undefined;
                    bee.offsetY = undefined;
                    tree.beeCount++;
                  } else {
                    // Arrivée à un arbre ennemi - marquer pour résolution de combat groupé
                    // L'abeille se met temporairement à orbiter, le combat sera résolu après
                    // Garder l'angle actuel pour éviter un saut visuel
                    if (bee.angle === undefined || bee.angle === null) {
                      bee.angle = Math.atan2(bee.y - tree.y, bee.x - tree.x);
                    }
                    bee.state = 'idle';
                    bee.treeId = target.id;
                    bee.targetTreeId = null;
                    bee.offsetX = undefined;
                    bee.offsetY = undefined;
                    tree.beeCount++;
                  }
                }
              } else {
                // Continue moving - slower speed
                const speed = 0.8 * beeSpeedMultiplier;
                bee.x += (dx / dist) * speed;
                bee.y += (dy / dist) * speed;
                
                // Check if bee is over a pond - lose 20% of group
                const isOverPond = mapData.ponds.some(pond => {
                  return bee.x >= pond.x && 
                         bee.x <= pond.x + pond.width * gridParams.cellSize && 
                         bee.y >= pond.y && 
                         bee.y <= pond.y + pond.height * gridParams.cellSize;
                });
                
                if (isOverPond && Math.random() < 0.002) { // Small chance per frame to lose bee
                  beesToRemove.add(bee.id);
                  
                  // Marquer qu'une abeille a été consommée par l'étang (pour le niveau dangers)
                  beeConsumedByPondRef.current = true;
                  
                  // Créer un splash visuel
                  const splashId = `splash-${Date.now()}-${Math.random()}`;
                  setWaterSplashes(prev => [...prev, { 
                    x: bee.x, 
                    y: bee.y, 
                    id: splashId,
                    timestamp: Date.now()
                  }]);
                  
                  // Retirer le splash après 800ms
                  setTimeout(() => {
                    setWaterSplashes(prev => prev.filter(s => s.id !== splashId));
                  }, 800);
                }
              }
            }
          } else if (bee.state === 'moving' && bee.targetX !== undefined && bee.targetY !== undefined) {
            // Move towards free position on map
            const dx = bee.targetX - bee.x;
            const dy = bee.targetY - bee.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 5) {
              // Arrived at target position - just hover there
              bee.state = 'idle';
              bee.targetX = undefined;
              bee.targetY = undefined;
              bee.angle = Math.random() * Math.PI * 2;
            } else {
              // Continue moving
              const speed = 0.8 * beeSpeedMultiplier;
              bee.x += (dx / dist) * speed;
              bee.y += (dy / dist) * speed;
              
              // Check if bee is over a pond
              const isOverPond = mapData.ponds.some(pond => {
                return bee.x >= pond.x && 
                       bee.x <= pond.x + pond.width * gridParams.cellSize && 
                       bee.y >= pond.y && 
                       bee.y <= pond.y + pond.height * gridParams.cellSize;
              });
              
              if (isOverPond && Math.random() < 0.002) {
                beesToRemove.add(bee.id);
                
                // Créer un splash visuel
                const splashId = `splash-${Date.now()}-${Math.random()}`;
                setWaterSplashes(prev => [...prev, { 
                  x: bee.x, 
                  y: bee.y, 
                  id: splashId,
                  timestamp: Date.now()
                }]);
                
                // Retirer le splash après 800ms
                setTimeout(() => {
                  setWaterSplashes(prev => prev.filter(s => s.id !== splashId));
                }, 800);
              }
            }
          } else if (bee.state === 'building' && bee.buildingTreeId) {
            // Abeille en train de construire - vole vers le centre de l'arbre
            const targetTree = newState.trees.find(t => t.id === bee.buildingTreeId);
            if (!targetTree) {
              // L'arbre a disparu, annuler
              bee.state = 'idle';
              bee.buildingTreeId = null;
            } else {
              const dx = targetTree.x - bee.x;
              const dy = targetTree.y - bee.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              
              if (dist < 5) {
                // Arrivée au centre - consommer l'abeille
                const getMaxHealth = (level: number) => level === 2 ? HIVE_L2_HP : HIVE_L1_HP;
                
                // Déterminer si c'est une réparation, un upgrade, ou une construction
                let damagedHiveIndex = -1;
                if (targetTree.owner === 'player' && targetTree.hiveHealth.length > 0) {
                  // Vérifier d'abord la ruche (si elle existe et est endommagée)
                  const health0 = targetTree.hiveHealth[0];
                  const level0 = targetTree.hiveLevel[0] || 1;
                  if (health0 < getMaxHealth(level0)) {
                    damagedHiveIndex = 0;
                  }
                }
                
                if (damagedHiveIndex !== -1) {
                  // RÉPARATION
                  const level = targetTree.hiveLevel[damagedHiveIndex] || 1;
                  const maxHealth = getMaxHealth(level);
                  const currentHealth = targetTree.hiveHealth[damagedHiveIndex];
                  
                  if (currentHealth < maxHealth) {
                    const newHealth = [...targetTree.hiveHealth];
                    newHealth[damagedHiveIndex] = Math.min(maxHealth, currentHealth + 1);
                    targetTree.hiveHealth = newHealth;
                    
                    if (newHealth[damagedHiveIndex] === maxHealth) {
                      // Réparation complète - effet de halo
                      setFlashEffect({ x: targetTree.x, y: targetTree.y, type: 'small' });
                      setTimeout(() => setFlashEffect(null), 800);
                      const w = getWording(globalTimeOfDay);
                      toast.success(`${w.hiveCapital} réparé${w.hive === 'cocon' ? '' : 'e'} !`);
                    }
                  }
                  beesToRemove.add(bee.id);
                } else if (targetTree.hiveCount === 1 && targetTree.hiveLevel[0] === 1 && !targetTree.isStartingTree && targetTree.owner === 'player') {
                  // UPGRADE NIVEAU 1 -> NIVEAU 2 (seulement sur ruches alliées, pas arbre de départ)
                  // RÈGLE : La ruche doit être intacte pour être améliorée
                  const currentHealth = targetTree.hiveHealth[0] || 0;
                  if (currentHealth < HIVE_L1_HP) {
                    // Ruche endommagée - ne pas permettre l'amélioration
                    // L'abeille est consommée mais ne contribue pas à l'amélioration
                    beesToRemove.add(bee.id);
                  } else {
                    const currentProgress = targetTree.upgradingProgress || 0;
                    
                    // FIX : Ne upgrader que si pas déjà niveau 2 (évite le bug similaire)
                    if (currentProgress >= UPGRADE_HIVE_COST || targetTree.hiveLevel[0] === 2) {
                      // Upgrade déjà complète - annuler cette abeille
                      beesToRemove.add(bee.id);
                    } else {
                      const newProgress = currentProgress + 1;
                      targetTree.upgradingProgress = newProgress;
                      
                      if (newProgress >= UPGRADE_HIVE_COST) {
                        // Upgrade complète !
                        targetTree.hiveLevel[0] = 2;
                        targetTree.hiveHealth[0] = HIVE_L2_HP;
                        targetTree.upgradingProgress = 0;
                        
                        // Effet de halo lumineux
                        const existingHalos = newState.haloEffects || [];
                        newState.haloEffects = [...existingHalos, { treeId: targetTree.id, timestamp: Date.now() }];
                        
                        setFlashEffect({ x: targetTree.x, y: targetTree.y, type: 'large' });
                        setTimeout(() => setFlashEffect(null), 1000);
                        const w = getWording(globalTimeOfDay);
                        toast.success(`${w.hiveCapital} amélioré${w.hive === 'cocon' ? '' : 'e'} au niveau 2 !`);
                      }
                      
                      beesToRemove.add(bee.id);
                    }
                  }
                } else if (targetTree.hiveCount === 0 && targetTree.maxHives === 1 && (targetTree.owner === 'player' || targetTree.owner === 'neutral')) {
                  // CONSTRUCTION NOUVELLE RUCHE NIVEAU 1
                  // Seulement si l'arbre est au joueur OU neutre (mais PAS ennemi)
                  const buildingProgress = targetTree.buildingProgress || [];
                  const currentProgress = buildingProgress[0] || 0;
                  
                  // FIX : Ne construire que si pas déjà complète (évite le bug 40 abeilles -> ruche L1 + 5/20)
                  if (currentProgress >= BUILD_HIVE_COST) {
                    // Construction déjà complète - annuler cette abeille
                    beesToRemove.add(bee.id);
                  } else {
                    const newProgress = currentProgress + 1;
                    
                    const newBuildingProgress = [...buildingProgress];
                    newBuildingProgress[0] = newProgress;
                    targetTree.buildingProgress = newBuildingProgress;
                    
                    if (newProgress >= BUILD_HIVE_COST) {
                      // Construction complète !
                    targetTree.hiveCount = 1;
                    targetTree.hiveHealth = [HIVE_L1_HP];
                    targetTree.hiveLevel = [1];
                    newBuildingProgress[0] = 0;
                    targetTree.buildingProgress = newBuildingProgress;
                    
                    // Effet de halo lumineux
                    const existingHalos = newState.haloEffects || [];
                    newState.haloEffects = [...existingHalos, { treeId: targetTree.id, timestamp: Date.now() }];
                    
                      setFlashEffect({ x: targetTree.x, y: targetTree.y, type: 'large' });
                      setTimeout(() => setFlashEffect(null), 1000);
                      const w = getWording(globalTimeOfDay);
                      toast.success(`${w.hiveCapital} niveau 1 créé${w.hive === 'cocon' ? '' : 'e'} !`);
                    }
                    
                    beesToRemove.add(bee.id);
                  }
                } else {
                  // Aucune action possible (arbre ennemi, conditions non remplies, etc.)
                  // L'abeille redevient idle et arrête de construire
                  bee.state = 'idle';
                  bee.buildingTreeId = null;
                }
              } else {
                // Continue vers le centre
                const speed = 1.2;
                bee.x += (dx / dist) * speed;
                bee.y += (dy / dist) * speed;
                
                // RÈGLE : Les abeilles en mode 'building' (en mission de construction/réparation/upgrade)
                // ne tombent PAS dans l'étang - elles volent avec détermination vers leur objectif
                // Cela évite de perdre la contribution de l'abeille qui a été consommée du compteur
              }
            }
          } else if (bee.state === 'idle' && bee.treeId === null && bee.targetX === undefined) {
            // Hovering in place (arrived at free position)
            // If this is an enemy bee, send it back to nearest enemy tree
            if (bee.owner === 'enemy') {
              const enemyTrees = newState.trees.filter(t => t.owner === 'enemy' && !t.isCut);
              if (enemyTrees.length > 0) {
                let closestTree = enemyTrees[0];
                let minDist = Math.sqrt(Math.pow(bee.x - closestTree.x, 2) + Math.pow(bee.y - closestTree.y, 2));
                
                enemyTrees.forEach(tree => {
                  const dist = Math.sqrt(Math.pow(bee.x - tree.x, 2) + Math.pow(bee.y - tree.y, 2));
                  if (dist < minDist) {
                    minDist = dist;
                    closestTree = tree;
                  }
                });
                
                bee.state = 'moving';
                bee.targetTreeId = closestTree.id;
              }
            } else {
              // Player bees just hover in place
              // Small circular movement to maintain cloud formation
              if (!bee.hoverCenterX) {
                bee.hoverCenterX = bee.x;
                bee.hoverCenterY = bee.y;
              }
              bee.angle += 0.02;
              const wiggleRadius = 3;
              bee.x = bee.hoverCenterX + Math.cos(bee.angle) * wiggleRadius;
              bee.y = bee.hoverCenterY + Math.sin(bee.angle) * wiggleRadius;
            }
          }
        });

        // Remove dead bees
        newState.bees = updatedBees.filter((bee) => !beesToRemove.has(bee.id));

        // Check for bee vs bee combat - collision entre toutes les abeilles ennemies
        // Zone de détection légèrement plus grande que l'abeille (15px au lieu de 10px)
        const allBees = newState.bees;
        const collisionRadius = 15;
        
        for (let i = 0; i < allBees.length; i++) {
          const bee1 = allBees[i];
          if (beesToRemove.has(bee1.id)) continue;
          
          for (let j = i + 1; j < allBees.length; j++) {
            const bee2 = allBees[j];
            if (beesToRemove.has(bee2.id)) continue;
            
            // Seulement si les abeilles sont de propriétaires différents
            if (bee1.owner !== bee2.owner) {
              const dx = bee1.x - bee2.x;
              const dy = bee1.y - bee2.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              
              if (dist < collisionRadius) {
                beesToRemove.add(bee1.id);
                beesToRemove.add(bee2.id);
                
                // Mettre à jour le beeCount si les abeilles sont attachées à des arbres
                if (bee1.treeId) {
                  const tree1 = newState.trees.find(t => t.id === bee1.treeId);
                  if (tree1) tree1.beeCount--;
                }
                if (bee2.treeId) {
                  const tree2 = newState.trees.find(t => t.id === bee2.treeId);
                  if (tree2) tree2.beeCount--;
                }
              }
            }
          }
        }

        // RÉSOLUTION DES COMBATS GROUPÉS PAR ARBRE
        // Pour chaque arbre, résoudre les combats entre abeilles de différents propriétaires
        newState.trees.forEach((tree) => {
          if (tree.isCut) return;
          
          // Compter les abeilles par propriétaire autour de cet arbre
          const beesAtTree = updatedBees.filter(b => b.treeId === tree.id && !beesToRemove.has(b.id));
          const playerBees = beesAtTree.filter(b => b.owner === 'player');
          const enemyBees = beesAtTree.filter(b => b.owner === 'enemy');
          
          // S'il y a des abeilles des deux camps, résoudre le combat
          if (playerBees.length > 0 && enemyBees.length > 0) {
            const minCount = Math.min(playerBees.length, enemyBees.length);
            
            // Supprimer le même nombre d'abeilles de chaque camp
            for (let i = 0; i < minCount; i++) {
              beesToRemove.add(playerBees[i].id);
              beesToRemove.add(enemyBees[i].id);
              tree.beeCount -= 2;
            }
          }
          
          // Si toutes les abeilles ennemies sont éliminées et qu'il reste des abeilles joueur
          // elles peuvent attaquer les ruches
          const remainingPlayerBees = playerBees.filter(b => !beesToRemove.has(b.id));
          const remainingEnemyBees = enemyBees.filter(b => !beesToRemove.has(b.id));
          
          if (remainingPlayerBees.length > 0 && remainingEnemyBees.length === 0) {
            // Plus d'abeilles ennemies, attaquer les structures ennemies
            if (tree.owner === 'enemy') {
              // NOUVELLES RÈGLES DE DESTRUCTION
              let totalCostToDestroy = 0;
              let targetType: 'hive' | 'hive-upgrading' | 'construction' | null = null;
              
              // Déterminer le coût total pour détruire selon l'état de l'arbre
              if (tree.hiveHealth.length > 0) {
                // Ruche terminée (niveau 1 ou 2)
                const currentHP = tree.hiveHealth[0];
                const upgradingProgress = tree.upgradingProgress || 0;
                
                if (upgradingProgress > 0) {
                  // Ruche niveau 1 en cours d'amélioration : HP + progression
                  totalCostToDestroy = currentHP + upgradingProgress;
                  targetType = 'hive-upgrading';
                } else {
                  // Ruche sans amélioration en cours : juste les HP
                  totalCostToDestroy = currentHP;
                  targetType = 'hive';
                }
              } else if (tree.buildingProgress && tree.buildingProgress[0] > 0) {
                // Construction en cours sans ruche terminée
                totalCostToDestroy = tree.buildingProgress[0];
                targetType = 'construction';
              }
              
              // Consommer les abeilles nécessaires
              if (targetType && totalCostToDestroy > 0) {
                let beesUsed = 0;
                
                remainingPlayerBees.forEach(bee => {
                  if (beesUsed < totalCostToDestroy) {
                    beesToRemove.add(bee.id);
                    tree.beeCount--;
                    beesUsed++;
                  }
                });
                
                // Si on a assez d'abeilles pour détruire complètement
                if (beesUsed >= totalCostToDestroy) {
                  if (targetType === 'hive-upgrading') {
                    // Ruche avec amélioration détruite d'un coup
                    tree.hiveHealth = [];
                    tree.hiveLevel = [];
                    tree.hiveCount = 0;
                    tree.upgradingProgress = 0;
                    tree.owner = 'neutral';
                    
                    toast.success(`Ruche + amélioration détruites ! Arbre neutre (${beesUsed} abeilles utilisées).`);
                  } else if (targetType === 'hive') {
                    // Ruche sans amélioration détruite
                    tree.hiveHealth = [];
                    tree.hiveLevel = [];
                    tree.hiveCount = 0;
                    tree.owner = 'neutral';
                    
                    toast.success(`Ruche détruite ! Arbre neutre (${beesUsed} abeilles utilisées).`);
                  } else if (targetType === 'construction') {
                    // Construction détruite
                    tree.buildingProgress = [];
                    tree.owner = 'neutral';
                    
                    toast.success(`Construction détruite ! Arbre neutre (${beesUsed} abeilles utilisées).`);
                  }
                } else {
                  // Pas assez d'abeilles - dégâts partiels
                  if (targetType === 'hive-upgrading') {
                    // Réduire d'abord l'upgrade, puis les HP
                    const upgradingProgress = tree.upgradingProgress || 0;
                    if (beesUsed <= upgradingProgress) {
                      tree.upgradingProgress = upgradingProgress - beesUsed;
                      toast.info(`Progression d'amélioration réduite : ${tree.upgradingProgress}/${UPGRADE_HIVE_COST}`);
                    } else {
                      const remainingDamage = beesUsed - upgradingProgress;
                      tree.upgradingProgress = 0;
                      const newHealth = Math.max(0, tree.hiveHealth[0] - remainingDamage);
                      const currentLevel = tree.hiveLevel[0] || 1; // Préserver le niveau
                      tree.hiveHealth = [newHealth];
                      tree.hiveLevel = [currentLevel]; // Recréer l'array pour éviter mutations
                      
                      // Vérifier si la ruche est complètement détruite après les dégâts
                      if (newHealth === 0) {
                        tree.hiveHealth = [];
                        tree.hiveLevel = [];
                        tree.hiveCount = 0;
                        tree.owner = 'neutral';
                        toast.success(`Ruche + amélioration détruites ! Arbre neutre (${beesUsed} abeilles).`);
                      } else {
                        toast.info(`Amélioration annulée, ruche endommagée : ${newHealth}/${HIVE_L1_HP} HP`);
                      }
                    }
                  } else if (targetType === 'hive') {
                    // Réduire les HP - IMPORTANT: Créer de nouveaux arrays pour éviter les mutations
                    const newHealth = Math.max(0, tree.hiveHealth[0] - beesUsed);
                    const currentLevel = tree.hiveLevel[0] || 1; // Préserver le niveau
                    tree.hiveHealth = [newHealth];
                    tree.hiveLevel = [currentLevel]; // Recréer l'array pour éviter mutations
                    
                    // Vérifier si la ruche est complètement détruite après les dégâts
                    if (newHealth === 0) {
                      tree.hiveHealth = [];
                      tree.hiveLevel = [];
                      tree.hiveCount = 0;
                      tree.owner = 'neutral';
                      toast.success(`Ruche niveau ${currentLevel} détruite ! Arbre neutre (${beesUsed} abeilles).`);
                    } else {
                      // Dégâts partiels
                      const maxHP = currentLevel === 2 ? HIVE_L2_HP : HIVE_L1_HP;
                      toast.info(`Ruche niveau ${currentLevel} endommagée : ${newHealth}/${maxHP} HP (-${beesUsed} HP)`);
                    }
                  } else if (targetType === 'construction') {
                    // Réduire la progression de construction
                    tree.buildingProgress[0] = Math.max(0, tree.buildingProgress[0] - beesUsed);
                    
                    // Vérifier si la construction est complètement annulée après les dégâts
                    if (tree.buildingProgress[0] === 0) {
                      tree.buildingProgress = [];
                      tree.owner = 'neutral';
                      toast.success(`Construction détruite ! Arbre neutre (${beesUsed} abeilles utilisées).`);
                    }
                  }
                }
              }
            }
          }
          
          // ATTAQUE DES RUCHES DU JOUEUR PAR L'ENNEMI (même logique)
          if (remainingEnemyBees.length > 0 && remainingPlayerBees.length === 0) {
            // Plus d'abeilles joueur, attaquer les structures du joueur
            if (tree.owner === 'player') {
              // NOUVELLES RÈGLES DE DESTRUCTION (côté ennemi)
              let totalCostToDestroy = 0;
              let targetType: 'hive' | 'hive-upgrading' | 'construction' | null = null;
              
              // Déterminer le coût total pour détruire selon l'état de l'arbre
              if (tree.hiveHealth.length > 0) {
                // Ruche terminée (niveau 1 ou 2)
                const currentHP = tree.hiveHealth[0];
                const upgradingProgress = tree.upgradingProgress || 0;
                
                if (upgradingProgress > 0) {
                  // Ruche niveau 1 en cours d'amélioration : HP + progression
                  totalCostToDestroy = currentHP + upgradingProgress;
                  targetType = 'hive-upgrading';
                } else {
                  // Ruche sans amélioration en cours : juste les HP
                  totalCostToDestroy = currentHP;
                  targetType = 'hive';
                }
              } else if (tree.buildingProgress && tree.buildingProgress[0] > 0) {
                // Construction en cours sans ruche terminée
                totalCostToDestroy = tree.buildingProgress[0];
                targetType = 'construction';
              }
              
              // Consommer les abeilles nécessaires
              if (targetType && totalCostToDestroy > 0) {
                let beesUsed = 0;
                
                remainingEnemyBees.forEach(bee => {
                  if (beesUsed < totalCostToDestroy) {
                    beesToRemove.add(bee.id);
                    tree.beeCount--;
                    beesUsed++;
                  }
                });
                
                // Si on a assez d'abeilles pour détruire complètement
                if (beesUsed >= totalCostToDestroy) {
                  if (targetType === 'hive-upgrading') {
                    // Ruche avec amélioration détruite d'un coup
                    tree.hiveHealth = [];
                    tree.hiveLevel = [];
                    tree.hiveCount = 0;
                    tree.upgradingProgress = 0;
                    tree.owner = 'neutral';
                    
                    toast.error(`Votre ruche + amélioration détruites (${beesUsed} abeilles) !`);
                  } else if (targetType === 'hive') {
                    // Ruche sans amélioration détruite
                    tree.hiveHealth = [];
                    tree.hiveLevel = [];
                    tree.hiveCount = 0;
                    tree.owner = 'neutral';
                    
                    toast.error(`Votre ruche détruite (${beesUsed} abeilles) !`);
                  } else if (targetType === 'construction') {
                    // Construction détruite
                    tree.buildingProgress = [];
                    tree.owner = 'neutral';
                    
                    toast.error(`Votre construction détruite (${beesUsed} abeilles) !`);
                  }
                } else {
                  // Pas assez d'abeilles - dégâts partiels
                  if (targetType === 'hive-upgrading') {
                    // Réduire d'abord l'upgrade, puis les HP
                    const upgradingProgress = tree.upgradingProgress || 0;
                    if (beesUsed <= upgradingProgress) {
                      tree.upgradingProgress = upgradingProgress - beesUsed;
                      toast.error(`Amélioration attaquée : ${tree.upgradingProgress}/${UPGRADE_HIVE_COST} (-${beesUsed})`);
                    } else {
                      const remainingDamage = beesUsed - upgradingProgress;
                      tree.upgradingProgress = 0;
                      const newHealth = Math.max(0, tree.hiveHealth[0] - remainingDamage);
                      const currentLevel = tree.hiveLevel[0] || 1; // Préserver le niveau
                      tree.hiveHealth = [newHealth];
                      tree.hiveLevel = [currentLevel]; // Recréer l'array pour éviter mutations
                      
                      // Vérifier si la ruche est complètement détruite après les dégâts
                      if (newHealth === 0) {
                        tree.hiveHealth = [];
                        tree.hiveLevel = [];
                        tree.hiveCount = 0;
                        tree.owner = 'neutral';
                        toast.error(`Votre ruche + amélioration détruites (${beesUsed} abeilles) !`);
                      } else {
                        toast.error(`Amélioration annulée, ruche endommagée : ${newHealth}/${HIVE_L1_HP} HP`);
                      }
                    }
                  } else if (targetType === 'hive') {
                    // Réduire les HP - IMPORTANT: Créer de nouveaux arrays pour éviter les mutations
                    const newHealth = Math.max(0, tree.hiveHealth[0] - beesUsed);
                    const currentLevel = tree.hiveLevel[0] || 1; // Préserver le niveau
                    tree.hiveHealth = [newHealth];
                    tree.hiveLevel = [currentLevel]; // Recréer l'array pour éviter mutations
                    
                    // Vérifier si la ruche est complètement détruite après les dégâts
                    if (newHealth === 0) {
                      tree.hiveHealth = [];
                      tree.hiveLevel = [];
                      tree.hiveCount = 0;
                      tree.owner = 'neutral';
                      toast.error(`Votre ruche niveau ${currentLevel} détruite (${beesUsed} abeilles) !`);
                    } else {
                      // Dégâts partiels
                      const maxHP = currentLevel === 2 ? HIVE_L2_HP : HIVE_L1_HP;
                      toast.error(`Ruche niveau ${currentLevel} attaquée : ${newHealth}/${maxHP} HP (-${beesUsed} HP)`);
                    }
                  } else if (targetType === 'construction') {
                    // Réduire la progression de construction
                    tree.buildingProgress[0] = Math.max(0, tree.buildingProgress[0] - beesUsed);
                    
                    // Vérifier si la construction est complètement annulée après les dégâts
                    if (tree.buildingProgress[0] === 0) {
                      tree.buildingProgress = [];
                      tree.owner = 'neutral';
                      toast.error(`Votre construction détruite (${beesUsed} abeilles) !`);
                    }
                  }
                }
              }
            }
          }
        });

        newState.bees = newState.bees.filter((bee) => !beesToRemove.has(bee.id));

        return newState;
      });
    }, 1000 / 60); // 60 FPS

    return () => clearInterval(interval);
  }, [gameState.isPlaying, mapData.ponds]);

  // Production loop - varies by hive level
  useEffect(() => {
    if (!gameState.isPlaying) return;

    const interval = setInterval(() => {
      setGameState((prev) => {
        const newState = { ...prev };
        const newBees: BeeType[] = [];
        const now = Date.now();

        // LIMITE DE PERFORMANCE : Arrêter la production si trop d'abeilles
        if (newState.bees.length >= MAX_BEES) {
          return newState;
        }

        newState.trees.forEach((tree) => {
          // Produce bees from hives (tant qu'elles ne sont pas détruites et que l'arbre n'est pas coupé)
          if (tree.isCut) return;
          
          // Ne pas produire d'abeilles si des abeilles ennemies sont autour (en combat)
          const hasEnemyBeesAround = newState.bees.some(bee => 
            bee.treeId === tree.id && bee.owner !== tree.owner && tree.owner !== 'neutral'
          );
          if (hasEnemyBeesAround) return;
          
          tree.hiveHealth.forEach((health, i) => {
            if (tree.owner !== 'neutral') {
              // Une ruche produit tant qu'elle a plus de 0 HP
              if (health > 0) {
                const level = tree.hiveLevel[i] || 1;
                const shouldProduce = level === 2 || (level === 1 && now % 3000 < 1000);
                
                if (shouldProduce) {
                  const hiveY = tree.y - 10;
                  const angle = Math.random() * Math.PI * 2;
                  
                  // Générer l'ID de l'abeille pour calculer son rayon orbital
                  const beeId = `bee-${tree.id}-${now}-${Math.random()}`;
                  
                  // Calculer la position orbitale cible pour un mouvement fluide
                  // Utiliser le même calcul que dans l'orbite pour éviter les sauts
                  const baseRadius = 38;
                  const radiusVariation = ((parseInt(beeId.slice(-5), 36) % 16) - 8); // -8 to +8
                  const radius = baseRadius + radiusVariation;
                  const targetX = tree.x + Math.cos(angle) * radius;
                  const targetY = tree.y + Math.sin(angle) * radius;
                  
                  // Les abeilles apparaissent sur la ruche avec un halo puis rejoignent l'essaim
                  newBees.push({
                    id: beeId,
                    x: tree.x,
                    y: hiveY,
                    owner: tree.owner,
                    treeId: null, // Pas encore attachée à l'arbre
                    targetTreeId: tree.id, // Va se diriger vers l'arbre
                    state: 'moving',
                    angle,
                    offsetX: targetX - tree.x,
                    offsetY: targetY - tree.y,
                    createdAt: now,
                  });
                  tree.beeCount++;
                }
              }
            }
          });
        });

        // Ne rajouter que le nombre d'abeilles qui ne dépasse pas MAX_BEES
        const availableSlots = MAX_BEES - newState.bees.length;
        const beesToAdd = newBees.slice(0, Math.max(0, availableSlots));
        
        newState.bees = [...newState.bees, ...beesToAdd];
        return newState;
      });
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, [gameState.isPlaying]);

  /**
   * RÉSERVÉ POUR FUTURE FONCTIONNALITÉ: Bûcherons
   * Cette fonctionnalité sera réactivée dans une prochaine version
   */
  useEffect(() => {
    return;
    /* 
    if (!gameState.isPlaying) return;
    if (!gameState.lumberjackGameplayEnabled) return; // Ne pas spawner si désactivé

    // Spawn a new lumberjack randomly
    const spawnInterval = setInterval(() => {
      if (Math.random() < 0.4) { // 40% chance every interval
        setGameState(prev => {
          // Don't spawn if gameplay disabled
          if (!prev.lumberjackGameplayEnabled) return prev;
          
          // Only spawn if there's no lumberjack already on the map
          if ((prev.lumberjacks || []).length > 0) return prev;
          
          const availableTrees = prev.trees.filter(t => !t.isCut);
          if (availableTrees.length === 0) return prev;
          
          const targetTree = availableTrees[Math.floor(Math.random() * availableTrees.length)];
          const mapWidth = gridParams.cols * gridParams.cellSize;
          
          // Spawn from random edge
          const spawnFromLeft = Math.random() < 0.5;
          const newLumberjack: LumberjackType = {
            id: `lumberjack-${Date.now()}`,
            x: spawnFromLeft ? -50 : mapWidth + 50,
            y: targetTree.y,
            targetTreeId: targetTree.id,
            health: 5,
            state: 'walking',
            chopProgress: 0,
            isConverted: false,
            drownTimer: 0
          };
          
          toast.warning('Un bûcheron arrive !');
          
          return {
            ...prev,
            lumberjacks: [...(prev.lumberjacks || []), newLumberjack]
          };
        });
      }
    }, 15000); // Check every 15 seconds

    return () => clearInterval(spawnInterval);
    */
  }, [gameState.isPlaying, gameState.lumberjackGameplayEnabled]);

  // Fireflies animation loop
  useEffect(() => {
    if (globalTimeOfDay !== 'night') return;

    const interval = setInterval(() => {
      setGameState(prev => {
        if (prev.timeOfDay !== 'night' || !prev.fireflies) return prev;
        
        return {
          ...prev,
          fireflies: prev.fireflies.map(firefly => ({
            ...firefly,
            phase: firefly.phase + 0.05,
            brightness: (Math.sin(firefly.phase) + 1) / 2, // Oscillation entre 0 et 1
          }))
        };
      });
    }, 1000 / 30); // 30 FPS pour animation fluide

    return () => clearInterval(interval);
  }, [globalTimeOfDay]);

  // Lumberjack movement and chopping logic
  useEffect(() => {
    if (!gameState.isPlaying) return;
    if (!gameState.lumberjackGameplayEnabled) return; // Pas de logique si désactivé

    const interval = setInterval(() => {
      setGameState(prev => {
        if (!prev.lumberjackGameplayEnabled) return prev; // Double check
        const newState = { ...prev };
        const lumberjacksToRemove = new Set<string>();
        
        newState.lumberjacks?.forEach(lumberjack => {
          if (lumberjack.state === 'dead') {
            lumberjacksToRemove.add(lumberjack.id);
            return;
          }

          const targetTree = newState.trees.find(t => t.id === lumberjack.targetTreeId);
          if (!targetTree || targetTree.isCut) {
            // Tree is gone or cut
            if (lumberjack.isConverted) {
              // Try to find another enemy tree
              const enemyTrees = newState.trees.filter(t => t.owner === 'enemy' && !t.isCut);
              if (enemyTrees.length > 0) {
                lumberjack.targetTreeId = enemyTrees[Math.floor(Math.random() * enemyTrees.length)].id;
                return;
              }
            }
            lumberjacksToRemove.add(lumberjack.id);
            return;
          }



          // Check for attacking bees (only bees explicitly sent to attack with targetLumberjackId)
          const attackingBees = newState.bees.filter(bee => {
            const dx = bee.x - lumberjack.x;
            const dy = bee.y - lumberjack.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist >= 30) return false;
            
            // Only bees with targetLumberjackId set to this lumberjack attack
            if (bee.targetLumberjackId !== lumberjack.id) return false;
            
            // Player bees attack non-converted lumberjacks
            if (bee.owner === 'player' && !lumberjack.isConverted) return true;
            
            // Enemy bees attack converted lumberjacks (defending)
            if (bee.owner === 'enemy' && lumberjack.isConverted) return true;
            
            return false;
          });

          if (attackingBees.length > 0 && lumberjack.state !== 'fighting') {
            lumberjack.state = 'fighting';
          }

          // Damage from bees (1 damage per bee per interval)
          if (attackingBees.length > 0 && lumberjack.state === 'fighting') {
            lumberjack.health = Math.max(0, lumberjack.health - attackingBees.length * 0.1);
            if (lumberjack.health <= 0) {
              lumberjack.state = 'dead';
              
              // Send attacking bees back to their nearest tree
              attackingBees.forEach(bee => {
                bee.targetLumberjackId = null;
                const friendlyTrees = newState.trees.filter(t => t.owner === bee.owner && !t.isCut);
                if (friendlyTrees.length > 0) {
                  let closestTree = friendlyTrees[0];
                  let minDist = Math.sqrt(Math.pow(bee.x - closestTree.x, 2) + Math.pow(bee.y - closestTree.y, 2));
                  
                  friendlyTrees.forEach(tree => {
                    const dist = Math.sqrt(Math.pow(bee.x - tree.x, 2) + Math.pow(bee.y - tree.y, 2));
                    if (dist < minDist) {
                      minDist = dist;
                      closestTree = tree;
                    }
                  });
                  
                  bee.state = 'moving';
                  bee.targetTreeId = closestTree.id;
                } else {
                  bee.state = 'idle';
                }
              });
              
              toast.success('Bûcheron vaincu !');
              lumberjacksToRemove.add(lumberjack.id);
              return;
            }
          } else if (lumberjack.state === 'fighting' && attackingBees.length === 0) {
            lumberjack.state = 'walking';
          }



          // Movement towards tree
          if (lumberjack.state === 'walking') {
            const dx = targetTree.x - lumberjack.x;
            const dy = targetTree.y - lumberjack.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 60) {
              // Move towards tree - ralenti
              const speed = 0.4;
              lumberjack.x += (dx / dist) * speed;
              lumberjack.y += (dy / dist) * speed;
            } else {
              // Arrived, start chopping
              lumberjack.state = 'chopping';
            }
          }

          // Chopping logic
          if (lumberjack.state === 'chopping') {
            // Chaque coup dure 3 secondes (temps de création de 3 abeilles en ruche simple)
            // À 60 FPS, 3 secondes = 180 frames, donc 1/180 ≈ 0.0056
            lumberjack.chopProgress += 0.0056; // Progress per frame
            
            if (lumberjack.chopProgress >= 1) {
              // One chop completed
              lumberjack.chopProgress = 0;
              
              if (targetTree.hiveCount > 0) {
                // Damage hive
                const lastHiveIndex = targetTree.hiveHealth.length - 1;
                const newHealth = Math.max(0, targetTree.hiveHealth[lastHiveIndex] - 1);
                targetTree.hiveHealth = [...targetTree.hiveHealth];
                targetTree.hiveHealth[lastHiveIndex] = newHealth;
                
                if (newHealth === 0) {
                  // Hive destroyed
                  targetTree.hiveHealth = targetTree.hiveHealth.slice(0, -1);
                  targetTree.hiveLevel = targetTree.hiveLevel.slice(0, -1);
                  targetTree.hiveCount--;
                  
                  if (lumberjack.isConverted) {
                    toast.success('Le bûcheron allié a détruit une ruche ennemie !');
                  } else {
                    toast.error('Le bûcheron a détruit une ruche !');
                  }
                }
              } else if (!lumberjack.isConverted) {
                // Cut the tree
                targetTree.cutProgress = (targetTree.cutProgress || 0) + 1;
                
                if (targetTree.cutProgress >= 10) {
                  // Tree is cut!
                  targetTree.isCut = true;
                  targetTree.hiveCount = 0;
                  targetTree.hiveHealth = [];
                  targetTree.hiveLevel = [];
                  targetTree.beeCount = 0;
                  toast.error('Un arbre a été coupé !');
                  
                  // Detach all bees from this tree (they stay alive but become idle)
                  newState.bees = newState.bees.map(bee => {
                    if (bee.treeId === targetTree.id) {
                      return { ...bee, treeId: null, state: 'idle' as const };
                    }
                    return bee;
                  });
                  
                  lumberjacksToRemove.add(lumberjack.id);
                }
              }
            }
          }
        });

        if (newState.lumberjacks) {
          newState.lumberjacks = newState.lumberjacks.filter(l => !lumberjacksToRemove.has(l.id));
        }
        
        // Nettoyer les halos après 2 secondes
        if (newState.haloEffects) {
          const now = Date.now();
          newState.haloEffects = newState.haloEffects.filter(halo => now - halo.timestamp < 2000);
        }
        
        return newState;
      });
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [gameState.isPlaying, gameState.lumberjackGameplayEnabled]);

  // Timer
  useEffect(() => {
    if (!gameState.isPlaying) return;

    const interval = setInterval(() => {
      setGameState((prev) => ({
        ...prev,
        gameTime: prev.gameTime + 1,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.isPlaying]);

  // AI logic for enemy - uses intelligent AI
  useEffect(() => {
    if (!gameState.isPlaying) return;

    // Intervalle d'IA adapté : plus lent pour le tutoriel premier combat (6s) vs normal (3s)
    const isFirstBattleLevel = currentScreen === 'story' && 
                                levelProgress.currentLevel === 1 && 
                                levelProgress.currentSubLevel === 4;
    const aiInterval = isFirstBattleLevel ? 6000 : 3000; // Premier combat : 6s, reste : 3s
    
    const interval = setInterval(() => {
      setGameState((prev) => {
        // IA normale pour tous les niveaux (y compris premier combat)
        return enemyAITick(prev, mapData);
      });
    }, aiInterval);

    return () => clearInterval(interval);
  }, [gameState.isPlaying, mapData, currentScreen, levelProgress]);

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
    setIsDragging(false); // Reset au début
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
    setIsDragging(false); // Reset au début
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
      } else if (tree.hiveCount === 1 && tree.hiveLevel[0] === 1 && !tree.isStartingTree) {
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
      } else if (tree.hiveCount === 0 && tree.maxHives === 1) {
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
        backgroundColor: globalTimeOfDay === 'night' ? '#2a3d1a' : '#d4d448', // Couleur moyenne du damier
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
        {/* Conteneur du jeu avec scale */}
        <div 
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            overflow: 'hidden',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
            outline: 'none',
            border: 'none',
          }}
        >
        {/* Background SVG - Grass patchwork and ponds */}
        <svg 
          className="absolute" 
          style={{ 
            zIndex: 0, 
            left: `${marginLeft}px`,
            top: `${marginTop}px`,
            width: `${gameWidth}px`,
            height: `${gameHeight}px`,
          }}
          viewBox={`0 0 ${gameWidth} ${gameHeight}`}
          preserveAspectRatio="none"
        >
          {/* Définir le filtre de grain de texture */}
          <defs>
            <filter id="grain-texture">
              <feTurbulence 
                type="fractalNoise" 
                baseFrequency="0.9" 
                numOctaves="4" 
                result="noise"
              />
              <feColorMatrix
                in="noise"
                type="matrix"
                values="0 0 0 0 0
                        0 0 0 0 0
                        0 0 0 0 0
                        0 0 0 0.03 0"
              />
              <feBlend mode="overlay" in2="SourceGraphic" />
            </filter>
          </defs>

          {/* Grass patchwork pattern with random dark borders */}
          {mapData.grassGrid.map((grass, idx) => (
            <g key={`grass-${idx}`}>
              <rect
                x={grass.x}
                y={grass.y}
                width={gridParams.cellSize}
                height={gridParams.cellSize}
                fill={grass.color}
              />
              <rect
                x={grass.x + grass.borderOffset}
                y={grass.y + grass.borderOffset}
                width={gridParams.cellSize - grass.borderOffset * 2}
                height={gridParams.cellSize - grass.borderOffset * 2}
                fill="none"
                stroke="#6B7A3D"
                strokeWidth={1}
                opacity={0.15}
              />
            </g>
          ))}
          
          {/* Couche de grain de texture sur tout le damier */}
          <rect
            x={0}
            y={0}
            width={gameWidth}
            height={gameHeight}
            fill="transparent"
            filter="url(#grain-texture)"
            pointerEvents="none"
          />

          {/* DEBUG : Visualisation de la bordure décorative */}
          {/* Bordure GAUCHE */}
          <rect
            x={0}
            y={0}
            width={gridParams.cellSize}
            height={gameHeight}
            fill="rgba(255, 0, 0, 0.1)"
            stroke="rgba(255, 0, 0, 0.3)"
            strokeWidth={2}
            strokeDasharray="5,5"
            pointerEvents="none"
          />
          {/* Bordure DROITE */}
          <rect
            x={(gridParams.cols - 1) * gridParams.cellSize}
            y={0}
            width={gridParams.cellSize}
            height={gameHeight}
            fill="rgba(255, 0, 0, 0.1)"
            stroke="rgba(255, 0, 0, 0.3)"
            strokeWidth={2}
            strokeDasharray="5,5"
            pointerEvents="none"
          />
          {/* Bordure HAUT */}
          <rect
            x={0}
            y={0}
            width={gameWidth}
            height={gridParams.cellSize}
            fill="rgba(255, 0, 0, 0.1)"
            stroke="rgba(255, 0, 0, 0.3)"
            strokeWidth={2}
            strokeDasharray="5,5"
            pointerEvents="none"
          />
          {/* Bordure BAS */}
          <rect
            x={0}
            y={(gridParams.rows - 1) * gridParams.cellSize}
            width={gameWidth}
            height={gridParams.cellSize}
            fill="rgba(255, 0, 0, 0.1)"
            stroke="rgba(255, 0, 0, 0.3)"
            strokeWidth={2}
            strokeDasharray="5,5"
            pointerEvents="none"
          />
          {/* Zone de jeu - contour VERT */}
          <rect
            x={gridParams.cellSize}
            y={gridParams.cellSize}
            width={(gridParams.cols - 2) * gridParams.cellSize}
            height={(gridParams.rows - 2) * gridParams.cellSize}
            fill="none"
            stroke="rgba(0, 255, 0, 0.5)"
            strokeWidth={3}
            pointerEvents="none"
          />
          {/* Légende en haut à gauche */}
          <g>
            <rect x={10} y={10} width={200} height={70} fill="rgba(255,255,255,0.9)" rx={5} />
            <text x={20} y={30} fill="#ff0000" fontSize={14} fontWeight="bold">🔴 Bordure décorative</text>
            <text x={20} y={50} fill="#00ff00" fontSize={14} fontWeight="bold">🟢 Zone de jeu</text>
            <text x={20} y={70} fill="#000" fontSize={12}>{gridParams.cols}×{gridParams.rows} ({gridParams.cellSize}px)</text>
          </g>

          {/* Night overlay - voile sombre avec lumière de lune bleutée */}
          {globalTimeOfDay === 'night' && (
            <>
              {/* Voile sombre */}
              <rect
                x={0}
                y={0}
                width={gameWidth}
                height={gameHeight}
                fill="#0a0e27"
                opacity={0.65}
                pointerEvents="none"
              />
              
              {/* Gradient de lumière de lune depuis le haut-droit */}
              <defs>
                <radialGradient id="moonlight" cx="85%" cy="15%" r="70%">
                  <stop offset="0%" stopColor="#a8c5dd" stopOpacity={0.15} />
                  <stop offset="40%" stopColor="#6b8ba3" stopOpacity={0.08} />
                  <stop offset="100%" stopColor="#1a2332" stopOpacity={0} />
                </radialGradient>
              </defs>
              <rect
                x={0}
                y={0}
                width={gameWidth}
                height={gameHeight}
                fill="url(#moonlight)"
                pointerEvents="none"
              />
            </>
          )}
          
          {/* Ponds with top edge and reflection - lumière du haut-gauche (jour) ou haut-droit (nuit) */}
          {mapData.ponds.map((pond, idx) => (
            <g key={`pond-${idx}`}>
              {/* Pond base */}
              <rect
                x={pond.x}
                y={pond.y}
                width={pond.width * gridParams.cellSize}
                height={pond.height * gridParams.cellSize}
                fill={globalTimeOfDay === 'night' ? 'rgb(20, 60, 100)' : 'rgb(55, 173, 238)'}
                rx={8}
              />
              
              {/* Rebord sur le haut */}
              <rect
                x={pond.x}
                y={pond.y}
                width={pond.width * gridParams.cellSize}
                height={3}
                fill="#000"
                opacity={globalTimeOfDay === 'night' ? 0.4 : 0.2}
                rx={8}
                pointerEvents="none"
              />
              
              {/* Petit reflet lumineux (haut-gauche jour, haut-droit nuit) */}
              <ellipse
                cx={globalTimeOfDay === 'night' 
                  ? pond.x + (pond.width * gridParams.cellSize) * 0.75 
                  : pond.x + (pond.width * gridParams.cellSize) * 0.25}
                cy={pond.y + (pond.height * gridParams.cellSize) * 0.2}
                rx={(pond.width * gridParams.cellSize) * 0.2}
                ry={(pond.height * gridParams.cellSize) * 0.15}
                fill={globalTimeOfDay === 'night' ? '#a8c5dd' : '#fff'}
                opacity={globalTimeOfDay === 'night' ? 0.25 : 0.4}
                pointerEvents="none"
              />
            </g>
          ))}
        </svg>

        {/* Game SVG - Interactive layer */}
        <svg
          ref={svgRef}
          className="absolute"
          style={{ 
            zIndex: 10, 
            left: `${marginLeft}px`,
            top: `${marginTop}px`,
            width: `${gameWidth}px`,
            height: `${gameHeight}px`,
          }}
          viewBox={`0 0 ${gameWidth} ${gameHeight}`}
          preserveAspectRatio="none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
        >
        {/* Trees - BASE LAYER (trunks and foliage) */}
        {gameState.trees.map((tree) => {
          const playerBeesAtTree = gameState.bees.filter(
            b => b.treeId === tree.id && b.owner === 'player' && b.state === 'idle'
          ).length;
          
          return (
            <Tree 
              key={`${tree.id}-base`} 
              tree={tree} 
              onClick={(e) => handleTreeClick(tree.id, e)}
              onDragStart={handleTreeDragStart}
              playerBeesCount={playerBeesAtTree}
              cellSize={gridParams.cellSize}
              renderLayer="base"
              isNightMode={globalTimeOfDay === 'night'}
            />
          );
        })}

        {/* Lumberjacks - DÉSACTIVÉ TEMPORAIREMENT */}
        {/* {gameState.lumberjackGameplayEnabled && gameState.lumberjacks?.map((lumberjack) => (
          <Lumberjack 
            key={lumberjack.id} 
            lumberjack={lumberjack} 
            cellSize={gridParams.cellSize}
            onClick={(e) => handleLumberjackClick(lumberjack.id, e)}
          />
        ))} */}

        {/* Selection circle animation */}
        {selectionCircle && (
          <motion.circle
            cx={selectionCircle.x}
            cy={selectionCircle.y}
            r={selectionCircle.radius}
            fill="none"
            stroke={globalTimeOfDay === 'night' ? '#7FFF00' : '#FDD835'}
            strokeWidth={4}
            initial={{ opacity: 0.8, scale: 0.8 }}
            animate={{ opacity: 0, scale: 1.3 }}
            transition={{ duration: 0.5 }}
          />
        )}

        {/* Flash effect on tree click */}
        {flashEffect && (
          <motion.circle
            cx={flashEffect.x}
            cy={flashEffect.y}
            r={flashEffect.type === 'large' ? 80 : 50}
            fill={globalTimeOfDay === 'night' ? '#7FFF00' : '#FFEB3B'}
            initial={{ opacity: 0.9, scale: 0.5 }}
            animate={{ opacity: 0, scale: 2 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        )}

        {/* Halo effects when hive is completed */}
        {gameState.haloEffects?.map((halo, idx) => {
          const tree = gameState.trees.find(t => t.id === halo.treeId);
          if (!tree) return null;
          
          const isNight = globalTimeOfDay === 'night';
          
          return (
            <g key={`halo-${halo.treeId}-${halo.timestamp}`}>
              {/* Multiple expanding halos */}
              <motion.circle
                cx={tree.x}
                cy={tree.y}
                r={60}
                fill="none"
                stroke={isNight ? '#7FFF00' : '#FDD835'}
                strokeWidth={3}
                initial={{ opacity: 0.8, scale: 0.5 }}
                animate={{ opacity: 0, scale: 2.5 }}
                transition={{ duration: 2, ease: 'easeOut' }}
              />
              <motion.circle
                cx={tree.x}
                cy={tree.y}
                r={60}
                fill="none"
                stroke={isNight ? '#9FFF00' : '#FFEB3B'}
                strokeWidth={2}
                initial={{ opacity: 0.6, scale: 0.6 }}
                animate={{ opacity: 0, scale: 2.8 }}
                transition={{ duration: 2, ease: 'easeOut', delay: 0.2 }}
              />
              <motion.circle
                cx={tree.x}
                cy={tree.y}
                r={60}
                fill="none"
                stroke={isNight ? '#CCFF99' : '#FFF9C4'}
                strokeWidth={1}
                initial={{ opacity: 0.4, scale: 0.7 }}
                animate={{ opacity: 0, scale: 3 }}
                transition={{ duration: 2, ease: 'easeOut', delay: 0.4 }}
              />
            </g>
          );
        })}

        {/* Selection circle */}
        {selectionStart && selectionCurrent && (() => {
          const diameter = Math.sqrt(
            Math.pow(selectionCurrent.x - selectionStart.x, 2) +
              Math.pow(selectionCurrent.y - selectionStart.y, 2)
          );
          const centerX = (selectionStart.x + selectionCurrent.x) / 2;
          const centerY = (selectionStart.y + selectionCurrent.y) / 2;
          const radius = diameter / 2;
          
          const isNight = globalTimeOfDay === 'night';
          
          return (
            <>
              {/* Glow effect for selection circle */}
              <circle
                cx={centerX}
                cy={centerY}
                r={radius}
                fill={isNight ? 'rgba(127, 255, 0, 0.08)' : 'rgba(255, 235, 59, 0.08)'}
                stroke={isNight ? '#7FFF00' : '#FFEB3B'}
                strokeWidth={4}
                opacity={0.95}
                strokeDasharray="10 5"
                style={{ filter: isNight ? 'drop-shadow(0 0 8px rgba(127, 255, 0, 0.8))' : 'drop-shadow(0 0 8px rgba(255, 235, 59, 0.8))' }}
              />
              {/* Diameter line */}
              <line
                x1={selectionStart.x}
                y1={selectionStart.y}
                x2={selectionCurrent.x}
                y2={selectionCurrent.y}
                stroke={isNight ? '#7FFF00' : '#FFEB3B'}
                strokeWidth={2}
                opacity={0.7}
                strokeDasharray="5 5"
              />
            </>
          );
        })()}
        
        {/* Trees - TOP LAYER (hives, indicators, counters) - ALWAYS ON TOP */}
        {gameState.trees.map((tree) => {
          const playerBeesAtTree = gameState.bees.filter(
            b => b.treeId === tree.id && b.owner === 'player' && b.state === 'idle'
          ).length;
          
          return (
            <Tree 
              key={`${tree.id}-top`} 
              tree={tree} 
              onClick={(e) => handleTreeClick(tree.id, e)}
              onDragStart={handleTreeDragStart}
              playerBeesCount={playerBeesAtTree}
              cellSize={gridParams.cellSize}
              renderLayer="top"
              isNightMode={globalTimeOfDay === 'night'}
            />
          );
        })}
        
        {/* Water splashes - when bees fall in ponds */}
        {waterSplashes.map((splash) => {
          const age = Date.now() - splash.timestamp;
          const opacity = Math.max(0, 1 - age / 800);
          const scale = 1 + (age / 800) * 0.5;
          
          return (
            <g key={splash.id} opacity={opacity}>
              {/* Ripple circles - expanding effect */}
              <circle
                cx={splash.x}
                cy={splash.y}
                r={6 * scale}
                fill="none"
                stroke="#4A90E2"
                strokeWidth={2}
                opacity={0.8}
              />
              <circle
                cx={splash.x}
                cy={splash.y}
                r={10 * scale}
                fill="none"
                stroke="#6CB4EE"
                strokeWidth={1.5}
                opacity={0.5}
              />
              <circle
                cx={splash.x}
                cy={splash.y}
                r={3}
                fill="#4A90E2"
                opacity={1}
              />
            </g>
          );
        })}
        
        {/* Bees - rendered last to be on top of everything */}
        {gameState.bees.map((bee) => (
          <Bee 
            key={bee.id} 
            bee={bee} 
            isSelected={gameState.selectedBeeIds.has(bee.id)} 
            isNightMode={globalTimeOfDay === 'night'}
          />
        ))}
        </svg>
        </div>
        {/* Fin du conteneur scalé du jeu */}

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

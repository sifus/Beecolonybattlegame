import { useEffect } from 'react';
import { GameState, Bee as BeeType } from '../types/game';
import { LevelProgress } from '../types/levels';
import { PondShape } from '../utils/mapGenerator';
import { enemyAITick } from '../utils/enemyAI';
import { toast } from '../utils/toast';
import { getWording } from '../utils/wording';
import {
  BUILD_HIVE_COST,
  UPGRADE_HIVE_COST,
  HIVE_L1_HP,
  HIVE_L2_HP,
  MAX_BEES,
  BEE_ORBIT_RADIUS_SOLO,
  BEE_ORBIT_RADIUS_GROUP,
} from '../constants/gameRules';

interface GridParams {
  cols: number;
  rows: number;
  cellSize: number;
  gameStartCol: number;
  gameEndCol: number;
  gameStartRow: number;
  gameEndRow: number;
}

interface MapData {
  trees: GameState['trees'];
  ponds: PondShape[];
}

interface UseGameLoopParams {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  gridParams: GridParams;
  mapData: MapData;
  globalTimeOfDay: 'day' | 'night';
  currentScreen: string;
  levelProgress: LevelProgress;
  beeConsumedByPondRef: React.MutableRefObject<boolean>;
  setWaterSplashes: React.Dispatch<React.SetStateAction<Array<{ x: number; y: number; id: string; timestamp: number; pondIdx: number }>>>;
  setFlashEffect: React.Dispatch<React.SetStateAction<{ x: number; y: number; type: 'small' | 'large' } | null>>;
  setDyingBees: React.Dispatch<React.SetStateAction<Array<{ id: string; x: number; y: number; timestamp: number; owner: string }>>>;
}

export function useGameLoop({
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
  setDyingBees,
}: UseGameLoopParams): void {

  // Game loop — 60 FPS : déplacements abeilles, combat, construction
  useEffect(() => {
    if (!gameState.isPlaying) return;

    const interval = setInterval(() => {
      setGameState((prev) => {
        const newState = { ...prev };

        // Update bees
        const updatedBees = [...newState.bees];
        const beesToRemove = new Set<string>();

        // Zone safe abeilles : accessible quel que soit l'écran, avec marge du bord physique
        const SCREEN_SAFE_MARGIN = 22;
        const screenW = window.innerWidth;
        const screenH = window.innerHeight;
        const gameWidth  = gridParams.cols * gridParams.cellSize;
        const gameHeight = gridParams.rows * gridParams.cellSize;
        const marginLeft = Math.round((screenW - gameWidth) / 2);
        const marginTop  = Math.round((screenH - gameHeight) / 2);
        const minX = -marginLeft + SCREEN_SAFE_MARGIN;
        const maxX =  screenW - marginLeft - SCREEN_SAFE_MARGIN;
        const minY = -marginTop + SCREEN_SAFE_MARGIN;
        const maxY =  screenH - marginTop - SCREEN_SAFE_MARGIN;

        const cellSizeScale = gridParams.cellSize / 80;

        updatedBees.forEach((bee) => {
          if (bee.state === 'idle' && bee.treeId) {
            const tree = newState.trees.find((t) => t.id === bee.treeId);

            if (tree && !tree.isCut) {
              // Direction et vitesse orbitale individuelles — space feel
              const idHash = parseInt(bee.id.slice(-5), 36);
              const orbitDir = idHash % 2 === 0 ? 1 : -1;
              const orbitSpeed = 0.007 + (idHash % 9) * 0.0008;
              bee.angle += orbitSpeed * orbitDir;

              const baseRadius = (tree.maxHives === 2 ? BEE_ORBIT_RADIUS_GROUP : BEE_ORBIT_RADIUS_SOLO) * (gridParams.cellSize / 80);
              const radiusVariation = ((idHash % 16) - 8);
              const radius = baseRadius + radiusVariation;
              bee.x = tree.x + Math.cos(bee.angle) * radius;
              const orbitCenterY = tree.y + gridParams.cellSize * (tree.maxHives === 2 ? 0.13 : 0.215);
              bee.y = orbitCenterY + Math.sin(bee.angle) * radius;
              bee.displayAngle = bee.angle + Math.PI / 2;

              // Abeilles idle au-dessus d'un marais — meurent moins vite
              const idlePondIdx = mapData.ponds.findIndex(pond => {
                const pw = pond.width * gridParams.cellSize;
                const ph = pond.height * gridParams.cellSize;
                const cx = pond.x + pw / 2;
                const cy = pond.y + ph / 2;
                return ((bee.x - cx) / (pw * 0.30)) ** 2 + ((bee.y - cy) / (ph * 0.30)) ** 2 <= 1;
              });
              if (idlePondIdx !== -1 && Math.random() < 0.0009) {
                beesToRemove.add(bee.id);
                const dyingId = `dying-${bee.id}-${Date.now()}`;
                setDyingBees(prev => [...prev, { id: dyingId, x: bee.x, y: bee.y, timestamp: Date.now(), owner: bee.owner, angle: bee.displayAngle ?? bee.angle }]);
                setTimeout(() => setDyingBees(prev => prev.filter(d => d.id !== dyingId)), 3000);
                const splashId = `splash-idle-${Date.now()}-${Math.random()}`;
                setWaterSplashes(prev => [...prev, { x: bee.x, y: bee.y, id: splashId, timestamp: Date.now(), pondIdx: idlePondIdx }]);
                setTimeout(() => setWaterSplashes(prev => prev.filter(s => s.id !== splashId)), 1400);
              }
            } else if (tree && tree.isCut) {
              bee.treeId = null;

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
            const target = newState.trees.find((t) => t.id === bee.targetTreeId);
            if (target && target.isCut) {
              bee.state = 'idle';
              bee.targetTreeId = null;
            } else if (target) {
              const offsetX = bee.offsetX || 0;
              const offsetY = bee.offsetY || 0;
              // Cible clampée dans la zone safe : l'abeille s'arrête avant le mur
              const targetX = Math.max(minX + 2, Math.min(maxX - 2, target.x + offsetX));
              const targetY = Math.max(minY + 2, Math.min(maxY - 2, target.y + offsetY));

              const dx = targetX - bee.x;
              const dy = targetY - bee.y;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist < 5) {
                const treeIndex = newState.trees.findIndex((t) => t.id === target.id);

                if (treeIndex !== -1) {
                  const tree = newState.trees[treeIndex];

                  if (tree.isCut) {
                    bee.targetTreeId = null;
                    bee.state = 'idle';
                    bee.offsetX = undefined;
                    bee.offsetY = undefined;
                  } else if (tree.owner === 'neutral' || tree.owner === bee.owner) {
                    // Angle depuis le centre orbital de l'arbre → entrée en orbite sans saut
                    bee.angle = Math.atan2(bee.y - (tree.y + gridParams.cellSize * (tree.maxHives === 2 ? 0.13 : 0.215)), bee.x - tree.x);
                    bee.state = 'idle';
                    bee.treeId = target.id;
                    bee.targetTreeId = null;
                    bee.offsetX = undefined;
                    bee.offsetY = undefined;
                    tree.beeCount++;
                  } else {
                    bee.angle = Math.atan2(bee.y - (tree.y + gridParams.cellSize * (tree.maxHives === 2 ? 0.13 : 0.215)), bee.x - tree.x);
                    bee.state = 'idle';
                    bee.treeId = target.id;
                    bee.targetTreeId = null;
                    bee.offsetX = undefined;
                    bee.offsetY = undefined;
                    tree.beeCount++;
                  }
                }
              } else {
                const speed = 0.8 * cellSizeScale;
                bee.angle = Math.atan2(dy, dx);
                bee.displayAngle = bee.angle;
                bee.x += (dx / dist) * speed;
                bee.y += (dy / dist) * speed;

                const pondIdx1 = mapData.ponds.findIndex(pond => {
                  const pw = pond.width * gridParams.cellSize;
                  const ph = pond.height * gridParams.cellSize;
                  const cx = pond.x + pw / 2;
                  const cy = pond.y + ph / 2;
                  return ((bee.x - cx) / (pw * 0.30)) ** 2 + ((bee.y - cy) / (ph * 0.30)) ** 2 <= 1;
                });
                const isOverPond = pondIdx1 !== -1;

                if (isOverPond && Math.random() < 0.0025) {
                  beesToRemove.add(bee.id);

                  beeConsumedByPondRef.current = true;

                  const dyingId = `dying-${bee.id}-${Date.now()}`;
                  setDyingBees(prev => [...prev, { id: dyingId, x: bee.x, y: bee.y, timestamp: Date.now(), owner: bee.owner, angle: bee.displayAngle ?? bee.angle }]);
                  setTimeout(() => setDyingBees(prev => prev.filter(d => d.id !== dyingId)), 3000);

                  const splashId = `splash-${Date.now()}-${Math.random()}`;
                  setWaterSplashes(prev => [...prev, {
                    x: bee.x,
                    y: bee.y,
                    id: splashId,
                    timestamp: Date.now(),
                    pondIdx: pondIdx1,
                  }]);
                  setTimeout(() => setWaterSplashes(prev => prev.filter(s => s.id !== splashId)), 1400);
                }
              }
            }
          } else if (bee.state === 'moving' && bee.targetX !== undefined && bee.targetY !== undefined) {
            // Cible clampée dans la zone safe avant tout calcul de mouvement
            const effTargetX = Math.max(minX + 2, Math.min(maxX - 2, bee.targetX));
            const effTargetY = Math.max(minY + 2, Math.min(maxY - 2, bee.targetY));
            const dx = effTargetX - bee.x;
            const dy = effTargetY - bee.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 5) {
              bee.state = 'idle';
              bee.targetX = undefined;
              bee.targetY = undefined;
              bee.angle = Math.random() * Math.PI * 2;
            } else {
              const speed = 0.8 * cellSizeScale;
              bee.angle = Math.atan2(dy, dx);
              bee.displayAngle = bee.angle;
              bee.x += (dx / dist) * speed;
              bee.y += (dy / dist) * speed;

              const pondIdx2 = mapData.ponds.findIndex(pond => {
                const pw = pond.width * gridParams.cellSize;
                const ph = pond.height * gridParams.cellSize;
                const cx = pond.x + pw / 2;
                const cy = pond.y + ph / 2;
                return ((bee.x - cx) / (pw * 0.30)) ** 2 + ((bee.y - cy) / (ph * 0.30)) ** 2 <= 1;
              });
              const isOverPond = pondIdx2 !== -1;

              if (isOverPond && Math.random() < 0.0025) {
                beesToRemove.add(bee.id);

                const dyingId2 = `dying-${bee.id}-${Date.now()}`;
                setDyingBees(prev => [...prev, { id: dyingId2, x: bee.x, y: bee.y, timestamp: Date.now(), owner: bee.owner, angle: bee.displayAngle ?? bee.angle }]);
                setTimeout(() => setDyingBees(prev => prev.filter(d => d.id !== dyingId2)), 3000);

                const splashId = `splash-${Date.now()}-${Math.random()}`;
                setWaterSplashes(prev => [...prev, {
                  x: bee.x,
                  y: bee.y,
                  id: splashId,
                  timestamp: Date.now(),
                  pondIdx: pondIdx2,
                }]);
                setTimeout(() => setWaterSplashes(prev => prev.filter(s => s.id !== splashId)), 1400);
              }
            }
          } else if (bee.state === 'building' && bee.buildingTreeId) {
            const targetTree = newState.trees.find(t => t.id === bee.buildingTreeId);
            if (!targetTree) {
              bee.state = 'idle';
              bee.buildingTreeId = null;
            } else {
              const dx = targetTree.x - bee.x;
              const dy = targetTree.y - bee.y;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist < 5) {
                const getMaxHealth = (level: number) => level === 2 ? HIVE_L2_HP : HIVE_L1_HP;

                let damagedHiveIndex = -1;
                if (targetTree.owner === 'player' && targetTree.hiveHealth.length > 0) {
                  damagedHiveIndex = targetTree.hiveHealth.findIndex((health, idx) => {
                    const level = targetTree.hiveLevel[idx] || 1;
                    const maxHp = level === 2 ? HIVE_L2_HP : HIVE_L1_HP;
                    return health < maxHp;
                  });
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
                      setFlashEffect({ x: targetTree.x, y: targetTree.y, type: 'small' });
                      setTimeout(() => setFlashEffect(null), 800);
                      const w = getWording(globalTimeOfDay);
                      toast.success(`${w.hiveCapital} réparé${w.hive === 'cocon' ? '' : 'e'} !`);
                    }
                  }
                  const sourceTreeRepair = newState.trees.find(t => t.id === bee.sourcetreeId);
                  if (sourceTreeRepair) sourceTreeRepair.beeCount = Math.max(0, sourceTreeRepair.beeCount - 1);
                  beesToRemove.add(bee.id);
                } else if (targetTree.hiveCount === 1 && targetTree.hiveLevel[0] === 1 && !targetTree.isStartingTree && targetTree.owner === 'player' && targetTree.maxHives === 2) {
                  // UPGRADE NIVEAU 1 -> NIVEAU 2
                  if (targetTree.upgradeLocked) {
                    bee.state = 'idle';
                    bee.treeId = bee.sourcetreeId ?? bee.buildingTreeId ?? null;
                    bee.buildingTreeId = null;
                    bee.sourcetreeId = null;
                  } else {
                  const currentHealth = targetTree.hiveHealth[0] || 0;
                  if (currentHealth < HIVE_L1_HP) {
                    bee.state = 'idle';
                    bee.treeId = bee.sourcetreeId ?? bee.buildingTreeId ?? null;
                    bee.buildingTreeId = null;
                    bee.sourcetreeId = null;
                  } else {
                    const currentProgress = targetTree.upgradingProgress || 0;

                    if (currentProgress >= UPGRADE_HIVE_COST || targetTree.hiveLevel[0] === 2) {
                      bee.state = 'idle';
                      bee.treeId = bee.sourcetreeId ?? bee.buildingTreeId ?? null;
                      bee.buildingTreeId = null;
                      bee.sourcetreeId = null;
                    } else {
                      const newProgress = currentProgress + 1;
                      targetTree.upgradingProgress = newProgress;

                      if (newProgress >= UPGRADE_HIVE_COST) {
                        if (targetTree.maxHives === 2) {
                          // Groupe d'arbres : on ajoute une 2ème ruche niveau 2
                          targetTree.hiveCount = 2;
                          targetTree.hiveHealth = [HIVE_L1_HP, HIVE_L2_HP];
                          targetTree.hiveLevel = [1, 2];
                        } else {
                          // Arbre solo : on monte la ruche existante au niveau 2
                          targetTree.hiveLevel[0] = 2;
                          targetTree.hiveHealth[0] = HIVE_L2_HP;
                        }
                        targetTree.upgradingProgress = 0;

                        const existingHalos = newState.haloEffects || [];
                        newState.haloEffects = [...existingHalos, { treeId: targetTree.id, timestamp: Date.now() }];

                        setFlashEffect({ x: targetTree.x, y: targetTree.y, type: 'large' });
                        setTimeout(() => setFlashEffect(null), 1000);
                        const w = getWording(globalTimeOfDay);
                        toast.success(`${w.hiveCapital} amélioré${w.hive === 'cocon' ? '' : 'e'} au niveau 2 !`);
                      }

                      const sourceTreeUpgrade = newState.trees.find(t => t.id === bee.sourcetreeId);
                      if (sourceTreeUpgrade) sourceTreeUpgrade.beeCount = Math.max(0, sourceTreeUpgrade.beeCount - 1);
                      beesToRemove.add(bee.id);
                    }
                  }
                  } // fin else upgradeLocked
                } else if (targetTree.hiveCount === 0 && (targetTree.owner === 'player' || targetTree.owner === 'neutral')) {
                  // CONSTRUCTION NOUVELLE RUCHE NIVEAU 1
                  const buildingProgress = targetTree.buildingProgress || [];
                  const currentProgress = buildingProgress[0] || 0;

                  if (currentProgress >= BUILD_HIVE_COST) {
                    bee.state = 'idle';
                    bee.treeId = bee.sourcetreeId ?? bee.buildingTreeId ?? null;
                    bee.buildingTreeId = null;
                    bee.sourcetreeId = null;
                  } else {
                    const newProgress = currentProgress + 1;

                    const newBuildingProgress = [...buildingProgress];
                    newBuildingProgress[0] = newProgress;
                    targetTree.buildingProgress = newBuildingProgress;

                    if (newProgress >= BUILD_HIVE_COST) {
                      targetTree.hiveCount = 1;
                      targetTree.hiveHealth = [HIVE_L1_HP];
                      targetTree.hiveLevel = [1];
                      targetTree.upgradingProgress = 0;
                      targetTree.upgradeLocked = true;
                      newBuildingProgress[0] = 0;
                      targetTree.buildingProgress = newBuildingProgress;

                      const existingHalos = newState.haloEffects || [];
                      newState.haloEffects = [...existingHalos, { treeId: targetTree.id, timestamp: Date.now() }];

                      setFlashEffect({ x: targetTree.x, y: targetTree.y, type: 'large' });
                      setTimeout(() => setFlashEffect(null), 1000);
                      const w = getWording(globalTimeOfDay);
                      toast.success(`${w.hiveCapital} niveau 1 créé${w.hive === 'cocon' ? '' : 'e'} !`);
                    }

                    const sourceTreeBuild = newState.trees.find(t => t.id === bee.sourcetreeId);
                    if (sourceTreeBuild) sourceTreeBuild.beeCount = Math.max(0, sourceTreeBuild.beeCount - 1);
                    beesToRemove.add(bee.id);
                  }
                } else {
                  // Rien à construire/réparer : rejoindre l'orbite de l'arbre
                  bee.state = 'idle';
                  bee.buildingTreeId = null;
                  bee.treeId = targetTree.id;
                  if (!bee.angle) bee.angle = Math.random() * Math.PI * 2;
                }
              } else {
                const speed = 1.2 * cellSizeScale;
                bee.angle = Math.atan2(dy, dx);
                bee.displayAngle = bee.angle;
                bee.x += (dx / dist) * speed;
                bee.y += (dy / dist) * speed;
              }
            }
          } else if (bee.state === 'idle' && bee.treeId === null && bee.targetX === undefined) {
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
              if (!bee.hoverCenterX) {
                bee.hoverCenterX = Math.max(minX + 4, Math.min(maxX - 4, bee.x));
                bee.hoverCenterY = Math.max(minY + 4, Math.min(maxY - 4, bee.y));
              }
              bee.angle += 0.02;
              const wiggleRadius = 3;
              bee.x = bee.hoverCenterX + Math.cos(bee.angle) * wiggleRadius;
              bee.y = (bee.hoverCenterY ?? bee.y) + Math.sin(bee.angle) * wiggleRadius;
            }
          }

          // Garde-fou hard clamp : les cibles étant déjà clampées, ce cas ne devrait pas arriver
          if (!beesToRemove.has(bee.id)) {
            bee.x = Math.max(minX, Math.min(maxX, bee.x));
            bee.y = Math.max(minY, Math.min(maxY, bee.y));
          }
        });

        // Remove dead bees
        newState.bees = updatedBees.filter((bee) => !beesToRemove.has(bee.id));

        // Bee vs bee combat
        const allBees = newState.bees;
        const collisionRadius = 15;

        for (let i = 0; i < allBees.length; i++) {
          const bee1 = allBees[i];
          if (beesToRemove.has(bee1.id)) continue;

          for (let j = i + 1; j < allBees.length; j++) {
            const bee2 = allBees[j];
            if (beesToRemove.has(bee2.id)) continue;

            if (bee1.owner !== bee2.owner) {
              const dx = bee1.x - bee2.x;
              const dy = bee1.y - bee2.y;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist < collisionRadius) {
                beesToRemove.add(bee1.id);
                beesToRemove.add(bee2.id);

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

        // Résolution des combats groupés par arbre
        newState.trees.forEach((tree) => {
          if (tree.isCut) return;

          const beesAtTree = updatedBees.filter(b => b.treeId === tree.id && !beesToRemove.has(b.id));
          const playerBees = beesAtTree.filter(b => b.owner === 'player');
          const enemyBees = beesAtTree.filter(b => b.owner === 'enemy');

          if (playerBees.length > 0 && enemyBees.length > 0) {
            const minCount = Math.min(playerBees.length, enemyBees.length);
            for (let i = 0; i < minCount; i++) {
              beesToRemove.add(playerBees[i].id);
              beesToRemove.add(enemyBees[i].id);
              tree.beeCount -= 2;
            }
          }

          const remainingPlayerBees = playerBees.filter(b => !beesToRemove.has(b.id));
          const remainingEnemyBees = enemyBees.filter(b => !beesToRemove.has(b.id));

          if (remainingPlayerBees.length > 0 && remainingEnemyBees.length === 0) {
            if (tree.owner === 'enemy') {
              let totalCostToDestroy = 0;
              let targetType: 'hive' | 'hive-upgrading' | 'construction' | null = null;

              if (tree.hiveHealth.length > 0) {
                const lastIdx = tree.hiveHealth.length - 1;
                const upgradingProgress = tree.upgradingProgress || 0;

                if (upgradingProgress > 0) {
                  totalCostToDestroy = tree.hiveHealth[0] + upgradingProgress;
                  targetType = 'hive-upgrading';
                } else {
                  totalCostToDestroy = tree.hiveHealth[lastIdx]; // attaque la dernière ruche (niveau 2 en premier)
                  targetType = 'hive';
                }
              } else if (tree.buildingProgress && tree.buildingProgress[0] > 0) {
                totalCostToDestroy = tree.buildingProgress[0];
                targetType = 'construction';
              }

              if (targetType && totalCostToDestroy > 0) {
                const now = Date.now();
                if ((tree.lastAttackTick ?? 0) + 300 <= now) {
                  tree.lastAttackTick = now;
                  // Consume 1 bee per tick (gradual attack, visible to player)
                  const attackingBee = remainingPlayerBees[0];
                  beesToRemove.add(attackingBee.id);
                  tree.beeCount--;

                  if (targetType === 'hive-upgrading') {
                    const upgradingProgress = tree.upgradingProgress || 0;
                    if (upgradingProgress > 0) {
                      tree.upgradingProgress = upgradingProgress - 1;
                      if (tree.upgradingProgress === 0 && tree.hiveHealth[0] <= 0) {
                        tree.hiveHealth = [];
                        tree.hiveLevel = [];
                        tree.hiveCount = 0;
                        tree.owner = 'neutral';
                      }
                    } else {
                      const newHealth = Math.max(0, tree.hiveHealth[0] - 1);
                      if (newHealth === 0) {
                        tree.hiveHealth = [];
                        tree.hiveLevel = [];
                        tree.hiveCount = 0;
                        tree.upgradingProgress = 0;
                        tree.owner = 'neutral';
                      } else {
                        tree.hiveHealth = [newHealth, ...tree.hiveHealth.slice(1)];
                      }
                    }
                  } else if (targetType === 'hive') {
                    // Attaque la dernière ruche (niveau 2 d'abord, puis niveau 1)
                    const lastIdx = tree.hiveHealth.length - 1;
                    const newHealth = Math.max(0, tree.hiveHealth[lastIdx] - 1);
                    if (newHealth === 0) {
                      if (tree.hiveCount > 1) {
                        // Retirer la dernière ruche, conserver les précédentes
                        tree.hiveHealth = tree.hiveHealth.slice(0, lastIdx);
                        tree.hiveLevel = tree.hiveLevel.slice(0, lastIdx);
                        tree.hiveCount--;
                      } else {
                        tree.hiveHealth = [];
                        tree.hiveLevel = [];
                        tree.hiveCount = 0;
                        tree.owner = 'neutral';
                      }
                    } else {
                      tree.hiveHealth = [...tree.hiveHealth.slice(0, lastIdx), newHealth];
                    }
                  } else if (targetType === 'construction') {
                    tree.buildingProgress![0] = Math.max(0, tree.buildingProgress![0] - 1);
                    if (tree.buildingProgress![0] === 0) {
                      tree.buildingProgress = [];
                      tree.owner = 'neutral';
                    }
                  }
                }
              }
            }
          }

          // Attaque des ruches du joueur par l'ennemi
          if (remainingEnemyBees.length > 0 && remainingPlayerBees.length === 0) {
            if (tree.owner === 'player') {
              let totalCostToDestroy = 0;
              let targetType: 'hive' | 'hive-upgrading' | 'construction' | null = null;

              if (tree.hiveHealth.length > 0) {
                const lastIdx = tree.hiveHealth.length - 1;
                const upgradingProgress = tree.upgradingProgress || 0;

                if (upgradingProgress > 0) {
                  totalCostToDestroy = tree.hiveHealth[0] + upgradingProgress;
                  targetType = 'hive-upgrading';
                } else {
                  totalCostToDestroy = tree.hiveHealth[lastIdx]; // attaque la dernière ruche (niveau 2 en premier)
                  targetType = 'hive';
                }
              } else if (tree.buildingProgress && tree.buildingProgress[0] > 0) {
                totalCostToDestroy = tree.buildingProgress[0];
                targetType = 'construction';
              }

              if (targetType && totalCostToDestroy > 0) {
                const now = Date.now();
                if ((tree.lastAttackTick ?? 0) + 300 <= now) {
                  tree.lastAttackTick = now;
                  // Consume 1 enemy bee per tick (gradual siege, visible to player)
                  const attackingBee = remainingEnemyBees[0];
                  beesToRemove.add(attackingBee.id);
                  tree.beeCount--;

                  if (targetType === 'hive-upgrading') {
                    const upgradingProgress = tree.upgradingProgress || 0;
                    if (upgradingProgress > 0) {
                      tree.upgradingProgress = upgradingProgress - 1;
                    } else {
                      const newHealth = Math.max(0, tree.hiveHealth[0] - 1);
                      if (newHealth === 0) {
                        tree.hiveHealth = [];
                        tree.hiveLevel = [];
                        tree.hiveCount = 0;
                        tree.upgradingProgress = 0;
                        tree.owner = 'neutral';
                      } else {
                        tree.hiveHealth = [newHealth, ...tree.hiveHealth.slice(1)];
                      }
                    }
                  } else if (targetType === 'hive') {
                    // Attaque la dernière ruche (niveau 2 d'abord, puis niveau 1)
                    const lastIdx = tree.hiveHealth.length - 1;
                    const newHealth = Math.max(0, tree.hiveHealth[lastIdx] - 1);
                    if (newHealth === 0) {
                      if (tree.hiveCount > 1) {
                        // Retirer la dernière ruche, conserver les précédentes
                        tree.hiveHealth = tree.hiveHealth.slice(0, lastIdx);
                        tree.hiveLevel = tree.hiveLevel.slice(0, lastIdx);
                        tree.hiveCount--;
                      } else {
                        tree.hiveHealth = [];
                        tree.hiveLevel = [];
                        tree.hiveCount = 0;
                        tree.owner = 'neutral';
                      }
                    } else {
                      tree.hiveHealth = [...tree.hiveHealth.slice(0, lastIdx), newHealth];
                    }
                  } else if (targetType === 'construction') {
                    tree.buildingProgress![0] = Math.max(0, tree.buildingProgress![0] - 1);
                    if (tree.buildingProgress![0] === 0) {
                      tree.buildingProgress = [];
                      tree.owner = 'neutral';
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

  // Production loop — 1 FPS : création d'abeilles depuis les ruches
  useEffect(() => {
    if (!gameState.isPlaying) return;

    const interval = setInterval(() => {
      setGameState((prev) => {
        const newState = { ...prev };
        const newBees: BeeType[] = [];
        const now = Date.now();

        if (newState.bees.length >= MAX_BEES) {
          return newState;
        }

        newState.trees.forEach((tree) => {
          if (tree.isCut) return;

          const hasEnemyBeesAround = newState.bees.some(bee =>
            bee.treeId === tree.id && bee.owner !== tree.owner && tree.owner !== 'neutral'
          );
          if (hasEnemyBeesAround) return;

          tree.hiveHealth.forEach((health, i) => {
            if (tree.owner !== 'neutral') {
              if (health > 0) {
                const level = tree.hiveLevel[i] || 1;
                const shouldProduce = level === 2 || (level === 1 && now % 3000 < 1000);

                if (shouldProduce) {
                  const hiveY = tree.y - 10;
                  const angle = Math.random() * Math.PI * 2;

                  const beeId = `bee-${tree.id}-${now}-${Math.random()}`;

                  const baseRadius = (tree.maxHives === 2 ? BEE_ORBIT_RADIUS_GROUP : BEE_ORBIT_RADIUS_SOLO) * (gridParams.cellSize / 80);
                  const radiusVariation = ((parseInt(beeId.slice(-5), 36) % 16) - 8);
                  const radius = baseRadius + radiusVariation;
                  const targetX = tree.x + Math.cos(angle) * radius;
                  const targetY = (tree.y + gridParams.cellSize * (tree.maxHives === 2 ? 0.26 : 0.215)) + Math.sin(angle) * radius;

                  newBees.push({
                    id: beeId,
                    x: tree.x + (Math.random() - 0.5) * 20,
                    y: tree.y + (Math.random() - 0.5) * 20,
                    owner: tree.owner,
                    treeId: null,
                    targetTreeId: tree.id,
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

        const availableSlots = MAX_BEES - newState.bees.length;
        const beesToAdd = newBees.slice(0, Math.max(0, availableSlots));

        newState.bees = [...newState.bees, ...beesToAdd];
        return newState;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.isPlaying]);

  // Fireflies animation loop — 30 FPS (mode nuit uniquement)
  useEffect(() => {
    if (globalTimeOfDay !== 'night') return;

    const interval = setInterval(() => {
      setGameState(prev => {
        if (!prev.fireflies) return prev;

        return {
          ...prev,
          fireflies: prev.fireflies.map(firefly => ({
            ...firefly,
            phase: firefly.phase + 0.05,
            brightness: (Math.sin(firefly.phase) + 1) / 2,
          }))
        };
      });
    }, 1000 / 30);

    return () => clearInterval(interval);
  }, [globalTimeOfDay]);

  // Timer — incrémente gameTime toutes les secondes
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

  // IA ennemie — toutes les 3s (ou 6s pour le premier combat)
  useEffect(() => {
    if (!gameState.isPlaying) return;

    const isFirstBattleLevel = currentScreen === 'story' &&
                                levelProgress.currentLevel === 1 &&
                                levelProgress.currentSubLevel === 4;
    const aiInterval = isFirstBattleLevel ? 6000 : 3000;

    const interval = setInterval(() => {
      setGameState((prev) => {
        return enemyAITick(prev, mapData, gridParams.cellSize);
      });
    }, aiInterval);

    return () => clearInterval(interval);
  }, [gameState.isPlaying, mapData, currentScreen, levelProgress.currentLevel, levelProgress.currentSubLevel]);
}

import { useEffect } from 'react';
import { GameState, Bee as BeeType } from '../types/game';
import { LevelProgress } from '../types/levels';
import { PondShape } from '../utils/mapGenerator';
import { enemyAITick } from '../utils/enemyAI';
import {
  BUILD_HIVE_COST,
  UPGRADE_HIVE_COST,
  HIVE_L1_HP,
  HIVE_L2_HP,
  MAX_BEES,
} from '../constants/gameRules';

const toast = {
  info: () => {},
  success: () => {},
  error: () => {},
  warning: () => {},
};

function getWording(timeOfDay: 'day' | 'night') {
  const isNight = timeOfDay === 'night';
  return {
    bee: isNight ? 'luciole' : 'abeille',
    bees: isNight ? 'lucioles' : 'abeilles',
    beesCapital: isNight ? 'Lucioles' : 'Abeilles',
    hive: isNight ? 'cocon' : 'ruche',
    hives: isNight ? 'cocons' : 'ruches',
    hiveCapital: isNight ? 'Cocon' : 'Ruche',
  };
}

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
  setWaterSplashes: React.Dispatch<React.SetStateAction<Array<{ x: number; y: number; id: string; timestamp: number }>>>;
  setFlashEffect: React.Dispatch<React.SetStateAction<{ x: number; y: number; type: 'small' | 'large' } | null>>;
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

        // FIX PERFORMANCE : Adapter la vitesse selon le nombre d'abeilles
        const beeSpeedMultiplier = newState.bees.length > 100
          ? 1.5
          : newState.bees.length > 50
            ? 1.25
            : 1.0;

        updatedBees.forEach((bee) => {
          if (bee.state === 'idle' && bee.treeId) {
            const tree = newState.trees.find((t) => t.id === bee.treeId);

            if (tree && !tree.isCut) {
              bee.angle += 0.01;
              const baseRadius = 38;
              const radiusVariation = ((parseInt(bee.id.slice(-5), 36) % 16) - 8);
              const radius = baseRadius + radiusVariation;
              bee.x = tree.x + Math.cos(bee.angle) * radius;
              bee.y = tree.y + Math.sin(bee.angle) * radius;
              bee.displayAngle = bee.angle + Math.PI / 2;
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
              const targetX = target.x + offsetX;
              const targetY = target.y + offsetY;

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
                const speed = 0.8 * beeSpeedMultiplier;
                bee.angle = Math.atan2(dy, dx);
                bee.displayAngle = bee.angle;
                bee.x += (dx / dist) * speed;
                bee.y += (dy / dist) * speed;

                const isOverPond = mapData.ponds.some(pond => {
                  return bee.x >= pond.x &&
                         bee.x <= pond.x + pond.width * gridParams.cellSize &&
                         bee.y >= pond.y &&
                         bee.y <= pond.y + pond.height * gridParams.cellSize;
                });

                if (isOverPond && Math.random() < 0.002) {
                  beesToRemove.add(bee.id);

                  beeConsumedByPondRef.current = true;

                  const splashId = `splash-${Date.now()}-${Math.random()}`;
                  setWaterSplashes(prev => [...prev, {
                    x: bee.x,
                    y: bee.y,
                    id: splashId,
                    timestamp: Date.now()
                  }]);

                  setTimeout(() => {
                    setWaterSplashes(prev => prev.filter(s => s.id !== splashId));
                  }, 800);
                }
              }
            }
          } else if (bee.state === 'moving' && bee.targetX !== undefined && bee.targetY !== undefined) {
            const dx = bee.targetX - bee.x;
            const dy = bee.targetY - bee.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 5) {
              bee.state = 'idle';
              bee.targetX = undefined;
              bee.targetY = undefined;
              bee.angle = Math.random() * Math.PI * 2;
            } else {
              const speed = 0.8 * beeSpeedMultiplier;
              bee.angle = Math.atan2(dy, dx);
              bee.displayAngle = bee.angle;
              bee.x += (dx / dist) * speed;
              bee.y += (dy / dist) * speed;

              const isOverPond = mapData.ponds.some(pond => {
                return bee.x >= pond.x &&
                       bee.x <= pond.x + pond.width * gridParams.cellSize &&
                       bee.y >= pond.y &&
                       bee.y <= pond.y + pond.height * gridParams.cellSize;
              });

              if (isOverPond && Math.random() < 0.002) {
                beesToRemove.add(bee.id);

                const splashId = `splash-${Date.now()}-${Math.random()}`;
                setWaterSplashes(prev => [...prev, {
                  x: bee.x,
                  y: bee.y,
                  id: splashId,
                  timestamp: Date.now()
                }]);

                setTimeout(() => {
                  setWaterSplashes(prev => prev.filter(s => s.id !== splashId));
                }, 800);
              }
            }
          } else if (bee.state === 'building' && (bee as any).buildingTreeId) {
            const targetTree = newState.trees.find(t => t.id === (bee as any).buildingTreeId);
            if (!targetTree) {
              bee.state = 'idle';
              (bee as any).buildingTreeId = null;
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
                  beesToRemove.add(bee.id);
                } else if (targetTree.hiveCount === 1 && targetTree.hiveLevel[0] === 1 && !targetTree.isStartingTree && targetTree.owner === 'player' && targetTree.maxHives === 2) {
                  // UPGRADE NIVEAU 1 -> NIVEAU 2
                  if (targetTree.upgradeLocked) {
                    beesToRemove.add(bee.id);
                  } else {
                  const currentHealth = targetTree.hiveHealth[0] || 0;
                  if (currentHealth < HIVE_L1_HP) {
                    beesToRemove.add(bee.id);
                  } else {
                    const currentProgress = targetTree.upgradingProgress || 0;

                    if (currentProgress >= UPGRADE_HIVE_COST || targetTree.hiveLevel[0] === 2) {
                      beesToRemove.add(bee.id);
                    } else {
                      // Throttle : une contribution toutes les 150ms maximum
                      const now = Date.now();
                      if (now - (targetTree.lastBuildTick ?? 0) < 80) {
                        // Trop tôt — l'abeille attend
                      } else {
                      targetTree.lastBuildTick = now;
                      const newProgress = currentProgress + 1;
                      targetTree.upgradingProgress = newProgress;

                      if (newProgress >= UPGRADE_HIVE_COST) {
                        if (targetTree.maxHives === 2) {
                          // Groupe d'arbres : on ajoute une 2ème ruche niveau 1
                          targetTree.hiveCount = 2;
                          targetTree.hiveHealth = [HIVE_L1_HP, HIVE_L1_HP];
                          targetTree.hiveLevel = [1, 1];
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

                      beesToRemove.add(bee.id);
                      } // fin else throttle
                    }
                  }
                  } // fin else upgradeLocked
                } else if (targetTree.hiveCount === 0 && (targetTree.owner === 'player' || targetTree.owner === 'neutral')) {
                  // CONSTRUCTION NOUVELLE RUCHE NIVEAU 1
                  const buildingProgress = targetTree.buildingProgress || [];
                  const currentProgress = buildingProgress[0] || 0;

                  if (currentProgress >= BUILD_HIVE_COST) {
                    beesToRemove.add(bee.id);
                  } else {
                    // Throttle : une contribution toutes les 200ms maximum
                    const now = Date.now();
                    if (now - (targetTree.lastBuildTick ?? 0) < 200) {
                      // Trop tôt — l'abeille attend
                    } else {
                    targetTree.lastBuildTick = now;
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

                    beesToRemove.add(bee.id);
                    } // fin else throttle
                  }
                } else {
                  bee.state = 'idle';
                  (bee as any).buildingTreeId = null;
                }
              } else {
                const speed = 1.2;
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
              if (!(bee as any).hoverCenterX) {
                (bee as any).hoverCenterX = bee.x;
                (bee as any).hoverCenterY = bee.y;
              }
              bee.angle += 0.02;
              const wiggleRadius = 3;
              bee.x = (bee as any).hoverCenterX + Math.cos(bee.angle) * wiggleRadius;
              bee.y = (bee as any).hoverCenterY + Math.sin(bee.angle) * wiggleRadius;
            }
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
                const currentHP = tree.hiveHealth[0];
                const upgradingProgress = tree.upgradingProgress || 0;

                if (upgradingProgress > 0) {
                  totalCostToDestroy = currentHP + upgradingProgress;
                  targetType = 'hive-upgrading';
                } else {
                  totalCostToDestroy = currentHP;
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
                      const currentLevel = tree.hiveLevel[0] || 1;
                      if (newHealth === 0) {
                        tree.hiveHealth = [];
                        tree.hiveLevel = [];
                        tree.hiveCount = 0;
                        tree.upgradingProgress = 0;
                        tree.owner = 'neutral';
                      } else {
                        tree.hiveHealth = [newHealth];
                        tree.hiveLevel = [currentLevel];
                      }
                    }
                  } else if (targetType === 'hive') {
                    const newHealth = Math.max(0, tree.hiveHealth[0] - 1);
                    const currentLevel = tree.hiveLevel[0] || 1;
                    if (newHealth === 0) {
                      tree.hiveHealth = [];
                      tree.hiveLevel = [];
                      tree.hiveCount = 0;
                      tree.owner = 'neutral';
                    } else {
                      tree.hiveHealth = [newHealth];
                      tree.hiveLevel = [currentLevel];
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
                const currentHP = tree.hiveHealth[0];
                const upgradingProgress = tree.upgradingProgress || 0;

                if (upgradingProgress > 0) {
                  totalCostToDestroy = currentHP + upgradingProgress;
                  targetType = 'hive-upgrading';
                } else {
                  totalCostToDestroy = currentHP;
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
                      const currentLevel = tree.hiveLevel[0] || 1;
                      if (newHealth === 0) {
                        tree.hiveHealth = [];
                        tree.hiveLevel = [];
                        tree.hiveCount = 0;
                        tree.upgradingProgress = 0;
                        tree.owner = 'neutral';
                      } else {
                        tree.hiveHealth = [newHealth];
                        tree.hiveLevel = [currentLevel];
                      }
                    }
                  } else if (targetType === 'hive') {
                    const newHealth = Math.max(0, tree.hiveHealth[0] - 1);
                    const currentLevel = tree.hiveLevel[0] || 1;
                    if (newHealth === 0) {
                      tree.hiveHealth = [];
                      tree.hiveLevel = [];
                      tree.hiveCount = 0;
                      tree.owner = 'neutral';
                    } else {
                      tree.hiveHealth = [newHealth];
                      tree.hiveLevel = [currentLevel];
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

                  const baseRadius = 38;
                  const radiusVariation = ((parseInt(beeId.slice(-5), 36) % 16) - 8);
                  const radius = baseRadius + radiusVariation;
                  const targetX = tree.x + Math.cos(angle) * radius;
                  const targetY = tree.y + Math.sin(angle) * radius;

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

  // RÉSERVÉ POUR FUTURE FONCTIONNALITÉ: Bûcherons spawn
  useEffect(() => {
    return;
  }, [gameState.isPlaying, (gameState as any).lumberjackGameplayEnabled]);

  // Fireflies animation loop — 30 FPS (mode nuit uniquement)
  useEffect(() => {
    if (globalTimeOfDay !== 'night') return;

    const interval = setInterval(() => {
      setGameState(prev => {
        if ((prev as any).timeOfDay !== 'night' || !prev.fireflies) return prev;

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

  // Lumberjack movement and chopping logic
  useEffect(() => {
    if (!gameState.isPlaying) return;
    if (!(gameState as any).lumberjackGameplayEnabled) return;

    const interval = setInterval(() => {
      setGameState(prev => {
        if (!(prev as any).lumberjackGameplayEnabled) return prev;
        const newState = { ...prev };
        const lumberjacksToRemove = new Set<string>();

        (newState as any).lumberjacks?.forEach((lumberjack: any) => {
          if (lumberjack.state === 'dead') {
            lumberjacksToRemove.add(lumberjack.id);
            return;
          }

          const targetTree = newState.trees.find(t => t.id === lumberjack.targetTreeId);
          if (!targetTree || targetTree.isCut) {
            if (lumberjack.isConverted) {
              const enemyTrees = newState.trees.filter(t => t.owner === 'enemy' && !t.isCut);
              if (enemyTrees.length > 0) {
                lumberjack.targetTreeId = enemyTrees[Math.floor(Math.random() * enemyTrees.length)].id;
                return;
              }
            }
            lumberjacksToRemove.add(lumberjack.id);
            return;
          }

          const attackingBees = newState.bees.filter(bee => {
            const dx = bee.x - lumberjack.x;
            const dy = bee.y - lumberjack.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist >= 30) return false;
            if ((bee as any).targetLumberjackId !== lumberjack.id) return false;
            if (bee.owner === 'player' && !lumberjack.isConverted) return true;
            if (bee.owner === 'enemy' && lumberjack.isConverted) return true;
            return false;
          });

          if (attackingBees.length > 0 && lumberjack.state !== 'fighting') {
            lumberjack.state = 'fighting';
          }

          if (attackingBees.length > 0 && lumberjack.state === 'fighting') {
            lumberjack.health = Math.max(0, lumberjack.health - attackingBees.length * 0.1);
            if (lumberjack.health <= 0) {
              lumberjack.state = 'dead';

              attackingBees.forEach(bee => {
                (bee as any).targetLumberjackId = null;
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

          if (lumberjack.state === 'walking') {
            const dx = targetTree.x - lumberjack.x;
            const dy = targetTree.y - lumberjack.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 60) {
              const speed = 0.4;
              lumberjack.x += (dx / dist) * speed;
              lumberjack.y += (dy / dist) * speed;
            } else {
              lumberjack.state = 'chopping';
            }
          }

          if (lumberjack.state === 'chopping') {
            lumberjack.chopProgress += 0.0056;

            if (lumberjack.chopProgress >= 1) {
              lumberjack.chopProgress = 0;

              if (targetTree.hiveCount > 0) {
                const lastHiveIndex = targetTree.hiveHealth.length - 1;
                const newHealth = Math.max(0, targetTree.hiveHealth[lastHiveIndex] - 1);
                targetTree.hiveHealth = [...targetTree.hiveHealth];
                targetTree.hiveHealth[lastHiveIndex] = newHealth;

                if (newHealth === 0) {
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
                targetTree.cutProgress = (targetTree.cutProgress || 0) + 1;

                if (targetTree.cutProgress >= 10) {
                  targetTree.isCut = true;
                  targetTree.hiveCount = 0;
                  targetTree.hiveHealth = [];
                  targetTree.hiveLevel = [];
                  targetTree.beeCount = 0;
                  toast.error('Un arbre a été coupé !');

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

        if ((newState as any).lumberjacks) {
          (newState as any).lumberjacks = (newState as any).lumberjacks.filter(
            (l: any) => !lumberjacksToRemove.has(l.id)
          );
        }

        if (newState.haloEffects) {
          const now = Date.now();
          newState.haloEffects = newState.haloEffects.filter(halo => now - halo.timestamp < 2000);
        }

        return newState;
      });
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [gameState.isPlaying, (gameState as any).lumberjackGameplayEnabled]);

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
        return enemyAITick(prev, mapData);
      });
    }, aiInterval);

    return () => clearInterval(interval);
  }, [gameState.isPlaying, mapData, currentScreen, levelProgress]);
}

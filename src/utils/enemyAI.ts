import { GameState, Tree, Bee, Lumberjack } from '../types/game';
import { MapData } from './mapGenerator';

// ========== RÈGLES DU JEU (IDENTIQUES POUR JOUEUR ET IA) ==========
const BUILD_HIVE_COST = 5;      // Coût pour construire une ruche niveau 1
const UPGRADE_HIVE_COST = 20;   // Coût pour upgrader niveau 1 -> niveau 2
const HIVE_L1_HP = 7;           // HP d'une ruche niveau 1
const HIVE_L2_HP = 35;          // HP d'une ruche niveau 2

const GRID_COLS = 16;
const CELL_SIZE = 100;

export function enemyAITick(gameState: GameState, mapData: MapData): GameState {
  const newState = { ...gameState };
  
  // Get all trees by owner (will be recalculated after claiming neutral trees)
  let enemyTrees = newState.trees.filter(t => t.owner === 'enemy');
  let neutralTrees = newState.trees.filter(t => t.owner === 'neutral' && !t.isCut);
  const playerTrees = newState.trees.filter(t => t.owner === 'player');
  const lumberjacks = newState.lumberjacks || [];
  
  // 1. SAVE DROWNING LUMBERJACKS
  lumberjacks.forEach(lumberjack => {
    if (lumberjack.state === 'drowning' && !lumberjack.isConverted) {
      // Find nearest enemy tree with idle bees
      const treesWithBees = enemyTrees
        .map(tree => ({
          tree,
          beeCount: newState.bees.filter(b => b.treeId === tree.id && b.owner === 'enemy' && b.state === 'idle').length
        }))
        .filter(t => t.beeCount > 0)
        .sort((a, b) => {
          const distA = Math.hypot(a.tree.x - lumberjack.x, a.tree.y - lumberjack.y);
          const distB = Math.hypot(b.tree.x - lumberjack.x, b.tree.y - lumberjack.y);
          return distA - distB;
        });
      
      if (treesWithBees.length > 0) {
        const closestTree = treesWithBees[0].tree;
        // Send 3 bees to save the lumberjack
        const beesToSend = newState.bees
          .filter(b => b.treeId === closestTree.id && b.owner === 'enemy' && b.state === 'idle')
          .slice(0, 3);
        
        beesToSend.forEach(bee => {
          bee.state = 'moving';
          bee.targetTreeId = null;
          bee.targetLumberjackId = lumberjack.id;
          bee.targetX = undefined;
          bee.targetY = undefined;
          bee.treeId = null;
          closestTree.beeCount--;
        });
      }
    }
  });
  
  // 2. ATTACK DROWNING LUMBERJACKS THAT ARE CONVERTED (working for player)
  lumberjacks.forEach(lumberjack => {
    if (lumberjack.isConverted) {
      // Attack converted lumberjacks
      const treesWithBees = enemyTrees
        .map(tree => ({
          tree,
          beeCount: newState.bees.filter(b => b.treeId === tree.id && b.owner === 'enemy' && b.state === 'idle').length
        }))
        .filter(t => t.beeCount >= 3)
        .sort((a, b) => {
          const distA = Math.hypot(a.tree.x - lumberjack.x, a.tree.y - lumberjack.y);
          const distB = Math.hypot(b.tree.x - lumberjack.x, b.tree.y - lumberjack.y);
          return distA - distB;
        });
      
      if (treesWithBees.length > 0) {
        const closestTree = treesWithBees[0].tree;
        const beesToSend = newState.bees
          .filter(b => b.treeId === closestTree.id && b.owner === 'enemy' && b.state === 'idle')
          .slice(0, 5);
        
        beesToSend.forEach(bee => {
          bee.state = 'moving';
          bee.targetTreeId = null;
          bee.targetLumberjackId = lumberjack.id;
          bee.targetX = undefined;
          bee.targetY = undefined;
          bee.treeId = null;
          closestTree.beeCount--;
        });
      }
    }
  });
  
  // 3. ATTACK NON-CONVERTED LUMBERJACKS
  lumberjacks.forEach(lumberjack => {
    if (lumberjack.state !== 'dead' && lumberjack.state !== 'drowning' && !lumberjack.isConverted) {
      // Check if lumberjack is targeting an enemy tree
      const targetTree = newState.trees.find(t => t.id === lumberjack.targetTreeId);
      if (targetTree && targetTree.owner === 'enemy') {
        // Send bees to attack
        const beesToSend = newState.bees
          .filter(b => b.treeId === targetTree.id && b.owner === 'enemy' && b.state === 'idle')
          .slice(0, 3);
        
        beesToSend.forEach(bee => {
          bee.state = 'moving';
          bee.targetTreeId = null;
          bee.targetLumberjackId = lumberjack.id;
          bee.targetX = undefined;
          bee.targetY = undefined;
          bee.treeId = null;
          targetTree.beeCount--;
        });
      }
    }
  });
  
  // 4. REPAIR DAMAGED HIVES
  enemyTrees.forEach(tree => {
    if (tree.hiveHealth.length > 0) {
      const getMaxHealth = (level: number) => level === 2 ? HIVE_L2_HP : HIVE_L1_HP;
      
      // Check if the hive (index 0) is damaged
      let damagedHiveIndex = -1;
      if (tree.hiveHealth.length > 0) {
        const health0 = tree.hiveHealth[0];
        const level0 = tree.hiveLevel[0] || 1;
        if (health0 < getMaxHealth(level0)) {
          damagedHiveIndex = 0;
        }
      }
      
      if (damagedHiveIndex !== -1) {
        const level = tree.hiveLevel[damagedHiveIndex] || 1;
        const maxHealth = getMaxHealth(level);
        const currentHealth = tree.hiveHealth[damagedHiveIndex];
        const healthNeeded = maxHealth - currentHealth;
        
        const idleBeesAtTree = newState.bees.filter(
          b => b.treeId === tree.id && b.owner === 'enemy' && b.state === 'idle'
        );
        
        // Use bees to repair (but keep at least 2 for defense)
        const beesToUse = Math.min(healthNeeded, Math.max(0, idleBeesAtTree.length - 2));
        
        if (beesToUse > 0) {
          const beesToRemove = idleBeesAtTree.slice(0, beesToUse);
          beesToRemove.forEach(bee => {
            const index = newState.bees.findIndex(b => b.id === bee.id);
            if (index !== -1) {
              newState.bees.splice(index, 1);
            }
          });
          
          tree.hiveHealth[damagedHiveIndex] = Math.min(maxHealth, currentHealth + beesToUse);
          tree.beeCount = Math.max(0, tree.beeCount - beesToUse);
        }
      }
    }
  });
  
  // 5. BUILD NEW HIVES ON NEUTRAL TREES (claim them first)
  neutralTrees.forEach(tree => {
    // Check if there are enemy bees on this neutral tree
    const enemyBeesAtTree = newState.bees.filter(
      b => b.treeId === tree.id && b.owner === 'enemy' && b.state === 'idle'
    );
    
    // Check if there are player bees on this neutral tree (they have priority!)
    const playerBeesAtTree = newState.bees.filter(
      b => b.treeId === tree.id && b.owner === 'player'
    );
    
    // Only claim if there are enemy bees AND no player bees
    if (enemyBeesAtTree.length > 0 && playerBeesAtTree.length === 0) {
      // Claim the tree
      tree.owner = 'enemy';
      
      // Start building first hive
      if (tree.hiveCount === 0) {
        const buildingProgress = tree.buildingProgress || [];
        const currentProgress = buildingProgress[0] || 0;
        const beesNeeded = BUILD_HIVE_COST - currentProgress;
        
        const beesToUse = Math.min(beesNeeded, enemyBeesAtTree.length);
        
        if (beesToUse > 0) {
          const beesToRemove = enemyBeesAtTree.slice(0, beesToUse);
          beesToRemove.forEach(bee => {
            const index = newState.bees.findIndex(b => b.id === bee.id);
            if (index !== -1) {
              newState.bees.splice(index, 1);
            }
          });
          
          const newProgress = currentProgress + beesToUse;
          const newBuildingProgress = [...buildingProgress];
          
          if (newProgress >= BUILD_HIVE_COST) {
            // Hive complete!
            tree.hiveCount++;
            tree.hiveHealth.push(HIVE_L1_HP);
            tree.hiveLevel.push(1);
            newBuildingProgress[0] = 0;
          } else {
            // Building in progress
            newBuildingProgress[0] = newProgress;
          }
          
          tree.buildingProgress = newBuildingProgress;
          tree.beeCount = Math.max(0, tree.beeCount - beesToUse);
        }
      }
    }
  });
  
  // Recalculate enemy trees after claiming neutral ones
  enemyTrees = newState.trees.filter(t => t.owner === 'enemy');
  neutralTrees = newState.trees.filter(t => t.owner === 'neutral' && !t.isCut);
  
  // 6. COMPLETE BUILDINGS IN PROGRESS (PRIORITY)
  // L'IA doit finir ses constructions pour maximiser la production d'abeilles
  enemyTrees.forEach(tree => {
    if (tree.buildingProgress && tree.buildingProgress[0] > 0) {
      const currentProgress = tree.buildingProgress[0];
      const beesNeeded = BUILD_HIVE_COST - currentProgress;
      
      const idleBeesAtTree = newState.bees.filter(
        b => b.treeId === tree.id && b.owner === 'enemy' && b.state === 'idle'
      );
      
      // Utiliser toutes les abeilles disponibles pour finir la construction
      const beesToUse = Math.min(beesNeeded, idleBeesAtTree.length);
      
      if (beesToUse > 0) {
        const beesToRemove = idleBeesAtTree.slice(0, beesToUse);
        beesToRemove.forEach(bee => {
          const index = newState.bees.findIndex(b => b.id === bee.id);
          if (index !== -1) {
            newState.bees.splice(index, 1);
          }
        });
        
        const newProgress = currentProgress + beesToUse;
        
        if (newProgress >= BUILD_HIVE_COST) {
          // Construction terminée !
          tree.hiveCount++;
          tree.hiveHealth.push(HIVE_L1_HP);
          tree.hiveLevel.push(1);
          tree.buildingProgress = [0];
        } else {
          tree.buildingProgress = [newProgress];
        }
        
        tree.beeCount = Math.max(0, tree.beeCount - beesToUse);
      }
    }
  });
  
  // 7. UPGRADE EXISTING HIVES TO LEVEL 2 - DÉSACTIVÉ (l'IA ne fait plus de doubles ruches)
  // L'IA se concentre uniquement sur expansion et attaque, pas sur les upgrades
  // enemyTrees.forEach(tree => { ... });
  
  // 8. EXPAND TO NEUTRAL TREES (avoid ponds)
  if (neutralTrees.length > 0) {
    // Find enemy trees with excess bees
    const treesWithExcess = enemyTrees
      .map(tree => ({
        tree,
        idleBees: newState.bees.filter(b => b.treeId === tree.id && b.owner === 'enemy' && b.state === 'idle'),
        excessCount: newState.bees.filter(b => b.treeId === tree.id && b.owner === 'enemy' && b.state === 'idle').length - 5
      }))
      .filter(t => t.excessCount > 5);
    
    if (treesWithExcess.length > 0) {
      // Pick neutral tree that doesn't require crossing ponds
      const sourceTree = treesWithExcess[0];
      const safeTrees = neutralTrees.filter(target => {
        // Check if path crosses a pond
        return !pathCrossesPond(sourceTree.tree, target, mapData);
      });
      
      const targetNeutral = safeTrees.length > 0 
        ? safeTrees[Math.floor(Math.random() * safeTrees.length)]
        : neutralTrees[Math.floor(Math.random() * neutralTrees.length)]; // Fallback
      
      // Send 6 bees to claim it (5 to build hive + 1 extra)
      const beesToSend = sourceTree.idleBees.slice(0, 6); // BUILD_HIVE_COST + 1
      beesToSend.forEach(bee => {
        bee.state = 'moving';
        bee.targetTreeId = targetNeutral.id;
        bee.treeId = null;
        sourceTree.tree.beeCount--;
      });
    }
  }
  
  // 9. ATTACK IDLE PLAYER BEES (not attached to trees)
  // Les abeilles du joueur qui sont dans un coin de la carte sont vulnérables
  const idlePlayerBees = newState.bees.filter(
    b => b.owner === 'player' && b.state === 'idle' && !b.treeId
  );
  
  if (idlePlayerBees.length > 0) {
    // Find enemy trees with bees
    const treesWithBees = enemyTrees
      .map(tree => ({
        tree,
        idleBees: newState.bees.filter(b => b.treeId === tree.id && b.owner === 'enemy' && b.state === 'idle')
      }))
      .filter(t => t.idleBees.length >= 5);
    
    if (treesWithBees.length > 0) {
      // Trouver le groupe d'abeilles idle le plus proche
      const sourceTree = treesWithBees[0];
      
      // Calculer le centre de masse des abeilles idle du joueur
      const avgX = idlePlayerBees.reduce((sum, b) => sum + b.x, 0) / idlePlayerBees.length;
      const avgY = idlePlayerBees.reduce((sum, b) => sum + b.y, 0) / idlePlayerBees.length;
      
      // Envoyer 6 abeilles vers ce point
      const beesToSend = sourceTree.idleBees.slice(0, 6);
      beesToSend.forEach(bee => {
        bee.state = 'moving';
        bee.targetTreeId = null;
        bee.targetX = avgX;
        bee.targetY = avgY;
        bee.treeId = null;
        sourceTree.tree.beeCount--;
      });
    }
  }
  
  // 10. ATTACK PLAYER TREES (avoid ponds)
  if (playerTrees.length > 0) {
    // Find enemy trees with many bees
    const strongTrees = enemyTrees
      .map(tree => ({
        tree,
        idleBees: newState.bees.filter(b => b.treeId === tree.id && b.owner === 'enemy' && b.state === 'idle')
      }))
      .filter(t => t.idleBees.length > 10);
    
    if (strongTrees.length > 0) {
      // Attack weakest player tree
      const playerTreesWithBees = playerTrees.map(tree => ({
        tree,
        defenderCount: newState.bees.filter(b => b.treeId === tree.id && b.owner === 'player' && b.state === 'idle').length
      })).sort((a, b) => a.defenderCount - b.defenderCount);
      
      if (playerTreesWithBees.length > 0) {
        const sourceTree = strongTrees[0];
        
        // Prefer targets that don't require crossing ponds
        const safeTrees = playerTreesWithBees.filter(({ tree }) => {
          return !pathCrossesPond(sourceTree.tree, tree, mapData);
        });
        
        const targetTree = safeTrees.length > 0 
          ? safeTrees[0].tree 
          : playerTreesWithBees[0].tree; // Fallback
        
        // Send 8 bees to attack
        const beesToSend = sourceTree.idleBees.slice(0, 8);
        beesToSend.forEach(bee => {
          bee.state = 'moving';
          bee.targetTreeId = targetTree.id;
          bee.treeId = null;
          sourceTree.tree.beeCount--;
        });
      }
    }
  }
  
  // 11. DEFEND AGAINST CONVERTED LUMBERJACKS (only if they threaten enemy trees)
  const convertedLumberjacks = lumberjacks.filter(l => l.isConverted && l.state !== 'dead' && l.state !== 'drowning');
  
  convertedLumberjacks.forEach(lumberjack => {
    // Check if this lumberjack is targeting an enemy tree
    const targetTree = newState.trees.find(t => t.id === lumberjack.targetTreeId);
    if (!targetTree || targetTree.owner !== 'enemy') return;
    
    // Check distance to target tree - only defend if lumberjack is close (threatening)
    const distToTarget = Math.hypot(targetTree.x - lumberjack.x, targetTree.y - lumberjack.y);
    if (distToTarget > 300) return; // Only defend if lumberjack is within 300px of enemy tree
    
    // Check if we're already sending bees to this lumberjack
    const alreadyAttacking = newState.bees.some(b => 
      b.targetLumberjackId === lumberjack.id && b.owner === 'enemy' && b.state === 'moving'
    );
    
    if (alreadyAttacking) return; // Already defending
    
    // Find nearby enemy trees with idle bees
    const nearbyTrees = enemyTrees
      .map(tree => ({
        tree,
        distance: Math.hypot(tree.x - lumberjack.x, tree.y - lumberjack.y),
        idleBees: newState.bees.filter(b => b.treeId === tree.id && b.owner === 'enemy' && b.state === 'idle')
      }))
      .filter(t => t.idleBees.length >= 3) // Need at least 3 bees
      .sort((a, b) => a.distance - b.distance);
    
    if (nearbyTrees.length > 0) {
      const sourceTree = nearbyTrees[0];
      // Send 3 bees to attack the lumberjack
      const beesToSend = sourceTree.idleBees.slice(0, 3);
      beesToSend.forEach(bee => {
        bee.state = 'moving';
        bee.targetLumberjackId = lumberjack.id;
        bee.targetTreeId = null;
        bee.treeId = null;
        sourceTree.tree.beeCount--;
      });
    }
  });
  
  return newState;
}

// Helper function to check if path crosses a pond
function pathCrossesPond(from: Tree, to: Tree, mapData: MapData): boolean {
  // Simple line-rectangle intersection check
  // Check several points along the path
  const steps = 10;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = from.x + (to.x - from.x) * t;
    const y = from.y + (to.y - from.y) * t;
    
    // Check if this point is in any pond
    const isInPond = mapData.ponds.some(pond => {
      return x >= pond.x && 
             x <= pond.x + pond.width * CELL_SIZE &&
             y >= pond.y && 
             y <= pond.y + pond.height * CELL_SIZE;
    });
    
    if (isInPond) return true;
  }
  
  return false;
}

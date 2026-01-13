# 📋 RÈGLES DU JEU - RUSH

## 🎯 OBJECTIF
Détruire toutes les ruches et abeilles ennemies.

## 🏁 DÉMARRAGE
- **Joueur** : Commence avec 1 ruche niveau 1 (7 HP) sur l'arbre de gauche
- **Ennemi** : Commence avec 1 ruche niveau 1 (7 HP) sur l'arbre de droite
- Les arbres de départ **ne peuvent PAS être améliorés** (maxHives = 1, isStartingTree = true)
- ⚠️ **Début sans abeilles** : Les deux joueurs commencent avec **0 abeilles** pour un départ équitable
  - Les ruches commencent à produire dès le début de la partie
  - Ruche niveau 1 : 1 abeille toutes les 3 secondes

## 🏗️ CONSTRUCTION DE RUCHE
- **Coût** : 5 abeilles
- **HP initiale** : 7 HP
- **Niveau** : 1
- **Condition** : Arbre neutre ou arbre sans ruche (hiveCount = 0)

## ⬆️ AMÉLIORATION DE RUCHE (Niveau 1 → Niveau 2)
- **Coût** : 20 abeilles
- **HP après amélioration** : 35 HP
- **Conditions** :
  - Avoir exactement 1 ruche de niveau 1 (hiveCount = 1, hiveLevel[0] = 1)
  - Ne PAS être l'arbre de départ (isStartingTree = false)
- **Visuel** : Ruche plus grosse et double avec hexagones
- **Production** : 1 abeille par seconde (au lieu de 1 toutes les 3 secondes)

### 👁️ Indicateurs Visuels des Arbres

#### 🌟 Arbre de Départ (Starting Tree)
- **Tronc plus foncé** avec rayures verticales sombres
- **Étoile dorée ★** sur le tronc (toujours visible)
- **Badge gris avec cadenas 🔒** (visible quand il a une ruche niveau 1)
  - Signifie : **Amélioration IMPOSSIBLE**

#### 🌳 Arbre Normal (peut être amélioré)
- **Tronc brun clair** standard
- **Badge vert avec flèche ⬆** (visible quand il a une ruche niveau 1)
  - Signifie : **Amélioration POSSIBLE** (double-clic avec 20 abeilles)

## ⚔️ COMBAT & DESTRUCTION

### 🥊 Priorité de Combat : Abeilles vs Abeilles EN PREMIER !
**IMPORTANT** : Les abeilles se battent TOUJOURS entre elles avant d'attaquer les structures !
- Combat 1 vs 1 instantané
- Les deux abeilles meurent
- **Seulement quand toutes les abeilles ennemies sont éliminées**, les abeilles survivantes peuvent attaquer les ruches/constructions

### Abeilles vs Ruches - NOUVELLES RÈGLES ⚡

**⚠️ Important** : Il n'y a plus qu'**UNE seule ruche** par arbre (niveau 1 ou niveau 2)

Quand toutes les abeilles ennemies sont éliminées, le coût pour détruire dépend de l'état de la ruche :

#### 1️⃣ **Ruche Niveau 1 (sans amélioration en cours)**
- **Coût de destruction** : 7 abeilles (= HP actuel)
- Chaque abeille inflige 1 dégât puis meurt
- Arbre redevient neutre quand HP = 0

#### 2️⃣ **Ruche Niveau 2 (sans amélioration en cours)**
- **Coût de destruction** : 35 abeilles (= HP actuel)
- Chaque abeille inflige 1 dégât puis meurt
- Arbre redevient neutre quand HP = 0
- ⚠️ **IMPORTANT** : Une ruche niveau 2 ne peut **JAMAIS** redevenir niveau 1 en combat
  - Exemple : Ruche 35/35 HP → subit 30 dégâts → devient **5/35 HP** (reste niveau 2)
  - Il faut **35 abeilles** pour la détruire complètement et rendre l'arbre neutre

#### 3️⃣ **Ruche Niveau 1 en cours d'amélioration** 🔄
- **Coût de destruction** : **7 + X abeilles** (HP + progression d'upgrade)
  - Exemple : Si 15/20 dans l'upgrade → Coût = 7 + 15 = **22 abeilles**
- **Destruction instantanée** si assez d'abeilles
- **Dégâts partiels** sinon : réduit d'abord l'upgrade, puis les HP

#### 4️⃣ **Construction en cours (pas de ruche terminée)** 🏗️
- **Coût de destruction** : **X abeilles** (= abeilles déjà investies)
  - Exemple : Si 4/5 dans la construction → Coût = **4 abeilles**
- **Destruction instantanée** si assez d'abeilles
- **Dégâts partiels** sinon : réduit la progression

### 🎯 Résumé des Coûts
| État de l'arbre | Coût de destruction |
|----------------|---------------------|
| Construction en cours (X/5) | **X abeilles** |
| Ruche Niv.1 (7 HP) | **7 abeilles** |
| Ruche Niv.1 + Upgrade (X/20) | **7 + X abeilles** |
| Ruche Niv.2 (35 HP) | **35 abeilles** |

### 📊 Exemple Détaillé : Destruction d'une Ruche Niveau 2

**Scénario** : Votre ennemi a une ruche niveau 2 (35/35 HP)

| Vague d'attaque | HP avant | Abeilles envoyées | HP après | Statut |
|-----------------|----------|-------------------|----------|---------|
| Vague 1 | 35/35 | 10 abeilles | **25/35** | ✅ Ruche niveau 2 endommagée |
| Vague 2 | 25/35 | 20 abeilles | **5/35** | ✅ Ruche niveau 2 très endommagée |
| Vague 3 | 5/35 | 5 abeilles | **0/35** → Neutre | ✅ Ruche détruite, arbre neutre |

⚠️ **Règle Clé** : Même avec 1 seul HP, la ruche reste **niveau 2** jusqu'à destruction complète !

## 💧 ÉTANGS (DANGER MORTEL)

### 🗺️ Génération des Étangs
- **1 à 3 étangs** par carte, forme rectangulaire (1-3 cellules de large, 1 cellule de haut)
- Les étangs sont des zones **carrées bleues** sur la carte
- **Aucun arbre ne peut être placé dans ou adjacent à un étang**
- Les arbres sont toujours à au moins 1 cellule de distance des étangs

### ⚠️ RISQUE CRITIQUE
Quand une abeille vole au-dessus d'un étang en déplacement :
- **1 abeille sur 3** (33.33% de chance) **tombe dans l'eau et disparaît** 🌊
- S'applique à **toutes les abeilles en mouvement** (joueur et ennemi)
- **Effet visuel** : Un splash bleu apparaît quand une abeille tombe

### 📊 Exemple de Perte par Étang

**Scénario** : Vous envoyez 30 abeilles au combat, mais elles doivent traverser un étang.

| Abeilles départ | Traversée étang | Pertes moyennes | Abeilles arrivées |
|-----------------|-----------------|-----------------|-------------------|
| 30 abeilles | Oui | ~10 abeilles | **≈ 20 abeilles** |
| 30 abeilles | Non (contournement) | 0 abeilles | **30 abeilles** |

⚠️ **Impact stratégique** :
- Traverser un étang peut **réduire votre force de 33%** !
- Pour détruire une ruche L2 (35 HP), envoyez **~52 abeilles** si étang, au lieu de 35
- Le contournement prend plus de temps mais **garantit l'arrivée** de toutes vos troupes

### 💡 Stratégies Recommandées

✅ **Contournement Sûr** : Plus long mais aucune perte
✅ **Trajets Multiples** : Envoyer plusieurs petits groupes augmente les chances
✅ **Surveillance** : Observer les splashes pour évaluer les pertes
❌ **Éviter** : Ne jamais envoyer exactement le nombre d'abeilles requis si étang sur le trajet

## 🔄 FLUX DE CONQUÊTE

Pour conquérir un arbre ennemi, voici les étapes obligatoires :

1. **Envoyer des abeilles** sur l'arbre ennemi (⚠️ éviter les étangs !)
2. **Combat abeille vs abeille** : Vos abeilles se battent contre les abeilles ennemies autour de l'arbre
3. **Attaque de la ruche** : Quand toutes les abeilles ennemies sont mortes, vos abeilles survivantes attaquent la ruche/construction
4. **Arbre neutre** : Une fois la ruche détruite, l'arbre redevient **neutre**
5. **Construction** : Vous devez ensuite envoyer 5 abeilles et double-cliquer pour construire votre ruche selon les règles normales

⚠️ **Il n'y a PAS de construction automatique** après avoir détruit une ruche ennemie !

## 🔧 RÉPARATION
- **Coût** : 1 abeille = 1 HP restauré
- **Maximum** : Jusqu'à la santé maximale de la ruche (7 HP ou 35 HP)
- **Priorité** : Double-clic sur l'arbre envoie les abeilles réparer

## 🐝 PRODUCTION D'ABEILLES
- **Ruche Niveau 1** : 1 abeille toutes les 3 secondes
- **Ruche Niveau 2** : 1 abeille par seconde
- **Blocage** : Aucune production si des abeilles ennemies sont présentes (combat en cours)
- **Condition** : La ruche doit avoir HP > 0

## ⚠️ ABEILLES VULNÉRABLES
- **Abeilles idle isolées** (non attachées à un arbre) **peuvent être attaquées** par l'ennemi
- Si vous rassemblez des abeilles dans un coin de la carte, l'IA peut les cibler
- **Recommandation** : Gardez vos abeilles autour de vos arbres pour les protéger

## 📊 RÉCAPITULATIF DES COÛTS

| Action | Coût | HP finale |
|--------|------|-----------|
| Construire Ruche Niveau 1 | 5 abeilles | 7 HP |
| Améliorer Niveau 1 → 2 | 20 abeilles | 35 HP |
| Détruire Ruche Niveau 1 | 7 abeilles | - |
| Détruire Ruche Niveau 2 | 35 abeilles | - |
| Annuler Construction | 1 à 5 abeilles | - |
| Annuler Amélioration | 1 à 20 abeilles | - |
| Réparer 1 HP | 1 abeille | +1 HP |

## 🤖 INTELLIGENCE ARTIFICIELLE (IA)

L'ennemi utilise une IA stratégique qui :

### Priorités de l'IA (dans l'ordre)
1. **Sauver les bûcherons noyés** (non convertis)
2. **Attaquer les bûcherons convertis** (qui travaillent pour le joueur)
3. **Attaquer les bûcherons** qui menacent ses arbres
4. **Réparer ses ruches endommagées**
5. **Réclamer les arbres neutres** (expansion)
6. **✨ NOUVEAU : Compléter ses constructions en cours** (prioritaire pour maximiser production)
7. **Améliorer ses ruches** au niveau 2 (sauf arbres de départ)
8. **Expansion vers arbres neutres** (évite les étangs)
9. **✨ NOUVEAU : Attaquer vos abeilles idle isolées** (non attachées à un arbre)
10. **Attaquer vos arbres** (cible les plus faibles)
11. **Défendre contre bûcherons convertis** menaçants

### 💡 Stratégies contre l'IA
- ✅ Ne laissez **jamais** vos abeilles idle dans un coin de la carte
- ✅ Gardez vos abeilles autour de vos arbres pour les protéger
- ✅ Attaquez pendant que l'IA construit/améliore ses ruches
- ✅ Utilisez les étangs pour ralentir les attaques ennemies

## ⚠️ RESTRICTIONS
- **Arbre de départ** : NE PEUT PAS être amélioré
- **Maximum de ruches** : 1 ruche par arbre (qui peut être niveau 1 ou 2)
- **Arbres neutres** : Peuvent avoir 1 ruche qui peut être améliorée

## 🤖 INTELLIGENCE ARTIFICIELLE
L'IA ennemie suit **exactement les mêmes règles** :
- Construit des ruches pour 5 abeilles
- Améliore au niveau 2 pour 20 abeilles
- Répare les ruches endommagées
- Ses ruches ont les mêmes HP (7 et 35)
- Peut attaquer tes ruches et annuler tes constructions/améliorations

## 🏆 CONDITION DE VICTOIRE
- **Victoire** : Toutes les ruches ennemies détruites (hiveCount = 0 pour tous les arbres ennemis)
- **Défaite** : Toutes vos ruches sont détruites

## 🎮 COMMENT JOUER
1. **Sélectionner des abeilles** : Clic sur un arbre allié OU clic-glisser pour sélection en cercle
2. **Envoyer des abeilles** : Clic simple sur l'arbre de destination
   - 🌳 Sur arbre **neutre** ou **allié** : Les abeilles gravitent autour
   - ⚔️ Sur arbre **ennemi** : Combat automatique (PAS de construction possible)
3. **Construire/Réparer/Améliorer** : Double-clic sur un arbre **neutre ou allié** avec des abeilles
   - ⚠️ **IMPORTANT** : On ne peut JAMAIS construire sur un arbre ennemi
   - Il faut d'abord détruire toutes les ruches ennemies et éliminer toutes les abeilles
4. **Attaquer** : Envoie tes abeilles sur un arbre ennemi (combat automatique)
   - Les abeilles combattent d'abord les abeilles ennemies
   - Puis attaquent la ruche si elles gagnent
   - Peuvent aussi annuler les constructions/améliorations en cours

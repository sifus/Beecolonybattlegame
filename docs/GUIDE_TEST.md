# 🧪 GUIDE DE TEST - Nouvelles Fonctionnalités

## 🎯 Comment Tester les 5 Nouvelles Fonctionnalités

### 1️⃣ Test : Démarrage Sans Abeilles

**Objectif** : Vérifier que les deux camps commencent avec 0 abeilles

**Étapes** :
1. Démarrer une nouvelle partie
2. Observer les compteurs d'abeilles sur les arbres de départ
3. Attendre 3 secondes

**✅ Succès si** :
- Les deux arbres affichent "0" abeilles au début
- Après 3 secondes, les deux arbres ont "1" abeille
- Après 6 secondes, les deux arbres ont "2" abeilles
- Production régulière : +1 abeille toutes les 3 secondes

**❌ Échec si** :
- Un arbre commence avec 20 abeilles
- La production ne démarre pas

---

### 2️⃣ Test : Étangs - Perte d'Abeilles (1/3)

**Objectif** : Vérifier que les abeilles tombent dans l'eau

**Étapes** :
1. Attendre d'avoir ~20 abeilles
2. Identifier un étang (zone bleue rectangulaire)
3. Sélectionner toutes vos abeilles (cercle de sélection)
4. Les envoyer traverser l'étang vers un arbre neutre de l'autre côté
5. Observer pendant le trajet

**✅ Succès si** :
- Environ 1/3 des abeilles disparaissent pendant la traversée
- Des **splashes bleus** apparaissent aux endroits de chute
- Message toast occasionnel : "💧 Une abeille est tombée dans l'étang !"
- Les abeilles restantes arrivent à destination

**❌ Échec si** :
- Toutes les abeilles arrivent intactes
- Aucun splash n'apparaît
- Toutes les abeilles meurent (taux > 33%)

**💡 Conseil** : Répéter le test 3-4 fois pour vérifier la cohérence statistique (~33% de pertes)

---

### 3️⃣ Test : Pas d'Arbres dans les Étangs

**Objectif** : Vérifier qu'aucun arbre ne spawn dans un étang

**Étapes** :
1. Redémarrer la partie 5-10 fois (bouton "Restart")
2. À chaque fois, observer la position des arbres et des étangs
3. Vérifier visuellement qu'aucun arbre n'est **sur** ou **juste à côté** d'un étang

**✅ Succès si** :
- Tous les arbres sont bien espacés des étangs
- Au minimum 1 cellule de distance entre arbre et étang
- Les arbres et étangs sont clairement séparés

**❌ Échec si** :
- Un arbre apparaît partiellement dans un étang
- Un arbre touche un étang
- Visuellement, un arbre et un étang se chevauchent

---

### 4️⃣ Test : IA Complète Ses Constructions

**Objectif** : Vérifier que l'IA termine ses ruches en cours

**Étapes** :
1. Jouer normalement pendant 1-2 minutes
2. Observer les arbres ennemis (rouges)
3. Repérer un arbre avec une construction en cours (icône de marteau + progression)
4. Attendre 6-9 secondes (2-3 ticks IA)
5. Observer si la construction se termine

**✅ Succès si** :
- L'IA complète rapidement ses constructions en cours
- Pas de constructions abandonnées à 3/5 ou 4/5
- Les ruches ennemies se multiplient rapidement

**❌ Échec si** :
- L'IA laisse des constructions à mi-chemin
- Des constructions restent bloquées même avec des abeilles disponibles
- L'IA attaque avant de finir ses bâtiments

**💡 Conseil** : Regarder le nombre d'abeilles autour d'un arbre en construction. Si > 5 abeilles et construction pas terminée = bug

---

### 5️⃣ Test : IA Attaque les Abeilles Idle

**Objectif** : Vérifier que l'IA cible vos abeilles isolées

**Étapes** :
1. Attendre d'avoir ~15 abeilles sur votre arbre de départ
2. Sélectionner 8-10 abeilles
3. Les envoyer dans un coin vide de la carte (loin de tout arbre)
4. Les laisser idle (ne rien faire avec)
5. Attendre 9-12 secondes (3-4 ticks IA)
6. Observer si des abeilles ennemies arrivent

**✅ Succès si** :
- Des abeilles ennemies (rouges) se dirigent vers vos abeilles isolées
- Combat entre vos abeilles idle et les abeilles ennemies
- Vos abeilles diminuent en nombre

**❌ Échec si** :
- L'IA ignore vos abeilles isolées
- Aucune attaque après 20 secondes
- L'IA attaque vos arbres au lieu des abeilles isolées

**💡 Conseil** : Assurer que l'IA a au moins une ruche avec 10+ abeilles pour déclencher cette tactique

---

## 🎮 Scénario de Test Complet (5-10 minutes)

### Phase 1 : Début de Partie (0-30 secondes)
1. ✓ Vérifier 0 abeilles au départ
2. ✓ Observer la production progressive
3. ✓ Vérifier visuellement : pas d'arbres dans les étangs

### Phase 2 : Expansion (30s - 2 min)
1. ✓ Envoyer des abeilles vers un arbre neutre à travers un étang
2. ✓ Observer les splashes et pertes (~1/3)
3. ✓ Capturer l'arbre neutre
4. ✓ Construire une ruche

### Phase 3 : Test IA (2-4 min)
1. ✓ Isoler 8-10 abeilles dans un coin
2. ✓ Observer si l'IA les attaque
3. ✓ Vérifier que l'IA complète ses constructions en cours
4. ✓ Compter le nombre de ruches ennemies (devrait augmenter)

### Phase 4 : Combat (4-10 min)
1. ✓ Envoyer une attaque massive vers une ruche ennemie
2. ✓ Traverser un étang et observer les pertes
3. ✓ Combat final
4. ✓ Vérifier qui gagne (IA devrait être compétitive !)

---

## 📊 Checklist Finale

- [ ] Démarrage avec 0 abeilles (joueur)
- [ ] Démarrage avec 0 abeilles (IA)
- [ ] Production régulière (+1 abeille/3s niveau 1)
- [ ] Splashes bleus visibles quand abeilles tombent
- [ ] ~33% de pertes en traversant un étang (statistiquement)
- [ ] Aucun arbre dans/sur un étang (après 10 redémarrages)
- [ ] IA termine ses constructions rapidement
- [ ] IA attaque les abeilles idle isolées
- [ ] IA est plus compétitive qu'avant
- [ ] Messages toast occasionnels pour pertes d'abeilles

---

## 🐛 Bugs Potentiels à Surveiller

### Étangs
- [ ] Abeilles qui ne meurent jamais dans l'eau → vérifier probabilité 0.333
- [ ] Tous les splashes au même endroit → vérifier position bee.x/bee.y
- [ ] Splashes qui restent visibles → vérifier setTimeout 800ms

### IA
- [ ] IA qui n'attaque jamais les idle bees → vérifier section 9 dans enemyAI.ts
- [ ] IA qui ne finit jamais ses constructions → vérifier section 6 dans enemyAI.ts
- [ ] IA qui envoie toutes ses abeilles (pas de défense) → vérifier limites

### Génération
- [ ] Arbres qui spawn dans les étangs → vérifier isValidTreeCell
- [ ] Trop d'arbres bloqués (pas assez de positions valides) → augmenter attempts

### Performance
- [ ] Lag quand beaucoup de splashes → limiter nombre de splashes actifs
- [ ] Calculs lourds à chaque frame → vérifier boucles dans gameLoop

---

## 🎯 Résultats Attendus

**Après cette session, le jeu devrait :**
- ✅ Être plus **stratégique** (gestion des trajets, étangs)
- ✅ Avoir une IA plus **compétitive** (complète constructions, attaque idle)
- ✅ Offrir un départ plus **équilibré** (0 abeilles)
- ✅ Avoir une carte plus **lisible** (pas d'arbres dans étangs)
- ✅ Être plus **challengeant** (risque/récompense des étangs)

**Le joueur devrait :**
- 🎮 Réfléchir avant d'envoyer des abeilles (étangs ?)
- 🎮 Protéger ses abeilles (pas d'idle isolées)
- 🎮 Planifier ses attaques (compenser pertes étangs)
- 🎮 Être challengé par l'IA (plus agressive et efficace)

---

## 📝 Rapport de Bugs

Si vous trouvez un bug, notez :
1. **Quoi** : Description précise du problème
2. **Quand** : À quel moment (démarrage, mid-game, etc.)
3. **Comment reproduire** : Étapes exactes
4. **Attendu vs Réel** : Ce qui devrait se passer vs ce qui se passe
5. **Screenshots/Vidéo** : Si possible

Bon test ! 🚀

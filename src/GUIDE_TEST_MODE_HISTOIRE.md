# Guide de Test - Mode Histoire

## 🎯 Comment Tester le Mode Histoire

### 1. Accès au Mode Histoire

1. **Lancez le jeu** et attendez le menu principal
2. Cliquez sur le bouton **"Jouer"** avec la légende "Mode histoire" (pleine largeur en haut)
3. Vous arrivez sur la **Carte des Niveaux**

### 2. Navigation de la Carte

**Éléments visibles :**
- ✅ **Niveau 1** (Tutoriel) - Ruche dorée déverrouillée
- 🔒 **Niveaux 2-10** - Ruches grises verrouillées
- 💧 **5 gouttes de miel** sous le Niveau 1 (sous-niveaux)

**Actions possibles :**
- Cliquez sur la **ruche du Niveau 1** pour commencer
- Survolez les ruches pour voir l'animation de gelée
- Les niveaux verrouillés affichent une icône de cadenas

### 3. Sous-Niveau 1-1 : Déplacement

**Objectif :** Apprendre à déplacer les abeilles

**Carte :**
- 🌳 **Arbre joueur** (gauche) avec 10 abeilles
- 🌳 **2 arbres neutres** au centre et à droite

**Comment réussir :**
1. Lisez la **bannière tutoriel** en haut (📚 Déplacement)
2. Cliquez sur votre arbre (gauche)
3. Cliquez sur un arbre neutre
4. Vos abeilles se déplacent → **Victoire automatique !**

**Modal de fin :**
- ⭐⭐⭐ Étoiles affichées avec animations
- Bouton "Recommencer" ou "Suivant"

### 4. Sous-Niveau 1-2 : Construction

**Objectif :** Créer une ruche

**Carte :**
- 🌳 **Arbre joueur** avec 15 abeilles
- 🌳 **3 arbres neutres** dispersés

**Comment réussir :**
1. Double-cliquez sur votre arbre (sélectionne toutes les abeilles)
2. Cliquez sur un arbre neutre
3. Quand **5+ abeilles** arrivent, une ruche se construit
4. Attendez que toutes les ruches ennemies soient détruites (aucune dans ce niveau)

### 5. Sous-Niveau 1-3 : Amélioration

**Objectif :** Améliorer une ruche niveau 1 en niveau 2

**Carte :**
- 🌳 **Arbre joueur** avec 30 abeilles
- 🌳 **1 arbre neutre**

**Comment réussir :**
1. Envoyez 5 abeilles sur l'arbre neutre (créer ruche)
2. Attendez que la ruche se construise
3. Envoyez **20 abeilles supplémentaires** sur cette ruche niveau 1
4. La ruche s'améliore en niveau 2 (35 HP)

### 6. Sous-Niveau 1-4 : Dangers

**Objectif :** Traverser un étang

**Carte :**
- 🌳 **Arbre joueur** avec 20 abeilles
- 💧 **Étang** au centre
- 🌳 **Arbre neutre** de l'autre côté

**Comment réussir :**
1. Sélectionnez vos abeilles
2. Cliquez sur l'arbre neutre de l'autre côté de l'étang
3. ⚠️ **Attention** : Certaines abeilles vont se noyer !
4. Les survivantes atteignent l'arbre → Victoire

### 7. Sous-Niveau 1-5 : Premier Combat

**Objectif :** Détruire la ruche ennemie

**Carte :**
- 🌳 **Arbre joueur** avec 15 abeilles
- 🌳 **2 arbres neutres** au centre
- 🔴 **Arbre ennemi** (droite) avec 8 abeilles et IA lente

**Comment réussir :**
1. Construisez des ruches sur les arbres neutres
2. Produisez plus d'abeilles (les ruches en génèrent automatiquement)
3. Attaquez l'arbre ennemi avec supériorité numérique
4. Détruisez la ruche ennemie → **Victoire !**

**L'IA ennemie :**
- Attaque lentement
- Facile à battre pour un premier combat

### 8. Retour à la Carte

**Après le Sous-Niveau 1-5 :**
- Modal de félicitations avec étoiles
- Clic sur "Suivant"
- **Retour automatique** à la carte des niveaux
- ✅ Niveau 1 marqué comme **complété** (ruche verte)
- 🔓 **Niveau 2 déverrouillé** (mais vide pour l'instant)
- 💧 Les 5 gouttes de miel du Niveau 1 sont **remplies**

## 🎮 Fonctionnalités à Tester

### Animations
- ✨ **Ruches** : Hover avec rotation et scale
- 💧 **Gouttes de miel** : Hover avec élévation, pulsation si complétées
- ⭐ **Étoiles** : Apparition en rotation, pulsation continue
- 🎉 **Modal** : Entrée élastique style gelée
- 📚 **Bannière tutoriel** : Animation de slide avec scale

### Boutons
- 🔙 **Retour** (flèche) sur la carte → Menu principal
- ⏸️ **Pause** pendant le jeu → Menu pause
- 🔄 **Recommencer** → Relance le sous-niveau actuel
- ➡️ **Suivant** → Charge le prochain sous-niveau

### Modes Jour/Nuit
- 🌞 **Mode Jour** : Parcours doré, ruches ambrées
- 🌙 **Mode Nuit** : Parcours vert, lucioles au lieu d'abeilles
- Toggle fonctionne depuis tous les menus

### Partie Rapide
- Bouton **"Jouer"** avec légende "Partie rapide"
- Lance une **carte aléatoire** classique
- Pas de tutoriel, pas de modal de niveau
- Game Over traditionnel (Victoire/Défaite)

## 🐛 Points à Vérifier

### Bugs Potentiels
- [ ] Les étoiles s'affichent correctement
- [ ] Le passage au niveau suivant charge bien la nouvelle carte
- [ ] Les gouttes de miel changent d'état quand complétées
- [ ] Le retour à la carte sauvegarde la progression
- [ ] La bannière tutoriel se ferme avec le bouton X
- [ ] Les animations ne ralentissent pas le jeu

### Performance
- [ ] Pas de lag lors des animations
- [ ] Transition fluide entre sous-niveaux
- [ ] Chargement rapide de la carte
- [ ] Pas de fuite mémoire après plusieurs niveaux

### UX/UI
- [ ] Les instructions sont claires
- [ ] Les boutons sont tous accessibles
- [ ] Le parcours est visuellement compréhensible
- [ ] Les états (verrouillé/déverrouillé/complété) sont évidents
- [ ] La bannière tutoriel ne cache pas d'éléments importants

## 📱 Test Mobile

### Spécificités
- Boutons suffisamment grands pour le tactile
- Animations fluides même sur mobile
- Parcours défilable verticalement
- Pas de hover sur mobile (remplacé par tap)

### À Vérifier
- [ ] Taille des ruches et gouttes adaptée
- [ ] Défilement du parcours fluide
- [ ] Modal de fin centré et lisible
- [ ] Bannière tutoriel ne déborde pas

## 🎯 Critères de Réussite

### Mode Histoire Opérationnel
- ✅ Les 5 sous-niveaux du tutoriel sont jouables
- ✅ La progression se sauvegarde entre les niveaux
- ✅ Les étoiles sont calculées et affichées
- ✅ Le système de déverrouillage fonctionne
- ✅ Les animations sont fluides et organiques

### Polish Visuel
- ✅ Style cohérent (cire d'abeille partout)
- ✅ Animations type gelée/miel sur tous les éléments
- ✅ Brillance et transparence sur gouttes de miel
- ✅ Texture hexagonale visible en background

## 🔮 Prochains Tests

### Quand les Niveaux 2-10 Seront Créés
- Progression complète du joueur
- Difficulté croissante
- Variété des cartes et objectifs
- Système d'étoiles calibré

### Sauvegarde Persistante
- La progression survit au rechargement de page
- Export/Import de sauvegarde
- Réinitialisation de progression

---

**Status** : ✅ Prêt pour les tests
**Version** : 6.0
**Date** : 26 octobre 2025

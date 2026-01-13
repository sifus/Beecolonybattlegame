# Changelog - V1 Stable

## Version 1.0 - 22 Octobre 2025

### ✨ Nouvelles fonctionnalités

#### Construction progressive de ruches
- **Compteur incrémental** : Les ruches peuvent être construites progressivement
  - 1ère ruche nécessite 20 abeilles au total
  - 2ème ruche nécessite 30 abeilles au total
  - Possibilité d'ajouter des abeilles par petits groupes
  - Affichage visuel du compteur (ex: "5/20" ou "15/30")
  - Ruche en construction affichée en pointillés transparents

#### Nouvelles méthodes de création de ruche
- **Double-clic** sur un arbre avec des abeilles → création de ruche
- **Sélection + clic** : Sélectionner des abeilles gravitant autour d'un arbre, puis cliquer sur cet arbre → création de ruche
- **Sélection par cercle** : Glisser la souris pour créer un cercle de sélection

#### Interface simplifiée
- Suppression du cartouche informatif blanc
- Uniquement 2 boutons en haut à gauche :
  - **Pause** (bleu) - Mettre le jeu en pause
  - **Recommencer** (vert) - Nouvelle partie
- Design épuré et minimaliste

#### Indicateurs visuels
- **Badge bleu** sous chaque arbre montrant le nombre d'abeilles du joueur présentes
- **Sélection orange vif** pulsante autour des abeilles sélectionnées
- **Compteur de santé** sur les ruches endommagées
- **Sablier** sur les ruches endommagées

### 🐛 Corrections de bugs

#### Bug d'orbite très large
- **Problème** : Parfois les abeilles se mettaient à orbiter en cercle très large autour de la carte
- **Solution** : Ajout des propriétés `hoverCenterX` et `hoverCenterY` pour mémoriser le point fixe de rotation
- **Impact** : Les abeilles restent maintenant bien groupées quand envoyées vers un point vide

#### Création de ruche par sélection
- **Problème** : Impossible de créer une ruche en sélectionnant les abeilles et en cliquant sur leur arbre
- **Solution** : Détection automatique et déclenchement de la création si toutes les abeilles sélectionnées gravitent autour de l'arbre cliqué
- **Impact** : Interface plus intuitive et fluide

### 🔧 Améliorations techniques

#### Refactorisation du code
- Fonction `createOrRepairHive()` réutilisable
- Suppression du code dupliqué
- Meilleure séparation des responsabilités

#### Nouveau système de types
- Ajout de `buildingProgress?: number[]` dans `Tree`
- Ajout de `hoverCenterX?: number` et `hoverCenterY?: number` dans `Bee`
- Suppression de l'ancien système `hiveBuilding`

#### Notifications
- Messages toast informatifs pour :
  - Progression de construction (ex: "Construction : 15/20 abeilles")
  - Ruche créée (ex: "Ruche niveau 2 créée !")
  - Ruche réparée (ex: "Ruche réparée ! +5 HP")
  - Erreurs (pas assez d'abeilles, maximum atteint, etc.)

### 📋 Règles du jeu (rappel)

- **Arbres** : Tous verts (vivants), seules les ruches sont colorées
- **Propriété** : Indiquée par la couleur des ruches (jaune = joueur, rouge = ennemi)
- **Production** : Les ruches produisent des abeilles tant qu'elles ont > 0 HP
- **Maximum** : 2 ruches par arbre
- **Construction** :
  - 1ère ruche : 20 abeilles, niveau 1, 20 HP max
  - 2ème ruche : 30 abeilles, niveau 2, 30 HP max
- **Combat** : Priorité abeilles → ruches
- **Victoire** : Détruire toutes les ruches ennemies

### 📁 Fichiers sauvegardés

- `game.ts` - Types TypeScript
- `GameUI.tsx` - Composant interface utilisateur
- `Bee.tsx` - Composant abeille
- `README.md` - Documentation de la version
- `restore.md` - Instructions de restauration
- `CHANGELOG.md` - Ce fichier

**Note** : Le fichier `App.tsx` est trop volumineux pour être copié dans le backup. Utilisez la version actuelle à la racine du projet comme référence.

### 🎮 État du jeu

✅ Toutes les mécaniques de base fonctionnelles  
✅ Interface épurée et intuitive  
✅ Pas de bugs connus majeurs  
✅ Prêt pour développement de nouvelles fonctionnalités  

---

**Version stable recommandée pour développement futur**

# Rush - V1 Stable Backup

**Date:** 22 Octobre 2025

## État du jeu

Cette version contient toutes les mécaniques de base fonctionnelles :

### Fonctionnalités principales
✅ Construction progressive de ruches (compteur incrémental)
- 1ère ruche : 20 abeilles nécessaires
- 2ème ruche : 30 abeilles nécessaires
- Possibilité d'ajouter des abeilles progressivement
- Compteur visuel X/20 ou X/30 affiché sur la ruche en construction

✅ Système de sélection
- Sélection par cercle
- Sélection par clic sur arbre
- Double-clic ou envoi d'abeilles vers leur propre arbre pour créer une ruche

✅ Combat et conquête
- Combat abeille vs abeille
- Combat abeille vs ruche avec priorité
- Réparation des ruches endommagées
- Destruction des ruches ennemies

✅ Système de santé
- Ruches niveau 1 : 20 HP max
- Ruches niveau 2 : 30 HP max
- Production d'abeilles tant que HP > 0

✅ Interface utilisateur
- Boutons Pause et Recommencer seulement (interface épurée)
- Notifications toast pour les actions
- Badge bleu montrant le nombre d'abeilles du joueur par arbre
- Indicateurs visuels de santé avec sablier et compteur

✅ Design visuel
- Fond patchwork de carrés colorés
- Étangs d'eau carrés
- Abeilles en orbite circulaire autour des arbres
- Indicateur de sélection orange vif
- Tous les arbres verts (vivants)

### Règles du jeu
- Tous les arbres sont verts (vivants)
- Seules les ruches colorées (jaunes/rouges) indiquent la propriété
- Les ruches produisent des abeilles tant qu'elles ont > 0 HP
- On peut créer des ruches directement sur n'importe quel arbre (neutre ou allié) par double-clic ou envoi d'abeilles
- Maximum 2 ruches par arbre
- Condition de victoire : détruire toutes les ruches ennemies

### Bugs corrigés
✅ Problème d'orbite très large des abeilles (ajout de hoverCenterX/Y)
✅ Création de ruche par sélection d'abeilles et clic sur leur arbre
✅ Système de construction incrémentale fonctionnel

## Fichiers sauvegardés
- App.tsx (logique principale du jeu)
- components/Tree.tsx (affichage des arbres et ruches)
- components/Bee.tsx (affichage des abeilles)
- components/GameUI.tsx (interface utilisateur)
- types/game.ts (types TypeScript)
- utils/mapGenerator.ts (génération de carte)
- styles/globals.css (styles CSS)

## Restauration
Pour restaurer cette version, copiez les fichiers du dossier `backup-v1-stable/` vers leurs emplacements respectifs à la racine du projet.

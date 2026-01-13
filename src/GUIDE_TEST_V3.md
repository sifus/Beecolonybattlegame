# 🧪 GUIDE DE TEST V3 - Refonte Visuelle + Génération Aléatoire

## 🎯 Objectif
Valider que toutes les modifications de la V3 fonctionnent correctement.

---

## ✅ CHECKLIST DE TEST COMPLÈTE

### 1️⃣ Menu Principal

#### Visuel
- [ ] Fond dégradé jaune→orange→rouge s'affiche
- [ ] Titre "🐝 RUSH 🐝" visible en gros
- [ ] Sous-titre "Conquérez la forêt avec vos abeilles !"
- [ ] Motif rayé en arrière-plan (opacity 10%)

#### Bouton Jouer
- [ ] Texte : "Jouer" + "Carte aléatoire"
- [ ] Couleur verte (#10B981)
- [ ] Icône Play visible
- [ ] **Pas de badge "Nouveau !"**
- [ ] Effet hover : devient vert foncé + scale 105%
- [ ] Clic lance le jeu

#### Bouton Options
- [ ] Texte : "Options"
- [ ] Couleur bleue (#3B82F6)
- [ ] Icône Settings visible
- [ ] Effet hover fonctionne
- [ ] Clic ouvre écran options

#### Footer
- [ ] Texte d'aide visible
- [ ] Icône ℹ️ + texte "Appuyez sur ℹ️ en jeu"

---

### 2️⃣ Démarrage du Jeu

#### Génération de Carte
- [ ] Toast "🎮 Nouvelle partie - Carte aléatoire générée !" s'affiche
- [ ] Toast disparaît après 3 secondes
- [ ] Carte générée est **aléatoire** (pas toujours la même)
- [ ] Nombre d'arbres : entre 5 et 10
- [ ] Nombre d'étangs : entre 0 et 3

#### Arbres de Départ
- [ ] 1 arbre avec ruche jaune (joueur)
- [ ] 1 arbre avec ruche rouge (ennemi)
- [ ] Ruches niveau 1 (petites)
- [ ] 7/7 HP chacune au départ
- [ ] 0 abeilles autour

#### Arbres Neutres
- [ ] Arbres verts sans ruche
- [ ] Cliquables
- [ ] Identiques visuellement (pas d'étoile)

---

### 3️⃣ Boutons de Jeu (4 Coins)

#### Haut Gauche - Accueil 🏠
- [ ] Bouton présent en **haut à gauche**
- [ ] Forme : **Cercle** (rounded-full)
- [ ] Taille : 56x56px (w-14 h-14)
- [ ] Fond : **Blanc semi-transparent** (bg-white/90)
- [ ] Effet blur : backdrop-blur-sm
- [ ] Icône : Maison **grise** (text-gray-700)
- [ ] Ombre : shadow-lg visible
- [ ] Hover : Fond devient blanc opaque
- [ ] Tooltip : "Retour au menu"
- [ ] Clic : Retour au menu principal

#### Haut Droite - Info ℹ️
- [ ] Bouton présent en **haut à droite**
- [ ] Style identique (cercle blanc semi-transparent)
- [ ] Icône : Info grise
- [ ] Tooltip : "Afficher/Masquer les contrôles"
- [ ] Clic : Ouvre/ferme le panneau tutoriel

#### Haut Droite - Bûcherons 🪓
- [ ] Bouton présent **à côté du bouton Info**
- [ ] Gap de 8px entre les deux (gap-2)
- [ ] **Désactivé** (par défaut) :
  - Fond blanc semi-transparent
  - Icône grise
- [ ] **Activé** :
  - Fond orange (#F97316 @ 90%)
  - Icône blanche
- [ ] Tooltip : "Activer/Désactiver les bûcherons"
- [ ] Clic : Toggle bûcherons

#### Bas Gauche - Recommencer 🔄
- [ ] Bouton présent en **bas à gauche**
- [ ] Style identique (cercle blanc)
- [ ] Icône : RotateCcw grise
- [ ] Tooltip : "Recommencer"
- [ ] Clic : **Génère NOUVELLE carte aléatoire**
- [ ] Toast "Nouvelle partie..." s'affiche

#### Bas Droite - Pause ⏸️
- [ ] Bouton présent en **bas à droite**
- [ ] Style identique (cercle blanc)
- [ ] Icône : **Pause** si en jeu, **Play** si en pause
- [ ] Icône grise
- [ ] Tooltip : "Pause" ou "Reprendre"
- [ ] Clic : Pause/Reprend le jeu
- [ ] Icône change selon état

#### Alignement Général
- [ ] Tous les boutons ont la **même taille** (56x56px)
- [ ] Tous les boutons sont des **cercles parfaits**
- [ ] Tous ont le **même effet hover**
- [ ] Tous ont **shadow-lg**
- [ ] Positionnement cohérent (4px de marge)

---

### 4️⃣ Pastille d'Abeilles (Jaune)

#### Position
- [ ] Pastille apparaît quand il y a des abeilles autour d'un arbre
- [ ] Position : **Haut droite** de l'arbre
- [ ] Coordonnées : tree.x + 35, tree.y - 35

#### Style
- [ ] Forme : **Cercle** (r: 12)
- [ ] Couleur fond : **Jaune** (#FDD835)
- [ ] Opacity : 95%
- [ ] Bordure : **Jaune foncé** (#F9A825)
- [ ] Épaisseur bordure : 2px

#### Texte
- [ ] Nombre d'abeilles affiché au centre
- [ ] Couleur texte : **Jaune très foncé** (#F57C00)
- [ ] Font size : 11
- [ ] Font weight : bold
- [ ] Centré verticalement et horizontalement

#### Fonctionnel
- [ ] Nombre correct (compte bien les abeilles)
- [ ] Disparaît quand plus d'abeilles
- [ ] Réapparaît quand abeilles reviennent
- [ ] Lisible et visible

---

### 5️⃣ Ruches Niveau 1

#### Forme Générale
- [ ] Ellipse horizontale (rx: 12, ry: 15)
- [ ] Bordure marron (#8D6E63)
- [ ] Épaisseur bordure : 2

#### Trou Noir
- [ ] **Trou noir visible au centre**
- [ ] Forme : Ellipse (rx: 3, ry: 1.8)
- [ ] Couleur : Noir pur (#000)
- [ ] Bien centré sur la ruche

#### Remplissage Visuel
- [ ] **100% HP (7/7)** :
  - Ruche entièrement remplie (jaune ou rouge)
  - Pas de gris visible
  - Trou noir visible
- [ ] **50% HP (3-4/7)** :
  - Moitié haute remplie (couleur)
  - Moitié basse vide (gris clair)
  - Trou noir visible
- [ ] **0% HP (0/7)** :
  - Ruche vide (gris clair)
  - Trou noir visible

#### Compteur "X/Y"
- [ ] **Ruche intacte (7/7)** : **PAS de compteur** affiché
- [ ] **Ruche endommagée (ex: 5/7)** : Compteur "5/7" affiché
- [ ] **Ruche en construction** : Compteur affiché
- [ ] Position compteur : En bas de la ruche (y + 20)
- [ ] Texte blanc avec bordure noire
- [ ] Font size : 10, bold

#### Couleurs
- [ ] Ruche joueur : **Jaune** (#FDD835)
- [ ] Ruche ennemie : **Rouge** (#D32F2F)
- [ ] Fond vide : **Gris clair** (#D7CCC8 @ 30%)

---

### 6️⃣ Ruches Niveau 2

#### Structure Double
- [ ] **2 ruches visibles** :
  - Petite ruche (niveau 1) à gauche
  - Grosse ruche à droite

#### Petite Ruche (L1)
- [ ] Position : tree.x - 8, tree.y
- [ ] Taille : rx: 12, ry: 15
- [ ] Trou noir : r: 3
- [ ] Remplissage selon HP
- [ ] Bordure marron

#### Grosse Ruche
- [ ] Position : tree.x + 8, tree.y - 5 (décalée)
- [ ] Taille : rx: 18, ry: 22 (plus grande)
- [ ] **Gros trou noir** : r: 5, ry: 3
- [ ] Remplissage selon HP
- [ ] Bordure marron épaisse (2.5)

#### Remplissage Visuel L2
- [ ] **100% HP (35/35)** : Les 2 ruches pleines
- [ ] **50% HP (~17/35)** : Les 2 ruches à moitié
- [ ] Progression cohérente sur les 2 ruches

#### Compteur L2
- [ ] **Pleine santé (35/35)** : **PAS de compteur**
- [ ] **Endommagée (ex: 20/35)** : Compteur "20/35" affiché
- [ ] Position : En bas de la grosse ruche (y + hive2OffsetY + 25)

#### Décalage Visible
- [ ] Décalage horizontal : +8 et -8 (16px total)
- [ ] Décalage vertical : -5 pour grosse ruche
- [ ] Les 2 ruches sont **accolées** mais décalées

---

### 7️⃣ Arbres

#### Visuels
- [ ] Tous les arbres ont la **même apparence**
- [ ] **Pas d'étoile** sur les arbres de départ
- [ ] Tronc marron (#8D6E63) pour tous
- [ ] Feuillage vert (#8BC34A)

#### Ombres
- [ ] **Ombre visible** sous chaque arbre
- [ ] Forme : Ellipse aplatie
- [ ] Position : tree.x + 2, tree.y + foliageRadius * 1.1
- [ ] Taille : rx: foliageRadius * 0.8, ry: foliageRadius * 0.3
- [ ] Couleur : Noir @ 20% opacity
- [ ] Direction cohérente (source lumière en haut)

#### Arbres Coupés (Bûcherons)
- [ ] Souche visible si arbre coupé
- [ ] Anneaux de croissance visibles
- [ ] Pas d'ombre sous la souche

---

### 8️⃣ Étangs

#### Visuel de Base
- [ ] Rectangles bleus (#4A90E2)
- [ ] Coins arrondis (rx: 8)
- [ ] Tailles variables (1x1 à 2x2 carrés)

#### Ombre Intérieure
- [ ] **Effet de profondeur visible**
- [ ] Bords plus foncés que centre
- [ ] Gradient radial du centre (cx: 50%, cy: 30%)
- [ ] Transition :
  - 60% → Transparent
  - 100% → Noir @ 25%
- [ ] Direction cohérente (lumière centrale vers haut)

#### Fonctionnel
- [ ] Abeilles tombent dans l'eau (33% chance)
- [ ] Splash visible quand abeille tombe
- [ ] Étangs bloquent passage

---

### 9️⃣ Génération Aléatoire

#### Variété des Cartes
- [ ] **Test 1** : Jouer 5 parties, vérifier que les cartes sont différentes
- [ ] Nombre d'arbres varie (5-10)
- [ ] Nombre d'étangs varie (0-3)
- [ ] Positions arbres changent
- [ ] Tailles étangs changent

#### Recommencer
- [ ] Clic sur "Recommencer" (🔄)
- [ ] **Nouvelle carte générée** (pas la même)
- [ ] Toast "Nouvelle partie..." affiché
- [ ] Jeu redémarre avec nouvelle configuration

#### Cohérence
- [ ] Arbres ne se chevauchent pas (min 150px)
- [ ] Arbres pas dans les étangs
- [ ] Arbres pas trop près des bords (100px marge)
- [ ] 1 arbre joueur + 1 arbre ennemi toujours présents
- [ ] Reste = arbres neutres

---

### 🔟 Panneau Tutoriel

#### Ouverture/Fermeture
- [ ] Clic sur ℹ️ : Panneau s'ouvre
- [ ] Re-clic sur ℹ️ : Panneau se ferme
- [ ] Clic sur X dans le panneau : Panneau se ferme

#### Contenu
- [ ] Titre "🎮 Comment Jouer"
- [ ] 5 sections visibles :
  - Sélectionner des Abeilles (bleu)
  - Envoyer des Abeilles (vert)
  - Construire/Réparer (violet)
  - Attention aux Étangs (cyan)
  - Objectif (rouge)
- [ ] Chaque section a couleur de fond
- [ ] Texte lisible (blanc/gris clair)

---

## 🎮 TESTS FONCTIONNELS

### Sélection
- [ ] Clic sur arbre allié : Sélectionne toutes ses abeilles
- [ ] Clic-glisser : Cercle jaune lumineux apparaît
- [ ] Relâcher : Abeilles dans le cercle sélectionnées
- [ ] Indicateur orange sur abeilles sélectionnées

### Mouvement
- [ ] Clic sur arbre : Abeilles sélectionnées y vont
- [ ] Abeilles évitent étangs (ou tombent dedans)
- [ ] Abeilles orbitent autour de l'arbre cible

### Construction
- [ ] Double-clic sur arbre neutre avec 5+ abeilles : Construit ruche L1
- [ ] 5 abeilles consommées
- [ ] Ruche apparaît avec 7/7 HP
- [ ] Trou noir visible

### Amélioration
- [ ] Double-clic sur ruche L1 avec 20+ abeilles : Upgrade L2
- [ ] 20 abeilles consommées
- [ ] 2 ruches apparaissent (L1 + grosse)
- [ ] 2 trous noirs visibles
- [ ] HP passe à 35/35

### Combat
- [ ] Abeilles attaquent ruches ennemies
- [ ] HP de ruche diminue
- [ ] Remplissage visuel change
- [ ] Compteur "X/Y" apparaît quand endommagée
- [ ] Ruche disparaît à 0 HP

### Réparation
- [ ] Double-clic sur ruche endommagée avec abeilles
- [ ] 1 abeille = +1 HP
- [ ] Remplissage visuel augmente
- [ ] Compteur disparaît si pleine santé

---

## 🏆 TESTS GAME OVER

### Victoire
- [ ] Détruire toutes les ruches ennemies
- [ ] Écran "🎉 Victoire !" s'affiche
- [ ] Bouton "Rejouer" présent
- [ ] Bouton "Menu" présent
- [ ] Clic "Rejouer" : Nouvelle carte aléatoire
- [ ] Clic "Menu" : Retour menu principal

### Défaite
- [ ] Perdre toutes ses ruches
- [ ] Écran "💀 Défaite..." s'affiche
- [ ] Boutons "Rejouer" et "Menu" présents
- [ ] Fonctionnent correctement

---

## 📱 TESTS RESPONSIVE (Futur)

### Desktop
- [ ] Tous les boutons visibles
- [ ] Pas de débordement
- [ ] Échelle correcte

### Tablette
- [ ] Interface adaptée
- [ ] Boutons cliquables

### Mobile
- [ ] Boutons assez grands pour touch
- [ ] Pas de chevauchement

---

## 🐛 TESTS DE BUGS CONNUS

### Vérifications
- [ ] Pas d'arbres dans les étangs
- [ ] Pas d'arbres qui se chevauchent
- [ ] Pas de ruches sans arbre
- [ ] Abeilles ne disparaissent pas sans raison
- [ ] Compteur "X/Y" ne reste pas affiché sur ruche pleine
- [ ] Pas de console errors
- [ ] Pas de warnings React

---

## ✅ VALIDATION FINALE

### Checklist Globale
- [ ] Tous les tests visuels passent
- [ ] Tous les tests fonctionnels passent
- [ ] Aucun bug critique
- [ ] Performance acceptable (60 FPS)
- [ ] Génération aléatoire variée
- [ ] Interface claire et moderne

### Si Tout Est OK
✅ **V3 est validée et prête pour publication !**

### Si Problèmes
❌ Noter les bugs et les corriger avant validation

---

## 📊 Rapport de Test (Template)

```
DATE : ___________
TESTEUR : ___________
VERSION : V3

TESTS VISUELS : ___/50
TESTS FONCTIONNELS : ___/30
BUGS TROUVÉS : ___

DÉTAILS :
- Boutons : OK / KO
- Pastille : OK / KO
- Ruches L1 : OK / KO
- Ruches L2 : OK / KO
- Arbres : OK / KO
- Étangs : OK / KO
- Génération : OK / KO

COMMENTAIRES :
_______________________
_______________________

STATUT FINAL : VALIDÉ / À CORRIGER
```

---

**Version** : 3.0  
**Date** : 25 Octobre 2025  
**Tests** : 80+ points de vérification  
**Durée estimée** : 30-45 minutes de tests complets

# 🧪 GUIDE DE TEST - Menu & Niveaux

## 🎯 Checklist Rapide (5 minutes)

### ✅ Test de l'Écran d'Accueil
- [ ] Le jeu démarre sur le **menu principal** (fond jaune-orange-rouge)
- [ ] Titre "🐝 RUSH 🐝" est visible et stylisé
- [ ] Bouton **"Jouer"** est vert avec badge "Nouveau !"
- [ ] Bouton **"Options"** est bleu
- [ ] Hover sur les boutons → effet de scale (105%)
- [ ] Footer affiche les instructions de base

### ✅ Test de l'Écran d'Options
- [ ] Clic sur "Options" → Écran options s'affiche (fond bleu-violet-rose)
- [ ] Toggle **"Bûcherons"** fonctionne (gris → orange)
- [ ] Animation du switch est fluide
- [ ] Section "Audio" affiche "Prochainement disponible"
- [ ] Section "Informations" affiche les détails du Niveau 1
- [ ] Clic sur **"Retour"** → Retour au menu principal

### ✅ Test du Démarrage du Jeu
- [ ] Clic sur "Jouer" → Jeu démarre
- [ ] Toast affiché : "🎮 Niveau 1 - Facile : Carte symétrique..."
- [ ] **4 arbres visibles** sur la carte
- [ ] **Pas d'étangs** (niveau facile)
- [ ] Fond de carte : patchwork de carrés verts

### ✅ Test de la Carte Niveau 1
- [ ] **Arbre joueur** (jaune) à gauche, milieu vertical
- [ ] **Arbre ennemi** (rouge) à droite, milieu vertical (symétrique)
- [ ] **2 arbres neutres** (gris) au centre
- [ ] Carte est **visuellement symétrique**
- [ ] Distance égale entre chaque camp et les neutres

### ✅ Test du Départ Équilibré
- [ ] Arbre joueur a **1 ruche niveau 1** (texte "7/7")
- [ ] Arbre ennemi a **1 ruche niveau 1** (texte "7/7")
- [ ] Les deux camps ont **0 abeilles** au départ
- [ ] Après 3 secondes → badge bleu affiche "1" abeille
- [ ] Production continue : +1 abeille toutes les 3 secondes

### ✅ Test des Compteurs de Ruche
- [ ] Ruche pleine santé affiche **"7/7"** (pas de sablier !)
- [ ] Texte est **centré** sur la ruche
- [ ] Texte blanc avec bordure noire (lisible)
- [ ] Si ruche endommagée → affiche "5/7", "3/7", etc.
- [ ] **Aucun sablier visible** même quand endommagé

### ✅ Test de la Construction
- [ ] Sélectionner des abeilles → envoyer vers arbre neutre
- [ ] Abeilles gravitent autour de l'arbre
- [ ] Double-clic sur l'arbre → Construction démarre
- [ ] Compteur "1/5", "2/5", ... "5/5" s'affiche
- [ ] À 5/5 → Ruche niveau 1 créée avec "7/7"

### ✅ Test du Game Over
- [ ] Si victoire → Écran "🎉 Victoire !"
- [ ] Si défaite → Écran "💀 Défaite"
- [ ] 2 boutons visibles : **"Rejouer"** et **"Menu"**
- [ ] Clic "Rejouer" → Redémarre le Niveau 1
- [ ] Clic "Menu" → Retour au menu principal

### ✅ Test du Panneau Tutoriel (en jeu)
- [ ] Bouton **Info** (violet) visible en haut à gauche
- [ ] Clic sur Info → Panneau tutoriel s'affiche
- [ ] Toutes les sections sont présentes (sélection, mouvement, construction, étangs, objectif)
- [ ] Clic sur X → Panneau se ferme

---

## 🎮 Scénario de Test Complet (10 minutes)

### Phase 1 : Navigation (2 min)
1. **Lancer le jeu** → Menu s'affiche
2. **Clic "Options"** → Écran options
3. **Toggle bûcherons ON** → Vérifie que le switch devient orange
4. **Toggle bûcherons OFF** → Vérifie que le switch devient gris
5. **Clic "Retour"** → Menu principal
6. **Clic "Jouer"** → Jeu démarre

### Phase 2 : Vérification Niveau 1 (2 min)
1. **Compter les arbres** → Doit être exactement 4
2. **Vérifier symétrie** → Arbre joueur (gauche) et ennemi (droite) à même hauteur
3. **Chercher étangs** → Aucun étang ne doit être présent
4. **Vérifier ruches** → "7/7" sur arbre joueur ET ennemi
5. **Vérifier abeilles** → Badge "0" au départ, puis "1" après 3s

### Phase 3 : Gameplay Basique (4 min)
1. **Attendre 15 secondes** → ~5 abeilles produites
2. **Clic sur arbre joueur** → Sélectionne les 5 abeilles
3. **Clic sur arbre neutre du haut** → Envoie les abeilles
4. **Attendre arrivée** → Abeilles gravitent autour
5. **Double-clic sur arbre neutre** → Construction démarre
6. **Observer compteur** → "1/5", "2/5", ..., "5/5"
7. **Vérifier ruche créée** → "7/7" apparaît

### Phase 4 : Test Compteur Sans Sablier (2 min)
1. **Sélectionner 10 abeilles**
2. **Envoyer vers ruche ennemie**
3. **Combat démarre** → HP diminue
4. **Vérifier compteur** → "7/7" → "5/7" → "3/7"
5. **Vérifier AUCUN sablier** affiché
6. **Texte toujours centré** sur la ruche

### Phase 5 : Game Over (1 min)
1. **Laisser l'IA gagner** OU **Mettre en pause et attendre**
2. **Écran Game Over s'affiche**
3. **Clic "Rejouer"** → Niveau 1 redémarre (nouvelle carte)
4. **Jouer 10 secondes**
5. **Pause → Clic "Recommencer"**
6. **Attendre Game Over**
7. **Clic "Menu"** → Retour au menu principal

---

## 🐛 Bugs Potentiels à Surveiller

### Menu
- [ ] Menu ne s'affiche pas au lancement
- [ ] Boutons ne réagissent pas au clic
- [ ] Effets hover ne fonctionnent pas
- [ ] Textes mal alignés ou illisibles

### Options
- [ ] Toggle bûcherons ne change pas d'état
- [ ] Animation du switch est saccadée
- [ ] Bouton "Retour" ne fonctionne pas
- [ ] État des options n'est pas conservé

### Niveau 1
- [ ] Nombre d'arbres ≠ 4
- [ ] Carte n'est pas symétrique
- [ ] Étangs présents (ne devrait pas)
- [ ] Un camp a plus de ressources que l'autre
- [ ] Arbres mal positionnés (hors grille)

### Compteurs Ruche
- [ ] Sablier toujours affiché (ancien code)
- [ ] Compteur pas centré
- [ ] Compteur illisible (pas de bordure)
- [ ] Compteur ne se met pas à jour
- [ ] Affiche "undefined/7" ou "NaN/7"

### Navigation
- [ ] Impossible de revenir au menu depuis le jeu
- [ ] Game Over ne s'affiche pas
- [ ] Boutons "Rejouer" ou "Menu" ne fonctionnent pas
- [ ] Freeze lors des transitions d'écran

### Performance
- [ ] Lag au lancement du menu
- [ ] Lag lors du démarrage du jeu
- [ ] Ralentissements en jeu (même sur Niveau 1)
- [ ] Crash au retour au menu

---

## 📊 Résultats Attendus

### Après Menu
- ✅ Navigation fluide entre écrans
- ✅ Design cohérent et attrayant
- ✅ Tous les boutons fonctionnels

### Après Niveau 1
- ✅ Carte équilibrée et symétrique
- ✅ 4 arbres exactement
- ✅ Pas d'étangs (niveau facile)
- ✅ Départ équitable (1 ruche L1, 0 abeilles)

### Après Compteur
- ✅ Texte "X/Y" toujours visible
- ✅ Pas de sablier
- ✅ Texte centré et lisible

### Après Game Over
- ✅ 2 boutons disponibles (Rejouer, Menu)
- ✅ Les deux fonctionnent correctement
- ✅ Transition fluide

---

## 🎯 Critères de Validation

### ✅ Menu VALIDÉ si :
- Menu s'affiche au lancement
- Tous les boutons sont cliquables
- Navigation fonctionne dans les deux sens
- Design est attractif et lisible

### ✅ Niveau 1 VALIDÉ si :
- Exactement 4 arbres sur la carte
- Carte est visuellement symétrique
- Aucun étang présent
- Les deux camps démarrent équitablement
- Production fonctionne normalement

### ✅ Compteur VALIDÉ si :
- Format "X/Y" toujours affiché (ex: "7/7", "5/7")
- Pas de sablier visible
- Texte centré sur la ruche
- Lisible (bordure noire sur texte blanc)

### ✅ Navigation VALIDÉE si :
- Menu ↔ Options fonctionne
- Menu → Jeu fonctionne
- Game Over → Menu fonctionne
- Game Over → Rejouer fonctionne
- Aucun freeze ou crash

---

## 💡 Conseils de Test

### Pour Tester Rapidement
1. **Menu** : 30 secondes (clic tous les boutons)
2. **Options** : 30 secondes (toggle ON/OFF)
3. **Niveau 1** : 1 minute (observer la carte)
4. **Compteur** : 1 minute (endommager une ruche)
5. **Game Over** : 1 minute (tester les 2 boutons)

**Total** : ~5 minutes pour un test complet

### Pour Tester en Profondeur
1. Jouer une partie complète du Niveau 1
2. Tester tous les scénarios de navigation
3. Vérifier tous les états possibles des ruches (7/7, 6/7, ..., 1/7, 0/7)
4. Tester avec et sans bûcherons activés
5. Vérifier la cohérence visuelle sur différentes tailles d'écran

**Total** : ~15-20 minutes

---

## 📝 Rapport de Bugs

Si vous trouvez un bug, notez :

**Bug #X** : [Titre court]
- **Où** : Menu / Options / Niveau 1 / Compteur / Navigation
- **Quoi** : Description précise du problème
- **Comment reproduire** :
  1. Étape 1
  2. Étape 2
  3. Étape 3
- **Attendu** : Ce qui devrait se passer
- **Réel** : Ce qui se passe vraiment
- **Gravité** : Bloquant / Majeur / Mineur / Cosmétique

---

## ✅ Checklist Finale de Validation

Avant de valider la mise à jour, vérifier :

- [ ] ✅ Menu s'affiche au lancement
- [ ] ✅ Navigation fonctionne (tous les boutons)
- [ ] ✅ Niveau 1 a exactement 4 arbres
- [ ] ✅ Carte Niveau 1 est symétrique
- [ ] ✅ Aucun étang sur Niveau 1
- [ ] ✅ Départ équitable (1 ruche L1, 0 abeilles)
- [ ] ✅ Compteur "X/Y" visible (pas de sablier)
- [ ] ✅ Game Over affiche 2 boutons
- [ ] ✅ "Rejouer" redémarre le niveau
- [ ] ✅ "Menu" retourne au menu principal
- [ ] ✅ Panneau tutoriel accessible (bouton Info)
- [ ] ✅ Options → Toggle bûcherons fonctionne

**Si tous les items sont cochés** → ✅ **VALIDÉ !**

---

Bon test ! 🚀

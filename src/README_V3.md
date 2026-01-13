# 🐝 RUSH - Version 3.0

## 🎮 Jeu de Stratégie en Temps Réel

Conquérez la forêt avec vos abeilles ! Construisez des ruches, gérez vos ressources et détruisez les ruches ennemies.

---

## ✨ Nouveautés V3 (25 Octobre 2025)

### 🎨 Refonte Visuelle Complète
- **Boutons aux 4 coins** - Interface moderne
- **Ruches avec trou noir** - Sortie des abeilles
- **Remplissage visuel** - HP visible instantanément
- **Compteur conditionnel** - Seulement si endommagé
- **Pastille jaune** - Cohérente avec thème abeilles
- **Ombres partout** - Profondeur et réalisme

### 🔄 Génération Aléatoire
- **Carte unique** à chaque partie
- **5-10 arbres** variables
- **0-3 étangs** de tailles différentes
- **Rejouabilité infinie**

---

## 🎯 Comment Jouer

### Contrôles
- **Clic** sur arbre allié → Sélectionne abeilles
- **Clic-glisser** → Sélection multiple (cercle jaune)
- **Clic** sur destination → Envoie abeilles
- **Double-clic** sur arbre → Construit/Répare/Améliore

### Objectif
**Détruire toutes les ruches ennemies** (rouges) !

### Construction
- **Ruche L1** : 5 abeilles → 7 HP
- **Ruche L2** : 20 abeilles sur L1 → 35 HP

### Production
- **Ruche L1** : 1 abeille / 3 secondes
- **Ruche L2** : 1 abeille / seconde

### Dangers
- **Étangs** : 33% de chance de perdre une abeille
- **Combat** : Abeilles attaquent automatiquement

---

## 🎮 Interface

```
┌─────────────────────────────┐
│ [🏠]           [ℹ️] [🪓]    │  Haut
│                             │
│         🌳    🌳    🌳      │
│                             │
│       🐝🐝  🐝🐝  🐝🐝       │
│                             │
│ [🔄]           [⏸️]         │  Bas
└─────────────────────────────┘
```

### Boutons
- **🏠 Accueil** (Haut Gauche) - Retour au menu
- **ℹ️ Info** (Haut Droite) - Tutoriel
- **🪓 Bûcherons** (Haut Droite) - Mode difficile
- **🔄 Recommencer** (Bas Gauche) - Nouvelle carte
- **⏸️ Pause** (Bas Droite) - Pause/Reprendre

---

## 🏠 Ruches

### Niveau 1
```
    .-"""-.
   /       \
  |   ⚫   |  ← Petit trou noir
   \       /
    `-----'
```
- **7 HP**
- **1 abeille / 3s**
- Coût : **5 abeilles**

### Niveau 2
```
  .-"""-.   .-----.
 /       \ / ⚫ BIG \
|   ⚫   | |        |
 \       / \      /
  `-----'   `-----'
```
- **35 HP**
- **1 abeille / s**
- Coût : **20 abeilles** (upgrade L1)

---

## 🎨 Design

### Couleurs
- **Joueur** : Jaune (#FDD835)
- **Ennemi** : Rouge (#D32F2F)
- **Neutre** : Vert (#8BC34A)
- **Eau** : Bleu (#4A90E2)

### Style
- **Boutons** : Cercles blancs semi-transparents
- **Pastille** : Jaune en haut-droite des arbres
- **Ombres** : Noir 20-25% sous arbres et étangs
- **Remplissage** : Ruches se remplissent selon HP

---

## 📁 Structure du Projet

```
/
├── App.tsx                 # Application principale
├── components/
│   ├── GameUI.tsx         # Boutons de jeu (4 coins)
│   ├── Tree.tsx           # Arbres + Ruches + Ombres
│   ├── Bee.tsx            # Abeilles
│   ├── MainMenu.tsx       # Menu principal
│   └── OptionsMenu.tsx    # Écran options
├── utils/
│   ├── mapGenerator.ts    # Génération aléatoire
│   ├── levelGenerator.ts  # Niveaux fixes (inutilisé)
│   └── enemyAI.ts         # IA ennemie
├── types/
│   └── game.ts            # Types TypeScript
└── docs/
    ├── GUIDE_RAPIDE.md
    ├── REGLES_DU_JEU.md
    ├── REFONTE_VISUELLE_V3.md
    └── GUIDE_TEST_V3.md
```

---

## 🧪 Tests

### Rapide (5 min)
1. Lancer le jeu
2. Vérifier boutons aux 4 coins
3. Jouer 1 partie
4. Clic "Recommencer" → Nouvelle carte

### Complet (30 min)
Voir `/GUIDE_TEST_V3.md` - 80+ points de test

---

## 🚀 Prochaines Étapes

### Court Terme
- [ ] Tests extensifs
- [ ] Corrections bugs
- [ ] Tweaks visuels

### Moyen Terme
- [ ] Animation sortie abeilles du trou
- [ ] Arbres à 3 tailles pour L2
- [ ] Mode Campagne + Mode Aléatoire

### Long Terme
- [ ] Multijoueur local
- [ ] Éditeur de niveaux
- [ ] Statistiques et achievements

---

## 📚 Documentation

### Utilisateur
- `/GUIDE_RAPIDE.md` - Guide 5 minutes
- `/REGLES_DU_JEU.md` - Règles complètes
- `/GUIDE_TEST_V3.md` - Tests

### Développeur
- `/REFONTE_VISUELLE_V3.md` - Détails refonte
- `/RETOUR_GENERATION_ALEATOIRE.md` - Génération
- `/CHANGELOG_V3_COMPLET.md` - Changelog
- `/SESSION_COMPLETE_25_OCT.md` - Session complète

---

## 🎯 Statut

**Version** : 3.0 (Refonte Visuelle + Aléatoire)  
**Date** : 25 Octobre 2025  
**Statut** : ✅ Complet et fonctionnel  
**Tests** : En cours  
**Publication** : Prêt pour beta  

---

## 🏆 Fonctionnalités Complètes

### Gameplay
✅ Construction de ruches (L1, L2)  
✅ Combat automatique  
✅ Réparation de ruches  
✅ Étangs mortels (33%)  
✅ IA compétitive  
✅ Génération aléatoire  

### Interface
✅ Menu principal professionnel  
✅ Écran d'options  
✅ Boutons modernes (4 coins)  
✅ Panneau tutoriel intégré  
✅ Game Over (Victoire/Défaite)  

### Visuels
✅ Ruches avec trou noir  
✅ Remplissage visuel HP  
✅ Compteur conditionnel  
✅ Ombres (arbres + étangs)  
✅ Pastille jaune cohérente  
✅ Cercle de sélection lumineux  

---

## 💡 Conseils

### Débutants
1. Commencez avec 1 ruche de départ
2. Construisez 2-3 ruches L1 rapidement
3. Évitez les étangs !
4. Améliorez en L2 quand possible

### Avancés
1. Contrôlez le centre de la carte
2. Harcelez les constructions ennemies
3. Utilisez les étangs tactiquement
4. Gérez vos ressources (ne dépensez pas tout)

---

## 🐛 Bugs Connus

Aucun bug critique connu actuellement.

Si vous trouvez un bug, vérifiez :
- [ ] Console du navigateur (F12)
- [ ] Rafraîchir la page
- [ ] Navigateur à jour

---

## 📞 Support

**Documentation** : Voir `/docs/`  
**Tests** : Voir `/GUIDE_TEST_V3.md`  
**Changelog** : Voir `/CHANGELOG_V3_COMPLET.md`  

---

**Bon jeu !** 🐝✨

---

**Crédits**  
Développé avec React + TypeScript + Tailwind CSS  
Motion animations : motion/react  
Icons : lucide-react  
Toast notifications : sonner  

**Licence** : À définir

# Fonctionnalités V1 Stable - Rush

## 🎮 Gameplay

### Construction de ruches
```
┌─────────────────────────────────┐
│  Construction Progressive       │
├─────────────────────────────────┤
│  1ère ruche: 0/20 → 5/20 → 20/20 ✓  │
│  2ème ruche: 0/30 → 15/30 → 30/30 ✓ │
│                                 │
│  ✨ Ajout progressif d'abeilles │
│  📊 Compteur visuel sur arbre   │
│  👻 Ruche fantôme en pointillés │
└─────────────────────────────────┘
```

### Méthodes de création
1. **Double-clic** sur arbre avec abeilles
2. **Sélection** d'abeilles + **clic** sur leur arbre
3. **Réparation** automatique si ruche endommagée

### Sélection d'abeilles
```
   ⭕ Cercle de sélection
   👆 Clic simple pour déplacer
   🎯 Détection automatique arbre/vide
```

## 🎨 Interface

### Boutons (haut gauche)
```
┌────┐ ┌────┐
│ ⏸ │ │ 🔄 │  Pause + Recommencer
└────┘ └────┘
```

### Indicateurs visuels
- 🔵 **Badge bleu** : Nombre d'abeilles du joueur par arbre
- 🟠 **Cercle orange** : Abeilles sélectionnées (pulsant)
- ⏳ **Sablier** : Ruche endommagée
- 🔢 **Compteur** : X/20 HP ou X/30 HP

## 🐝 Abeilles

### Comportement
- **Orbite circulaire** autour des arbres (rayon 40-60px)
- **Nuage compact** en déplacement
- **Hover stable** quand envoyées vers un point vide (✅ fix bug orbite large)

### Couleurs
- 🟡 **Jaune** : Joueur (#FDD835)
- 🔴 **Rouge** : Ennemi (#D32F2F)

## 🌳 Arbres & Ruches

### Arbres
- Tous **verts** (vivants)
- Maximum **2 ruches** par arbre
- Propriété indiquée par **couleur des ruches**

### Ruches
```
Niveau 1: 20 abeilles → 20 HP max
Niveau 2: 30 abeilles → 30 HP max
          (2ème ruche uniquement)
```

### États des ruches
- ✅ **Complète** : Détails visuels, production active
- 🔨 **En construction** : Fantôme + compteur X/Y
- 💔 **Endommagée** : Opacité réduite + sablier + compteur HP
- 💥 **Détruite** : Disparaît (arbre devient neutre si plus de ruches)

## ⚔️ Combat

### Priorités
1. **Abeille vs Abeille** : Les deux meurent
2. **Abeille vs Ruche** : -1 HP à la ruche, abeille meurt

### Production
```
Ruche Niveau 1: 1 abeille/3 secondes (si HP > 0)
Ruche Niveau 2: 1 abeille/seconde (si HP > 0)
```

## 🎯 Objectifs

### Victoire
✅ Détruire toutes les ruches ennemies

### Défaite
❌ Toutes vos ruches sont détruites

## 🤖 IA Ennemie

### Stratégies
- **30%** : Tentative de construction de ruche
- **70%** : Attaque avec 60% des abeilles disponibles
- **Priorités** : Arbres du joueur > Arbres neutres

### Comportement
- Construction automatique si ≥20 ou ≥30 abeilles
- Évite de construire si ruches endommagées
- Réparation automatique des ruches

## 🗺️ Carte

### Éléments
- **Fond** : Patchwork de carrés colorés (6 nuances de vert)
- **Étangs** : 1-3 étangs carrés (50×50px)
  - ⚠️ Traverser l'eau = risque de perdre des abeilles
- **Arbres** : Distribution aléatoire
  - 1-2 arbres joueur (gauche)
  - 1-2 arbres ennemis (droite)
  - 2-6 arbres neutres

## 🔔 Notifications

### Types de messages
- ℹ️ **Info** : "Construction : 15/20 abeilles"
- ✅ **Succès** : "Ruche niveau 2 créée !"
- ⚠️ **Avertissement** : "Pas assez d'abeilles ! 15/20"
- ❌ **Erreur** : "Maximum de ruches atteint (2)"

### Affichage
- Position : Bas de l'écran
- Durée : 2-6 secondes selon l'importance
- Style : Toast Sonner (design moderne)

## 📊 Statistiques techniques

### Performance
- **60 FPS** : Boucle de jeu (mouvement)
- **1 FPS** : Production d'abeilles
- **0.25 FPS** : IA ennemie (toutes les 4 secondes)

### Limites
- Pas de limite d'abeilles par joueur
- Maximum 2 ruches par arbre
- Zone de détection collision : 15px
- Zone de détection clic arbre : 70px

## 🔧 Architecture

### Fichiers clés
```
App.tsx           ← Logique principale (~1000 lignes)
types/game.ts     ← Interfaces TypeScript
components/
  ├── Tree.tsx    ← Affichage arbres + ruches
  ├── Bee.tsx     ← Affichage abeilles
  └── GameUI.tsx  ← Interface utilisateur
utils/
  └── mapGenerator.ts ← Génération carte
```

### États principaux
```typescript
GameState {
  trees: Tree[]
  bees: Bee[]
  selectedBeeIds: Set<string>
  gameTime: number
  isPlaying: boolean
  stars: number
}
```

## ✨ Nouveautés V1

### vs Version précédente
- ✅ Construction progressive (vs construction instantanée)
- ✅ Compteur visuel X/Y (vs pas d'indication)
- ✅ Sélection + clic = création (vs double-clic uniquement)
- ✅ Interface simplifiée (vs cartouche informatif)
- ✅ Badge nombre abeilles (vs pas d'indication)
- ✅ Fix bug orbite large (vs abeilles perdues)

### Améliorations UX
- Plus intuitif : voir progression construction
- Plus flexible : ajout abeilles par petits groupes
- Plus clair : indicateurs visuels partout
- Plus stable : bugs corrigés

---

**Version 1.0 Stable** - Prête pour développement de nouvelles fonctionnalités 🚀

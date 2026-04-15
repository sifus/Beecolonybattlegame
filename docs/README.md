# 🐝 Rush - Real-Time Strategy Game

> Conquérez la forêt avec vos abeilles ! Construisez des ruches, gérez vos ressources et détruisez les ruches ennemies dans ce jeu de stratégie en temps réel.

![Version](https://img.shields.io/badge/version-6.2-blue)
![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-4.0-38BDF8?logo=tailwindcss)

---

## ✨ Fonctionnalités

### 🎮 Modes de jeu
- **Quick Play** : Partie rapide contre l'IA sur carte générée aléatoirement
- **Story Mode** : Progression niveau par niveau avec 10 niveaux et tutoriels intégrés

### 🎨 Système visuel avancé
- 🌓 **Mode jour/nuit** avec adaptations visuelles complètes (lucioles en mode nuit)
- 🎨 **Style créatif** inspiré de la cire d'abeille avec texture hexagonale
- ✨ **Animations organiques** type gelée/miel partout
- 🌈 **Damier dynamique** avec bordure décorative et centrage parfait

### ⚔️ Mécaniques de gameplay
- ⚡ Sélection intuitive (clic simple + sélection circulaire)
- 🏗️ Construction et amélioration de ruches (L1 → L2)
- 🔧 Système de réparation des ruches endommagées
- ⚔️ Combat en vol — les abeilles se battent dès qu'elles se croisent, même en déplacement
- 🌊 Étangs mortels — danger pour les abeilles joueur ET ennemies
- 🤖 IA ennemie évolutive avec priorités tactiques

### 🎨 Système visuel
- 🌞 Rayon de soleil directionnel 45° traversant toute la carte, position aléatoire à chaque apparition
- ✨ Scintillements synchronisés avec le rayon (apparaissent et disparaissent avec lui)
- ☁️ Nuages flottants animés
- 🌿 Étangs organiques avec reflets
- 🌓 Mode jour / nuit avec lucioles la nuit

### 📱 Interface & Accessibilité
- 📱 **Responsive** : Desktop, tablette et mobile
- 🎯 **Touch-friendly** : Contrôles optimisés pour écrans tactiles
- 💾 **Sauvegarde automatique** de la progression (localStorage)
- 🔊 **Son ambiant** activable / désactivable
- 💤 **Mode veille** : musique maintenue même écran verrouillé
- ⏸️ **Pause automatique** quand l'app passe en arrière-plan

---

## 🚀 Installation

### Prérequis
- Node.js 18+ 
- npm ou yarn

### Étapes

```bash
# Cloner le repository
git clone https://github.com/VOTRE_USERNAME/rush-game.git

# Accéder au dossier
cd rush-game

# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev
```

Le jeu sera accessible sur `http://localhost:5173` (ou autre port Vite).

---

## 🎯 Comment jouer

### 🕹️ Contrôles

#### Desktop & Mobile
- **Clic sur arbre allié** → Sélectionne les abeilles de cet arbre
- **Maintenir + Glisser** → Sélection circulaire (plusieurs arbres)
- **Clic sur destination** → Envoie les abeilles sélectionnées
- **Double-clic sur arbre** → Construit/Répare/Améliore une ruche

### 🏁 Objectif
**Détruire toutes les ruches ennemies** (rouges) pour gagner !

### 🏗️ Construction

| Niveau | Coût | HP | Production |
|--------|------|----|-----------| 
| **Ruche L1** | 5 abeilles | 7 HP | 1 abeille / 3s |
| **Ruche L2** | 20 abeilles | 35 HP | 1 abeille / 1s |

#### Règles importantes
- ✅ Construire une ruche L1 : 5 abeilles sur arbre neutre
- ✅ Améliorer L1 → L2 : 20 abeilles sur ruche **intacte** (7/7 HP)
- ⚠️ Les ruches endommagées doivent être **réparées** avant amélioration

### ⚔️ Combat
- Les abeilles attaquent automatiquement les ruches ennemies
- Priorité : **Détruire d'abord**, puis réparer/améliorer
- Combat groupé : Toutes les abeilles arrivées en même temps combattent ensemble

### 🌊 Dangers
- **Étangs** : Les abeilles qui survolent ont une chance de tomber (splash visuel)
- Contournez les étangs pour éviter les pertes !

---

## 📦 Structure du projet

```
rush-game/
├── components/          # Composants React
│   ├── Bee.tsx         # Abeille/Luciole
│   ├── Tree.tsx        # Arbre avec ruches
│   ├── GameUI.tsx      # Interface de jeu
│   ├── MainMenu.tsx    # Menu principal
│   ├── LevelMap.tsx    # Carte des niveaux (mode histoire)
│   └── ...
├── utils/              # Utilitaires
│   ├── mapGenerator.ts         # Génération aléatoire de cartes
│   ├── storyLevelGenerator.ts  # Génération des niveaux histoire
│   ├── enemyAI.ts              # Intelligence artificielle
│   └── storage.ts              # Gestion localStorage
├── types/              # Types TypeScript
│   ├── game.ts         # Types du jeu
│   └── levels.ts       # Types des niveaux
├── styles/             # Styles globaux
│   └── globals.css     # Tailwind + tokens CSS
├── App.tsx             # Composant racine
└── ...
```

---

## 🧪 Tests

Pour tester le nouveau système de grille avec bordure décorative :

```bash
# Voir le guide de test complet
cat GUIDE_TEST_GRILLE.md
```

**Tests rapides :**
1. Desktop (≥1920px) : Menu → Quick Play
2. Mobile portrait (390×844) : Menu → Quick Play
3. Mobile paysage (844×390) : Tourner l'écran
4. Mode histoire : Menu → Play Story Mode → Niveau 1

**Marqueurs de debug (temporaires) :**
- 🔴 Bordure rouge = Zone décorative (pas d'objets)
- 🟢 Contour vert = Zone de jeu (arbres, étangs)

---

## 🛠️ Technologies

- **[React](https://react.dev/)** 18+ - Framework UI
- **[TypeScript](https://www.typescriptlang.org/)** 5+ - Typage statique
- **[Tailwind CSS](https://tailwindcss.com/)** 4.0 - Styles utilitaires
- **[Motion (Framer Motion)](https://motion.dev/)** - Animations fluides
- **[Vite](https://vitejs.dev/)** - Build tool rapide
- **[Lucide React](https://lucide.dev/)** - Icônes

---

## 📚 Documentation

- 📖 **[Guide de test de la grille](./GUIDE_TEST_GRILLE.md)** - Tests du système de grille
- 🧪 **[Test système bordure](./TEST_GRILLE_BORDURE.md)** - Documentation technique complète
- 🐙 **[Guide GitHub](./GUIDE_GITHUB.md)** - Publier et déployer le projet
- 📋 **[Règles du jeu](./REGLES_DU_JEU.md)** - Règles détaillées
- 🔄 **[Changelogs](./INDEX_DOCUMENTATION.md)** - Historique des versions

---

## 🎮 Captures d'écran

### Desktop - Mode jour
![Screenshot Desktop](https://via.placeholder.com/800x450/d4d448/000000?text=Desktop+%E2%80%93+Mode+jour)

### Mobile - Mode nuit avec lucioles
![Screenshot Mobile](https://via.placeholder.com/390x844/2a3d1a/ffffff?text=Mobile+%E2%80%93+Mode+nuit)

### Mode histoire - Niveau 1
![Screenshot Story](https://via.placeholder.com/800x450/f4e6a3/000000?text=Mode+histoire)

---

## 🗺️ Roadmap

### ✅ Implémenté (Version 6.2)
- [x] Mode histoire avec niveaux progressifs
- [x] Mode Partie Rapide
- [x] Système jour/nuit complet (lucioles la nuit)
- [x] Grille optimisée avec bordure décorative
- [x] Sauvegarde de progression
- [x] Son ambiant + mode veille + pause arrière-plan
- [x] Rayon de soleil directionnel animé avec scintillements
- [x] Combat en vol entre abeilles
- [x] Arbres en zone jouable uniquement, espacement garanti
- [x] Responsive complet

### 🔜 À venir
- [ ] Niveaux 2-10 du mode histoire
- [ ] Système de succès/achievements
- [ ] Multijoueur local
- [ ] Sons d'effets (construction, combat, etc.)
- [ ] Mode difficile avancé (bûcherons, tempêtes)
- [ ] Traductions (EN/FR)

---

## 🤝 Contribution

Les contributions sont les bienvenues !

1. **Fork** le projet
2. Créer une **branche** (`git checkout -b feature/AmazingFeature`)
3. **Commit** vos changements (`git commit -m 'Add some AmazingFeature'`)
4. **Push** vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une **Pull Request**

---

## 📄 Licence

Ce projet est sous licence **MIT** - voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 👤 Auteur

**Votre Nom**
- GitHub: [@votre-username](https://github.com/votre-username)
- Twitter: [@votre-twitter](https://twitter.com/votre-twitter)

---

## 🙏 Remerciements

- Inspiration : Age of Empires, Starcraft
- Icônes : [Lucide](https://lucide.dev/)
- Sons : [Mixkit](https://mixkit.co/)
- Polices : Google Fonts

---

## 📊 Stats

![GitHub stars](https://img.shields.io/github/stars/votre-username/rush-game?style=social)
![GitHub forks](https://img.shields.io/github/forks/votre-username/rush-game?style=social)
![GitHub issues](https://img.shields.io/github/issues/votre-username/rush-game)

---

⭐ **Si vous aimez ce projet, n'oubliez pas de lui donner une étoile !** ⭐

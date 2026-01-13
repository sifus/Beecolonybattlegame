# 📦 Publier Rush sur GitHub

## Prérequis

- Compte GitHub créé
- Git installé sur votre machine
- Le projet Rush complet sur votre ordinateur

## 🚀 Étapes de publication

### 1. Créer un nouveau repository sur GitHub

1. Aller sur [github.com](https://github.com)
2. Cliquer sur le bouton **"+"** en haut à droite → **"New repository"**
3. Remplir :
   - **Repository name** : `rush-game` (ou autre nom)
   - **Description** : `Jeu de stratégie en temps réel avec des abeilles - Real-time strategy game with bees`
   - **Public** ou **Private** selon votre choix
   - ⚠️ **NE PAS** cocher "Initialize with README" (car vous avez déjà des fichiers)
4. Cliquer sur **"Create repository"**

### 2. Initialiser Git dans votre projet

Ouvrir un terminal dans le dossier de votre projet et exécuter :

```bash
# Initialiser le repository Git
git init

# Ajouter tous les fichiers
git add .

# Créer le premier commit
git commit -m "Initial commit - Rush game with grid border system"
```

### 3. Connecter au repository GitHub

GitHub vous donnera des commandes, utilisez celles-ci :

```bash
# Lier votre projet local au repository GitHub
git remote add origin https://github.com/VOTRE_USERNAME/rush-game.git

# Pousser le code sur GitHub (branche main)
git branch -M main
git push -u origin main
```

Remplacez `VOTRE_USERNAME` par votre nom d'utilisateur GitHub et `rush-game` par le nom de votre repository.

### 4. Vérifier sur GitHub

1. Rafraîchir la page de votre repository sur GitHub
2. Vous devriez voir tous vos fichiers !

## 📝 Fichiers importants à inclure

Assurez-vous que ces fichiers sont dans votre projet avant de publier :

✅ **Code source**
- `/App.tsx`
- `/components/` (tous les composants)
- `/utils/` (tous les utilitaires)
- `/types/` (types TypeScript)

✅ **Configuration**
- `package.json`
- `tsconfig.json`
- `vite.config.ts` (ou autre config)
- `.gitignore` (pour exclure node_modules, etc.)

✅ **Documentation**
- `README.md` (description du projet)
- `/GUIDE_TEST_GRILLE.md`
- `/TEST_GRILLE_BORDURE.md`
- Autres fichiers CHANGELOG et guides

## 🚫 Fichiers à exclure

Créer un fichier `.gitignore` à la racine avec :

```gitignore
# Dependencies
node_modules/
package-lock.json
yarn.lock
pnpm-lock.yaml

# Build outputs
dist/
build/
.output/

# Environment variables
.env
.env.local
.env.production

# IDE
.vscode/
.idea/
*.swp
*.swo
.DS_Store

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Testing
coverage/
.nyc_output/
```

## 📚 Créer un README.md professionnel

Exemple de structure :

````markdown
# 🐝 Rush - Real-Time Strategy Game

Un jeu de stratégie en temps réel où vous contrôlez des abeilles pour conquérir une forêt en construisant des ruches et en combattant des abeilles ennemies.

## 🎮 Fonctionnalités

- ⚡ Système de sélection intuitive (clic + cercle)
- 🏗️ Construction et amélioration de ruches
- ⚔️ Combat avec système de priorité
- 🌓 Mode jour/nuit avec adaptations visuelles
- 📖 Mode histoire avec 10 niveaux progressifs
- 💾 Sauvegarde automatique de la progression
- 📱 Interface responsive (desktop & mobile)
- ♿ Conforme aux standards WCAG d'accessibilité

## 🚀 Installation

```bash
# Cloner le repository
git clone https://github.com/VOTRE_USERNAME/rush-game.git

# Installer les dépendances
cd rush-game
npm install

# Lancer en mode développement
npm run dev
```

## 🎯 Comment jouer

1. **Quick Play** : Partie rapide contre l'IA
2. **Story Mode** : Progression niveau par niveau avec tutoriels

### Contrôles
- **Clic** sur un arbre : Sélectionner vos abeilles
- **Clic** sur un autre arbre : Envoyer les abeilles
- **Maintenir + Glisser** : Sélection circulaire

## 🛠️ Technologies

- **React** + TypeScript
- **Tailwind CSS** v4
- **Motion (Framer Motion)**
- **Vite**

## 📦 Structure du projet

```
/
├── components/       # Composants React
├── utils/           # Utilitaires (IA, génération de cartes)
├── types/           # Types TypeScript
├── styles/          # Styles globaux
└── App.tsx          # Composant principal
```

## 🧪 Tests

Voir [GUIDE_TEST_GRILLE.md](./GUIDE_TEST_GRILLE.md) pour tester le système de grille.

## 📄 Licence

MIT License - Libre d'utilisation

## 👤 Auteur

Votre nom - [@votre_twitter](https://twitter.com/votre_twitter)

---

⭐ Si vous aimez ce projet, n'hésitez pas à lui donner une étoile !
````

## 🔄 Mises à jour futures

Après modifications, pour mettre à jour GitHub :

```bash
# Ajouter les nouveaux fichiers modifiés
git add .

# Créer un commit avec un message descriptif
git commit -m "Description de vos modifications"

# Pousser sur GitHub
git push
```

## 🌐 Déployer en ligne (Bonus)

Pour rendre votre jeu accessible en ligne :

### Option 1 : GitHub Pages
```bash
# Installer gh-pages
npm install --save-dev gh-pages

# Dans package.json, ajouter :
# "homepage": "https://VOTRE_USERNAME.github.io/rush-game",
# "scripts": {
#   "predeploy": "npm run build",
#   "deploy": "gh-pages -d dist"
# }

# Déployer
npm run deploy
```

### Option 2 : Vercel (Recommandé)
1. Créer un compte sur [vercel.com](https://vercel.com)
2. Importer votre repository GitHub
3. Vercel détecte automatiquement Vite et déploie !

### Option 3 : Netlify
1. Créer un compte sur [netlify.com](https://netlify.com)
2. Glisser-déposer le dossier `dist/` (après `npm run build`)
3. Votre jeu est en ligne !

## 📧 Support

Si vous rencontrez des problèmes :
- Ouvrir une **Issue** sur GitHub
- Consulter la documentation dans `/guidelines/`
- Vérifier les fichiers CHANGELOG pour l'historique des modifications

---

**Bonne publication ! 🚀**

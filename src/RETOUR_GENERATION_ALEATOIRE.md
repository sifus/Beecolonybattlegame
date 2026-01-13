# 🔄 Retour à la Génération Aléatoire

## 📅 Date : 25 Octobre 2025

## 📋 Résumé

Le système de **niveaux fixes** (Niveau 1 - Facile) a été **supprimé** et remplacé par le système de **génération aléatoire** d'origine.

---

## ✨ Modifications Effectuées

### 1️⃣ **App.tsx** - Génération de Carte

#### Avant (Niveau 1 fixe)
```tsx
const [currentLevel, setCurrentLevel] = useState(1);
const [mapData, setMapData] = useState(() => generateLevel(1, CELL_SIZE));

const handleStartGame = (level: number) => {
  setCurrentLevel(level);
  const levelData = generateLevel(level, CELL_SIZE);
  setMapData(levelData);
  toast.success(levelData.description);
};

const handleRestart = () => {
  handleStartGame(currentLevel); // Même niveau
};
```

#### Après (Génération aléatoire)
```tsx
const [mapData, setMapData] = useState(() => generateRandomMap(GRID_COLS, GRID_ROWS, CELL_SIZE));

const handleStartGame = () => {
  const randomMap = generateRandomMap(GRID_COLS, GRID_ROWS, CELL_SIZE);
  setMapData(randomMap);
  toast.success('🎮 Nouvelle partie - Carte aléatoire générée !');
};

const handleRestart = () => {
  handleStartGame(); // Nouvelle carte aléatoire
};
```

**Changements** :
- ✅ Variable `currentLevel` supprimée
- ✅ `generateLevel()` remplacé par `generateRandomMap()`
- ✅ Chaque partie génère une **nouvelle carte aléatoire**
- ✅ Le bouton "Recommencer" génère aussi une nouvelle carte

---

### 2️⃣ **MainMenu.tsx** - Bouton Jouer

#### Avant
```tsx
interface MainMenuProps {
  onStartGame: (level: number) => void; // Prend un paramètre level
}

<button onClick={() => onStartGame(1)}>
  <div>Jouer</div>
  <div>Niveau 1 - Facile</div>
  <div>Nouveau !</div> {/* Badge */}
</button>
```

#### Après
```tsx
interface MainMenuProps {
  onStartGame: () => void; // Pas de paramètre
}

<button onClick={onStartGame}>
  <div>Jouer</div>
  <div>Carte aléatoire</div>
  {/* Pas de badge "Nouveau !" */}
</button>
```

**Changements** :
- ✅ Signature de `onStartGame` simplifiée (pas de paramètre)
- ✅ Texte changé : "Niveau 1 - Facile" → "Carte aléatoire"
- ✅ Badge "Nouveau !" retiré
- ✅ Interface plus simple et directe

---

## 🗺️ Génération de Carte Aléatoire

### Paramètres
```tsx
GRID_COLS = 13
GRID_ROWS = 8
CELL_SIZE = 100
```

### Caractéristiques de `generateRandomMap()`
- **Arbres** : 5-10 arbres aléatoires
- **Étangs** : 0-3 étangs de tailles variables (1x1 à 2x2 carrés)
- **Arbres de départ** : 2 arbres (1 joueur, 1 ennemi) avec ruche L1
- **Arbres neutres** : Reste des arbres sans ruche
- **Espacement** : Minimum 150px entre arbres
- **Positionnement** : Évite les bords (100px de marge)
- **Étangs évitent arbres** : Pas d'arbres dans les étangs

### Départ Équitable
- **Joueur** : 1 ruche niveau 1 (7 HP), 0 abeilles
- **Ennemi** : 1 ruche niveau 1 (7 HP), 0 abeilles

---

## 🎮 Impact Utilisateur

### Avant (Niveau 1)
```
Menu → [Jouer] → Niveau 1 (carte fixe)
       ↓
Rejouer → Même niveau 1 (carte identique)
```

**Problème** :
- Carte toujours identique (4 arbres, symétrique)
- Peu de variété
- Ennuyeux après plusieurs parties

### Après (Génération Aléatoire)
```
Menu → [Jouer] → Carte aléatoire générée
       ↓
Rejouer → Nouvelle carte aléatoire
```

**Avantages** :
- ✅ **Variété infinie** : Chaque partie est unique
- ✅ **Rejouabilité** : Nouvelles stratégies à chaque fois
- ✅ **Difficulté variable** : Cartes plus ou moins difficiles
- ✅ **Moins prévisible** : Emplacement des étangs change

---

## 📊 Comparaison

| Aspect | Niveau 1 Fixe | Génération Aléatoire |
|--------|---------------|----------------------|
| **Variété** | ❌ Carte identique | ✅ Carte unique à chaque fois |
| **Rejouabilité** | ❌ Faible | ✅ Infinie |
| **Difficulté** | ✅ Constante (facile) | ⚠️ Variable |
| **Apprentissage** | ✅ Bon pour débutants | ⚠️ Peut être déroutant |
| **Stratégie** | ❌ Mémorisable | ✅ Adaptation requise |
| **Nombre d'arbres** | 4 (fixe) | 5-10 (variable) |
| **Étangs** | 0 (aucun) | 0-3 (variable) |
| **Équilibre** | ✅ Parfait (symétrique) | ⚠️ Peut être déséquilibré |

---

## 🎯 Raisons du Changement

### Pourquoi Revenir à l'Aléatoire ?

1. **Variété** : Le Niveau 1 fixe devient répétitif rapidement
2. **Rejouabilité** : Génération aléatoire offre une rejouabilité infinie
3. **Simplicité** : Moins de code, pas besoin de `levelGenerator.ts`
4. **Expérience originale** : Retour à la vision initiale du jeu

### Inconvénients du Niveau Fixe

- ❌ Une seule carte (4 arbres, symétrique, pas d'étangs)
- ❌ Devient ennuyeux après 2-3 parties
- ❌ Pas de surprise
- ❌ Stratégie optimale facilement trouvée

### Avantages de l'Aléatoire

- ✅ Chaque partie est une nouvelle aventure
- ✅ Nécessite adaptation constante
- ✅ Plus challengeant
- ✅ Plus de rejouabilité

---

## 🔮 Future : Système de Niveaux Hybride ?

### Idée pour Plus Tard

**Garder le meilleur des deux mondes** :

```
Menu Principal
├── Mode Campagne (niveaux fixes)
│   ├── Niveau 1 - Facile
│   ├── Niveau 2 - Moyen
│   └── Niveau 3 - Difficile
│
└── Mode Aléatoire (génération aléatoire)
    ├── Facile (5-6 arbres, peu d'étangs)
    ├── Moyen (7-8 arbres, étangs moyens)
    └── Difficile (9-10 arbres, beaucoup d'étangs)
```

**Avantages** :
- ✅ **Campagne** pour apprendre et progresser
- ✅ **Aléatoire** pour rejouabilité infinie
- ✅ **Choix** pour le joueur

**Implémentation** : Futur (v4+)

---

## 🧪 Tests Recommandés

### Test de Génération
- [ ] Cliquer sur "Jouer" depuis le menu
- [ ] Vérifier qu'une carte aléatoire est générée (arbres différents)
- [ ] Cliquer sur "Recommencer" en jeu
- [ ] Vérifier qu'une **nouvelle** carte aléatoire est générée
- [ ] Répéter 5 fois pour voir la variété

### Test de Toast
- [ ] Au démarrage : Toast "🎮 Nouvelle partie - Carte aléatoire générée !"
- [ ] Toast affiché en haut centre
- [ ] Toast disparaît après 3 secondes

### Test de Bouton Menu
- [ ] Texte du bouton : "Jouer" + "Carte aléatoire"
- [ ] Pas de badge "Nouveau !"
- [ ] Effet hover fonctionne
- [ ] Clic démarre la partie

---

## 📁 Fichiers Modifiés

### Modifiés : 2
1. `/App.tsx`
   - Suppression variable `currentLevel`
   - `generateLevel()` → `generateRandomMap()`
   - `handleStartGame()` simplifié
   - Toast mis à jour

2. `/components/MainMenu.tsx`
   - Signature `onStartGame` simplifiée
   - Texte bouton changé
   - Badge "Nouveau !" retiré

### Non Modifié (mais inutilisé) : 1
- `/utils/levelGenerator.ts` - Peut être supprimé ou gardé pour futur usage

---

## 🎯 Résumé Exécutif

Le jeu est revenu à son système de **génération aléatoire** d'origine :
- ✅ Chaque partie génère une **nouvelle carte unique**
- ✅ Rejouabilité **infinie**
- ✅ Variété **maximale**
- ✅ Interface simplifiée

Le bouton "Recommencer" génère maintenant une **nouvelle carte** au lieu de rejouer la même.

**Statut** : ✅ Implémenté et fonctionnel

**Prochaine étape** : Tester la variété des cartes générées

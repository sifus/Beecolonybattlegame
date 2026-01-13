# 🎮 Interface des Boutons - Guide Visuel

## 📍 Position et Apparence

### Barre d'Outils (Haut Gauche)

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  [⏸️]  [🔄]  [🏠]  [🪓]  [ℹ️]                                      │
│  Bleu  Vert  Jaune Orange Violet                                    │
│                                                                     │
│                                                                     │
│                    🌳      🌳      🌳                               │
│                                                                     │
│                  🐝🐝🐝  🐝🐝🐝  🐝🐝🐝                           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Détails de Chaque Bouton

### 1️⃣ Pause / Play (⏸️ / ▶️)
- **Couleur** : Bleu (`bg-blue-500`)
- **Hover** : Bleu foncé (`bg-blue-600`)
- **Icône** : Pause (⏸️) quand en jeu, Play (▶️) quand en pause
- **Action** : Pause/reprendre le jeu
- **Tooltip** : "Pause" ou "Reprendre"
- **Raccourci clavier** : Aucun (futur : Espace)

**Code** :
```tsx
<button
  onClick={onPause}
  className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition shadow-lg"
  title={isPlaying ? 'Pause' : 'Reprendre'}
>
  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
</button>
```

---

### 2️⃣ Recommencer (🔄)
- **Couleur** : Vert (`bg-green-500`)
- **Hover** : Vert foncé (`bg-green-600`)
- **Icône** : Flèche circulaire (RotateCcw)
- **Action** : Redémarre le niveau actuel (nouvelle carte)
- **Tooltip** : "Recommencer"
- **Raccourci clavier** : Aucun (futur : R)

**Code** :
```tsx
<button
  onClick={onRestart}
  className="p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition shadow-lg"
  title="Recommencer"
>
  <RotateCcw className="w-6 h-6" />
</button>
```

---

### 3️⃣ Accueil (🏠) ⭐ NOUVEAU
- **Couleur** : Jaune (`bg-yellow-500`)
- **Hover** : Jaune foncé (`bg-yellow-600`)
- **Icône** : Maison (Home)
- **Action** : Retour au menu principal
- **Tooltip** : "Retour au menu"
- **Raccourci clavier** : Aucun (futur : Échap)

**Code** :
```tsx
{onHome && (
  <button
    onClick={onHome}
    className="p-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition shadow-lg"
    title="Retour au menu"
  >
    <Home className="w-6 h-6" />
  </button>
)}
```

---

### 4️⃣ Bûcherons (🪓) [Optionnel]
- **Couleur** : Orange (`bg-orange-500`) si activé, Gris (`bg-gray-400`) si désactivé
- **Hover** : Orange foncé (`bg-orange-600`) ou Gris foncé (`bg-gray-500`)
- **Icône** : Hache (Axe)
- **Action** : Active/désactive le gameplay des bûcherons
- **Tooltip** : "Désactiver les bûcherons" ou "Activer les bûcherons"
- **Raccourci clavier** : Aucun

**Code** :
```tsx
{onToggleLumberjack && (
  <button
    onClick={onToggleLumberjack}
    className={`p-3 rounded-lg transition shadow-lg ${
      lumberjackGameplayEnabled 
        ? 'bg-orange-500 text-white hover:bg-orange-600' 
        : 'bg-gray-400 text-white hover:bg-gray-500'
    }`}
    title={lumberjackGameplayEnabled ? 'Désactiver les bûcherons' : 'Activer les bûcherons'}
  >
    <Axe className="w-6 h-6" />
  </button>
)}
```

**Note** : Ce bouton n'apparaît que si la prop `onToggleLumberjack` est fournie.

---

### 5️⃣ Info / Tutoriel (ℹ️)
- **Couleur** : Violet (`bg-purple-500`)
- **Hover** : Violet foncé (`bg-purple-600`)
- **Icône** : Point d'interrogation dans un cercle (Info)
- **Action** : Affiche/masque le panneau tutoriel
- **Tooltip** : "Afficher/Masquer les contrôles"
- **Raccourci clavier** : Aucun (futur : F1 ou ?)

**Code** :
```tsx
<button
  onClick={() => setShowTutorial(!showTutorial)}
  className="p-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition shadow-lg"
  title="Afficher/Masquer les contrôles"
>
  <Info className="w-6 h-6" />
</button>
```

---

## 🎨 Palette de Couleurs

| Bouton | Normal | Hover | Hex Normal | Hex Hover |
|--------|--------|-------|------------|-----------|
| ⏸️ Pause | Bleu | Bleu foncé | `#3B82F6` | `#2563EB` |
| 🔄 Recommencer | Vert | Vert foncé | `#10B981` | `#059669` |
| 🏠 Accueil | Jaune | Jaune foncé | `#EAB308` | `#CA8A04` |
| 🪓 Bûcherons ON | Orange | Orange foncé | `#F97316` | `#EA580C` |
| 🪓 Bûcherons OFF | Gris | Gris foncé | `#9CA3AF` | `#6B7280` |
| ℹ️ Info | Violet | Violet foncé | `#A855F7` | `#9333EA` |

---

## 📐 Spécifications Techniques

### Dimensions
- **Padding** : `p-3` = 12px sur tous les côtés
- **Icône** : `w-6 h-6` = 24x24 pixels
- **Espacement** : `gap-2` = 8px entre chaque bouton
- **Coins arrondis** : `rounded-lg` = 8px border-radius
- **Ombre** : `shadow-lg` = Ombre portée grande

### Comportement
- **Transition** : `transition` = Animation fluide (150ms par défaut)
- **Hover** : Changement de couleur + légère élévation (ombre)
- **Active** : Léger enfoncement visuel
- **Disabled** : Aucun (tous les boutons sont toujours actifs)

### Responsive
- **Desktop** : Taille normale (p-3, icônes 24x24)
- **Mobile** : À adapter (futur : icônes 20x20, p-2)
- **Tablette** : Taille normale

---

## 🔄 États Dynamiques

### Bouton Pause/Play
```tsx
État : En jeu (isPlaying = true)
  ↓
Affiche : ⏸️ Pause
Clic : Met le jeu en pause
  ↓
État : En pause (isPlaying = false)
  ↓
Affiche : ▶️ Play
Clic : Reprend le jeu
```

### Bouton Bûcherons
```tsx
État : Désactivé (lumberjackGameplayEnabled = false)
  ↓
Affiche : Gris (bg-gray-400)
Clic : Active les bûcherons
  ↓
État : Activé (lumberjackGameplayEnabled = true)
  ↓
Affiche : Orange (bg-orange-500)
Clic : Désactive les bûcherons
```

### Bouton Info
```tsx
État : Fermé (showTutorial = false)
  ↓
Affiche : Violet (ℹ️)
Clic : Ouvre le panneau
  ↓
État : Ouvert (showTutorial = true)
  ↓
Affiche : Violet (ℹ️) + Panneau visible
Clic : Ferme le panneau
```

---

## 🎯 Logique de Visibilité

```tsx
// Boutons TOUJOURS visibles
✅ Pause/Play
✅ Recommencer
✅ Info

// Boutons CONDITIONNELS
❓ Accueil     → Si onHome est fourni (dans le jeu)
❓ Bûcherons   → Si onToggleLumberjack est fourni
```

**Configuration actuelle** :
- Menu principal : Aucun bouton (pas de GameUI)
- Options : Aucun bouton (pas de GameUI)
- En jeu : Tous les boutons visibles (5 au total)

---

## 📱 Ordre de Priorité (De gauche à droite)

1. **⏸️ Pause** - Le plus important (contrôle de base)
2. **🔄 Recommencer** - Important (recommence le niveau)
3. **🏠 Accueil** - Nouveau (navigation)
4. **🪓 Bûcherons** - Optionnel (feature avancée)
5. **ℹ️ Info** - Aide (dernier recours)

**Raison** : L'ordre suit une logique de **fréquence d'utilisation** :
- Pause : Utilisé souvent (plusieurs fois par partie)
- Recommencer : Utilisé occasionnellement (après défaite)
- Accueil : Utilisé rarement (changement de niveau)
- Bûcherons : Utilisé très rarement (test/défi)
- Info : Utilisé une fois (début de jeu pour apprendre)

---

## 🎨 Cohérence Visuelle

### Règle des Couleurs
Chaque bouton a une **couleur unique** qui correspond à sa **fonction** :

- 🔵 **Bleu** = Contrôle (Pause/Play) → Neutre, technique
- 🟢 **Vert** = Reset (Recommencer) → Rafraîchir, nouveau départ
- 🟡 **Jaune** = Navigation (Accueil) → Lumière, chemin à suivre
- 🟠 **Orange** = Danger/Défi (Bûcherons) → Attention, mode difficile
- 🟣 **Violet** = Information (Info) → Aide, apprentissage

### Éviter les Confusions
- ❌ **Rouge** : Évité (trop agressif, pas de bouton "Quitter")
- ❌ **Bleu clair** : Évité (collision avec le ciel du background)
- ✅ **Palette harmonieuse** : Couleurs complémentaires et distinctes

---

## 🧪 Tests Visuels

### Checklist de Validation
- [ ] Les 5 boutons sont alignés horizontalement
- [ ] Espacement de 8px entre chaque bouton
- [ ] Tous les boutons ont la même hauteur (48px)
- [ ] Icônes centrées verticalement et horizontalement
- [ ] Ombre visible sur tous les boutons
- [ ] Effet hover fonctionne (changement de couleur)
- [ ] Tooltip s'affiche au survol
- [ ] Transition fluide (pas de saccades)

### Test de Contraste
- [ ] Texte blanc sur fond coloré est lisible
- [ ] Icônes blanches sur fond coloré sont claires
- [ ] Ombre ne crée pas de confusion visuelle
- [ ] Coins arrondis sont uniformes

### Test de Responsive (Futur)
- [ ] Boutons restent visibles sur petits écrans
- [ ] Pas de débordement horizontal
- [ ] Ordre des boutons préservé
- [ ] Espacement adapté à la taille d'écran

---

## 💡 Améliorations Futures

### Court Terme
- [ ] Raccourcis clavier pour chaque bouton
- [ ] Animation subtile au clic (shake, pulse)
- [ ] Badge de notification sur Info (première visite)

### Moyen Terme
- [ ] Bouton "Paramètres" supplémentaire (volume, difficulté)
- [ ] Bouton "Replay" pour rejouer la dernière partie
- [ ] Bouton "Screenshot" pour capturer le jeu

### Long Terme
- [ ] Personnalisation des couleurs
- [ ] Position configurable (haut/bas, gauche/droite)
- [ ] Thèmes (clair/sombre)
- [ ] Boutons contextuels (apparaissent selon le contexte)

---

## 🎯 Résumé Visuel

```
┌────────────────────────────────────────────────┐
│  Interface de Jeu - Boutons d'Action          │
├────────────────────────────────────────────────┤
│                                                │
│  Position : Haut gauche                        │
│  Nombre : 5 boutons (3 permanents + 2 option.) │
│  Style : Carré arrondi (48x48px)              │
│  Espacement : 8px                              │
│  Ombre : Grande (shadow-lg)                    │
│                                                │
│  [⏸️ Bleu] [🔄 Vert] [🏠 Jaune] [🪓 Orange] [ℹ️ Violet]  │
│                                                │
└────────────────────────────────────────────────┘
```

**Boutons toujours visibles** : ⏸️ 🔄 ℹ️  
**Nouveau bouton** : 🏠 (Accueil, jaune)  
**Bouton optionnel** : 🪓 (Bûcherons)

L'interface est maintenant **complète, cohérente et intuitive** ! 🎨✨

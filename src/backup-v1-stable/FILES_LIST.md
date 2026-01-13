# Liste des fichiers - V1 Stable

## Fichiers sauvegardés dans ce dossier

### ✅ Fichiers copiés
- `game.ts` - Types TypeScript (copie de `/types/game.ts`)
- `GameUI.tsx` - Composant UI (copie de `/components/GameUI.tsx`)
- `Bee.tsx` - Composant abeille (copie de `/components/Bee.tsx`)

### 📝 Documentation
- `README.md` - Vue d'ensemble de la V1 stable
- `restore.md` - Instructions de restauration
- `CHANGELOG.md` - Journal des modifications
- `FILES_LIST.md` - Ce fichier

## Fichiers à conserver à la racine (non copiés)

Ces fichiers sont trop volumineux ou ne nécessitent pas de backup :

### Fichiers principaux
- `/App.tsx` - **IMPORTANT** : Fichier principal du jeu (≈1000 lignes)
- `/components/Tree.tsx` - Composant arbre avec affichage des ruches
- `/utils/mapGenerator.ts` - Générateur de carte aléatoire
- `/styles/globals.css` - Styles CSS globaux

### Composants UI (Shadcn)
Tous les fichiers dans `/components/ui/` :
- accordion.tsx, alert-dialog.tsx, alert.tsx, etc.
- sonner.tsx (pour les notifications toast)
- **À conserver** : Ne pas modifier ces fichiers

### Autres
- `/components/figma/ImageWithFallback.tsx` - Composant protégé
- `/guidelines/Guidelines.md` - Documentation
- `/Attributions.md` - Crédits

## État des fichiers clés

### `/types/game.ts`
```typescript
export interface Tree {
  // ... propriétés de base
  buildingProgress?: number[]; // ⭐ NOUVEAU - Construction progressive
}

export interface Bee {
  // ... propriétés de base
  hoverCenterX?: number; // ⭐ NOUVEAU - Fix orbite
  hoverCenterY?: number; // ⭐ NOUVEAU - Fix orbite
}
```

### `/components/GameUI.tsx`
Interface simplifiée avec uniquement 2 boutons :
- Pause/Play (bleu)
- Recommencer (vert)

### `/components/Bee.tsx`
Affichage de l'abeille avec :
- Indicateur de sélection orange vif pulsant
- Animation de spawn
- Ailes transparentes

## Comment utiliser ce backup

### En cas de problème
1. Vérifier quel fichier pose problème
2. Comparer avec la version dans ce dossier backup
3. Restaurer la version stable si nécessaire

### Pour développement futur
1. Créer une branche/version "V2-dev"
2. Conserver ce dossier comme référence V1
3. En cas de régression majeure, revenir à V1

## Notes importantes

⚠️ **App.tsx** n'est pas copié car trop volumineux (≈1000 lignes)
- Utiliser le système de versioning Git si disponible
- Ou copier manuellement en cas de besoin

✅ **Points de restauration critiques** :
- Types : `buildingProgress`, `hoverCenterX/Y`
- Fonction : `createOrRepairHive()`
- Interface : Boutons simplifiés
- Affichage : Compteur de construction dans Tree.tsx

## Checksum de fonctionnalités

Pour vérifier que la V1 est bien restaurée :

- [ ] Construction progressive fonctionne (compteur X/20 ou X/30)
- [ ] Sélection + clic sur arbre = création de ruche
- [ ] Interface avec seulement 2 boutons (Pause + Recommencer)
- [ ] Pas de bug d'orbite très large
- [ ] Badge bleu montrant le nombre d'abeilles par arbre
- [ ] Notifications toast fonctionnelles
- [ ] Double-clic pour créer une ruche

Si tous ces points sont validés ✅, la V1 est correctement restaurée.

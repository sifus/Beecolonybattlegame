# Instructions de restauration - V1 Stable

## Pour restaurer cette version

Les fichiers de cette version stable sont sauvegardés dans ce dossier.

### Fichiers à restaurer manuellement si nécessaire :

1. **Fichiers principaux du jeu**
   - `/App.tsx` - Logique principale (voir le fichier actuel à la racine)
   - `/types/game.ts` - Types TypeScript (copie ci-dessous)
   - `/utils/mapGenerator.ts` - Générateur de carte (fichier actuel)

2. **Composants**
   - `/components/Tree.tsx` - Affichage des arbres
   - `/components/Bee.tsx` - Affichage des abeilles  
   - `/components/GameUI.tsx` - Interface utilisateur

3. **Styles**
   - `/styles/globals.css` - Styles CSS globaux

### Métadonnées de la V1

**Fonctionnalités clés:**
- Construction progressive avec compteur (X/20 ou X/30)
- Sélection par cercle et par clic
- Double-clic pour créer ruche
- Envoi d'abeilles vers leur propre arbre = création de ruche
- Interface épurée (Pause + Recommencer uniquement)
- Affichage du nombre d'abeilles du joueur par arbre (badge bleu)

**Bugs corrigés:**
- Orbite très large des abeilles (hoverCenterX/Y)
- Création de ruche par sélection d'abeilles

**Note:** Pour une restauration complète, conservez également tous les fichiers de `/components/ui/` (Shadcn).

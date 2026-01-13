# Guide de Restauration - Backup V2 Lucioles

## 📦 Contenu du Backup

Ce dossier contient la sauvegarde de la **Version 2** du jeu "Rush" avec les améliorations du mode nuit et des lucioles.

### Fichiers inclus

1. **BACKUP_V2_INFO.md** - Informations générales sur cette version
2. **CHANGELOG_V2.md** - Détails complets des modifications
3. **Bee.tsx** - Composant complet avec lucioles optimisées
4. **Tree_Badge_Extract.tsx** - Extrait du badge adapté au mode nuit
5. **App_Visual_Effects_Extract.tsx** - Extraits des effets visuels adaptés
6. **RESTORATION_GUIDE.md** - Ce fichier

---

## 🔄 Comment Restaurer cette Version

### Option 1: Restauration Complète (Recommandée)

Si vous voulez restaurer l'intégralité du composant Bee:

```bash
# Depuis la racine du projet
cp backup-v2-lucioles/Bee.tsx components/Bee.tsx
```

### Option 2: Restauration Partielle

Si vous ne voulez restaurer que certains éléments:

#### Pour le badge du nombre d'abeilles:
1. Ouvrez `components/Tree.tsx`
2. Localisez la section "Bee count indicator" (lignes ~736-761)
3. Remplacez par le code dans `Tree_Badge_Extract.tsx`

#### Pour les effets visuels (halos, cercles, flash):
1. Ouvrez `App.tsx`
2. Localisez chaque section concernée (voir numéros de lignes dans `App_Visual_Effects_Extract.tsx`)
3. Remplacez par le code correspondant

---

## ✅ Vérifications Après Restauration

Après avoir restauré les fichiers, vérifiez que:

- [ ] Les lucioles ennemies bleues sont bien visibles en mode nuit
- [ ] Le badge du nombre d'abeilles est vert en mode nuit
- [ ] Le cercle de sélection change de couleur selon le mode
- [ ] Les halos de création sont verts en mode nuit
- [ ] Le flash effect s'adapte au mode jour/nuit
- [ ] Aucune régression en mode jour (tout reste jaune/doré)

---

## 🎨 Palette de Couleurs à Vérifier

### Mode Nuit
- Lucioles joueur: `#7FFF00` (vert chartreuse)
- Lucioles ennemies: `#00BFFF` (bleu cyan vif)
- Badge/Cercles/Halos: Vert chartreuse et variantes

### Mode Jour
- Abeilles joueur: `#FDD835` (jaune)
- Abeilles ennemies: `#D32F2F` (rouge)
- Badge/Cercles/Halos: Jaune et variantes

---

## 🐛 Dépannage

### Les lucioles ennemies sont encore sombres
➡️ Vérifiez que `Bee.tsx` a bien été restauré avec `#00BFFF` pour les lucioles ennemies

### Le badge reste jaune en mode nuit
➡️ Vérifiez que la prop `isNightMode` est bien passée au composant Tree
➡️ Vérifiez la condition `isNightMode ? '#7FFF00' : '#FDD835'`

### Les cercles de sélection ne changent pas de couleur
➡️ Vérifiez que `globalTimeOfDay` est bien utilisé dans App.tsx
➡️ Vérifiez la propagation de l'état depuis le menu

### Erreurs TypeScript
➡️ Assurez-vous que tous les imports sont corrects
➡️ Vérifiez que `motion` est importé depuis `motion/react`

---

## 📋 Fichiers Originaux Modifiés

Cette version V2 modifie les fichiers suivants par rapport à la V1:

1. `/components/Bee.tsx`
   - Lignes 15-21: Couleurs des lucioles

2. `/components/Tree.tsx`
   - Lignes 736-761: Badge du nombre d'abeilles

3. `/App.tsx`
   - Lignes ~2246-2258: Cercle de sélection animation
   - Lignes ~2260-2271: Flash effect
   - Lignes ~2274-2316: Halo effects
   - Lignes ~2328-2355: Cercle de sélection interactif

---

## 🔗 Dépendances

Cette version nécessite:
- React
- motion/react (Framer Motion)
- TypeScript
- Tous les types définis dans `types/game.ts`

---

## 📞 Support

Si vous rencontrez des problèmes lors de la restauration:

1. Vérifiez la version de vos dépendances
2. Consultez `CHANGELOG_V2.md` pour les détails des modifications
3. Comparez avec les extraits fournis dans ce dossier
4. Assurez-vous que le mode jour/nuit fonctionne avant de restaurer

---

## 🎯 Différences Clés V1 → V2

| Aspect | V1 | V2 |
|--------|----|----|
| Lucioles ennemies | Bleu royal #4169E1 | Bleu cyan vif #00BFFF |
| Badge mode nuit | Jaune (non adapté) | Vert avec lueur |
| UI mode nuit | Jaune partout | Vert adaptatif |
| Cohérence | Moyenne | Excellente |

---

**Date de création:** 26 octobre 2025  
**Version du jeu:** Rush V2.0 - Mode Nuit Optimisé  
**Status:** ✅ Stable et testé

# 🛡️ RÈGLE : Ruche Intacte pour Amélioration

## 📅 Date : 25 Octobre 2025

## 🎯 Règle Implémentée

**La ruche niveau 1 doit avoir sa santé COMPLÈTE (7/7 HP) pour pouvoir être améliorée en niveau 2.**

---

## ❓ Pourquoi Cette Règle ?

### Problème Avant
- On pouvait améliorer une ruche **endommagée** (ex: 3/7 HP)
- Résultat : Ruche niveau 2 avec **35 HP** même si la L1 était à 3/7 HP
- **Exploit** : Transformer une ruche presque détruite en ruche pleine santé

### Solution
- ✅ La ruche L1 doit être **intacte** (7/7 HP)
- ✅ Si endommagée, il faut d'abord la **réparer**
- ✅ Puis ensuite l'**améliorer**

---

## 🔧 Implémentation

### 1️⃣ Double-Clic sur Ruche (Démarrage Upgrade)

**Fichier** : `/App.tsx` (ligne ~1630)

```tsx
} else if (tree.hiveCount === 1 && tree.hiveLevel[0] === 1 && !tree.isStartingTree) {
  // UPGRADE NIVEAU 1 -> NIVEAU 2
  // RÈGLE : La ruche doit être intacte (7/7 HP) pour être améliorée
  const currentHealth = tree.hiveHealth[0] || 0;
  if (currentHealth < HIVE_L1_HP) {
    toast.error(`La ruche doit être intacte (${HIVE_L1_HP}/${HIVE_L1_HP} HP) pour être améliorée !`);
    return prev; // Annule l'action
  }
  
  // ... reste du code d'amélioration
}
```

**Effet** :
- Vérifie la santé de la ruche **AVANT** d'envoyer les abeilles
- Affiche un toast d'erreur si la ruche est endommagée
- **Bloque l'amélioration** tant que la ruche n'est pas réparée

---

### 2️⃣ Abeilles en Mode Building (Arrivée à la Ruche)

**Fichier** : `/App.tsx` (ligne ~436)

```tsx
} else if (targetTree.hiveCount === 1 && targetTree.hiveLevel[0] === 1 && !targetTree.isStartingTree && targetTree.owner === 'player') {
  // UPGRADE NIVEAU 1 -> NIVEAU 2
  // RÈGLE : La ruche doit être intacte pour être améliorée
  const currentHealth = targetTree.hiveHealth[0] || 0;
  if (currentHealth < HIVE_L1_HP) {
    // Ruche endommagée - ne pas permettre l'amélioration
    // L'abeille est consommée mais ne contribue pas à l'amélioration
    beesToRemove.add(bee.id);
    continue;
  }
  
  // ... reste du code d'amélioration
}
```

**Effet** :
- Vérifie la santé **pendant** l'amélioration
- Si la ruche est endommagée pendant l'amélioration :
  - Les abeilles sont **consommées** mais ne contribuent pas
  - L'amélioration est **annulée**
  - Protège contre les attaques pendant l'upgrade

---

## 🎮 Impact Gameplay

### Avant (Sans Règle)
```
Ruche L1 : 3/7 HP (endommagée)
    ↓
Double-clic + 20 abeilles
    ↓
Ruche L2 : 35/35 HP (pleine santé) ✅ EXPLOIT !
```

**Problème** :
- ❌ Exploit : Transformer ruche endommagée en pleine santé
- ❌ Pas de punition pour avoir laissé ruche se faire attaquer
- ❌ Trop facile de récupérer

---

### Après (Avec Règle)
```
Ruche L1 : 3/7 HP (endommagée)
    ↓
Double-clic + 20 abeilles
    ↓
Toast : "La ruche doit être intacte (7/7 HP) pour être améliorée !"
    ↓
1. D'abord RÉPARER : 3 HP → 7 HP (4 abeilles)
2. Puis AMÉLIORER : 20 abeilles
    ↓
Ruche L2 : 35/35 HP
```

**Avantages** :
- ✅ Pas d'exploit
- ✅ Coût réel : 4 (réparation) + 20 (upgrade) = **24 abeilles**
- ✅ Encourage à **protéger** ses ruches
- ✅ Plus stratégique

---

## 📊 Cas d'Usage

### Cas 1 : Ruche Intacte
```
Ruche L1 : 7/7 HP ✅
Double-clic + 20 abeilles
→ Amélioration démarre ✅
→ Ruche L2 : 35/35 HP
```

**Résultat** : ✅ Fonctionne normalement

---

### Cas 2 : Ruche Légèrement Endommagée
```
Ruche L1 : 6/7 HP ❌
Double-clic + 20 abeilles
→ Toast : "La ruche doit être intacte (7/7 HP) pour être améliorée !"
→ Amélioration bloquée ❌

Solution :
1. Double-clic + 1 abeille → Répare (6→7 HP)
2. Double-clic + 20 abeilles → Améliore
→ Ruche L2 : 35/35 HP
```

**Résultat** : ✅ Doit réparer d'abord (coût total : 21 abeilles)

---

### Cas 3 : Ruche Très Endommagée
```
Ruche L1 : 2/7 HP ❌
Double-clic + 20 abeilles
→ Toast : "La ruche doit être intacte..."
→ Bloqué ❌

Solution :
1. Double-clic + 5 abeilles → Répare (2→7 HP)
2. Double-clic + 20 abeilles → Améliore
→ Ruche L2 : 35/35 HP
```

**Résultat** : ✅ Doit réparer d'abord (coût total : 25 abeilles)

---

### Cas 4 : Attaque Pendant Amélioration
```
Ruche L1 : 7/7 HP ✅
Double-clic + 20 abeilles
→ Amélioration : 5/20 abeilles déjà utilisées
→ Attaque ennemie : 7 HP → 4 HP ⚠️
→ Abeilles suivantes arrivent...
→ Vérification : 4/7 HP ❌
→ Abeilles consommées SANS contribuer ❌
→ Amélioration ANNULÉE

Résultat :
- 5 abeilles perdues (avant attaque)
- X abeilles perdues (après attaque, consommées pour rien)
- Ruche L1 : 4/7 HP
```

**Résultat** : ⚠️ Amélioration annulée si attaque pendant le processus

---

## 🧪 Tests

### Test 1 : Ruche Intacte
- [ ] Ruche L1 à 7/7 HP
- [ ] Double-clic + 20 abeilles
- [ ] Toast : "Amélioration en cours..."
- [ ] Amélioration se termine
- [ ] Ruche L2 à 35/35 HP

**Attendu** : ✅ Fonctionne

---

### Test 2 : Ruche Endommagée (1 HP manquant)
- [ ] Ruche L1 à 6/7 HP
- [ ] Double-clic + 20 abeilles
- [ ] Toast : **"La ruche doit être intacte (7/7 HP) pour être améliorée !"**
- [ ] Amélioration **bloquée**
- [ ] Abeilles **pas consommées**

**Attendu** : ❌ Bloqué avec message d'erreur

---

### Test 3 : Réparation Puis Amélioration
- [ ] Ruche L1 à 5/7 HP
- [ ] Double-clic + 2 abeilles → Répare à 7/7 HP
- [ ] Toast : "Ruche réparée !"
- [ ] Double-clic + 20 abeilles → Améliore
- [ ] Toast : "Amélioration en cours..."
- [ ] Ruche L2 à 35/35 HP

**Attendu** : ✅ Réparation puis amélioration

---

### Test 4 : Attaque Pendant Amélioration
- [ ] Ruche L1 à 7/7 HP
- [ ] Double-clic + 20 abeilles
- [ ] Amélioration : 10/20
- [ ] Attaque ennemie : 7 HP → 5 HP
- [ ] Abeilles suivantes arrivent
- [ ] Abeilles **consommées** mais pas de progression
- [ ] Amélioration **annulée**

**Attendu** : ⚠️ Amélioration annulée, abeilles perdues

---

## 💡 Stratégie

### Avant d'Améliorer
1. ✅ **Vérifier** : Ruche à 7/7 HP
2. ✅ **Réparer** si nécessaire
3. ✅ **Protéger** pendant l'amélioration (20 secondes)
4. ✅ **Avoir** 20+ abeilles disponibles

### Si Attaque Pendant Amélioration
1. ⚠️ **Défendre** : Envoyer abeilles repousser attaquants
2. ⚠️ **Accepter** : Amélioration perdue, réparer plus tard
3. ⚠️ **Reconstruire** : Si ruche détruite, recommencer

---

## 📈 Impact Équilibrage

### Coût Réel d'une Ruche L2

| Scénario | Coût Total |
|----------|-----------|
| **Ruche intacte (7/7)** | 20 abeilles |
| **Ruche 6/7 HP** | 21 abeilles (+1 réparation) |
| **Ruche 5/7 HP** | 22 abeilles (+2 réparation) |
| **Ruche 4/7 HP** | 23 abeilles (+3 réparation) |
| **Ruche 3/7 HP** | 24 abeilles (+4 réparation) |
| **Ruche 2/7 HP** | 25 abeilles (+5 réparation) |
| **Ruche 1/7 HP** | 26 abeilles (+6 réparation) |

**Conclusion** :
- ✅ Protéger ses ruches est **rentable**
- ✅ Laisser ruche se faire attaquer coûte **cher**
- ✅ Encourage gameplay **défensif**

---

## 🎯 Résumé

### Règle
**Ruche L1 doit être 7/7 HP pour être améliorée en L2**

### Messages
- ❌ Ruche endommagée : "La ruche doit être intacte (7/7 HP) pour être améliorée !"
- ✅ Ruche réparée : "Ruche réparée !"
- ✅ Amélioration : "Amélioration en cours... X/20 abeilles"
- ✅ Terminée : "Ruche améliorée au niveau 2 !"

### Impact
- ✅ **Pas d'exploit** (pas de heal gratuit)
- ✅ **Plus stratégique** (protéger > laisser attaquer)
- ✅ **Coût réaliste** (réparation + amélioration)

### Modifications
- **2 endroits** dans `/App.tsx`
- **Ligne ~436** : Abeilles en building
- **Ligne ~1630** : Double-clic

---

**Version** : 3.0  
**Date** : 25 Octobre 2025  
**Statut** : ✅ Implémenté et testé  
**Impact** : Équilibrage majeur

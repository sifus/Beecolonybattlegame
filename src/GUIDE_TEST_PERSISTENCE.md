# 🧪 Guide de Test - Système de Persistance

## Tests de Base

### ✅ Test 1 : Sauvegarde de la Progression
1. Lance le jeu
2. Ouvre la console du navigateur (F12)
3. Va dans le mode Histoire
4. Complète le premier sous-niveau (Déplacement)
5. **Vérification :**
   - Dans la console : `localStorage.getItem('rush_level_progress')`
   - Tu devrais voir les données JSON avec `completed: true` pour le premier sous-niveau

### ✅ Test 2 : Chargement de la Progression
1. Complète 2-3 sous-niveaux
2. Note les étoiles gagnées
3. **Ferme complètement le navigateur** (ou l'onglet)
4. Rouvre le jeu
5. Va dans le mode Histoire
6. **Vérification :**
   - Les sous-niveaux complétés sont marqués comme terminés ✅
   - Les étoiles sont affichées correctement ⭐⭐⭐
   - La carte des niveaux montre la bonne progression

### ✅ Test 3 : Préférences Audio
1. Va dans Options
2. Désactive le son
3. Ferme et rouvre le jeu
4. **Vérification :**
   - Le son reste désactivé 🔇
   - Dans la console : `localStorage.getItem('rush_sound_enabled')` → devrait être `false`

### ✅ Test 4 : Mode Jour/Nuit
1. Va dans Options
2. Active le mode Nuit 🌙
3. Ferme et rouvre le jeu
4. **Vérification :**
   - Le mode nuit est conservé
   - Dans la console : `localStorage.getItem('rush_time_of_day')` → devrait être `"night"`

### ✅ Test 5 : Réinitialisation
1. Complète plusieurs niveaux
2. Va dans Options
3. Clique sur "Réinitialiser"
4. **Vérification :**
   - Message de confirmation affiché ✅
   - Retour à la progression initiale
   - Dans la console : `localStorage.getItem('rush_level_progress')` → progression réinitialisée

## Tests Avancés

### 🔬 Test 6 : Multiples Sessions
1. **Session 1 :** Complète niveaux 1-1, 1-2, 1-3 (9 étoiles)
2. Ferme le navigateur
3. **Session 2 :** Complète niveau 1-4 (3 étoiles supplémentaires)
4. Ferme le navigateur
5. **Session 3 :** Vérifie que tu as bien 12 étoiles au total

### 🔬 Test 7 : Données Corrompues
1. Ouvre la console
2. Tape : `localStorage.setItem('rush_level_progress', 'CORRUPT DATA')`
3. Recharge la page
4. **Vérification :**
   - Le jeu démarre sans erreur
   - La progression est réinitialisée aux valeurs par défaut
   - Message d'erreur visible dans la console

### 🔬 Test 8 : localStorage Désactivé
1. Ouvre les paramètres du navigateur
2. Désactive les cookies/stockage local
3. Lance le jeu
4. **Vérification :**
   - Le jeu fonctionne normalement
   - Aucune erreur critique
   - La progression n'est pas sauvegardée (comportement attendu)

### 🔬 Test 9 : Navigation Privée
1. Ouvre une fenêtre en mode navigation privée
2. Lance le jeu
3. Complète 2-3 niveaux
4. **Ne ferme pas encore la fenêtre**, ouvre un nouvel onglet dans la même fenête
5. Recharge le jeu → progression conservée ✅
6. **Maintenant ferme la fenêtre privée complètement**
7. Rouvre une nouvelle fenêtre privée
8. Lance le jeu
9. **Vérification :**
   - Progression réinitialisée (comportement attendu en mode privé)

## Tests Mobile

### 📱 Test 10 : iOS Safari
1. Lance le jeu sur iPhone/iPad
2. Complète quelques niveaux
3. Ferme complètement Safari (swipe up depuis le multitâche)
4. Rouvre Safari
5. **Vérification :**
   - Progression conservée
   - Pas de perte de données

### 📱 Test 11 : Android Chrome
1. Lance le jeu sur Android
2. Active le mode nuit
3. Complète 2-3 niveaux
4. Vide le cache de Chrome (Paramètres → Stockage)
5. **Vérification :**
   - Données effacées (comportement attendu)
   - Jeu redémarre avec progression initiale

## Commandes Console Utiles

```javascript
// 📊 Voir toutes les données sauvegardées
console.log('Progression:', localStorage.getItem('rush_level_progress'));
console.log('Son:', localStorage.getItem('rush_sound_enabled'));
console.log('Jour/Nuit:', localStorage.getItem('rush_time_of_day'));

// 🔍 Parser la progression
const progress = JSON.parse(localStorage.getItem('rush_level_progress'));
console.log('Niveau actuel:', progress.progress.currentLevel);
console.log('Sous-niveau actuel:', progress.progress.currentSubLevel);

// 🗑️ Effacer toutes les données
localStorage.clear();

// 💾 Forcer une valeur spécifique
localStorage.setItem('rush_sound_enabled', 'false');

// 📦 Voir la taille des données stockées
const allData = JSON.stringify(localStorage);
console.log('Taille stockée:', (allData.length / 1024).toFixed(2), 'KB');

// ⭐ Compter le total d'étoiles
const progress = JSON.parse(localStorage.getItem('rush_level_progress'));
const totalStars = progress.progress.levels.reduce((sum, level) => 
  sum + level.stars, 0
);
console.log('Total étoiles:', totalStars);

// 🔓 Débloquer tous les niveaux manuellement
const progress = JSON.parse(localStorage.getItem('rush_level_progress'));
progress.progress.levels.forEach(level => {
  level.unlocked = true;
  level.completed = true;
  level.stars = 15;
  level.subLevels.forEach(sub => {
    sub.completed = true;
    sub.stars = 3;
  });
});
localStorage.setItem('rush_level_progress', JSON.stringify(progress));
location.reload(); // Recharger la page
```

## Scénarios de Bug à Vérifier

### 🐛 Bug Potentiel 1 : Double Sauvegarde
**Symptôme :** Performance lente, trop d'écritures localStorage
**Test :**
1. Ouvre la console
2. Active le monitoring du localStorage
3. Complète un niveau rapidement
4. **Vérification :** Pas plus de 1-2 écritures par seconde

### 🐛 Bug Potentiel 2 : Perte de Données
**Symptôme :** Progression perdue après actualisation
**Test :**
1. Complète un niveau
2. Appuie sur F5 (actualisation rapide)
3. **Vérification :** Progression conservée

### 🐛 Bug Potentiel 3 : Conflit de Version
**Symptôme :** Erreur lors de migration de version
**Test :**
1. Modifie la version dans le code : `const CURRENT_VERSION = '2.0.0';`
2. Recharge le jeu
3. **Vérification :**
   - Warning dans la console
   - Jeu continue de fonctionner
   - Données conservées (ou migrées selon la logique)

## Critères de Succès

✅ **Le système est fonctionnel si :**
1. La progression est sauvegardée automatiquement
2. Les préférences sont conservées entre sessions
3. Aucune erreur dans la console
4. Le jeu fonctionne même si localStorage est désactivé
5. Les données peuvent être réinitialisées manuellement
6. La taille des données reste raisonnable (< 100 KB)
7. Pas de lag/freeze lors des sauvegardes
8. Compatible iOS et Android

## Rapport de Bug

Si tu trouves un bug, note :
- 🔴 Navigateur et version
- 🔴 Étapes pour reproduire
- 🔴 Message d'erreur (console)
- 🔴 Données localStorage (si accessible)
- 🔴 Comportement attendu vs réel

---

**Date de création :** 26 octobre 2025  
**Version testée :** 1.0.0

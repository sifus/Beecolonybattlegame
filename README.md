# Bee Colony Battle

Un jeu de stratégie en temps réel où tu conquiers une forêt avec tes abeilles.

![Version](https://img.shields.io/badge/version-6.2-informational)
![License](https://img.shields.io/badge/license-MIT-green)
![React](https://img.shields.io/badge/built%20with-React%2018-61DAFB?logo=react)

---

## Le jeu

Bee Colony Battle est un jeu de stratégie mobile et desktop entièrement rendu en SVG. Tu contrôles une colonie d'abeilles, construis des ruches sur des arbres, gères ta production et détruis la colonie ennemie avant qu'elle ne prenne le dessus.

Deux modes : **Partie Rapide** (carte aléatoire, une seule partie) et **Mode Histoire** (niveaux progressifs avec tutoriel).

---

## Gameplay

- Dessine un cercle pour sélectionner tes abeilles, clique sur un arbre pour les envoyer
- Capture un arbre neutre pour y construire une ruche (5 abeilles) qui produit passivement
- Améliore une ruche L1 → L2 (20 abeilles) pour tripler la cadence de production
- Répare les ruches endommagées par l'ennemi avant de les améliorer
- Les abeilles combattent dès qu'elles se croisent — en orbite ou en plein vol
- Évite les étangs : les abeilles qui les survolent risquent de tomber

---

## Stack technique

| Technologie | Rôle |
|---|---|
| React 18 + TypeScript | UI et logique de jeu |
| Vite | Build et dev server |
| SVG natif | Rendu graphique complet (pas de canvas, pas de WebGL) |
| Framer Motion | Animations UI |
| Capacitor | Packaging iOS / Android |
| localStorage | Persistance des préférences et progression |

---

## Lancer le projet en local

```bash
git clone https://github.com/sifus/Beecolonybattlegame.git
cd Beecolonybattlegame
npm install
npm run dev
```

Disponible sur `http://localhost:5173`.

Build de production :

```bash
npm run build
```

---

## Roadmap

### Implémenté
- Partie Rapide et Mode Histoire (niveaux progressifs + tutoriel)
- Système de ruches L1 / L2 avec construction, réparation et amélioration
- IA ennemie avec priorités tactiques
- Combat en vol entre abeilles (collision radius 15px)
- Étangs organiques — danger pour les deux camps
- Rayon de soleil directionnel animé avec scintillements synchronisés
- Mode jour / nuit (lucioles la nuit)
- Mode gaucher, mode veille, pause automatique en arrière-plan
- Sauvegarde automatique (localStorage)
- Responsive desktop / mobile

### À venir
- Orage gameplay : nuages orageux déciment les abeilles et endommagent les ruches
- Bûcheron : un nouveau danger sur la carte qui coupe les arbres
- Difficulté configurable en Partie Rapide
- Animations d'impact lors des combats
- Effets de particules lors de la prise d'un arbre
- Amélioration du mouvement en essaim

---

## License

MIT

# 🏉 Rugby Manager

**Rugby Manager** est un jeu de gestion sportive de rugby inspiré de la célèbre franchise *Football Manager*, conçu pour tourner directement dans le navigateur en **Vanilla JavaScript** (sans aucun framework requis).

Le projet a été pensé dès le départ sur une architecture **100% Data-Driven** : aucune donnée métier n'est codée en dur. Tout repose sur des structures relationnelles par ID et des fichiers de configuration externes.

---

## 🚀 Fonctionnalités principales

*   **Architecture Data-Driven :** Chargement asynchrone des données depuis des fichiers JSON modifiables (`countries.json`, `leagues.json`, `clubs.json`, `players.json`)[cite: 1].
*   **Indexation Haute Performance :** Utilisation de `Map` JavaScript en mémoire pour des accès ultra-rapides par ID (ex: `playersById`, `clubsById`)[cite: 1].
*   **Moteur de Match axé sur les Attributs :** Évaluation des performances basée sur des notes détaillées (Technique, Physique, Mental) notées sur 20, avec calcul d'un *Overall* dynamique pour le XV de départ.
*   **Gestion des Championnats :** Génération automatique de calendrier via un algorithme de type *Round-Robin* et application du barème officiel des points du rugby (victoires, nuls, bonus offensifs et défensifs).
*   **Gestion Financière & Salariale :** Suivi de la trésorerie des clubs et respect du plafond salarial (*Salary Cap*).
*   **Éditeur Intégré :** Interface modale permettant de modifier en direct les caractéristiques des joueurs et des clubs depuis le jeu.
*   **Système de Sauvegarde Avancé :** Persistance locale via le `LocalStorage` et support complet de l'export/import de fichiers de sauvegarde JSON.

---

## 📂 Architecture du Projet

rugby-manager/
├── index.html          # Point d'entrée de l'application (Single Page Application)[cite: 1]
├── css/
│   └── style.css       # Feuille de style principale (Interface sombre / Dark Mode)
├── js/
│   ├── database.js     # Gestionnaire de chargement et d'indexation Map[cite: 1]
│   ├── game.js         # Contrôleur global de l'application et des vues[cite: 1]
│   ├── matchEngine.js  # Moteur de simulation de match[cite: 1]
│   ├── saveSystem.js   # Gestion des sauvegardes locales et exports[cite: 1]
│   ├── competition.js  # Gestion des classements et du calendrier (Round-Robin)
│   └── editor.js       # Éditeur intégré en jeu
├── data/               # Fichiers de données relationnelles (JSON)[cite: 1]
│   ├── countries.json
│   ├── leagues.json
│   ├── clubs.json
│   └── players.json
└── assets/             # Ressources graphiques personnalisables
    ├── logos/
    ├── kits/
    ├── flags/
    └── stadiums/

---

## 🛠️ Installation et Lancement

Étant donné que l'application charge des fichiers JSON externes en JavaScript, l'utilisation d'un serveur local est obligatoire pour s'affranchir des restrictions de sécurité du navigateur (politique CORS).

1. Clone le dépôt sur ta machine :
   ```bash
   git clone [https://github.com/ton-pseudo/rugby-manager.git](https://github.com/ton-pseudo/rugby-manager.git)

# 📍 Tempize — Le Tinder des événements & sorties (P2P)

[![NestJS](https://img.shields.io/badge/Backend-NestJS%2010-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![React Native](https://img.shields.io/badge/Frontend-React%20Native%20%7C%20Expo%2052-61DAFB?logo=react&logoColor=black)](https://expo.dev/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%2016%20%2B%20PostGIS-336791?logo=postgresql&logoColor=white)](https://postgis.net/)
[![Redis](https://img.shields.io/badge/Cache-Redis%207-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/DevOps-Docker%20Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

**Tempize** est une application sociale multi-plateforme (Mobile & Web) de découverte d'événements et d'activités entre particuliers (P2P). Elle s'appuie sur une mécanique de **découverte ludique par swipe tactile** et un algorithme de recommandation par **géolocalisation spatiale (PostGIS)** et centres d'intérêt.

---

## 🎯 Fonctionnalités Clés

### 🌟 Périmètre MVP (100% P2P)
- 🃏 **Flux de Découverte par Swipe :** 
  - Glisser à **droite** : manifester son envie de participer (inscription directe si accès libre, ou demande envoyée à l'organisateur si sur validation).
  - Glisser à **gauche** : ignorer l'activité (l'événement est masqué pendant 7 jours avant réapparition potentielle).
  - Traitement des gestes natifs à **60/120 FPS** via `react-native-reanimated` et `react-native-gesture-handler`.
- 🗺️ **Algorithme de Recommandation Géospatiale :**
  - Calcul de distance en temps réel par **PostGIS** (`ST_Distance` et `ST_DWithin` sur index spatial GiST).
  - Tri intelligent par proximité géographique et pertinence des centres d'intérêt (tags partagés).
  - Vue alternative sur carte interactive.
- 👥 **Gestion des Événements & Places :**
  - Création rapide d'activités (Accès Libre ou Sur Validation).
  - Jauge et limitation stricte du nombre de participants.
  - Validation et gestion des profils en attente par l'organisateur.
- ⏳ **File d'Attente Automatisée :**
  - En cas de désistement d'un participant, la place libérée est automatiquement réattribuée au premier sur liste d'attente.
- 📢 **Canal d'Annonces Unilatéral :**
  - Fil de diffusion exclusif à l'organisateur pour publier des alertes instantanées (point de rendez-vous exact, retard, etc.).
- ⭐ **Notation Post-Événement (J+1) :**
  - Système d'évaluation de 1 à 5 étoiles sur l'activité effectuée et sur le profil de l'organisateur.

### 💎 Modèle Freemium (Premium)
| Fonctionnalité | Compte Gratuit | Compte Premium |
|---|---|---|
| **Rayon de recherche** | Position actuelle (max 15 km) | Rayon étendu / Mode Passeport (autres villes) |
| **Bouton Rewind** | ❌ Impossible d'annuler un swipe | ✅ Annulation immédiate du dernier swipe gauche |
| **File d'attente** | Ordre d'arrivée (FIFO) | ⚡ **Pass-Droit automatique** en tête de liste |
| **Création d'événements** | 3 événements actifs simultanés | ♾️ Création illimitée |

---

## 🛠️ Stack Technique

### Frontend Mobile & Web (`mobile/`)
- **Framework :** [React Native](https://reactnative.dev/) avec [Expo SDK 52](https://expo.dev/)
- **Routing :** [Expo Router v4](https://docs.expo.dev/router/introduction/) (File-based routing)
- **Animations & Gestes :** `react-native-reanimated` (v3) & `react-native-gesture-handler`
- **Support Web :** `react-native-web` & `@expo/metro-runtime`
- **State Management :** [Zustand](https://github.com/pmndrs/zustand)
- **Typage :** TypeScript strict

### Backend API (`backend/`)
- **Framework :** [NestJS 10](https://nestjs.com/) (Architecture modulaire : Controllers, Services, DTOs)
- **ORM :** [TypeORM](https://typeorm.io/) avec support des types géométriques PostGIS
- **Authentification :** JWT (JSON Web Tokens), stratégies Passport, hachage sécurisé `bcrypt`
- **Validation :** `class-validator` et `class-transformer`
- **Documentation :** Swagger / OpenAPI intégrée

### Données & Cache
- **Base de Données Principale :** [PostgreSQL 16](https://www.postgresql.org/) avec l'extension spatiale [PostGIS 3.4](https://postgis.net/)
- **Cache In-Memory :** [Redis 7](https://redis.io/) via `ioredis` (gestion des paquets de cartes de swipe et positions éphémères)

### DevOps & Déploiement
- **Environnement local :** [Docker Compose](https://docs.docker.com/compose/) (PostGIS, Redis, pgAdmin)
- **Déploiement Cloud :** [Render](https://render.com/) avec infrastructure-as-code via [`render.yaml`](./render.yaml)

---

## 🚀 Démarrage Rapide en Local

### 1. Prérequis
Assurez-vous d'avoir installé sur votre machine :
- [Node.js](https://nodejs.org/) (version 20+ recommandée)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (actif)
- [Git](https://git-scm.com/)

---

### 2. Étape 1 : Lancer la Base de Données & le Cache (Docker)
Depuis la racine du projet :
```powershell
docker compose up -d
```
Cette commande démarre automatiquement en arrière-plan :
- **PostgreSQL 16 + PostGIS** sur le port `5433`
- **Redis 7** sur le port `6379`
- **pgAdmin 4** sur le port `5051`

---

### 3. Étape 2 : Lancer le Backend API (NestJS)
Ouvrez un terminal :
```powershell
cd backend
npm install
npm run start:dev
```
- L'API démarre sur : **`http://localhost:3000/api/v1`**
- La documentation interactive Swagger est disponible sur : **[http://localhost:3000/api/docs](http://localhost:3000/api/docs)**

---

### 4. Étape 3 : Lancer le Frontend (Mobile & Web)
Ouvrez un deuxième terminal :
```powershell
cd mobile
npm install
npm run web
```
- **Sur navigateur Web :** L'application s'ouvre directement sur **[http://localhost:8081](http://localhost:8081)** !
- **Sur smartphone (iOS / Android) :** Lancez `npx expo start`, téléchargez l'application gratuite **Expo Go** et scannez le QR code affiché dans le terminal.

---

### Connexion Google (Web et mobile)

Créez des identifiants OAuth Web, Android et iOS dans Google Cloud Console. Ajoutez leurs ID dans `mobile/.env` (`EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`) et dans `backend/.env` (`GOOGLE_CLIENT_IDS`, séparés par des virgules). L’ID Web historique `EXPO_PUBLIC_GOOGLE_CLIENT_ID` reste accepté en repli pour le navigateur.

Pour le Web, autorisez l’origine locale `http://localhost:8081` ainsi que le domaine de production dans le client OAuth Web. Pour les applications natives, configurez le nom de package Android et le bundle identifier iOS déjà déclarés dans `mobile/app.json`, puis lancez une development build (Expo Go ne connaît pas le schéma natif `tempize://`). Le backend valide le jeton Google avant de créer le compte ou de connecter l’utilisateur existant à la même adresse vérifiée.

---

## 🌐 URLs des Services Locaux

| Service | URL locale | Identifiants par défaut |
|---|---|---|
| 📱 **Application Web** | `http://localhost:8081` | — |
| 🚀 **API Backend** | `http://localhost:3000/api/v1` | — |
| 📚 **Swagger Documentation** | `http://localhost:3000/api/docs` | — |
| 🖥️ **pgAdmin 4** | `http://localhost:5051` | `admin@tempize.dev` / `admin` |
| 🐘 **PostgreSQL (PostGIS)** | `localhost:5433` | `tempize` / `tempize_secret` (BDD : `tempize_db`) |
| 🔴 **Redis** | `localhost:6379` | — |

---

## 📁 Architecture du Projet

```text
Tempize/
├── 📄 docker-compose.yml       # Stack locale (PostGIS, Redis, pgAdmin)
├── 📄 render.yaml              # Blueprint de déploiement cloud Render
├── 📄 README.md
│
├── 📂 backend/                 # API NestJS (TypeScript)
│   ├── 📂 src/
│   │   ├── 📂 common/          # ENUMs stricts (TypeAcces, StatutEvenement, DirectionSwipe), décorateurs
│   │   ├── 📂 config/          # Configurations TypeORM PostGIS & client Redis
│   │   ├── 📂 database/        # Barrel des entités & schémas
│   │   └── 📂 modules/
│   │       ├── 📂 auth/        # Inscription, connexion bcrypt, JWT strategy
│   │       ├── 📂 users/       # Entité Utilisateur, géolocalisation & profil
│   │       ├── 📂 tags/        # Centres d'intérêt & auto-seed au boot
│   │       ├── 📂 events/      # CRUD événements & calcul spatial PostGIS (ST_DWithin)
│   │       ├── 📂 swipes/      # Moteur de swipe, règles de cooldown & rewind Premium
│   │       ├── 📂 participations/ # Gestion participants & promotion file d'attente
│   │       ├── 📂 announcements/  # Canal de diffusion unilatéral organisateur
│   │       ├── 📂 reviews/        # Évaluations à J+1 (événements et organisateurs)
│   │       └── 📂 health/         # Healthcheck PostGIS & Redis
│   └── 📄 package.json
│
└── 📂 mobile/                  # Application React Native / Expo
    ├── 📂 app/                 # Expo Router (navigation par fichiers)
    │   ├── 📄 _layout.tsx      # Provider GestureHandlerRootView & Thème
    │   └── 📂 (tabs)/          # Barre d'onglets principale
    │       ├── 📄 swipe.tsx    # 🃏 Écran de swipe Reanimated v3 à 60 FPS
    │       ├── 📄 map.tsx      # 🗺️ Vue carte et filtre de proximité
    │       ├── 📄 events.tsx   # 📅 Mes sorties & sorties organisées
    │       └── 📄 profile.tsx  # 👤 Profil, badges Premium & centres d'intérêt
    └── 📄 package.json
```

---

## ☁️ Déploiement Cloud (Render)

Le projet contient un fichier d'Infrastructure-as-Code [`render.yaml`](./render.yaml).

Pour déployer en un clic :
1. Créez un compte sur [Render.com](https://render.com).
2. Connectez votre compte GitHub (accès au dépôt `Tempize`).
3. Cliquez sur **New +** → **Blueprint** → sélectionnez le dépôt `Tempize`.
4. Render configure et démarre automatiquement le serveur Web NestJS, la base PostgreSQL managée et le cache Redis !

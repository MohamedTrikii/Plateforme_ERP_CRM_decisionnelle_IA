# Plateforme ERP/CRM Décisionnelle avec IA

> Projet de Fin d'Année (PFA) — Plateforme ERP/CRM modulaire, multi-tenant et augmentée par l'intelligence artificielle.

---

## Table des matières

1. [Présentation du projet](#1-présentation-du-projet)
2. [Architecture globale](#2-architecture-globale)
3. [Stack technologique](#3-stack-technologique)
4. [Structure du dépôt](#4-structure-du-dépôt)
5. [Microservices Backend](#5-microservices-backend)
6. [Modèles de données (Entités)](#6-modèles-de-données-entités)
7. [Service IA](#7-service-ia)
8. [Frontend Angular](#8-frontend-angular)
9. [Base de données](#9-base-de-données)
10. [Sécurité](#10-sécurité)
11. [Démarrage rapide](#11-démarrage-rapide)
12. [Variables d'environnement](#12-variables-denvironnement)
13. [Ports des services](#13-ports-des-services)
14. [API Reference](#14-api-reference)

---

## 1. Présentation du projet

La **Plateforme ERP/CRM Décisionnelle avec IA** est une application d'entreprise complète qui couvre :

- **ERP (Enterprise Resource Planning)** : gestion des clients, produits, commandes et stocks.
- **CRM (Customer Relationship Management)** : suivi du cycle de vie client (prospect → actif → inactif).
- **Décisionnel** : tableau de bord analytique avec KPIs, top produits et chiffre d'affaires.
- **Intelligence Artificielle** : prédiction de la demande en stock via régression linéaire polynomiale (scikit-learn).
- **Multi-tenant** : chaque tenant (entreprise) dispose de données totalement isolées grâce au champ `tenantId`.

---

## 2. Architecture globale

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT WEB                             │
│              Angular 18 SPA (port 4200)                     │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/REST (JSON)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    API GATEWAY                              │
│          Spring Cloud Gateway WebFlux (port 8083)           │
│  • Routing dynamique vers les microservices                 │
│  • CORS global                                              │
│  • Point d'entrée unique                                    │
└──────┬───────────────────┬──────────────────────┬───────────┘
       │                   │                      │
       ▼                   ▼                      ▼
┌─────────────┐   ┌────────────────┐   ┌──────────────────────┐
│ AUTH SERVICE│   │  CORE SERVICE  │   │     AI SERVICE       │
│  port 8081  │   │   port 8082    │   │     port 8000        │
│             │   │                │   │                      │
│ • JWT Auth  │   │ • Customers    │   │ • FastAPI (Python)   │
│ • Users     │   │ • Products     │   │ • LinearRegression   │
│ • Roles     │   │ • Orders       │   │ • Prédiction stock   │
│ • Tenants   │   │ • Stock        │   │                      │
└──────┬──────┘   │ • Analytics    │   └──────────────────────┘
       │          │ • Audit Logs   │
       │          │ • SystemConfig │
       │          └───────┬────────┘
       │                  │
       ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                     PostgreSQL 16                           │
│              Docker (port 55432 local / 5432 docker)        │
│                                                             │
│   erp_auth  ──── users, tokens                              │
│   erp_core  ──── customers, products, orders, stock, ...    │
└─────────────────────────────────────────────────────────────┘
```

### Principe de fonctionnement

1. Le **frontend Angular** envoie toutes ses requêtes vers l'**API Gateway** (port 8083).
2. Le gateway route chaque requête vers le microservice approprié selon le préfixe de l'URL.
3. Chaque requête protégée porte un **JWT Bearer token** émis par l'auth-service.
4. Les microservices valident indépendamment le JWT grâce à une clé secrète partagée.
5. Les données sont filtrées par `tenantId` extrait du token JWT.

---

## 3. Stack technologique

### Backend — Java / Spring Boot

| Technologie | Version | Rôle |
|---|---|---|
| **Java** | 23 | Langage principal |
| **Spring Boot** | 3.5.14 | Framework applicatif |
| **Spring Cloud** | 2025.0.0 | Écosystème microservices |
| **Spring Cloud Gateway WebFlux** | 2025.0.0 | API Gateway réactif |
| **Spring Security** | 6.x (BOM) | Authentification & autorisation |
| **Spring Data JPA** | 3.x (BOM) | ORM / accès base de données |
| **Spring Boot Actuator** | 3.5.14 | Health checks & métriques |
| **Hibernate** | 6.x | Implémentation JPA |
| **JJWT (io.jsonwebtoken)** | 0.12.5 | Génération/validation JWT |
| **Lombok** | 1.18.46 | Réduction du boilerplate Java |
| **MapStruct** | 1.5.5.Final | Mapping DTO ↔ Entité |
| **Maven** | 3.9.9 | Gestion de dépendances & build |
| **PostgreSQL Driver** | runtime | Connexion JDBC PostgreSQL |
| **Jakarta Validation** | 3.x | Validation des données (@NotBlank, @Email…) |

### Service IA — Python

| Technologie | Version | Rôle |
|---|---|---|
| **Python** | 3.11+ | Langage |
| **FastAPI** | ≥ 0.115.0 | Framework API REST asynchrone |
| **Uvicorn** | ≥ 0.30.0 | Serveur ASGI |
| **Pydantic** | ≥ 2.9.0 | Validation des données / schémas |
| **scikit-learn** | ≥ 1.5.0 | Modèle ML (LinearRegression) |
| **NumPy** | ≥ 2.0.0 | Calcul matriciel |
| **Pandas** | ≥ 2.2.0 | Manipulation de données |
| **python-jose** | ≥ 3.3.0 | Validation JWT côté Python |
| **httpx** | ≥ 0.27.0 | Client HTTP asynchrone |

### Frontend — Angular

| Technologie | Version | Rôle |
|---|---|---|
| **Angular** | 18.2.14 | Framework SPA |
| **Angular Material** | 18.2.14 | Composants UI (Material Design) |
| **Angular CDK** | 18.2.14 | Kit de développement composants |
| **RxJS** | ~7.8.0 | Programmation réactive |
| **Chart.js** | ^4.4.2 | Graphiques & visualisations |
| **ng2-charts** | ^6.0.1 | Intégration Chart.js pour Angular |
| **TypeScript** | ~5.4.0 | Typage statique |
| **Angular CLI** | 18.2.21 | Outils de build & serve |
| **Karma / Jasmine** | 6.4 / 5.1 | Tests unitaires |

### Infrastructure

| Technologie | Version | Rôle |
|---|---|---|
| **PostgreSQL** | 16-alpine | Base de données relationnelle |
| **Docker** | 20+ | Conteneurisation PostgreSQL |
| **Docker Compose** | 3.9 | Orchestration des conteneurs |
| **Nginx** | alpine | Serveur du frontend en production |

---

## 4. Structure du dépôt

```
PFA/
├── README.md
├── docker-compose.yml          # Infrastructure Docker (PostgreSQL)
├── .env                        # Variables d'environnement (non versionné)
├── start-local.ps1             # Script de démarrage one-command (Windows)
├── start-local.bat             # Wrapper batch pour start-local.ps1
├── start-service-java.ps1      # Helper Maven spring-boot:run
├── stop.ps1                    # Arrêt de tous les services
│
├── database/
│   └── init.sql                # Script d'initialisation PostgreSQL
│
├── backend/                    # Projet Maven multi-modules
│   ├── pom.xml                 # Parent POM (gestion des dépendances)
│   ├── auth-service/           # Microservice authentification (port 8081)
│   ├── core-service/           # Microservice métier ERP (port 8082)
│   └── api-gateway/            # Spring Cloud Gateway (port 8083)
│
├── ai-service/                 # Service IA Python/FastAPI (port 8000)
│   ├── main.py
│   ├── requirements.txt
│   ├── models/
│   │   └── stock_predictor.py  # Modèle ML LinearRegression
│   └── routers/
│       └── prediction.py       # Endpoint /api/v1/ai/predict/stock
│
├── frontend/
│   └── erp-frontend/           # Application Angular 18 principale
│       ├── src/app/
│       │   ├── core/           # Services partagés (auth, config, theme)
│       │   ├── features/       # Modules fonctionnels (auth, dashboard, customers…)
│       │   ├── layout/         # Shell, header, sidebar
│       │   └── shared/         # Composants réutilisables
│       └── nginx.conf          # Config Nginx pour le build de production
│
└── tools/
    └── apache-maven-3.9.9/     # Maven embarqué (pas besoin d'installation)
```

---

## 5. Microservices Backend

### 5.1 Auth Service (port 8081)

**Responsabilités :**
- Inscription et connexion des utilisateurs
- Génération et validation de tokens JWT
- Gestion des rôles (ADMIN, MANAGER, USER)
- Support multi-tenant (`tenantId` dans le token)
- Seeding automatique de l'utilisateur administrateur

**Packages :**
```
com.erp.auth/
├── controller/
│   ├── AuthController.java           # POST /api/v1/auth/login, /register
│   └── UserManagementController.java # GET/PUT /api/v1/auth/users/**
├── service/         # Logique métier authentification
├── security/        # Filtres JWT, UserDetailsService
├── entity/          # User, Role
├── dto/             # LoginRequest, RegisterRequest, AuthResponse
├── repository/      # UserRepository (Spring Data JPA)
└── config/          # SecurityConfig, DataInitializer, JwtConfig
```

**Base de données :** `erp_auth` (PostgreSQL)

---

### 5.2 Core Service (port 8082)

**Responsabilités :**
- CRUD complet : Clients, Produits, Commandes, Stock
- Isolation multi-tenant sur toutes les entités
- Module analytique (KPIs, CA, top produits)
- Journal d'audit (AuditLog)
- Configuration système dynamique par tenant (SystemConfig)

**Packages :**
```
com.erp.core/
├── customer/        # Customer CRUD
├── product/         # Product CRUD
├── order/           # Order + OrderItem (commandes)
├── stock/           # Gestion des stocks
├── analytics/       # KPIs et tableaux de bord
├── audit/           # AuditLog, Auditable (base class)
├── systemconfig/    # Configuration par tenant
├── tenant/          # Gestion des tenants
├── dashboard/       # Agrégation données dashboard
├── common/          # Utilitaires partagés
└── config/          # SecurityConfig, JPA Auditing
```

**Base de données :** `erp_core` (PostgreSQL)

---

### 5.3 API Gateway (port 8083)

**Responsabilités :**
- Point d'entrée unique pour le frontend
- Routage vers les microservices selon le préfixe URL
- Configuration CORS globale

**Routes configurées :**

| Préfixe URL | Service cible |
|---|---|
| `/api/v1/auth/**` | auth-service:8081 |
| `/api/v1/customers/**` | core-service:8082 |
| `/api/v1/products/**` | core-service:8082 |
| `/api/v1/orders/**` | core-service:8082 |
| `/api/v1/stock/**` | core-service:8082 |
| `/api/v1/analytics/**` | core-service:8082 |
| `/api/v1/dashboard/**` | core-service:8082 |
| `/api/v1/system-config/**` | core-service:8082 |
| `/api/v1/ai/**` | ai-service:8000 |

---

## 6. Modèles de données (Entités)

### 6.1 User *(auth-service — db: erp_auth)*

```
users
├── id            BIGSERIAL PK
├── username      VARCHAR(50)   UNIQUE NOT NULL
├── email         VARCHAR(100)  UNIQUE NOT NULL
├── password      VARCHAR(255)  NOT NULL  (BCrypt hashé)
├── full_name     VARCHAR(120)
├── role          VARCHAR(20)   NOT NULL  (ADMIN | MANAGER | USER)
├── tenant_id     VARCHAR(50)             (isolation multi-tenant)
├── enabled       BOOLEAN       DEFAULT TRUE
├── created_at    TIMESTAMP
└── updated_at    TIMESTAMP
```

**Enum Role :** `ADMIN` · `MANAGER` · `USER`

---

### 6.2 Customer *(core-service — db: erp_core)*

```
customers
├── id          BIGSERIAL PK
├── name        VARCHAR(120)  NOT NULL
├── email       VARCHAR(150)  UNIQUE
├── phone       VARCHAR(30)
├── address     VARCHAR(255)
├── company     VARCHAR(100)
├── tenant_id   VARCHAR(50)   NOT NULL  (index)
├── status      VARCHAR(20)   NOT NULL  (ACTIVE | INACTIVE | PROSPECT)
├── created_at  TIMESTAMP
├── updated_at  TIMESTAMP
├── created_by  VARCHAR(80)
└── updated_by  VARCHAR(80)
```

**Enum CustomerStatus :** `ACTIVE` · `INACTIVE` · `PROSPECT`

---

### 6.3 Product *(core-service — db: erp_core)*

```
products
├── id           BIGSERIAL PK
├── name         VARCHAR(200)    NOT NULL
├── sku          VARCHAR(80)               (index, unique par tenant)
├── description  TEXT
├── price        DECIMAL(12,2)   NOT NULL  (prix de vente)
├── cost_price   DECIMAL(12,2)             (prix de revient)
├── category     VARCHAR(100)
├── image_url    VARCHAR(200)
├── tenant_id    VARCHAR(50)     NOT NULL  (index)
├── status       VARCHAR(20)     NOT NULL  (ACTIVE | INACTIVE | DISCONTINUED)
├── created_at   TIMESTAMP
├── updated_at   TIMESTAMP
├── created_by   VARCHAR(80)
└── updated_by   VARCHAR(80)
```

**Enum ProductStatus :** `ACTIVE` · `INACTIVE` · `DISCONTINUED`

---

### 6.4 Order *(core-service — db: erp_core)*

```
orders
├── id                    BIGSERIAL PK
├── order_number          VARCHAR(50)     UNIQUE  (ex: ORD-2024-0001)
├── customer_id           BIGINT FK → customers.id
├── order_date            DATE            NOT NULL
├── expected_delivery_date DATE
├── status                VARCHAR(20)     (PENDING | CONFIRMED | SHIPPED | DELIVERED | CANCELLED)
├── total_amount          DECIMAL(14,2)   (calculé depuis les lignes)
├── notes                 TEXT
├── tenant_id             VARCHAR(50)     NOT NULL  (index)
├── created_at / updated_at / created_by / updated_by  (Auditable)
└── items []              → order_items (cascade ALL)
```

**Enum OrderStatus :** `PENDING` · `CONFIRMED` · `SHIPPED` · `DELIVERED` · `CANCELLED`

---

### 6.5 OrderItem *(core-service — db: erp_core)*

```
order_items
├── id          BIGSERIAL PK
├── order_id    BIGINT FK → orders.id
├── product_id  BIGINT FK → products.id
├── quantity    INTEGER       NOT NULL  (≥ 1)
└── unit_price  DECIMAL(12,2) NOT NULL  (snapshot du prix au moment de la vente)
```

*Champ calculé (transient) :* `lineTotal = quantity × unitPrice`

---

### 6.6 Stock *(core-service — db: erp_core)*

```
stock
├── id                  BIGSERIAL PK
├── product_id          BIGINT FK → products.id   UNIQUE (1-to-1 avec Product)
├── quantity_on_hand    INTEGER   DEFAULT 0   (stock disponible)
├── quantity_reserved   INTEGER   DEFAULT 0   (réservé par commandes en attente)
├── reorder_level       INTEGER   DEFAULT 10  (seuil déclenchant alerte stock bas)
├── reorder_quantity    INTEGER   DEFAULT 50  (quantité cible de réapprovisionnement)
├── tenant_id           VARCHAR(50) NOT NULL  (index)
└── created_at / updated_at / created_by / updated_by
```

*Champs calculés (transients) :*
- `availableQuantity = quantityOnHand − quantityReserved`
- `isLowStock = availableQuantity ≤ reorderLevel`

---

### 6.7 SystemConfig *(core-service — db: erp_core)*

```
system_config
├── id           BIGSERIAL PK
├── tenant_id    VARCHAR(50)    NOT NULL
├── config_key   VARCHAR(100)   NOT NULL
├── config_value TEXT
├── config_type  VARCHAR(20)    (TEXT | NUMBER | BOOLEAN | JSON | COLOR)
├── label        VARCHAR(200)
├── description  TEXT
└── is_public    BOOLEAN        DEFAULT TRUE
```

*Contrainte unique :* `(tenant_id, config_key)`

---

### 6.8 Auditable (classe abstraite)

Tous les modèles métier (Customer, Product, Order, Stock, SystemConfig) héritent de `Auditable` :

```java
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class Auditable {
    LocalDateTime createdAt;   // @CreatedDate — automatique
    LocalDateTime updatedAt;   // @LastModifiedDate — automatique
    String createdBy;          // @CreatedBy — depuis SecurityContext
    String updatedBy;          // @LastModifiedBy — depuis SecurityContext
}
```

---

## 7. Service IA

### Modèle ML — StockPredictor

Le service IA expose un modèle de **prédiction de la demande en stock** basé sur la régression linéaire polynomiale (degré 2).

**Algorithme :**
1. Réception de l'historique des ventes : liste de `(période, quantité)`.
2. Construction de features polynomiales : `[période, période²]`.
3. Entraînement d'un `LinearRegression` (scikit-learn) sur les données.
4. Calcul du score R² (qualité du modèle).
5. Prédiction des N prochaines périodes avec intervalle de confiance à 95 % (± 1,96 × écart-type des résidus).

**Endpoint :**

```
POST /api/v1/ai/predict/stock
```

**Requête :**
```json
{
  "productId": 1,
  "tenantId": "default",
  "salesHistory": [
    { "period": 1, "quantity": 120 },
    { "period": 2, "quantity": 135 },
    { "period": 3, "quantity": 148 }
  ],
  "periodsAhead": 3
}
```

**Réponse :**
```json
{
  "productId": 1,
  "tenantId": "default",
  "modelScore": 0.98,
  "predictions": [
    { "period": 4, "predictedQty": 161.2, "confidenceLower": 145.0, "confidenceUpper": 177.4 },
    { "period": 5, "predictedQty": 174.8, "confidenceLower": 158.6, "confidenceUpper": 191.0 },
    { "period": 6, "predictedQty": 188.5, "confidenceLower": 172.3, "confidenceUpper": 204.7 }
  ]
}
```

---

## 8. Frontend Angular

### Architecture des modules

```
src/app/
├── core/
│   ├── services/
│   │   ├── auth.service.ts        # Login, logout, gestion du token JWT
│   │   ├── config.service.ts      # Configuration dynamique (thème, etc.)
│   │   └── theme.service.ts       # Gestion du thème clair/sombre
│   ├── auth/
│   │   └── auth.service.ts        # Guards & intercepteurs HTTP
│   └── interceptors/              # Injection automatique du Bearer token
│
├── features/
│   ├── auth/
│   │   ├── login/                 # Page de connexion
│   │   └── register/              # Page d'inscription
│   ├── dashboard/                 # Tableau de bord (KPIs + graphiques)
│   ├── customers/                 # Liste, création, édition, suppression clients
│   ├── products/                  # Gestion catalogue produits
│   ├── orders/                    # Gestion des commandes
│   ├── stock/                     # Gestion des stocks + prédiction IA
│   ├── analytics/                 # Rapports & analyses
│   └── public/                    # Pages publiques (accueil, à propos)
│
├── layout/
│   ├── shell/                     # Layout principal (sidenav + toolbar)
│   ├── header/                    # Barre de navigation supérieure
│   └── sidebar/                   # Menu de navigation latéral
│
└── shared/
    ├── theme/                     # Thème Material Design personnalisé
    └── components/                # Composants réutilisables
```

### Fonctionnalités UI

| Module | Fonctionnalités |
|---|---|
| **Dashboard** | KPIs (CA, nb commandes, clients actifs), graphiques Chart.js, top produits |
| **Clients** | Liste paginée, recherche, création/édition/suppression, statuts colorés |
| **Produits** | Catalogue avec SKU, prix de vente et de revient, statuts, images |
| **Commandes** | Création avec lignes de commande, suivi du statut, calcul automatique du total |
| **Stocks** | Niveaux de stock, alertes stock bas, bouton prédiction IA |
| **Analytics** | Graphiques de tendances, CA par période |
| **Auth** | Login/Register avec validation, gestion du token JWT, redirection automatique |

---

## 9. Base de données

### PostgreSQL 16

Deux bases de données séparées pour l'isolation des données :

| Base | Schéma | Contenu |
|---|---|---|
| `erp_auth` | users | Utilisateurs, rôles, informations d'authentification |
| `erp_core` | customers, products, orders, order_items, stock, system_config, audit_log | Toutes les données métier |

### Stratégie multi-tenant

L'isolation est assurée au niveau **applicatif** : chaque table métier contient une colonne `tenant_id`, et toutes les requêtes filtrent sur ce champ. Le `tenantId` est extrait du **JWT token** à chaque requête.

### Gestion du schéma

Spring Boot avec **Hibernate DDL** (`spring.jpa.hibernate.ddl-auto: update`) gère la création et l'évolution du schéma automatiquement.

Le fichier `database/init.sql` crée les bases et l'utilisateur admin par défaut au premier démarrage du conteneur Docker.

---

## 10. Sécurité

### Authentification JWT

- **Algorithme :** HMAC-SHA256 (HS256)
- **Bibliothèque :** JJWT 0.12.5
- **Contenu du token :** `username`, `tenantId`, `role`, `exp`
- **Durée de validité :** configurable via `JWT_EXPIRATION` (défaut : 86400s = 24h)
- **Stockage côté client :** localStorage (frontend Angular)

### Flux d'authentification

```
1. POST /api/v1/auth/login  { username, password, tenantId }
   → auth-service valide les credentials contre la DB
   → génère un JWT signé
   → retourne { token, user }

2. Requêtes suivantes : Authorization: Bearer <token>
   → core-service extrait et valide le token localement (sans appel à auth-service)
   → filtre les données par tenantId du token
```

### Rôles et permissions

| Rôle | Accès |
|---|---|
| `ADMIN` | Accès complet : configuration système, gestion des utilisateurs, toutes les données |
| `MANAGER` | Accès aux rapports, approbations, consultation des données équipe |
| `USER` | Opérations standard : création/consultation de ses propres données |

### Protection OWASP

- Mots de passe hashés avec **BCrypt** (force 12)
- Validation stricte des entrées (`@NotBlank`, `@Email`, `@DecimalMin`, DTOs dédiés)
- CORS restreint aux origines autorisées
- Pas de credentials hardcodés (variables d'environnement)
- Isolation multi-tenant empêchant les fuites de données inter-tenant

---

## 11. Démarrage rapide

### Prérequis

- Java 23+
- Node.js 20+
- Python 3.11+
- Docker Desktop
- PowerShell 7+ (Windows)

### 1. Cloner et configurer

```powershell
git clone https://github.com/MohamedTrikii/Plateforme_ERP_CRM_decisionnelle_IA.git
cd Plateforme_ERP_CRM_decisionnelle_IA
```

Créer le fichier `.env` à la racine :

```env
POSTGRES_USER=erp
POSTGRES_PASSWORD=erp_pass
JWT_SECRET=your-very-long-secret-key-at-least-256-bits
DB_PORT=55432
APP_ADMIN_SEED_PASSWORD=Admin@1234
```

### 2. Créer le virtualenv Python

```powershell
cd ai-service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
cd ..
```

### 3. Démarrer tous les services (one-command)

```powershell
.\start-local.ps1
```

Ce script :
1. Charge le fichier `.env`
2. Démarre PostgreSQL via Docker Compose
3. Ouvre 5 fenêtres PowerShell distinctes pour chaque service

### 4. Accéder à l'application

| Service | URL |
|---|---|
| **Frontend** | http://localhost:4200 |
| **API Gateway** | http://localhost:8083 |
| **Auth Service** | http://localhost:8081 |
| **Core Service** | http://localhost:8082 |
| **AI Service (docs)** | http://localhost:8000/docs |

**Identifiants par défaut :**
- Utilisateur : `admin`
- Mot de passe : `Admin@1234`
- Tenant : `default`

### 5. Arrêter les services

```powershell
.\stop.ps1
```

---

## 12. Variables d'environnement

| Variable | Description | Défaut |
|---|---|---|
| `POSTGRES_USER` | Utilisateur PostgreSQL | `erp` |
| `POSTGRES_PASSWORD` | Mot de passe PostgreSQL | `erp_pass` |
| `JWT_SECRET` | Clé secrète de signature JWT (min 256 bits) | *(requis)* |
| `JWT_EXPIRATION` | Durée de validité du token (secondes) | `86400` |
| `DB_HOST` | Hôte PostgreSQL | `localhost` |
| `DB_PORT` | Port PostgreSQL (local) | `55432` |
| `DB_USERNAME` | Utilisateur DB (alias de POSTGRES_USER) | `erp` |
| `DB_PASSWORD` | Mot de passe DB (alias de POSTGRES_PASSWORD) | `erp_pass` |
| `APP_ADMIN_SEED_PASSWORD` | Mot de passe admin initial (seeding) | *(optionnel)* |
| `AUTH_SERVICE_URL` | URL auth-service vu du gateway (Docker) | `http://localhost:8081` |
| `CORE_SERVICE_URL` | URL core-service vu du gateway (Docker) | `http://localhost:8082` |

---

## 13. Ports des services

| Service | Port local | Port Docker interne |
|---|---|---|
| Frontend Angular | 4200 | 80 (Nginx) |
| API Gateway | 8083 | 8083 |
| Auth Service | 8081 | 8081 |
| Core Service | 8082 | 8082 |
| AI Service | 8000 | 8000 |
| PostgreSQL | **55432** | 5432 |

> Le port PostgreSQL local est **55432** (et non 5432) pour éviter les conflits avec une installation PostgreSQL locale sur Windows.

---

## 14. API Reference

### Auth Service

| Méthode | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/v1/auth/login` | Connexion + génération JWT | Public |
| POST | `/api/v1/auth/register` | Inscription d'un nouvel utilisateur | Public |
| GET | `/api/v1/auth/users` | Liste des utilisateurs du tenant | ADMIN |
| PUT | `/api/v1/auth/users/{id}` | Modification d'un utilisateur | ADMIN |
| DELETE | `/api/v1/auth/users/{id}` | Suppression d'un utilisateur | ADMIN |
| GET | `/api/v1/auth/actuator/health` | Health check | Public |

### Core Service

| Méthode | Endpoint | Description | Auth |
|---|---|---|---|
| GET/POST | `/api/v1/customers` | Liste / création clients | JWT |
| GET/PUT/DELETE | `/api/v1/customers/{id}` | Détail / édition / suppression | JWT |
| GET/POST | `/api/v1/products` | Liste / création produits | JWT |
| GET/PUT/DELETE | `/api/v1/products/{id}` | Détail / édition / suppression | JWT |
| GET/POST | `/api/v1/orders` | Liste / création commandes | JWT |
| GET/PUT/DELETE | `/api/v1/orders/{id}` | Détail / édition / suppression | JWT |
| GET/PUT | `/api/v1/stock/{productId}` | Consultation / mise à jour stock | JWT |
| GET | `/api/v1/analytics/summary` | KPIs analytiques | JWT |
| GET | `/api/v1/dashboard` | Données tableau de bord | JWT |
| GET/PUT | `/api/v1/system-config/{tenantId}` | Configuration système tenant | ADMIN |

### AI Service

| Méthode | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/v1/ai/predict/stock` | Prédiction demande en stock | JWT |
| GET | `/docs` | Documentation Swagger interactive | Public |
| GET | `/health` | Health check | Public |

---

## Auteurs

Projet réalisé dans le cadre du **Projet de Fin d'Année (PFA)**.

- **Mohamed Triki** — [@MohamedTrikii](https://github.com/MohamedTrikii)

---

*Dernière mise à jour : Mai 2026*

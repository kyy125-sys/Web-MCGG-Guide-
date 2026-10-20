# Magic Chess GoGo (MCGG) Guide — Backend API

Production-ready backend API service for Magic Chess GoGo Guide application built with Node.js, Express, TypeScript, and Prisma ORM (PostgreSQL).

---

## 🛠️ Tech Stack

- **Runtime**: Node.js + Express
- **Language**: TypeScript (`ES2020`, strict mode)
- **Database ORM**: Prisma with PostgreSQL
- **Authentication**: JWT with bcryptjs password hashing and role-based access (`admin` / `user`)
- **Validation**: Zod schema validation
- **File Uploads**: Multer with file type filtering (JPEG, PNG, WebP, GIF) and static delivery
- **Security & Logging**: Helmet, CORS, Morgan

---

## 📂 Folder Structure

```
backend/
├── prisma/
│   ├── schema.prisma       # Complete Prisma schema with relations
│   └── seed.ts             # Verified Season 8 MCGG data seed script
├── src/
│   ├── index.ts            # Application server entry point
│   ├── app.ts              # Express app setup and middleware configuration
│   ├── lib/
│   │   └── prisma.ts       # Global Prisma Client singleton
│   ├── middleware/
│   │   ├── auth.ts         # requireAuth & requireAdmin JWT middleware
│   │   └── upload.ts       # Multer multipart disk storage handler
│   └── routes/
│       ├── auth.ts         # User auth (register, login, me)
│       ├── heroes.ts       # Hero endpoints (CRUD, search, filter, bulk import)
│       ├── commanders.ts   # Commander endpoints (CRUD, search)
│       ├── synergies.ts    # Synergy endpoints (CRUD, hero associations)
│       ├── lineups.ts      # Lineup builder & saved lineups (CRUD, clone)
│       ├── patches.ts      # Game patch manager (versions, notes)
│       ├── tiers.ts        # Tier list management (S, A, B, C, D)
│       ├── uploads.ts      # Image asset upload endpoint
│       └── recommendations.ts # Algorithm-based lineup recommendation engine
├── uploads/                # Local uploaded asset storage
│   ├── commanders/
│   ├── heroes/
│   ├── misc/
│   └── synergies/
├── .env.example            # Environment variables template
├── package.json            # Dependencies and npm scripts
└── tsconfig.json           # TypeScript configuration
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
Run in terminal (cmd / powershell):
```bash
cmd /c "cd /d \"d:\File Projek Web\web mcgg guide\backend\" && npm install"
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and configure your PostgreSQL database connection:
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mcgg_guide?schema=public"
PORT=3001
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3001
```

### 3. Database Migration & Seed
Generate Prisma client and run seed data:
```bash
# Generate Prisma Client
cmd /c "cd /d \"d:\File Projek Web\web mcgg guide\backend\" && npx prisma generate"

# Push schema to database
cmd /c "cd /d \"d:\File Projek Web\web mcgg guide\backend\" && npx prisma db push"

# Seed verified MCGG Season 8 data
cmd /c "cd /d \"d:\File Projek Web\web mcgg guide\backend\" && npm run seed"
```

### 4. Start Development Server
```bash
cmd /c "cd /d \"d:\File Projek Web\web mcgg guide\backend\" && npm run dev"
```

Server runs at: `http://localhost:3001`
Health check: `http://localhost:3001/api/health`

---

## 📋 API Endpoints Reference

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user account |
| POST | `/api/auth/login` | Public | Login with email & password, returns JWT |
| GET | `/api/auth/me` | Authenticated | Get current logged-in user profile |

*Default Seed Admin Account*: `admin@mcgg.local` / `admin123`

---

### ⚔️ Heroes (`/api/heroes`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/heroes` | Public | List heroes with query filters (`search`, `cost`, `role`, `synergy`, `rarity`, `isActive`, `patchId`, `page`, `limit`) |
| GET | `/api/heroes/:id` | Public | Get hero details with synergies and tier entries |
| POST | `/api/heroes` | Admin | Create a new hero |
| PUT | `/api/heroes/:id` | Admin | Update hero details and synergy links |
| DELETE | `/api/heroes/:id` | Admin | Delete a hero |
| POST | `/api/heroes/import` | Admin | Bulk import heroes from array |

---

### 🛡️ Commanders (`/api/commanders`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/commanders` | Public | List all active commanders |
| GET | `/api/commanders/:id` | Public | Get commander details with skill levels |
| POST | `/api/commanders` | Admin | Create a commander |
| PUT | `/api/commanders/:id` | Admin | Update commander |
| DELETE | `/api/commanders/:id` | Admin | Delete commander |

---

### 🌀 Synergies (`/api/synergies`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/synergies` | Public | List synergies with associated heroes and threshold bonuses |
| GET | `/api/synergies/:id` | Public | Get synergy details with full hero list |
| POST | `/api/synergies` | Admin | Create synergy |
| PUT | `/api/synergies/:id` | Admin | Update synergy |
| DELETE | `/api/synergies/:id` | Admin | Delete synergy |

---

### ♟️ Lineups (`/api/lineups`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/lineups` | Public | List lineups (filters: `userId`, `isPublic`, `commanderId`, `patchId`, `tag`, `search`) |
| GET | `/api/lineups/:id` | Public | Get lineup details with hero board positions, stars, and items |
| POST | `/api/lineups` | Authenticated | Save new custom lineup |
| PUT | `/api/lineups/:id` | Authenticated | Update existing lineup |
| DELETE | `/api/lineups/:id` | Authenticated | Delete lineup |
| POST | `/api/lineups/:id/duplicate` | Authenticated | Clone / duplicate a lineup |

---

### 📈 Recommendations Engine (`/api/recommendations`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/recommendations` | Public | Generates optimized lineup combinations based on slots, focused synergy, commander, and included/excluded heroes |

Request Body format:
```json
{
  "slots": 6,
  "focus": "balanced",
  "mainSynergyIds": [],
  "includeHeroIds": [],
  "excludeHeroIds": [],
  "limit": 5
}
```

---

### 🏆 Tier List (`/api/tiers`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/tiers` | Public | Query tier entries by `entityType` (`hero`, `commander`, `synergy`, `lineup`) and `patchId` |
| POST | `/api/tiers` | Admin | Add an entity to the tier list |
| PUT | `/api/tiers/:id` | Admin | Update tier rank (S, A, B, C, D) and score |
| DELETE | `/api/tiers/:id` | Admin | Delete tier entry |

---

### 📜 Patches (`/api/patches`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/patches` | Public | List all patches ordered by release date |
| GET | `/api/patches/active` | Public | Get current active game patch |
| GET | `/api/patches/:id` | Public | Get patch details and changelog |
| POST | `/api/patches` | Admin | Create patch (auto-deactivates previous active patch if `isActive: true`) |
| PUT | `/api/patches/:id` | Admin | Update patch notes and status |
| DELETE | `/api/patches/:id` | Admin | Delete patch |

---

### 🖼️ Uploads (`/api/upload`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/upload/:type` | Multipart Form | Upload image (`heroes`, `commanders`, `synergies`, `misc`). Optional `entityId` and `entityType` automatically updates image URL in database |

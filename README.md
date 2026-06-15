# Bahay ni Kuya — Boarding House Management System

A web-based management system for the **Bahay ni Kuya** boarding house (~30 student tenants).
Full-stack app with a real PostgreSQL database: tenant/room/lease/payment/maintenance records,
CRUD with search & filtering, a reports dashboard, an ER diagram, a database inspector, and
JSON backup/restore.

> Course project for ITS131P. Built as a real client/server app (not a single HTML file).

## Tech stack

| Layer    | Technology |
|----------|------------|
| Frontend | Vite + React + TypeScript, Tailwind CSS, **shadcn/ui** (sidebar + modals), **TanStack Table** (data grids + DB inspector), **TanStack Query**, **React Flow** (ER diagram) |
| Backend  | Node + Express + TypeScript, **Prisma ORM**, Zod validation |
| Database | **PostgreSQL 16** (via Docker Compose) |

## Prerequisites

- **Node.js** 18+ (built with v22)
- **Docker Desktop** (for the PostgreSQL container)

## Quick start

From the project root:

```bash
# 1. Install all dependencies (root + server + client)
npm run install:all

# 2. Start PostgreSQL (Docker)
npm run db:up

# 3. Generate Prisma client, run migrations, seed sample data
npm --prefix server run prisma:generate
npm run db:setup

# 4. Run the app (Express API + Vite client together)
npm run dev
```

Then open **http://localhost:5173** (if 5173 is busy, Vite prints the actual port).

> One-shot: `npm run setup` does steps 1–3, then run `npm run dev`.

### Default ports / credentials

| Thing | Value |
|-------|-------|
| Client (Vite) | http://localhost:5173 |
| API (Express) | http://localhost:4000 |
| PostgreSQL | `localhost:5433` → container `5432` (host 5433 avoids clashing with a local Postgres on 5432) |
| DB / user / pass | `bahay_ni_kuya_db` / `bnk` / `bnk_password` |

Connection string lives in `server/.env` (`DATABASE_URL`). See `.env.example`.

## Features

- **File maintenance (CRUD)** for all 5 entities — Tenants, Rooms, Leases, Payments, Maintenance.
  - Add / Edit via shadcn modal forms with foreign-key dropdowns and validation.
  - **Soft-delete** for tenants (status → `inactive`); hard-delete elsewhere with **dependency guards** (e.g. a room with leases can't be deleted).
  - **Search & filter** per module (server-side).
- **Dashboard** — income this month, occupancy rate, overdue payments list (tenant + amount + days overdue), maintenance summary by status.
- **Database Inspector** — browse raw rows of any table with TanStack Table (sort/paginate).
- **ER Diagram** — interactive React Flow diagram of the schema (PK/FK markers, 1:N relations).
- **Backup & Restore** — export the whole database as JSON; restore by uploading a backup file.

## Project structure

```
.
├── docker-compose.yml         # PostgreSQL 16
├── package.json               # root scripts (concurrently runs server + client)
├── server/                    # Express + Prisma API
│   ├── prisma/
│   │   ├── schema.prisma       # 5 models, enums, snake_case @map to proposal tables
│   │   ├── seed.ts             # sample data (brief + added June payments)
│   │   └── sql/{ddl,dml}.sql   # raw SQL mirror for the course deliverable
│   └── src/
│       ├── index.ts            # app bootstrap + routes
│       ├── lib/{crud,schemas,serialize}.ts
│       ├── middleware/errorHandler.ts
│       └── routes/{tenants,rooms,leases,payments,maintenance,dashboard,backup}.ts
└── client/                    # Vite + React UI
    └── src/
        ├── components/         # DataTable, EntityModal, StatusBadge, ConfirmDialog, ui/*
        ├── hooks/useCrud.ts
        ├── lib/{api,format,utils}.ts
        └── pages/              # Dashboard, Tenants, Rooms, Leases, Payments,
                                # Maintenance, DatabasePage, ERDiagram, Backup
```

## Data model

`tenants` 1—N `leases` N—1 `rooms`; `leases` 1—N `payments`; `rooms` 1—N `maintenance_requests`.
Tables and columns use the proposal's snake_case names. See the **ER Diagram** page or
`server/prisma/sql/ddl.sql`.

## Useful commands

```bash
npm run db:up                         # start Postgres
npm run db:down                       # stop Postgres
npm --prefix server run seed          # re-seed sample data
npm --prefix server run prisma:studio # open Prisma Studio (raw DB editor)
npm --prefix client run build         # production build of the client
```

## Troubleshooting

- **Port 5432 in use / auth failed** — a local PostgreSQL is already on 5432. The container is
  mapped to **5433** to avoid this; `DATABASE_URL` already points at 5433.
- **Port 5173 in use** — Vite auto-selects the next free port and prints it.
- **`docker compose` not found** — ensure Docker Desktop is running.

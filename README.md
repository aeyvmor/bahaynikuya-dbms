# Bahay ni Kuya - Boarding House Management System

Full-stack boarding house management app for Bahay ni Kuya: React/Vite client,
Express API, Prisma ORM, and PostgreSQL.

## Fresh Windows Setup

On a fresh Windows computer, run one file:

```text
START-HERE.bat
```

The script will:

- install Node.js LTS if it is missing
- install PostgreSQL 16 if it is missing
- create the `bnk` database user and `bahay_ni_kuya_db` database
- create `server/.env`
- install root, server, and client dependencies
- generate Prisma Client, apply migrations, and seed sample data if the database is empty
- start the API and web client, then open the browser

Approve the Windows admin prompt when asked. The first run can take a few
minutes, especially while PostgreSQL installs.

After setup, use this to start the app again:

```text
RUN-APP.bat
```

## Default URLs and Login

| Thing | Value |
| --- | --- |
| Web app | http://localhost:5173 |
| API | http://localhost:4000 |
| PostgreSQL | localhost:5432 |
| Database | `bahay_ni_kuya_db` |
| DB user / password | `bnk` / `bnk_password` |
| Admin login | `admin@bahaynikuya.com` / `admin123` |
| Staff login | `staff@bahaynikuya.com` / `staff123` |

## Developer Commands

If Node and PostgreSQL are already installed:

```bash
npm run setup
npm run dev
```

Useful commands:

```bash
npm run install:all                  # install exact locked dependencies
npm run db:setup                     # generate Prisma, migrate, seed if empty
npm run db:reset                     # replace current data with sample data
npm --prefix server run prisma:studio
npm --prefix client run build
```

## Troubleshooting

- `winget was not found`: install "App Installer" from the Microsoft Store, then rerun `START-HERE.bat`.
- `postgres password is wrong`: if this PC already had PostgreSQL installed, update the existing `postgres` password or create the app role/database manually with pgAdmin/psql.
- `port 4000` or `port 5173` is already in use: close the other app using that port, then rerun the script.
- Database role/login errors: rerun `START-HERE.bat`; it repairs the app role/database when it can authenticate as `postgres`.

## Project Structure

```text
.
|-- START-HERE.bat          # one-click first setup and run
|-- RUN-APP.bat             # run after setup
|-- setup-and-run.ps1       # shared setup/run implementation
|-- server/                 # Express + Prisma API
|   |-- prisma/
|   |-- src/
|-- client/                 # Vite + React UI
|   |-- src/
```

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Vite, React, TypeScript, Tailwind CSS, TanStack Query/Table, React Flow |
| Backend | Node.js, Express, TypeScript, Prisma, Zod |
| Database | PostgreSQL 16 |

# RideLink

RideLink is a full-stack ride-hailing application for passengers, drivers, and administrators. It brings together ride requests and trip status, driver onboarding and vehicle management, and operational tools in a web application backed by a REST API.

The repository contains a NestJS and Prisma backend, a React and Vite frontend, and a Docker Compose configuration for local PostgreSQL development.

## Capabilities

- Passenger, driver, and administrator accounts with JWT authentication and role-based authorization
- Driver onboarding and verification, including vehicle management
- Ride requests and trip lifecycle management with pickup and destination coordinates
- Administrative views for driver, user, and ride operations
- Map support and Socket.IO client integration in the frontend
- OpenAPI documentation for the backend API

## Technology

| Area | Technologies |
| --- | --- |
| Backend | NestJS, TypeScript, Prisma, PostgreSQL, Passport, JWT, Swagger/OpenAPI |
| Frontend | React, TypeScript, Vite, Tailwind CSS, React Router, Zustand, TanStack Query, Leaflet |
| Local infrastructure | Docker Compose, PostgreSQL, pgAdmin |

## Repository layout

```text
.
├── Frontend/          # React web application
├── prisma/            # Prisma schema, migrations, and seed script
├── src/               # NestJS API modules
├── test/              # End-to-end tests
├── .env.example       # Backend environment variable template
└── docker-compose.yml # Local PostgreSQL and pgAdmin services
```

## Requirements

- Node.js 18 or later and npm
- Docker with the Docker Compose plugin

## Local development

### 1. Get the code and install dependencies

```bash
git clone https://github.com/shambel96/RideLink.git
cd RideLink
npm install
cd Frontend
npm install
cd ..
```

### 2. Configure the backend

Create a local environment file from the provided template:

```bash
cp .env.example .env
```

Review the values in `.env`. The template is intended for local development. Use unique, securely generated secrets and environment-specific values outside a local environment. Do not commit `.env` or production credentials.

The frontend defaults to `http://localhost:3000/api/v1`. To use a different API URL, set `VITE_API_BASE_URL` in `Frontend/.env` before starting or building the frontend. The optional `VITE_WS_URL` setting controls the Socket.IO server URL.

### 3. Start PostgreSQL

```bash
docker compose up -d postgres
```

The Compose configuration exposes PostgreSQL on port `5432`. The backend database URL in `.env` must match the local database credentials and database name configured in `docker-compose.yml`.

To start the optional pgAdmin service as well, run `docker compose up -d` instead. It is available at `http://localhost:5050` with the local credentials defined in the Compose file. These credentials are for local development only.

### 4. Apply migrations and optionally seed local data

```bash
npx prisma generate
npx prisma migrate deploy
```

To populate the local database with sample records, run:

```bash
npm run seed
```

The seed script creates development accounts and sample ride data. Keep seeded data and credentials confined to local development; review `prisma/seed.ts` for the current fixtures.

### 5. Start the services

In one terminal, start the API:

```bash
npm run start:dev
```

In another terminal, start the frontend:

```bash
cd Frontend
npm run dev
```

The application is available at `http://localhost:5173`. The API base URL is `http://localhost:3000/api/v1`, and interactive API documentation is at `http://localhost:3000/api/docs`.

## Configuration

Backend settings are documented in `.env.example`:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `PORT` | API server port (defaults to `3000`) |
| `CORS_ORIGIN` | Allowed frontend origin |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | JWT signing secrets |
| `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN` | Token lifetimes |
| `FARE_CURRENCY`, `FARE_BASE_RATE`, `FARE_PER_KM` | Currency and fare calculation settings |

The frontend accepts `VITE_API_BASE_URL` and the optional `VITE_WS_URL` at build or development time.

## Available commands

### Backend (repository root)

| Command | Description |
| --- | --- |
| `npm run start` | Start the API |
| `npm run start:dev` | Start the API in watch mode |
| `npm run start:prod` | Start the compiled API from `dist` |
| `npm run build` | Build the backend |
| `npm run lint` | Run ESLint (also applies fixes) |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run seed` | Insert development seed data |

### Frontend (`Frontend/`)

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and build the frontend |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run Oxlint |

## Production deployment

This repository provides local development infrastructure and application code; deployment infrastructure and operational policies must be configured for the target environment. Before deploying, configure strong secrets through a secret manager, set the production database and frontend URLs, restrict CORS to trusted origins, terminate traffic over HTTPS, and establish database backups, logging, monitoring, and access controls. Apply committed database migrations as part of the release process and do not use development seed data in production.

## Contributing

Contributions should include a focused change, an informative commit message, and updates to documentation when behavior or setup changes. For larger changes, open an issue or discussion first so the proposed approach can be reviewed.

## License

The repository is marked `UNLICENSED` and does not currently include a public license. Contact the project owner for usage and distribution terms.

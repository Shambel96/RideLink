# RideLink

RideLink is a full-stack ride-hailing platform designed for passengers, drivers, and administrators. It supports ride requests, real-time driver assignment, vehicle management, JWT-based authentication, and role-based access across a modern monorepo application.

The project combines a NestJS backend, a React + Vite frontend, Prisma ORM, PostgreSQL, and Docker-based local infrastructure to deliver a scalable and maintainable ride-sharing platform.

## Overview

RideLink provides three core user journeys:

- Passengers can sign up, log in, request rides, and track trip progress.
- Drivers can register profiles, manage vehicles, accept requests, and update ride status.
- Administrators can review driver onboarding, oversee operations, and monitor system activity.

## Features

- Secure authentication and authorization with JWT access and refresh tokens
- Role-based access control for passenger, driver, and admin roles
- Driver registration and verification workflow
- Vehicle management for registered drivers
- Ride lifecycle management from request to completion
- Geolocation-aware trip flow with pickup and destination coordinates
- Admin dashboard for overview, user management, and ride monitoring
- Responsive frontend built with React, Vite, and Tailwind CSS
- OpenAPI/Swagger API documentation
- Local development setup using Docker and PostgreSQL

## Tech Stack

### Backend

- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- Passport + JWT authentication
- Swagger/OpenAPI

### Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Zustand
- Leaflet map support
- Socket-based real-time interaction support

### Infrastructure

- Docker Compose
- PostgreSQL container
- PgAdmin container

## Project Structure

```text
RideLink/
├── Frontend/                  # React frontend for the app
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── ...
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts               # Seed data for demo accounts
│   └── migrations/
├── src/                      # NestJS backend
│   ├── admin/
│   ├── auth/
│   ├── common/
│   ├── config/
│   ├── driver/
│   ├── prisma/
│   ├── ride/
│   ├── user/
│   ├── vehicle/
│   ├── app.module.ts
│   ├── main.ts
│   └── ...
├── test/
├── .env.example              # Environment template
├── docker-compose.yml
├── package.json
├── tsconfig.json
├── nest-cli.json
├── .gitignore
├── README.md
└── ...
```

## Prerequisites

Before running the application, make sure you have:

- Node.js 18 or later
- npm
- Docker and Docker Compose
- PostgreSQL client tools if you want to inspect the database manually

## Environment Setup

Create a `.env` file in the project root using the values from `.env.example`:

```env
DATABASE_URL="postgresql://postgres:1234@localhost:5432/ride_link?schema=public"
PORT=3000
CORS_ORIGIN="http://localhost:5173"
JWT_ACCESS_SECRET="your-access-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
FARE_CURRENCY="ETB"
FARE_BASE_RATE="15"
FARE_PER_KM="8"
```

> This project provides safe defaults for local development, but production deployments should use secure secrets and environment-specific configuration.

## Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/shambel96/RideLink.git
cd RideLink
```

### 2. Install dependencies

```bash
npm install
cd Frontend && npm install && cd ..
```

### 3. Start the database with Docker

```bash
docker compose up -d
```

This starts:

- PostgreSQL on port 5432
- PgAdmin on port 5050

### 4. Configure environment variables

```bash
cp .env.example .env
```

### 5. Generate Prisma client and apply migrations

```bash
npx prisma generate
npx prisma migrate dev --name init
```

If the database already exists, you can sync schema changes with:

```bash
npx prisma migrate deploy
```

### 6. Seed demo data

```bash
npm run seed
```

This creates sample users for testing, including admin, passenger, approved driver, and pending driver accounts.

## Running the Application

### Backend

```bash
npm run start:dev
```

The backend is available at:

- API base: http://localhost:3000/api/v1
- Swagger UI: http://localhost:3000/api/docs

### Frontend

```bash
cd Frontend
npm run dev
```

The frontend runs at:

- http://localhost:5173

## Default Demo Accounts

The seeded demo accounts are:

```text
Admin:           admin@ridelink.com       / Admin@1234
Passenger 1:     abebe@example.com        / Passenger@123
Passenger 2:     tigist@example.com       / Passenger@123
Driver (approved): kebede.driver@example.com / Driver@1234
Driver (pending):  selam.driver@example.com / Driver@1234
```

## API Documentation

Swagger/OpenAPI documentation is available at:

```text
http://localhost:3000/api/docs
```

The API includes endpoints for:

- Authentication
- Users
- Drivers
- Vehicles
- Rides
- Admin operations

## Available Scripts

### Root project

```bash
npm run start           # Start the NestJS app
npm run start:dev       # Start in watch mode
npm run start:debug     # Start in debug mode
npm run build           # Build the backend
npm run test            # Run Jest tests
npm run test:e2e       # Run end-to-end tests
npm run lint           # Lint the project
npm run seed           # Seed database demo data
```

### Frontend

```bash
cd Frontend
npm run dev            # Start the Vite frontend
npm run build          # Build the frontend for production
npm run preview        # Preview the production build
npm run lint           # Lint frontend files
```

## Contribution Guidelines

Contributions are welcome. Please follow a clean and consistent workflow:

### 1. Create a feature branch

```bash
git checkout -b feature/driver-verification-flow
```

### 2. Make focused changes

Keep commits small and meaningful. Update documentation whenever behavior changes.

### 3. Use conventional commit messages

Use the standard format below:

```bash
git add .
git commit -m "feat: add driver verification dashboard"
```

Typical commit types include:

- `feat`: new feature
- `fix`: bug fix
- `docs`: documentation update
- `refactor`: code cleanup without behavior change
- `chore`: maintenance tasks

### 4. Push and open a pull request

```bash
git push origin feature/driver-verification-flow
```

Include a clear summary of the change, why it was needed, and any migration or setup notes in the PR description.

## Production Notes

For deployment, consider:

- using environment-specific secrets instead of local defaults
- securing JWT signing keys and refresh token configuration
- using a managed PostgreSQL service in production
- enabling HTTPS and restricting CORS appropriately
- configuring backups, monitoring, and logging
- validating rate limiting and request throttling for public routes

## License

This project is currently configured for internal or project-specific use and does not include a public license declaration.

## License

This project is currently configured as a private application and does not include a public license file.

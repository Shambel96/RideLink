# RideLink

Author: Shambel Bekele

RideLink is a full-stack ride-hailing platform designed for passengers, drivers, and administrators. The system supports ride requests, driver registration and verification, live location-aware trip workflows, vehicle management, and role-based dashboards across a modern web application.

The project combines a NestJS backend, a React + Vite frontend, Prisma ORM, PostgreSQL, and Docker-based local infrastructure to deliver a production-ready monorepo architecture for a ride-sharing business.

## Overview

RideLink provides a role-based mobility platform with three core user experiences:

- Passengers can register, log in, request rides, track trip status, and review ride history.
- Drivers can register their profile, add vehicles, set availability, accept trip requests, and manage active rides.
- Administrators can review driver verification, manage user activity, and monitor ride operations.

## Key Features

- Secure authentication and authorization with JWT access and refresh tokens
- Role-based access control for passenger, driver, and admin flows
- Driver registration and verification workflow with approval/rejection states
- Vehicle management for registered drivers
- Ride request lifecycle from request to completion
- Geographic trip data with pickup and destination coordinates
- Admin dashboard for overview, users, drivers, and rides
- Real-time client-side interaction patterns for ride and driver lifecycle operations
- Responsive single-page frontend experience built with React and Tailwind CSS
- API documentation via Swagger/OpenAPI

## Tech Stack

### Backend

- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT authentication
- Swagger API documentation

### Frontend

- React 19
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Zustand for client state
- React Query for data fetching
- Leaflet + map-based UI support
- Socket.IO client for live communication

### DevOps / Local Infrastructure

- Docker Compose
- PostgreSQL container
- PgAdmin container

## Project Structure

```text
RideLink/
├── Frontend/                  # React frontend application
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── ...
├── prisma/
│   ├── schema.prisma          # Database schema and enums
│   ├── seed.ts               # Demo seed data
│   └── migrations/
├── src/                       # NestJS application
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
├── docker-compose.yml
├── package.json
├── tsconfig.json
├── nest-cli.json
├── .gitignore
├── README.md
└── ...
```

## System Design Highlights

### Role Model

The application supports three user roles:

- PASSENGER
- DRIVER
- ADMIN

### Core Domain Entities

- User
- Driver
- Vehicle
- Ride
- RefreshToken

### Ride Workflow

A ride progresses through states such as:

- REQUESTED
- SEARCHING
- DRIVER_ASSIGNED
- DRIVER_ARRIVED
- IN_PROGRESS
- COMPLETED
- CANCELLED

### Driver Lifecycle

Drivers can move through onboarding and verification states:

- PENDING
- APPROVED
- REJECTED
- SUSPENDED

## Prerequisites

Before running the project, make sure you have installed:

- Node.js 18+ or newer
- npm
- Docker and Docker Compose
- PostgreSQL client tools (optional, if you prefer manual DB inspection)

## Environment Configuration

Create a root environment file in the project root with the required variables:

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

> The application also supports a default fallback for many values if env vars are not set, but production deployments should always use explicit secrets and secure configuration values.

## Local Setup for New Developers

If you are cloning this project from GitHub, follow these steps exactly:

### 1. Clone the repository

```bash
git clone https://github.com/shambel96/RideLink.git
cd RideLink
```

### 2. Install project dependencies

```bash
npm install
cd Frontend && npm install && cd ..
```

### 3. Start the database

```bash
docker compose up -d
```

This starts:

- PostgreSQL on port 5432
- PgAdmin on port 5050

### 4. Configure environment variables

Create a `.env` file in the project root with:

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

### 5. Generate Prisma client and apply schema

```bash
npx prisma generate
npx prisma migrate dev --name init
```

If the database already exists and you only want to sync the schema, use:

```bash
npx prisma migrate deploy
```

### 6. Seed demo data

```bash
npm run seed
```

This creates sample users for login and testing, including an admin, passengers, approved driver, and pending driver.

## Running the Application

### Backend

```bash
npm run start:dev
```

The backend runs at:

- API base: http://localhost:3000/api/v1
- Swagger docs: http://localhost:3000/api/docs

### Frontend

```bash
cd Frontend
npm run dev
```

The frontend runs at:

- http://localhost:5173

## Quick Start Summary

For a developer cloning the repo for the first time, the recommended flow is:

```bash
git clone https://github.com/shambel96/RideLink.git
cd RideLink
npm install
cd Frontend && npm install && cd ..
cp .env.example .env
# or create a .env file with the values shown above
docker compose up -d
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run start:dev
```

Then in a second terminal:

```bash
cd Frontend
npm run dev
```

## Default Demo Accounts

The seeded credentials are:

```text
Admin:           admin@ridelink.com      / Admin@1234
Passenger 1:     abebe@example.com       / Passenger@123
Passenger 2:     tigist@example.com      / Passenger@123
Driver (approved): kebede.driver@example.com / Driver@1234
Driver (pending):  selam.driver@example.com / Driver@1234
```

## API Documentation

The backend exposes Swagger/OpenAPI documentation at:

```text
http://localhost:3000/api/docs
```

This includes documented endpoints for:

- Authentication
- Users
- Drivers
- Vehicles
- Rides
- Admin operations

## Common Commands

### Root project

```bash
npm run start           # Start NestJS in normal mode
npm run start:dev       # Start NestJS in watch mode
npm run start:debug     # Start in debug mode
npm run build           # Build the backend
npm run test            # Run Jest tests
npm run test:e2e       # Run end-to-end tests
npm run lint           # Lint project files
npm run seed           # Seed database with demo data
```

### Frontend

```bash
cd Frontend
npm run dev            # Start Vite dev server
npm run build          # Production build
npm run preview        # Preview production build
npm run lint           # Lint frontend project
```

## Contributing

Contributions are welcome. To contribute to this project professionally and consistently:

### 1. Fork or clone the repository

```bash
git clone https://github.com/shambel96/RideLink.git
cd RideLink
```

### 2. Create a dedicated branch

Use a descriptive branch name for the work you are doing:

```bash
git checkout -b feature/driver-verification-flow
```

Examples:

- `feature/add-payment-flow`
- `bugfix/fix-ride-status-update`
- `refactor/frontend-dashboard-layout`

### 3. Make your changes

Keep commits focused and clear. A good commit message should describe the effect of the change.

```bash
git add .
git commit -m "feat: add driver verification dashboard"
```

### 4. Push your branch

```bash
git push origin feature/driver-verification-flow
```

### 5. Open a pull request

Create a pull request from your branch into the main project branch and include:

- a clear summary of the change
- what problem it solves
- screenshots or notes if the UI changed
- any setup or migration considerations

### Contribution guidelines

- keep code clean and readable
- follow the existing project structure
- update documentation when behavior changes
- test relevant functionality before submitting
- avoid committing debug code or secrets

## Production Notes

For production deployment, consider:

- using environment-specific secrets instead of hardcoded values
- securing JWT signing keys and refresh token configuration
- enabling production-grade database credentials and backups
- configuring reverse proxy, HTTPS, and CORS constraints
- using a managed PostgreSQL service instead of the local Docker database
- validating rate limiting and request throttling for public endpoints

## License

This project is currently configured as a private application and does not include a public license file.

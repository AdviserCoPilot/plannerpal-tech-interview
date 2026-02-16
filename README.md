# Atlas Academy

EdTech class scheduler for after-school programs.

## Prerequisites

- Git
- Docker + Docker Compose
- Modern browser

## Quick Start

```bash
git clone https://github.com/8thlight/atlas-interview-starter.git atlas-academy
cd atlas-academy
cp .env.example .env
docker compose up --build
```

## URLs

| Service | URL |
|---------|-----|
| Web | http://localhost:3001 |
| API | http://localhost:4000 |

## Run Tests

```bash
# Frontend (58 tests)
cd web && npm test

# Or inside Docker
docker compose exec web npm test
```

## Architecture

- **Web** (Next.js / React / Tailwind): Class browsing, registration, admin view
- **API** (Node / Express / TypeScript): REST API for classes and registrations
- **DB** (PostgreSQL): Classes, parents, registrations

## Views

- **Classes**: Register/cancel for classes as a selected parent
- **Admin View**: See all registrations across all classes

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /classes | List all classes with spot counts |
| GET | /classes/:id | Single class details |
| GET | /registrations?parentId= | Registrations for a parent |
| GET | /registrations/all | All registrations (admin) |
| POST | /registrations | Register (body: `{ classId, parentId }`) |
| DELETE | /registrations/:id | Cancel registration |
| GET | /parents | List all parents |

## Seed Data

- 7 parents (Alice, Bob, Carol, Dan, Eva, Frank, Grace)
- 3 classes (Piano, Chess, Art & Crafts)
- Piano starts full (2/2 registered)

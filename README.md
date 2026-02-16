# Atlas Academy

EdTech class scheduler with **waitlist** support. When classes are full, parents join the waitlist instead of churning. Cancellations automatically promote the next person.

## Prerequisites

- Git
- Docker + Docker Compose
- Modern browser

## Quick Start

```bash
git clone <REPO_URL> atlas-academy
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
docker compose exec api npm test
```

## Architecture

- **Web** (Next.js): Class browsing, registration, waitlist UI
- **API** (Node/Express/TypeScript): REST API for classes, registrations, waitlist
- **DB** (PostgreSQL): Classes, parents, registrations, waitlist

## Waitlist Flow

1. **Register**: If class has capacity → register. If full → add to waitlist.
2. **Cancel**: When someone cancels → next person on waitlist is promoted to registered.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /classes | List all classes |
| GET | /classes/:id | Class details |
| POST | /registrations | Register (body: `{ classId, parentId }`) |
| DELETE | /registrations/:id | Cancel registration |
| GET | /waitlist/:classId | List waitlist for a class |

## Seed Data

- 3 parents (Alice, Bob, Carol)
- 3 classes (Piano, Chess, Art)
- Piano is full with 2 registered, 1 on waitlist

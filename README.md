# Atlas Academy

EdTech class scheduler for after-school programs. This is a starter repo for a pairing exercise -- pick your language and go.

## Prerequisites

**Docker (recommended):** Just need Git, Docker, and a modern browser.

| Dependency | Minimum Version | Notes |
|------------|----------------|-------|
| Docker Engine | 20.10+ | Or Docker Desktop 4.0+ |
| Docker Compose | V2 (2.0+) | Use `docker compose` (space), not the legacy `docker-compose` (hyphen) |

> **Why V2?** The compose files use `depends_on: condition: service_healthy` and the Compose Specification format (no `version:` key). These won't work with Compose V1. Check your version with `docker compose version`.

**Local development:** To run tests or develop outside Docker, you'll also need:

| Project | Requirement |
|---------|-------------|
| TypeScript API | Node.js 22+ |
| Python API | Python 3.12+ |
| Java API | JDK 21 (toolchain pinned; Gradle auto-downloads if missing) |
| .NET API | .NET 9 SDK |
| Ruby API | Ruby 3.3.x (any patch) |
| Frontend | Node.js 20+ |
| Database | PostgreSQL 16 (or use Docker for just the DB) |

## Quick Start

```bash
git clone https://github.com/8thlight/atlas-interview-starter.git atlas-academy
cd atlas-academy
cp .env.example .env
```

### Pick your language:

**TypeScript:**
```bash
docker compose -f docker-compose.typescript.yml up --build
```

**Python/FastAPI:**
```bash
docker compose -f docker-compose.python.yml up --build
```

**Java/Spring Boot:**
```bash
docker compose -f docker-compose.java.yml up --build
```

**C#/.NET:**
```bash
docker compose -f docker-compose.dotnet.yml up --build
```

**Ruby/Rails:**
```bash
docker compose -f docker-compose.ruby.yml up --build
```

## URLs

| Service | URL |
|---------|-----|
| Web | http://localhost:3001 |
| API | http://localhost:4000 |

## Run Tests

**TypeScript:**
```bash
cd api/typescript && npm install && npm test
```

**Python:**
```bash
cd api/python && pip install ".[dev]" && pytest
```

**Java:**
```bash
cd api/java && ./gradlew test
```

**C#/.NET:**
```bash
cd api/dotnet && dotnet test
```

**Ruby/Rails:**
```bash
cd api/ruby && bundle install && bundle exec rspec
```
Or, if you don't have Ruby installed locally:
```bash
docker compose -f docker-compose.ruby.yml run --rm api bundle exec rspec
```

**Frontend:**
```bash
cd web && npm install && npm test
```

## Architecture

- **Web**: Next.js 14, React 18, Tailwind CSS 3, Vite/Vitest
- **API**: REST API for classes and registrations (pick one -- all expose the same endpoints)
- **DB**: PostgreSQL 16

| Stack | Framework | ORM / Query | Migrations | Test Framework |
|-------|-----------|-------------|------------|----------------|
| TypeScript | Express 4.18 | Knex 3.1 + pg | Knex | Vitest + Supertest |
| Python | FastAPI 0.115 | psycopg2 2.9 | Alembic | pytest + httpx |
| Java | Spring Boot 3.4.3 | Spring Data JPA | Flyway | JUnit 5 + Spring Test |
| C#/.NET | ASP.NET Core 9 | EF Core 9 + Npgsql | DbUp | xUnit + NSubstitute |
| Ruby | Rails 7.1 (API) | ActiveRecord | ActiveRecord migrations | RSpec |

## Project Structure

```
├── api/
│   ├── typescript/    # Express 4, Knex, pg (Node 22)
│   ├── python/        # FastAPI, psycopg2, Alembic (Python 3.12)
│   ├── java/          # Spring Boot 3.4, Flyway (JDK 21, Gradle 8.14)
│   ├── dotnet/        # ASP.NET Core 9, EF Core, DbUp (.NET 9)
│   └── ruby/          # Rails 7.1 API-only, ActiveRecord (Ruby 3.3)
├── web/               # Next.js 14, React 18 (Node 20)
├── docker-compose.typescript.yml
├── docker-compose.python.yml
├── docker-compose.java.yml
├── docker-compose.dotnet.yml
└── docker-compose.ruby.yml
```

## Views

- **Classes**: Register/cancel for classes as a selected parent
- **Admin View**: See all registrations across all classes

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Health check |
| GET | /classes | List all classes with spot counts |
| GET | /classes/:id | Single class details |
| GET | /parents | List all parents |
| GET | /registrations?parentId= | Registrations for a parent |
| GET | /registrations/all | All registrations (admin) |
| POST | /registrations | Register (`{ classId, parentId }`) |
| DELETE | /registrations/:id | Cancel registration |

## Seed Data

- 7 parents (Alice, Bob, Carol, Dan, Eva, Frank, Grace)
- 3 classes (Piano, Chess, Art & Crafts)
- Piano starts full (2/2 registered)

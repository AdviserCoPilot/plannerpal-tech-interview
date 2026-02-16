# Atlas Academy

EdTech class scheduler for after-school programs. This is a starter repo for a pairing exercise -- pick your language and go.

## Prerequisites

- Git
- Docker + Docker Compose
- Modern browser

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

**Python/Flask:**
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

**Java (requires JDK 21+):**
```bash
cd api/java && ./gradlew test
```

**C#/.NET (requires .NET 9 SDK):**
```bash
cd api/dotnet && dotnet test
```

**Frontend (58 tests):**
```bash
cd web && npm install && npm test
```

## Architecture

- **Web** (Next.js / React / Tailwind): Class browsing, registration, admin view
- **API**: REST API for classes and registrations (TypeScript, Python, Java, or C# -- same endpoints)
- **DB** (PostgreSQL): Classes, parents, registrations

## Project Structure

```
├── api/
│   ├── typescript/    # Express + TypeScript API
│   ├── python/        # Flask API
│   ├── java/          # Spring Boot API (Java 21, Gradle)
│   └── dotnet/        # ASP.NET Core API (.NET 9)
├── web/               # Next.js frontend
├── db/
│   └── init.sql       # Schema + seed data
├── docker-compose.typescript.yml
├── docker-compose.python.yml
├── docker-compose.java.yml
└── docker-compose.dotnet.yml
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

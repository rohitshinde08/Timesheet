# TimeStamp

Full-stack application with React (Vite) frontend, FastAPI backend, and PostgreSQL database.

## Tech Stack

| Layer        | Technology              |
|--------------|-------------------------|
| Frontend     | React 18, Vite, Node 20 |
| Backend      | Python 3.11, FastAPI    |
| Database     | PostgreSQL 16           |
| Containers   | Docker, Docker Compose  |

## Quick Start

```bash
docker compose up --build
```

| Service   | URL                        |
|-----------|----------------------------|
| Frontend  | http://localhost:5173       |
| Backend   | http://localhost:8000       |
| API Docs  | http://localhost:8000/docs  |
| Health    | http://localhost:8000/health|
| Postgres  | localhost:5432              |

## Local Development (with hot-reload)

```bash
docker compose -f docker-compose.yaml -f docker-compose.local.yaml up --build
```

## Project Structure

```
TimeStamp/
├── docker-compose.yaml
├── docker-compose.local.yaml
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── core/          # Config, settings, constants
│       ├── middleware/     # Custom middleware
│       ├── database/      # DB connection & session
│       ├── models/        # SQLAlchemy models
│       ├── routes/        # API route handlers
│       ├── schemas/       # Pydantic schemas
│       ├── services/      # Business logic layer
│       ├── utils/         # Helper utilities
│       └── main.py        # FastAPI app entry point
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── assets/        # Static assets
│       ├── components/    # Reusable components
│       ├── pages/         # Role-based page views
│       │   ├── admin/
│       │   ├── hr/
│       │   ├── manager/
│       │   └── employee/
│       ├── layouts/       # Layout wrappers
│       ├── utils/         # Frontend utilities
│       ├── App.jsx
│       └── main.jsx
```

## Database Credentials (Development)

| Key       | Value           |
|-----------|-----------------|
| User      | timestamp_user  |
| Password  | timestamp_pass  |
| Database  | timestamp_db    |
| Host      | localhost       |
| Port      | 5432            |

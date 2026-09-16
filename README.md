# Client Operations Portal

A full-stack operations management platform for organizing client relationships, projects, meetings, and delivery workflows.

## Stack
- Angular 20 standalone SPA
- Express.js REST API
- MySQL 8
- Reactive Forms
- Gherkin/BDD feature specification

## Structure

```text
client-operations-portal/
├── frontend/                 # Angular SPA
├── backend/                  # Express + MySQL API
├── database/schema.sql       # Database schema + seed data
├── tests/features/           # Gherkin acceptance scenarios
└── .gitignore
```

## 1. Database

Create the database and seed records:

```bash
mysql -u root -p < database/schema.sql
```

## 2. Backend

```bash
cd backend
cp .env.example .env
npm install
# Edit .env with your MySQL credentials
npm run dev
```

API runs at `http://localhost:3000`.

## 3. Frontend

```bash
cd frontend
npm install
npm start
```

Open `http://localhost:4200`.

## API

- `GET /health`
- `GET /clients`
- `POST /clients`
- `GET /projects`
- `POST /projects`
- `GET /meetings`
- `POST /meetings`
- `DELETE /meetings/:id`

The meeting endpoint rejects past dates server-side. Client email and required fields are validated on both client and server.

## Production build

```bash
cd frontend
npm run build
```

The generated Angular output is under `dist/client-operations-portal/browser`.

> `node_modules`, Angular cache, build output and `.env` are intentionally excluded from the zip.

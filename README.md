 BillForge AI
 ============

BillForge AI is a multi-tenant fintech SaaS billing automation platform inspired by products like Stripe and InvoiceCloud.
It provides subscription billing, invoice management, Stripe-based payments, AI-powered late payment risk predictions, and analytics dashboards.

 ** 🔗 Live Demo:**
  
 ` https://bill-forge-ai-98x.vercel.app `
 

## Architecture

- **frontend**: Next.js (App Router) + TypeScript + TailwindCSS + Framer Motion + React Query + Axios
- **backend**: Node.js + Express + TypeScript + PostgreSQL + Prisma ORM + Stripe integration + JWT auth
- **ai-service**: FastAPI + Python + scikit-learn for late payment risk prediction
- **infra**: Docker, Docker Compose, Prometheus, Grafana, GitHub Actions CI

## Services

- **Landing Website** with pricing and marketing pages
- **Authentication Service** with JWT, bcrypt, and multi-tenant company support
- **Billing & Payment Services** with invoices, payments, and Stripe subscriptions
- **AI Prediction Service** for late payment risk scoring
- **Analytics Service** for revenue, invoices, and risk summary
- **Notification Service** (email stub) for invoice lifecycle events

## Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Python 3.10+

### Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Then edit `.env` and fill in the values:

- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- `DATABASE_URL`
- `JWT_SECRET`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `FRONTEND_URL`, `BACKEND_URL`, `AI_SERVICE_URL`

### Run with Docker

From the project root:

```bash
docker-compose up --build
```

This will start:

- `frontend` (Next.js)
- `backend` (Express/Node)
- `ai-service` (FastAPI)
- `postgres` (database)
- `prometheus` and `grafana` for monitoring

### Local Development (without Docker)

1. Install dependencies for each service:

```bash
cd frontend && npm install
cd ../backend && npm install
cd ../ai-service && pip install -r requirements.txt
```

2. Start PostgreSQL locally and ensure `DATABASE_URL` is set.

3. Run Prisma migrations:

```bash
cd backend
npx prisma migrate dev
```

4. Start services:

```bash
cd backend && npm run dev
cd ../ai-service && uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
cd ../frontend && npm run dev
```

## Deployment

- **Frontend**: Deploy `frontend` to Vercel, configure environment variables and `BACKEND_URL`.
- **Backend**: Deploy `backend` container to Render or AWS (ECS/EKS) with PostgreSQL and AI service reachable.
- **AI Service**: Deploy `ai-service` container next to backend (same network/VPC).

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`) will:

- Install dependencies
- Run linting and type checks
- Build Docker images


If you like the repo please give it a STAR !!!

   -- BillForge AI : Built for engineers to ENGINEER --

# AI Task Processing Platform

[![Next.js](https://img.shields.io/badge/Frontend-Next.js_16-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js_20-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Worker-Python_3.11-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB_Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Redis](https://img.shields.io/badge/Queue-Redis_+_BullMQ-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Containers-Docker-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Kubernetes](https://img.shields.io/badge/Orchestration-Kubernetes-326CE5?logo=kubernetes&logoColor=white)](https://kubernetes.io/)
[![Argo CD](https://img.shields.io/badge/GitOps-Argo_CD-EF7B4D?logo=argo&logoColor=white)](https://argo-cd.readthedocs.io/)
[![GitHub Actions](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?logo=github-actions&logoColor=white)](https://github.com/features/actions)
[![License](https://img.shields.io/badge/License-MIT-black.svg)](#license)

## 🚀 Introduction

AI Task Processing Platform is a distributed asynchronous task processing system designed with production-style architecture patterns. It allows users to register, authenticate with JWT, submit text transformation tasks, track background execution, and inspect task outputs and logs through a modern web UI.

This project demonstrates how to build a clean full-stack platform with:

- a modern TypeScript frontend
- a Node.js API layer
- a Redis-backed asynchronous queue
- a Python worker service
- MongoDB persistence
- containerized local development
- cloud-native deployment patterns with Kubernetes, Argo CD, and GitHub Actions

The current supported task operations are:

- `uppercase`
- `lowercase`
- `reverse`
- `wordcount`

## ✨ Features

- JWT-based user registration and login
- Modern Next.js dashboard for task creation and monitoring
- Asynchronous task submission through Redis and BullMQ
- Python background worker for non-blocking execution
- Task lifecycle tracking: `pending -> running -> success/failed`
- Execution logs persisted with each task
- Retry support for failed tasks
- Edit and delete support for completed tasks
- Responsive UI with Tailwind CSS, ShadCN UI, Sonner, Zustand, and React Query
- Dockerized services for local development
- Production deployment guidance for Kubernetes, Argo CD, and GitHub Actions

## 🧭 System Architecture Overview

The platform follows a distributed async processing model:

1. The user interacts with the Next.js frontend.
2. The frontend sends authenticated requests to the Express backend.
3. The backend validates the request, stores task metadata in MongoDB, and pushes a job into Redis using BullMQ.
4. The Python worker consumes jobs asynchronously from Redis.
5. The worker updates task state in MongoDB as processing progresses.
6. The frontend polls task state and renders status, logs, and results in near real time.

## 🛠 Tech Stack

| Layer | Technology | Purpose |
| --- | --- | --- |
| Frontend | Next.js, TypeScript, Tailwind CSS, ShadCN UI | Dashboard, auth, task management UI |
| Client State | Zustand, React Query, Axios | Auth persistence, API calls, query caching |
| Backend API | Node.js, Express.js | Authentication, task CRUD, queue publishing |
| Queue | Redis, BullMQ | Background job orchestration and retries |
| Worker | Python | Async task execution |
| Database | MongoDB Atlas | Users, tasks, logs, task status |
| Containers | Docker, Docker Compose | Service packaging and local orchestration |
| Orchestration | Kubernetes, k3s-compatible | Production workloads and scaling |
| GitOps | Argo CD | Declarative deployment sync |
| CI/CD | GitHub Actions | Build, test, image publish, deploy automation |

## 📁 Folder Structure

```text
.
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── queue/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── providers/
│   │   ├── services/
│   │   ├── store/
│   │   └── types/
│   ├── Dockerfile
│   └── package.json
├── worker/
│   ├── worker.py
│   ├── queue_handler.py
│   ├── processor.py
│   ├── db.py
│   ├── redis_client.py
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## 🧱 Architecture Diagram

```text
+-------------+       HTTP/JWT       +-------------------+
|  Frontend   | -------------------> |  Backend API      |
|  Next.js    |                      |  Node + Express   |
+-------------+                      +---------+---------+
                                               |
                                               | Create task + enqueue
                                               v
                                      +-------------------+
                                      | Redis + BullMQ    |
                                      | Job Queue         |
                                      +---------+---------+
                                                |
                                                | Consume job
                                                v
                                      +-------------------+
                                      | Python Worker     |
                                      | Async Processor   |
                                      +---------+---------+
                                                |
                                                | Update task status/result/logs
                                                v
                                      +-------------------+
                                      | MongoDB Atlas     |
                                      | Users + Tasks     |
                                      +-------------------+
```

## 🔄 Async Task Processing

The API does not perform the task transformation directly in the request-response cycle. Instead:

- the backend creates the task record with `pending` status
- the backend pushes a queue job to BullMQ
- the API responds immediately to the client
- the worker processes the task in the background
- MongoDB is updated as the task progresses

This keeps the API responsive, avoids request timeouts, and makes horizontal scaling of workers straightforward.

## 📬 Queue Processing

The queue is used as the handoff boundary between the synchronous web layer and the asynchronous execution layer.

Key queue behaviors in this project:

- task creation persists metadata first
- BullMQ publishes a Redis job containing the `taskId`
- the worker fetches the job payload from Redis
- the worker loads the task from MongoDB
- the worker updates the status to `running`
- the worker executes the transformation
- the worker stores the result and marks the task `success`
- if an error occurs, the task can eventually be marked failed after retries

## 🟥 Redis + BullMQ

Redis acts as the in-memory transport layer for queued jobs, and BullMQ adds job semantics such as:

- retries
- exponential backoff
- failure handling
- queue naming and isolation
- retention of completed and failed jobs

Current BullMQ defaults configured in the backend:

```js
defaultJobOptions: {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 2000,
  },
  removeOnComplete: 100,
  removeOnFail: 500,
}
```

## ⚙️ Worker Scaling

The Python worker is intentionally separated from the API so it can be scaled independently.

Scaling guidance:

- scale `backend` for request throughput
- scale `worker` for task throughput
- keep Redis highly available or managed
- use queue depth, processing latency, and retry rate to drive autoscaling

For example:

- 2 API replicas handle login and task submission
- 5 worker replicas handle background execution
- HPA increases worker replicas when Redis queue lag grows

## 🐳 Docker Architecture

The repository ships with a Docker-based local runtime:

- `frontend` runs the Next.js application
- `backend` runs the Express API
- `worker` runs the Python async processor
- `redis` runs the queue broker

### Docker Compose Flow

```text
docker-compose up
  ├── frontend:3000
  ├── backend:5000
  ├── worker
  └── redis:6379
```

### Docker Multi-Stage Build Explanation

The frontend and backend Dockerfiles use multi-stage patterns to separate build and runtime concerns.

Benefits:

- smaller production images
- reduced attack surface
- cleaner dependency boundaries
- faster layer reuse in CI/CD

Example pattern:

1. `builder` stage installs dependencies and builds artifacts
2. `runtime` stage copies only what is required to run

## 🔐 Non-Root Container Security

Each service container uses a non-root user:

- `appuser` is created during image build
- the runtime switches away from root before service startup

Why this matters:

- reduces blast radius if a process is compromised
- aligns with Kubernetes Pod Security Standards
- is considered a baseline production hardening practice

## ☸️ Kubernetes Deployment

This repository is application-focused and does not currently include in-repo Kubernetes manifests. In production, deploy it using an infrastructure repository or a `k8s/` directory with manifests or Helm charts.

Typical workloads:

| Component | Kubernetes Resource |
| --- | --- |
| Frontend | Deployment + Service + Ingress |
| Backend | Deployment + Service + Ingress/Internal Service |
| Worker | Deployment |
| Redis | Managed Redis or StatefulSet |
| MongoDB Atlas | External managed database |

### Recommended Kubernetes Objects

- `Deployment` for frontend, backend, worker
- `Service` for frontend/backend
- `Ingress` for public routing
- `ConfigMap` for non-sensitive configuration
- `Secret` for credentials and tokens
- `HorizontalPodAutoscaler` for backend and worker
- `NetworkPolicy` for service-to-service restrictions

### Kubernetes Probe Guidance

Use probes to keep workloads healthy:

- `startupProbe`: useful for slow booting services
- `livenessProbe`: restarts stuck containers
- `readinessProbe`: prevents traffic before app is ready

Example backend probe snippet:

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 5000
  initialDelaySeconds: 10
  periodSeconds: 15

readinessProbe:
  httpGet:
    path: /health
    port: 5000
  initialDelaySeconds: 5
  periodSeconds: 10
```

### ConfigMaps and Secrets

Store configuration using:

- `ConfigMap` for ports, service hosts, public URLs
- `Secret` for `JWT_SECRET`, `MONGO_URI`, Redis auth, registry credentials

Never commit production secrets into Git.

## 🔁 Argo CD GitOps Workflow

Argo CD continuously reconciles the cluster to match Git.

Recommended GitOps model:

```text
App Repository
  └── source code
        ↓ CI builds image
Container Registry
  └── versioned images
        ↓ image tag updated
Infrastructure Repository
  └── Kubernetes manifests / Helm values
        ↓ Argo CD sync
Kubernetes Cluster
```

Typical flow:

1. Developer merges to `main`
2. GitHub Actions builds and pushes container images
3. CI updates image tags in infra repo
4. Argo CD detects changes
5. Argo CD syncs manifests to k3s or Kubernetes

## 🔄 CI/CD Workflow

GitHub Actions should automate:

- linting and type checks
- frontend production build
- backend install and smoke tests
- Docker image builds
- image publishing to a registry
- manifest update or deploy trigger

Example workflow stages:

```text
pull_request
  ├── install
  ├── lint
  ├── build
  └── optional tests

push main
  ├── build frontend image
  ├── build backend image
  ├── build worker image
  ├── push images
  └── update infra repo / trigger Argo CD sync
```

## 🛡️ Security Implementation

Current security foundations in the codebase:

- JWT authentication for protected routes
- password hashing with `bcryptjs`
- route protection middleware
- `helmet` for secure HTTP headers
- `express-rate-limit` for basic abuse control
- Docker non-root users

Recommended production additions:

- refresh token rotation
- stricter CORS policy
- audit logging
- Redis authentication and TLS
- secret rotation via vault or cloud secret manager
- WAF and edge rate limiting

## 🗃️ Database Indexing Strategy

Current task indexes:

```js
taskSchema.index({ status: 1 });
taskSchema.index({ userId: 1 });
taskSchema.index({ createdAt: -1 });
```

These support:

- filtering by user
- status-based task inspection
- newest-first task listing

Recommended future indexes:

- `{ userId: 1, createdAt: -1 }`
- `{ userId: 1, status: 1, createdAt: -1 }`
- unique index on `users.email`

## 🚨 Handling Redis Failures

Redis is a critical dependency in this architecture. If Redis is unavailable:

- the backend cannot enqueue new tasks
- workers cannot pull jobs
- queue-backed task processing pauses

Recommended handling strategy:

- fail fast on enqueue errors
- return actionable API errors to the UI
- emit alerts on Redis connection failures
- use managed Redis with persistence and failover
- add circuit-breaking and retry logic around queue interactions

## 📈 High Volume Handling Strategy (100k Tasks/Day)

To support high volume safely:

- scale workers horizontally
- keep API stateless for easy replication
- move Redis to managed HA infrastructure
- use MongoDB Atlas autoscaling and connection pooling
- batch observability events and centralize logs
- add queue-depth monitoring and autoscaling policies

Capacity considerations for `100k tasks/day`:

- average tasks per second is modest, but bursts matter
- queue lag is a more important signal than daily total
- worker concurrency and retry storms must be controlled
- index efficiency becomes increasingly important

Recommended production upgrades:

- BullMQ worker concurrency tuning
- dead-letter queue dashboards
- autoscaling based on queue depth
- separate read/write MongoDB patterns if needed

## ♻️ Retry Strategy and Dead-Letter Queue

Current queue behavior includes:

- `attempts: 3`
- exponential backoff starting at `2000ms`

Worker-side logic also retries queue job execution before moving to a dead-letter queue.

Dead-letter queue purpose:

- isolate permanently failing jobs
- avoid blocking healthy throughput
- preserve failure diagnostics for analysis

In production, expose dead-letter metrics to dashboards and alerts.

## 🌍 Environment Variables

### Frontend

Create `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Backend

Create `backend/.env`:

```bash
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<db>?retryWrites=true&w=majority
JWT_SECRET=replace_with_a_strong_secret
JWT_EXPIRES_IN=7d
REDIS_HOST=redis
REDIS_PORT=6379
```

### Worker

Create `worker/.env`:

```bash
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<db>?retryWrites=true&w=majority
REDIS_HOST=redis
REDIS_PORT=6379
```

## 💻 Local Development Setup

### Prerequisites

- Node.js 20+
- npm
- Python 3.11+
- Redis
- MongoDB Atlas connection string

### 1. Clone the repository

```bash
git clone https://github.com/your-username/ai-task-processing-platform.git
cd ai-task-processing-platform
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
cd ..
```

### 3. Install backend dependencies

```bash
cd backend
npm install
cd ..
```

### 4. Install worker dependencies

```bash
cd worker
python -m venv .venv

# macOS / Linux
source .venv/bin/activate

# Windows PowerShell
# .\.venv\Scripts\Activate.ps1

pip install -r requirements.txt
cd ..
```

### 5. Start services

Terminal 1:

```bash
cd backend
npm run dev
```

Terminal 2:

```bash
cd frontend
npm run dev
```

Terminal 3:

```bash
cd worker
python worker.py
```

### 6. Open the app

```text
Frontend: http://localhost:3000
Backend:  http://localhost:5000
```

## 🐳 Docker Setup Instructions

### Build images manually

```bash
docker build -t ai-task-frontend ./frontend
docker build -t ai-task-backend ./backend
docker build -t ai-task-worker ./worker
```

### Run containers manually

```bash
docker network create taskai-net

docker run -d --name redis --network taskai-net -p 6379:6379 redis:7-alpine

docker run -d --name backend --network taskai-net -p 5000:5000 --env-file ./backend/.env ai-task-backend

docker run -d --name worker --network taskai-net --env-file ./worker/.env ai-task-worker

docker run -d --name frontend --network taskai-net -p 3000:3000 --env-file ./frontend/.env.local ai-task-frontend
```

## 🧩 Docker Compose Setup

This repository already includes a `docker-compose.yml`.

### Start the full stack

```bash
docker compose up --build
```

### Run in detached mode

```bash
docker compose up -d --build
```

### Stop the stack

```bash
docker compose down
```

### View logs

```bash
docker compose logs -f
```

## ☸️ Kubernetes Deployment Commands

These commands assume manifests exist in an infra repository or `k8s/` directory.

```bash
kubectl create namespace ai-task-platform

kubectl apply -n ai-task-platform -f k8s/configmap.yaml
kubectl apply -n ai-task-platform -f k8s/secrets.yaml
kubectl apply -n ai-task-platform -f k8s/frontend-deployment.yaml
kubectl apply -n ai-task-platform -f k8s/backend-deployment.yaml
kubectl apply -n ai-task-platform -f k8s/worker-deployment.yaml
kubectl apply -n ai-task-platform -f k8s/ingress.yaml
```

Check rollout status:

```bash
kubectl rollout status deployment/frontend -n ai-task-platform
kubectl rollout status deployment/backend -n ai-task-platform
kubectl rollout status deployment/worker -n ai-task-platform
```

Scale workers manually:

```bash
kubectl scale deployment/worker --replicas=5 -n ai-task-platform
```

## 🔁 Argo CD Setup Commands

Install Argo CD:

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

Expose the Argo CD server:

```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

Login:

```bash
argocd login localhost:8080
```

Create an application:

```bash
argocd app create ai-task-platform \
  --repo https://github.com/your-org/ai-task-platform-infra.git \
  --path environments/dev \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace ai-task-platform
```

Sync it:

```bash
argocd app sync ai-task-platform
argocd app get ai-task-platform
```

## 🤖 GitHub Actions CI/CD

Recommended pipeline responsibilities:

| Stage | Action |
| --- | --- |
| Validate | Install dependencies, lint frontend, validate backend scripts |
| Build | Build Next.js frontend and Docker images |
| Package | Push versioned images to registry |
| Release | Update infra repo or deployment manifests |
| Deploy | Argo CD syncs target cluster |

Example triggers:

- `pull_request` for validation
- `push` to `main` for image publishing
- optional `workflow_dispatch` for controlled releases

## 📚 API Documentation

Base URL:

```text
http://localhost:5000/api
```

Authentication uses:

```http
Authorization: Bearer <jwt-token>
```

### Authentication Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Authenticate and receive JWT |

#### Register

```http
POST /api/auth/register
Content-Type: application/json
```

```json
{
  "name": "Ashish Jha",
  "email": "ashish@example.com",
  "password": "securePassword123"
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "email": "ashish@example.com",
  "password": "securePassword123"
}
```

### Task Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/tasks` | Create a task |
| GET | `/tasks` | List current user's tasks |
| GET | `/tasks/:id` | Get task details |
| PUT | `/tasks/:id` | Edit a completed task and requeue it |
| DELETE | `/tasks/:id` | Delete a completed task |

#### Create Task

```http
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "title": "Convert paragraph to uppercase",
  "input": "hello world from task platform",
  "operation": "uppercase"
}
```

#### Example Task Response

```json
{
  "statusCode": 201,
  "message": "Task created successfully",
  "success": true,
  "data": {
    "_id": "6820b7ce1b2c3d4e5f678901",
    "title": "Convert paragraph to uppercase",
    "input": "hello world from task platform",
    "operation": "uppercase",
    "status": "pending",
    "result": null,
    "logs": [],
    "userId": "681faf0d1b2c3d4e5f678900",
    "createdAt": "2026-05-09T12:30:00.000Z",
    "updatedAt": "2026-05-09T12:30:00.000Z"
  }
}
```

## 🖼️ Screenshots

Add project screenshots here:

- `docs/screenshots/login.png`
- `docs/screenshots/register.png`
- `docs/screenshots/dashboard.png`
- `docs/screenshots/task-list.png`
- `docs/screenshots/task-details.png`

Suggested README snippet:

```md
![Login Screen](docs/screenshots/login.png)
![Dashboard](docs/screenshots/dashboard.png)
```

## 🔮 Future Improvements

- add real AI/LLM-backed operations beyond text transforms
- introduce refresh tokens and session revocation
- add WebSocket or SSE updates instead of polling
- add OpenTelemetry tracing
- add queue dashboard and admin controls
- support scheduled tasks and priorities
- support tenant isolation and RBAC
- move worker execution to configurable concurrency pools

## ✅ Production Best Practices

- run workloads as non-root
- use managed MongoDB Atlas and managed Redis
- enable HTTPS end to end
- separate environments: dev, staging, production
- enforce least-privilege IAM for CI/CD
- store secrets outside the repo
- add backup and restore procedures
- configure autoscaling for workers
- centralize logs and metrics
- use health probes and graceful shutdowns

## 📊 Monitoring and Logging Suggestions

Recommended production observability stack:

- Prometheus for metrics
- Grafana for dashboards
- Loki or ELK/OpenSearch for logs
- Sentry for frontend/backend error tracking
- OpenTelemetry for traces

Key metrics to watch:

- queue depth
- task processing latency
- failure rate
- retry count
- backend request latency
- MongoDB slow queries
- Redis connection health

## 🌐 Deployment URLs

Replace these placeholders with your actual environments:

| Environment | URL |
| --- | --- |
| Frontend | `https://app.example.com` |
| Backend API | `https://api.example.com` |
| Argo CD | `https://argocd.example.com` |
| Grafana | `https://grafana.example.com` |

## 🏗️ Infrastructure Repository

Recommended structure:

- application code lives in this repository
- Kubernetes manifests, Helm values, and environment overlays live in a dedicated infra repository

Example:

```text
ai-task-processing-platform
ai-task-processing-platform-infra
```

If you prefer a mono-repo deployment strategy, add:

```text
k8s/
helm/
argocd/
```

to this repository and point Argo CD to those paths.

## 👨‍💻 Author

**Ashish Jha**

- GitHub: `https://github.com/your-username`
- LinkedIn: `https://linkedin.com/in/your-profile`

## 📄 License

This project is licensed under the MIT License.

You can replace this section with your preferred license once finalized.

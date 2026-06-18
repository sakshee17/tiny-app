# CI/CD Setup Guide — tiny-app (Azure DevOps)

## Overview

This project uses **Azure DevOps Pipelines** with **Docker Hub** and **Azure App Service** for a fully automated CI/CD workflow across 3 branches and 5 environments.

## Branch → Environment Map

```
feature/*  ──→  Dev     (CI only — lint + test + docker build, no push)
release    ──→  QA      (auto)
           ──→  UAT     (auto after QA)
main       ──→  Stage   (⚠️  manual approval)
           ──→  Prod    (⚠️  manual approval)
```

## Pipeline Files

| File | Triggered by | Description |
|---|---|---|
| `pipelines/pr-validation.yml` | PR → `release` or `main` | Lint + Test + Docker Build + Trivy |
| `pipelines/ci-dev.yml` | Push to `feature/*` | Lint + Test + Docker Build (no push) |
| `pipelines/ci-cd-release.yml` | Push to `release` | CI → QA → UAT |
| `pipelines/ci-cd-main.yml` | Push to `main` | CI → Stage (approval) → Prod (approval) |

## Reusable Templates

| Template | Purpose |
|---|---|
| `templates/steps-lint.yml` | Run ESLint |
| `templates/steps-test.yml` | Run unit tests (vitest / jest) |
| `templates/steps-security-scan.yml` | Trivy container image scan |
| `templates/steps-docker-build-push.yml` | Docker build (and optionally push) |
| `templates/steps-appservice-deploy.yml` | Deploy container to Azure App Service |

---

## One-Time Azure DevOps Setup

### Step 1 — Variable Groups (Library)

Go to **Pipelines → Library → + Variable group** and create:

**`docker-hub-credentials`**
| Variable | Value | Secret? |
|---|---|---|
| `DOCKER_USERNAME` | your Docker Hub username | No |
| `DOCKER_PASSWORD` | your Docker Hub password/token | ✅ Yes |

### Step 2 — Service Connections

Go to **Project Settings → Service connections → New service connection**

1. **Docker Hub connection**
   - Type: Docker Registry → Docker Hub
   - Name: `docker-hub-connection` ← must match exactly

2. **Azure connection**
   - Type: Azure Resource Manager → Service Principal
   - Name: `azure-service-connection` ← must match exactly
   - Scope: your subscription / resource group

### Step 3 — ADO Environments (for deployment tracking + approvals)

Go to **Pipelines → Environments → New environment**

Create all 5 environments:
- `qa` — no approval needed
- `uat` — no approval needed  
- `stage` — **add approval check** (Approvals and checks → + Approvals)
- `prod` — **add approval check** (Approvals and checks → + Approvals)

### Step 4 — Azure App Services

Pre-create 8 Azure App Services (Web App for Containers):

| Name | Environment | Service |
|---|---|---|
| `tiny-app-qa-fe` | QA | Frontend |
| `tiny-app-qa-be` | QA | Backend |
| `tiny-app-uat-fe` | UAT | Frontend |
| `tiny-app-uat-be` | UAT | Backend |
| `tiny-app-stage-fe` | Stage | Frontend |
| `tiny-app-stage-be` | Stage | Backend |
| `tiny-app-prod-fe` | Prod | Frontend |
| `tiny-app-prod-be` | Prod | Backend |

### Step 5 — Create Pipelines in Azure DevOps

Go to **Pipelines → New pipeline → GitHub → select repo → Existing Azure Pipelines YAML file**

Create 4 pipelines, one per YAML file:
1. `PR Validation` → `.azure/pipelines/pr-validation.yml`
2. `CI — Dev` → `.azure/pipelines/ci-dev.yml`
3. `CI/CD — Release` → `.azure/pipelines/ci-cd-release.yml`
4. `CI/CD — Main` → `.azure/pipelines/ci-cd-main.yml`

For each pipeline, link the `docker-hub-credentials` variable group under **Variables → Variable groups**.

---

## Local Development

```bash
# Start both frontend and backend with hot-reload
docker-compose up --build

# Frontend: http://localhost:5174
# Backend:  http://localhost:3000
```

## Image Tagging Convention

| Branch | Tag format | Example |
|---|---|---|
| `feature/*` | `dev-{BuildId}` (local, not pushed) | `dev-42` |
| PR | `pr-{PR#}-{BuildId}` (local, not pushed) | `pr-7-42` |
| `release` | `release-{BuildId}` | `release-42` |
| `main` | `prod-{BuildId}` | `prod-42` |

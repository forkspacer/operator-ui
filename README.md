# Forkspacer Operator UI

A modern, React-based web interface for managing and monitoring the Forkspacer Kubernetes operator. This UI provides an intuitive dashboard for interacting with the Forkspacer operator and its managed resources.

[![License](https://img.shields.io/github/license/forkspacer/operator-ui)](LICENSE)
[![CI](https://github.com/forkspacer/operator-ui/workflows/CI/badge.svg)](https://github.com/forkspacer/operator-ui/actions)
[![Release](https://img.shields.io/github/v/release/forkspacer/operator-ui)](https://github.com/forkspacer/operator-ui/releases)

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Installation](#installation)
  - [Using Docker](#using-docker)
  - [Using Kubernetes](#using-kubernetes)
  - [Using Helm](#using-helm)
- [Development](#development)
  - [Prerequisites](#prerequisites)
  - [Local Setup](#local-setup)
  - [Available Scripts](#available-scripts)
  - [Building for Production](#building-for-production)
- [CI/CD Pipeline](#cicd-pipeline)
  - [Workflow Overview](#workflow-overview)
  - [Release Process](#release-process)
- [Contributing](#contributing)
  - [Contributor License Agreement](#contributor-license-agreement)
  - [Development Workflow](#development-workflow)
- [Deployment](#deployment)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Overview

The Forkspacer Operator UI is part of the Forkspacer ecosystem, which consists of three main components:

1. **Forkspacer Operator** - Core Kubernetes operator that manages custom resources
2. **API Server** - Backend API service for business logic and data management
3. **Operator UI** (this repository) - Frontend dashboard for user interaction

This UI communicates with the API Server to provide a user-friendly interface for managing Forkspacer resources.

---

## Architecture

```
┌─────────────────────────────────────────────┐
│           Kubernetes Cluster                │
│                                             │
│  ┌──────────────┐      ┌──────────────┐     │
│  │  Forkspacer  │◄────►│  API Server  │     │
│  │   Operator   │      │  (Backend)   │     │
│  │  (watches    │      │  (REST API)  │     │
│  │   CRDs)      │      └──────┬───────┘     │
│  └──────────────┘             │             │
│                               │             │
│                      ┌────────▼───────┐     │
│                      │  Operator UI   │◄────┼─── Users
│                      │   (Frontend)   │     │
│                      │   (Nginx)      │     │
│                      └────────────────┘     │
└─────────────────────────────────────────────┘
```

---

## Features

- 🎯 **Dashboard** - Overview of operator resources and status
- 📊 **Resource Management** - Create, update, and delete Forkspacer resources
- 🔍 **Real-time Monitoring** - Live updates of resource states
- 🎨 **Modern UI** - Built with React and TypeScript
- 🔐 **Secure** - Integrates with Kubernetes RBAC
- 📱 **Responsive** - Works on desktop and mobile devices
- 📦 **Module Management** - Deploy and configure modules (Helm charts, databases, services)

---

## What are Modules?

Modules are the core resources managed by the Forkspacer operator. A Module represents a deployable component (typically a Helm chart) with configurable parameters, resource constraints, and outputs.

### Example Module: Redis

Here's an example of a Redis module that the UI helps you manage:

```yaml
apiVersion: batch.forkspacer.com/v1
kind: Module
metadata:
  name: redis
  namespace: default
spec:
  source:
    raw:
      kind: Helm
      metadata:
        name: redis
        version: "1.0.0"
        supportedOperatorVersion: ">= 0.0.0, < 1.0.0"
        author: "platform-team"
        description: "Redis in-memory data store"
        category: "database"
        resource_usage:
          cpu: "200m"
          memory: "256Mi"

      config:
        - type: option
          name: "Redis Version"
          alias: "version"
          spec:
            editable: true
            required: false
            default: "21.2.9"
            values:
              - "21.2.9"
              - "21.2.7"
              - "21.2.6"

        - type: integer
          name: "Replica Count"
          alias: "replicaCount"
          spec:
            editable: true
            required: false
            default: 1
            min: 0
            max: 5

      spec:
        namespace: default
        repo: https://charts.bitnami.com/bitnami
        chartName: redis
        version: "{{.config.version}}"

        values:
          - file: https://example.com/values.yaml
          - raw:
              replica:
                replicaCount: "{{.config.replicaCount}}"

        outputs:
          - name: "Redis Hostname"
            value: "redis-master.default"
          - name: "Redis Username"
            value: "default"
          - name: "Redis Password"
            valueFrom:
              secret:
                name: "{{.releaseName}}"
                key: redis-password
                namespace: default
          - name: "Redis Port"
            value: 6379

        cleanup:
          removeNamespace: false
          removePVCs: true

  workspace:
    name: default
    namespace: default

  config:
    version: 21.2.7
    replicaCount: 1
```

### Module Components Explained

**Metadata:**

- `name`: Module identifier
- `category`: Classification (database, monitoring, storage, etc.)
- `description`: Human-readable description
- `resource_usage`: Expected CPU/memory consumption

**Config:**

- Dynamic form fields rendered in the UI
- Types: `option`, `integer`, `string`, `boolean`
- Each config item has validation rules (required, min/max, values)
- UI auto-generates forms based on config definitions

**Spec:**

- `repo`: Helm repository URL
- `chartName`: Helm chart name
- `version`: Chart version (supports templating)
- `values`: Helm values (from file, raw YAML, or ConfigMap)

**Outputs:**

- Connection information exposed after deployment
- Can reference static values or Kubernetes secrets
- Displayed in the UI for easy access

**Workspace:**

- Associates the module with a workspace
- Enables multi-tenancy and resource isolation

### UI Capabilities for Modules

The Operator UI provides:

1. **Module Catalog** - Browse available modules by category
2. **Visual Form Builder** - Auto-generated forms based on config schema
3. **Deployment Wizard** - Step-by-step module deployment
4. **Live Status** - Real-time health and status monitoring
5. **Output Viewer** - Easy access to connection strings, credentials
6. **Version Management** - Update module versions with one click
7. **Configuration Editor** - Modify module settings post-deployment

---

## Installation

### Using Docker

Pull and run the latest image:

```bash
docker pull ghcr.io/forkspacer/operator-ui:latest
docker run -p 8080:80 ghcr.io/forkspacer/operator-ui:latest
```

Access the UI at `http://localhost:8080`

### Using Kubernetes

Deploy directly to your cluster:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: operator-ui
  namespace: forkspacer-system
spec:
  replicas: 1
  selector:
    matchLabels:
      app: operator-ui
  template:
    metadata:
      labels:
        app: operator-ui
    spec:
      containers:
        - name: operator-ui
          image: ghcr.io/forkspacer/operator-ui:v0.1.0
          ports:
            - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: operator-ui
  namespace: forkspacer-system
spec:
  selector:
    app: operator-ui
  ports:
    - port: 80
      targetPort: 80
  type: ClusterIP
```

Apply the manifest:

```bash
kubectl apply -f operator-ui.yaml
```

Access via port-forward:

```bash
kubectl port-forward -n forkspacer-system svc/operator-ui 8080:80
```

### Using Helm

The Operator UI is included in the unified Forkspacer Helm chart:

```bash
helm repo add forkspacer https://forkspacer.github.io/charts
helm repo update

helm install forkspacer forkspacer/forkspacer \
  --set operator.enabled=true \
  --set apiServer.enabled=true \
  --set operatorUI.enabled=true \
  --namespace forkspacer-system \
  --create-namespace
```

**Helm Configuration Options:**

```yaml
operatorUI:
  enabled: true
  image:
    repository: ghcr.io/forkspacer/operator-ui
    tag: v0.1.0
    pullPolicy: IfNotPresent
  replicas: 1
  service:
    type: ClusterIP
    port: 80
  ingress:
    enabled: false
    className: nginx
    hosts:
      - host: forkspacer-ui.example.com
        paths:
          - path: /
            pathType: Prefix
```

---

## Development

### Prerequisites

- **Node.js** 18.x or later
- **npm** 9.x or later
- **Docker** (for building images)

### Local Setup

1. **Clone the repository:**

```bash
git clone https://github.com/forkspacer/operator-ui.git
cd operator-ui
```

2. **Install dependencies:**

```bash
npm install
```

3. **Start the development server:**

```bash
# Using make (recommended for local development)
make dev

# Or directly with npm (requires setting API URL)
REACT_APP_API_BASE_URL=http://localhost:8421 npm start
```

The app will open at `http://localhost:3000` with hot-reloading enabled. The `make dev` command automatically sets the API URL environment variable for connecting to local api-server.

### Available Scripts

#### `npm start`

Runs the app in development mode with hot-reloading.

#### `npm test`

Launches the test runner in interactive watch mode.

```bash
# Run tests once
npm test -- --watchAll=false

# Run tests with coverage
npm test -- --coverage --watchAll=false
```

#### `npm run build`

Builds the app for production to the `build/` folder. Optimizes for best performance.

#### `npm run lint`

Runs ESLint to check code quality (if configured).

### Building for Production

#### Local Build

```bash
npm run build
```

Output in `build/` directory.

#### Docker Build

```bash
# Default build (uses relative paths /api/v1 - for production with ingress)
docker build -t operator-ui:local .

# Build with custom API URL (for standalone deployments)
docker build --build-arg REACT_APP_API_BASE_URL=http://your-api-server:8421 -t operator-ui:local .

# Run the container
docker run -p 8080:80 operator-ui:local
```

---

## CI/CD Pipeline

### Workflow Overview

The project uses GitHub Actions for automated CI/CD with three main workflows:

#### 1. **CLA Workflow** (`cla.yml`)

- **Trigger:** Pull request events and issue comments
- **Purpose:** Ensures contributors have signed the Contributor License Agreement
- **Actions:**
  - Checks CLA signature status
  - Comments on PRs with instructions if not signed
  - Updates status checks

#### 2. **CI Workflow** (`ci.yml`)

- **Trigger:** Pull requests and pushes to `main` branch
- **Purpose:** Validates code quality and builds
- **Jobs:**
  - **Lint** - Runs code linting
  - **Test** - Executes unit tests with coverage
  - **Build** - Builds production bundle
  - **Docker Build** - Verifies Dockerfile builds (no push)

**Important:** This workflow does NOT publish Docker images. It only verifies that the build succeeds.

#### 3. **Release Workflow** (`release.yml`)

- **Trigger:** Git tags matching `v*` pattern (e.g., `v0.1.0`, `v1.2.3`)
- **Purpose:** Builds and publishes Docker images to GitHub Container Registry
- **Jobs:**
  - Extracts version from tag
  - Builds production bundle
  - Builds Docker image
  - Pushes two tags:
    - `ghcr.io/forkspacer/operator-ui:v0.1.0` (versioned)
    - `ghcr.io/forkspacer/operator-ui:latest` (always newest)
  - Creates GitHub Release with notes

### Release Process

#### Semantic Versioning

We follow [Semantic Versioning](https://semver.org/):

```
v0.1.0  → Initial release (pre-production)
v0.1.1  → Patch: bug fixes
v0.2.0  → Minor: new features, backwards compatible
v1.0.0  → Major: first stable release or breaking changes
```

#### Creating a Release

1. **Ensure your branch is up to date:**

```bash
git checkout main
git pull origin main
```

2. **Create and push a version tag:**

```bash
# For initial release
git tag v0.1.0

# Or for subsequent releases
git tag v0.1.1

# Push the tag to GitHub
git push origin v0.1.0
```

3. **Automated process begins:**

```
Tag pushed to GitHub
    ↓
Release workflow triggered
    ↓
Build React app
    ↓
Build Docker image
    ↓
Push to GitHub Container Registry:
  - ghcr.io/forkspacer/operator-ui:v0.1.0
  - ghcr.io/forkspacer/operator-ui:latest
    ↓
Create GitHub Release page
```

4. **Verify the release:**

- Check [GitHub Actions](https://github.com/forkspacer/operator-ui/actions) for workflow status
- View [Releases](https://github.com/forkspacer/operator-ui/releases) page
- Verify image in [Packages](https://github.com/orgs/forkspacer/packages)

5. **Test the published image:**

```bash
docker pull ghcr.io/forkspacer/operator-ui:v0.1.0
docker run -p 8080:80 ghcr.io/forkspacer/operator-ui:v0.1.0
```

#### Version Bumping Guidelines

**Patch version (v0.1.0 → v0.1.1):**

- Bug fixes
- Security patches
- Documentation updates
- Performance improvements (no API changes)

**Minor version (v0.1.1 → v0.2.0):**

- New features
- New UI components
- API additions (backwards compatible)

**Major version (v0.9.0 → v1.0.0):**

- First stable production release
- Breaking API changes
- Major architectural changes

---

## Contributing

We welcome contributions! Please follow these guidelines:

### Contributor License Agreement

All contributors must sign the Contributor License Agreement (CLA) before their pull requests can be merged. The CLA Assistant bot will automatically comment on your PR with instructions.

**To sign the CLA:**

1. Read the [CLA document](CLA.md)
2. Comment on your PR: `I have read the CLA Document and I hereby sign the CLA`

The CLA status check will update automatically.

### Development Workflow

1. **Fork the repository**

2. **Create a feature branch:**

```bash
git checkout -b feature/my-new-feature
```

3. **Make your changes and commit:**

```bash
git add .
git commit -m "feat: add new dashboard widget"
```

4. **Push to your fork:**

```bash
git push origin feature/my-new-feature
```

5. **Open a Pull Request:**
   - Ensure all CI checks pass
   - Sign the CLA if prompted
   - Request review from maintainers

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: resolve bug in component
docs: update README
test: add unit tests
chore: update dependencies
```

### Code Style

- Follow existing code patterns
- Write tests for new features
- Ensure `npm test` passes
- Keep components small and focused

---

## Deployment

### Production Deployment

The UI is deployed as a static site served by Nginx. The Docker image is built with a multi-stage Dockerfile:

1. **Builder stage:** Builds React app with Node.js
2. **Production stage:** Serves static files with Nginx

### Environment Variables

Configure the UI by setting environment variables at build time:

```dockerfile
# Example: Custom API endpoint
ENV REACT_APP_API_URL=https://api.forkspacer.example.com
```

Rebuild the image to apply changes.

### Ingress Configuration

To expose the UI externally, configure an Ingress:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: operator-ui-ingress
  namespace: forkspacer-system
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - forkspacer-ui.example.com
      secretName: operator-ui-tls
  rules:
    - host: forkspacer-ui.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: operator-ui
                port:
                  number: 80
```

---

## Configuration

### API Server Connection

Configure the API server endpoint in `src/config.ts`:

```typescript
export const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8080";
```

### Custom Nginx Configuration

To customize Nginx behavior, create a custom config and rebuild:

```nginx
# nginx.conf
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy (optional)
    location /api {
        proxy_pass http://api-server:8080;
        proxy_set_header Host $host;
    }
}
```

Update Dockerfile:

```dockerfile
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

---

## Troubleshooting

### Common Issues

**Issue: UI shows blank page**

- Check browser console for errors
- Verify API server is accessible
- Check CORS configuration on API server

**Issue: Docker build fails**

```bash
# Clear Docker cache and rebuild
docker build --no-cache -t operator-ui:test .
```

**Issue: CI workflow fails on PR**

- Ensure tests pass locally: `npm test -- --watchAll=false`
- Check for linting errors
- Verify Dockerfile builds locally

**Issue: Image not appearing in registry after tag push**

- Check GitHub Actions workflow status
- Verify tag follows `v*` pattern
- Check repository permissions for GITHUB_TOKEN

### Debug Mode

Run the container with debug logging:

```bash
docker run -p 8080:80 \
  -e NGINX_DEBUG=1 \
  ghcr.io/forkspacer/operator-ui:latest
```

### Logs

View container logs:

```bash
# Docker
docker logs <container-id>

# Kubernetes
kubectl logs -n forkspacer-system deployment/operator-ui
```

---

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

---

## Support

- **Documentation:** [https://forkspacer.github.io/docs](https://forkspacer.github.io/docs)
- **Issues:** [GitHub Issues](https://github.com/forkspacer/operator-ui/issues)
- **Discussions:** [GitHub Discussions](https://github.com/forkspacer/operator-ui/discussions)

---

## Acknowledgments

Built with:

- [React](https://reactjs.org/) - UI framework
- [Create React App](https://create-react-app.dev/) - Build tooling
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Nginx](https://nginx.org/) - Web server
- [GitHub Actions](https://github.com/features/actions) - CI/CD

---

**Made with ❤️ by the Forkspacer team**

# AGENTS.md - Glad Meadow 975 Deployment Contract

This repository follows the **see.io deployment contract**. The following requirements must be met for successful deployment:

## Required Files

1. **Dockerfile** (at project root)
   - Builds an image serving plain HTTP on port 8080
   - No TLS (platform terminates it)
   - Python 3.12-slim base image
   - Installs dependencies from requirements.txt
   - Copies app files (app.py, templates/, static/)
   - Initializes /data directory for persistent storage

2. **seeio.json** (at project root)
   ```json
   {"name": "Glad Meadow 975", "healthcheck": "/health"}
   ```
   - `name`: Human-readable site name
   - `healthcheck`: Path that must return HTTP 200 when container is up

3. **app.py** (Flask web application)
   - Serves on 0.0.0.0:8080
   - Implements `/health` endpoint returning "ok" with status 200
   - Implements `/` endpoint serving the home page
   - Implements `/api/messages` for message persistence
   - Initializes /data on first boot

## Persistence

- All stateful data (databases, uploads, caches) must live under `/data`
- /data is the ONLY path that survives deploys and rollbacks
- App must initialize /data on first boot (directory starts empty)
- Currently storing:
  - `visitors.json`: Visitor count and last visit timestamp
  - `messages.json`: User-submitted messages with timestamps

## Deployment Loop

1. **Pull** latest changes:
   ```bash
   git pull --rebase
   ```

2. **Make changes** and commit:
   ```bash
   git add -A && git commit -m "<description>"
   ```

3. **Push** to see.io repository:
   ```bash
   git push origin main
   ```

4. **Poll** status until deployment settles:
   ```bash
   curl -sS https://see.io/api/v1/agent/status \
     -H "Authorization: Bearer <token>"
   ```

5. **Check response**:
   - `state: "live"`: Site is deployed and serving at `site_url`
   - `state: "verifying"`: see.io is reviewing the commit; keep polling
   - `state: "deploy_failed"`: Review deploy logs, fix issues, push again
   - Other states: Keep polling (usually short duration)

## Rules

- Only commits to `main` branch are deployed
- Force pushes to `main` are rejected; use revert commits instead
- Do not push while state is "verifying"
- If push is refused because main moved, pull with `--rebase` and push again
- Max 100 MB per push (git only access method)
- Do not commit secrets; token should never appear in repo history
- Token is scoped to this site only and can be revoked from see.io dashboard
- Leave AGENTS.md in place; see.io rewrites it on each build session

## Current Features

- **Home Page**: Welcome page with visitor counter and message section
- **Message Board**: Users can post and view messages (persisted in /data)
- **Health Check**: `/health` endpoint for deployment verification
- **Stats API**: `/api/stats` endpoint returns visitor count, message count, data directory info
- **Responsive Design**: Works on mobile and desktop browsers
- **Persistent Storage**: All data survives container restarts and rollbacks

## Application Stack

- **Framework**: Flask 3.0.3
- **Language**: Python 3.12
- **Port**: 8080
- **Healthcheck Path**: /health
- **Data Directory**: /data

## Local Testing

```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run application
python app.py

# Visit http://localhost:8080
```

## Docker Testing

```bash
# Build image
docker build -t glad-meadow-975 .

# Run container
docker run -p 8080:8080 -v $(pwd)/data:/data glad-meadow-975

# Test health endpoint
curl http://localhost:8080/health

# Visit http://localhost:8080
```

---

**Last Updated**: Deployment contract verification complete

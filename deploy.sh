#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────
#  deploy.sh  ·  AskMentor GCP Deployment
#
#  Run on each GCP VM after cloning the repo:
#    chmod +x deploy.sh
#
#    # On the API instance:
#    sudo ./deploy.sh api
#
#    # On the Worker instance:
#    sudo ./deploy.sh worker
# ─────────────────────────────────────────────────────────────────
set -euo pipefail

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info()  { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

MODE="${1:-}"
[[ "$MODE" == "api" || "$MODE" == "worker" ]] \
    || error "Usage: $0 [api|worker]"

# ── Step 1: Detect GCP External IP ───────────────────────────────
info "Detecting GCP external IP..."
GCP_IP=$(curl -sf \
    "http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip" \
    -H "Metadata-Flavor: Google") \
    || error "Could not reach GCP metadata server. Are you on a GCP VM?"

GCP_IP_DASHED="${GCP_IP//./-}"
info "External IP : ${GCP_IP}"
info "nip.io base : ${GCP_IP_DASHED}.nip.io"

# ── Step 2: Install Docker ────────────────────────────────────────
if ! command -v docker &>/dev/null; then
    info "Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    usermod -aG docker "${SUDO_USER:-$(logname)}" 2>/dev/null || true
else
    info "Docker: $(docker --version)"
fi

if ! docker compose version &>/dev/null; then
    info "Installing Docker Compose plugin..."
    apt-get install -y docker-compose-plugin
fi

# ── Step 3: Firewall ──────────────────────────────────────────────
info "Configuring firewall..."
if command -v ufw &>/dev/null; then
    ufw allow OpenSSH comment "SSH access"
    if [[ "$MODE" == "api" ]]; then
        ufw allow 80/tcp  comment "HTTP  Caddy"
        ufw allow 443/tcp comment "HTTPS Caddy"
        ufw allow 443/udp comment "HTTP3 Caddy"
        info "Opened ports: 22, 80, 443. RabbitMQ/Redis/Flower: SSH tunnel only."
    else
        # Worker instance: no public ports at all
        info "Worker mode: only SSH (22) is open. Flower on 127.0.0.1:5555 (SSH tunnel)."
    fi
    ufw --force enable
else
    warn "ufw not available. Configure GCP VPC firewall rules manually."
fi

# ── Step 4: Write .env ────────────────────────────────────────────
if [[ ! -f ".env.gcp" ]]; then
    error ".env.gcp not found. Copy .env.gcp.example to .env.gcp and fill in your values."
fi

info "Building .env from .env.gcp + detected IP..."
cp .env.gcp .env

# Inject the detected IP (overwrite any placeholder values)
sed -i "s|^GCP_IP=.*|GCP_IP=${GCP_IP}|" .env
sed -i "s|^GCP_IP_DASHED=.*|GCP_IP_DASHED=${GCP_IP_DASHED}|" .env

# Also make sure backend/.env is present (copy from .env if secrets are there)
[[ -f "backend/.env" ]] || warn "backend/.env not found — add backend secrets manually."

# ── Step 5: Build and Start ───────────────────────────────────────
COMPOSE_FILE="docker-compose.${MODE}.yml"
info "Starting services from ${COMPOSE_FILE}..."

docker compose -f "$COMPOSE_FILE" pull --ignore-buildable 2>/dev/null || true
docker compose -f "$COMPOSE_FILE" build --no-cache
docker compose -f "$COMPOSE_FILE" up -d

# ── Step 6: Summary ───────────────────────────────────────────────
info "Waiting 30s for services to start..."
sleep 30
docker compose -f "$COMPOSE_FILE" ps

echo ""
echo "────────────────────────────────────────────────────────────"
if [[ "$MODE" == "api" ]]; then
    echo "  AskMentor API Instance — Ready!"
    echo ""
    echo "  API  : https://api.${GCP_IP_DASHED}.nip.io"
    echo "  App  : https://app.${GCP_IP_DASHED}.nip.io"
    echo "  Health: https://api.${GCP_IP_DASHED}.nip.io/health"
    echo ""
    echo "  Logs: docker compose -f docker-compose.api.yml logs -f"
else
    echo "  AskMentor Worker Instance — Ready!"
    echo ""
    echo "  Flower dashboard (via SSH tunnel):"
    echo "    ssh -L 5555:localhost:5555 user@${GCP_IP}"
    echo "    Open: http://localhost:5555"
    echo ""
    echo "  Logs: docker compose -f docker-compose.worker.yml logs -f"
fi
echo "────────────────────────────────────────────────────────────"

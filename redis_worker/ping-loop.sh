#!/bin/bash
# Optimized Self-Pinger for Render (14-min heartbeat)

URL="${RENDER_EXTERNAL_URL:-http://localhost:8000}"
INTERVAL=840 # 14 minutes in seconds

echo "📡 Initializing Redis Keep-Alive Pinger for backend $URL..."

# Wait 30s before first ping to allow the backend to fully spin up
sleep 30

while true; do
  # Ping the backend health endpoint
  if curl -s -f -o /dev/null -H "User-Agent: PersonaBot-Redis-KeepAlive" "$URL/health"; then
    echo "$(date): ✅ Redis Keep-Alive Ping successful to $URL/health."
  else
    echo "$(date): ⚠️ Redis Keep-Alive Ping failed (Backend may be down)."
  fi
  sleep $INTERVAL
done

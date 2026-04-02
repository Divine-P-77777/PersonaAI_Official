#!/bin/bash
# Optimized Self-Pinger for Render (14-min heartbeat)

URL="${RENDER_EXTERNAL_URL:-http://localhost:15672}"
INTERVAL=840 # 14 minutes in seconds

echo "📡 Initializing RabbitMQ Keep-Alive Pinger for $URL..."

# Wait 30s before first ping to allow the management UI to actually start
sleep 30

while true; do
  # Ping the management API (auth-free health check)
  if curl -s -f -o /dev/null "$URL"; then
    echo "$(date): ✅ RabbitMQ Keep-Alive Ping successful."
  else
    echo "$(date): ⚠️ RabbitMQ Keep-Alive Ping failed (Broker may be starting)."
  fi
  sleep $INTERVAL
done
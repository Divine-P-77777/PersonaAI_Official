#!/bin/bash
set -e

# Start the self-ping loop in the background ONLY on Render
if [ -n "$RENDER_EXTERNAL_URL" ]; then
    /usr/local/bin/ping-loop.sh &
    echo "✅ Render self-ping loop started in background from Redis."
fi

echo "🚀 Starting Redis server..."
# Use exec to hand off to the official redis-server process
exec redis-server /usr/local/etc/redis/redis.conf

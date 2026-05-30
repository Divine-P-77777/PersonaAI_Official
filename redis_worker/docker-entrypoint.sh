#!/bin/bash
set -e

# Start the self-ping loop in the background if we're on Render
# This checks for the RENDER_EXTERNAL_URL environment variable
if [ -n "$RENDER_EXTERNAL_URL" ]; then
    /usr/local/bin/ping-loop.sh &
    echo "✅ Render self-ping loop started in background from Redis."
fi

echo "🚀 Starting Redis server..."
# Run redis with custom config, inheriting the standard redis entrypoint logic implicitly by replacing the process
exec redis-server /usr/local/etc/redis/redis.conf

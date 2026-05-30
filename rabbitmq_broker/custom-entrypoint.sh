#!/bin/bash
set -e

# Start the self‑ping loop in the background if we're on Render
# This checks for the RENDER_EXTERNAL_URL environment variable
if [ -n "$RENDER_EXTERNAL_URL" ]; then
    /usr/local/bin/ping-loop.sh &
    echo "✅ Render self-ping loop started in background."
fi

# Use the official RabbitMQ entrypoint to start the server
# This ensures all standard RabbitMQ initialization (like log management) occurs correctly.
echo "🚀 Starting RabbitMQ server..."
exec docker-entrypoint.sh rabbitmq-server
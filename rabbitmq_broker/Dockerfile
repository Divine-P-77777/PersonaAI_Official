# Production RabbitMQ for PersonaBot
FROM rabbitmq:3.13-management

# Install curl for health‑checks and Render self-ping
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy configuration files
# rabbitmq.conf: Resource limits and security settings
# definitions.json: Pre-defined users, vhosts, and permissions
COPY rabbitmq.conf /etc/rabbitmq/rabbitmq.conf
COPY definitions.json /etc/rabbitmq/definitions.json

# Copy support scripts
COPY ping-loop.sh /usr/local/bin/ping-loop.sh
COPY custom-entrypoint.sh /usr/local/bin/custom-entrypoint.sh

# Ensure script execution permissions
RUN chmod +x /usr/local/bin/ping-loop.sh \
    && chmod +x /usr/local/bin/custom-entrypoint.sh

# Expose AMQP and Management ports
EXPOSE 5672 15672

# Launch the custom entrypoint
ENTRYPOINT ["/usr/local/bin/custom-entrypoint.sh"]
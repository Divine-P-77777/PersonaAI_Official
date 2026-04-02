# Production Redis for PersonaBot
FROM redis:7-alpine

# Install curl and bash for self-ping scripts
RUN apk add --no-cache curl bash

# Copy configuration and scripts
COPY redis.conf /usr/local/etc/redis/redis.conf
COPY ping-loop.sh /usr/local/bin/ping-loop.sh
# Use a distinct name to avoid shadowing the official redis docker-entrypoint.sh
COPY custom-entrypoint.sh /usr/local/bin/custom-entrypoint.sh

# Ensure script execution permissions
RUN chmod +x /usr/local/bin/ping-loop.sh \
    && chmod +x /usr/local/bin/custom-entrypoint.sh

# Expose Redis port
EXPOSE 6379

# Launch the custom entrypoint (not shadowing the official one)
ENTRYPOINT ["/usr/local/bin/custom-entrypoint.sh"]

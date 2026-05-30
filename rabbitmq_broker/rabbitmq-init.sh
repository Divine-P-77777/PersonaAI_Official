#!/bin/bash

set -e

# Avoid duplicate runs
if rabbitmqctl list_users | grep -q "myapp"; then
  echo "User 'myapp' already exists, skipping init."
  exit 0
fi

# Create user and vhost
rabbitmqctl add_user myapp "secure_password_here"
rabbitmqctl add_vhost myapp_vhost
rabbitmqctl set_permissions -p myapp_vhost myapp ".*" ".*" ".*"

rabbitmqctl set_user_tags myapp monitoring management

echo "RabbitMQ init complete: user=myapp vhost=myapp_vhost"
#!/bin/sh
set -e

# Substitute environment variables in nginx config template
API_SERVER_URL=${API_SERVER_URL:-http://forkspacer-api-server:8080}

echo "Configuring nginx with API_SERVER_URL: $API_SERVER_URL"

# Replace the placeholder with actual API server URL
envsubst '${API_SERVER_URL}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Verify configuration
nginx -t

# Start nginx
exec nginx -g 'daemon off;'

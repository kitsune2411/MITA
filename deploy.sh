#!/bin/bash

# Set the script to exit immediately if a command fails
set -e

echo "=== Step 1: Pull latest changes (Optional, if using git repo) ==="
# Optional: Pull the latest code if you are using git
# git pull origin main

echo "=== Step 2: Build new version of the app ==="
docker-compose build

echo "=== Step 3: Stop old containers (Optional, Docker Compose does this automatically) ==="
# docker-compose down # Uncomment if you want to stop the containers manually before starting new ones

echo "=== Step 4: Deploy new version of the app ==="
docker-compose up -d --build

echo "=== Step 5: Wait for containers to start and stabilize ==="
# Optional: Wait a bit to let containers fully start
sleep 10

echo "=== Step 6: Confirm that the app is up and running ==="
docker ps

echo "=== Step 7: Check logs for any potential errors ==="
docker-compose logs -f

echo "=== Deployment Complete! ==="

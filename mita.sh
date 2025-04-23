#!/bin/bash

set -e  # Exit on command failure

COMMAND=$1

function show_help {
  echo "Usage: ./mita.sh [command]"
  echo ""
  echo "Commands:"
  echo "  up           Start all services in detached mode"
  echo "  down         Stop and remove all services"
  echo "  logs         Show logs for the 'app' service"
  echo "  build        Build the containers"
  echo "  restart      Restart the 'app' service"
  echo "  psql         Access the PostgreSQL database from the container"
  echo "  status       Show the status of all services"
  echo "  prune        Clean up unused Docker objects"
  echo "  help         Show this help message"
}

function log_action {
  echo "$(date +'%Y-%m-%d %H:%M:%S') - $1"
}

case "$COMMAND" in
  up)
    log_action "Starting services"
    docker compose up -d
    ;;
  down)
    read -p "Are you sure you want to stop and remove all services? (y/N) " CONFIRM
    if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
      echo "Operation cancelled."
      exit 0
    fi
    log_action "Stopping and removing all services"
    docker compose down
    ;;
  logs)
    log_action "Fetching logs for 'app' service"
    docker compose logs -f app
    ;;
  build)
    log_action "Building the containers"
    docker compose build
    ;;
  push)
    source .env

    IMAGE="$DOCKER_REGISTRY/$DOCKER_IMAGE_NAME:$DOCKER_IMAGE_TAG"

    echo "Building Docker image: $IMAGE"
    docker build -t "$IMAGE" .

    echo "Pushing Docker image to registry..."
    docker push "$IMAGE"
    ;;
  restart)
    log_action "Restarting 'app' service"
    docker compose restart app
    ;;
  psql)
    POSTGRES_USER=$(grep POSTGRES_USER .env | cut -d '=' -f2)
    POSTGRES_DB=$(grep POSTGRES_DB .env | cut -d '=' -f2)

    if [[ -z "$POSTGRES_USER" || -z "$POSTGRES_DB" ]]; then
      echo "Error: POSTGRES_USER or POSTGRES_DB is not defined in the .env file."
      exit 1
    fi

    log_action "Accessing PostgreSQL database"
    docker exec -it mita_pg psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"
    ;;
  status)
    log_action "Checking the status of all services"
    docker compose ps
    ;;
  prune)
    read -p "Are you sure you want to prune unused Docker objects? (y/N) " CONFIRM
    if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
      echo "Operation cancelled."
      exit 0
    fi
    log_action "Pruning unused Docker objects"
    docker system prune -f
    ;;
  help|*)
    show_help
    ;;
esac

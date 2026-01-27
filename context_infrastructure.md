# Context for Module: DOCKER

## Project Structure Tree
```text
docker/
  .env
  create_buckets.sh
  docker-compose.yml
```

## File Contents

### File: `docker\.env`
```text
# MinIO Credentials
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=SuperSecretPassword123!

# AI Service Configuration
AI_SERVICE_PORT=5001

# Network
COMPOSE_PROJECT_NAME=coopmonitor
```

### File: `docker\create_buckets.sh`
```bash
echo "Waiting for MinIO to be ready..."
until mc alias set minio http://minio:9000 "${MINIO_ROOT_USER}" "${MINIO_ROOT_PASSWORD}"; do
    echo "...waiting..."
    sleep 1
done

echo "MinIO is ready. Creating buckets..."

BUCKETS="raw-video video-clips reports user-uploads ai-models ai-results"

for bucket in $BUCKETS; do
    if mc ls minio/$bucket > /dev/null 2>&1; then
        echo "Bucket '$bucket' already exists."
    else
        mc mb minio/$bucket
        echo "Bucket '$bucket' created."
    fi
done

echo "All buckets checked/created."
exit 0
```

### File: `docker\docker-compose.yml`
```yaml
services:
  minio:
    image: minio/minio:latest
    container_name: coop_minio
    command: server /data --console-address ":9001"
    restart: unless-stopped
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}
    volumes:
      - minio_data:/data
    networks:
      - coop-net

  createbuckets:
    image: minio/mc:latest
    container_name: coop_createbuckets
    depends_on:
      - minio
    entrypoint: /bin/sh
    volumes:
      - ./create_buckets.sh:/create_buckets.sh
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}
    command: /create_buckets.sh
    networks:
      - coop-net

  ai-service:
    build:
      context: ../ai-service
      dockerfile: Dockerfile
    container_name: coop_ai_service
    restart: unless-stopped
    ports:
      - "${AI_SERVICE_PORT}:5001"
    environment:
      - PYTHONUNBUFFERED=1
    volumes:
      - ../ai-service:/app
    networks:
      - coop-net

networks:
  coop-net:
    driver: bridge

volumes:
  minio_data:

```


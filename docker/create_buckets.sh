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
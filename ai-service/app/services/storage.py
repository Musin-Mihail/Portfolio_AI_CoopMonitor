from minio import Minio
from minio.error import S3Error
import logging
import os
from app.settings import settings

logger = logging.getLogger(__name__)


class StorageService:
    def __init__(self):
        self.client = Minio(
            settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=settings.MINIO_SECURE,
        )
        self._ensure_connection()

    def _ensure_connection(self):
        try:
            self.client.list_buckets()
            logger.info(f"Connected to MinIO at {settings.MINIO_ENDPOINT}")
        except Exception as e:
            logger.error(f"Failed to connect to MinIO: {e}")

    def download_file(self, bucket: str, object_name: str, local_path: str) -> bool:
        try:
            self.client.fget_object(bucket, object_name, local_path)
            logger.info(f"Downloaded {bucket}/{object_name} to {local_path}")
            return True
        except S3Error as e:
            logger.error(f"Download failed: {e}")
            return False

    def upload_file(
        self,
        bucket: str,
        object_name: str,
        local_path: str,
        content_type: str = "application/json",
    ) -> bool:
        try:
            self.client.fput_object(
                bucket, object_name, local_path, content_type=content_type
            )
            logger.info(f"Uploaded {local_path} to {bucket}/{object_name}")
            return True
        except S3Error as e:
            logger.error(f"Upload failed: {e}")
            return False

    def check_file_exists(self, bucket: str, object_name: str) -> bool:
        try:
            self.client.stat_object(bucket, object_name)
            return True
        except S3Error:
            return False


minio_client = StorageService()

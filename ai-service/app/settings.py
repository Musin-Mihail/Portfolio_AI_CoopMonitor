from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    APP_NAME: str = "CoopMonitor AI Service"
    VERSION: str = "0.1.0"

    # MinIO
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "admin"
    MINIO_SECRET_KEY: str = "SuperSecretPassword123!"
    MINIO_SECURE: bool = False

    # Buckets
    BUCKET_RAW_VIDEO: str = "raw-video"
    BUCKET_VIDEO_CLIPS: str = "video-clips"
    BUCKET_AI_RESULTS: str = "ai-results"

    class Config:
        env_file = ".env"


settings = Settings()

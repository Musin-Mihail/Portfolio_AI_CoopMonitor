import uvicorn
import logging
import uuid
from datetime import datetime
from fastapi import FastAPI, HTTPException, BackgroundTasks
from app.settings import settings
from app.models import (
    AnalysisRequest,
    AnalysisResponse,
    AnalysisStatus,
    AudioAnalysisRequest,
)
from app.services.storage import minio_client
from app.services.vision import vision_pipeline
from app.services.audio import audio_pipeline

# Configure Logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("main")

app = FastAPI(title=settings.APP_NAME, version=settings.VERSION)


@app.get("/health")
async def health_check():
    return {"status": "ok", "version": settings.VERSION}


@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_media(request: AnalysisRequest, background_tasks: BackgroundTasks):
    logger.info(f"Received analysis request for {request.bucket}/{request.file_path}")

    # 1. Validate file existence
    if not minio_client.check_file_exists(request.bucket, request.file_path):
        logger.warning(f"File not found: {request.bucket}/{request.file_path}")
        raise HTTPException(status_code=404, detail="Source file not found in storage")

    # 2. Create Job ID based on HouseId and Timestamp
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    job_id = f"House{request.house_id}_{timestamp}_vision"

    # 3. Trigger Background Processing
    background_tasks.add_task(
        vision_pipeline.process_job, job_id, request.bucket, request.file_path
    )

    return AnalysisResponse(
        job_id=job_id,
        status=AnalysisStatus.QUEUED,
        message=f"Analysis queued for {request.file_path}",
    )


@app.post("/analyze-audio", response_model=AnalysisResponse)
async def analyze_audio(
    request: AudioAnalysisRequest, background_tasks: BackgroundTasks
):
    logger.info(f"Received audio analysis request for {request.file_path}")

    # 1. Validate file
    if not minio_client.check_file_exists(request.bucket, request.file_path):
        raise HTTPException(status_code=404, detail="Audio file not found")

    # 2. Create Job ID based on HouseId and Timestamp
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    job_id = f"House{request.house_id}_{timestamp}_audio"

    # 2. Trigger Audio Pipeline
    background_tasks.add_task(
        audio_pipeline.process_audio,
        request.house_id,
        request.bucket,
        request.file_path,
    )

    return AnalysisResponse(
        job_id=job_id,
        status=AnalysisStatus.QUEUED,
        message=f"Audio analysis queued for {request.file_path}",
    )


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=5001, reload=True)

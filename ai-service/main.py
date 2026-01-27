import uvicorn
import logging
from fastapi import FastAPI, HTTPException
from app.settings import settings
from app.models import AnalysisRequest, AnalysisResponse
from app.services.storage import minio_client
import uuid

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
async def analyze_media(request: AnalysisRequest):
    logger.info(f"Received analysis request for {request.bucket}/{request.file_path}")

    # 1. Validate file existence
    if not minio_client.check_file_exists(request.bucket, request.file_path):
        logger.warning(f"File not found: {request.bucket}/{request.file_path}")
        raise HTTPException(status_code=404, detail="Source file not found in storage")

    # 2. Mock Job Creation
    # In a real scenario, this would push a task to a queue (e.g., Celery/Redis)
    # or start a background task. For MVP, we'll just acknowledge.
    job_id = str(uuid.uuid4())

    # TODO: Step 5.2 - Implement Vision Pipeline trigger here

    return AnalysisResponse(
        job_id=job_id,
        status="queued",
        message=f"Analysis started for {request.file_path}",
    )


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=5001, reload=True)

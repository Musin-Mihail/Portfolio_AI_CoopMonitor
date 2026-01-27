from pydantic import BaseModel


class AnalysisRequest(BaseModel):
    house_id: int
    bucket: str
    file_path: str
    analysis_type: str = "full_pipeline"  # full_pipeline, detection_only, behavior


class AnalysisResponse(BaseModel):
    job_id: str
    status: str
    message: str

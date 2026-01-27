from pydantic import BaseModel
from typing import List, Optional
from enum import Enum


class AnalysisType(str, Enum):
    FULL = "full_pipeline"
    DETECTION = "detection_only"
    BEHAVIOR = "behavior"
    AUDIO = "audio_only"


class AnalysisRequest(BaseModel):
    house_id: int
    bucket: str
    file_path: str
    analysis_type: AnalysisType = AnalysisType.FULL


class AudioAnalysisRequest(BaseModel):
    house_id: int
    bucket: str
    file_path: str


class AnalysisStatus(str, Enum):
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class AnalysisResponse(BaseModel):
    job_id: str
    status: AnalysisStatus
    message: str


class DetectionBox(BaseModel):
    class_name: str
    confidence: float
    x: int
    y: int
    w: int
    h: int


class FrameResult(BaseModel):
    frame_id: int
    timestamp: float
    detections: List[DetectionBox]


class AnalysisResult(BaseModel):
    job_id: str
    file_path: str
    total_frames: int
    duration_seconds: float
    detections_summary: dict
    frames: List[FrameResult]

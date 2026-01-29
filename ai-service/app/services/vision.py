import cv2
import numpy as np
import os
import logging
import json
import random
import time
from uuid import uuid4
from typing import List
from app.services.storage import minio_client
from app.models import AnalysisResult, FrameResult, DetectionBox
from app.settings import settings

logger = logging.getLogger(__name__)


class VisionPipeline:
    def __init__(self):
        self.temp_dir = "/tmp/ai-processing"
        if not os.path.exists(self.temp_dir):
            os.makedirs(self.temp_dir)

    def process_job(self, job_id: str, bucket: str, file_path: str):
        """
        Background task to process video.
        Simulates detection using OpenCV and random generators.
        """
        logger.info(f"[{job_id}] Starting processing for {bucket}/{file_path}")

        local_video_path = os.path.join(self.temp_dir, f"{job_id}_input.mp4")

        try:
            logger.info(f"[{job_id}] Downloading file...")
            if not minio_client.download_file(bucket, file_path, local_video_path):
                logger.error(f"[{job_id}] Download failed.")
                return

            cap = cv2.VideoCapture(local_video_path)
            if not cap.isOpened():
                logger.error(f"[{job_id}] Failed to open video file.")
                return

            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

            logger.info(
                f"[{job_id}] Video Info: {width}x{height} @ {fps}fps, {total_frames} frames"
            )

            frame_results = []
            detection_counts = {"bird": 0, "person": 0, "dead_bird": 0}

            process_step = 30
            current_frame = 0

            thumbnail_saved = False
            thumbnail_path = os.path.join(self.temp_dir, f"{job_id}_thumb.jpg")

            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break

                if current_frame % process_step == 0:
                    detections = self._mock_inference(width, height)

                    for d in detections:
                        detection_counts[d.class_name] = (
                            detection_counts.get(d.class_name, 0) + 1
                        )

                    frame_results.append(
                        FrameResult(
                            frame_id=current_frame,
                            timestamp=current_frame / fps,
                            detections=detections,
                        )
                    )

                    if not thumbnail_saved:
                        self._draw_boxes(frame, detections)
                        cv2.imwrite(thumbnail_path, frame)
                        thumbnail_saved = True

                current_frame += 1

            cap.release()

            if thumbnail_saved:
                thumb_object = f"{job_id}/thumbnail.jpg"
                minio_client.upload_file(
                    settings.BUCKET_AI_RESULTS,
                    thumb_object,
                    thumbnail_path,
                    "image/jpeg",
                )
                logger.info(f"[{job_id}] Thumbnail uploaded: {thumb_object}")

            result = AnalysisResult(
                job_id=job_id,
                file_path=f"{bucket}/{file_path}",
                total_frames=total_frames,
                duration_seconds=total_frames / fps,
                detections_summary=detection_counts,
                frames=frame_results,
            )

            report_path = os.path.join(self.temp_dir, f"{job_id}_report.json")
            with open(report_path, "w") as f:
                f.write(result.model_dump_json(indent=2))

            report_object = f"{job_id}/analysis.json"
            minio_client.upload_file(
                settings.BUCKET_AI_RESULTS,
                report_object,
                report_path,
                "application/json",
            )

            logger.info(
                f"[{job_id}] Processing completed successfully. Report: {report_object}"
            )

        except Exception as e:
            logger.error(f"[{job_id}] Processing error: {e}")
        finally:
            self._cleanup(
                [
                    local_video_path,
                    thumbnail_path if "thumbnail_path" in locals() else None,
                    report_path if "report_path" in locals() else None,
                ]
            )

    def _mock_inference(self, width, height) -> List[DetectionBox]:
        detections = []
        if random.random() > 0.3:
            num_birds = random.randint(1, 5)
            for _ in range(num_birds):
                detections.append(
                    DetectionBox(
                        class_name="bird",
                        confidence=random.uniform(0.7, 0.99),
                        x=random.randint(0, width - 50),
                        y=random.randint(0, height - 50),
                        w=random.randint(20, 50),
                        h=random.randint(20, 50),
                    )
                )

            if random.random() > 0.95:
                detections.append(
                    DetectionBox(
                        class_name="person",
                        confidence=random.uniform(0.8, 0.99),
                        x=random.randint(0, width - 100),
                        y=random.randint(0, height - 200),
                        w=100,
                        h=200,
                    )
                )

        return detections

    def _draw_boxes(self, frame, detections: List[DetectionBox]):
        for d in detections:
            color = (0, 255, 0) if d.class_name == "bird" else (0, 0, 255)
            cv2.rectangle(frame, (d.x, d.y), (d.x + d.w, d.y + d.h), color, 2)
            cv2.putText(
                frame,
                f"{d.class_name} {d.confidence:.2f}",
                (d.x, d.y - 5),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                color,
                2,
            )

    def _cleanup(self, paths):
        for p in paths:
            if p and os.path.exists(p):
                try:
                    os.remove(p)
                except Exception:
                    pass


vision_pipeline = VisionPipeline()

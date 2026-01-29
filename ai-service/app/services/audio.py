import logging
import random
import time
from datetime import datetime
import requests
from app.settings import settings

logger = logging.getLogger(__name__)


class AudioPipeline:
    def __init__(self):
        pass

    def process_audio(self, house_id: int, bucket: str, file_path: str):
        """
        Simulate audio analysis and notify Backend.
        """
        logger.info(f"Processing audio for House {house_id} from {bucket}/{file_path}")

        time.sleep(1)

        classification = "Healthy"
        confidence = random.uniform(0.85, 0.99)

        rand = random.random()
        if rand > 0.8:
            classification = "Coughing"
            confidence = random.uniform(0.75, 0.95)
        elif rand > 0.95:
            classification = "Panic"
            confidence = random.uniform(0.6, 0.9)

        logger.info(f"Audio Result: {classification} ({confidence:.2f})")

        self._send_result_to_backend(
            house_id, classification, confidence, f"{bucket}/{file_path}"
        )

    def _send_result_to_backend(
        self, house_id: int, classification: str, confidence: float, clip_url: str
    ):
        # Using a fallback for local dev vs docker
        url = "http://host.docker.internal:5000/api/Audio/ingest"

        payload = {
            "houseId": house_id,
            "timestamp": datetime.utcnow().isoformat(),
            "classification": classification,
            "confidence": confidence,
            "clipUrl": clip_url,
        }

        try:
            resp = requests.post(url, json=payload, timeout=5)
            if resp.status_code == 200:
                logger.info("Successfully sent audio result to Backend")
            else:
                logger.error(
                    f"Failed to send to Backend: {resp.status_code} - {resp.text}"
                )
        except Exception as e:
            logger.error(f"Error connecting to Backend: {e}")


audio_pipeline = AudioPipeline()

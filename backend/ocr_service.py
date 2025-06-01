"""OCR service entry point."""
import asyncio
import logging
from app.ocr.camera import Camera
from app.ocr.processor import ImageProcessor
from app.ocr.recognizer import PlateRecognizer
from app.core.events import event_bus, EVENT_PLATE_DETECTED, EVENT_VEHICLE_ENTERED, EVENT_VEHICLE_EXITED

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class OCRService:
    def __init__(self, camera_id: int = 0):
        """Initialize OCR service.
        
        Args:
            camera_id: Camera device ID
        """
        self.camera = Camera(camera_id)
        self.processor = ImageProcessor()
        self.recognizer = PlateRecognizer()
        self.is_running = False

    async def process_frame(self, frame):
        """Process a single frame.
        
        Args:
            frame: Camera frame
        """
        try:
            # Preprocess image
            processed = self.processor.preprocess_image(frame)
            
            # Detect plate region
            plate_region = self.processor.detect_plate_region(processed)
            if not plate_region:
                return
                
            # Extract and enhance plate
            plate = self.processor.extract_plate(frame, plate_region)
            enhanced_plate = self.processor.enhance_plate(plate)
            
            # Recognize plate
            result = self.recognizer.process_image(enhanced_plate)
            if result:
                # Publish plate detection event
                await event_bus.publish(EVENT_PLATE_DETECTED, result)
                
                # TODO: Determine if vehicle is entering or exiting
                # For now, assume entering
                await event_bus.publish(EVENT_VEHICLE_ENTERED, result)
                
        except Exception as e:
            logger.error(f"Error processing frame: {str(e)}")

    async def run(self):
        """Run the OCR service."""
        try:
            self.camera.start()
            self.is_running = True
            
            logger.info("OCR service started")
            
            while self.is_running:
                frame = self.camera.capture_frame()
                if frame is not None:
                    await self.process_frame(frame)
                await asyncio.sleep(0.1)  # Prevent CPU overload
                
        except Exception as e:
            logger.error(f"Error in OCR service: {str(e)}")
        finally:
            self.camera.stop()
            self.is_running = False
            logger.info("OCR service stopped")

    def stop(self):
        """Stop the OCR service."""
        self.is_running = False

async def main():
    """Main entry point."""
    service = OCRService()
    try:
        await service.run()
    except KeyboardInterrupt:
        logger.info("Shutting down OCR service...")
        service.stop()

if __name__ == "__main__":
    asyncio.run(main()) 
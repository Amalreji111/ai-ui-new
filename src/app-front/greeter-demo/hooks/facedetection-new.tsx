import { useEffect, useRef, useState, MutableRefObject } from 'react';
import * as FaceDetection from '@mediapipe/face_detection';
import { Camera } from '@mediapipe/camera_utils';

interface BoundingBox {
  xCenter: number;
  yCenter: number;
  width: number;
  height: number;
}

interface UseFaceDetectionReturn {
  webcamRef: MutableRefObject<HTMLVideoElement | null>;
  boundingBox: BoundingBox[];
  isLoading: boolean;
  detected: boolean;
  facesDetected: number;
}

interface FaceDetectionOptions {
  minDetectionConfidence?: number;
  model?: 'short' | 'full';
}

// MediaPipe types
interface DetectionResult {
  detections: Array<{
    boundingBox: {
      xCenter: number;
      yCenter: number;
      width: number;
      height: number;
      rotation: number;
    };
    keypoints: Array<{
      x: number;
      y: number;
      score?: number;
    }>;
    score: number[];
  }>;
}

export const useFaceDetectionNew = (
  options: FaceDetectionOptions = {}
): UseFaceDetectionReturn => {
  const webcamRef = useRef<HTMLVideoElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [detected, setDetected] = useState(false);
  const [facesDetected, setFacesDetected] = useState(0);
  const [boundingBox, setBoundingBox] = useState<BoundingBox[]>([]);

  useEffect(() => {
    const faceDetection = new FaceDetection.FaceDetection({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.4/${file}`;
      }
    });

    faceDetection.setOptions({
      model: options.model,
      minDetectionConfidence: options.minDetectionConfidence || 0.5
    });

    faceDetection.onResults((results: any) => {
      if (results.detections) {
        const boxes: BoundingBox[] = results.detections.map((detection:any) => ({
          xCenter: detection.boundingBox.xCenter,
          yCenter: detection.boundingBox.yCenter,
          width: detection.boundingBox.width,
          height: detection.boundingBox.height
        }));

        setBoundingBox(boxes);
        setDetected(boxes.length > 0);
        setFacesDetected(boxes.length);
        setIsLoading(false);
      }
    });

    if (webcamRef.current) {
      const camera = new Camera(webcamRef.current, {
        onFrame: async () => {
          if (webcamRef.current) {
            await faceDetection.send({ image: webcamRef.current });
          }
        },
        width: 640,
        height: 480
      });

      camera.start()
        .catch((err) => {
          console.error('Error starting camera:', err);
          setIsLoading(false);
        });

      return () => {
        camera.stop();
      };
    }
  }, [options.minDetectionConfidence, options.model]);

  return {
    webcamRef,
    boundingBox,
    isLoading,
    detected,
    facesDetected
  };
};
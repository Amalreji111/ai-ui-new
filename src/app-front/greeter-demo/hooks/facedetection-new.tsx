import { useEffect, useRef, useState, MutableRefObject } from 'react';

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

declare global {
  interface Window {
    FaceDetection: any;
    Camera: any;
  }
}

export const useFaceDetectionNew = (
  options: FaceDetectionOptions = {}
): UseFaceDetectionReturn => {
  const webcamRef = useRef<HTMLVideoElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [detected, setDetected] = useState(false);
  const [facesDetected, setFacesDetected] = useState(0);
  const [boundingBox, setBoundingBox] = useState<BoundingBox[]>([]);
  const [modulesLoaded, setModulesLoaded] = useState(false);

  // Load MediaPipe scripts
  useEffect(() => {
    const loadScripts = async () => {
      try {
        // Load Face Detection
        const faceDetectionScript = document.createElement('script');
        faceDetectionScript.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.4/face_detection.js';
        faceDetectionScript.async = true;
        
        // Load Camera Utils
        const cameraScript = document.createElement('script');
        cameraScript.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js';
        cameraScript.async = true;

        // Wait for both scripts to load
        await Promise.all([
          new Promise((resolve) => {
            faceDetectionScript.onload = resolve;
            document.body.appendChild(faceDetectionScript);
          }),
          new Promise((resolve) => {
            cameraScript.onload = resolve;
            document.body.appendChild(cameraScript);
          })
        ]);

        setModulesLoaded(true);
      } catch (error) {
        console.error('Error loading MediaPipe scripts:', error);
        setIsLoading(false);
      }
    };

    loadScripts();

    // Cleanup
    return () => {
      const scripts = document.querySelectorAll('script[src*="mediapipe"]');
      scripts.forEach(script => script.remove());
    };
  }, []);

  // Initialize face detection
  useEffect(() => {
    if (!modulesLoaded || !window.FaceDetection || !window.Camera) {
      return;
    }

    let faceDetection: any;
    let camera: any;

    const initializeFaceDetection = async () => {
      try {
        faceDetection = new window.FaceDetection({
          locateFile: (file: string) => 
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.4/${file}`
        });

        faceDetection.setOptions({
          model: options.model,
          minDetectionConfidence: options.minDetectionConfidence || 0.5
        });

        faceDetection.onResults((results: any) => {
          if (results.detections) {
            const boxes: BoundingBox[] = results.detections.map((detection: any) => ({
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
          camera = new window.Camera(webcamRef.current, {
            onFrame: async () => {
              if (webcamRef.current) {
                await faceDetection.send({ image: webcamRef.current });
              }
            },
            width: 640,
            height: 480
          });

          await camera.start();
        }
      } catch (error) {
        console.error('Error initializing face detection:', error);
        setIsLoading(false);
      }
    };

    initializeFaceDetection();

    return () => {
      if (camera) {
        camera.stop();
      }
    };
  }, [modulesLoaded, options.minDetectionConfidence, options.model]);

  return {
    webcamRef,
    boundingBox,
    isLoading,
    detected,
    facesDetected
  };
};
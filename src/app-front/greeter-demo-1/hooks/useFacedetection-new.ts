import { useEffect, useRef, useState, MutableRefObject } from 'react';
import { convertToBoolean, getQueryParam } from '../utils/utils';

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
  isCameraActive: boolean;
  isEnabled: boolean;
  toggleDetection: () => void;
  enableDetection: () => void;
  disableDetection: () => void;
}

interface FaceDetectionOptions {
  minDetectionConfidence?: number;
  model?: 'short' | 'full';
  initialEnabled?: boolean;
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
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isEnabled, setIsEnabled] = useState(() => {
    const enableFacedetection = getQueryParam("enableFacedetection", "true");
    return options.initialEnabled ?? convertToBoolean(enableFacedetection);
  });
  
  const cameraRef = useRef<any>(null);
  const detectionRef = useRef<any>(null);

  // Control functions
  const enableDetection = () => {
    setIsEnabled(true);
  };

  const disableDetection = () => {
    setIsEnabled(false);
  };

  const toggleDetection = () => {
    setIsEnabled(prev => !prev);
  };

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

    const initializeFaceDetection = async () => {
      try {
        detectionRef.current = new window.FaceDetection({
          locateFile: (file: string) => 
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.4/${file}`
        });

        detectionRef.current.setOptions({
          model: options.model,
          minDetectionConfidence: options.minDetectionConfidence || 0.5
        });

        detectionRef.current.onResults((results: any) => {
          if (results.detections) {
            const boxes: BoundingBox[] = results.detections.map((detection: any) => ({
              xCenter: detection.boundingBox.xCenter,
              yCenter: detection.boundingBox.yCenter,
              width: detection.boundingBox.width,
              height: detection.boundingBox.height
            }));

            setBoundingBox(boxes);
            setTimeout(() =>  setDetected(boxes.length > 0), 2000);
           
            setFacesDetected(boxes.length);
            setIsLoading(false);
          }
        });

        if (webcamRef.current) {
          cameraRef.current = new window.Camera(webcamRef.current, {
            onFrame: async () => {
              if (webcamRef.current && isEnabled) {
                await detectionRef.current.send({ image: webcamRef.current });
              }
            },
            width: 640,
            height: 480
          });

          if (isEnabled) {
            await cameraRef.current.start();
            setIsCameraActive(true);
          }
        }
      } catch (error) {
        console.error('Error initializing face detection:', error);
        setIsLoading(false);
      }
    };

    initializeFaceDetection();

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
        setIsCameraActive(false);
      }
    };
  }, [modulesLoaded, options.minDetectionConfidence, options.model]);

  // Handle enable/disable toggle
  useEffect(() => {
    if (!cameraRef.current) return;

    const updateDetectionState = async () => {
      try {
        if (isEnabled) {
          await cameraRef.current.start();
        setIsCameraActive(true);

        } else {
          await cameraRef.current.stop();
        setIsCameraActive(false);
          setBoundingBox([]);
          setDetected(false);
          setFacesDetected(0);
        }
      } catch (error) {
        console.error('Error updating detection state:', error);
      }
    };

    updateDetectionState();
  }, [isEnabled]);

  return {
    webcamRef,
    boundingBox,
    isLoading,
    detected,
    isCameraActive,
    facesDetected,
    isEnabled,
    toggleDetection,
    enableDetection,
    disableDetection
  };
};
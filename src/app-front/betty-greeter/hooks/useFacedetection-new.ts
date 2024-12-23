import { useEffect, useRef, useState, MutableRefObject } from 'react';
import { convertToBoolean, getQueryParam } from '../utils/utils';

interface BoundingBox {
  xCenter: number;
  yCenter: number;
  width: number;
  height: number;
  score: number;  // Added confidence score
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
  consecutiveDetectionsRequired?: number;  // New option
  detectionThreshold?: number;  // New option
  maxFaces?: number;  // New option
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

  // Detection stability tracking
  const consecutiveDetectionsRef = useRef(0);
  const lastValidDetectionRef = useRef<BoundingBox[]>([]);
  
  const cameraRef = useRef<any>(null);
  const detectionRef = useRef<any>(null);

  // Configuration constants with defaults
  const CONSECUTIVE_DETECTIONS_REQUIRED = options.consecutiveDetectionsRequired ?? 3;
  const DETECTION_THRESHOLD = options.detectionThreshold ?? 0.7;  // Higher confidence threshold
  const MAX_FACES = options.maxFaces ?? 1;  // Limit number of faces

  // Utility function to validate detections
  const isValidDetection = (detection: any) => {
    // Check confidence score
    if (detection.score < DETECTION_THRESHOLD) return false;

    // Basic proportion checks for face (typical face aspect ratio is around 1.3-1.5)
    const aspectRatio = detection.boundingBox.width / detection.boundingBox.height;
    if (aspectRatio < 0.5 || aspectRatio > 2.0) return false;

    // Size validation (prevent tiny or huge detections)
    if (detection.boundingBox.width < 0.1 || detection.boundingBox.width > 0.9) return false;
    if (detection.boundingBox.height < 0.1 || detection.boundingBox.height > 0.9) return false;

    return true;
  };

  // Control functions remain the same
  const enableDetection = () => setIsEnabled(true);
  const disableDetection = () => setIsEnabled(false);
  const toggleDetection = () => setIsEnabled(prev => !prev);

  // MediaPipe scripts loading logic remains the same
  useEffect(() => {
    const loadScripts = async () => {
      try {
        const faceDetectionScript = document.createElement('script');
        faceDetectionScript.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.4/face_detection.js';
        faceDetectionScript.async = true;
        
        const cameraScript = document.createElement('script');
        cameraScript.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js';
        cameraScript.async = true;

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
    return () => {
      const scripts = document.querySelectorAll('script[src*="mediapipe"]');
      scripts.forEach(script => script.remove());
    };
  }, []);

  // Initialize face detection with enhanced validation
  useEffect(() => {
    if (!modulesLoaded || !window.FaceDetection || !window.Camera) return;

    const initializeFaceDetection = async () => {
      try {
        detectionRef.current = new window.FaceDetection({
          locateFile: (file: string) => 
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.4/${file}`
        });

        detectionRef.current.setOptions({
          model: options.model || 'full',  // Default to full model for better accuracy
          minDetectionConfidence: options.minDetectionConfidence || 0.7,  // Increased base confidence
          maxNumFaces: MAX_FACES
        });

        detectionRef.current.onResults((results: any) => {
          if (results.detections) {
            // Filter and validate detections
            const validDetections = results.detections
              .filter(isValidDetection)
              .slice(0, MAX_FACES)
              .map((detection: any) => ({
                xCenter: detection.boundingBox.xCenter,
                yCenter: detection.boundingBox.yCenter,
                width: detection.boundingBox.width,
                height: detection.boundingBox.height,
                score: detection.score
              }));

            // Update detection stability tracking
            if (validDetections.length > 0) {
              consecutiveDetectionsRef.current++;
              lastValidDetectionRef.current = validDetections;
            } else {
              consecutiveDetectionsRef.current = 0;
            }

            // Update state based on detection stability
            if (consecutiveDetectionsRef.current >= CONSECUTIVE_DETECTIONS_REQUIRED) {
              setBoundingBox(lastValidDetectionRef.current);
              setDetected(true);
              setFacesDetected(lastValidDetectionRef.current.length);
            } else if (consecutiveDetectionsRef.current === 0) {
              setBoundingBox([]);
              setDetected(false);
              setFacesDetected(0);
            }

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

  // Enable/disable toggle effect remains the same
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
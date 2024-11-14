import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { useCurrentChat } from "../../../ui/chat/useCurrentChat";
import { ChatStates } from '../../../state/chat/ChatStates';

interface FaceDetectionState {
  isModelLoading: boolean;
  isStreamActive: boolean;
  faceDetected: boolean;
  lastFaceDetectionTime: number;
  error: string | null;
}

const getQueryParam = (paramName: string, defaultValue: number): number => {
  if (typeof window === 'undefined') return defaultValue;
  const params = new URLSearchParams(window.location.search);
  const value = params.get(paramName);
  return value ? parseInt(value, 10) : defaultValue;
};
let lastFaceDetectionState=false
const GREETING_COOLDOWN = getQueryParam("greetingCooldownTimer", 15) * 1000; // Minimum time (ms) between greetings

const useFaceDetection = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastGreetingTimeRef = useRef<number>(0); // Use ref for last greeting time
  const [state, setState] = useState<FaceDetectionState>({
    isModelLoading: true,
    isStreamActive: false,
    faceDetected: false,
    lastFaceDetectionTime: 0,
    error: null
  });

  const { messages, chat } = useCurrentChat();
  
  const faceDetectionTimer = getQueryParam("faceDetectionTimer", 15);

  const lastMessageTimestamp = messages?.length > 0
    ? new Date(messages[messages.length - 1]?.createTime).getTime()
    : 0;
  const timeSinceLastMessage = Date.now() - lastMessageTimestamp;

  useEffect(() => {
    let isMounted = true;

    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        ]);
        
        if (isMounted) {
          setState(prev => ({ ...prev, isModelLoading: false }));
        }
      } catch (error) {
        if (isMounted) {
          setState(prev => ({
            ...prev,
            isModelLoading: false,
            error: "Failed to load face detection models"
          }));
        }
      }
    };

    loadModels();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    let detectionInterval: NodeJS.Timer | null = null;

    const startVideo = async () => {
      if (state.isModelLoading || !videoRef.current) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: 640,
            height: 480,
          }
        });

        if (!isMounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setState(prev => ({ ...prev, isStreamActive: true, error: null }));

          detectionInterval = setInterval(async () => {
            if (!videoRef.current || !isMounted) return;

            try {
              const detections = await faceapi
                .detectAllFaces(
                  videoRef.current, 
                  new faceapi.TinyFaceDetectorOptions({
                    inputSize: 320,      // Reduced for better performance
                    scoreThreshold: 0.3  // Reduced threshold for better detection in low light
                  })
                )
                .withFaceLandmarks();

              const faceDetected = detections.length > 0;
              const currentTime = Date.now();

              if (isMounted) {
                setState(prev => ({
                  ...prev,
                  faceDetected,
                  lastFaceDetectionTime: faceDetected ? currentTime : prev.lastFaceDetectionTime
                }));
              }
            } catch (error) {
              console.error('Face detection error:', error);
            }
          }, 100);
        }
      } catch (error) {
        if (isMounted) {
          setState(prev => ({
            ...prev,
            isStreamActive: false,
            error: "Camera access denied or not available"
          }));
        }
      }
    };

    startVideo();

    return () => {
      isMounted = false;
      if (detectionInterval) clearInterval(detectionInterval as any);
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [state.isModelLoading]);

  useEffect(() => {
    const currentTime = Date.now();
    const timeSinceLastGreeting = currentTime - lastGreetingTimeRef.current;
    const hasEnoughTimePassed = timeSinceLastGreeting > GREETING_COOLDOWN;
    const noRecentMessages = timeSinceLastMessage > faceDetectionTimer * 1000;
    // console.table({
    //   hasEnoughTimePassed,
    //   noRecentMessages
    // })
   

    // Only trigger greeting if all conditions are met and greeting hasn't been triggered yet
    if (state.faceDetected && hasEnoughTimePassed && noRecentMessages&&lastFaceDetectionState!==state.faceDetected) {
      // Set the greeting time ref to prevent triggering again in the cooldown period
      lastGreetingTimeRef.current = currentTime;

      // Trigger greeting logic (this could be calling a function to display a greeting message)
      console.log("Greeting the user!");
      ChatStates.addChatMessage({ chat, text: "Hi" });
    }
    if(lastFaceDetectionState!==state.faceDetected){
      lastFaceDetectionState = state.faceDetected
    }
  }, [state.faceDetected, timeSinceLastMessage, faceDetectionTimer]);

  return {
    videoRef,
    isModelLoading: state.isModelLoading,
    isStreamActive: state.isStreamActive,
    faceDetected: state.faceDetected,
    error: state.error,
    timeSinceLastMessage,
    faceDetectionTimer,
  };
};

export default useFaceDetection;

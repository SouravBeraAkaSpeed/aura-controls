"use client";

import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from "react";
import { HandLandmarker, FilesetResolver, Landmark } from "@mediapipe/tasks-vision";

// --- NEW: Define the shape for two hands ---
export interface HandsResult {
  left: Landmark[] | null;
  right: Landmark[] | null;
}

interface MediaPipeContextType {
  hands: HandsResult; // Changed from handLandmarks
  isCameraActive: boolean;
  startCamera: () => void;
  stopCamera: () => void;
}

const MediaPipeContext = createContext<MediaPipeContextType | undefined>(undefined);

export const MediaPipeProvider = ({ children }: { children: ReactNode }) => {
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const [hands, setHands] = useState<HandsResult>({ left: null, right: null });
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  if (typeof window !== "undefined" && !videoRef.current) {
      videoRef.current = document.createElement("video");
      videoRef.current.autoplay = true;
      videoRef.current.playsInline = true;
  }
  
  const animationFrameId = useRef<number>(0);
  const lastVideoTime = useRef(-1);

  // Initialize the model once
  useEffect(() => {
    const createHandLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm");
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: `/hand_landmarker.task`, delegate: "GPU" },
          runningMode: "VIDEO", 
          numHands: 2, // --- CHANGED: Track two hands ---
        });
        handLandmarkerRef.current = landmarker;
        console.log("MediaPipeProvider: Model loaded for 2 hands successfully.");
      } catch (error) {
        console.error("MediaPipeProvider: Error loading model.", error);
      }
    };
    createHandLandmarker();
  }, []);

  const predictWebcam = useCallback(() => {
    const video = videoRef.current;
    const handLandmarker = handLandmarkerRef.current;

    if (!video || !handLandmarker || video.videoWidth === 0) {
      animationFrameId.current = requestAnimationFrame(predictWebcam);
      return;
    }

    if (video.currentTime !== lastVideoTime.current) {
        lastVideoTime.current = video.currentTime;
        const results = handLandmarker.detectForVideo(video, performance.now());
        
        // --- NEW: Process and separate left/right hands ---
        const detectedHands: HandsResult = { left: null, right: null };
        if (results.landmarks && results.handedness && results.landmarks.length > 0) {
            for (let i = 0; i < results.landmarks.length; i++) {
                const hand = results.handedness[i][0].categoryName;
                if (hand === 'Left') {
                    detectedHands.left = results.landmarks[i];
                } else if (hand === 'Right') {
                    detectedHands.right = results.landmarks[i];
                }
            }
        }
        setHands(detectedHands);
    }
    
    animationFrameId.current = requestAnimationFrame(predictWebcam);
  }, []);
  
  const startCamera = async () => {
    if (isCameraActive || !handLandmarkerRef.current || !videoRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      const video = videoRef.current;
      video.srcObject = stream;
      
      video.onloadedmetadata = () => {
        setIsCameraActive(true);
        console.log("MediaPipeProvider: Camera started and metadata loaded.");
        predictWebcam();
      };
      
    } catch(err) {
      console.error("MediaPipeProvider: Error starting camera.", err);
    }
  };

  const stopCamera = () => {
    if (!isCameraActive || !videoRef.current) return;
    cancelAnimationFrame(animationFrameId.current);
    const stream = videoRef.current.srcObject as MediaStream;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    videoRef.current.srcObject = null;
    setIsCameraActive(false);
    setHands({ left: null, right: null }); // Reset both hands
    console.log("MediaPipeProvider: Camera stopped.");
  };

  const value = { hands, isCameraActive, startCamera, stopCamera };

  return (
    <MediaPipeContext.Provider value={value}>
      {children}
    </MediaPipeContext.Provider>
  );
};

export const useMediaPipe = (): MediaPipeContextType => {
  const context = useContext(MediaPipeContext);
  if (context === undefined) {
    throw new Error("useMediaPipe must be used within a MediaPipeProvider");
  }
  return context;
};
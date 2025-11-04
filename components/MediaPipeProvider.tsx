"use client";

import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from "react";
import { HandLandmarker, FilesetResolver, Landmark } from "@mediapipe/tasks-vision";

interface MediaPipeContextType {
  handLandmarks: Landmark[] | null;
  isCameraActive: boolean;
  startCamera: () => void;
  stopCamera: () => void;
}

const MediaPipeContext = createContext<MediaPipeContextType | undefined>(undefined);

export const MediaPipeProvider = ({ children }: { children: ReactNode }) => {
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const [handLandmarks, setHandLandmarks] = useState<Landmark[] | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  // Create a virtual video element that lives in this component's scope
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
          runningMode: "VIDEO", numHands: 1,
        });
        handLandmarkerRef.current = landmarker;
        console.log("MediaPipeProvider: Model loaded successfully.");
      } catch (error) {
        console.error("MediaPipeProvider: Error loading model.", error);
      }
    };
    createHandLandmarker();
  }, []);

  const predictWebcam = useCallback(() => {
    const video = videoRef.current;
    const handLandmarker = handLandmarkerRef.current;

    // Critical check: Ensure video is ready and has dimensions
    if (!video || !handLandmarker || video.videoWidth === 0 || video.videoHeight === 0) {
      animationFrameId.current = requestAnimationFrame(predictWebcam);
      return;
    }

    if (video.currentTime !== lastVideoTime.current) {
        lastVideoTime.current = video.currentTime;
        const results = handLandmarker.detectForVideo(video, performance.now());
        
        if (results.landmarks && results.landmarks.length > 0) {
          setHandLandmarks(results.landmarks[0]);
        } else {
          setHandLandmarks(null);
        }
    }
    
    animationFrameId.current = requestAnimationFrame(predictWebcam);
  }, []);
  
  const startCamera = async () => {
    if (isCameraActive || !handLandmarkerRef.current || !videoRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      const video = videoRef.current;
      video.srcObject = stream;
      
      // --- THE KEY FIX IS HERE ---
      // We add an event listener. The prediction loop will only start
      // AFTER the video has loaded its metadata and knows its dimensions.
      video.onloadedmetadata = () => {
        setIsCameraActive(true);
        console.log("MediaPipeProvider: Camera started and metadata loaded.");
        predictWebcam(); // Start the loop now that the video is ready
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
    setHandLandmarks(null);
    console.log("MediaPipeProvider: Camera stopped.");
  };

  const value = { handLandmarks, isCameraActive, startCamera, stopCamera };

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
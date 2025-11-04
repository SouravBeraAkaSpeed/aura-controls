"use client";

import { useEffect, useState, useRef, forwardRef, useCallback } from 'react';
import { HandLandmarker, FilesetResolver, DrawingUtils } from "@mediapipe/tasks-vision";

const AuraCursor = forwardRef<HTMLDivElement>((props, ref) => (
  <div
    ref={ref}
    className="fixed top-0 left-0 w-8 h-8 rounded-full bg-cyan-400/50 border-2 border-cyan-300 shadow-[0_0_20px_5px_rgba(0,255,255,0.7)] pointer-events-none transition-transform duration-75"
    style={{ transform: 'translate(-50%, -50%)', zIndex: 9999, opacity: 0 }}
  />
));
AuraCursor.displayName = 'AuraCursor';

const AuraBrowserTest = () => {
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [status, setStatus] = useState("Initializing...");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number>(0);
  const lastVideoTime = useRef(-1);

  // --- 1. Initialize the MediaPipe Model (runs only once) ---
  useEffect(() => {
    if (handLandmarkerRef.current) return;

    const createHandLandmarker = async () => {
      console.log("Step 1: Creating HandLandmarker...");
      setStatus("Loading AI model...");
      try {
        const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm");
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: `/hand_landmarker.task`, delegate: "GPU" },
          runningMode: "VIDEO", numHands: 1,
        });
        handLandmarkerRef.current = landmarker;
        setIsModelLoaded(true);
        setStatus("Ready! Click 'Start Demo'.");
        console.log("Step 2 (SUCCESS): HandLandmarker created and ready.");
      } catch (error) {
        console.error("Step 2a (FAIL): Error creating HandLandmarker:", error);
        setStatus("Error: AI model failed to load. Check console.");
      }
    };
    createHandLandmarker();
  }, []);

  // --- 2. The Main Prediction Loop ---
  const predictWebcam = useCallback(() => {
    const video = videoRef.current;
    const handLandmarker = handLandmarkerRef.current;
    const canvas = canvasRef.current;
    const cursor = cursorRef.current;

    if (!video || !handLandmarker || !canvas || !cursor || video.currentTime === lastVideoTime.current) {
      animationFrameId.current = requestAnimationFrame(predictWebcam);
      return;
    }
    
    lastVideoTime.current = video.currentTime;
    const results = handLandmarker.detectForVideo(video, performance.now());
    
    const canvasCtx = canvas.getContext("2d")!;
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

    if (results.landmarks && results.landmarks.length > 0) {
      const handLandmarks = results.landmarks[0];
      const drawingUtils = new DrawingUtils(canvasCtx);
      
      drawingUtils.drawConnectors(handLandmarks, HandLandmarker.HAND_CONNECTIONS, { color: "rgba(255, 255, 255, 0.7)", lineWidth: 2 });
      drawingUtils.drawLandmarks(handLandmarks, { color: "rgba(0, 255, 0, 0.8)", radius: 4 });
      
      const thumbTip = handLandmarks[4];
      const indexTip = handLandmarks[8];
      
      const distance = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y);
      const threshold = 0.07;

      if (distance < threshold) {
        cursor.style.opacity = '1';
        // The screenX coordinate is already mirrored because the drawing is now on a flipped canvas
        const screenX = window.innerWidth * (1 - indexTip.x); 
        const screenY = window.innerHeight * indexTip.y;
        cursor.style.transform = `translate(${screenX}px, ${screenY}px)`;
      } else {
        cursor.style.opacity = '0';
      }
    } else {
        cursor.style.opacity = '0';
    }
    
    canvasCtx.restore();
    animationFrameId.current = requestAnimationFrame(predictWebcam);
  }, []);

  // --- 3. Enable Webcam and Start the Loop ---
  const handleStart = async () => {
    if (!isModelLoaded || !handLandmarkerRef.current) {
      return;
    }
    
    if (isCameraActive) {
        const video = videoRef.current;
        if (video?.srcObject) {
            (video.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        }
        cancelAnimationFrame(animationFrameId.current);
        setIsCameraActive(false);
        setStatus("Ready! Click 'Start Demo'.");
        return;
    }

    setStatus("Requesting camera access...");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setIsCameraActive(true);
          setStatus("Camera active! Pinch your Thumb and Index finger.");
          predictWebcam();
        };
      }
    } catch (err) {
      console.error("Error accessing webcam:", err);
      setStatus("Camera access denied. Check browser settings.");
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full bg-black text-white overflow-hidden">
      <h1 className="text-4xl font-bold mb-4 z-10">Aura-Controls: Browser Demo</h1>
      <p className="text-lg mb-6 z-10">{status}</p>

      <div className="relative w-[640px] h-[480px] border-2 border-cyan-500 rounded-lg shadow-[0_0_20px_5px_rgba(0,255,255,0.3)] bg-gray-900 flex items-center justify-center">
        <video ref={videoRef} autoPlay playsInline className="absolute w-full h-full object-cover rounded-lg transform -scale-x-100" style={{ display: isCameraActive ? 'block' : 'none' }} />
        
        {/* --- THE FIX IS HERE --- */}
        {/* Added 'transform -scale-x-100' to the canvas to match the video */}
        <canvas ref={canvasRef} width="640" height="480" className="absolute w-full h-full rounded-lg transform -scale-x-100" />
        
        {!isCameraActive && (
          <div className="text-center p-8 bg-black bg-opacity-50 rounded-lg z-10">
            <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
            <ol className="text-left list-decimal list-inside space-y-2">
              <li>Click **&quot;Start Demo&quot;** and allow camera access.</li>
              <li>Pinch your **Thumb** and **Index** finger.</li>
              <li>Move your hand to control the **Aura Cursor**.</li>
            </ol>
          </div>
        )}
      </div>

      <button
        onClick={handleStart}
        disabled={!isModelLoaded}
        className="mt-8 px-6 py-3 rounded-lg font-bold text-lg transition-all disabled:bg-gray-600 disabled:cursor-not-allowed"
        style={{
            backgroundColor: isCameraActive ? '#D32F2F' : '#00ACC1',
            color: 'white'
        }}
      >
        {isModelLoaded ? (isCameraActive ? "Stop Demo" : "Start Demo") : "Loading Model..."}
      </button>
      
      <AuraCursor ref={cursorRef} />
    </div>
  );
};

export default AuraBrowserTest;
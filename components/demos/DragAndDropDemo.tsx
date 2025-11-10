"use client";

import { useMediaPipe } from "@/components/MediaPipeProvider";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const BoldText = ({ children }: { children: string }) => {
    const parts = children.split('**');
    return (<span>{parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="text-white/90 font-semibold">{part}</strong> : part)}</span>);
};

const DragAndDropDemo = () => {
    const { hands, isCameraActive } = useMediaPipe();
    const { right: handLandmarks } = hands;

    // State for positions and gestures
    const [cursorPosition, setCursorPosition] = useState({ x: -1, y: -1 }); // Start off-screen
    const [balloonPosition, setBalloonPosition] = useState({ x: 0.2, y: 0.5 });
    const [isAiming, setIsAiming] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const wasGrabbingRef = useRef(false);

    useEffect(() => {
        if (handLandmarks && isCameraActive) {
            const thumbTip = handLandmarks[4];
            const pinkyTip = handLandmarks[20];
            const ringTip = handLandmarks[16];

            const aimDistance = Math.hypot(thumbTip.x - pinkyTip.x, thumbTip.y - pinkyTip.y);
            const grabDistance = Math.hypot(thumbTip.x - ringTip.x, thumbTip.y - ringTip.y);

            const aimThreshold = 0.1;
            const grabThreshold = 0.07;

            const isAimingNow = aimDistance < aimThreshold;
            const isGrabbingNow = isAimingNow && grabDistance < grabThreshold;

            setIsAiming(isAimingNow);

            if (isAimingNow) {
                // Mirrored X for visual consistency
                const cursorX = 1 - ((thumbTip.x + pinkyTip.x) / 2);
                const cursorY = (thumbTip.y + pinkyTip.y) / 2;
                setCursorPosition({ x: cursorX, y: cursorY });

                if (isGrabbingNow && !wasGrabbingRef.current) { // This is the "grab" event
                    // Check if cursor is over the balloon
                    const balloonSize = 0.15; // Approximate normalized size
                    if (Math.abs(cursorX - balloonPosition.x) < balloonSize / 2 &&
                        Math.abs(cursorY - balloonPosition.y) < balloonSize / 2) {
                        setIsDragging(true);
                    }
                }

                if (isDragging) { // Update balloon position while dragging
                    setBalloonPosition({ x: cursorX, y: cursorY });
                }

            } else {
                setIsAiming(false);
            }

            // This is the "drop" event
            if (!isGrabbingNow && wasGrabbingRef.current && isDragging) {
                setIsDragging(false);
                // Define drop zone boundaries (normalized coordinates)
                const dropZone = { xMin: 0.6, xMax: 0.9, yMin: 0.35, yMax: 0.55 };
                if (balloonPosition.x > dropZone.xMin && balloonPosition.x < dropZone.xMax &&
                    balloonPosition.y > dropZone.yMin && balloonPosition.y < dropZone.yMax) {
                    setIsSuccess(true);
                    setTimeout(() => {
                        setIsSuccess(false);
                        setBalloonPosition({ x: 0.2, y: 0.5 }); // Reset balloon
                    }, 2000);
                }
            }

            wasGrabbingRef.current = isGrabbingNow;

        } else {
            setIsAiming(false);
            if (isDragging) setIsDragging(false); // Drop if hand is lost
        }
    }, [handLandmarks, isCameraActive, isDragging, balloonPosition.x, balloonPosition.y]);

    return (
        <div className="w-full max-w-7xl mx-auto p-8 sm:p-12 h-screen flex items-center justify-center rounded-2xl">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">

                {/* Right Column: Text Description */}
                <div className="text-left">
                    <h3 className="text-3xl sm:text-4xl font-bold mb-4 text-white w-fit cursor-target">Drag & Drop</h3>
                    <p className="text-base sm:text-lg text-white/60 mb-8 leading-relaxed">
                        Move objects across your screen with a two-stage gesture that separates aiming from grabbing,
                        giving you unparalleled precision.
                    </p>
                    <ul className="space-y-4 text-base sm:text-lg text-white/60">
                        <li className="flex items-start gap-4"><span className="text-purple-400 font-bold mt-1 text-xl">→</span><BoldText>Pinch **Thumb + Pinky** to aim the cursor.</BoldText></li>
                        <li className="flex items-start gap-4"><span className="text-purple-400 font-bold mt-1 text-xl">→</span><BoldText>While aiming over the object, also pinch **Thumb + Ring** to grab it.</BoldText></li>
                        <li className="flex items-start gap-4"><span className="text-purple-400 font-bold mt-1 text-xl">→</span><BoldText>Move your hand to drag, and release the **Thumb + Ring** pinch to drop it in the target zone.</BoldText></li>
                    </ul>
                </div>

                {/* Left Column: Interactive Demo */}
                <div className="relative cursor-target aspect-video bg-black border-2 border-purple-500/50 rounded-2xl flex items-center justify-center overflow-hidden">
                    {/* Drop Zone Target */}
                    <motion.div
                        className="absolute w-[40%] h-[50%] text-5xl  right-[10%] border-2 border-dashed border-green-500/80 rounded-2xl flex items-center justify-center transition-colors"
                        animate={{ backgroundColor: isSuccess ? 'rgba(74, 222, 128, 0.2)' : 'rgba(74, 222, 128, 0)' }}
                    >
                        {isSuccess ? "Success" : ""}

                    </motion.div>

                    {/* Draggable Balloon */}
                    <motion.div
                        className="absolute w-24 h-24 will-change-transform"
                        style={{
                            top: `${balloonPosition.y * 100}%`,
                            left: `${balloonPosition.x * 100}%`,
                            x: '-50%', y: '-50%',
                            filter: 'drop-shadow(0 0 15px rgba(239, 68, 68, 0.7))'
                        }}
                        animate={{ scale: isDragging ? 1.15 : 1, rotate: isDragging ? 5 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                    >
                        <Image src="/ballon.png" alt="Draggable object" width={96} height={96} />
                    </motion.div>

                    {/* Aiming Cursor (Tiny Red Dot) */}
                    <motion.div
                        className="absolute w-2 h-2 rounded-full bg-red-500 pointer-events-none"
                        style={{ top: `${cursorPosition.y * 100}%`, left: `${cursorPosition.x * 100}%`, transform: 'translate(-50%, -50%)' }}
                        animate={{ opacity: isAiming ? 1 : 0 }}
                    />

                    {!isCameraActive && (
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center p-4 border border-purple-500/50 rounded-lg">
                            <p className="text-white/80 text-lg text-center font-medium">Activate Live Demo to drag the object</p>
                        </div>
                    )}
                </div>


            </div>
        </div>
    );
};

export default DragAndDropDemo;
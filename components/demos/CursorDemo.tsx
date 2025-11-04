"use client";

import { useMediaPipe } from "@/components/MediaPipeProvider";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const BoldText = ({ children }: { children: string }) => {
    const parts = children.split('**');
    return (<span>{parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="text-white/90 font-semibold">{part}</strong> : part)}</span>);
};

const CursorDemo = () => {
    const { handLandmarks, isCameraActive } = useMediaPipe();
    const [cursorPosition, setCursorPosition] = useState({ x: 0.5, y: 0.5 });
    const [isPinching, setIsPinching] = useState(false);

    useEffect(() => {
        if (handLandmarks && isCameraActive) {
            const thumbTip = handLandmarks[4];
            const pinkyTip = handLandmarks[20];
            const distance = Math.hypot(thumbTip.x - pinkyTip.x, thumbTip.y - pinkyTip.y);
            const threshold = 0.1;

            if (distance < threshold) {
                setIsPinching(true);
                setCursorPosition({ x: 1 - pinkyTip.x, y: pinkyTip.y });
            } else {
                setIsPinching(false);
            }
        } else {
            setIsPinching(false);
        }
    }, [handLandmarks, isCameraActive]);

    return (
        <div className="w-full max-w-7xl mx-auto p-8 sm:p-12 h-screen flex items-center justify-center rounded-2xl">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">


                <div className="text-left">
                    <h3 className="text-3xl sm:text-4xl font-bold mb-4 text-white">Precision Cursor Control</h3>
                    <p className="text-base sm:text-lg text-white/60 mb-8 leading-relaxed">
                        Navigate your digital space with newfound freedom. The cursor control gesture is designed
                        for intuitive and comfortable long-distance interaction.
                    </p>
                    <ul className="space-y-4 text-base sm:text-lg text-white/60">
                        <li className="flex items-start gap-4"><span className="text-purple-400 font-bold mt-1 text-xl">→</span><BoldText>Pinch your **Thumb and Pinky Finger** together to summon the cursor.</BoldText></li>
                        <li className="flex items-start gap-4"><span className="text-purple-400 font-bold mt-1 text-xl">→</span><BoldText>Move your hand while pinching to guide the cursor across the screen.</BoldText></li>
                        <li className="flex items-start gap-4"><span className="text-purple-400 font-bold mt-1 text-xl">→</span><BoldText>Release the pinch to dismiss the cursor.</BoldText></li>
                    </ul>
                </div>
                <div className="relative aspect-video bg-black border-2 border-purple-500/50 rounded-lg overflow-hidden">
                    <div className="absolute inset-0" style={{
                        backgroundSize: '40px 40px',
                        backgroundImage: 'linear-gradient(to right, rgba(167, 139, 250, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(167, 139, 250, 0.1) 1px, transparent 1px)',
                    }} />

                    <motion.div
                        className="absolute w-8 h-8 rounded-full bg-cyan-400 border-2 border-cyan-300 pointer-events-none"
                        style={{ boxShadow: '0 0 20px 5px rgba(0, 255, 255, 0.7)', top: `${cursorPosition.y * 100}%`, left: `${cursorPosition.x * 100}%`, transform: 'translate(-50%, -50%)' }}
                        animate={{ opacity: isPinching ? 1 : 0, scale: isPinching ? 1 : 0.5 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                    />

                    {/* --- THE FIX IS HERE: Elegant Overlay --- */}
                    {!isCameraActive && (
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center p-4 border border-purple-500/50 rounded-lg">
                            <p className="text-white/80 text-lg text-center font-medium">Activate Live Demo to control the cursor</p>
                        </div>
                    )}
                </div>


            </div>
        </div>
    );
};

export default CursorDemo;
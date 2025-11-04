"use client";

import { useMediaPipe } from "@/components/MediaPipeProvider";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

const BoldText = ({ children }: { children: string }) => {
    const parts = children.split('**');
    return (<span>{parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="text-white/90 font-semibold">{part}</strong> : part)}</span>);
};

const demoButtons = [
    { id: 'btn1', className: 'w-24 h-24 rounded-full bg-purple-500' },
    { id: 'btn2', className: 'w-32 h-16 rounded-lg bg-cyan-500' },
    { id: 'btn3', className: 'w-20 h-20 rounded-2xl bg-pink-500' },
    { id: 'btn4', className: 'w-40 h-16 rounded-full bg-yellow-400' },
];

const ClickDemo = () => {
    const { handLandmarks, isCameraActive } = useMediaPipe();
    const [cursorPosition, setCursorPosition] = useState({ x: -1, y: -1 });
    const [clickedButtonId, setClickedButtonId] = useState<string | null>(null);
    
    const wasPinchingRef = useRef(false);
    const demoAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (handLandmarks && isCameraActive && demoAreaRef.current) {
            const thumbTip = handLandmarks[4];
            const ringTip = handLandmarks[16];
            const midPointX = 1 - ((thumbTip.x + ringTip.x) / 2); // Mirrored
            const midPointY = (thumbTip.y + ringTip.y) / 2;
            
            setCursorPosition({ x: midPointX, y: midPointY });

            const distance = Math.hypot(thumbTip.x - ringTip.x, thumbTip.y - ringTip.y);
            const threshold = 0.07;
            const isPinchingNow = distance < threshold;

            if (isPinchingNow && !wasPinchingRef.current) {
                const demoRect = demoAreaRef.current.getBoundingClientRect();
                const clickX = demoRect.left + (midPointX * demoRect.width);
                const clickY = demoRect.top + (midPointY * demoRect.height);
                
                demoButtons.forEach(button => {
                    const btnElement = document.getElementById(button.id);
                    if(btnElement) {
                        const btnRect = btnElement.getBoundingClientRect();
                        if (clickX > btnRect.left && clickX < btnRect.right && clickY > btnRect.top && clickY < btnRect.bottom) {
                            setClickedButtonId(button.id);
                            setTimeout(() => setClickedButtonId(null), 300);
                        }
                    }
                });
            }
            wasPinchingRef.current = isPinchingNow;
        } else {
            setCursorPosition({ x: -1, y: -1 }); // Hide cursor
        }
    }, [handLandmarks, isCameraActive]);

    return (
        <div className="w-full max-w-7xl mx-auto p-8 sm:p-12 h-screen flex items-center justify-centerrounded-2xl">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
                {/* Left Column: Interactive Demo */}
                <div ref={demoAreaRef} className="relative aspect-video bg-black border-2 border-purple-500/50 rounded-lg overflow-hidden">
                    {/* --- THE FIX IS HERE: Responsive Flexbox Layout --- */}
                    <div className="absolute inset-0 p-4 flex flex-wrap items-center justify-center gap-4">
                        {demoButtons.map(button => (
                            <motion.div
                                key={button.id}
                                id={button.id}
                                className={button.className}
                                animate={{ 
                                    scale: clickedButtonId === button.id ? 1.15 : 1,
                                    filter: clickedButtonId === button.id ? 'brightness(1.5)' : 'brightness(1)',
                                }}
                                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                            />
                        ))}
                    </div>
                    
                    <motion.div
                        className="absolute w-6 h-6 rounded-full border-2 border-white pointer-events-none"
                        style={{ top: `${cursorPosition.y * 100}%`, left: `${cursorPosition.x * 100}%`, transform: 'translate(-50%, -50%)' }}
                        animate={{ opacity: cursorPosition.x >= 0 ? 0.7 : 0 }}
                    />
                    
                    {/* --- THE FIX IS HERE: Elegant Overlay --- */}
                    {!isCameraActive && (
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center p-4 border border-purple-500/50 rounded-lg">
                           <p className="text-white/80 text-lg text-center font-medium">Activate Live Demo to click the buttons</p>
                        </div>
                    )}
                </div>

                {/* Right Column: Text Description */}
                <div className="text-left">
                    <h3 className="text-3xl sm:text-4xl font-bold mb-4 text-white">Targeted Clicking</h3>
                    <p className="text-base sm:text-lg text-white/60 mb-8 leading-relaxed">
                        Perform precise clicks without touching your mouse. The click gesture is quick,
                        ergonomic, and perfect for interacting with UI elements from a distance.
                    </p>
                    <ul className="space-y-4 text-base sm:text-lg text-white/60">
                        <li className="flex items-start gap-4"><span className="text-purple-400 font-bold mt-1 text-xl">→</span><BoldText>Use your hand to guide the aiming reticle over a target.</BoldText></li>
                        <li className="flex items-start gap-4"><span className="text-purple-400 font-bold mt-1 text-xl">→</span><BoldText>Briefly tap your **Thumb and Ring Finger** together to fire a "click".</BoldText></li>
                        <li className="flex items-start gap-4"><span className="text-purple-400 font-bold mt-1 text-xl">→</span><BoldText>A successful hit will cause the target to flash.</BoldText></li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ClickDemo;
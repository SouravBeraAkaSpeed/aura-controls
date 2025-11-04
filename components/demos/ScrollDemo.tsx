"use client";

import { useMediaPipe } from "@/components/MediaPipeProvider";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Landmark } from "@mediapipe/tasks-vision";

// --- Helper Functions with the FIX ---
const is_pointing_index = (handLandmarks: Landmark[]): boolean => {
    try {
        const index_up = handLandmarks[8].y < handLandmarks[6].y;
        const middle_down = handLandmarks[12].y > handLandmarks[10].y;
        const ring_down = handLandmarks[16].y > handLandmarks[14].y;
        const pinky_down = handLandmarks[20].y > handLandmarks[18].y;
        // Correct way to check if all are true in JavaScript/TypeScript
        return [index_up, middle_down, ring_down, pinky_down].every(Boolean);
    } catch { return false; }
};

const is_pointing_middle = (handLandmarks: Landmark[]): boolean => {
    try {
        const index_down = handLandmarks[8].y > handLandmarks[6].y;
        const middle_up = handLandmarks[12].y < handLandmarks[10].y;
        const ring_down = handLandmarks[16].y > handLandmarks[14].y;
        const pinky_down = handLandmarks[20].y > handLandmarks[18].y;
        // Correct way to check if all are true in JavaScript/TypeScript
        return [index_down, middle_up, ring_down, pinky_down].every(Boolean);
    } catch { return false; }
};
// ------------------------------------

const BoldText = ({ children }: { children: string }) => {
    const parts = children.split('**');
    return (<span>{parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="text-white/90 font-semibold">{part}</strong> : part)}</span>);
};

const scrollContent = [
    { title: "Principle I: Fluidity", text: "Interaction should feel like an extension of thought. Gestures are designed to be natural, minimizing cognitive load and maximizing flow." },
    { title: "Principle II: Precision", text: "From pixel-perfect cursor placement to frame-by-frame media scrubbing, Aura-Controls provides the accuracy needed for professional and creative tasks." },
    { title: "Principle III: Responsiveness", text: "Powered by a highly optimized engine, the system ensures near-zero latency, making the connection between your movement and the digital response feel instantaneous." },
    { title: "Principle IV: Ergonomics", text: "Break free from the desk. Control your environment from a comfortable distance, reducing physical strain and redefining your workspace." },
    { title: "Principle V: Intelligence", text: "The system understands context. A gesture's function can adapt, providing the right tool at the right time, whether you're presenting, designing, or relaxing." },
    { title: "Principle VI: Immersion", text: "Aura-Controls is more than a utility; it's an experience. It's designed to make you feel more connected to your digital world, blurring the line between user and interface." },
];

const ScrollDemo = () => {
    const { handLandmarks, isCameraActive } = useMediaPipe();
    const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const animationFrameId = useRef<number>(0);

    useEffect(() => {
        if (handLandmarks && isCameraActive) {
            if (is_pointing_index(handLandmarks)) {
                setScrollDirection('up');
            } else if (is_pointing_middle(handLandmarks)) {
                setScrollDirection('down');
            } else {
                setScrollDirection(null);
            }
        } else {
            setScrollDirection(null);
        }
    }, [handLandmarks, isCameraActive]);

    useEffect(() => {
        const scrollStep = () => {
            if (scrollAreaRef.current && scrollDirection) {
                const scrollAmount = scrollDirection === 'up' ? -2 : 2;
                scrollAreaRef.current.scrollTop += scrollAmount;
            }
            animationFrameId.current = requestAnimationFrame(scrollStep);
        };

        if (scrollDirection) {
            animationFrameId.current = requestAnimationFrame(scrollStep);
        }

        return () => {
            cancelAnimationFrame(animationFrameId.current);
        };
    }, [scrollDirection]);

    return (
        <div className="w-full max-w-7xl mx-auto p-8 sm:p-12 h-screen flex items-center justify-center rounded-2xl">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
                <div ref={scrollAreaRef} className="relative h-96 bg-black border-2 border-purple-500/50 rounded-lg overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-transparent">
                    <AnimatePresence>
                        {scrollDirection === 'up' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="sticky top-0 h-12 w-full bg-gradient-to-t from-transparent to-purple-500/50 blur-md -mt-6" />
                        )}
                    </AnimatePresence>

                    <div className="space-y-8 relative z-10">
                        {scrollContent.map((item, index) => (
                            <div key={index}>
                                <h4 className="text-xl font-bold text-purple-300 mb-2">{item.title}</h4>
                                <p className="text-white/70 leading-relaxed">{item.text}</p>
                            </div>
                        ))}
                    </div>

                    <AnimatePresence>
                        {scrollDirection === 'down' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="sticky bottom-0 h-12 w-full bg-gradient-to-b from-transparent to-purple-500/50 blur-md -mb-6" />
                        )}
                    </AnimatePresence>

                    {!isCameraActive && (
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center p-4 border border-purple-500/50 rounded-lg z-20">
                            <p className="text-white/80 text-lg text-center font-medium">Activate Live Demo to scroll</p>
                        </div>
                    )}
                </div>

                <div className="text-left">
                    <h3 className="text-3xl sm:text-4xl font-bold mb-4 text-white">Seamless Scrolling</h3>
                    <p className="text-base sm:text-lg text-white/60 mb-8 leading-relaxed">
                        Navigate long documents and webpages effortlessly. Hold a gesture to engage a smooth,
                        continuous scroll at a comfortable speed.
                    </p>
                    <ul className="space-y-4 text-base sm:text-lg text-white/60">
                        <li className="flex items-start gap-4"><span className="text-purple-400 font-bold mt-1 text-xl">→</span><BoldText>Raise only your **Index Finger** to continuously scroll **Up**.</BoldText></li>
                        <li className="flex items-start gap-4"><span className="text-purple-400 font-bold mt-1 text-xl">→</span><BoldText>Raise only your **Middle Finger** to continuously scroll **Down**.</BoldText></li>
                        <li className="flex items-start gap-4"><span className="text-purple-400 font-bold mt-1 text-xl">→</span><BoldText>Lower your finger to instantly stop scrolling.</BoldText></li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ScrollDemo;
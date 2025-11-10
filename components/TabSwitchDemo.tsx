"use client";

import { useMediaPipe } from "@/components/MediaPipeProvider";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Landmark } from "@mediapipe/tasks-vision";

const is_palm_open = (handLandmarks: Landmark[]): boolean => {
    try {
        const checks = [
            handLandmarks[8].y < handLandmarks[6].y,  // Index
            handLandmarks[12].y < handLandmarks[10].y, // Middle
            handLandmarks[16].y < handLandmarks[14].y, // Ring
            handLandmarks[20].y < handLandmarks[18].y, // Pinky
        ];
        return checks.every(Boolean);
    } catch { return false; }
};

const BoldText = ({ children }: { children: string }) => {
    const parts = children.split('**');
    return (<span>{parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="text-white/90 font-semibold">{part}</strong> : part)}</span>);
};

const demoTabs = [
    { id: 'home', label: 'Dashboard', color: 'bg-purple-500' },
    { id: 'analytics', label: 'Analytics', color: 'bg-cyan-500' },
    { id: 'settings', label: 'Settings', color: 'bg-pink-500' },
    { id: 'profile', label: 'Profile', color: 'bg-yellow-400' },
];

const TabSwitchDemo = () => {
    const { hands, isCameraActive } = useMediaPipe();
    const { left: leftHand } = hands;

    const [isSwitching, setIsSwitching] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [selectedTab, setSelectedTab] = useState<string | null>(null);

    const lastHandXRef = useRef(0);
    const lastSwipeTimeRef = useRef(0);

    useEffect(() => {
        if (leftHand && isCameraActive && is_palm_open(leftHand)) {
            if (!isSwitching) setIsSwitching(true); // Enter switching mode

            const wrist = leftHand[0];
            const currentHandX = wrist.x;
            const currentTime = Date.now();

            const SWIPE_SENSITIVITY = 0.03;
            const SWIPE_COOLDOWN = 500; // ms

            if (lastHandXRef.current !== 0 && (currentTime - lastSwipeTimeRef.current > SWIPE_COOLDOWN)) {
                const deltaX = currentHandX - lastHandXRef.current;

                if (Math.abs(deltaX) > SWIPE_SENSITIVITY) {
                    if (deltaX > 0) { // Physical right swipe (looks left on screen)
                        setActiveIndex(prev => Math.max(0, prev - 1));
                    } else { // Physical left swipe (looks right on screen)
                        setActiveIndex(prev => Math.min(demoTabs.length - 1, prev + 1));
                    }
                    lastSwipeTimeRef.current = currentTime;
                }
            }
            lastHandXRef.current = currentHandX;

        } else {
            if (isSwitching) { // This is the "selection" event
                setIsSwitching(false);
                setSelectedTab(demoTabs[activeIndex].label);
                setTimeout(() => setSelectedTab(null), 1500); // Clear selection message
            }
            lastHandXRef.current = 0; // Reset tracking
        }
    }, [leftHand, isCameraActive, isSwitching, activeIndex]);

    return (
        <div className="w-full max-w-7xl mx-auto p-8 sm:p-12 h-screen flex items-center justify-center rounded-2xl">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">


                {/* Right Column: Text Description */}
                <div className="text-left">
                    <h3 className="text-3xl sm:text-4xl font-bold mb-4 text-white  w-fit cursor-target">Fluid App Switching</h3>
                    <p className="text-base sm:text-lg text-white/60 mb-8 leading-relaxed">
                        Cycle through your applications with a dedicated auxiliary gesture, keeping your primary hand free for precision tasks.
                    </p>
                    <ul className="space-y-4 text-base sm:text-lg text-white/60">
                        <li className="flex items-start gap-4"><span className="text-purple-400 font-bold mt-1 text-xl">→</span><BoldText>Show your **Left Palm** to bring up the app switcher.</BoldText></li>
                        <li className="flex items-start gap-4"><span className="text-purple-400 font-bold mt-1 text-xl">→</span><BoldText>Swipe your hand **Left or Right** to cycle through the tabs.</BoldText></li>
                        <li className="flex items-start gap-4"><span className="text-purple-400 font-bold mt-1 text-xl">→</span><BoldText>Hide your palm to **select** the highlighted tab.</BoldText></li>
                    </ul>
                </div>

                {/* Left Column: Interactive Demo */}
                <div className="relative aspect-video cursor-target bg-black border-2 border-purple-500/50 rounded-lg overflow-hidden flex items-center justify-center">

                    <AnimatePresence>
                        {isSwitching && (
                            <motion.div
                                className="w-full h-full flex items-center"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <motion.div
                                    className="flex gap-4 px-4"
                                    animate={{ x: `calc(50% - ${activeIndex * 144 + 64}px)` }} // 128px width + 16px gap
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                >
                                    {demoTabs.map((tab, index) => (
                                        <motion.div
                                            key={tab.id}
                                            className={`flex-shrink-0 w-32 h-48 rounded-2xl ${tab.color} flex items-center justify-center text-white font-bold text-lg`}
                                            animate={{ scale: activeIndex === index ? 1.05 : 0.9, opacity: activeIndex === index ? 1 : 0.5 }}
                                        >
                                            {tab.label}
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {selectedTab && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute text-center">
                                <p className="text-white/70">Selected:</p>
                                <p className="text-3xl font-bold text-purple-400">{selectedTab}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!isCameraActive && (
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center p-4 border border-purple-500/50 rounded-lg">
                            <p className="text-white/80 text-lg text-center font-medium">Activate Live Demo for App Switching</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TabSwitchDemo;
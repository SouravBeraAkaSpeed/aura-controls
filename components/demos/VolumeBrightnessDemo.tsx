"use client";

import { useMediaPipe } from "@/components/MediaPipeProvider";
import { useEffect, useState, useRef, ReactNode } from "react";
import ElasticSlider from "@/components/ElasticSlider";

// Helper to parse **bold** text
const BoldText = ({ children }: { children: string }) => {
    const parts = children.split('**');
    return (
        <span>
            {parts.map((part, index) => 
                index % 2 === 1 ? <strong key={index} className="text-white/90 font-semibold">{part}</strong> : part
            )}
        </span>
    );
};

// SVG Icon Components
const VolumeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
    </svg>
);

const BrightnessIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
);

const VolumeBrightnessDemo = () => {
    const { handLandmarks, isCameraActive } = useMediaPipe();
    const [volume, setVolume] = useState(50);
    const [brightness, setBrightness] = useState(70);

    const lastPosRef = useRef<{ x: number; y: number } | null>(null);

    useEffect(() => {
        if (handLandmarks && isCameraActive) {
            const thumbTip = handLandmarks[4];
            const indexTip = handLandmarks[8];
            const distance = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y);
            const threshold = 0.07;

            if (distance < threshold) {
                const currentPos = { x: indexTip.x, y: indexTip.y };
                if (lastPosRef.current) {
                    const deltaX = currentPos.x - lastPosRef.current.x;
                    const deltaY = currentPos.y - lastPosRef.current.y;
                    const sensitivity = 0.01;
                    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > sensitivity) {
                        setVolume(prev => Math.max(0, Math.min(100, prev + (deltaY * -200))));
                    } else if (Math.abs(deltaX) > sensitivity) {
                        setBrightness(prev => Math.max(0, Math.min(100, prev + (deltaX * 200))));
                    }
                }
                lastPosRef.current = currentPos;
            } else { lastPosRef.current = null; }
        } else { lastPosRef.current = null; }
    }, [handLandmarks, isCameraActive]);

    return (
        <div id="volumebrightness" className="w-full max-w-7xl mx-auto p-12 h-screen flex items-center justify-center  rounded-2xl">
            <div className="grid md:grid-cols-2 gap-16 items-center">
                {/* Left Column: Interactive Demo */}
                <div className="flex flex-col gap-12">
                    <div className="relative">
                        <label className="text-xl font-medium mb-2 block text-white/90">Volume</label>
                        <ElasticSlider
                            value={volume}
                            onValueChange={setVolume}
                            maxValue={100}
                            leftIcon={<VolumeIcon />}
                            rightIcon={<VolumeIcon />}
                        />
                    </div>
                    <div className="relative">
                        <label className="text-xl font-medium mb-2 block text-white/90">Brightness</label>
                        <ElasticSlider
                            value={brightness}
                            onValueChange={setBrightness}
                            maxValue={100}
                            leftIcon={<BrightnessIcon />}
                            rightIcon={<BrightnessIcon />}
                        />
                    </div>
                </div>

                {/* Right Column: Text Description */}
                <div className="text-left">
                    <h3 className="text-4xl font-bold mb-4 text-white">Intuitive System Control</h3>
                    <p className="text-lg text-white/60 mb-8 leading-relaxed">
                        No more fumbling for function keys. With Aura-Controls, a simple pinch gesture
                        gives you immediate access to core system utilities.
                    </p>
                    <ul className="space-y-4 text-lg text-white/60">
                        <li className="flex items-start gap-4">
                            <span className="text-purple-400 font-bold mt-1 text-xl">→</span>
                            <BoldText>Pinch your **Thumb and Index Finger** together to activate control mode.</BoldText>
                        </li>
                        <li className="flex items-start gap-4">
                            <span className="text-purple-400 font-bold mt-1 text-xl">→</span>
                            <BoldText>Move your hand **Up or Down** to adjust the volume.</BoldText>
                        </li>
                        <li className="flex items-start gap-4">
                            <span className="text-purple-400 font-bold mt-1 text-xl">→</span>
                            <BoldText>Move your hand **Left or Right** to change screen brightness.</BoldText>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default VolumeBrightnessDemo;
"use client";

import { useMediaPipe } from "@/components/MediaPipeProvider";
import VolumeBrightnessDemo from "./demos/VolumeBrightnessDemo";
import CursorDemo from "./demos/CursorDemo";
import { useRouter } from "next/navigation";

const ExploreSection = () => {
    const { isCameraActive, startCamera, stopCamera } = useMediaPipe();
    const router = useRouter()

    return (
        <section id="explore" className="relative z-10 w-full  px-4 h-full">
            <div className="flex flex-col items-center justify-center gap-12 h-screen">
                <h2 className="text-5xl md:text-6xl font-bold text-center">Explore the Gestures</h2>

                <p className="text-center text-lg text-white/70 max-w-2xl">
                    Activate the live demo to control these components directly with your hand. The experience is designed to be seamless, intuitive, and a little bit magical.
                </p>

                <button
                    onClick={isCameraActive ? stopCamera : () => {
                        startCamera()
                        router.push("/#volumebrightness")
                    }}
                    className={`px-8 py-4 rounded-full font-bold text-xl transition-all duration-300
                        ${isCameraActive
                            ? 'bg-red-600 hover:bg-red-700 text-white shadow-[0_0_20px_4px_rgba(239,68,68,0.5)]'
                            : 'bg-purple-600 hover:bg-purple-700 text-white shadow-[0_0_20px_4px_rgba(147,51,234,0.5)]'}`
                    }
                >
                    {isCameraActive ? "Stop Live Demo" : "Try Live in Browser"}
                </button>

            </div>
            {/* The demo components are now ALWAYS visible */}
            <div className="w-full h-full mt-8 space-y-16">
                <VolumeBrightnessDemo />
                <CursorDemo />
                {/* You can add more demo components here */}
            </div>
        </section>
    );
};

export default ExploreSection;
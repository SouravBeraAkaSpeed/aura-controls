"use client";

import { motion, Variants } from "framer-motion";
import { SparklesIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

// Animation variants for the main container and its items
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
            delayChildren: 0.3,
        },
    },
};

const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.5,
            ease: "easeOut" as const,
        },
    },
};

// Animation variant for the strikethrough line
const strikethroughVariant: Variants = {
    hidden: { width: "0%" },
    visible: {
        width: "100%",
        transition: {
            duration: 0.4,
            ease: "easeInOut",
            delay: 1.2,
        },
    },
};

// Animation variant for the "Controllers" text to appear after the line
const newTextVariant: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.4,
            ease: "easeOut",
            delay: 1.5,
        },
    },
};

const HeroSection = () => {

    const router = useRouter()
    return (
        <div className="relative z-40 flex h-fit mt:mt-[60px] mt-[100px] mb-[200px] w-full flex-col items-center justify-center text-center px-4">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="flex flex-col items-center gap-6"
            >
                {/* "Get Excited" Button */}
                <motion.div
                    variants={itemVariants}
                    className="flex items-center gap-2 px-4 py-2 bg-black/20 border border-white/20 rounded-full backdrop-blur-sm cursor-pointer"
                >
                    <SparklesIcon className="w-5 h-5 text-purple-400" />
                    <span className="text-sm font-medium text-white/80">Get Excited</span>
                </motion.div>

                {/* Main Headline */}
                <motion.h1
                    variants={itemVariants}
                    className="text-3xl md:text-7xl font-bold tracking-tight text-white leading-tight"
                >
                    Hold on, scanning for <br />
                    <span className="inline-flex items-center">
                        Aura
                        {/* --- THE FIX IS HERE --- */}
                        {/* Use inline-flex to place items side-by-side */}
                        <div className="inline-flex items-center ml-4">
                            {/* The "Farmers" text with strikethrough */}
                            <span className="relative text-purple-400">
                                Farmers
                                <motion.span
                                    initial="hidden"
                                    animate="visible"
                                    variants={strikethroughVariant}
                                    className="absolute left-0 top-1/2 h-[2px] bg-white"
                                    style={{ transform: 'translateY(-50%)' }}
                                />
                            </span>
                            {/* The "Controllers" text that fades in. Removed absolute positioning. */}
                            <motion.span
                                initial="hidden"
                                animate="visible"
                                variants={newTextVariant}
                                className="ml-4 text-purple-400 whitespace-nowrap" // Added margin-left for spacing
                            >
                                Controllers.
                            </motion.span>
                        </div>
                    </span>
                </motion.h1>

                {/* Action Buttons */}
                <motion.div variants={itemVariants} className="flex gap-4 mt-4">
                    <button onClick={() => {
                        router.push("/#pricing")
                    }} className="px-8 py-3 cursor-pointer bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-colors duration-300">
                        Get Started
                    </button>
                    <button onClick={() => {
                        router.push("/#explore")
                    }} className="px-8 py-3 cursor-pointer bg-black/20 border border-white/20 text-white/80 font-semibold rounded-full hover:bg-white/10 transition-colors duration-300">
                        Explore
                    </button>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default HeroSection;
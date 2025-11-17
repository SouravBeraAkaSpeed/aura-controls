"use client";
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';

const DownloadSection = () => {
    const windowsDownloadUrl = "https://pub-2a36f8b0425e47ee8ed97be6d739f2f4.r2.dev/aura-controls.zip";

    return (
        <motion.section
            className="text-center p-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-lg"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
        >
            <div className="flex justify-center mb-4">
                <Download className="w-12 h-12 text-purple-400" />
            </div>
            <h2 className="text-4xl font-bold mb-4 text-white">Download Aura-Controls</h2>
            <p className="text-white/70 mb-8 max-w-2xl mx-auto">
                Get the full desktop application to unlock the future of interaction. Your credentials below will activate the software.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6">

                {/* --- THE FIX IS HERE: Windows Download Button --- */}
                <a href={windowsDownloadUrl} download="aura-controls.zip">
                    <motion.button
                        className="w-full sm:w-auto px-8 py-3 bg-white text-black font-semibold rounded-full"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        Download for Windows
                    </motion.button>
                </a>

                {/* --- macOS Download Button (Disabled for now) --- */}
                <motion.button
                    className="w-full sm:w-auto px-8 py-3 bg-white/10 border border-white/20 text-white/50 font-semibold rounded-full cursor-not-allowed"
                    title="Coming soon!"
                >
                    Download for macOS
                </motion.button>

            </div>
        </motion.section>
    );
};

export default DownloadSection;
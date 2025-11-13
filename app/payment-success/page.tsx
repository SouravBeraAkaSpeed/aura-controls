"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

const PaymentSuccessPage = () => {
    const router = useRouter();

    useEffect(() => {
        // Redirect to the dashboard after a short delay
        const timer = setTimeout(() => {
            router.push('/dashboard');
        }, 3000); // 3-second delay

        return () => clearTimeout(timer); // Cleanup the timer
    }, [router]);

    return (
        <div className="relative min-h-screen w-full bg-black text-white flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-[-200px] left-[-150px] w-[400px] h-[400px] bg-purple-700/40 rounded-full blur-[180px]" />
                <div className="absolute bottom-[-150px] right-[-100px] w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[200px]" />
            </div>

            <motion.div
                className="relative z-10 flex flex-col items-center text-center p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 10 }}
                >
                    <CheckCircle className="w-16 h-16 text-green-400 mb-6" />
                </motion.div>
                <h1 className="text-4xl font-bold text-white mb-3">Payment Successful!</h1>
                <p className="text-white/70">Your subscription is now active. We're preparing your dashboard.</p>
                <p className="text-white/70 mt-4">Redirecting you now...</p>
            </motion.div>
        </div>
    );
};

export default PaymentSuccessPage;
// app/subscribe/checkout/page.tsx
"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle } from 'lucide-react';

const CheckoutPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const checkoutUrl = searchParams.get('url');

    const [status, setStatus] = useState<'waiting' | 'polling' | 'success'>('waiting');

    useEffect(() => {
        if (checkoutUrl) {
            // Open Razorpay in a new tab
            window.open(checkoutUrl, '_blank');
            setStatus('polling');
        } else {
            // If no URL, just redirect back to pricing
            router.push('/#pricing');
        }
    }, [checkoutUrl, router]);

    useEffect(() => {
        if (status !== 'polling') return;

        const token = localStorage.getItem("sessionToken");
        if (!token) {
            router.push('/sign-in');
            return;
        }

        // Poll the backend every 3 seconds to check for subscription status
        const intervalId = setInterval(async () => {
            try {
                const res = await fetch('/api/billing/check-status', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();

                if (data.status === 'active') {
                    setStatus('success');
                    clearInterval(intervalId);
                    // Redirect to dashboard after a short delay
                    setTimeout(() => router.push('/dashboard'), 2000);
                }
            } catch (error) {
                console.error("Polling error:", error);
            }
        }, 3000);

        return () => clearInterval(intervalId); // Cleanup on unmount
    }, [status, router]);

    return (
        <div className="relative min-h-screen w-full bg-black text-white flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/30 rounded-full blur-[150px]" />
                <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-blue-600/20 rounded-full blur-[200px]" />
            </div>

            <motion.div
                className="relative z-10 flex flex-col items-center text-center p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-lg max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {status === 'success' ? (
                    <>
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
                            <CheckCircle className="w-16 h-16 text-green-400 mb-6" />
                        </motion.div>
                        <h1 className="text-3xl font-bold">Payment Confirmed!</h1>
                        <p className="text-white/70 mt-2">Your subscription is active. Redirecting to your dashboard...</p>
                    </>
                ) : (
                    <>
                        <Loader2 className="w-16 h-16 text-purple-400 mb-6 animate-spin" />
                        <h1 className="text-3xl font-bold">Awaiting Confirmation</h1>
                        <p className="text-white/70 mt-2">Your checkout has opened in a new tab. This page will update automatically once your payment is confirmed.</p>
                        <p className="text-xs text-white/40 mt-4">(This may take a few moments)</p>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default CheckoutPage;
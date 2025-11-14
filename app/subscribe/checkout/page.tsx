"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle, ExternalLink } from 'lucide-react';

const CheckoutPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const checkoutUrl = searchParams.get('url');

    const [status, setStatus] = useState<'waiting' | 'polling' | 'success'>('waiting');
    const razorpayTab = useRef<Window | null>(null);

    useEffect(() => {
        if (checkoutUrl) {
            // Store a reference to the new tab
            razorpayTab.current = window.open(checkoutUrl, '_blank');
            if (razorpayTab.current) {
                setStatus('polling');
            } else {
                // This happens if a popup blocker is active
                setStatus('waiting');
                alert("Please disable your pop-up blocker and try again. A new tab needs to open for payment.");
            }
        } else {
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

        const intervalId = setInterval(async () => {
            try {
                const res = await fetch('/api/billing/check-status', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();

                if (data.status === 'active') {
                    setStatus('success');
                    clearInterval(intervalId);

                    // --- THE KEY UX CHANGE IS HERE ---
                    // While we can't reliably close the tab, this is the safest attempt.
                    // In many modern browsers, this will not work for security reasons.
                    // The primary UX is the message on our page telling the user they can close it.
                    if (razorpayTab.current && !razorpayTab.current.closed) {
                        razorpayTab.current.close();
                    }

                    setTimeout(() => router.push('/dashboard'), 3000); // Redirect after 3 seconds
                }
            } catch (error) {
                console.error("Polling error:", error);
            }
        }, 3000);

        return () => clearInterval(intervalId);
    }, [status, router]);

    const getStatusContent = () => {
        switch (status) {
            case 'success':
                return {
                    icon: <CheckCircle className="w-16 h-16 text-green-400" />,
                    title: "Payment Confirmed!",
                    message: "Your subscription is active. You can now close the payment tab. Redirecting to your dashboard..."
                };
            case 'polling':
            case 'waiting':
            default:
                return {
                    icon: <Loader2 className="w-16 h-16 text-purple-400 animate-spin" />,
                    title: "Awaiting Confirmation",
                    message: "Please complete your payment in the new tab. This page will update automatically once confirmed."
                };
        }
    };

    const { icon, title, message } = getStatusContent();

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
                <motion.div
                    key={status} // Animate the icon change
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', duration: 0.5 }}
                    className="mb-6"
                >
                    {icon}
                </motion.div>
                <h1 className="text-3xl font-bold">{title}</h1>
                <p className="text-white/70 mt-2">{message}</p>

                {status === 'polling' && (
                    <button
                        onClick={() => checkoutUrl && window.open(checkoutUrl, '_blank')}
                        className="mt-6 flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                    >
                        <ExternalLink className="w-4 h-4" />
                        Re-open payment tab if you closed it
                    </button>
                )}
            </motion.div>
        </div>
    );
};

export default CheckoutPage;
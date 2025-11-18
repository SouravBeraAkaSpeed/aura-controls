"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, ExternalLink, RefreshCw, ShieldAlert, CreditCard } from 'lucide-react';

// Define the possible states for our checkout page
type CheckoutStatus = 'initial' | 'popup_blocked' | 'polling' | 'success';

const CheckoutPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const checkoutUrl = searchParams.get('url');

    const [status, setStatus] = useState<CheckoutStatus>('initial');
    const [isCheckingManually, setIsCheckingManually] = useState(false);
    const razorpayTab = useRef<Window | null>(null);

    // Reusable function to check the payment status
    const checkStatus = useCallback(async () => {
        const token = localStorage.getItem("sessionToken");
        if (!token) {
            router.push('/sign-in');
            return;
        }
        try {
            const res = await fetch('/api/billing/check-status', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.status === 'active') {
                setStatus('success');
                if (razorpayTab.current && !razorpayTab.current.closed) {
                    razorpayTab.current.close();
                }
                setTimeout(() => router.push('/dashboard'), 3000);
            }
        } catch (error) {
            console.error("Polling error:", error);
        }
    }, [router]);

    // This is the primary user action to start the payment process
    const handleProceedToPayment = () => {
        if (!checkoutUrl) {
            router.push('/#pricing');
            return;
        }

        // Open the tab as a direct result of user click
        razorpayTab.current = window.open(checkoutUrl, '_blank');

        // Check if the popup was blocked
        if (!razorpayTab.current) {
            setStatus('popup_blocked');
        } else {
            setStatus('polling');
        }
    };

    // Effect for automatic polling, now triggered by 'polling' status
    useEffect(() => {
        if (status !== 'polling') return;
        checkStatus(); // Check immediately once polling starts
        const intervalId = setInterval(checkStatus, 5000);
        return () => clearInterval(intervalId);
    }, [status, checkStatus]);

    // Manual check handler remains the same
    const handleManualCheck = async () => {
        setIsCheckingManually(true);
        await checkStatus();
        setTimeout(() => setIsCheckingManually(false), 1000);
    };

    const getStatusContent = () => {
        switch (status) {
            case 'success':
                return { icon: <CheckCircle className="w-16 h-16 text-green-400" />, title: "Payment Confirmed!", message: "Your subscription is active. Redirecting to your dashboard..." };
            case 'popup_blocked':
                return { icon: <ShieldAlert className="w-16 h-16 text-yellow-400" />, title: "Popup Blocked", message: "Your browser has blocked the payment window. Please allow popups for this site, then click Retry." };
            case 'polling':
                return { icon: <Loader2 className="w-16 h-16 text-purple-400 animate-spin" />, title: "Awaiting Confirmation", message: "Please complete your payment in the new tab. This page will update automatically." };
            case 'initial':
            default:
                return { icon: <CreditCard className="w-16 h-16 text-purple-400" />, title: "Ready for Checkout", message: "You will be redirected to Razorpay to complete your secure payment." };
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
                className="relative z-10 flex flex-col items-center text-center p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-lg max-w-md w-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <motion.div key={status} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', duration: 0.5 }} className="mb-6">
                    {icon}
                </motion.div>
                <h1 className="text-3xl font-bold">{title}</h1>
                <p className="text-white/70 mt-2 min-h-[48px]">{message}</p>

                <div className="mt-8 w-full flex flex-col items-center gap-4">
                    {status === 'initial' && (
                        <button onClick={handleProceedToPayment} className="flex items-center justify-center gap-2 w-full max-w-xs px-6 py-3 bg-purple-600 text-white font-semibold rounded-full hover:bg-purple-700 transition-colors">
                            Proceed to Payment
                        </button>
                    )}
                    {status === 'popup_blocked' && (
                        <button onClick={handleProceedToPayment} className="flex items-center justify-center gap-2 w-full max-w-xs px-6 py-3 bg-yellow-500 text-black font-semibold rounded-full hover:bg-yellow-600 transition-colors">
                            Retry Payment
                        </button>
                    )}
                    {status === 'polling' && (
                        <>
                            <button onClick={handleManualCheck} disabled={isCheckingManually} className="flex items-center justify-center gap-2 w-full max-w-xs px-6 py-3 bg-purple-600 text-white font-semibold rounded-full hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-wait">
                                {isCheckingManually ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                                {isCheckingManually ? "Checking..." : "Check Payment Status"}
                            </button>
                            <button onClick={() => checkoutUrl && window.open(checkoutUrl, '_blank')} className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors">
                                <ExternalLink className="w-4 h-4" />
                                Re-open payment tab
                            </button>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default CheckoutPage;
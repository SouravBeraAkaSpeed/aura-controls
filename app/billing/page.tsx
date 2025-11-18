"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { CreditCard, Ban, CheckCircle, Loader2, LayoutDashboard } from 'lucide-react';
import { cancelSubscription } from '@/lib/billingActions';
import { toast } from '@/components/ui/use-toast';
import ConfirmationModal from '@/components/ui/ConfirmationModal'; // Import the new modal


export const dynamic = 'force-dynamic';

interface BillingData {
    isSubscribed: boolean;
    planName?: string;
    status?: string;
    currentCycleEnd?: string;
    amount?: string;
}

const BillingPage = () => {
    const [data, setData] = useState<BillingData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCancelling, setIsCancelling] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false); // State for modal visibility
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("sessionToken");
            if (!token) {
                router.push('/sign-in?redirect_url=/billing');
                return;
            }
            try {
                const res = await fetch('/api/billing/portal', {
                    headers: { 'Authorization': `Bearer ${token}` },
                    cache: 'no-store'
                });
                const result = await res.json();
                if (!res.ok) {
                    if (res.status === 401) {
                        localStorage.removeItem("sessionToken");
                        router.push('/sign-in?redirect_url=/billing');
                    }
                    throw new Error(result.error);
                }
                setData(result);
            } catch (err: any) {
                toast({ title: "Error", description: err.message, variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [router]);

    // This function is now called when the user confirms in the modal
    const confirmCancellation = async () => {
        setIsCancelling(true);
        const token = localStorage.getItem("sessionToken");
        if (!token) {
            router.push('/sign-in');
            setIsCancelling(false);
            return;
        }
        const result = await cancelSubscription(token);
        if (result.success) {
            toast({ title: "Success", description: result.message });
            setData(prev => prev ? { ...prev, status: 'cancelled' } : null);
        } else {
            toast({ title: "Error", description: result.error, variant: "destructive" });
        }
        setIsCancelling(false);
        setShowCancelModal(false); // Close the modal
    };

    if (isLoading) {
        return <div className="min-h-screen bg-black flex items-center justify-center text-white"><Loader2 className="w-8 h-8 animate-spin mr-2" /> Loading Billing Portal...</div>;
    }

    return (
        <>
            <div className="relative min-h-screen w-full bg-black text-white pt-24 pb-12">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/30 rounded-full blur-[150px]" />
                    <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-blue-600/20 rounded-full blur-[200px]" />
                </div>
                <div className="max-w-4xl mx-auto px-4">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
                        <h1 className="text-5xl md:text-6xl font-extrabold text-white">Billing Portal</h1>
                        <p className="mt-4 text-lg text-white/60">Manage your Aura-Controls subscription.</p>
                    </motion.div>




                    {data?.isSubscribed ? (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg p-8">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm text-white/60">Current Plan</p>
                                    <h2 className="text-2xl font-bold text-white mt-1">{data.planName}</h2>
                                </div>
                                <div className={`text-sm font-semibold px-3 py-1 rounded-full capitalize ${data.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {data.status}
                                </div>
                            </div>
                            <div className="border-t border-white/10 my-6"></div>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-white/60">Price</p>
                                    <p className="text-lg font-semibold text-white/90 mt-1">{data.amount} / {data.planName?.toLowerCase().includes('month') ? 'month' : 'year'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-white/60">Next Billing Date</p>
                                    <p className="text-lg font-semibold text-white/90 mt-1">{data.status === 'active' ? data.currentCycleEnd : 'N/A'}</p>
                                </div>
                            </div>

                            <motion.button
                                onClick={() => router.push('/dashboard')}
                                className="flex items-center cursor-pointer my-5 w-full justify-center gap-2 px-4 py-2 bg-[#111015] border border-white/20 text-white/80 font-semibold rounded-full text-sm"
                                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                App Dashboard
                            </motion.button>

                            {data.status === 'active' && (
                                <>
                                    <div className="border-t border-white/10 my-6"></div>
                                    <div className="text-center">
                                        <p className="text-sm text-white/60 mb-3">Don&apos;t need your subscription anymore?</p>
                                        <button
                                            onClick={() => setShowCancelModal(true)} // Open the modal instead of confirming
                                            className="px-6 py-2 cursor-pointer bg-red-600/80 text-white font-semibold rounded-full hover:bg-red-700 transition-colors flex items-center justify-center mx-auto"
                                        >
                                            <Ban className="w-5 h-5 mr-2" />
                                            Cancel Subscription
                                        </button>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/5 backdrop-blur-xl border border-dashed border-white/20 rounded-2xl shadow-lg p-12 text-center flex flex-col items-center">
                            <CreditCard className="w-12 h-12 text-purple-400 mb-4" />
                            <h2 className="text-2xl font-bold text-white mb-2">No Active Subscription</h2>
                            <p className="text-white/60 mb-6 max-w-md">You don&apos;t have an active Aura-Controls subscription. Choose a plan to unlock the future of control.</p>
                            <Link href="/#pricing">
                                <button className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-full hover:scale-105 transition-transform">
                                    View Plans
                                </button>
                            </Link>
                        </motion.div>
                    )}



                </div>

            </div>



            {/* The Custom Modal */}
            <ConfirmationModal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={confirmCancellation}
                title="Cancel Subscription"
                message="Are you sure you want to cancel? This will stop all future payments and your access will end after the current billing period."
                confirmText="Yes, Cancel"
                isConfirming={isCancelling}
            />


        </>
    );
};

export default BillingPage;
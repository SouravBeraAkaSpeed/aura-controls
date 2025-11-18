"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { toast } from "@/components/ui/use-toast";
import { submitPriceVote } from "@/lib/pricingActions";
import { createSubscriptionLink } from "@/lib/billingActions";


const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 mr-3 text-purple-400 flex-shrink-0">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
);

const PricingSection = () => {
    const [isPriceSet] = useState(true);
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
    const [isSubscribing, setIsSubscribing] = useState(false);

    const [session, setSession] = useState<any | null>(null);
    const router = useRouter();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState<"idle" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");
    const [whatsapp, setWhatsapp] = useState("");
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        const getSession = async () => {
            const token = localStorage.getItem("sessionToken");
            if (token) {
                try {
                    const sessionRes = await fetch(`/api/auth/getSession?token=${token}`);
                    if (sessionRes.ok) {
                        const data = await sessionRes.json();
                        if (data && data.user) {
                            setSession(data);
                        } else {
                            localStorage.removeItem("sessionToken");
                            setSession(null);
                        }
                    } else {
                        localStorage.removeItem("sessionToken");
                        setSession(null);
                    }
                } catch (error) {
                    console.error("Failed to fetch session:", error);
                    setSession(null);
                }
            } else {
                setSession(null);
            }
        };
        getSession();
    }, []);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        setSubmissionStatus("idle");
        const formData = new FormData(event.currentTarget);
        formData.append("whatsapp", whatsapp);
        const result = await submitPriceVote(formData);
        if (result.success) {
            setSubmissionStatus("success");
            formRef.current?.reset();
            setWhatsapp("");
        } else {
            setSubmissionStatus("error");
            setErrorMessage(result.error || "An unknown error occurred.");
        }
        setIsSubmitting(false);
    };

    const handleSubscription = async (planKey: "monthly" | "yearly") => {
        setIsSubscribing(true);
        if (!session) {
            toast({ title: "Authentication Required", description: "Please sign in to subscribe.", variant: "destructive" });
            router.push('/sign-in?redirect_url=/#pricing');
            setIsSubscribing(false);
            return;
        }

        const token = localStorage.getItem("sessionToken");
        if (!token) {
            toast({ title: "Session Error", description: "Your session has expired. Please sign in again.", variant: "destructive" });
            router.push('/sign-in?redirect_url=/#pricing');
            setIsSubscribing(false);
            return;
        }

        const result = await createSubscriptionLink(planKey, token);

        if (result.success && result.checkoutUrl) {
            router.push(`/subscribe/checkout?url=${encodeURIComponent(result.checkoutUrl)}`);
        } else {
            toast({ title: "Subscription Error", description: result.error, variant: "destructive" });
            setIsSubscribing(false);
        }
    };

    const features = [
        "Full Aura-Controls Desktop App",
        "Supports up to 2 Devices",
        "Continuous Future Updates",
        "Dedicated Customer Support",
        "Access to Exclusive Community",
    ];

    const listVariants: Variants = {
        visible: { transition: { staggerChildren: 0.1 } },
        hidden: {},
    };

    const itemVariants: Variants = {
        visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
        hidden: { opacity: 0, x: -20 },
    };

    return (
        <section id="pricing" className="relative z-10 w-full py-24 sm:py-32 overflow-hidden bg-transparent">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/30 rounded-full blur-[150px]" />
                <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-blue-600/20 rounded-full blur-[200px]" />
            </div>

            <motion.div
                className="relative w-full max-w-6xl mx-auto flex flex-col items-center text-center px-4"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                viewport={{ once: true, amount: 0.2 }}
            >
                <h2 className="text-5xl sm:text-6xl font-extrabold bg-gradient-to-r from-purple-400 via-fuchsia-500 to-blue-400 text-transparent bg-clip-text mb-6">
                    Join the Future of Control
                </h2>
                <p className="text-lg text-white/70 max-w-3xl leading-relaxed">
                    Aura-Controls is offered as a simple, all-inclusive subscription. Get access to the full
                    application, all future updates, and dedicated support. No tiers, no hidden fees—just
                    pure, unadulterated control.
                </p>

                {isPriceSet ? (
                    <div className="w-full max-w-5xl mt-20 flex flex-col items-center">
                        <div className="flex items-center gap-4 bg-white/10 p-1.5 rounded-full border border-white/20 mb-12">
                            <button onClick={() => setBillingCycle('monthly')} className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${billingCycle === 'monthly' ? 'bg-purple-600 text-white' : 'text-white/70'}`}>Monthly</button>
                            <button onClick={() => setBillingCycle('yearly')} className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors relative ${billingCycle === 'yearly' ? 'bg-purple-600 text-white' : 'text-white/70'}`}>
                                Yearly
                                <span className="absolute -top-2 -right-2 bg-green-400 text-black text-xs font-bold px-2 py-0.5 rounded-full">SAVE ₹84</span>
                            </button>
                        </div>

                        <div className="w-full grid md:grid-cols-2 gap-14 md:gap-20 items-center justify-center text-center">
                            <div className="flex flex-col items-center justify-center">
                                <h3 className="text-3xl font-bold text-purple-400 mb-8">What&apos;s Included</h3>
                                <motion.ul className="space-y-5" initial="hidden" whileInView="visible" variants={listVariants} viewport={{ once: true, amount: 0.2 }}>
                                    {features.map((feature, index) => (
                                        <motion.li key={index} className="flex items-center text-lg text-white/85" variants={itemVariants}>
                                            <CheckIcon />
                                            <span className="cursor-target px-2">{feature}</span>
                                        </motion.li>
                                    ))}
                                </motion.ul>
                            </div>

                            <motion.div className="relative bg-white/10 backdrop-blur-xl border border-white/20 p-10 rounded-3xl shadow-2xl flex flex-col items-center text-center" initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.3 }} viewport={{ once: true }}>
                                <AnimatePresence mode="wait">
                                    <motion.div key={billingCycle} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                                        <p className="text-xl font-medium text-white/80">{billingCycle === 'monthly' ? 'Monthly Plan' : 'Yearly Plan'}</p>
                                        <p className="text-5xl font-extrabold text-white my-4">
                                            {billingCycle === 'monthly' ? '₹42' : '₹420'}
                                        </p>
                                        <p className="text-white/60 mb-8">{billingCycle === 'monthly' ? 'Per month, billed monthly' : 'Per year, billed annually'}</p>
                                    </motion.div>
                                </AnimatePresence>
                                <motion.button
                                    onClick={() => handleSubscription(billingCycle)}
                                    disabled={isSubscribing}
                                    className="w-full py-3 bg-gradient-to-r cursor-target from-purple-500 to-blue-500 text-white font-semibold rounded-full shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                >
                                    {isSubscribing ? 'Processing...' : 'Get Subscription'}
                                </motion.button>
                            </motion.div>
                        </div>
                    </div>
                ) : (
                    <div className="w-full max-w-4xl mt-20 grid md:grid-cols-2 gap-14 md:gap-20 items-center justify-center text-center">
                        <div className="flex flex-col items-center justify-center">
                            <h3 className="text-3xl font-bold text-purple-400 mb-8">What&apos;s Included</h3>
                            <motion.ul className="space-y-5" initial="hidden" whileInView="visible" variants={listVariants} viewport={{ once: true, amount: 0.2 }}>
                                {features.map((feature, index) => (
                                    <motion.li key={index} className="flex items-center text-lg text-white/85" variants={itemVariants}>
                                        <CheckIcon />
                                        <span className="cursor-target px-2">{feature}</span>
                                    </motion.li>
                                ))}
                            </motion.ul>
                        </div>
                        <motion.div className="relative bg-white/10 backdrop-blur-xl border border-white/20 p-10 py-14 rounded-3xl shadow-2xl flex flex-col items-center text-center" initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.3 }} viewport={{ once: true }}>
                            <h4 className="text-2xl font-semibold text-white">Help Us Set the Price</h4>
                            <p className="text-white/60 mt-3 mb-8 text-sm max-w-xs">We&apos;re building this for you. Tell us what a fair price is.</p>
                            <motion.button onClick={() => setIsModalOpen(true)} className="px-8 py-3 bg-gradient-to-r cursor-target from-purple-500 to-blue-500 text-white font-semibold rounded-full shadow-lg hover:shadow-purple-500/30 transition-all" whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300, damping: 15 }}>
                                Suggest a Price
                            </motion.button>
                        </motion.div>
                    </div>
                )}
            </motion.div>

            <AnimatePresence>
                {isModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-lg z-[9999] flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
                        <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="w-full max-w-md bg-[#141217] border border-white/10 rounded-2xl p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            {submissionStatus === "success" ? (
                                <div className="text-center">
                                    <h3 className="text-2xl font-bold text-green-400 mb-4">Thank You!</h3>
                                    <p className="text-white/70 mb-6">Your feedback has been recorded. We&apos;ll keep you updated!</p>
                                    <button onClick={() => { setIsModalOpen(false); setSubmissionStatus("idle"); }} className="w-full px-6 py-2 bg-purple-600 rounded-lg">Close</button>
                                </div>
                            ) : (
                                <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
                                    <h3 className="text-2xl font-bold text-white text-center mb-2">Suggest Your Price</h3>
                                    <p className="text-white/60 text-center mb-4">What&apos;s a fair monthly price (INR) for Aura-Controls?</p>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-semibold">₹</span>
                                        <input type="number" name="price" min="42" step="1" placeholder="42" required className="w-full bg-[#111015] border border-[#2D2A33] rounded-lg pl-8 pr-4 py-3 text-white/90 text-center text-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                    </div>
                                    <input type="email" name="email" placeholder="Your Email (Optional)" className="w-full bg-[#111015] border border-[#2D2A33] rounded-lg px-4 py-3 text-white/90 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                    <div>
                                        <PhoneInput country={"in"} value={whatsapp} onChange={setWhatsapp} inputClass="!w-full !bg-[#111015] !border !border-[#2D2A33] !rounded-lg !px-4 !py-3 !text-white/90 !pl-12 focus:!ring-2 focus:!ring-purple-500" buttonClass="!bg-[#111015] !border !border-[#2D2A33] !rounded-l-lg hover:!bg-[#2D2A33]" dropdownClass="!bg-[#1C1B1F] !border !border-[#2D2A33]" inputProps={{ name: "whatsapp" }} />
                                        <p className="text-xs text-white/50 mt-1 pl-1">Optional: For product updates via WhatsApp.</p>
                                    </div>
                                    <textarea name="feedback" placeholder="Any additional feedback? (Optional)" rows={3} className="w-full bg-[#111015] border border-[#2D2A33] rounded-lg px-4 py-3 text-white/90 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"></textarea>
                                    <button type="submit" disabled={isSubmitting} className="w-full px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:opacity-90 transition-all duration-300 disabled:bg-gray-500">
                                        {isSubmitting ? "Submitting..." : "Submit Vote"}
                                    </button>
                                    {submissionStatus === "error" && (<p className="text-red-400 text-center">{errorMessage}</p>)}
                                </form>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default PricingSection;
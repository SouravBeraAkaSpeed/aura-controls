"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Download, Lock, Cpu, MousePointer2, Hand, Settings } from "lucide-react";

import FeaturesSection from "@/components/dashboard/FeaturesSection";
import CredentialsSection from "@/components/dashboard/CredentialsSection";
import QuerySection from "@/components/dashboard/QuerySection";
import DownloadSection from "@/components/dashboard/DownloadSection";

export const dynamic = 'force-dynamic';

interface DashboardData {
    isSubscribed: boolean;
    appUsername?: string;
    appPassword?: string;
    status?: string;
    endDate?: string;
    connectedDevices?: {
        deviceId: string;
        deviceName: string;
        deviceType: string;
        loggedInAt: string;
    }[];
}

const LockedSection = ({
    title,
    message,
    cta,
}: {
    title: string;
    message: string;
    cta: string;
}) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative text-center p-10 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg overflow-hidden"
    >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-700/20 to-blue-600/10 blur-[60px]" />
        <div className="relative z-20 flex flex-col items-center gap-3">
            <Lock className="w-12 h-12 text-white/40" />
            <h3 className="text-2xl font-semibold text-white/70">{title}</h3>
            <p className="text-white/50 max-w-md mx-auto">{message}</p>
            <Link href="/#pricing">
                <button className="mt-4 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-full hover:scale-105 transition-transform">
                    {cta}
                </button>
            </Link>
        </div>
    </motion.div>
);

const DashboardPage = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);

            const token = localStorage.getItem("sessionToken");
            if (!token) {
                router.push("/sign-in?redirect_url=/dashboard");
                return;
            }

            try {
                const res = await fetch("/api/dashboard", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    cache: 'no-store'
                });

                const result = await res.json();

                if (res.status === 401) {
                    localStorage.removeItem("sessionToken");
                    router.push("/sign-in?redirect_url=/dashboard");
                    return;
                }

                if (!res.ok) throw new Error(result.error || "Failed to fetch data");
                setData(result);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [router]);

    if (isLoading)
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                Authenticating & Loading Dashboard...
            </div>
        );

    if (error)
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-red-500">
                Error: {error}
            </div>
        );

    return (
        <div className="relative min-h-screen w-full bg-black text-white overflow-x-hidden pt-24 pb-12">
            {/* Futuristic glowing background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-[-200px] left-[-150px] w-[400px] h-[400px] bg-purple-700/40 rounded-full blur-[180px]" />
                <div className="absolute bottom-[-150px] right-[-100px] w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[200px]" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 bg-center bg-repeat" />
            </div>

            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-5xl mx-auto text-center px-6 mb-24"
            >
                <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-purple-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
                    Aura-Controls
                </h1>
                <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
                    Transforms your webcam into a <span className="text-purple-400 font-semibold">futuristic command center</span>,
                    letting you control your computer with intuitive hand gestures.
                    Navigate your cursor, manage apps, and adjust settings from a distance — just like in the movies.
                </p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-12 flex justify-center"
                >
                    <img
                        src="/logo.png"
                        alt="Aura Control Interface"
                        className="rounded-2xl shadow-2xl  max-w-xl w-full"
                    />
                </motion.div>
            </motion.div>

            {/* Main Dashboard Content */}
            <div className="max-w-6xl mx-auto px-4 space-y-20 relative z-10">
                {data?.isSubscribed ? (
                    <>
                        <DownloadSection />
                        <CredentialsSection data={data} />
                    </>
                ) : (
                    <>
                        <LockedSection
                            title="Download Application"
                            message="Your download will be available once your subscription is active."
                            cta="View Plans"
                        />
                        <LockedSection
                            title="App Credentials & Devices"
                            message="Your personalized credentials will appear here after subscribing."
                            cta="Subscribe Now"
                        />
                    </>
                )}

                {/* Features Overview */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="grid md:grid-cols-3 gap-8 mt-20"
                >
                    {[
                        { icon: <Hand className="w-10 h-10 text-purple-400" />, title: "Gesture Navigation", desc: "Move, click, and scroll using simple hand movements." },
                        { icon: <Cpu className="w-10 h-10 text-blue-400" />, title: "AI Recognition", desc: "Smart AI detects gestures with precision and adapts to lighting." },
                        { icon: <Settings className="w-10 h-10 text-cyan-400" />, title: "Custom Controls", desc: "Tailor gestures to control music, volume, and windows." },
                    ].map((feature, i) => (
                        <div
                            key={i}
                            className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all duration-300 hover:scale-[1.03] backdrop-blur-lg"
                        >
                            <div className="mb-4 flex justify-center">{feature.icon}</div>
                            <h4 className="text-xl font-semibold mb-2 text-center">{feature.title}</h4>
                            <p className="text-white/60 text-center">{feature.desc}</p>
                        </div>
                    ))}
                </motion.div>

                <FeaturesSection />
                <QuerySection />
            </div>
        </div>
    );
};

export default DashboardPage;

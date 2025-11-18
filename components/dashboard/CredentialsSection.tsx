"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clipboard, Computer, Calendar, Eye, EyeOff, CreditCard } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import Link from 'next/link';

const CredentialsSection = ({ data }: { data: any }) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const copyToClipboard = (text: string, label: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        toast({
            title: `${label} Copied!`,
            description: "Your credential has been copied to the clipboard.",
        });
    };

    return (
        <motion.section
            className="p-6 sm:p-8 bg-[#1C1B1F] border border-[#2D2A33] rounded-3xl shadow-lg"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
        >
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-purple-400">Your App Credentials</h2>

            </div>

            {/* --- THE REDESIGNED CREDENTIALS LAYOUT --- */}
            <div className="flex flex-col gap-4 mb-10">
                {/* App Username Card */}
                <div className="bg-[#111015] p-5 rounded-xl border border-white/10">
                    <label className="text-sm text-white/60">App Username</label>
                    <div className="flex items-center justify-between mt-2">
                        <p className="text-lg font-mono tracking-wider text-white/90">{data.appUsername || 'Generating...'}</p>
                        <button onClick={() => copyToClipboard(data.appUsername, 'Username')} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                            <Clipboard className="w-5 h-5 text-white/70" />
                        </button>
                    </div>
                </div>

                {/* App Password Card */}
                <div className="bg-[#111015] p-5 rounded-xl border border-white/10">
                    <label className="text-sm text-white/60">App Password</label>
                    <div className="flex items-center justify-between mt-2">
                        <p className="text-lg font-mono tracking-wider text-white/90">
                            {isPasswordVisible ? data.appPassword : '••••••••'}
                        </p>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setIsPasswordVisible(!isPasswordVisible)} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                                {isPasswordVisible ? <EyeOff className="w-5 h-5 text-white/70" /> : <Eye className="w-5 h-5 text-white/70" />}
                            </button>
                            <button onClick={() => copyToClipboard(data.appPassword, 'Password')} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                                <Clipboard className="w-5 h-5 text-white/70" />
                            </button>
                        </div>
                    </div>
                </div>

                <Link href="/billing" >
                    <motion.button
                        className="flex items-center gap-2 px-4 py-2 w-full justify-center bg-[#111015] border border-white/20 text-white/80 font-semibold rounded-full text-sm"
                        whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <CreditCard className="w-4 h-4" />
                        Billing Portal
                    </motion.button>
                </Link>
            </div>

            <h3 className="text-2xl font-bold mb-6">Connected Devices ({(data.connectedDevices?.length || 0)} / 2)</h3>
            <div className="space-y-4">
                {data.connectedDevices && data.connectedDevices.length > 0 ? (
                    data.connectedDevices.map((device: any, index: number) => (
                        <motion.div
                            key={index}
                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#111015] p-4 rounded-xl border border-white/10"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                        >
                            <div className="flex items-center gap-4">
                                <Computer className="w-7 h-7 text-cyan-400 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-white">{device.deviceName || 'Unknown Device'}</p>
                                    <p className="text-sm text-white/60">{device.deviceType} | ID: ...{device.deviceId.slice(-6)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-white/60 mt-2 sm:mt-0">
                                <Calendar className="w-4 h-4" />
                                <span>Logged in: {new Date(device.loggedInAt).toLocaleDateString()}</span>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="text-center py-8 border-2 border-dashed border-white/10 rounded-xl">
                        <p className="text-white/60">No devices have logged in yet.</p>
                    </div>
                )}
            </div>
        </motion.section>
    );
};

export default CredentialsSection;
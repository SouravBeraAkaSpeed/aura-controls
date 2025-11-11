"use client";
import { motion } from 'framer-motion';
import { Clipboard, Computer, Calendar } from 'lucide-react';
import { toast } from '@/components/ui/use-toast'; // Assuming you have a toast component

const CredentialsSection = ({ data }: { data: any }) => {
    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: `${label} Copied!`,
            description: "Your credential has been copied to the clipboard.",
        });
    };

    return (
        <motion.section 
            className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-lg"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
        >
            <h2 className="text-3xl font-bold mb-8 text-purple-400">Your App Credentials</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-10">
                {/* App Username */}
                <div className="bg-black/40 p-5 rounded-xl">
                    <label className="text-sm text-white/60">App Username</label>
                    <div className="flex items-center justify-between mt-2">
                        <p className="text-lg font-mono tracking-wider text-white/90">{data.appUsername}</p>
                        <button onClick={() => copyToClipboard(data.appUsername, 'Username')} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                            <Clipboard className="w-5 h-5 text-white/70" />
                        </button>
                    </div>
                </div>
                {/* App Password */}
                <div className="bg-black/40 p-5 rounded-xl">
                    <label className="text-sm text-white/60">App Password</label>
                    <p className="text-lg italic text-white/50 mt-2">{data.appPassword}</p>
                </div>
            </div>

            <h3 className="text-2xl font-bold mb-6">Connected Devices ({(data.connectedDevices?.length || 0)} / 2)</h3>
            <div className="space-y-4">
                {data.connectedDevices && data.connectedDevices.length > 0 ? (
                    data.connectedDevices.map((device: any, index: number) => (
                        <motion.div 
                            key={index} 
                            className="flex items-center justify-between bg-black/40 p-4 rounded-xl"
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
                            <div className="flex items-center gap-2 text-sm text-white/60">
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
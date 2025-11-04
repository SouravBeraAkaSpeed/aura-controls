"use client";

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { submitContactForm } from '@/lib/contactActions';

const ContactSection = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error' | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const formRef = useRef<HTMLFormElement>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        setSubmissionStatus('idle');

        const formData = new FormData(event.currentTarget);
        const result = await submitContactForm(formData);

        if (result.success) {
            setSubmissionStatus('success');
            formRef.current?.reset();
        } else {
            setSubmissionStatus('error');
            setErrorMessage(result.error || 'An unknown error occurred.');
        }
        setIsSubmitting(false);
    };

    return (
        <section id="contact" className="w-full py-20 px-4 relative z-10">
            <div className="w-full max-w-7xl mx-auto p-8 sm:p-12 h-screen flex items-center justify-center rounded-2xl">
                <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
                    {/* Left Column: Info */}
                    <div className="text-left">
                        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">Get In Touch</h2>
                        <p className="text-lg text-white/60 mb-8 leading-relaxed">
                            Have a question, a project idea, or just want to talk about the future of interfaces?
                            We&quot;d love to hear from you.
                        </p>
                        <div className="space-y-4">
                            <a href="mailto:contact@aura-controls.com" className="flex items-center gap-3 text-white/80 hover:text-purple-400 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-purple-400"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                                <span>contact@toil-labs.com</span>
                            </a>
                        </div>
                    </div>

                    {/* Right Column: Form */}
                    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid sm:grid-cols-2 gap-6">
                            <input type="text" name="name" placeholder="Your Name" required className="w-full bg-[#111015] border border-[#2D2A33] rounded-lg px-4 py-3 text-white/90 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                            <input type="email" name="email" placeholder="Your Email" required className="w-full bg-[#111015] border border-[#2D2A33] rounded-lg px-4 py-3 text-white/90 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        </div>
                        <input type="text" name="phone" placeholder="Phone (Optional)" className="w-full bg-[#111015] border border-[#2D2A33] rounded-lg px-4 py-3 text-white/90 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        <input type="text" name="service_name" placeholder="Service of Interest (e.g., More Features)" className="w-full bg-[#111015] border border-[#2D2A33] rounded-lg px-4 py-3 text-white/90 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        <textarea name="query" placeholder="Your Message..." required rows={5} className="w-full bg-[#111015] border border-[#2D2A33] rounded-lg px-4 py-3 text-white/90 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"></textarea>

                        <button type="submit" disabled={isSubmitting} className="w-full px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center">
                            {isSubmitting ? "Submitting..." : "Send Message"}
                        </button>

                        <AnimatePresence>
                            {submissionStatus === 'success' && (
                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-green-400 text-center mt-4">
                                    Thank you for your message! We&quot;ll get back to you shortly.
                                </motion.p>
                            )}
                            {submissionStatus === 'error' && (
                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-red-400 text-center mt-4">
                                    {errorMessage}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default ContactSection;
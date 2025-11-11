"use client";
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';
import { submitContactForm } from '@/lib/contactActions';

const QuerySection = () => {
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
        <motion.section
            className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-lg"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
        >
            <div className="flex items-center justify-center gap-4 mb-4">
                <Send className="w-8 h-8 text-purple-400" />
                <h2 className="text-3xl font-bold text-center text-white">Raise a Query</h2>
            </div>
            <p className="text-center text-white/60 mb-8">Have an issue or a question? Our support team is here to help.</p>
            <form ref={formRef} onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-4">
                <input type="text" name="name" placeholder="Your Name" required className="w-full bg-[#111015] border border-[#2D2A33] rounded-lg px-4 py-3 text-white/90 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                <input type="email" name="email" placeholder="Your Email" required className="w-full bg-[#111015] border border-[#2D2A33] rounded-lg px-4 py-3 text-white/90 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                <textarea name="query" placeholder="Describe your issue..." required rows={5} className="w-full bg-[#111015] border-[#2D2A33] rounded-lg px-4 py-3 text-white/90 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"></textarea>
                <button type="submit" disabled={isSubmitting} className="w-full px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSubmitting ? "Sending..." : "Send Query"}
                </button>
                <AnimatePresence>
                    {submissionStatus === 'success' && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-green-400 text-center">Query sent successfully!</motion.p>}
                    {submissionStatus === 'error' && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-red-400 text-center">{errorMessage}</motion.p>}
                </AnimatePresence>
            </form>
        </motion.section>
    );
};

export default QuerySection;
"use in client";

import { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface ChatInputFormProps {
    isGenerating: boolean;
    hasFiles?: boolean;
    onSendMessage: (message: string, isDiscussing: boolean) => void;
}

export const ChatInputForm = ({ isGenerating, hasFiles, onSendMessage }: ChatInputFormProps) => {
    const [userInput, setUserInput] = useState('');
    const [isDiscussing, setIsDiscussing] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (userInput.trim()) {
            onSendMessage(userInput.trim(), isDiscussing);
            setUserInput(''); // Clear input after sending
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800 max-h-[250px] flex-shrink-0">
            <div className="relative">
                <Textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder={isDiscussing ? "Ask a question about the code or your next steps..." : "e.g., 'Add a dark mode toggle...'"}
                    className="bg-gray-900 border-gray-700 resize-y min-h-[140px] max-h-[150px] pr-32"
                    disabled={isGenerating || !hasFiles}
                />
                <div className="absolute right-2 bottom-2 flex items-center gap-2">
                    <Button
                        type="button"
                        size="sm"
                        variant={"secondary"}
                        className={`h-8 cursor-pointer ${isDiscussing ? "border-2 border-[#9810FA] bg-transparent hover:border-3" : "bg-[#9810FA] hover:bg-[#a640f0]"}    `}
                        onClick={() => setIsDiscussing(!isDiscussing)}
                        disabled={isGenerating || !hasFiles}
                    >
                        {isDiscussing ? 'Code Mode' : 'Discuss'}
                    </Button>
                    <Button
                        type="submit"
                        size="sm"
                        className="h-8"
                        disabled={isGenerating || !hasFiles || !userInput.trim()}
                    >
                        Send
                    </Button>
                </div>
            </div>
        </form>
    );
};
import React from 'react';
import { FileText } from 'lucide-react';
import { ChatMessage } from './ChatMessage';

export const ChatArea = ({ messages, scrollRef }) => {
    if (messages.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg mb-2">Upload a RESUME to get started</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={scrollRef} />
        </div>
    );
};
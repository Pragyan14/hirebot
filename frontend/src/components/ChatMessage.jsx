import React from 'react';
import { User, Bot } from 'lucide-react';

export const ChatMessage = ({ message }) => {
    return (
        <div
            className={`flex items-start space-x-3 ${
                message.type === "user" ? "justify-end" : "justify-start"
            }`}
        >
            {message.type === "bot" && (
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                </div>
            )}

            <div
                className={`max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl px-4 py-2 rounded-lg ${
                    message.type === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-white border border-gray-200 text-gray-800"
                }`}
            >
                <p className="text-sm leading-relaxed">{message.content}</p>
            </div>

            {message.type === "user" && (
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                </div>
            )}
        </div>
    );
};
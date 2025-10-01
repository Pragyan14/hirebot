import React from 'react';
import { SendHorizontal, Loader } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

export const InputArea = ({
    isUploading,
    inputMessage,
    setInputMessage,
    handleKeyPress,
    handleSendMessage,
    isResumeUploaded,
    readTimer,
    status,
    onRetry
}) => {
    if (isUploading) {
        return (
            <div className="border-t border-gray-200 bg-white p-4">
                <Loader className='mx-auto animate-spin' size={42} />
            </div>
        );
    }

    return (
        <div className="border-t border-gray-200 bg-white p-4">
            <div className="flex items-center space-x-2 max-w-4xl mx-auto">
                <div className="flex-1 relative">
                    <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={!isResumeUploaded || readTimer > 0}
                        placeholder="Send a message..."
                        className="pr-12 py-3 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <Button
                        onClick={handleSendMessage}
                        size="sm"
                        disabled={!isResumeUploaded || readTimer > 0}
                        className="absolute right-2 cursor-pointer top-1/2 transform -translate-y-1/2 h-8 w-8"
                    >
                        <SendHorizontal className="w-5 h-5" />
                    </Button>
                </div>
            </div>
            
            {(status === 'finished' || status === 'scored' || status === 'failed') && (
                <div className="text-center mt-4">
                    <Button
                        onClick={onRetry}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold"
                    >
                        Retry Interview
                    </Button>
                </div>
            )}
        </div>
    );
};
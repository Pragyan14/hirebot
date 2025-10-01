import React from 'react';
import { Clock, CirclePlus } from 'lucide-react';
import { Flex, Progress } from 'antd';

export const InterviewHeader = ({ 
    isResumeUploaded, 
    isUploading, 
    status, 
    readTimer, 
    questionTimer,
    currentIndex,
    handleFileChange 
}) => {
    return (
        <header className="bg-white border-b border-gray-200 px-4 sm:px-8 md:px-12 py-3 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center w-24 h-10 gap-4 sm:h-12">
                HIREBOT
                <Progress 
                    steps={6} 
                    percent={(currentIndex / 6) * 100} 
                    showInfo={false}
                />
            </div>

            <div className="flex flex-wrap items-center gap-2">
                {isResumeUploaded && (
                    <div className="flex items-center gap-2 text-sm px-2 py-1 rounded">
                        <Clock className="w-4 h-4" />
                        <span>
                            {status === 'finished'
                                ? 'Interview Completed'
                                : readTimer > 0
                                    ? `Read time: ${readTimer}s`
                                    : `Answer time: ${questionTimer}s`
                            }
                        </span>
                    </div>
                )}

                <input
                    type="file"
                    id="pdfUpload"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isResumeUploaded}
                />
                <label
                    htmlFor='pdfUpload'
                    className={`flex items-center gap-2 border border-black px-4 py-2 sm:px-5 sm:py-1.5 rounded-md transition-colors duration-200 text-sm sm:text-base ${
                        isResumeUploaded || isUploading
                            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                            : "hover:bg-black hover:text-white cursor-pointer"
                    }`}
                >
                    <CirclePlus className="w-4 h-4" />
                    <span className="hidden sm:inline font-semibold">Upload Resume</span>
                </label>
            </div>
        </header>
    );
};
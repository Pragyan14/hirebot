import React, { useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import toast, { Toaster } from 'react-hot-toast';
import { uploadCandidateResume, updateCandidateInfo, resetCandidate } from '../slice/candidateSlice';
import InstructionScreen from '../components/InstructionScreen';
import VerifyUserForm from '../components/VerifyUserIForm';
import { nanoid } from '@reduxjs/toolkit';
import {
    fetchQuestions,
    addMessage,
    nextQuestion,
    saveAnswer,
    submitScore,
    resetQna
} from '../slice/qnaSlice';
import { addCompletedInterview } from '../slice/interviewResultsSlice';
import { InterviewHeader } from '../components/InterviewHeader';
import { ChatArea } from '../components/ChatArea';
import { InputArea } from '../components/InputArea';
import { useCandidateForm } from '../hooks/useCandidateForm';
import { useAutoScroll } from '../hooks/useAutoScroll';
import { useInterviewTimer } from '../hooks/useInterviewTimer';
import { createAnswerHandler } from '../utils/interviewHandlers';

export default function Interviewee() {
    const dispatch = useDispatch();

    // Selectors
    const { isUploading, error, userInfo, isResumeUploaded, isVerified } = useSelector((state) => state.candidate);
    const { questions, currentIndex, messages, readTimer, questionTimer, status, answers } = useSelector((state) => state.qna);

    // Local state
    const [isInstructionShown, setIsInstructionShown] = useState(false);
    const [inputMessage, setInputMessage] = useState("");

    // Custom hooks
    const { formData, handleFormChange } = useCandidateForm(userInfo);
    const scrollRef = useAutoScroll(messages);

    // Handlers
    const handleFormSubmit = (e) => {
        e.preventDefault();
        dispatch(updateCandidateInfo(formData));
        toast.success("Candidate info updated!");
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 1 * 1024 * 1024) {
            toast.error("File size must be less than 1MB");
            return;
        }
        try {
            await dispatch(uploadCandidateResume(file)).unwrap();
            toast.success("Resume uploaded successfully");
        } catch (err) {
            toast.error(error || "File upload failed");
        }
    };

    const answerHandler = createAnswerHandler(dispatch, {
        addMessage,
        saveAnswer,
        nextQuestion,
        submitScore,
        addCompletedInterview,
        messages,
    });

    const handleSendMessage = async () => {
        if (readTimer > 0 || status !== 'ready' || status === 'finished' || !inputMessage.trim()) return;

        const answerText = inputMessage.trim();
        setInputMessage('');
        await answerHandler(answerText, questions, currentIndex, answers, userInfo, messages);
    };

    const handleAutoSubmit = async () => {
        const answerText = inputMessage?.trim() || "no answer";
        dispatch(addMessage({ id: nanoid(), type: 'bot', content: 'Time is up — answer submitted.' }));
        setInputMessage('');
        await answerHandler(answerText, questions, currentIndex, answers, userInfo, messages);
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const startQna = async () => {
        try {
            // Only fetch questions if they don't exist yet
            if (!questions || questions.length === 0) {
                // Only show cooking message if messages array is empty
                if (messages.length === 0) {
                    dispatch(addMessage({
                        id: nanoid(),
                        type: 'bot',
                        content: 'Cooking questions for you...'
                    }));
                }

                const payload = await dispatch(fetchQuestions()).unwrap();
                if (payload && payload.length > 0) {
                    dispatch(addMessage({
                        id: nanoid(),
                        type: 'bot',
                        content: payload[0].question,
                    }));
                }
            }
        } catch (err) {
            dispatch(addMessage({
                id: nanoid(),
                type: 'bot',
                content: 'Failed to load questions.'
            }));
        }
    };

    const handleRetry = () => {
        dispatch(resetQna());
        dispatch(resetCandidate());
        setIsInstructionShown(false);
    };

    // Timer hook
    useInterviewTimer(handleAutoSubmit);

    // Conditional renders
    if (isResumeUploaded && !isVerified) {
        return (
            <VerifyUserForm
                formData={formData}
                handleFormChange={handleFormChange}
                handleFormSubmit={handleFormSubmit}
            />
        );
    }

    if (isVerified && !isInstructionShown) {
        return (
            <InstructionScreen
                onContinue={() => {
                    setIsInstructionShown(true);
                    startQna();
                }}
            />
        );
    }

    return (
        <>
            <Toaster />
            <div className='flex flex-col h-screen bg-gray-50'>
                <InterviewHeader
                    isResumeUploaded={isResumeUploaded}
                    isUploading={isUploading}
                    status={status}
                    readTimer={readTimer}
                    questionTimer={questionTimer}
                    currentIndex={currentIndex}
                    handleFileChange={handleFileChange}
                />

                <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        <ChatArea messages={messages} scrollRef={scrollRef} />
                    </div>

                    <InputArea
                        isUploading={isUploading}
                        inputMessage={inputMessage}
                        setInputMessage={setInputMessage}
                        handleKeyPress={handleKeyPress}
                        handleSendMessage={handleSendMessage}
                        isResumeUploaded={isResumeUploaded}
                        readTimer={readTimer}
                        status={status}
                        onRetry={handleRetry}
                    />
                </div>
            </div>
        </>
    );
}
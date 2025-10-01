import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { Clock, FileText, User, Bot, CirclePlus, SendHorizontal, Loader } from "lucide-react"
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import toast, { Toaster } from 'react-hot-toast';
import { uploadCandidateResume, updateCandidateInfo, resetCandidate } from '../slice/candidateSlice';
import InstructionScreen from '../components/InstructionScreen';
import VerifyUserForm from '../components/VerifyUserIForm';
import { nanoid } from '@reduxjs/toolkit';
import { Flex, Progress } from 'antd';
import { green, red } from '@ant-design/colors';
import {
    fetchQuestions,
    addMessage,
    nextQuestion,
    saveAnswer,
    tickReadTimer,
    tickQuestionTimer,
    startQuestionTimer,
    submitScore,
    resetQna
} from '../slice/qnaSlice';
import { addCompletedInterview } from '../slice/interviewResultsSlice';

export default function Interviewee() {
    const dispatch = useDispatch();

    // Candidate Info 
    const { isUploading, error, userInfo, isResumeUploaded, isVerified } = useSelector((state) => state.candidate);
    const { name, email, phone } = userInfo || {};
    const [formData, setFormData] = useState({
        name: name || "",
        email: email || "",
        phone: phone || "",
    });

    useEffect(() => {
        if (userInfo) {
            setFormData({
                name: userInfo.name || "",
                email: userInfo.email || "",
                phone: userInfo.phone || "",
            });
        }
    }, [userInfo]);

    //QnA Info
    const { questions, currentIndex, messages, readTimer, questionTimer, status, isQuestionTimerActive, answers } = useSelector((state) => state.qna);
    const [isInstructionShown, setIsInstructionShown] = useState(false);
    const [inputMessage, setInputMessage] = useState("");

    const messagesEndRef = useRef(null);
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // --- Candidate Verification Form ---
    const handleFormSubmit = (e) => {
        e.preventDefault();
        dispatch(updateCandidateInfo(formData));
        toast.success("Candidate info updated!");
    };
    const handleFormChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Resume Upload
    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 1 * 1024 * 1024) {
            toast.error("File size must be less than 1MB");
            return;
        }
        const success = await dispatch(uploadCandidateResume(file)).unwrap();
        if (success) {
            toast.success("Resume uploaded successfully");
        } else {
            toast.error(error || "File upload failed");
        }
    }

    // Send Answer 
    const handleSendMessage = async () => {
        if (readTimer > 0 || status !== 'ready' || status === 'finished') return;
        if (!inputMessage.trim()) return;

        const q = questions[currentIndex];
        if (!q) return;

        const answerToSave = inputMessage?.trim() || "no answer";
        dispatch(addMessage({ id: nanoid(), type: 'user', content: answerToSave }));
        dispatch(saveAnswer({ answer: answerToSave }));
        const completeAnswer = [...answers, answerToSave];
        setInputMessage('');

        // move to next question
        if (currentIndex < questions.length - 1) {
            const nextIdx = currentIndex + 1;
            dispatch(nextQuestion());
            const nextQ = questions[nextIdx];
            dispatch(addMessage({ id: nanoid(), type: 'bot', content: nextQ.question }));
        } else {
            dispatch(nextQuestion());
            dispatch(addMessage({ id: nanoid(), type: 'bot', content: 'All questions completed!' }));
            try {
                const scoreResult = await dispatch(submitScore({
                    questions: questions,
                    answers: completeAnswer,
                })).unwrap();

                console.log(scoreResult);

                dispatch(addCompletedInterview({
                    id: nanoid(),
                    userInfo: userInfo,
                    messages: messages,
                    questions: questions,
                    answers: completeAnswer,
                    scoreData: scoreResult,
                    chatHistory: messages,
                    timestamp: Date.now(),
                })),

                    dispatch(addMessage({
                        id: nanoid(),
                        type: 'bot',
                        content: `Your final score: ${scoreResult.score}, summary: ${scoreResult.summary}`
                    }));

                toast.success("Interview completed successfully!");
            } catch (error) {
                dispatch(addMessage({
                    id: nanoid(),
                    type: 'bot',
                    content: 'Error calculating score.'
                }));
                toast.error("Failed to submit score");
            }
        }
    };

    const handleAutoSubmit = async () => {
        const q = questions[currentIndex];
        if (!q) return;
        const answerToSave = inputMessage?.trim() || "no answer";
        dispatch(addMessage({
            id: nanoid(),
            type: 'user',
            content: answerToSave || "(No answer)"
        }));
        dispatch(saveAnswer({ answer: answerToSave || "no answer" }));
        dispatch(addMessage({ id: nanoid(), type: 'bot', content: 'Time is up — answer submitted.' }));
        const completeAnswer = [...answers, answerToSave];
        setInputMessage('');
        if (currentIndex < questions.length - 1) {
            dispatch(nextQuestion());
            const nextIdx = currentIndex + 1;
            const nextQ = questions[nextIdx];
            dispatch(addMessage({ id: nanoid(), type: 'bot', content: nextQ.question }));
        }
        else {
            dispatch(nextQuestion());
            dispatch(addMessage({ id: nanoid(), type: 'bot', content: 'All questions completed!' }));
            try {
                const scoreResult = await dispatch(submitScore({
                    questions: questions,
                    answers: completeAnswer,
                })).unwrap();

                console.log(scoreResult);

                dispatch(addCompletedInterview({
                    id: nanoid(),
                    userInfo: userInfo,
                    messages: messages,
                    questions: questions,
                    answers: completeAnswer,
                    scoreData: scoreResult,
                    chatHistory: messages,
                    timestamp: Date.now(),
                })),

                    dispatch(addMessage({
                        id: nanoid(),
                        type: 'bot',
                        content: `Your final score: ${scoreResult.score}, summary: ${scoreResult.summary}`
                    }));

                toast.success("Interview completed successfully!");
            } catch (error) {
                dispatch(addMessage({
                    id: nanoid(),
                    type: 'bot',
                    content: 'Error calculating score. Please contact support.'
                }));
                toast.error("Failed to submit score");
            }
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    const startQna = async () => {
        const lastMsg = messages?.length ? messages[0] : null;
        if (!lastMsg || !/cooking questions/i.test(lastMsg.content)) {
            dispatch(addMessage({
                id: nanoid(),
                type: 'bot',
                content: 'Cooking questions for you...'
            }));
        }

        try {
            if (!questions || questions.length == 0) {
                const payload = await dispatch(fetchQuestions()).unwrap();
                if (payload && payload.length > 0) {
                    dispatch(addMessage({
                        id: nanoid(),
                        type: 'bot',
                        content: payload[0].question,
                    }))
                }
            }
        } catch (err) {
            dispatch(addMessage({ id: nanoid(), type: 'bot', content: 'Failed to load questions.' }));
        }
    }


    useEffect(() => {
        if (status !== 'ready' || status === 'finished') return;
        if (currentIndex >= questions.length) return;
        let t = null;

        if (readTimer > 0) {
            t = setTimeout(() => dispatch(tickReadTimer()), 1000);
        }
        else if (readTimer === 0 && questionTimer === 0 && !isQuestionTimerActive) {
            dispatch(startQuestionTimer());
            const q = questions[currentIndex];
            const alreadyShown = messages.some(
                m => m.type === 'bot' && (m.content || '').includes(q.question)
            );
            if (!alreadyShown) {
                dispatch(addMessage({ id: nanoid(), type: 'bot', content: q.question }));
            }
        }

        else if (readTimer === 0 && questionTimer > 0 && isQuestionTimerActive) t = setTimeout(() => dispatch(tickQuestionTimer()), 1000);
        else if (readTimer === 0 && questionTimer === 0 && isQuestionTimerActive && questions.length > 0) {
            handleAutoSubmit();
        }

        return () => clearTimeout(t);
    }, [readTimer, questionTimer, status, currentIndex, isQuestionTimerActive])


    // --- Render Verification Form ---
    if (isResumeUploaded && !isVerified) {
        return (
            <VerifyUserForm
                formData={formData}
                handleFormChange={handleFormChange}
                handleFormSubmit={handleFormSubmit}
            />
        )
    }

    // --- Render Instructions ---
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

                <header className="bg-white border-b border-gray-200 px-4 sm:px-8 md:px-12 py-3 flex flex-wrap items-center justify-between gap-4">
                    {/* Logo */}
                    <div className="flex items-center w-24 h-10 gap-4 sm:h-12">
                        HIREBOT
                        <Progress steps={6} percent={(currentIndex)/6*100} showInfo={false}/>
                    </div>

                    {/* Actions: Uploaded file + Upload button */}
                    <div className="flex flex-wrap items-center gap-2">
                        {isResumeUploaded && (
                            <div className="flex items-center gap-2 text-sm px-2 py-1 rounded">
                                <Clock className="w-4 h-4" />
                                <span >
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
                            className={`flex items-center gap-2 border border-black px-4 py-2 sm:px-5 sm:py-1.5 rounded-md transition-colors duration-200 text-sm sm:text-base ${isResumeUploaded || isUploading
                                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                : "hover:bg-black hover:text-white cursor-pointer"
                                }`}
                        >
                            <CirclePlus className="w-4 h-4" />
                            <span className="hidden sm:inline font-semibold">Upload Resume</span>
                        </label>
                    </div>
                </header>

                <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full overflow-hidden">
                    {/* Messages Container */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.length === 0 ? (
                            <>
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="text-center text-gray-500">
                                        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                        <p className="text-lg mb-2">Upload a RESUME to get started</p>
                                    </div>
                                </div>

                            </>

                        ) : (
                            <div className="space-y-4">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex items-start space-x-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
                                    >
                                        {message.type === "bot" && (
                                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                <Bot className="w-4 h-4 text-white" />
                                            </div>
                                        )}

                                        <div
                                            className={`max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl px-4 py-2 rounded-lg ${message.type === "user"
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
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="border-t border-gray-200 bg-white p-4">
                        {!isUploading ? (
                            <>
                                <div className="flex items-center space-x-2 max-w-4xl mx-auto">
                                    <div className="flex-1 relative">
                                        <Input
                                            value={inputMessage}
                                            onChange={(e) => setInputMessage(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            disabled={!isResumeUploaded || readTimer}
                                            placeholder="Send a message..."
                                            className="pr-12 py-3 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                        <Button
                                            onClick={handleSendMessage}
                                            size="sm"
                                            disabled={!isResumeUploaded || readTimer}
                                            className="absolute right-2 cursor-pointer top-1/2 transform -translate-y-1/2 h-8 w-8"
                                        >
                                            <SendHorizontal className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>
                                {(status === 'scored' || status === 'failed') && (
                                    <div className="text-center mt-4">
                                        <Button
                                            onClick={() => {
                                                dispatch(resetQna());
                                                dispatch(resetCandidate());
                                                setIsInstructionShown(false);
                                            }}
                                            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold"
                                        >
                                            Retry Interview
                                        </Button>
                                    </div>
                                )}
                            </>

                        ) : (
                            <Loader className='mx-auto animate-spin' size={"42"} />
                        )}
                    </div>


                </div>

            </div>
        </>
    )
}
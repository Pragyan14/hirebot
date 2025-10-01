import { nanoid } from "@reduxjs/toolkit";
import toast from 'react-hot-toast';

export const createAnswerHandler = (dispatch, actions) => {
    const { addMessage, saveAnswer, nextQuestion, submitScore, addCompletedInterview } = actions;

    return async (answerText, questions, currentIndex, answers, userInfo, messages) => {
        const q = questions[currentIndex];
        if (!q) return;

        const userMessageId = nanoid();
        dispatch(addMessage({ id: userMessageId, type: 'user', content: answerText }));
        dispatch(saveAnswer({ answer: answerText }));

        const completeAnswers = [...answers, answerText];

        if (currentIndex < questions.length - 1) {
            const nextIdx = currentIndex + 1;
            dispatch(nextQuestion());
            const nextQ = questions[nextIdx];
            dispatch(addMessage({ id: nanoid(), type: 'bot', content: nextQ.question }));
        } else {
            dispatch(nextQuestion());
            const completionMsgId = nanoid();
            dispatch(addMessage({ id: completionMsgId, type: 'bot', content: 'All questions completed!' }));

            try {
                const scoreResult = await dispatch(submitScore({
                    questions,
                    answers: completeAnswers,
                })).unwrap();

                // Include all messages up to this point
                const finalChatHistory = [
                    ...messages,
                    { id: userMessageId, type: 'user', content: answerText },
                ];

                dispatch(addCompletedInterview({
                    id: nanoid(),
                    userInfo,
                    questions,
                    answers: completeAnswers,
                    scoreData: scoreResult,
                    chatHistory: finalChatHistory,
                    timestamp: Date.now(),
                }));

                dispatch(addMessage({
                    id: nanoid(),
                    type: 'bot',
                    content: `Your final score: ${scoreResult.score}, summary: ${scoreResult.summary}`
                }));

                toast.success("Interview completed successfully!");
            } catch (error) {
                console.error("score submission failed : ", error);
                dispatch(addMessage({
                    id: nanoid(),
                    type: 'bot',
                    content: 'Error calculating score.'
                }));
                toast.error("Failed to submit score");
            }
        }
    };
};
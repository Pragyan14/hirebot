import { nanoid } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

export const createAnswerHandler = (dispatch, actions) => {
    const { addMessage, saveAnswer, nextQuestion, submitScore, addCompletedInterview } = actions;

    return async (answerText, questions, currentIndex, answers, userInfo) => {
        const q = questions[currentIndex];
        if (!q) return;

        dispatch(addMessage({ id: nanoid(), type: 'user', content: answerText }));
        dispatch(saveAnswer({ answer: answerText }));
        
        const completeAnswers = [...answers, answerText];

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
                    questions,
                    answers: completeAnswers,
                })).unwrap();

                dispatch(addCompletedInterview({
                    id: nanoid(),
                    userInfo,
                    questions,
                    answers: completeAnswers,
                    scoreData: scoreResult,
                    chatHistory: [], // Will be populated from messages
                    timestamp: Date.now(),
                }));

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
};
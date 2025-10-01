import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { nanoid } from '@reduxjs/toolkit';
import {
    addMessage,
    tickReadTimer,
    tickQuestionTimer,
    startQuestionTimer
} from '../slice/qnaSlice';

export const useInterviewTimer = (handleAutoSubmit) => {
    const dispatch = useDispatch();
    const { questions, currentIndex, messages, readTimer, questionTimer, status, isQuestionTimerActive } = useSelector((state) => state.qna);

    useEffect(() => {
        if (status !== 'ready' || status === 'finished') return;
        if (currentIndex >= questions.length) return;
        
        let timer = null;

        if (readTimer > 0) {
            timer = setTimeout(() => dispatch(tickReadTimer()), 1000);
        } else if (readTimer === 0 && questionTimer === 0 && !isQuestionTimerActive) {
            dispatch(startQuestionTimer());
            const q = questions[currentIndex];
            const alreadyShown = messages.some(
                m => m.type === 'bot' && (m.content || '').includes(q.question)
            );
            if (!alreadyShown) {
                dispatch(addMessage({ id: nanoid(), type: 'bot', content: q.question }));
            }
        } else if (readTimer === 0 && questionTimer > 0 && isQuestionTimerActive) {
            timer = setTimeout(() => dispatch(tickQuestionTimer()), 1000);
        } else if (readTimer === 0 && questionTimer === 0 && isQuestionTimerActive && questions.length > 0) {
            handleAutoSubmit();
        }

        return () => clearTimeout(timer);
    }, [readTimer, questionTimer, status, currentIndex, isQuestionTimerActive, dispatch, handleAutoSubmit, questions, messages]);
};
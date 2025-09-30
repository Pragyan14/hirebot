import React from 'react';
import { useSelector } from "react-redux"
import InterviewerDashboard from "../components/InterviewerDashboard";

export default function Interviewer() {
    const { completedInterviews } = useSelector((state) => state.interviewResults);
    const { userInfo, isVerified } = useSelector((state) => state.candidate);
    const { status } = useSelector((state) => state.qna);

    const inProgress = (isVerified && status !== 'scored' && status !== 'idle') ? userInfo : null;

    return (
        <InterviewerDashboard 
            completedInterviews={completedInterviews} 
            inProgress={inProgress}
        />
    )
}
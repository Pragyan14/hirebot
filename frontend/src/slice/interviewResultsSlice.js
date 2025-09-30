import { createSlice } from "@reduxjs/toolkit";

const interviewResultsSlice = createSlice({
    name: 'interviewResults',
    initialState: {
        completedInterviews: [], // Array of completed interview sessions
    },
    reducers: {
        addCompletedInterview: (state, action) => {
            state.completedInterviews = [
                ...state.completedInterviews,
                {
                    id: action.payload.id || Date.now(),
                    ...action.payload,
                    completedAt: new Date().toISOString(),
                },
            ];

        },
        clearInterviewResults: (state) => {
            state.completedInterviews = [];
        }
    }
});

export const { addCompletedInterview, clearInterviewResults } = interviewResultsSlice.actions;
export default interviewResultsSlice.reducer;
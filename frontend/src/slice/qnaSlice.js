import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios";

export const fetchQuestions = createAsyncThunk(
    "qna.fetchQuestion",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/question/generate-question`);
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || "Error fetching questions");
        }
    }
)

export const submitScore = createAsyncThunk(
    "qna.submitScore",
    async ({ questions, answers }, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/question/getScore`, {
                questions,
                answers
            })
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || "Error submitting score");
        }
    }
)

const qnaSlice = createSlice({
    name: 'qna',
    initialState: {
        questions: [],
        currentIndex: 0,
        answers: [],
        messages: [],
        status: "idle",
        readTimer: 5,
        questionTimer: 0,
        isQuestionTimerActive: false,
        error: null,
        scoreData: null
    },
    reducers: {
        addMessage: (state, action) => {
            state.messages.push(action.payload);
        },
        startTest: (state) => {
            state.status = 'loading';
        },
        nextQuestion: (state) => {
            state.currentIndex += 1;
            if (state.currentIndex < state.questions.length) {
                state.readTimer = 5;
                state.questionTimer = 0; 
                state.isQuestionTimerActive = false;
            } else {
                state.status = "finished";
                state.readTimer = 0;
                state.questionTimer = 0;
                state.isQuestionTimerActive = false;
            }
        },
        saveAnswer: (state, action) => {
            const {answer} = action.payload;
            state.answers.push(answer);
        },
        tickReadTimer: (state) => {
            if (state.readTimer > 0) state.readTimer -= 1;
        },
        startQuestionTimer: (state) => {
            const difficulty = state.questions[state.currentIndex]?.difficulty;
            if (difficulty === "Easy") state.questionTimer = 3;
            if (difficulty === "Medium") state.questionTimer = 3;
            if (difficulty === "Hard") state.questionTimer = 3;
            state.isQuestionTimerActive = true;
        },
        tickQuestionTimer: (state) => {
            if (state.questionTimer > 0) state.questionTimer -= 1;
        },
        resetQna: (state) => {
            state.questions = [];
            state.currentIndex = 0;
            state.answers = [];
            state.messages = [];
            state.status = "idle";
            state.readTimer = 5;
            state.questionTimer = 0;
            state.isQuestionTimerActive = false;
            state.scoreData = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchQuestions.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(fetchQuestions.fulfilled, (state, action) => {
                state.status = "ready";
                state.questions = action.payload;
                state.currentIndex = 0;
                state.answers = [];
                state.readTimer = 5;
            })
            .addCase(fetchQuestions.rejected, (state, action) => {
                state.status = "idle";
                state.error = action.payload;
            })
            .addCase(submitScore.pending, (state) => {
                state.status = "submitting";
            })
            .addCase(submitScore.fulfilled, (state, action) => {
                state.scoreData = action.payload;
                state.status = "scored";
            })
            .addCase(submitScore.rejected, (state, action) => {
                state.error = action.payload;
                state.status = "failed";
            });
    }
})

export const {
    startTest,
    nextQuestion,
    saveAnswer,
    tickReadTimer,
    startQuestionTimer,
    addMessage,
    tickQuestionTimer,
    resetQna
} = qnaSlice.actions;

export default qnaSlice.reducer;
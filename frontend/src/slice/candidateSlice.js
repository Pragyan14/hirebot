import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios";

export const uploadCandidateResume = createAsyncThunk(
    "candidate/uploadResume",
    async (file, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append("resume", file);

            const res = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/pdf/parsePdf`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            return res.data.data;

        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Upload failed");
        }
    }
);

const candidateSlice = createSlice({
    name: "candidate",
    initialState: {
        isUploading: false,
        isResumeUploaded: false,
        isVerified: false,
        error: null,
        userInfo: null
    },
    reducers: {
        clearCandidateInfo: (state) => {
            state.userInfo = null;
            state.error = null;
        },
        updateCandidateInfo: (state, action) => {
            state.userInfo = {
                ...state.userInfo,
                ...action.payload
            }
            state.isVerified = true
        },
        resetCandidate: (state) => {
            state.isUploading = false,
            state.isResumeUploaded = false,
            state.isVerified = false,
            state.error = null,
            state.userInfo = null
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(uploadCandidateResume.pending, (state) => {
                state.isUploading = true;
                state.error = null;
            })
            .addCase(uploadCandidateResume.fulfilled, (state, action) => {
                state.isUploading = false;
                state.userInfo = action.payload;
                state.isResumeUploaded = true;
            })
            .addCase(uploadCandidateResume.rejected, (state, action) => {
                state.isUploading = false;
                state.error = action.payload;
            });
    },
})

export const { clearCandidateInfo, updateCandidateInfo, resetCandidate } = candidateSlice.actions;
export default candidateSlice.reducer;
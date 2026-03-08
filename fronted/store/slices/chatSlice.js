import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE = 'http://localhost:3001';

const initialState = {
    messages: [
        {
            id: 1,
            role: 'ai',
            text: 'Hello! Please upload a PDF file and ask me anything about it.',
        }
    ],
    isUploading: false,
    isAsking: false,
    uploadedFile: null,
    error: null,
};

export const uploadPdf = createAsyncThunk(
    'chat/uploadPdf',
    async (file, { getState, rejectWithValue }) => {
        try {
            const { auth } = getState();
            const token = auth.token;

            const formData = new FormData();
            formData.append('pdf', file);

            const response = await axios.post(`${API_BASE}/api/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'File upload failed');
        }
    }
);

export const askQuestion = createAsyncThunk(
    'chat/askQuestion',
    async (question, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_BASE}/ask`, { question });
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.error || 'Failed to ask question');
        }
    }
);

export const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        addMessage: (state, action) => {
            state.messages.push(action.payload);
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        // Upload PDF
        builder
            .addCase(uploadPdf.pending, (state) => {
                state.isUploading = true;
                state.error = null;
            })
            .addCase(uploadPdf.fulfilled, (state, action) => {
                state.isUploading = false;
                state.uploadedFile = action.payload.file;
                state.messages.push({
                    id: Date.now(),
                    role: 'ai',
                    text: `File successfully uploaded! (Indexing may be running in the background for large files). What would you like to know about it?`
                });
            })
            .addCase(uploadPdf.rejected, (state, action) => {
                state.isUploading = false;
                state.error = action.payload;
                state.messages.push({
                    id: Date.now(),
                    role: 'ai',
                    text: `Error uploading file: ${action.payload}`
                });
            })
            // Ask question
            .addCase(askQuestion.pending, (state) => {
                state.isAsking = true;
                state.error = null;
            })
            .addCase(askQuestion.fulfilled, (state, action) => {
                state.isAsking = false;
                state.messages.push({
                    id: Date.now(),
                    role: 'ai',
                    text: action.payload.answer
                });
            })
            .addCase(askQuestion.rejected, (state, action) => {
                state.isAsking = false;
                state.error = action.payload;
                state.messages.push({
                    id: Date.now(),
                    role: 'ai',
                    text: `Error: ${action.payload}`
                });
            });
    },
});

export const { addMessage, clearError } = chatSlice.actions;

export default chatSlice.reducer;

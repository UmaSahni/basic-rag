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
    isIndexing: false,
    uploadedFile: null,
    error: null,
};

export const checkIndexStatus = createAsyncThunk(
    'chat/checkIndexStatus',
    async (fileId, { getState, rejectWithValue }) => {
        try {
            const { auth } = getState();
            const token = auth.token;
            const response = await axios.get(`${API_BASE}/api/get/${fileId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data.file;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to check index status');
        }
    }
);

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
                state.isIndexing = true;
                state.uploadedFile = action.payload.file;
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
            // Check Index Status
            .addCase(checkIndexStatus.fulfilled, (state, action) => {
                const status = action.payload.indexingStatus;
                if (status === "completed" && state.isIndexing) {
                    state.isIndexing = false;
                    state.messages.push({
                        id: Date.now(),
                        role: 'ai',
                        text: `File successfully uploaded and indexed! What would you like to know about it?`
                    });
                } else if (status === "failed" && state.isIndexing) {
                    state.isIndexing = false;
                    state.error = "Indexing failed on the server.";
                    state.messages.push({
                        id: Date.now(),
                        role: 'ai',
                        text: `Error: Background indexing failed.`
                    });
                }
            })
            // Ask question
            .addCase(askQuestion.pending, (state) => {
                state.isAsking = true;
                state.error = null;
            })
            .addCase(askQuestion.fulfilled, (state, action) => {
                state.isAsking = false;

                // Fallback to active session variable if the AI didn't return an exact source array
                const sourceFile = action.payload.sources?.length
                    ? { filename: action.payload.sources[0] }
                    : state.uploadedFile;

                state.messages.push({
                    id: Date.now(),
                    role: 'ai',
                    text: action.payload.answer,
                    source: sourceFile
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

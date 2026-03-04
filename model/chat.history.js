import mongoose from "mongoose";

const chatHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    fileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "File",
        required: true,
    },
    question: {
        type: String,
        required: true,
    },
    answer: {
        type: String,
        required: true,
    },
    userRole: {
        type: String,
        required: true,
    },
    assistantRole: {
        type: String,
        required: true,
    },
    createdBy: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

export const ChatHistory = mongoose.model("ChatHistory", chatHistorySchema);
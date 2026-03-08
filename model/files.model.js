import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true,
    },
    path: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    indexingStatus: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending"
    }
});

export const File = mongoose.model("File", fileSchema);
import { File } from "../model/files.model.js";

export const uploadInMongoDB = async (file, userId) => {
    console.log(file, userId);
    if (!file) {
        throw new Error("No file uploaded");
    }
    if (!userId) {
        throw new Error("Unauthorized");
    }
    try {
        const newFile = await File.create({ filename: file.filename, path: file.path, userId: userId });
        return newFile;
    } catch (error) {
        console.error("Error uploading file to MongoDB:", error);
        throw error;
    }
};

export const getFileFromMongoDB = async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }
        res.status(200).json({ file });
    } catch (error) {
        console.error("Error getting file from MongoDB:", error);
        res.status(500).json({ message: "Error getting file", error: error.message });
    }
};

export const deleteFileFromMongoDB = async (req, res) => {
    try {
        const deletedFile = await File.findByIdAndDelete(req.params.id);
        if (!deletedFile) {
            return res.status(404).json({ message: "File not found" });
        }
        res.status(200).json({ message: "File deleted successfully" });
    } catch (error) {
        console.error("Error deleting file from MongoDB:", error);
        res.status(500).json({ message: "Error deleting file", error: error.message });
    }
};